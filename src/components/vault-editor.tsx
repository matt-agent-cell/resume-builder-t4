"use client";

import { useResume } from "@/context/resume-context";
import { Archive, Plus, Trash2 } from "lucide-react";
import InlineEdit from "./inline-edit";

export default function VaultEditor() {
  const { vault, updateVault } = useResume();

  if (!vault) return (
    <div className="h-full flex items-center justify-center bg-white">
      <div className="text-center">
        <Archive className="w-10 h-10 text-stone-200 mx-auto mb-3" />
        <p className="text-stone-400 text-sm">No career data yet</p>
        <p className="text-stone-300 text-xs mt-1">Upload a resume to start your vault</p>
      </div>
    </div>
  );

  const updateContact = (field: string, value: string) =>
    updateVault((v) => ({ ...v, contact: { ...v.contact, [field]: value } }));

  const updateExperience = (id: string, field: string, value: string | string[]) =>
    updateVault((v) => ({ ...v, experience: v.experience.map((e) => e.id === id ? { ...e, [field]: value } : e) }));

  const deleteExperience = (id: string) =>
    updateVault((v) => ({ ...v, experience: v.experience.filter((e) => e.id !== id) }));

  const addExperience = () =>
    updateVault((v) => ({ ...v, experience: [...v.experience, { id: `exp-${Date.now()}`, title: "", company: "", location: "", dateRange: "", bullets: [""] }] }));

  const updateEducation = (id: string, field: string, value: string) =>
    updateVault((v) => ({ ...v, education: v.education.map((e) => e.id === id ? { ...e, [field]: value } : e) }));

  const deleteEducation = (id: string) =>
    updateVault((v) => ({ ...v, education: v.education.filter((e) => e.id !== id) }));

  const addEducation = () =>
    updateVault((v) => ({ ...v, education: [...v.education, { id: `edu-${Date.now()}`, degree: "", school: "", dateRange: "" }] }));

  const updateBullet = (expId: string, bulletIdx: number, value: string) =>
    updateVault((v) => ({
      ...v,
      experience: v.experience.map((e) =>
        e.id === expId ? { ...e, bullets: e.bullets.map((b, i) => i === bulletIdx ? value : b) } : e
      ),
    }));

  const addBullet = (expId: string) =>
    updateVault((v) => ({
      ...v,
      experience: v.experience.map((e) =>
        e.id === expId ? { ...e, bullets: [...e.bullets, ""] } : e
      ),
    }));

  const deleteBullet = (expId: string, bulletIdx: number) =>
    updateVault((v) => ({
      ...v,
      experience: v.experience.map((e) =>
        e.id === expId ? { ...e, bullets: e.bullets.filter((_, i) => i !== bulletIdx) } : e
      ),
    }));

  return (
    <div className="h-full overflow-y-auto bg-white">
      <div className="max-w-2xl mx-auto px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-stone-800 mb-1">Career Vault</h1>
          <p className="text-stone-400 text-sm">Your master career history. Click any text to edit.</p>
        </div>

        {/* Contact */}
        <div className="mb-8">
          <InlineEdit
            value={vault.contact.name}
            onSave={(v) => updateContact("name", v)}
            className="text-xl font-bold text-stone-800 block mb-1"
            placeholder="Your name"
          />
          <div className="flex flex-wrap items-center gap-x-1 text-sm text-stone-500">
            <InlineEdit value={vault.contact.email} onSave={(v) => updateContact("email", v)} className="text-sm text-stone-500" placeholder="email" />
            <span className="text-stone-300">·</span>
            <InlineEdit value={vault.contact.phone} onSave={(v) => updateContact("phone", v)} className="text-sm text-stone-500" placeholder="phone" />
            <span className="text-stone-300">·</span>
            <InlineEdit value={vault.contact.location} onSave={(v) => updateContact("location", v)} className="text-sm text-stone-500" placeholder="location" />
            {(vault.contact.linkedin || true) && (
              <>
                <span className="text-stone-300">·</span>
                <InlineEdit value={vault.contact.linkedin || ""} onSave={(v) => updateContact("linkedin", v)} className="text-sm text-stone-500" placeholder="linkedin" />
              </>
            )}
          </div>
        </div>

        {/* Summary */}
        <div className="mb-8">
          <h2 className="text-xs font-semibold text-stone-400 uppercase tracking-wider mb-2">Summary</h2>
          <InlineEdit
            value={vault.summary}
            onSave={(v) => updateVault((prev) => ({ ...prev, summary: v }))}
            multiline
            className="text-sm text-stone-600 leading-relaxed block"
            placeholder="Write a professional summary..."
          />
        </div>

        {/* Experience */}
        <div className="mb-8">
          <h2 className="text-xs font-semibold text-stone-400 uppercase tracking-wider mb-3">Experience</h2>
          <div className="space-y-5">
            {vault.experience.map((exp) => (
              <div key={exp.id} className="group relative pl-4 border-l-2 border-stone-100 hover:border-[#005149]/30 transition-colors">
                <button
                  onClick={() => deleteExperience(exp.id)}
                  className="absolute -left-6 top-0 opacity-0 group-hover:opacity-100 text-stone-300 hover:text-red-400 transition-all"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
                <div className="flex items-baseline justify-between gap-2 mb-0.5">
                  <div className="flex items-baseline gap-1.5 min-w-0">
                    <InlineEdit
                      value={exp.title}
                      onSave={(v) => updateExperience(exp.id, "title", v)}
                      className="text-sm font-semibold text-stone-800"
                      placeholder="Job title"
                    />
                    <span className="text-stone-300 shrink-0">·</span>
                    <InlineEdit
                      value={exp.company}
                      onSave={(v) => updateExperience(exp.id, "company", v)}
                      className="text-sm text-stone-500"
                      placeholder="Company"
                    />
                  </div>
                  <InlineEdit
                    value={exp.dateRange}
                    onSave={(v) => updateExperience(exp.id, "dateRange", v)}
                    className="text-xs text-stone-400 whitespace-nowrap shrink-0"
                    placeholder="Dates"
                  />
                </div>
                <div className="mt-1.5 space-y-0.5">
                  {exp.bullets.map((bullet, bi) => (
                    <div key={bi} className="flex gap-2 group/bullet">
                      <span className="text-stone-300 mt-0.5 shrink-0 text-sm">•</span>
                      <InlineEdit
                        value={bullet}
                        onSave={(v) => updateBullet(exp.id, bi, v)}
                        className="text-sm text-stone-600 flex-1"
                        placeholder="Describe what you did..."
                      />
                      <button
                        onClick={() => deleteBullet(exp.id, bi)}
                        className="opacity-0 group-hover/bullet:opacity-100 text-stone-200 hover:text-red-400 transition-all shrink-0 mt-0.5"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                  <button
                    onClick={() => addBullet(exp.id)}
                    className="text-stone-300 hover:text-[#005149] text-xs ml-5 transition-colors"
                  >
                    + Add bullet
                  </button>
                </div>
              </div>
            ))}
          </div>
          <button onClick={addExperience} className="flex items-center gap-1.5 text-xs text-stone-400 hover:text-[#005149] font-medium mt-4 transition-colors">
            <Plus className="w-3.5 h-3.5" /> Add experience
          </button>
        </div>

        {/* Education */}
        <div className="mb-8">
          <h2 className="text-xs font-semibold text-stone-400 uppercase tracking-wider mb-3">Education</h2>
          <div className="space-y-3">
            {vault.education.map((edu) => (
              <div key={edu.id} className="group relative pl-4 border-l-2 border-stone-100 hover:border-[#005149]/30 transition-colors">
                <button
                  onClick={() => deleteEducation(edu.id)}
                  className="absolute -left-6 top-0 opacity-0 group-hover:opacity-100 text-stone-300 hover:text-red-400 transition-all"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
                <div className="flex items-baseline justify-between">
                  <div className="flex items-baseline gap-1.5">
                    <InlineEdit value={edu.degree} onSave={(v) => updateEducation(edu.id, "degree", v)} className="text-sm font-semibold text-stone-800" placeholder="Degree" />
                    <span className="text-stone-300">·</span>
                    <InlineEdit value={edu.school} onSave={(v) => updateEducation(edu.id, "school", v)} className="text-sm text-stone-500" placeholder="School" />
                  </div>
                  <InlineEdit value={edu.dateRange} onSave={(v) => updateEducation(edu.id, "dateRange", v)} className="text-xs text-stone-400" placeholder="Dates" />
                </div>
              </div>
            ))}
          </div>
          <button onClick={addEducation} className="flex items-center gap-1.5 text-xs text-stone-400 hover:text-[#005149] font-medium mt-4 transition-colors">
            <Plus className="w-3.5 h-3.5" /> Add education
          </button>
        </div>

        {/* Skills */}
        <div className="mb-8">
          <h2 className="text-xs font-semibold text-stone-400 uppercase tracking-wider mb-3">Skills</h2>
          <div className="flex flex-wrap gap-1.5">
            {vault.skills.map((skill, i) => (
              <span key={i} className="inline-flex items-center gap-1 bg-stone-50 text-stone-600 text-sm px-3 py-1 rounded-full group/skill">
                {skill}
                <button
                  onClick={() => updateVault((v) => ({ ...v, skills: v.skills.filter((_, idx) => idx !== i) }))}
                  className="opacity-0 group-hover/skill:opacity-100 text-stone-300 hover:text-red-400 transition-all"
                >
                  ×
                </button>
              </span>
            ))}
            <button
              onClick={() => {
                const skill = prompt("Add a skill:");
                if (skill?.trim()) updateVault((v) => ({ ...v, skills: [...v.skills, skill.trim()] }));
              }}
              className="text-stone-300 hover:text-[#005149] text-sm px-3 py-1 rounded-full border border-dashed border-stone-200 hover:border-[#005149]/30 transition-colors"
            >
              + Add skill
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
