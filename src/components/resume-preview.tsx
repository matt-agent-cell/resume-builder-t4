"use client";

import { useState } from "react";
import { useResume } from "@/context/resume-context";
import { defaultStyles } from "@/context/resume-context";
import { Palette } from "lucide-react";
import InlineEdit from "./inline-edit";
import CoverLetterPreview from "./cover-letter-preview";

/* ── Shared section renderers ── */

function ExperienceBlock({ resume, updateResume, hl, headingStyles, sectionGap, basePx, textColor, bulletChar, dateAlign }: {
  resume: import("@/context/resume-context").ResumeData;
  updateResume: (fn: (r: import("@/context/resume-context").ResumeData) => import("@/context/resume-context").ResumeData) => void;
  hl: (k: string) => string; headingStyles: React.CSSProperties; sectionGap: number; basePx: number; textColor: string; bulletChar: string; dateAlign: string;
}) {
  if (resume.experience.length === 0) return null;
  return (
    <div style={{ marginBottom: sectionGap }}>
      <h2 style={headingStyles}>Experience</h2>
      {resume.experience.map((exp) => (
        <div key={exp.id} className={hl(`experience-${exp.id}`)} style={{ marginBottom: 14 }}>
          <div className="flex justify-between items-baseline">
            <div className="flex items-baseline gap-1">
              <InlineEdit value={exp.title}
                onSave={(v) => updateResume((r) => ({ ...r, experience: r.experience.map((e) => e.id === exp.id ? { ...e, title: v } : e) }))}
                className="font-semibold" />
              <span className="text-stone-300">·</span>
              <InlineEdit value={exp.company}
                onSave={(v) => updateResume((r) => ({ ...r, experience: r.experience.map((e) => e.id === exp.id ? { ...e, company: v } : e) }))}
                style={{ color: `${textColor}99` }} />
            </div>
            <InlineEdit value={exp.dateRange}
              onSave={(v) => updateResume((r) => ({ ...r, experience: r.experience.map((e) => e.id === exp.id ? { ...e, dateRange: v } : e) }))}
              className="whitespace-nowrap ml-2"
              style={{ fontSize: `${basePx * 0.83}px`, color: `${textColor}77` }} />
          </div>
          <ul className="mt-1 space-y-0.5 ml-3">
            {exp.bullets.map((bullet, bi) => (
              <li key={bi} className="flex gap-1.5">
                {bulletChar && <span style={{ color: `${textColor}66` }} className="mt-px">{bulletChar}</span>}
                <InlineEdit value={bullet}
                  onSave={(v) => {
                    updateResume((r) => ({ ...r, experience: r.experience.map((e) =>
                      e.id === exp.id ? { ...e, bullets: e.bullets.map((b, i) => i === bi ? v : b) } : e
                    ) }));
                  }} />
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
}

function SkillsBlock({ resume, skillStyle, basePx, textColor, accentColor }: {
  resume: import("@/context/resume-context").ResumeData;
  skillStyle: string; basePx: number; textColor: string; accentColor: string;
}) {
  if (skillStyle === "comma") {
    return <p style={{ fontSize: `${basePx * 0.83}px`, color: textColor }}>{resume.skills.join(", ")}</p>;
  }
  if (skillStyle === "bars") {
    return (
      <div className="space-y-1.5">
        {resume.skills.map((skill, i) => (
          <div key={i} className="flex items-center gap-2">
            <span style={{ fontSize: `${basePx * 0.83}px`, width: 80 }} className="shrink-0">{skill}</span>
            <div className="flex-1 h-1.5 rounded-full" style={{ backgroundColor: `${accentColor}15` }}>
              <div className="h-full rounded-full" style={{ backgroundColor: accentColor, width: `${70 + ((i * 17 + 7) % 30)}%` }} />
            </div>
          </div>
        ))}
      </div>
    );
  }
  return (
    <div className="flex flex-wrap gap-1.5">
      {resume.skills.map((skill, i) => (
        <span key={i} style={{
          backgroundColor: skillStyle === "tags" ? "transparent" : `${accentColor}15`,
          color: accentColor, fontSize: `${basePx * 0.83}px`,
          border: skillStyle === "tags" ? `1px solid ${accentColor}33` : "none",
          borderRadius: skillStyle === "tags" ? 4 : 9999,
        }} className="font-medium px-2.5 py-1">{skill}</span>
      ))}
    </div>
  );
}

export default function ResumePreview({ onDesignClick }: { onDesignClick?: () => void }) {
  const { resume, updateResume, highlightedSections, coverLetter } = useResume();
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
  const headingMult = s.headingSize || 1.0;
  const headingStyle = s.headingStyle || "uppercase";
  const marginsX = s.marginsX || s.margins || 32;
  const marginsY = s.marginsY || 28;
  const dateAlign = s.dateAlign || "right";
  const dividerWeight = s.dividerWeight || 1;
  const skillStyle = s.skillStyle || "pills";
  const bulletChar = s.bulletStyle === "dash" ? "–" : s.bulletStyle === "arrow" ? "›" : s.bulletStyle === "none" ? "" : "•";
  const showSummary = s.showSummary !== false;
  const showSkills = s.showSkills !== false;
  const showEducation = s.showEducation !== false;
  const isTwoCol = s.columns === 2;

  const headingStyles: React.CSSProperties = {
    fontSize: `${basePx * headingMult}px`, fontWeight: 700, color: headingColor,
    textTransform: headingStyle as React.CSSProperties["textTransform"],
    letterSpacing: headingStyle === "uppercase" ? "0.05em" : "0",
    marginBottom: 8, paddingBottom: 4,
    borderBottom: borderStyle === "none" ? "none" : `${dividerWeight}px ${borderStyle} ${s.dividerColor || headingColor + "33"}`,
  };

  const updateContact = (field: string, value: string) => {
    updateResume((r) => ({ ...r, contact: { ...r.contact, [field]: value } }));
  };

  return (
    <div className="h-full flex flex-col bg-stone-100 relative group/preview">
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
      <div className="bg-white max-w-[8.5in] mx-auto shadow-xl rounded-lg" style={{ fontFamily, color: textColor, fontSize: `${basePx}px`, lineHeight, minHeight: "11in", paddingLeft: marginsX, paddingRight: marginsX, paddingTop: marginsY, paddingBottom: marginsY }}>
        {/* Header */}
        <div style={{ marginBottom: sectionGap, paddingBottom: 16, borderBottom: borderStyle === "none" ? "none" : `${Math.max(dividerWeight, 2)}px ${borderStyle} ${headingColor}`, textAlign: headerAlign, display: "flex", alignItems: "center", gap: 16, flexDirection: headerAlign === "center" ? "column" : "row" }}>
          {s.showPhoto && resume.contact.photo && (
            <img src={resume.contact.photo} alt="" style={{
              width: s.photoSize || 72, height: s.photoSize || 72, objectFit: "cover", flexShrink: 0,
              borderRadius: s.photoShape === "circle" ? "50%" : s.photoShape === "rounded" ? 8 : 0,
            }} />
          )}
          <div style={{ textAlign: headerAlign }}>
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
        </div>

        {/* Sections — single or two-column */}
        {isTwoCol ? (
          <div className="flex gap-5">
            {/* Left sidebar */}
            <div style={{ width: "32%", borderRight: `1px solid ${s.dividerColor || headingColor + "22"}`, paddingRight: sectionGap * 0.75 }}>
              {/* Contact details stacked */}
              <div style={{ marginBottom: sectionGap }}>
                <h2 style={headingStyles}>Contact</h2>
                <div className="space-y-1" style={{ fontSize: `${basePx * 0.83}px` }}>
                  {resume.contact.email && <p>{resume.contact.email}</p>}
                  {resume.contact.phone && <p>{resume.contact.phone}</p>}
                  {resume.contact.location && <p>{resume.contact.location}</p>}
                  {resume.contact.linkedin && <p style={{ color: accentColor }}>{resume.contact.linkedin}</p>}
                </div>
              </div>

              {/* Skills */}
              {resume.skills.length > 0 && showSkills && (
                <div style={{ marginBottom: sectionGap }}>
                  <h2 style={headingStyles}>Skills</h2>
                  <SkillsBlock {...{ resume, skillStyle, basePx, textColor, accentColor }} />
                </div>
              )}

              {/* Education */}
              {resume.education.length > 0 && showEducation && (
                <div style={{ marginBottom: sectionGap }}>
                  <h2 style={headingStyles}>Education</h2>
                  {resume.education.map((edu) => (
                    <div key={edu.id} className="mb-2">
                      <InlineEdit value={edu.degree}
                        onSave={(v) => updateResume((r) => ({ ...r, education: r.education.map((e) => e.id === edu.id ? { ...e, degree: v } : e) }))}
                        className="font-semibold block" />
                      <InlineEdit value={edu.school}
                        onSave={(v) => updateResume((r) => ({ ...r, education: r.education.map((e) => e.id === edu.id ? { ...e, school: v } : e) }))}
                        style={{ color: `${textColor}99`, fontSize: `${basePx * 0.83}px` }} />
                      <p style={{ fontSize: `${basePx * 0.75}px`, color: `${textColor}66` }}>{edu.dateRange}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Right main */}
            <div style={{ flex: 1 }}>
              {resume.summary && showSummary && (
                <div className={hl("summary")} style={{ marginBottom: sectionGap }}>
                  <h2 style={headingStyles}>Summary</h2>
                  <InlineEdit value={resume.summary} onSave={(v) => updateResume((r) => ({ ...r, summary: v }))} multiline className="leading-relaxed" />
                </div>
              )}
              <ExperienceBlock {...{ resume, updateResume, hl, headingStyles, sectionGap, basePx, textColor, bulletChar, dateAlign }} />
            </div>
          </div>
        ) : (
          <>
            {/* Summary */}
            {resume.summary && showSummary && (
              <div className={hl("summary")} style={{ marginBottom: sectionGap }}>
                <h2 style={headingStyles}>Summary</h2>
                <InlineEdit value={resume.summary} onSave={(v) => updateResume((r) => ({ ...r, summary: v }))} multiline className="leading-relaxed" />
              </div>
            )}

            <ExperienceBlock {...{ resume, updateResume, hl, headingStyles, sectionGap, basePx, textColor, bulletChar, dateAlign }} />

            {/* Education */}
            {resume.education.length > 0 && showEducation && (
              <div style={{ marginBottom: sectionGap }}>
                <h2 style={headingStyles}>Education</h2>
                {resume.education.map((edu) => (
                  <div key={edu.id} className="mb-1.5 flex justify-between items-baseline">
                    <div className="flex items-baseline gap-1">
                      <InlineEdit value={edu.degree}
                        onSave={(v) => updateResume((r) => ({ ...r, education: r.education.map((e) => e.id === edu.id ? { ...e, degree: v } : e) }))}
                        className="font-semibold" />
                      <span className="text-stone-300">·</span>
                      <InlineEdit value={edu.school}
                        onSave={(v) => updateResume((r) => ({ ...r, education: r.education.map((e) => e.id === edu.id ? { ...e, school: v } : e) }))}
                        style={{ color: `${textColor}99` }} />
                    </div>
                    <InlineEdit value={edu.dateRange}
                      onSave={(v) => updateResume((r) => ({ ...r, education: r.education.map((e) => e.id === edu.id ? { ...e, dateRange: v } : e) }))}
                      style={{ fontSize: `${basePx * 0.83}px`, color: `${textColor}77` }} />
                  </div>
                ))}
              </div>
            )}

            {/* Skills */}
            {resume.skills.length > 0 && showSkills && (
              <div className={hl("skills")}>
                <h2 style={headingStyles}>Skills</h2>
                <SkillsBlock {...{ resume, skillStyle, basePx, textColor, accentColor }} />
              </div>
            )}
          </>
        )}
      </div>
      )}

      {/* Cover Letter */}
      {activeTab === "coverLetter" && coverLetter && (
        <CoverLetterPreview />
      )}

      {/* Design button — top right on hover */}
      {onDesignClick && (
        <button
          onClick={onDesignClick}
          className={`absolute ${coverLetter ? "top-14" : "top-3"} right-3 z-10 opacity-0 group-hover/preview:opacity-100 h-8 flex items-center gap-1.5 px-3 rounded-lg bg-white/90 backdrop-blur border border-stone-200 text-stone-600 hover:text-[#005149] hover:border-[#005149]/30 shadow-sm transition-all text-xs font-medium`}
        >
          <Palette className="w-3.5 h-3.5" />
          Design
        </button>
      )}

      {/* Export via top nav download button */}
      </div>
    </div>
  );
}
