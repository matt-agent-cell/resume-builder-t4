"use client";

import { useState } from "react";
import { useResume } from "@/context/resume-context";
import { defaultStyles } from "@/context/resume-context";
import type { ResumeStyles } from "@/context/resume-context";
import {
  LayoutGrid, Type, Paintbrush, Settings2, FileText,
  X, RotateCcw, ChevronDown, ChevronRight, Upload, Trash2,
} from "lucide-react";

/* ── Mobile-aware context ── */
import { createContext, useContext } from "react";
const CompactCtx = createContext(false);
const useCompact = () => useContext(CompactCtx);

/* ── Shared Controls ── */

function Slider({ value, onChange, min, max, step, label, unit, showValue = true }: {
  value: number; onChange: (v: number) => void; min: number; max: number; step: number; label: string; unit?: string; showValue?: boolean;
}) {
  const compact = useCompact();
  return (
    <div>
      <div className="flex items-center justify-between mb-1.5">
        <span className={`${compact ? "text-[13px]" : "text-sm"} text-stone-700`}>{label}</span>
        {showValue && <span className={`${compact ? "text-[11px] px-2.5 py-1" : "text-xs px-2 py-0.5"} text-stone-400 font-mono bg-stone-50 rounded`}>{value}{unit}</span>}
      </div>
      <input type="range" min={min} max={max} step={step} value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className={`w-full ${compact ? "h-2" : "h-1.5"} bg-stone-200 rounded-full appearance-none cursor-pointer accent-[#005149]`}
        style={compact ? { WebkitAppearance: "none", height: 8 } : undefined}
      />
    </div>
  );
}

function SegmentedControl<T extends string>({ value, options, onChange }: {
  value: T; options: { value: T; label: string; icon?: React.ReactNode }[]; onChange: (v: T) => void;
}) {
  const compact = useCompact();
  return (
    <div className={`flex gap-1 bg-stone-50 ${compact ? "p-1.5" : "p-1"} rounded-lg`}>
      {options.map((opt) => (
        <button key={opt.value} onClick={() => onChange(opt.value)}
          className={`flex-1 ${compact ? "py-2.5" : "py-2"} rounded-md ${compact ? "text-[13px]" : "text-xs"} font-medium transition-all flex items-center justify-center gap-1.5 ${
            value === opt.value ? "bg-white shadow-sm text-[#005149] border border-stone-200" : "text-stone-500 hover:text-stone-700"
          }`}
        >
          {opt.icon}{opt.label}
        </button>
      ))}
    </div>
  );
}

function Toggle({ value, onChange, label }: { value: boolean; onChange: (v: boolean) => void; label: string }) {
  const compact = useCompact();
  return (
    <div className={`flex items-center justify-between ${compact ? "py-2" : "py-1"}`}>
      <span className={`${compact ? "text-[13px]" : "text-sm"} text-stone-700`}>{label}</span>
      <button onClick={() => onChange(!value)}
        className={`relative ${compact ? "w-11 h-6" : "w-9 h-5"} rounded-full transition-colors ${value ? "bg-[#005149]" : "bg-stone-300"}`}
      >
        <span className={`absolute ${compact ? "top-0.5 w-5 h-5" : "top-0.5 w-4 h-4"} rounded-full bg-white shadow transition-transform ${value ? (compact ? "translate-x-5" : "translate-x-4") : "translate-x-0.5"}`} />
      </button>
    </div>
  );
}

