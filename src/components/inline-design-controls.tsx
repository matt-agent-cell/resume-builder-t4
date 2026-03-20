"use client";

import { useResume } from "@/context/resume-context";
import { defaultStyles } from "@/context/resume-context";
import type { ResumeStyles } from "@/context/resume-context";

/* ── Shared mini controls ── */

function MiniSlider({ value, onChange, min, max, step, label, unit }: {
  value: number; onChange: (v: number) => void; min: number; max: number; step: number; label: string; unit?: string;
}) {
  return (
    <div className="flex items-center gap-3">
      <span className="text-xs text-stone-600 w-28 shrink-0">{label}</span>
      <input type="range" min={min} max={max} step={step} value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="flex-1 h-1.5 bg-stone-200 rounded-full appearance-none cursor-pointer accent-[#005149]"
      />
      <span className="text-xs text-stone-400 font-mono w-12 text-right">{value}{unit}</span>
    </div>
  );
}

function MiniSegmented<T extends string>({ value, options, onChange }: {
  value: T; options: { value: T; label: string }[]; onChange: (v: T) => void;
}) {
  return (
    <div className="flex gap-1 bg-stone-50 p-0.5 rounded-lg">
      {options.map((opt) => (
        <button key={opt.value} onClick={() => onChange(opt.value)}
          className={`flex-1 py-1.5 rounded-md text-xs font-medium transition-all ${
            value === opt.value ? "bg-white shadow-sm text-[#005149]" : "text-stone-500 hover:text-stone-700"
          }`}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
}

function MiniColorPicker({ value, onChange, label }: { value: string; onChange: (v: string) => void; label: string }) {
  const swatches = ["#005149", "#1a365d", "#7c3aed", "#0f766e", "#b91c1c", "#18181b", "#44403c", "#1e40af"];
  return (
    <div>
      <span className="text-xs text-stone-600 block mb-1.5">{label}</span>
      <div className="flex items-center gap-1.5">
        {swatches.map((c) => (
          <button key={c} onClick={() => onChange(c)}
            className={`w-5 h-5 rounded-full border-2 transition-all ${value === c ? "border-stone-800 scale-110" : "border-transparent hover:scale-105"}`}
            style={{ backgroundColor: c }} />
        ))}
        <label className="relative">
          <input type="color" value={value} onChange={(e) => onChange(e.target.value)}
            className="absolute inset-0 w-5 h-5 opacity-0 cursor-pointer" />
          <div className="w-5 h-5 rounded-full border-2 border-dashed border-stone-300 text-[10px] text-stone-400 flex items-center justify-center cursor-pointer">+</div>
        </label>
      </div>
    </div>
  );
}

/* ── Design Widget Definitions ── */

const WIDGETS: Record<string, {
  title: string;
  render: (s: ResumeStyles, update: (p: Partial<ResumeStyles>) => void) => React.ReactNode;
}> = {
  margins: {
    title: "Page Margins",
    render: (s, update) => (
      <div className="space-y-3">
        <MiniSlider label="Left & Right" value={s.marginsX || s.margins || 32} onChange={(v) => update({ marginsX: v, margins: v })} min={16} max={64} step={4} unit="px" />
        <MiniSlider label="Top & Bottom" value={s.marginsY || 28} onChange={(v) => update({ marginsY: v })} min={12} max={56} step={4} unit="px" />
      </div>
    ),
  },
  fonts: {
    title: "Font",
    render: (s, update) => {
      const fonts = ["Inter", "Georgia", "Garamond", "Helvetica", "Times New Roman", "Merriweather", "Lato", "Roboto", "Playfair Display"];
      return (
        <div className="grid grid-cols-3 gap-1.5">
          {fonts.map((f) => (
            <button key={f} onClick={() => update({ fontFamily: f })}
              className={`px-2 py-1.5 rounded-md border text-xs transition-all ${
                s.fontFamily === f ? "border-[#005149] bg-[#DBF0EA] text-[#005149]" : "border-stone-200 text-stone-600 hover:border-stone-300"
              }`} style={{ fontFamily: `${f}, serif` }}>{f}</button>
          ))}
        </div>
      );
    },
  },
  fontSize: {
    title: "Font Size",
    render: (s, update) => (
      <div className="space-y-3">
        <MiniSlider label="Body text" value={s.fontSize || 12} onChange={(v) => update({ fontSize: v })} min={9} max={16} step={0.5} unit="px" />
        <MiniSlider label="Name" value={s.nameSize || 1.67} onChange={(v) => update({ nameSize: v })} min={1.0} max={3.0} step={0.1} unit="×" />
        <MiniSlider label="Line height" value={s.lineHeight || 1.5} onChange={(v) => update({ lineHeight: v })} min={1.0} max={2.0} step={0.05} />
      </div>
    ),
  },
  colors: {
    title: "Colors",
    render: (s, update) => (
      <div className="space-y-3">
        <MiniColorPicker label="Headings & Name" value={s.headingColor || "#005149"} onChange={(v) => update({ headingColor: v })} />
        <MiniColorPicker label="Body text" value={s.textColor || "#1c1917"} onChange={(v) => update({ textColor: v })} />
        <MiniColorPicker label="Accent" value={s.accentColor || "#005149"} onChange={(v) => update({ accentColor: v })} />
      </div>
    ),
  },
  spacing: {
    title: "Spacing",
    render: (s, update) => (
      <div className="space-y-3">
        <MiniSlider label="Section gap" value={s.sectionSpacing || 20} onChange={(v) => update({ sectionSpacing: v })} min={8} max={36} step={2} unit="px" />
        <MiniSlider label="Line height" value={s.lineHeight || 1.5} onChange={(v) => update({ lineHeight: v })} min={1.0} max={2.0} step={0.05} />
      </div>
    ),
  },
  alignment: {
    title: "Alignment",
    render: (s, update) => (
      <div className="space-y-3">
        <div>
          <span className="text-xs text-stone-600 block mb-1.5">Header</span>
          <MiniSegmented value={s.headerAlign || "left"} options={[
            { value: "left", label: "Left" }, { value: "center", label: "Center" }, { value: "right", label: "Right" },
          ]} onChange={(v) => update({ headerAlign: v })} />
        </div>
        <div>
          <span className="text-xs text-stone-600 block mb-1.5">Dates</span>
          <MiniSegmented value={s.dateAlign || "right"} options={[
            { value: "left", label: "Left" }, { value: "right", label: "Right" },
          ]} onChange={(v) => update({ dateAlign: v })} />
        </div>
      </div>
    ),
  },
  dividers: {
    title: "Dividers",
    render: (s, update) => (
      <div className="space-y-3">
        <MiniSegmented value={s.borderStyle || "solid"} options={[
          { value: "solid", label: "Solid" }, { value: "double", label: "Double" },
          { value: "dotted", label: "Dotted" }, { value: "none", label: "None" },
        ]} onChange={(v) => update({ borderStyle: v })} />
        <MiniSlider label="Weight" value={s.dividerWeight || 1} onChange={(v) => update({ dividerWeight: v })} min={0.5} max={3} step={0.5} unit="px" />
      </div>
    ),
  },
  skills: {
    title: "Skills Display",
    render: (s, update) => (
      <MiniSegmented value={s.skillStyle || "pills"} options={[
        { value: "pills", label: "Pills" }, { value: "tags", label: "Tags" },
        { value: "comma", label: "Inline" }, { value: "bars", label: "Bars" },
      ]} onChange={(v) => update({ skillStyle: v })} />
    ),
  },
  bullets: {
    title: "Bullet Style",
    render: (s, update) => (
      <MiniSegmented value={s.bulletStyle || "disc"} options={[
        { value: "disc", label: "• Bullet" }, { value: "dash", label: "– Dash" },
        { value: "arrow", label: "› Arrow" }, { value: "none", label: "None" },
      ]} onChange={(v) => update({ bulletStyle: v })} />
    ),
  },
  columns: {
    title: "Columns",
    render: (s, update) => (
      <MiniSegmented value={String(s.columns || 1)} options={[
        { value: "1", label: "One column" }, { value: "2", label: "Two columns" },
      ]} onChange={(v) => update({ columns: Number(v) as 1 | 2 })} />
    ),
  },
};

/* ── Main inline widget renderer ── */

export function InlineDesignWidget({ widgetId }: { widgetId: string }) {
  const { resume, updateResume } = useResume();
  if (!resume) return null;

  const widget = WIDGETS[widgetId];
  if (!widget) return null;

  const s = { ...defaultStyles, ...resume.styles };
  const update = (patch: Partial<ResumeStyles>) => {
    updateResume((r) => ({ ...r, styles: { ...(r.styles || defaultStyles), ...patch } }));
  };

  return (
    <div className="my-3 p-4 rounded-xl border border-stone-200 bg-stone-50/50">
      <p className="text-xs font-semibold text-stone-500 uppercase tracking-wider mb-3">{widget.title}</p>
      {widget.render(s, update)}
    </div>
  );
}

/* ── Parser: extract widget tags from text ── */

export function parseDesignWidgets(text: string): { parts: { type: "text" | "widget"; content: string }[] } {
  const parts: { type: "text" | "widget"; content: string }[] = [];
  const regex = /\{\{design:(\w+)\}\}/g;
  let lastIndex = 0;
  let match;

  while ((match = regex.exec(text)) !== null) {
    if (match.index > lastIndex) {
      parts.push({ type: "text", content: text.slice(lastIndex, match.index) });
    }
    parts.push({ type: "widget", content: match[1] });
    lastIndex = match.index + match[0].length;
  }
  if (lastIndex < text.length) {
    parts.push({ type: "text", content: text.slice(lastIndex) });
  }

  return { parts: parts.length ? parts : [{ type: "text", content: text }] };
}
