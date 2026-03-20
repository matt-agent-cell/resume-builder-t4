"use client";

import { useState } from "react";
import { useResume } from "@/context/resume-context";
import { defaultStyles } from "@/context/resume-context";
import { Download } from "lucide-react";
import InlineEdit from "./inline-edit";
import ExportModal from "./export-modal";
import CoverLetterPreview from "./cover-letter-preview";

export default function ResumePreview() {
  const { resume, updateResume, highlightedSections, coverLetter } = useResume();
  const [exportOpen, setExportOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<"resume" | "coverLetter">("resume");

  const hl = (key: string) =>
    highlightedSections.has(key) ? "ring-2 ring-[#005149]/20 rounded-md -mx-2 px-2 py-1 transition-all duration-700 resume-highlight" : "";

  if (!resume) return null;

  const s = { ...defaultStyles, ...resume.styles };
  const basePx = s.fontSize || 12;
  const headingColor = s.headingColor || "#005149";
  const textColor = s.textColor || "#1c1917";
  const accentColor = s.accentColor || "#005149";
  const lineHeight = s.lineHeight || 1.5;
  const sectionGap = s.sectionSpacing || 20;
  const borderStyle = s.borderStyle || "solid";
  const fontFamily = `${s.fontFamily || "Inter"}, sans-serif`;
  const headerAlign = s.headerAlign || "left";
  const nameSize = s.nameSize || 1.67;
  const margins = s.margins || 32;
  const skillStyle = s.skillStyle || "pills";
  const bulletChar = s.bulletStyle === "dash" ? "–" : s.bulletStyle === "arrow" ? "›" : s.bulletStyle === "none" ? "" : "•";

  const updateContact = (field: string, value: string) => {
    updateResume((r) => ({ ...r, contact: { ...r.contact, [field]: value } }));
  };

  return (
    <div className="h-full flex flex-col bg-stone-100 relative">
      {/* Tabs — only show when cover letter exists */}
      {coverLetter && (
        <div className="shrink-0 flex gap-1 px-5 pt-3 pb-0 bg-stone-100">
          <button
            onClick={() => setActiveTab("resume")}
            className={`px-4 py-1.5 rounded-t-lg text-sm font-medium transition-colors ${
              activeTab === "resume" ? "bg-white text-stone-800 shadow-sm" : "text-stone-500 hover:text-stone-700"
            }`}
          >
            Resume
          </button>
          <button
            onClick={() => setActiveTab("coverLetter")}
            className={`px-4 py-1.5 rounded-t-lg text-sm font-medium transition-colors ${
              activeTab === "coverLetter" ? "bg-white text-stone-800 shadow-sm" : "text-stone-500 hover:text-stone-700"
            }`}
          >
            Cover Letter
          </button>
        </div>
      )}
      <div className="flex-1 overflow-y-auto p-5">
      {activeTab === "resume" && (
      <div className="bg-white max-w-[8.5in] mx-auto shadow-xl rounded-lg py-7" style={{ fontFamily, color: textColor, fontSize: `${basePx}px`, lineHeight, minHeight: "11in", paddingLeft: margins, paddingRight: margins }}>
        {/* Header */}
        <div style={{ marginBottom: sectionGap, paddingBottom: 16, borderBottom: borderStyle === "none" ? "none" : `2px ${borderStyle} ${headingColor}`, textAlign: headerAlign }}>
          <h1 style={{ fontSize: `${basePx * nameSize}px`, fontWeight: 700, color: headingColor, marginBottom: 6 }}>
            <InlineEdit value={resume.contact.name} onSave={(v) => updateContact("name", v)} className="font-bold" style={{ color: headingColor }} />
          </h1>
          <div className={`text-xs text-stone-500 flex flex-wrap items-center gap-x-1 ${headerAlign === "center" ? "justify-center" : ""}`}>
            <InlineEdit value={resume.contact.email} onSave={(v) => updateContact("email", v)} className="text-xs text-stone-500" />
            {resume.contact.phone && (
              <>
                <span className="text-stone-300">·</span>
                <InlineEdit value={resume.contact.phone} onSave={(v) => updateContact("phone", v)} className="text-xs text-stone-500" />
              </>
            )}
            {resume.contact.location && (
              <>
                <span className="text-stone-300">·</span>
                <InlineEdit value={resume.contact.location} onSave={(v) => updateContact("location", v)} className="text-xs text-stone-500" />
              </>
            )}
            {resume.contact.linkedin && (
              <>
                <span className="text-stone-300">·</span>
                <InlineEdit value={resume.contact.linkedin} onSave={(v) => updateContact("linkedin", v)} className="text-xs text-stone-500" />
              </>
            )}
          </div>
        </div>

        {/* Summary */}
        {resume.summary && (
          <div className={hl("summary")} style={{ marginBottom: sectionGap }}>
            <h2 style={{ fontSize: `${basePx}px`, fontWeight: 700, color: headingColor, textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 6, paddingBottom: 4, borderBottom: `1px solid ${headingColor}33` }}>Summary</h2>
            <InlineEdit
              value={resume.summary}
              onSave={(v) => updateResume((r) => ({ ...r, summary: v }))}
              multiline
              className="leading-relaxed"
            />
          </div>
        )}

        {/* Experience */}
        {resume.experience.length > 0 && (
          <div style={{ marginBottom: sectionGap }}>
            <h2 style={{ fontSize: `${basePx}px`, fontWeight: 700, color: headingColor, textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 8, paddingBottom: 4, borderBottom: `1px solid ${headingColor}33` }}>Experience</h2>
            {resume.experience.map((exp) => (
              <div key={exp.id} className={hl(`experience-${exp.id}`)} style={{ marginBottom: 14 }}>
                <div className="flex justify-between items-baseline">
                  <div className="flex items-baseline gap-1">
                    <InlineEdit
                      value={exp.title}
                      onSave={(v) => updateResume((r) => ({ ...r, experience: r.experience.map((e) => e.id === exp.id ? { ...e, title: v } : e) }))}
                      className="font-semibold"
                    />
                    <span className="text-stone-300">·</span>
                    <InlineEdit
                      value={exp.company}
                      onSave={(v) => updateResume((r) => ({ ...r, experience: r.experience.map((e) => e.id === exp.id ? { ...e, company: v } : e) }))}
                      style={{ color: `${textColor}99` }}
                    />
                  </div>
                  <InlineEdit
                    value={exp.dateRange}
                    onSave={(v) => updateResume((r) => ({ ...r, experience: r.experience.map((e) => e.id === exp.id ? { ...e, dateRange: v } : e) }))}
                    className="whitespace-nowrap ml-2"
                    style={{ fontSize: `${basePx * 0.83}px`, color: `${textColor}77` }}
                  />
                </div>
                <ul className="mt-1 space-y-0.5 ml-3">
                  {exp.bullets.map((bullet, bi) => (
                    <li key={bi} className="flex gap-1.5">
                      {bulletChar && <span style={{ color: `${textColor}66` }} className="mt-px">{bulletChar}</span>}
                      <InlineEdit
                        value={bullet}
                        onSave={(v) => {
                          updateResume((r) => ({
                            ...r,
                            experience: r.experience.map((e) =>
                              e.id === exp.id ? { ...e, bullets: e.bullets.map((b, i) => i === bi ? v : b) } : e
                            ),
                          }));
                        }}
                      />
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        )}

        {/* Education */}
        {resume.education.length > 0 && (
          <div style={{ marginBottom: sectionGap }}>
            <h2 style={{ fontSize: `${basePx}px`, fontWeight: 700, color: headingColor, textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 8, paddingBottom: 4, borderBottom: `1px solid ${headingColor}33` }}>Education</h2>
            {resume.education.map((edu) => (
              <div key={edu.id} className="mb-1.5 flex justify-between items-baseline">
                <div className="flex items-baseline gap-1">
                  <InlineEdit
                    value={edu.degree}
                    onSave={(v) => updateResume((r) => ({ ...r, education: r.education.map((e) => e.id === edu.id ? { ...e, degree: v } : e) }))}
                    className="font-semibold"
                  />
                  <span className="text-stone-300">·</span>
                  <InlineEdit
                    value={edu.school}
                    onSave={(v) => updateResume((r) => ({ ...r, education: r.education.map((e) => e.id === edu.id ? { ...e, school: v } : e) }))}
                    style={{ color: `${textColor}99` }}
                  />
                </div>
                <InlineEdit
                  value={edu.dateRange}
                  onSave={(v) => updateResume((r) => ({ ...r, education: r.education.map((e) => e.id === edu.id ? { ...e, dateRange: v } : e) }))}
                  style={{ fontSize: `${basePx * 0.83}px`, color: `${textColor}77` }}
                />
              </div>
            ))}
          </div>
        )}

        {/* Skills */}
        {resume.skills.length > 0 && (
          <div className={hl("skills")}>
            <h2 style={{ fontSize: `${basePx}px`, fontWeight: 700, color: headingColor, textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 8, paddingBottom: 4, borderBottom: `1px solid ${headingColor}33` }}>Skills</h2>
            {skillStyle === "comma" ? (
              <p style={{ fontSize: `${basePx * 0.83}px`, color: textColor }}>
                {resume.skills.join(", ")}
              </p>
            ) : skillStyle === "bars" ? (
              <div className="space-y-1.5">
                {resume.skills.map((skill, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <span style={{ fontSize: `${basePx * 0.83}px`, width: 100 }} className="shrink-0">{skill}</span>
                    <div className="flex-1 h-1.5 rounded-full" style={{ backgroundColor: `${accentColor}15` }}>
                      <div className="h-full rounded-full" style={{ backgroundColor: accentColor, width: `${70 + Math.random() * 30}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-wrap gap-1.5">
                {resume.skills.map((skill, i) => (
                  <span key={i} style={{
                    backgroundColor: skillStyle === "tags" ? "transparent" : `${accentColor}15`,
                    color: accentColor,
                    fontSize: `${basePx * 0.83}px`,
                    border: skillStyle === "tags" ? `1px solid ${accentColor}33` : "none",
                    borderRadius: skillStyle === "tags" ? 4 : 9999,
                  }} className="font-medium px-2.5 py-1">{skill}</span>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
      )}

      {/* Cover Letter */}
      {activeTab === "coverLetter" && coverLetter && (
        <CoverLetterPreview />
      )}

      {/* Floating export button */}
      <button
        onClick={() => setExportOpen(true)}
        className="absolute bottom-5 right-5 w-11 h-11 rounded-full bg-[#005149] text-white shadow-lg hover:bg-[#003d38] transition-all hover:scale-105 flex items-center justify-center"
      >
        <Download className="w-4 h-4" />
      </button>

      <ExportModal isOpen={exportOpen} onClose={() => setExportOpen(false)} />
      </div>
    </div>
  );
}