function Select({ value, options, onChange, label }: {
  value: string; options: { value: string; label: string }[]; onChange: (v: string) => void; label: string;
}) {
  const compact = useCompact();
  return (
    <div>
      <span className={`${compact ? "text-[13px]" : "text-sm"} text-stone-700 block mb-1.5`}>{label}</span>
      <select value={value} onChange={(e) => onChange(e.target.value)}
        className={`w-full ${compact ? "px-3 py-3 text-[15px]" : "px-3 py-2 text-sm"} rounded-lg border border-stone-200 bg-white text-stone-700 outline-none focus:border-[#005149]/30`}
      >
        {options.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
      </select>
    </div>
  );
}

function ColorPicker({ value, onChange, label }: { value: string; onChange: (v: string) => void; label: string }) {
  const compact = useCompact();
  const swatches = ["#005149", "#1a365d", "#7c3aed", "#0f766e", "#b91c1c", "#18181b", "#44403c", "#1e40af", "#9333ea", "#c2410c"];
  const size = compact ? "w-9 h-9" : "w-6 h-6";
  return (
    <div>
      <span className={`${compact ? "text-[13px]" : "text-sm"} text-stone-700 block mb-2`}>{label}</span>
      <div className={`flex items-center ${compact ? "gap-2.5" : "gap-1.5"} flex-wrap`}>
        {swatches.map((c) => (
          <button key={c} onClick={() => onChange(c)}
            className={`${size} rounded-full border-2 transition-all ${value === c ? "border-stone-800 scale-110" : "border-transparent hover:scale-105"}`}
            style={{ backgroundColor: c }}
          />
        ))}
        <label className="relative">
          <input type="color" value={value} onChange={(e) => onChange(e.target.value)}
            className={`absolute inset-0 ${size} opacity-0 cursor-pointer`} />
          <div className={`${size} rounded-full border-2 border-dashed border-stone-300 flex items-center justify-center text-stone-400 text-[10px] cursor-pointer hover:border-stone-400`}>+</div>
        </label>
      </div>
    </div>
  );
}

function Subsection({ title, children, defaultOpen = true }: { title: string; children: React.ReactNode; defaultOpen?: boolean }) {
  const compact = useCompact();
  const [open, setOpen] = useState(compact ? false : defaultOpen);
  return (
    <div className="border-b border-stone-100 last:border-0">
      <button onClick={() => setOpen(!open)} className={`w-full flex items-center gap-2 ${compact ? "py-3.5" : "py-3"} text-sm font-medium text-[#005149] hover:text-[#003d38]`}>
        {open ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
        {title}
      </button>
      {open && <div className={`${compact ? "pb-5 space-y-5" : "pb-4 space-y-4"}`}>{children}</div>}
    </div>
  );
}

/* ── Category Sections ── */

const FONTS = [
  { name: "Inter", style: "Modern / Clean" },
  { name: "Georgia", style: "Classic / Serif" },
  { name: "Garamond", style: "Elegant / Traditional" },
  { name: "Helvetica", style: "Swiss / Neutral" },
  { name: "Times New Roman", style: "Formal / Academic" },
  { name: "Merriweather", style: "Readable / Warm" },
  { name: "Lato", style: "Friendly / Open" },
  { name: "Roboto", style: "Technical / Clean" },
  { name: "Playfair Display", style: "Premium / Editorial" },
  { name: "Source Sans Pro", style: "Professional / Clear" },
];

function PhotoUpload({ s, update, setPhoto }: { s: ResumeStyles; update: (p: Partial<ResumeStyles>) => void; setPhoto: (url: string | undefined) => void }) {
  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      setPhoto(reader.result as string);
      update({ showPhoto: true });
    };
    reader.readAsDataURL(file);
  };

  return (
    <Subsection title="Photo" defaultOpen={true}>
      <Toggle label="Show Photo" value={s.showPhoto || false} onChange={(v) => update({ showPhoto: v })} />
      {s.showPhoto && (
        <div className="space-y-3">
          <label className="flex items-center gap-2 px-3 py-2.5 rounded-lg border border-dashed border-stone-300 hover:border-[#005149]/40 cursor-pointer transition-colors">
            <Upload className="w-4 h-4 text-stone-400" />
            <span className="text-sm text-stone-600">Upload photo</span>
            <input type="file" accept="image/*" onChange={handleFile} className="hidden" />
          </label>
          <Slider label="Size" value={s.photoSize || 72} onChange={(v) => update({ photoSize: v })} min={40} max={120} step={4} unit="px" />
          <div>
            <span className="text-sm text-stone-700 block mb-1.5">Shape</span>
            <SegmentedControl value={s.photoShape || "circle"} options={[
              { value: "circle", label: "Circle" },
              { value: "rounded", label: "Rounded" },
              { value: "square", label: "Square" },
            ]} onChange={(v) => update({ photoShape: v })} />
          </div>
          <button onClick={() => { setPhoto(undefined); update({ showPhoto: false }); }}
            className="flex items-center gap-1.5 text-xs text-red-500 hover:text-red-600 transition-colors"
          >
            <Trash2 className="w-3 h-3" /> Remove photo
          </button>
        </div>
      )}
    </Subsection>
  );
}

