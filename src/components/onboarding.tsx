"use client";

import { useState, useRef } from "react";
import { useResume, type ResumeData, type Step } from "@/context/resume-context";
import { Upload, FileText, Loader2, ArrowLeft } from "lucide-react";

const EXAMPLE_DATA: ResumeData = {
  contact: { name: "Alex Chen", email: "alex.chen@email.com", phone: "(555) 234-5678", location: "San Francisco, CA", linkedin: "linkedin.com/in/alexchen" },
  summary: "Senior Product Designer with 8 years of experience building user-centered digital products for SaaS platforms. Skilled in design systems, prototyping, user research, and cross-functional collaboration. Passionate about turning complex problems into simple, elegant solutions.",
  experience: [
    { id: "exp-1", title: "Senior Product Designer", company: "Stripe", location: "San Francisco, CA", dateRange: "2022 - Present", bullets: [
      "Led redesign of the merchant onboarding flow, reducing drop-off by 34% and increasing activation rate",
      "Built and maintained a component library used by 12 product teams across the organization",
      "Conducted 40+ user research sessions to validate new payment features for international markets",
      "Mentored 3 junior designers and established design critique process for the team",
    ]},
    { id: "exp-2", title: "Product Designer", company: "Figma", location: "San Francisco, CA", dateRange: "2019 - 2022", bullets: [
      "Designed collaborative editing features used by 4M+ users, including real-time cursors and comments",
      "Led the design of FigJam's initial launch, contributing to a product used by 500K+ teams",
      "Reduced support tickets by 28% by redesigning the file organization and sharing system",
    ]},
    { id: "exp-3", title: "UX Designer", company: "Dropbox", location: "San Francisco, CA", dateRange: "2016 - 2019", bullets: [
      "Redesigned the mobile upload experience, increasing mobile engagement by 22%",
      "Created design system documentation adopted across 8 product teams",
      "Partnered with engineering to implement accessibility improvements across core features",
    ]},
  ],
  education: [
    { id: "edu-1", degree: "B.S. Human-Computer Interaction", school: "Carnegie Mellon University", dateRange: "2012 - 2016" },
  ],
  skills: ["Figma", "Design Systems", "Prototyping", "User Research", "Usability Testing", "HTML/CSS", "React Basics", "Accessibility", "Information Architecture", "Workshop Facilitation"],
};

const STEPS: Step[] = ["welcome", "upload"];

function ProgressDots({ current }: { current: Step }) {
  const idx = STEPS.indexOf(current);
  return (
    <div className="flex items-center justify-center gap-2 py-6">
      {STEPS.map((s, i) => (
        <div key={s} className={`w-2 h-2 rounded-full transition-all duration-300 ${i <= idx ? "bg-[#005149] scale-110" : "bg-stone-200"}`} />
      ))}
    </div>
  );
}

export default function Onboarding() {
  const ctx = useResume();
  return (
    <div className="min-h-screen bg-gradient-to-b from-stone-50 to-white">
      <ProgressDots current={ctx.step} />
      <div className="animate-fade-in">
        {ctx.step === "welcome" && <Welcome />}
        {ctx.step === "upload" && <UploadStep />}
      </div>
    </div>
  );
}

function Welcome() {
  const { setStep } = useResume();
  return (
    <div className="flex items-center justify-center min-h-[80vh]">
      <div className="text-center max-w-lg px-6">
        <div className="w-20 h-20 rounded-2xl bg-[#005149] flex items-center justify-center mx-auto mb-8 shadow-lg">
          <FileText className="w-10 h-10 text-white" />
        </div>
        <h1 className="text-2xl md:text-4xl font-bold text-[#005149] mb-4 tracking-tight">Build a resume that gets interviews</h1>
        <p className="text-stone-400 text-lg mb-10 leading-relaxed">Upload your resume, then use AI chat to tailor it for any job.</p>
        <button onClick={() => setStep("upload")} className="bg-[#005149] text-white px-8 py-3.5 rounded-xl text-base font-medium hover:bg-[#003d38] transition-all hover:shadow-lg">
          Get started
        </button>
      </div>
    </div>
  );
}

