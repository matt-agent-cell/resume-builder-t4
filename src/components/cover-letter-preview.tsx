"use client";

import { useResume } from "@/context/resume-context";
import { defaultStyles } from "@/context/resume-context";
import InlineEdit from "./inline-edit";

export default function CoverLetterPreview() {
  const { coverLetter, updateCoverLetter, resume } = useResume();

  if (!coverLetter || !resume) return null;

  const s = { ...defaultStyles, ...resume.styles };
  const fontFamily = `${s.fontFamily || "Inter"}, sans-serif`;
  const headingColor = s.headingColor || "#005149";
  const textColor = s.textColor || "#1c1917";
  const basePx = s.fontSize || 12;
  const lineHeight = s.lineHeight || 1.5;

  return (
    <div className="bg-white max-w-[8.5in] mx-auto shadow-xl rounded-lg px-8 py-7" style={{ fontFamily, color: textColor, fontSize: `${basePx}px`, lineHeight, minHeight: "11in", position: "relative" }}>
      {/* Contact info from resume */}
      <div style={{ marginBottom: 24, borderBottom: `2px solid ${headingColor}`, paddingBottom: 16 }}>
        <h1 style={{ fontSize: `${basePx * 1.67}px`, fontWeight: 700, color: headingColor, marginBottom: 6 }}>
          {resume.contact.name}
        </h1>
        <div className="text-xs text-stone-500 flex flex-wrap items-center gap-x-1">
          {resume.contact.email}
          {resume.contact.phone && <><span className="text-stone-300">·</span>{resume.contact.phone}</>}
          {resume.contact.location && <><span className="text-stone-300">·</span>{resume.contact.location}</>}
        </div>
      </div>

      {/* Greeting */}
      <div style={{ marginBottom: 16 }}>
        <InlineEdit
          value={coverLetter.greeting}
          onSave={(v) => updateCoverLetter((cl) => ({ ...cl, greeting: v }))}
          className="font-medium"
        />
      </div>

      {/* Body paragraphs */}
      <div className="space-y-4" style={{ marginBottom: 20 }}>
        {coverLetter.paragraphs.map((p, i) => (
          <InlineEdit
            key={i}
            value={p}
            onSave={(v) => updateCoverLetter((cl) => ({
              ...cl,
              paragraphs: cl.paragraphs.map((para, pi) => pi === i ? v : para),
            }))}
            multiline
            className="leading-relaxed"
          />
        ))}
      </div>

      {/* Closing */}
      <div style={{ marginBottom: 4 }}>
        <InlineEdit
          value={coverLetter.closing}
          onSave={(v) => updateCoverLetter((cl) => ({ ...cl, closing: v }))}
        />
      </div>

      {/* Signature */}
      <div className="font-medium">
        <InlineEdit
          value={coverLetter.signature}
          onSave={(v) => updateCoverLetter((cl) => ({ ...cl, signature: v }))}
        />
      </div>
    </div>
  );
}
