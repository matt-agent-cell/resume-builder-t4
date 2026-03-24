"use client";

import { useState, useRef, useEffect } from "react";
import { useResume } from "@/context/resume-context";
import type { ChangeDiff } from "@/context/resume-context";
import { Send, ThumbsUp, ThumbsDown, Copy, CheckCircle2, ImagePlus, ChevronDown, ChevronUp, Pencil, Check } from "lucide-react";
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

/* ── Word-level diff highlighting ── */
function diffWords(before: string, after: string): { removed: string[]; added: string[] } {
  const oldWords = before.split(/(\s+)/);
  const newWords = after.split(/(\s+)/);
  const oldSet = new Set(oldWords.filter(w => w.trim()));
  const newSet = new Set(newWords.filter(w => w.trim()));
  // Simple approach: words only in old = removed, words only in new = added
  return {
    removed: oldWords.filter(w => w.trim() && !newSet.has(w)),
    added: newWords.filter(w => w.trim() && !oldSet.has(w)),
  };
}

function HighlightedText({ text, highlights, mode }: { text: string; highlights: Set<string>; mode: "removed" | "added" }) {
  const words = text.split(/(\s+)/);
  const bgClass = mode === "removed" ? "bg-red-100 text-red-600 rounded px-0.5" : "bg-emerald-100 text-emerald-700 rounded px-0.5";
  return (
    <span>
      {words.map((w, i) => {
        if (!w.trim()) return <span key={i}>{w}</span>;
        const isHighlighted = highlights.has(w);
        return <span key={i} className={isHighlighted ? bgClass : ""}>{w}</span>;
      })}
    </span>
  );
}

/* ── Editable Diff Card ── */
function EditableDiffItem({ diff, onSave }: { diff: ChangeDiff; onSave: (newText: string) => void }) {
  const [editing, setEditing] = useState(false);
  const [editText, setEditText] = useState(diff.after);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const { removed, added } = diffWords(diff.before, diff.after);
  const removedSet = new Set(removed);
  const addedSet = new Set(added);

  const cardRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (editing && textareaRef.current) {
      textareaRef.current.focus();
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = textareaRef.current.scrollHeight + "px";
      // Scroll card into view after keyboard opens
      setTimeout(() => {
        cardRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
      }, 300);
    }
  }, [editing]);

  const handleSave = () => {
    const trimmed = editText.trim();
    if (trimmed && trimmed !== diff.after) {
      onSave(trimmed);
    }
    setEditing(false);
  };

  return (
    <div ref={cardRef} className="rounded-xl border border-stone-200 overflow-hidden bg-white shadow-sm">
      <div className="px-3.5 py-2 bg-gradient-to-r from-stone-50 to-white border-b border-stone-100 flex items-center gap-2">
        <div className="w-1.5 h-1.5 rounded-full bg-[#005149]" />
        <span className="text-xs font-semibold text-stone-600 tracking-wide flex-1">{diff.label}</span>
        {!editing && (
          <button onClick={() => setEditing(true)} className="p-1 rounded-md text-stone-400 hover:text-[#005149] hover:bg-stone-100 transition-colors">
            <Pencil className="w-3 h-3" />
          </button>
        )}
      </div>
      <div className="px-3.5 py-3 space-y-0">
        {/* Before */}
        <div className="relative pl-3 py-2 border-l-2 border-red-200 bg-red-50/40 rounded-r-lg mb-2">
          <span className="absolute -left-1.5 top-2.5 w-2.5 h-2.5 rounded-full bg-red-200 border-2 border-white" />
          <div className="text-[13px] text-red-400 whitespace-pre-wrap leading-relaxed line-through decoration-red-300/60">
            <HighlightedText text={diff.before} highlights={removedSet} mode="removed" />
          </div>
        </div>
        {/* Arrow */}
        <div className="flex items-center gap-1.5 py-0.5 pl-2">
          <svg width="12" height="12" viewBox="0 0 12 12" className="text-[#005149]"><path d="M6 2v8m0 0l3-3m-3 3L3 7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" fill="none"/></svg>
        </div>
        {/* After — editable */}
        {editing ? (
          <div className="relative pl-3 py-2 border-l-2 border-[#005149] bg-[#DBF0EA]/30 rounded-r-lg mt-1">
            <span className="absolute -left-1.5 top-2.5 w-2.5 h-2.5 rounded-full bg-[#005149] border-2 border-white" />
            <textarea
              ref={textareaRef}
              value={editText}
              onChange={(e) => {
                setEditText(e.target.value);
                e.target.style.height = "auto";
                e.target.style.height = e.target.scrollHeight + "px";
              }}
              onKeyDown={(e) => { if (e.key === "Enter" && e.metaKey) handleSave(); }}
              className="w-full text-[16px] md:text-[13px] text-stone-800 leading-relaxed bg-transparent outline-none resize-none"
            />
            <div className="flex items-center justify-end gap-2 mt-2">
              <button onClick={() => { setEditText(diff.after); setEditing(false); }}
                className="text-xs text-stone-400 hover:text-stone-600 px-2 py-1">Cancel</button>
              <button onClick={handleSave}
                className="flex items-center gap-1 text-xs font-medium text-white bg-[#005149] hover:bg-[#003d38] px-3 py-1.5 rounded-lg transition-colors">
                <Check className="w-3 h-3" /> Save
              </button>
            </div>
          </div>
        ) : (
          <div
            onClick={() => setEditing(true)}
            className="relative pl-3 py-2 border-l-2 border-emerald-300 bg-emerald-50/40 rounded-r-lg mt-1 cursor-pointer hover:bg-emerald-50/70 transition-colors group"
          >
            <span className="absolute -left-1.5 top-2.5 w-2.5 h-2.5 rounded-full bg-emerald-400 border-2 border-white" />
            <div className="text-[13px] text-stone-800 whitespace-pre-wrap leading-relaxed">
              <HighlightedText text={diff.after} highlights={addedSet} mode="added" />
            </div>
            <span className="absolute top-2 right-2 text-[10px] text-stone-400 opacity-0 group-hover:opacity-100 md:block hidden transition-opacity">tap to edit</span>
          </div>
        )}
      </div>
    </div>
  );
}