function StructureSection({ s, update, setPhoto }: { s: ResumeStyles; update: (p: Partial<ResumeStyles>) => void; setPhoto: (url: string | undefined) => void }) {
  return (
    <>
      <PhotoUpload s={s} update={update} setPhoto={setPhoto} />
      <Subsection title="Page Setup">
        <Select label="Paper Size" value="letter" options={[{ value: "letter", label: "Letter (8.5 × 11 in)" }, { value: "a4", label: "A4 (210 × 297 mm)" }]} onChange={() => {}} />
        <SegmentedControl value={String(s.columns || 1)} options={[{ value: "1", label: "One" }, { value: "2", label: "Two" }]} onChange={(v) => update({ columns: Number(v) as 1 | 2 })} />
        <Slider label="Top & Bottom Margins" value={s.marginsY || 28} onChange={(v) => update({ marginsY: v })} min={12} max={56} step={4} unit="px" />
        <Slider label="Left & Right Margins" value={s.marginsX || 32} onChange={(v) => update({ marginsX: v, margins: v })} min={16} max={64} step={4} unit="px" />
      </Subsection>
      <Subsection title="Alignment & Layout">
        <div>
          <span className="text-sm text-stone-700 block mb-1.5">Header Alignment</span>
          <SegmentedControl value={s.headerAlign || "left"} options={[
            { value: "left", label: "Left" }, { value: "center", label: "Center" }, { value: "right", label: "Right" },
          ]} onChange={(v) => update({ headerAlign: v })} />
        </div>
        <div>
          <span className="text-sm text-stone-700 block mb-1.5">Date Alignment</span>
          <SegmentedControl value={s.dateAlign || "right"} options={[
            { value: "left", label: "Left" }, { value: "right", label: "Right" },
          ]} onChange={(v) => update({ dateAlign: v })} />
        </div>
        <Slider label="Section Spacing" value={s.sectionSpacing || 20} onChange={(v) => update({ sectionSpacing: v })} min={8} max={36} step={2} unit="px" />
      </Subsection>
      <Subsection title="Sections" defaultOpen={false}>
        <Toggle label="Show Summary" value={s.showSummary !== false} onChange={(v) => update({ showSummary: v })} />
        <Toggle label="Show Skills" value={s.showSkills !== false} onChange={(v) => update({ showSkills: v })} />
        <Toggle label="Show Education" value={s.showEducation !== false} onChange={(v) => update({ showEducation: v })} />
      </Subsection>
    </>
  );
}

function TypographySection({ s, update }: { s: ResumeStyles; update: (p: Partial<ResumeStyles>) => void }) {
  const compact = useCompact();
  return (
    <>
      <Subsection title="Font Family">
        <div className={`grid ${compact ? "grid-cols-1 gap-1" : "grid-cols-2 gap-1.5"}`}>
          {FONTS.map((f) => (
            <button key={f.name} onClick={() => update({ fontFamily: f.name })}
              className={`text-left ${compact ? "px-4 py-3" : "px-3 py-2"} rounded-lg border transition-all ${
                s.fontFamily === f.name ? "border-[#005149] bg-[#DBF0EA]" : "border-stone-200 hover:border-stone-300"
              }`}
            >
              <span className={`${compact ? "text-[15px]" : "text-sm"} block`} style={{ fontFamily: `${f.name}, serif` }}>{f.name}</span>
              <span className={`${compact ? "text-[11px]" : "text-[10px]"} text-stone-400`}>{f.style}</span>
            </button>
          ))}
        </div>
      </Subsection>
      <Subsection title="Font Sizes">
        <Slider label="Body Text" value={s.fontSize || 12} onChange={(v) => update({ fontSize: v })} min={9} max={16} step={0.5} unit="px" />
        <Slider label="Name Size" value={s.nameSize || 1.67} onChange={(v) => update({ nameSize: v })} min={1.0} max={3.0} step={0.1} unit="×" />
        <Slider label="Section Headings" value={s.headingSize || 1.0} onChange={(v) => update({ headingSize: v })} min={0.8} max={1.5} step={0.05} unit="×" />
        <Slider label="Line Height" value={s.lineHeight || 1.5} onChange={(v) => update({ lineHeight: v })} min={1.0} max={2.0} step={0.05} />
      </Subsection>
      <Subsection title="Heading Style" defaultOpen={false}>
        <SegmentedControl value={s.headingStyle || "uppercase"} options={[
          { value: "uppercase", label: "UPPER" },
          { value: "capitalize", label: "Title" },
          { value: "normal", label: "Normal" },
        ]} onChange={(v) => update({ headingStyle: v })} />
      </Subsection>
    </>
  );
}

