"use client";

import { useState } from "react";
import { useResume, type ResumeData } from "@/context/resume-context";
import { X, GitCompareArrows } from "lucide-react";

function countChanges(orig: ResumeData, curr: ResumeData) {
  let changes = 0, bullets = 0, skills = 0;
  if (orig.summary !== curr.summary) changes++;
  for (const exp of curr.experience) {
    const o = orig.experience.find((e) => e.id === exp.id);
    if (!o) { changes++; continue; }
    if (o.title !== exp.title) changes++;
    for (let i = 0; i < Math.max(o.bullets.length, exp.bullets.length); i++) {
      if (o.bullets[i] !== exp.bullets[i]) bullets++;
    }
  }
  const origSkills = new Set(orig.skills);
  const currSkills = new Set(curr.skills);
  for (const s of currSkills) { if (!origSkills.has(s)) skills++; }
  return { changes: changes + bullets + skills, bullets, skills };
}

function ResumeDoc({ data, original, showDiff }: { data: ResumeData; original?: ResumeData; showDiff?: boolean }) {
  return (
    <div className="bg-white max-w-[8.5in] mx-auto shadow-sm border border-stone-200 rounded-lg">
      {/* Header */}
      <div className="px-10 pt-10 pb-5 border-b border-stone-200 text-center">
        <h1 className="text-xl font-bold text-stone-800">{data.contact.name}</h1>
        <p className="text-sm text-stone-500 mt-1">
          {[data.contact.email, data.contact.phone, data.contact.location].filter(Boolean).join(" · ")}
        </p>
      </div>

      <div className="px-10 py-6 space-y-5">
        {/* Summary */}
        {(data.summary || original?.summary) && (
          <section>
            <h2 className="text-xs font-bold text-stone-800 uppercase tracking-wider mb-2">Summary</h2>
            {showDiff && original && original.summary !== data.summary ? (
              <div className="space-y-1.5">
                {original.summary && (
                  <p className="text-sm text-red-700/70 bg-red-50 rounded px-3 py-2 line-through leading-relaxed">{original.summary}</p>
                )}
                {data.summary && (
                  <p className="text-sm text-green-800 bg-green-50 rounded px-3 py-2 leading-relaxed">{data.summary}</p>
                )}
              </div>
            ) : (
              <p className="text-sm text-stone-600 leading-relaxed">{data.summary}</p>
            )}
          </section>
        )}

        {/* Experience */}
        {data.experience.length > 0 && (
          <section>
            <h2 className="text-xs font-bold text-stone-800 uppercase tracking-wider mb-3">Experience</h2>
            <div className="space-y-5">
              {data.experience.map((exp) => {
                const origExp = original?.experience.find((e) => e.id === exp.id);
                return (
                  <div key={exp.id}>
                    <div className="flex justify-between items-baseline mb-1">
                      <div>
                        <span className="text-sm font-semibold text-stone-800">{exp.title}</span>
                        {exp.company && <span className="text-sm text-stone-500"> · {exp.company}</span>}
                      </div>
                      <span className="text-xs text-stone-400">{exp.dateRange}</span>
                    </div>
                    <ul className="space-y-1 mt-1.5">
                      {exp.bullets.map((bullet, bi) => {
                        const origBullet = origExp?.bullets[bi];
                        const changed = showDiff && origExp && origBullet !== bullet;
                        return (
                          <li key={bi}>
                            {changed && origBullet && (
                              <div className="flex gap-2 text-sm text-red-700/70 bg-red-50 rounded px-2 py-1 mb-1 line-through">
                                <span className="text-red-300 shrink-0">•</span>
                                <span>{origBullet}</span>
                              </div>
                            )}
                            <div className={`flex gap-2 text-sm ${changed ? "text-green-800 bg-green-50 rounded px-2 py-1" : "text-stone-600"}`}>
                              <span className={`shrink-0 ${changed ? "text-green-400" : "text-stone-300"}`}>•</span>
                              <span>{bullet}</span>
                            </div>
                          </li>
                        );
                      })}
                      {/* Show removed bullets */}
                      {showDiff && origExp && origExp.bullets.length > exp.bullets.length && (
                        origExp.bullets.slice(exp.bullets.length).map((b, i) => (
                          <li key={`removed-${i}`}>
                            <div className="flex gap-2 text-sm text-red-700/70 bg-red-50 rounded px-2 py-1 line-through">
                              <span className="text-red-300 shrink-0">•</span>
                              <span>{b}</span>
                            </div>
                          </li>
                        ))
                      )}
                    </ul>
                  </div>
                );
              })}
            </div>
          </section>
        )}

        {/* Education */}
        {data.education.length > 0 && (
          <section>
            <h2 className="text-xs font-bold text-stone-800 uppercase tracking-wider mb-2">Education</h2>
            {data.education.map((edu) => (
              <div key={edu.id} className="flex justify-between items-baseline mb-1">
                <div>
                  <span className="text-sm font-semibold text-stone-800">{edu.degree}</span>
                  {edu.school && <span className="text-sm text-stone-500"> · {edu.school}</span>}
                </div>
                <span className="text-xs text-stone-400">{edu.dateRange}</span>
              </div>
            ))}
          </section>
        )}

        {/* Skills */}
        {data.skills.length > 0 && (
          <section>
            <h2 className="text-xs font-bold text-stone-800 uppercase tracking-wider mb-2">Skills</h2>
            <div className="flex flex-wrap gap-1.5">
              {data.skills.map((skill, i) => {
                const isNew = showDiff && original && !original.skills.includes(skill);
                return (
                  <span key={i} className={`text-xs px-2.5 py-0.5 rounded-full ${isNew ? "bg-green-50 text-green-800 ring-1 ring-green-200" : "bg-stone-100 text-stone-600"}`}>
                    {skill}
                  </span>
                );
              })}
              {/* Removed skills */}
              {showDiff && original && original.skills.filter((s) => !data.skills.includes(s)).map((skill, i) => (
                <span key={`rm-${i}`} className="text-xs px-2.5 py-0.5 rounded-full bg-red-50 text-red-700/70 line-through">
                  {skill}
                </span>
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}

export default function CompareView({ onClose }: { onClose: () => void }) {
  const { activeSession } = useResume();
  const [mode, setMode] = useState<"unified" | "side-by-side">("unified");

  if (!activeSession) return null;

  const orig = activeSession.originalResume;
  const curr = activeSession.resume;
  const stats = countChanges(orig, curr);
  const hasChanges = JSON.stringify(orig) !== JSON.stringify(curr);

  return (
    <div className="h-full flex flex-col bg-stone-50">
      {/* Header bar */}
      <div className="h-11 shrink-0 border-b border-stone-200 bg-white flex items-center justify-between px-4">
        <div className="flex items-center gap-3">
          <GitCompareArrows className="w-4 h-4 text-stone-500" />
          <span className="text-sm font-semibold text-stone-700">Compare Versions</span>
          {hasChanges && (
            <span className="text-xs text-stone-400 bg-stone-100 px-2 py-0.5 rounded-full">
              {stats.changes} changes{stats.bullets > 0 && ` · ${stats.bullets} bullets rewritten`}{stats.skills > 0 && ` · ${stats.skills} skills added`}
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          <div className="flex bg-stone-100 rounded-lg p-0.5">
            <button
              onClick={() => setMode("unified")}
              className={`text-xs px-3 py-1.5 rounded-md font-medium transition-colors ${mode === "unified" ? "bg-white text-stone-800 shadow-sm" : "text-stone-500"}`}
            >
              Unified
            </button>
            <button
              onClick={() => setMode("side-by-side")}
              className={`text-xs px-3 py-1.5 rounded-md font-medium transition-colors ${mode === "side-by-side" ? "bg-white text-stone-800 shadow-sm" : "text-stone-500"}`}
            >
              Side by Side
            </button>
          </div>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-lg text-stone-400 hover:text-stone-600 hover:bg-stone-100 transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-6">
        {!hasChanges ? (
          <div className="text-center py-20">
            <p className="text-stone-400 text-sm">No changes yet. Chat with the AI to tailor your resume.</p>
          </div>
        ) : mode === "unified" ? (
          <ResumeDoc data={curr} original={orig} showDiff />
        ) : (
          <div className="flex gap-6">
            <div className="flex-1">
              <p className="text-xs font-medium text-stone-400 text-center mb-3">Original</p>
              <ResumeDoc data={orig} />
            </div>
            <div className="flex-1">
              <p className="text-xs font-medium text-[#005149] text-center mb-3">Tailored</p>
              <ResumeDoc data={curr} original={orig} showDiff />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
