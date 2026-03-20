"use client";

import { useResume } from "@/context/resume-context";
import { defaultStyles } from "@/context/resume-context";
import type { ResumeStyles } from "@/context/resume-context";
import { Palette, RotateCcw } from "lucide-react";

const FONTS = [
  { name: "Inter", label: "Inter", style: "Modern / Clean" },
  { name: "Georgia", label: "Georgia", style: "Classic / Serif" },
  { name: "Garamond", label: "Garamond", style: "Elegant / Traditional" },
  { name: "Helvetica", label: "Helvetica", style: "Swiss / Neutral" },
  { name: "Times New Roman", label: "Times New Roman", style: "Formal / Academic" },
  { name: "Merriweather", label: "Merriweather", style: "Readable / Warm" },
  { name: "Lato", label: "Lato", style: "Friendly / Open" },
  { name: "Roboto", label: "Roboto", style: "Technical / Clean" },
  { name: "Playfair Display", label: "Playfair Display", style: "Premium / Editorial" },
  { name: "Source Sans Pro", label: "Source Sans Pro", style: "Professional / Clear" },
];

const PRESETS: { name: string; desc: string; styles: Partial<ResumeStyles> }[] = [
  {
    name: "Teal Classic",
    desc: "Default Teal brand look",
    styles: { fontFamily: "Inter", headingColor: "#005149", accentColor: "#005149", textColor: "#1c1917", borderStyle: "solid", headerAlign: "left", skillStyle: "pills", fontSize: 12, lineHeight: 1.5, sectionSpacing: 20, nameSize: 1.67, margins: 32 },
  },
  {
    name: "Modern Minimal",
    desc: "Clean, lots of whitespace",
    styles: { fontFamily: "Inter", headingColor: "#18181b", accentColor: "#18181b", textColor: "#3f3f46", borderStyle: "none", headerAlign: "left", skillStyle: "comma", fontSize: 11, lineHeight: 1.6, sectionSpacing: 24, nameSize: 2, margins: 40 },
  },
  {
    name: "Executive",
    desc: "Traditional, serif, formal",
    styles: { fontFamily: "Georgia", headingColor: "#1a365d", accentColor: "#1a365d", textColor: "#1a202c", borderStyle: "double", headerAlign: "center", skillStyle: "tags", fontSize: 12, lineHeight: 1.5, sectionSpacing: 20, nameSize: 1.8, margins: 36 },
  },
  {
    name: "Bold & Creative",
    desc: "Standout design-forward look",
    styles: { fontFamily: "Playfair Display", headingColor: "#7c3aed", accentColor: "#7c3aed", textColor: "#1c1917", borderStyle: "solid", headerAlign: "center", skillStyle: "pills", fontSize: 12, lineHeight: 1.5, sectionSpacing: 22, nameSize: 2.2, margins: 32 },
  },
  {
    name: "Tech",
    desc: "Clean, technical, modern",
    styles: { fontFamily: "Roboto", headingColor: "#0f766e", accentColor: "#0f766e", textColor: "#334155", borderStyle: "solid", headerAlign: "left", skillStyle: "tags", fontSize: 11, lineHeight: 1.5, sectionSpacing: 18, nameSize: 1.67, margins: 32 },
  },
  {
    name: "Elegant",
    desc: "Refined with generous spacing",
    styles: { fontFamily: "Garamond", headingColor: "#44403c", accentColor: "#78716c", textColor: "#292524", borderStyle: "solid", headerAlign: "center", skillStyle: "comma", fontSize: 13, lineHeight: 1.6, sectionSpacing: 24, nameSize: 2, margins: 40 },
  },
];

const COLOR_SWATCHES = [
  "#005149", "#1a365d", "#7c3aed", "#0f766e", "#b91c1c",
  "#18181b", "#44403c", "#1e40af", "#9333ea", "#c2410c",
];

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mb-6">
      <h3 className="text-[11px] font-semibold text-stone-400 uppercase tracking-wider mb-3">{title}</h3>
      {children}
    </div>
  );
}