function VisualsSection({ s, update }: { s: ResumeStyles; update: (p: Partial<ResumeStyles>) => void }) {
  return (
    <>
      <Subsection title="Colors">
        <ColorPicker label="Headings & Name" value={s.headingColor || "#005149"} onChange={(v) => update({ headingColor: v })} />
        <ColorPicker label="Body Text" value={s.textColor || "#1c1917"} onChange={(v) => update({ textColor: v })} />
        <ColorPicker label="Accent (Skills, Links)" value={s.accentColor || "#005149"} onChange={(v) => update({ accentColor: v })} />
      </Subsection>
      <Subsection title="Dividers">
        <div>
          <span className="text-sm text-stone-700 block mb-1.5">Style</span>
          <SegmentedControl value={s.borderStyle || "solid"} options={[
            { value: "solid", label: "Solid" }, { value: "double", label: "Double" },
            { value: "dotted", label: "Dotted" }, { value: "none", label: "None" },
          ]} onChange={(v) => update({ borderStyle: v })} />
        </div>
        <Slider label="Weight" value={s.dividerWeight || 1} onChange={(v) => update({ dividerWeight: v })} min={0.5} max={3} step={0.5} unit="px" />
      </Subsection>
      <Subsection title="Skills Display">
        <SegmentedControl value={s.skillStyle || "pills"} options={[
          { value: "pills", label: "Pills" }, { value: "tags", label: "Tags" },
          { value: "comma", label: "Inline" }, { value: "bars", label: "Bars" },
        ]} onChange={(v) => update({ skillStyle: v })} />
      </Subsection>
      <Subsection title="Bullet Style">
        <SegmentedControl value={s.bulletStyle || "disc"} options={[
          { value: "disc", label: "•  Bullet" }, { value: "dash", label: "–  Dash" },
          { value: "arrow", label: "›  Arrow" }, { value: "none", label: "None" },
        ]} onChange={(v) => update({ bulletStyle: v })} />
      </Subsection>
    </>
  );
}

function PreferencesSection({ s, update }: { s: ResumeStyles; update: (p: Partial<ResumeStyles>) => void }) {
  return (
    <>
      <Subsection title="Date Format">
        <Select label="Format" value={s.dateFormat || "Mon YYYY"} options={[
          { value: "MM/YYYY", label: "Numbers (MM/YYYY)" },
          { value: "Mon YYYY", label: "Short (Jan 2024)" },
          { value: "Month YYYY", label: "Full (January 2024)" },
          { value: "YYYY", label: "Year only (2024)" },
        ]} onChange={(v) => update({ dateFormat: v as ResumeStyles["dateFormat"] })} />
      </Subsection>
    </>
  );
}

const PRESETS: { name: string; desc: string; styles: Partial<ResumeStyles> }[] = [
  {
    name: "Teal Classic", desc: "Default Teal brand",
    styles: { fontFamily: "Inter", headingColor: "#005149", accentColor: "#005149", textColor: "#1c1917", borderStyle: "solid", headerAlign: "left", skillStyle: "pills", fontSize: 12, lineHeight: 1.5, sectionSpacing: 20, nameSize: 1.67 },
  },
  {
    name: "Modern Minimal", desc: "Clean & spacious",
    styles: { fontFamily: "Inter", headingColor: "#18181b", accentColor: "#18181b", textColor: "#3f3f46", borderStyle: "none", headerAlign: "left", skillStyle: "comma", fontSize: 11, lineHeight: 1.6, sectionSpacing: 24, nameSize: 2.0 },
  },
  {
    name: "Executive", desc: "Traditional & formal",
    styles: { fontFamily: "Georgia", headingColor: "#1a365d", accentColor: "#1a365d", textColor: "#1a202c", borderStyle: "double", headerAlign: "center", skillStyle: "tags", fontSize: 12, lineHeight: 1.5, sectionSpacing: 20, nameSize: 1.8 },
  },
  {
    name: "Bold Creative", desc: "Standout design",
    styles: { fontFamily: "Playfair Display", headingColor: "#7c3aed", accentColor: "#7c3aed", textColor: "#1c1917", borderStyle: "solid", headerAlign: "center", skillStyle: "pills", fontSize: 12, lineHeight: 1.5, sectionSpacing: 22, nameSize: 2.2 },
  },
  {
    name: "Tech", desc: "Clean & technical",
    styles: { fontFamily: "Roboto", headingColor: "#0f766e", accentColor: "#0f766e", textColor: "#334155", borderStyle: "solid", headerAlign: "left", skillStyle: "tags", fontSize: 11, lineHeight: 1.5, sectionSpacing: 18, nameSize: 1.67 },
  },
  {
    name: "Elegant", desc: "Refined & spacious",
    styles: { fontFamily: "Garamond", headingColor: "#44403c", accentColor: "#78716c", textColor: "#292524", borderStyle: "solid", headerAlign: "center", skillStyle: "comma", fontSize: 13, lineHeight: 1.6, sectionSpacing: 24, nameSize: 2.0, headingStyle: "capitalize" },
  },
];

