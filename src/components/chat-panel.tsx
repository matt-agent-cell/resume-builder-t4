"use client";

import { useState, useRef, useEffect } from "react";
import { useResume } from "@/context/resume-context";
import { Send, ThumbsUp, ThumbsDown, Copy, CheckCircle2, ImagePlus } from "lucide-react";
import { InlineDesignWidget, parseDesignWidgets } from "./inline-design-controls";

function stripJsonBlocks(text: string): { cleaned: string; hadChanges: boolean } {
  if (!text) return { cleaned: text, hadChanges: false };
  const noJson = text.replace(/```json\s*\{[\s\S]*?\}\s*```/g, "").trim();
  const hadChanges = text !== noJson && (text.includes('"resumeUpdate"') || text.includes('"coverLetter"'));
  // Keep {{design:xxx}} tags — they'll be parsed by parseDesignWidgets
  const cleaned = noJson;
  return { cleaned, hadChanges };
}

// Extract follow-up suggestions from AI response
function extractSuggestions(text: string): string[] {
  // Look for lines that seem like suggestions (short, action-oriented)
  const lines = text.split("\n").filter(Boolean);
  const suggestions: string[] = [];
  
  // Check for bullet-point style suggestions at the end
  let foundSuggestionBlock = false;
  for (const line of lines) {
    if (/follow.?up|try asking|you could|suggestions?:|next steps?:/i.test(line)) {
      foundSuggestionBlock = true;
      continue;
    }
    if (foundSuggestionBlock && /^[•\-\*]\s/.test(line)) {
      const clean = line.replace(/^[•\-\*]\s+/, "").replace(/\*\*/g, "").trim();
      if (clean.length > 5 && clean.length < 80) suggestions.push(clean);
    }
  }
  return suggestions.slice(0, 3);
}

// Generate contextual follow-up prompts based on the conversation
function getFollowUpPrompts(lastAssistantMsg: string, hadChanges: boolean): string[] {
  if (hadChanges) {
    return [
      "Now improve my bullet points",
      "Tailor this to a specific job",
      "What skills should I add?",
    ];
  }
  if (/summary/i.test(lastAssistantMsg)) {
    return [
      "Make it more concise",
      "Add more metrics and impact",
      "Tailor it for a startup",
    ];
  }
  if (/bullet|experience/i.test(lastAssistantMsg)) {
    return [
      "Add more quantifiable results",
      "Use stronger action verbs",
      "Rewrite my summary next",
    ];
  }
  if (/gap|missing|keyword/i.test(lastAssistantMsg)) {
    return [
      "Add the missing skills to my resume",
      "Rewrite bullets to include keywords",
      "Write me a cover letter",
    ];
  }
  if (/cover letter/i.test(lastAssistantMsg)) {
    return [
      "Make it more conversational",
      "Add more specific examples",
      "Shorten it to 2 paragraphs",
    ];
  }
  return [];
}