function UploadStep() {
  const { setStep, setVault, createSession } = useResume();
  const [loading, setLoading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [error, setError] = useState("");
  const [mode, setMode] = useState<"upload" | "paste" | "linkedin">("upload");
  const [pasteText, setPasteText] = useState("");
  const [linkedinUrl, setLinkedinUrl] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  const enterChat = (data: ResumeData) => {
    setVault(JSON.parse(JSON.stringify(data)));
    createSession();
  };

  const handleFile = async (file: File) => {
    if (file.type !== "application/pdf") { setError("Please upload a PDF file."); return; }
    setError(""); setLoading(true);
    try {
      const fd = new FormData(); fd.append("file", file);
      const res = await fetch("/api/parse-resume", { method: "POST", body: fd });
      if (!res.ok) { const d = await res.json().catch(() => ({})); throw new Error(d.error || "Failed"); }
      enterChat(await res.json() as ResumeData);
    } catch (e) { setError(e instanceof Error ? e.message : "Failed to parse resume."); }
    finally { setLoading(false); }
  };

  const handlePaste = async () => {
    if (!pasteText.trim()) return;
    setError(""); setLoading(true);
    try {
      const res = await fetch("/api/parse-resume", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ text: pasteText }) });
      if (!res.ok) throw new Error("Failed");
      enterChat(await res.json() as ResumeData);
    } catch { setError("Failed to parse. Try again."); }
    finally { setLoading(false); }
  };

  const handleLinkedin = async () => {
    if (!linkedinUrl.trim()) return;
    setError(""); setLoading(true);
    try {
      const res = await fetch("/api/parse-resume", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ linkedinUrl }) });
      if (!res.ok) throw new Error("Failed");
      enterChat(await res.json() as ResumeData);
    } catch { setError("Couldn't import. Try pasting your resume text instead."); }
    finally { setLoading(false); }
  };

  const handleSkip = () => {
    enterChat({ contact: { name: "", email: "", phone: "", location: "" }, summary: "", experience: [{ id: "exp-1", title: "", company: "", location: "", dateRange: "", bullets: [""] }], education: [{ id: "edu-1", degree: "", school: "", dateRange: "" }], skills: [] });
  };

  return (
    <div className="flex items-center justify-center min-h-[75vh]">
      <div className="max-w-md w-full px-6">
        <h2 className="text-2xl font-bold text-[#005149] mb-1 text-center">Add your resume</h2>
        <p className="text-stone-400 text-center mb-6 text-sm">We&apos;ll parse it and get you started</p>

        <div className="flex bg-stone-100 rounded-xl p-1 mb-6">
          {([["upload", "Upload PDF"], ["paste", "Paste text"], ["linkedin", "LinkedIn"]] as const).map(([key, label]) => (
            <button key={key} onClick={() => { setMode(key); setError(""); }}
              className={`flex-1 text-xs py-2.5 px-3 rounded-lg font-medium transition-all ${mode === key ? "bg-white text-[#005149] shadow-sm" : "text-stone-400 hover:text-stone-600"}`}
            >{label}</button>
          ))}
        </div>

        {mode === "upload" && (
          <div
            className={`border-2 border-dashed rounded-xl p-10 text-center cursor-pointer transition-all ${dragOver ? "border-[#005149] bg-[#005149]/5 scale-[1.01]" : "border-stone-200 hover:border-[#005149]/40"}`}
            onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
            onDragLeave={() => setDragOver(false)}
            onDrop={(e) => { e.preventDefault(); setDragOver(false); if (e.dataTransfer.files[0]) handleFile(e.dataTransfer.files[0]); }}
            onClick={() => inputRef.current?.click()}
          >
            {loading ? (
              <div className="flex flex-col items-center gap-3">
                <Loader2 className="w-8 h-8 text-[#005149] animate-spin" />
                <p className="text-stone-400 text-sm">Parsing your resume...</p>
              </div>
            ) : (
              <>
                <Upload className="w-8 h-8 text-[#005149]/50 mx-auto mb-3" />
                <p className="text-stone-500 text-sm font-medium">Drop your PDF here</p>
                <p className="text-stone-300 text-xs mt-1">or click to browse</p>
              </>
            )}
            <input ref={inputRef} type="file" accept=".pdf" className="hidden" onChange={(e) => { if (e.target.files?.[0]) handleFile(e.target.files[0]); }} />
          </div>
        )}

        {mode === "paste" && (
          <div>
            <textarea className="w-full border border-stone-200 rounded-xl p-4 text-sm h-44 focus:ring-1 focus:ring-[#005149] focus:border-[#005149] outline-none resize-none transition-colors" value={pasteText} onChange={(e) => setPasteText(e.target.value)} placeholder="Paste your full resume text here..." />
            <button onClick={handlePaste} disabled={!pasteText.trim() || loading}
              className="w-full mt-3 bg-[#005149] text-white py-3 rounded-xl text-sm font-medium hover:bg-[#003d38] transition-colors disabled:opacity-40 flex items-center justify-center gap-2">
              {loading ? <><Loader2 className="w-4 h-4 animate-spin" /> Parsing...</> : "Parse resume"}
            </button>
          </div>
        )}

        {mode === "linkedin" && (
          <div>
            <input className="w-full border border-stone-200 rounded-xl px-4 py-3 text-sm focus:ring-1 focus:ring-[#005149] focus:border-[#005149] outline-none transition-colors" value={linkedinUrl} onChange={(e) => setLinkedinUrl(e.target.value)} placeholder="https://linkedin.com/in/yourprofile" />
            <p className="text-[11px] text-stone-300 mt-2">We&apos;ll try to extract your profile info</p>
            <button onClick={handleLinkedin} disabled={!linkedinUrl.trim() || loading}
              className="w-full mt-3 bg-[#005149] text-white py-3 rounded-xl text-sm font-medium hover:bg-[#003d38] transition-colors disabled:opacity-40 flex items-center justify-center gap-2">
              {loading ? <><Loader2 className="w-4 h-4 animate-spin" /> Importing...</> : "Import profile"}
            </button>
          </div>
        )}

        {error && <p className="text-red-500 text-xs mt-3 text-center">{error}</p>}

        <div className="mt-6 flex items-center justify-between">
          <button onClick={() => setStep("welcome")} className="text-stone-300 hover:text-stone-500 text-xs transition-colors flex items-center gap-1">
            <ArrowLeft className="w-3 h-3" /> Back
          </button>
          <button onClick={handleSkip} className="text-stone-300 hover:text-stone-500 text-xs transition-colors">
            Skip — fill in manually
          </button>
        </div>

        <div className="mt-8 text-center">
          <button onClick={() => enterChat(EXAMPLE_DATA)} className="text-stone-300 hover:text-[#005149] text-xs transition-colors underline underline-offset-2">
            Use example data
          </button>
        </div>
      </div>
    </div>
  );
}