function TemplatesSection({ apply }: { apply: (p: Partial<ResumeStyles>) => void }) {
  return (
    <div className="space-y-2 py-2">
      {PRESETS.map((p) => (
        <button key={p.name} onClick={() => apply(p.styles)}
          className="w-full text-left p-3 rounded-xl border border-stone-200 hover:border-[#005149]/30 hover:bg-stone-50 transition-all group"
        >
          <div className="flex items-center gap-2.5 mb-1">
            <div className="w-4 h-4 rounded-full border-2 border-white shadow" style={{ backgroundColor: p.styles.headingColor }} />
            <span className="text-sm font-medium text-stone-700 group-hover:text-stone-900">{p.name}</span>
            <span className="text-[11px] text-stone-400 ml-auto" style={{ fontFamily: p.styles.fontFamily }}>{p.styles.fontFamily}</span>
          </div>
          <p className="text-xs text-stone-400 ml-[26px]">{p.desc}</p>
        </button>
      ))}
    </div>
  );
}

/* ── Category Nav ── */

const CATEGORIES = [
  { id: "structure", label: "Structure", icon: LayoutGrid },
  { id: "typography", label: "Typography", icon: Type },
  { id: "visuals", label: "Visuals", icon: Paintbrush },
  { id: "preferences", label: "Preferences", icon: Settings2 },
  { id: "templates", label: "Templates", icon: FileText },
] as const;

type CategoryId = typeof CATEGORIES[number]["id"];

/* ── Main Panel ── */

