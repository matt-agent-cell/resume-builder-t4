"use client";

import { useState } from "react";
import { useResume } from "@/context/resume-context";
import { defaultStyles } from "@/context/resume-context";
import type { ResumeStyles } from "@/context/resume-context";
import {
  LayoutGrid, Type, Paintbrush, Settings2, FileText,
  X, RotateCcw, ChevronDown, ChevronRight, Upload, Trash2,
} from "lucide-react";

/* ── Shared Controls ── */

function Slider({ value, onChange, min, max, step, label, unit, showValue = true }: {
  value: number; onChange: (v: number) => void; min: number; max: number; step: number; label: string; unit?: string; showValue?: boolean;
}) {
  return (
    <div>
      <div className="flex items-center justify-between mb-1.5">
        <span className="text-sm text-stone-700">{label}</span>
        {showValue && <span className="text-xs text-stone-400 font-mono bg-stone-50 px-2 py-0.5 rounded">{value}{unit}</span>}
      </div>
      <input type="range" min={min} max={max} step={step} value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full h-1.5 bg-stone-200 rounded-full appearance-none cursor-pointer accent-[#005149]"
      />
    </div>
  );
}

function SegmentedControl<T extends string>({ value, options, onChange }: {
  value: T; options: { value: T; label: string; icon?: React.ReactNode }[]; onChange: (v: T) => void;
}) {
  return (
    <div className="flex gap-1 bg-stone-50 p-1 rounded-lg">
      {options.map((opt) => (
        <button key={opt.value} onClick={() => onChange(opt.value)}
          className={`flex-1 py-2 rounded-md text-xs font-medium transition-all flex items-center justify-center gap-1.5 ${
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
  return (
    <div className="flex items-center justify-between py-1">
      <span className="text-sm text-stone-700">{label}</span>
      <button onClick={() => onChange(!value)}
        className={`relative w-9 h-5 rounded-full transition-colors ${value ? "bg-[#005149]" : "bg-stone-300"}`}
      >
        <span className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform ${value ? "translate-x-4" : "translate-x-0.5"}`} />
      </button>
    </div>
  );
}

function Select({ value, options, onChange, label }: {
  value: string; options: { value: string; label: string }[]; onChange: (v: string) => void; label: string;
}) {
  return (
    <div>
      <span className="text-sm text-stone-700 block mb-1.5">{label}</span>
      <select value={value} onChange={(e) => onChange(e.target.value)}
        className="w-full px-3 py-2 rounded-lg border border-stone-200 bg-white text-sm text-stone-700 outline-none focus:border-[#005149]/30"
      >
        {options.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
      </select>
    </div>
  );
}

function ColorPicker({ value, onChange, label }: { value: string; onChange: (v: string) => void; label: string }) {
  const swatches = ["#005149", "#1a365d", "#7c3aed", "#0f766e", "#b91c1c", "#18181b", "#44403c", "#1e40af", "#9333ea", "#c2410c"];
  return (
    <div>
      <span className="text-sm text-stone-700 block mb-2">{label}</span>
      <div className="flex items-center gap-1.5 flex-wrap">
        {swatches.map((c) => (
          <button key={c} onClick={() => onChange(c)}
            className={`w-6 h-6 rounded-full border-2 transition-all ${value === c ? "border-stone-800 scale-110" : "border-transparent hover:scale-105"}`}
            style={{ backgroundColor: c }}
          />
        ))}
        <label className="relative">
          <input type="color" value={value} onChange={(e) => onChange(e.target.value)}
            className="absolute inset-0 w-6 h-6 opacity-0 cursor-pointer" />
          <div className="w-6 h-6 rounded-full border-2 border-dashed border-stone-300 flex items-center justify-center text-stone-400 text-[10px] cursor-pointer hover:border-stone-400">+</div>
        </label>
        <span className="text-xs text-stone-400 font-mono ml-1">{value}</span>
      </div>
    </div>
  );
}

function Subsection({ title, children, defaultOpen = true }: { title: string; children: React.ReactNode; defaultOpen?: boolean }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="border-b border-stone-100 last:border-0">
      <button onClick={() => setOpen(!open)} className="w-full flex items-center gap-2 py-3 text-sm font-medium text-[#005149] hover:text-[#003d38]">
        {open ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
        {title}
      </button>
      {open && <div className="pb-4 space-y-4">{children}</div>}
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
  return (
    <>
      <Subsection title="Font Family">
        <div className="grid grid-cols-2 gap-1.5">
          {FONTS.map((f) => (
            <button key={f.name} onClick={() => update({ fontFamily: f.name })}
              className={`text-left px-3 py-2 rounded-lg border transition-all ${
                s.fontFamily === f.name ? "border-[#005149] bg-[#DBF0EA]" : "border-stone-200 hover:border-stone-300"
              }`}
            >
              <span className="text-sm block" style={{ fontFamily: `${f.name}, serif` }}>{f.name}</span>
              <span className="text-[10px] text-stone-400">{f.style}</span>
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
    // Mobile: horizontal category tabs + scrollable controls (Instagram-style bottom tray)
    return (
      <div className="h-full flex flex-col bg-white">
        {/* Horizontal category tabs */}
        <div className="shrink-0 flex items-center gap-1 px-3 py-2 border-b border-stone-100 overflow-x-auto no-scrollbar">
          {CATEGORIES.map((cat) => {
            const Icon = cat.icon;
            const active = activeCategory === cat.id;
            return (
              <button key={cat.id} onClick={() => setActiveCategory(cat.id)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all ${
                  active ? "bg-[#DBF0EA] text-[#005149]" : "text-stone-500 hover:bg-stone-50"
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                {cat.label}
              </button>
            );
          })}
          <button onClick={() => applyPreset(defaultStyles)}
            className="flex items-center gap-1 px-3 py-1.5 rounded-full text-xs text-stone-400 hover:text-stone-600 whitespace-nowrap ml-auto"
          >
            <RotateCcw className="w-3 h-3" /> Reset
          </button>
        </div>
        {/* Controls */}
        <div className="flex-1 overflow-y-auto px-4 py-3">
          {activeCategory === "structure" && <StructureSection s={s} update={update} setPhoto={setPhoto} />}
          {activeCategory === "typography" && <TypographySection s={s} update={update} />}
          {activeCategory === "visuals" && <VisualsSection s={s} update={update} />}
          {activeCategory === "preferences" && <PreferencesSection s={s} update={update} />}
          {activeCategory === "templates" && <TemplatesSection apply={applyPreset} />}
        </div>
      </div>
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