function DiffCard({ diffs, onUpdateDiff }: { diffs: ChangeDiff[]; onUpdateDiff: (index: number, newText: string) => void }) {
  const [expanded, setExpanded] = useState(false);
  const shown = expanded ? diffs : diffs.slice(0, 2);
  return (
    <div className="mt-3 space-y-2.5">
      {shown.map((d, i) => (
        <EditableDiffItem key={i} diff={d} onSave={(newText) => onUpdateDiff(i, newText)} />
      ))}
      {diffs.length > 2 && (
        <button onClick={() => setExpanded(!expanded)}
          className="flex items-center gap-1 text-xs text-[#005149] font-medium hover:underline">
          {expanded ? <><ChevronUp className="w-3 h-3" /> Show less</> : <><ChevronDown className="w-3 h-3" /> {diffs.length - 2} more change{diffs.length - 2 > 1 ? "s" : ""}</>}
        </button>
      )}
    </div>
  );
}

export default function ChatPanel({ onViewResume }: { onViewResume?: () => void } = {}) {
  const { messages, addMessages, updateLastAssistantMessage, applyResumeChanges, resume, updateResume, jobDescription, setJobDescription, setMatchAnalysis } = useResume();
  const [input, setInput] = useState("");
  const [streaming, setStreaming] = useState(false);
  const [toast, setToast] = useState("");
  const [feedback, setFeedback] = useState<Record<number, "up" | "down">>({});
  const [messageDiffs, setMessageDiffs] = useState<Record<number, ChangeDiff[]>>({});
  const bottomRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Handle inline edits from diff cards
  const handleDiffEdit = (msgIdx: number, diffIdx: number, newText: string) => {
    const diff = messageDiffs[msgIdx]?.[diffIdx];
    if (!diff) return;

    // Parse the new text back into the right format and update resume
    if (diff.section === "summary") {
      updateResume((r) => ({ ...r, summary: newText }));
    } else if (diff.section === "skills") {
      updateResume((r) => ({ ...r, skills: newText.split(",").map(s => s.trim()).filter(Boolean) }));
    } else if (diff.section === "experience" && diff.id && diff.isBullets) {
      const bullets = newText.split("\n").map(b => b.replace(/^[•\-›]\s*/, "").trim()).filter(Boolean);
      updateResume((r) => ({ ...r, experience: r.experience.map(e => e.id === diff.id ? { ...e, bullets } : e) }));
    } else if (diff.section === "experience" && diff.id && diff.field) {
      updateResume((r) => ({ ...r, experience: r.experience.map(e => e.id === diff.id ? { ...e, [diff.field!]: newText } : e) }));
    } else if (diff.section === "education" && diff.id && diff.field) {
      updateResume((r) => ({ ...r, education: r.education.map(e => e.id === diff.id ? { ...e, [diff.field!]: newText } : e) }));
    } else if (diff.section === "contact" && diff.field) {
      updateResume((r) => ({ ...r, contact: { ...r.contact, [diff.field!]: newText } }));
    }

    // Update the diff card's "after" text
    setMessageDiffs((prev) => {
      const updated = { ...prev };
      if (updated[msgIdx]) {
        updated[msgIdx] = updated[msgIdx].map((d, di) => di === diffIdx ? { ...d, after: newText } : d);
      }
      return updated;
    });

    showToast("✓ Resume updated");
  };

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
      const allDiffs: ChangeDiff[] = [];
      for (const match of jsonBlocks) {
        try {
          const parsed = JSON.parse(match[1]);
          if (parsed.resumeUpdate?.changes) {
            const d = applyResumeChanges(parsed.resumeUpdate.changes);
            allDiffs.push(...d);
            showToast("✓ Resume updated");
          }
          if (parsed.matchAnalysis) {
            setMatchAnalysis(parsed.matchAnalysis);
          }
        } catch { /* skip */ }
      }
      // Store diffs for the assistant message (last message index)
      if (allDiffs.length > 0) {
        const msgIdx = messages.length + 1; // +1 for user msg, assistant is at +1
        setMessageDiffs((prev) => ({ ...prev, [msgIdx]: allDiffs }));
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
        className="w-full bg-transparent px-4 pt-3 pb-10 text-[16px] md:text-sm resize-none outline-none placeholder:text-stone-400 rounded-2xl"
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
            <div className="flex flex-col items-center justify-center" style={{ minHeight: "60dvh" }}>
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

                  {/* Changes applied — diff cards or simple badge */}
                  {hadChanges && (
                    <>
                      {messageDiffs[i] && messageDiffs[i].length > 0 ? (
                        <>
                          <DiffCard diffs={messageDiffs[i]} onUpdateDiff={(di, text) => handleDiffEdit(i, di, text)} />
                          <div className="mt-2 flex items-center gap-2 flex-wrap">
                            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#DBF0EA] text-[#005149] text-xs font-medium">
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              {messageDiffs[i].length} change{messageDiffs[i].length > 1 ? "s" : ""} applied
                            </span>
                            {onViewResume && (
                              <button onClick={onViewResume}
                                className="md:hidden inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#005149] text-white text-xs font-medium hover:bg-[#003d38] transition-colors">
                                View resume →
                              </button>
                            )}
                          </div>
                        </>
                      ) : (
                        <div className="mt-3 flex items-center gap-2 flex-wrap">
                          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#DBF0EA] text-[#005149] text-xs font-medium">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            Changes applied to resume
                          </span>
                          {onViewResume && (
                            <button onClick={onViewResume}
                              className="md:hidden inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#005149] text-white text-xs font-medium hover:bg-[#003d38] transition-colors">
                              View resume →
                            </button>
                          )}
                        </div>
                      )}
                    </>
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
          <div ref={bottomRef} className="h-4" />
        </div>
      </div>

      {/* Bottom input — only show when conversation has started */}
      {messages.length > 0 && (
        <div className="shrink-0 px-4 pb-3 safe-area-bottom">
          <div className="max-w-2xl mx-auto">
            {renderInput("Ask anything")}
            <p className="text-center text-[11px] text-stone-300 mt-1.5 hidden md:block">AI can make mistakes. Review resume changes carefully.</p>
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