function ColorPicker({ value, onChange, label }: { value: string; onChange: (v: string) => void; label: string }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-sm text-stone-600">{label}</span>
      <div className="flex items-center gap-1.5">
        {COLOR_SWATCHES.map((c) => (
          <button
            key={c}
            onClick={() => onChange(c)}
            className={`w-5 h-5 rounded-full border-2 transition-all ${
              value === c ? "border-stone-800 scale-110" : "border-transparent hover:scale-105"
            }`}
            style={{ backgroundColor: c }}
          />
        ))}
        <label className="relative ml-1">
          <input
            type="color"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className="absolute inset-0 w-5 h-5 opacity-0 cursor-pointer"
          />
          <div className="w-5 h-5 rounded-full border-2 border-dashed border-stone-300 flex items-center justify-center text-stone-400 text-[10px] cursor-pointer hover:border-stone-400">
            +
          </div>
        </label>
      </div>
    </div>
  );
}

function Slider({ value, onChange, min, max, step, label, unit }: {
  value: number; onChange: (v: number) => void; min: number; max: number; step: number; label: string; unit?: string;
}) {
  return (
    <div>
      <div className="flex items-center justify-between mb-1.5">
        <span className="text-sm text-stone-600">{label}</span>
        <span className="text-xs text-stone-400 font-mono">{value}{unit}</span>
      </div>
      <input
        type="range"
        min={min} max={max} step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full h-1.5 bg-stone-200 rounded-full appearance-none cursor-pointer accent-[#005149]"
      />
    </div>
  );
}

export default function DesignPanel() {
  const { resume, updateResume } = useResume();

  if (!resume) return null;

  const s = { ...defaultStyles, ...resume.styles };

  const updateStyle = (patch: Partial<ResumeStyles>) => {
    updateResume((r) => ({ ...r, styles: { ...(r.styles || defaultStyles), ...patch } }));
  };

  const applyPreset = (preset: Partial<ResumeStyles>) => {
    updateResume((r) => ({ ...r, styles: { ...defaultStyles, ...preset } }));
  };

  return (
    <div className="h-full overflow-y-auto bg-white">
      <div className="max-w-md mx-auto px-6 py-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-lg font-bold text-stone-800 flex items-center gap-2">
              <Palette className="w-5 h-5 text-[#005149]" />
              Design
            </h1>
            <p className="text-xs text-stone-400 mt-0.5">Customize your resume appearance</p>
          </div>
          <button
            onClick={() => applyPreset(defaultStyles)}
            className="flex items-center gap-1.5 text-xs text-stone-400 hover:text-stone-600 transition-colors"
            title="Reset to defaults"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Reset
          </button>
        </div>

        {/* Presets */}
        <Section title="Presets">
          <div className="grid grid-cols-2 gap-2">
            {PRESETS.map((p) => (
              <button
                key={p.name}
                onClick={() => applyPreset(p.styles)}
                className="text-left p-3 rounded-xl border border-stone-200 hover:border-[#005149]/30 hover:bg-stone-50 transition-all group"
              >
                <div className="flex items-center gap-2 mb-1">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: p.styles.headingColor }} />
                  <span className="text-sm font-medium text-stone-700 group-hover:text-stone-900">{p.name}</span>
                </div>
                <p className="text-[11px] text-stone-400">{p.desc}</p>
              </button>
            ))}
          </div>
        </Section>

        {/* Typography */}
        <Section title="Typography">
          <div className="space-y-4">
            {/* Font family */}
            <div>
              <span className="text-sm text-stone-600 block mb-1.5">Font</span>
              <div className="grid grid-cols-2 gap-1.5">
                {FONTS.map((f) => (
                  <button
                    key={f.name}
                    onClick={() => updateStyle({ fontFamily: f.name })}
                    className={`text-left px-3 py-2 rounded-lg border transition-all ${
                      s.fontFamily === f.name
                        ? "border-[#005149] bg-[#005149]/5"
                        : "border-stone-200 hover:border-stone-300"
                    }`}
                  >
                    <span className="text-sm block" style={{ fontFamily: `${f.name}, sans-serif` }}>{f.label}</span>
                    <span className="text-[10px] text-stone-400">{f.style}</span>
                  </button>
                ))}
              </div>
            </div>

            <Slider label="Font Size" value={s.fontSize || 12} onChange={(v) => updateStyle({ fontSize: v })} min={9} max={16} step={0.5} unit="px" />
            <Slider label="Line Height" value={s.lineHeight || 1.5} onChange={(v) => updateStyle({ lineHeight: v })} min={1.1} max={2} step={0.05} />
            <Slider label="Name Size" value={s.nameSize || 1.67} onChange={(v) => updateStyle({ nameSize: v })} min={1.2} max={3} step={0.1} unit="×" />
          </div>
        </Section>

        {/* Colors */}
        <Section title="Colors">
          <div className="space-y-4">
            <ColorPicker label="Headings" value={s.headingColor || "#005149"} onChange={(v) => updateStyle({ headingColor: v })} />
            <ColorPicker label="Body text" value={s.textColor || "#1c1917"} onChange={(v) => updateStyle({ textColor: v })} />
            <ColorPicker label="Accent" value={s.accentColor || "#005149"} onChange={(v) => updateStyle({ accentColor: v })} />
          </div>
        </Section>

        {/* Layout */}
        <Section title="Layout">
          <div className="space-y-4">
            <Slider label="Section Spacing" value={s.sectionSpacing || 20} onChange={(v) => updateStyle({ sectionSpacing: v })} min={10} max={36} step={2} unit="px" />
            <Slider label="Page Margins" value={s.margins || 32} onChange={(v) => updateStyle({ margins: v })} min={16} max={56} step={4} unit="px" />

            {/* Header alignment */}
            <div>
              <span className="text-sm text-stone-600 block mb-1.5">Header Alignment</span>
              <div className="flex gap-2">
                {(["left", "center"] as const).map((align) => (
                  <button
                    key={align}
                    onClick={() => updateStyle({ headerAlign: align })}
                    className={`flex-1 py-2 rounded-lg border text-sm font-medium transition-all ${
                      s.headerAlign === align
                        ? "border-[#005149] bg-[#005149]/5 text-[#005149]"
                        : "border-stone-200 text-stone-500 hover:border-stone-300"
                    }`}
                  >
                    {align === "left" ? "Left" : "Center"}
                  </button>
                ))}
              </div>
            </div>

            {/* Border style */}
            <div>
              <span className="text-sm text-stone-600 block mb-1.5">Section Dividers</span>
              <div className="flex gap-2">
                {([
                  { value: "solid", label: "Solid" },
                  { value: "double", label: "Double" },
                  { value: "none", label: "None" },
                ] as const).map((opt) => (
                  <button
                    key={opt.value}
                    onClick={() => updateStyle({ borderStyle: opt.value })}
                    className={`flex-1 py-2 rounded-lg border text-sm font-medium transition-all ${
                      s.borderStyle === opt.value
                        ? "border-[#005149] bg-[#005149]/5 text-[#005149]"
                        : "border-stone-200 text-stone-500 hover:border-stone-300"
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </Section>

        {/* Skills Style */}
        <Section title="Skills Display">
          <div className="grid grid-cols-2 gap-2">
            {([
              { value: "pills", label: "Pills", preview: "●●●" },
              { value: "tags", label: "Tags", preview: "[ ] [ ]" },
              { value: "comma", label: "Inline", preview: "a, b, c" },
              { value: "bars", label: "Bars", preview: "━━━" },
            ] as const).map((opt) => (
              <button
                key={opt.value}
                onClick={() => updateStyle({ skillStyle: opt.value })}
                className={`py-2.5 px-3 rounded-lg border text-sm transition-all ${
                  s.skillStyle === opt.value
                    ? "border-[#005149] bg-[#005149]/5 text-[#005149] font-medium"
                    : "border-stone-200 text-stone-500 hover:border-stone-300"
                }`}
              >
                <span className="text-[10px] block text-stone-400 mb-0.5">{opt.preview}</span>
                {opt.label}
              </button>
            ))}
          </div>
        </Section>

        {/* Bullet Style */}
        <Section title="Bullet Style">
          <div className="flex gap-2">
            {([
              { value: "disc", label: "•  Bullet" },
              { value: "dash", label: "–  Dash" },
              { value: "arrow", label: "›  Arrow" },
              { value: "none", label: "    None" },
            ] as const).map((opt) => (
              <button
                key={opt.value}
                onClick={() => updateStyle({ bulletStyle: opt.value })}
                className={`flex-1 py-2 rounded-lg border text-sm transition-all font-mono ${
                  s.bulletStyle === opt.value
                    ? "border-[#005149] bg-[#005149]/5 text-[#005149] font-medium"
                    : "border-stone-200 text-stone-500 hover:border-stone-300"
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </Section>
      </div>
    </div>
  );
}
