"use client";

import { useState } from "react";
import { useResume } from "@/context/resume-context";
import { X, Download, Copy, Check } from "lucide-react";

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const templates = [
  {
    id: "clean",
    name: "Clean",
    desc: "Minimal & elegant",
    colors: ["#005149", "#fafaf9", "#e7e5e4"],
  },
  {
    id: "modern",
    name: "Modern",
    desc: "Bold accent colors",
    colors: ["#005149", "#f0fdfa", "#99f6e4"],
  },
  {
    id: "classic",
    name: "Classic",
    desc: "Traditional format",
    colors: ["#1c1917", "#fafaf9", "#d6d3d1"],
  },
];

export default function ExportModal({ isOpen, onClose }: ExportModalProps) {
  const { resume } = useResume();
  const [selected, setSelected] = useState("clean");
  const [copied, setCopied] = useState(false);

  if (!isOpen || !resume) return null;

  const getPlainText = () => {
    let text = `${resume.contact.name}\n${resume.contact.email} | ${resume.contact.phone} | ${resume.contact.location}\n`;
    if (resume.contact.linkedin) text += `${resume.contact.linkedin}\n`;
    text += `\n`;
    if (resume.summary) text += `SUMMARY\n${resume.summary}\n\n`;
    if (resume.experience.length > 0) {
      text += `EXPERIENCE\n`;
      for (const exp of resume.experience) {
        text += `${exp.title} — ${exp.company} (${exp.dateRange})\n`;
        for (const b of exp.bullets) text += `  • ${b}\n`;
        text += `\n`;
      }
    }
    if (resume.education.length > 0) {
      text += `EDUCATION\n`;
      for (const edu of resume.education) {
        text += `${edu.degree} — ${edu.school} (${edu.dateRange})\n`;
      }
      text += `\n`;
    }
    if (resume.skills.length > 0) {
      text += `SKILLS\n${resume.skills.join(", ")}\n`;
    }
    return text;
  };

  const handleCopy = async () => {
    await navigator.clipboard.writeText(getPlainText());
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm" onClick={onClose}>
      <div className="bg-white rounded-2xl max-w-lg w-full mx-4 p-6 relative animate-fade-in" onClick={(e) => e.stopPropagation()}>
        <button onClick={onClose} className="absolute top-4 right-4 text-stone-400 hover:text-stone-600 transition-colors">
          <X className="w-5 h-5" />
        </button>

        <h2 className="text-lg font-bold text-stone-900 mb-1">Export Resume</h2>
        <p className="text-sm text-stone-500 mb-5">Choose a template and download your resume</p>

        {/* Template Cards */}
        <div className="grid grid-cols-3 gap-3 mb-6">
          {templates.map((t) => (
            <button
              key={t.id}
              onClick={() => setSelected(t.id)}
              className={`relative rounded-xl border-2 p-3 transition-all ${
                selected === t.id
                  ? "border-[#005149] bg-[#005149]/5"
                  : "border-stone-200 hover:border-stone-300"
              }`}
            >
              {/* Mini preview mockup */}
              <div className="w-full aspect-[8.5/11] rounded-md bg-white border border-stone-100 mb-2 p-2 flex flex-col gap-1">
                <div className="h-2 rounded-full" style={{ background: t.colors[0], width: "60%" }} />
                <div className="h-1 rounded-full" style={{ background: t.colors[2], width: "80%" }} />
                <div className="h-1 rounded-full" style={{ background: t.colors[2], width: "70%" }} />
                <div className="flex-1" />
                <div className="h-1 rounded-full" style={{ background: t.colors[2], width: "90%" }} />
                <div className="h-1 rounded-full" style={{ background: t.colors[2], width: "75%" }} />
              </div>
              <p className="text-xs font-semibold text-stone-800">{t.name}</p>
              <p className="text-[10px] text-stone-500">{t.desc}</p>
              {selected === t.id && (
                <div className="absolute top-2 right-2 w-4 h-4 rounded-full bg-[#005149] flex items-center justify-center">
                  <Check className="w-2.5 h-2.5 text-white" />
                </div>
              )}
            </button>
          ))}
        </div>

        {/* Actions */}
        <div className="flex gap-3">
          <button className="flex-1 bg-[#005149] text-white py-2.5 rounded-xl font-medium text-sm hover:bg-[#003d38] transition-colors flex items-center justify-center gap-2">
            <Download className="w-4 h-4" />
            Download PDF
          </button>
          <button
            onClick={handleCopy}
            className="flex-1 border border-stone-200 text-stone-700 py-2.5 rounded-xl font-medium text-sm hover:bg-stone-50 transition-colors flex items-center justify-center gap-2"
          >
            {copied ? <Check className="w-4 h-4 text-green-600" /> : <Copy className="w-4 h-4" />}
            {copied ? "Copied!" : "Copy Text"}
          </button>
        </div>
      </div>
    </div>
  );
}