export default function DesignPanel({ onClose, compact }: { onClose?: () => void; compact?: boolean }) {
  const { resume, updateResume } = useResume();
  const [activeCategory, setActiveCategory] = useState<CategoryId>("structure");

  if (!resume) return null;

  const s = { ...defaultStyles, ...resume.styles };

  const update = (patch: Partial<ResumeStyles>) => {
    updateResume((r) => ({ ...r, styles: { ...(r.styles || defaultStyles), ...patch } }));
  };

  const setPhoto = (url: string | undefined) => {
    updateResume((r) => ({ ...r, contact: { ...r.contact, photo: url } }));
  };

  const applyPreset = (preset: Partial<ResumeStyles>) => {
    updateResume((r) => ({ ...r, styles: { ...defaultStyles, ...preset } }));
  };

  if (compact) {
    return (
      <CompactCtx.Provider value={true}>
        <div className="h-full flex flex-col bg-white">
          {/* Scrollable controls area */}
          <div className="flex-1 overflow-y-auto">
            {activeCategory === "structure" && (
              <div className="px-4 py-3 space-y-4">
                {/* Photo toggle */}
                <div className="flex items-center justify-between py-1">
                  <span className="text-[13px] text-stone-700 font-medium">Photo</span>
                  <button onClick={() => update({ showPhoto: !(s.showPhoto || false) })}
                    className={`relative w-11 h-6 rounded-full transition-colors ${s.showPhoto ? "bg-[#005149]" : "bg-stone-300"}`}>
                    <span className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform ${s.showPhoto ? "translate-x-5" : "translate-x-0.5"}`} />
                  </button>
                </div>
                {/* Columns */}
                <div>
                  <span className="text-[13px] text-stone-700 font-medium block mb-2">Columns</span>
                  <div className="flex gap-2">
                    {[1, 2].map(n => (
                      <button key={n} onClick={() => update({ columns: n as 1 | 2 })}
                        className={`flex-1 py-3 rounded-xl border-2 text-sm font-medium transition-all ${
                          (s.columns || 1) === n ? "border-[#005149] bg-[#DBF0EA] text-[#005149]" : "border-stone-200 text-stone-500"
                        }`}>
                        {n === 1 ? "Single" : "Two"}
                      </button>
                    ))}
                  </div>
                </div>
                {/* Header alignment */}
                <div>
                  <span className="text-[13px] text-stone-700 font-medium block mb-2">Header</span>
                  <div className="flex gap-2">
                    {(["left", "center", "right"] as const).map(a => (
                      <button key={a} onClick={() => update({ headerAlign: a })}
                        className={`flex-1 py-2.5 rounded-xl border-2 text-xs font-medium capitalize transition-all ${
                          (s.headerAlign || "left") === a ? "border-[#005149] bg-[#DBF0EA] text-[#005149]" : "border-stone-200 text-stone-500"
                        }`}>
                        {a}
                      </button>
                    ))}
                  </div>
                </div>
                {/* Margins */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[13px] text-stone-700 font-medium">Margins</span>
                    <span className="text-[11px] text-stone-400 font-mono">{s.marginsX || 32}px</span>
                  </div>
                  <input type="range" min={16} max={64} step={4} value={s.marginsX || 32}
                    onChange={(e) => update({ marginsX: Number(e.target.value), margins: Number(e.target.value) })}
                    className="w-full h-2 bg-stone-200 rounded-full appearance-none accent-[#005149]" />
                </div>
                {/* Spacing */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[13px] text-stone-700 font-medium">Section Spacing</span>
                    <span className="text-[11px] text-stone-400 font-mono">{s.sectionSpacing || 20}px</span>
                  </div>
                  <input type="range" min={8} max={36} step={2} value={s.sectionSpacing || 20}
                    onChange={(e) => update({ sectionSpacing: Number(e.target.value) })}
                    className="w-full h-2 bg-stone-200 rounded-full appearance-none accent-[#005149]" />
                </div>
                {/* Section toggles */}
                <div className="space-y-1">
                  {([["showSummary", "Summary"], ["showSkills", "Skills"], ["showEducation", "Education"]] as const).map(([key, label]) => {
                    const isOn = s[key] !== false;
                    return (
                      <div key={key} className="flex items-center justify-between py-2">
                        <span className="text-[13px] text-stone-600">{label}</span>
                        <button onClick={() => update({ [key]: !isOn } as Partial<ResumeStyles>)}
                          className={`relative w-11 h-6 rounded-full transition-colors ${isOn ? "bg-[#005149]" : "bg-stone-300"}`}>
                          <span className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform ${isOn ? "translate-x-5" : "translate-x-0.5"}`} />
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {activeCategory === "typography" && (
              <div className="py-3 space-y-4">
                {/* Font carousel */}
                <div>
                  <span className="text-[13px] text-stone-700 font-medium block mb-2 px-4">Font</span>
                  <div className="flex gap-2 overflow-x-auto no-scrollbar px-4 pb-1">
                    {FONTS.map((f) => (
                      <button key={f.name} onClick={() => update({ fontFamily: f.name })}
                        className={`shrink-0 w-24 py-3 rounded-xl border-2 text-center transition-all ${
                          s.fontFamily === f.name ? "border-[#005149] bg-[#DBF0EA]" : "border-stone-200"
                        }`}>
                        <span className="text-[15px] block leading-tight" style={{ fontFamily: `${f.name}, serif` }}>{f.name.split(" ")[0]}</span>
                        <span className="text-[10px] text-stone-400 mt-0.5 block">{f.style.split("/")[0].trim()}</span>
                      </button>
                    ))}
                  </div>
                </div>
                {/* Size sliders */}
                <div className="px-4 space-y-4">
                  {([
                    ["fontSize", "Body Size", 9, 16, 0.5, "px"],
                    ["nameSize", "Name Size", 1.0, 3.0, 0.1, "×"],
                    ["lineHeight", "Line Height", 1.0, 2.0, 0.05, ""],
                  ] as const).map(([key, label, min, max, step, unit]) => (
                    <div key={key}>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-[13px] text-stone-700 font-medium">{label}</span>
                        <span className="text-[11px] text-stone-400 font-mono">{s[key] || min}{unit}</span>
                      </div>
                      <input type="range" min={min} max={max} step={step} value={s[key] || min}
                        onChange={(e) => update({ [key]: Number(e.target.value) } as Partial<ResumeStyles>)}
                        className="w-full h-2 bg-stone-200 rounded-full appearance-none accent-[#005149]" />
                    </div>
                  ))}
                </div>
                {/* Heading style */}
                <div className="px-4">
                  <span className="text-[13px] text-stone-700 font-medium block mb-2">Heading Style</span>
                  <div className="flex gap-2">
                    {([["uppercase", "UPPER"], ["capitalize", "Title"], ["normal", "Normal"]] as const).map(([val, label]) => (
                      <button key={val} onClick={() => update({ headingStyle: val })}
                        className={`flex-1 py-2.5 rounded-xl border-2 text-xs font-medium transition-all ${
                          (s.headingStyle || "uppercase") === val ? "border-[#005149] bg-[#DBF0EA] text-[#005149]" : "border-stone-200 text-stone-500"
                        }`}>
                        {label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {activeCategory === "visuals" && (
              <div className="py-3 space-y-5">
                {/* Color pickers */}
                {([
                  ["headingColor", "Heading Color"],
                  ["accentColor", "Accent Color"],
                ] as const).map(([key, label]) => (
                  <div key={key} className="px-4">
                    <span className="text-[13px] text-stone-700 font-medium block mb-2.5">{label}</span>
                    <div className="flex gap-3 overflow-x-auto no-scrollbar pb-1">
                      {["#005149", "#1a365d", "#7c3aed", "#0f766e", "#b91c1c", "#18181b", "#44403c", "#1e40af", "#9333ea", "#c2410c"].map((c) => (
                        <button key={c} onClick={() => update({ [key]: c } as Partial<ResumeStyles>)}
                          className={`shrink-0 w-10 h-10 rounded-full border-3 transition-all ${
                            s[key] === c ? "border-stone-800 scale-110 shadow-md" : "border-transparent"
                          }`} style={{ backgroundColor: c }} />
                      ))}
                    </div>
                  </div>
                ))}
                {/* Divider style */}
                <div className="px-4">
                  <span className="text-[13px] text-stone-700 font-medium block mb-2">Dividers</span>
                  <div className="flex gap-2">
                    {(["solid", "double", "dotted", "none"] as const).map(v => (
                      <button key={v} onClick={() => update({ borderStyle: v })}
                        className={`flex-1 py-2.5 rounded-xl border-2 text-xs font-medium capitalize transition-all ${
                          (s.borderStyle || "solid") === v ? "border-[#005149] bg-[#DBF0EA] text-[#005149]" : "border-stone-200 text-stone-500"
                        }`}>
                        {v}
                      </button>
                    ))}
                  </div>
                </div>
                {/* Skills style */}
                <div className="px-4">
                  <span className="text-[13px] text-stone-700 font-medium block mb-2">Skills Display</span>
                  <div className="flex gap-2">
                    {([["pills", "Pills"], ["tags", "Tags"], ["comma", "Inline"], ["bars", "Bars"]] as const).map(([v, l]) => (
                      <button key={v} onClick={() => update({ skillStyle: v })}
                        className={`flex-1 py-2.5 rounded-xl border-2 text-xs font-medium transition-all ${
                          (s.skillStyle || "pills") === v ? "border-[#005149] bg-[#DBF0EA] text-[#005149]" : "border-stone-200 text-stone-500"
                        }`}>
                        {l}
                      </button>
                    ))}
                  </div>
                </div>
                {/* Bullet style */}
                <div className="px-4">
                  <span className="text-[13px] text-stone-700 font-medium block mb-2">Bullets</span>
                  <div className="flex gap-2">
                    {([["disc", "•"], ["dash", "–"], ["arrow", "›"], ["none", "—"]] as const).map(([v, sym]) => (
                      <button key={v} onClick={() => update({ bulletStyle: v })}
                        className={`flex-1 py-3 rounded-xl border-2 text-lg transition-all ${
                          (s.bulletStyle || "disc") === v ? "border-[#005149] bg-[#DBF0EA] text-[#005149]" : "border-stone-200 text-stone-400"
                        }`}>
                        {sym}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {activeCategory === "preferences" && (
              <div className="px-4 py-3 space-y-4">
                <div>
                  <span className="text-[13px] text-stone-700 font-medium block mb-2">Date Format</span>
                  <div className="space-y-1.5">
                    {([["MM/YYYY", "01/2024"], ["Mon YYYY", "Jan 2024"], ["Month YYYY", "January 2024"], ["YYYY", "2024"]] as const).map(([v, preview]) => (
                      <button key={v} onClick={() => update({ dateFormat: v as ResumeStyles["dateFormat"] })}
                        className={`w-full flex items-center justify-between px-4 py-3 rounded-xl border-2 transition-all ${
                          (s.dateFormat || "Mon YYYY") === v ? "border-[#005149] bg-[#DBF0EA]" : "border-stone-200"
                        }`}>
                        <span className="text-sm text-stone-700">{preview}</span>
                        {(s.dateFormat || "Mon YYYY") === v && <div className="w-5 h-5 rounded-full bg-[#005149] flex items-center justify-center"><svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M2.5 6L5 8.5L9.5 3.5" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg></div>}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {activeCategory === "templates" && (
              <div className="py-3">
                <div className="flex gap-3 overflow-x-auto no-scrollbar px-4 pb-2">
                  {PRESETS.map((p) => (
                    <button key={p.name} onClick={() => applyPreset(p.styles)}
                      className="shrink-0 w-36 rounded-xl border-2 border-stone-200 hover:border-[#005149]/40 overflow-hidden transition-all text-left">
                      {/* Mini preview */}
                      <div className="h-20 p-3 flex flex-col gap-1" style={{ fontFamily: p.styles.fontFamily }}>
                        <div className="h-2 w-16 rounded-full" style={{ backgroundColor: p.styles.headingColor }} />
                        <div className="h-1.5 w-full rounded-full bg-stone-200" />
                        <div className="h-1.5 w-20 rounded-full bg-stone-200" />
                        <div className="h-1.5 w-12 rounded-full mt-1" style={{ backgroundColor: p.styles.headingColor, opacity: 0.4 }} />
                        <div className="h-1.5 w-full rounded-full bg-stone-100" />
                      </div>
                      <div className="px-3 py-2 border-t border-stone-100">
                        <span className="text-xs font-semibold text-stone-700 block">{p.name}</span>
                        <span className="text-[10px] text-stone-400">{p.desc}</span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Fixed bottom tab bar */}
          <div className="shrink-0 border-t border-stone-200 bg-white px-2 py-2 flex items-center justify-around safe-area-bottom">
            {CATEGORIES.map((cat) => {
              const Icon = cat.icon;
              const active = activeCategory === cat.id;
              return (
                <button key={cat.id} onClick={() => setActiveCategory(cat.id)}
                  className={`flex flex-col items-center gap-0.5 px-3 py-1 rounded-lg transition-all ${
                    active ? "text-[#005149]" : "text-stone-400"
                  }`}>
                  <Icon className={`w-5 h-5 ${active ? "stroke-[2.5]" : ""}`} />
                  <span className="text-[10px] font-medium">{cat.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      </CompactCtx.Provider>
    );
  }

  return (
    <div className="h-full flex flex-col bg-white">
      {/* Header */}
      <div className="shrink-0 px-4 py-3 border-b border-stone-200 flex items-center justify-between">
        <span className="text-sm font-semibold text-stone-700">Design Settings</span>
        <div className="flex items-center gap-1.5">
          <button onClick={() => applyPreset(defaultStyles)}
            className="flex items-center gap-1 text-xs text-stone-400 hover:text-stone-600 transition-colors px-2 py-1 rounded-md hover:bg-stone-50"
          >
            <RotateCcw className="w-3 h-3" /> Reset
          </button>
          {onClose && (
            <button onClick={onClose}
              className="w-7 h-7 flex items-center justify-center rounded-lg text-stone-400 hover:text-stone-600 hover:bg-stone-100 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Two-panel layout */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left: category nav */}
        <div className="w-[60px] md:w-[180px] shrink-0 border-r border-stone-100 py-2 px-1 md:px-2">
          {CATEGORIES.map((cat) => {
            const Icon = cat.icon;
            const active = activeCategory === cat.id;
            return (
              <button key={cat.id} onClick={() => setActiveCategory(cat.id)}
                className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm transition-all mb-0.5 ${
                  active ? "bg-[#DBF0EA] text-[#005149] font-medium" : "text-stone-600 hover:bg-stone-50"
                }`}
              >
                <Icon className="w-4 h-4 shrink-0" />
                <span className="hidden md:inline">{cat.label}</span>
                <ChevronRight className={`w-3 h-3 ml-auto hidden md:block ${active ? "text-[#005149]" : "text-stone-300"}`} />
              </button>
            );
          })}
        </div>

        {/* Right: controls */}
        <div className="flex-1 overflow-y-auto px-5 py-3">
          {activeCategory === "structure" && <StructureSection s={s} update={update} setPhoto={setPhoto} />}
          {activeCategory === "typography" && <TypographySection s={s} update={update} />}
          {activeCategory === "visuals" && <VisualsSection s={s} update={update} />}
          {activeCategory === "preferences" && <PreferencesSection s={s} update={update} />}
          {activeCategory === "templates" && <TemplatesSection apply={applyPreset} />}
        </div>
      </div>
    </div>
  );
}