export default function ChatPanel() {
  const { messages, addMessages, updateLastAssistantMessage, applyResumeChanges, resume, updateResume, jobDescription, setJobDescription, setMatchAnalysis } = useResume();
  const [input, setInput] = useState("");
  const [streaming, setStreaming] = useState(false);
  const [toast, setToast] = useState("");
  const [feedback, setFeedback] = useState<Record<number, "up" | "down">>({});
  const bottomRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = Math.min(textareaRef.current.scrollHeight, 200) + "px";
    }
  }, [input]);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(""), 2500);
  };

  const copyText = (text: string) => {
    navigator.clipboard.writeText(text);
    showToast("Copied to clipboard");
  };

  const send = () => {
    if (!input.trim() || streaming) return;
    const text = input.trim();
    setInput("");
    if (textareaRef.current) textareaRef.current.style.height = "auto";
    sendMessage(text);
  };

  const sendMessage = async (directText: string) => {
    const text = directText.trim();
    if (!text || streaming) return;
    if (textareaRef.current) textareaRef.current.style.height = "auto";
    addMessages([{ role: "user", content: text }, { role: "assistant", content: "" }]);
    setStreaming(true);

    try {
      const allMsgs = [...messages, { role: "user" as const, content: text }];
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: allMsgs.map((m) => ({ role: m.role, content: m.content })),
          context: { resume: JSON.stringify(resume), jobDescription },
        }),
      });

      const reader = res.body?.getReader();
      if (!reader) return;
      const decoder = new TextDecoder();
      let fullText = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value, { stream: true });
        for (const line of chunk.split("\n")) {
          if (line.startsWith("data: ") && line !== "data: [DONE]") {
            try {
              const d = JSON.parse(line.slice(6));
              if (d.text) {
                fullText += d.text;
                updateLastAssistantMessage(fullText);
              }
            } catch { /* skip */ }
          }
        }
      }

      const jsonBlocks = fullText.matchAll(/```json\s*(\{[\s\S]*?\})\s*```/g);
      for (const match of jsonBlocks) {
        try {
          const parsed = JSON.parse(match[1]);
          if (parsed.resumeUpdate?.changes) {
            applyResumeChanges(parsed.resumeUpdate.changes);
            showToast("✓ Resume updated");
          }
          if (parsed.matchAnalysis) {
            setMatchAnalysis(parsed.matchAnalysis);
          }
        } catch { /* skip */ }
      }

      if (text.length > 200 && /\b(responsibilities|requirements|qualifications|experience|skills|about the role|we are looking)\b/i.test(text)) {
        setJobDescription(text);
      }
    } catch {
      updateLastAssistantMessage("Sorry, something went wrong. Please try again.");
    } finally {
      setStreaming(false);
    }
  };

  // Shared input box
  const renderInput = (placeholder = "Ask anything") => (
    <div className="relative bg-stone-50 rounded-2xl border border-stone-200 focus-within:border-stone-300 transition-colors">
      <textarea
        ref={textareaRef}
        className="w-full bg-transparent px-4 pt-3 pb-10 text-sm resize-none outline-none placeholder:text-stone-400 rounded-2xl"
        rows={1}
        placeholder={placeholder}
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(); } }}
      />
      <div className="absolute bottom-2 right-2 flex items-center gap-1">
        <label className="w-8 h-8 rounded-full text-stone-400 flex items-center justify-center hover:text-stone-600 hover:bg-stone-100 transition-colors cursor-pointer" title="Add photo to resume">
          <ImagePlus className="w-4 h-4" />
          <input type="file" accept="image/*" className="hidden" onChange={(e) => {
            const file = e.target.files?.[0];
            if (!file) return;
            const reader = new FileReader();
            reader.onload = () => {
              updateResume((r) => ({
                ...r,
                contact: { ...r.contact, photo: reader.result as string },
                styles: { ...(r.styles || {}), showPhoto: true },
              }));
            };
            reader.readAsDataURL(file);
            e.target.value = "";
          }} />
        </label>
        <button
          onClick={send}
          disabled={!input.trim() || streaming}
          className="w-8 h-8 rounded-full bg-stone-800 text-white flex items-center justify-center hover:bg-stone-700 transition-colors disabled:opacity-30 disabled:hover:bg-stone-800"
        >
          <Send className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );

  return (
    <div className="flex flex-col h-full bg-white">
      {/* Messages */}
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-2xl mx-auto px-4 py-6">
          {messages.length === 0 && (
            <div className="flex flex-col items-center justify-center min-h-[60vh]">
              <h1 className="text-2xl font-semibold text-stone-800 mb-6">Let&apos;s Build Your Resume</h1>
              <div className="w-full mb-4">
                {renderInput("Tell me about the job you're applying for")}
              </div>
              <div className="flex flex-wrap justify-center gap-2">
                {[
                  { label: "Rewrite my summary", msg: "Can you rewrite my professional summary to be more compelling and impactful?" },
                  { label: "Improve bullets", msg: "Can you improve my experience bullet points? Make them more results-driven with stronger action verbs and metrics." },
                  { label: "Find gaps", msg: "Analyze my resume and identify any gaps — missing skills, weak areas, or keywords I should add." },
                  { label: "Write a cover letter", msg: "Write me a compelling cover letter based on my resume." },
                ].map((s) => (
                  <button
                    key={s.label}
                    onClick={() => sendMessage(s.msg)}
                    className="px-4 py-2 rounded-full border border-stone-200 text-sm text-stone-600 hover:bg-stone-50 hover:border-stone-300 transition-colors"
                  >
                    {s.label}
                  </button>
                ))}
              </div>
            </div>
          )}
          <div className="space-y-6">
            {messages.map((msg, i) => {
              const isLast = i === messages.length - 1;
              const isLastAssistant = msg.role === "assistant" && isLast && !streaming;

              if (msg.role === "user") {
                return (
                  <div key={i} className="animate-fade-in">
                    <div className="flex justify-end">
                      <div className="max-w-[85%] bg-stone-100 rounded-2xl rounded-br-md px-4 py-3 text-sm text-stone-800 whitespace-pre-wrap">
                        {msg.content}
                      </div>
                    </div>
                  </div>
                );
              }

              const { cleaned, hadChanges } = stripJsonBlocks(msg.content);
              const followUps = isLastAssistant ? getFollowUpPrompts(cleaned, hadChanges) : [];

              const { parts } = parseDesignWidgets(cleaned);
              const hasWidgets = parts.some((p) => p.type === "widget");

              return (
                <div key={i} className="animate-fade-in">
                  <div className="text-sm text-stone-700 leading-relaxed">
                    {!cleaned && streaming && isLast ? (
                      <span className="flex items-center gap-1.5 py-2">
                        <span className="w-2 h-2 bg-stone-300 rounded-full typing-dot" />
                        <span className="w-2 h-2 bg-stone-300 rounded-full typing-dot" />
                        <span className="w-2 h-2 bg-stone-300 rounded-full typing-dot" />
                      </span>
                    ) : hasWidgets ? (
                      parts.map((part, pi) =>
                        part.type === "widget" ? (
                          <InlineDesignWidget key={pi} widgetId={part.content} />
                        ) : (
                          <span key={pi} className="whitespace-pre-wrap">{part.content}</span>
                        )
                      )
                    ) : (
                      <span className="whitespace-pre-wrap">{cleaned}</span>
                    )}
                  </div>

                  {/* Changes applied badge */}
                  {hadChanges && (
                    <div className="mt-3">
                      <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#DBF0EA] text-[#005149] text-xs font-medium">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        Changes applied to resume
                      </span>
                    </div>
                  )}

                  {/* Follow-up suggestion pills */}
                  {followUps.length > 0 && (
                    <div className="mt-3 space-y-2">
                      {followUps.map((f, fi) => (
                        <button
                          key={fi}
                          onClick={() => sendMessage(f)}
                          className="block w-full text-left px-4 py-2.5 rounded-xl border border-stone-200 text-sm text-[#005149] hover:bg-[#005149]/5 hover:border-[#005149]/20 transition-colors"
                        >
                          {f}
                        </button>
                      ))}
                    </div>
                  )}

                  {/* Message actions */}
                  {msg.content && !streaming && (
                    <div className="flex items-center gap-1 mt-2">
                      <button
                        onClick={() => copyText(msg.content)}
                        className="p-1.5 rounded-md text-stone-300 hover:text-stone-500 hover:bg-stone-100 transition-colors"
                        title="Copy"
                      >
                        <Copy className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => setFeedback((f) => ({ ...f, [i]: "up" }))}
                        className={`p-1.5 rounded-md transition-colors ${feedback[i] === "up" ? "text-[#005149] bg-[#005149]/5" : "text-stone-300 hover:text-stone-500 hover:bg-stone-100"}`}
                        title="Good response"
                      >
                        <ThumbsUp className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => setFeedback((f) => ({ ...f, [i]: "down" }))}
                        className={`p-1.5 rounded-md transition-colors ${feedback[i] === "down" ? "text-red-400 bg-red-50" : "text-stone-300 hover:text-stone-500 hover:bg-stone-100"}`}
                        title="Bad response"
                      >
                        <ThumbsDown className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
          <div ref={bottomRef} />
        </div>
      </div>

      {/* Bottom input — only show when conversation has started */}
      {messages.length > 0 && (
        <div className="shrink-0 px-4 pb-4">
          <div className="max-w-2xl mx-auto">
            {renderInput("Ask anything")}
            <p className="text-center text-[11px] text-stone-300 mt-2">AI can make mistakes. Review resume changes carefully.</p>
          </div>
        </div>
      )}

      {/* Toast */}
      {toast && (
        <div className="fixed bottom-20 left-1/2 -translate-x-1/2 z-50 toast-enter">
          <div className="bg-stone-800 text-white text-sm px-4 py-2 rounded-lg shadow-lg">{toast}</div>
        </div>
      )}
    </div>
  );
}
