import Anthropic from "@anthropic-ai/sdk";
import { NextRequest } from "next/server";

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

export async function POST(req: NextRequest) {
  const { messages, context } = await req.json();

  const systemPrompt = `You are an expert resume builder AI assistant. Help users tailor their resume for a specific job.

${context?.resume ? `## Current Resume\n${context.resume}\n` : ""}
${context?.jobDescription ? `## Target Job Description\n${context.jobDescription}\n` : ""}

## CRITICAL INSTRUCTIONS
- Be concise, professional, and actionable
- Match keywords from the job posting naturally
- Quantify achievements where possible

## IMPORTANT: Making Resume Changes
When the user asks you to rewrite, improve, update, or change ANY part of their resume, you MUST output a JSON block that applies the changes directly. Do NOT just suggest changes in text — actually apply them.

ALWAYS include this JSON block when making changes:

\`\`\`json
{"resumeUpdate": {"changes": [{"section": "summary", "value": "New summary text here"}]}}
\`\`\`

Supported change types:
- {"section": "summary", "value": "new summary string"}
- {"section": "skills", "value": ["skill1", "skill2", "skill3"]}
- {"section": "experience", "id": "exp-1", "field": "bullets", "value": ["bullet 1", "bullet 2"]}
- {"section": "experience", "id": "exp-1", "field": "title", "value": "New Title"}
- {"section": "contact", "field": "name", "value": "New Name"}
- {"section": "education", "id": "edu-1", "field": "degree", "value": "New Degree"}

Use the exact IDs from the resume data (e.g. "exp-1", "exp-2", "edu-1").

For design/style changes (font, color, spacing, etc.), use:
- {"section": "styles", "value": {"fontFamily": "Georgia", "fontSize": 11, "headingColor": "#1a365d", "textColor": "#1c1917", "accentColor": "#1a365d", "lineHeight": 1.5, "sectionSpacing": 20, "borderStyle": "solid"}}

Available style properties:
- fontFamily: any web-safe font (Inter, Georgia, Garamond, Helvetica, Times New Roman, Merriweather, Lato, Roboto, etc.)
- fontSize: base font size in px (10-14 recommended)
- headingColor: hex color for section headings and name
- textColor: hex color for body text
- accentColor: hex color for skill pills and accents
- lineHeight: line spacing (1.2 to 1.8)
- sectionSpacing: gap between sections in px (12-28)
- borderStyle: "solid", "double", or "none" for section dividers

You can change one or multiple style properties at once. Only include the properties being changed.

After the JSON block, briefly explain what you changed and why. Keep explanations short (2-3 sentences max).

## Match Analysis
When the user pastes a job description, ALWAYS include a match analysis:

\`\`\`json
{"matchAnalysis": {"score": 82, "company": "Google", "matches": ["React", "TypeScript"], "gaps": ["GraphQL", "AWS"]}}
\`\`\`

- score: 0-100 match percentage
- company: company name from the job description
- matches: skills/qualifications that align
- gaps: important requirements missing

After making resume changes for a job, include an updated matchAnalysis showing the improved score.

## Cover Letter
When the user asks for a cover letter, generate one and include it as a change:

\`\`\`json
{"resumeUpdate": {"changes": [{"section": "coverLetter", "value": {"greeting": "Dear Hiring Manager,", "paragraphs": ["First paragraph...", "Second paragraph...", "Third paragraph..."], "closing": "Sincerely,", "signature": "Alex Chen"}}]}}
\`\`\`

Use the resume contact name for the signature. Tailor the cover letter to the job description if available. Keep it to 3-4 paragraphs. Make it compelling and specific, not generic.
You can also update individual cover letter fields the same way.`;

  const anthropicMessages = messages.map((m: { role: string; content: string }) => ({
    role: m.role as "user" | "assistant",
    content: m.content,
  }));

  const stream = await client.messages.stream({
    model: "claude-3-haiku-20240307",
    max_tokens: 2048,
    system: systemPrompt,
    messages: anthropicMessages,
  });

  const encoder = new TextEncoder();
  const readable = new ReadableStream({
    async start(controller) {
      for await (const event of stream) {
        if (
          event.type === "content_block_delta" &&
          event.delta.type === "text_delta"
        ) {
          controller.enqueue(
            encoder.encode(
              `data: ${JSON.stringify({ text: event.delta.text })}\n\n`
            )
          );
        }
      }
      controller.enqueue(encoder.encode("data: [DONE]\n\n"));
      controller.close();
    },
  });

  return new Response(readable, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    },
  });
}
