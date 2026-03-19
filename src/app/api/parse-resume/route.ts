import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

const PARSE_PROMPT = `Parse this resume into structured JSON. Return ONLY valid JSON with no markdown fences or extra text.

The JSON must have this exact structure:
{
  "contact": { "name": "", "email": "", "phone": "", "location": "", "linkedin": "" },
  "summary": "",
  "experience": [{ "id": "exp-1", "title": "", "company": "", "location": "", "dateRange": "", "bullets": [""] }],
  "education": [{ "id": "edu-1", "degree": "", "school": "", "dateRange": "", "gpa": "" }],
  "skills": [""]
}

Rules:
- Extract ALL experience entries with their bullet points
- Extract ALL education entries
- Skills should be individual items (split comma-separated lists)
- Use empty string "" for missing fields, never null or undefined
- IDs should be exp-1, exp-2, etc. and edu-1, edu-2, etc.
- Keep bullet points as-is from the resume
- If there's no summary/profile section, set summary to ""`;

async function parseWithClaude(content: Anthropic.MessageParam["content"]) {
  const response = await client.messages.create({
    model: "claude-sonnet-4-20250514",
    max_tokens: 4096,
    messages: [{ role: "user", content }],
  });

  const block = response.content[0];
  if (block.type !== "text") throw new Error("Unexpected response format");

  let jsonStr = block.text.trim();
  jsonStr = jsonStr.replace(/^```(?:json)?\s*\n?/, "").replace(/\n?```\s*$/, "");
  return JSON.parse(jsonStr);
}

export async function POST(req: NextRequest) {
  try {
    const contentType = req.headers.get("content-type") || "";

    // JSON body: text paste or LinkedIn URL
    if (contentType.includes("application/json")) {
      const body = await req.json();

      if (body.text) {
        const parsed = await parseWithClaude([
          { type: "text", text: `${PARSE_PROMPT}\n\nResume text:\n${body.text}` },
        ]);
        return NextResponse.json(parsed);
      }

      if (body.linkedinUrl) {
        // Try to fetch LinkedIn page (will likely get limited data but worth trying)
        let profileText = "";
        try {
          const res = await fetch(body.linkedinUrl, {
            headers: { "User-Agent": "Mozilla/5.0 (compatible; bot)" },
          });
          const html = await res.text();
          // Extract visible text from meta tags and structured data
          const titleMatch = html.match(/<title>([^<]+)<\/title>/i);
          const descMatch = html.match(/<meta[^>]+name="description"[^>]+content="([^"]+)"/i);
          profileText = [titleMatch?.[1], descMatch?.[1]].filter(Boolean).join("\n\n");
        } catch { /* ignore fetch errors */ }

        if (!profileText) {
          return NextResponse.json(
            { error: "Couldn't access LinkedIn profile. Try pasting your resume text instead." },
            { status: 400 }
          );
        }

        const parsed = await parseWithClaude([
          { type: "text", text: `${PARSE_PROMPT}\n\nLinkedIn profile info:\n${profileText}` },
        ]);
        return NextResponse.json(parsed);
      }

      return NextResponse.json({ error: "No input provided" }, { status: 400 });
    }

    // FormData: PDF upload
    const formData = await req.formData();
    const file = formData.get("file") as File;
    if (!file) return NextResponse.json({ error: "No file" }, { status: 400 });

    const buffer = Buffer.from(await file.arrayBuffer());
    const base64 = buffer.toString("base64");

    const parsed = await parseWithClaude([
      {
        type: "document",
        source: { type: "base64", media_type: "application/pdf", data: base64 },
      },
      { type: "text", text: PARSE_PROMPT },
    ]);

    return NextResponse.json(parsed);
  } catch (e) {
    console.error("Parse error:", e);
    return NextResponse.json(
      { error: "Failed to parse resume. Please try again." },
      { status: 500 }
    );
  }
}
