"use client";

import { useResume } from "@/context/resume-context";
import type { MatchItem } from "@/context/resume-context";
import { X, CheckCircle2, Circle, FileText, ChevronDown, ChevronRight } from "lucide-react";
import { useState } from "react";

function ScoreRing({ score, size = 80, strokeWidth = 6 }: { score: number; size?: number; strokeWidth?: number }) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;
  const color = score >= 70 ? "#005149" : score >= 40 ? "#d97706" : "#dc2626";

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg className="-rotate-90" width={size} height={size}>
        <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke="#f5f5f4" strokeWidth={strokeWidth} />
        <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke={color} strokeWidth={strokeWidth}
          strokeLinecap="round" strokeDasharray={circumference} strokeDashoffset={offset}
          className="transition-all duration-1000" />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-2xl font-bold" style={{ color }}>{score}</span>
        <span className="text-[10px] text-stone-400 -mt-0.5">/ 100</span>
      </div>
    </div>
  );
}

function CategoryBar({ label, percent }: { label: string; percent: number }) {
  const color = percent >= 70 ? "#005149" : percent >= 40 ? "#d97706" : "#dc2626";
  return (
    <div className="flex items-center gap-3">
      <span className="text-xs text-stone-500 w-28 shrink-0">{label}</span>
      <div className="flex-1 h-2 bg-stone-100 rounded-full overflow-hidden">
        <div className="h-full rounded-full transition-all duration-700" style={{ width: `${percent}%`, backgroundColor: color }} />
      </div>
      <span className="text-xs font-semibold w-10 text-right" style={{ color }}>{percent}%</span>
    </div>
  );
}

function MatchSection({ title, items, defaultOpen = true }: { title: string; items: MatchItem[]; defaultOpen?: boolean }) {
  const [open, setOpen] = useState(defaultOpen);
  const covered = items.filter((i) => i.covered).length;

  return (
    <div>
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between py-2 group"
      >
        <div className="flex items-center gap-2">
          {open ? <ChevronDown className="w-3.5 h-3.5 text-stone-400" /> : <ChevronRight className="w-3.5 h-3.5 text-stone-400" />}
          <h3 className="text-xs font-semibold text-stone-700 uppercase tracking-wider">{title}</h3>
        </div>
        <span className="text-xs text-stone-400">
          <span className="text-[#005149] font-medium">{covered}</span> / {items.length} covered
        </span>
      </button>

      {open && (
        <div className="space-y-1.5 pb-3">
          {items.map((item, i) => (
            <div
              key={i}
              className={`flex items-start gap-2.5 px-3 py-2.5 rounded-lg transition-colors ${
                item.covered ? "bg-[#DBF0EA]" : "bg-amber-50/40"
              }`}
            >
              {item.covered ? (
                <CheckCircle2 className="w-4 h-4 text-[#005149] mt-0.5 shrink-0" />
              ) : (
                <Circle className="w-4 h-4 text-amber-400 mt-0.5 shrink-0" />
              )}
              <div className="min-w-0">
                <p className={`text-sm ${item.covered ? "text-stone-700" : "text-stone-600"}`}>{item.text}</p>
                {item.covered && item.resumeEvidence && (
                  <p className="text-xs text-[#005149]/70 mt-0.5">↳ {item.resumeEvidence}</p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default function MatchPanel({ onClose }: { onClose: () => void }) {
  const { matchAnalysis, jobDescription } = useResume();

  if (!matchAnalysis) {
    return (
      <div className="h-full flex flex-col items-center justify-center p-8 text-center">
        <FileText className="w-10 h-10 text-stone-200 mb-4" />
        <p className="text-stone-500 font-medium mb-1">No match analysis yet</p>
        <p className="text-stone-400 text-sm">Paste a job description in the chat to get a detailed match breakdown.</p>
      </div>
    );
  }

  const hasStructured = matchAnalysis.requirements || matchAnalysis.responsibilities || matchAnalysis.niceToHaves || matchAnalysis.keywords;

  // Fallback: build from legacy matches/gaps if no structured data
  const requirements = matchAnalysis.requirements || [];
  const responsibilities = matchAnalysis.responsibilities || [];
  const niceToHaves = matchAnalysis.niceToHaves || [];
  const keywords = matchAnalysis.keywords || (hasStructured ? [] : [
    ...matchAnalysis.matches.map((m) => ({ text: m, covered: true } as MatchItem)),
    ...matchAnalysis.gaps.map((g) => ({ text: g, covered: false } as MatchItem)),
  ]);

  // Calculate percentages from actual checklist items (not AI's separate numbers)
  const pct = (items: MatchItem[]) => items.length === 0 ? 0 : Math.round((items.filter((i) => i.covered).length / items.length) * 100);
  

  return (
    <div className="h-full flex flex-col bg-white">
      {/* Header */}
      <div className="shrink-0 px-5 py-4 border-b border-stone-200 flex items-center justify-between">
        <div>
          <h2 className="text-sm font-semibold text-stone-800">Match Analysis</h2>
          {matchAnalysis.company && (
            <p className="text-xs text-stone-400 mt-0.5">{matchAnalysis.company}</p>
          )}
        </div>
        <button onClick={onClose} className="p-1.5 rounded-md text-stone-400 hover:text-stone-600 hover:bg-stone-100 transition-colors">
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        {/* Score section */}
        <div className="px-5 py-5 border-b border-stone-100">
          <div className="flex items-center gap-6">
            <ScoreRing score={matchAnalysis.score} />
            <div className="flex-1 space-y-2.5">
              {requirements.length > 0 && <CategoryBar label="Requirements" percent={pct(requirements)} />}
              {responsibilities.length > 0 && <CategoryBar label="Responsibilities" percent={pct(responsibilities)} />}
              {keywords.length > 0 && <CategoryBar label="Keywords" percent={pct(keywords)} />}
              {niceToHaves.length > 0 && <CategoryBar label="Nice to Haves" percent={pct(niceToHaves)} />}
            </div>
          </div>
        </div>

        {/* Checklist sections */}
        <div className="px-5 py-4 space-y-1">
          {requirements.length > 0 && (
            <MatchSection title="Requirements" items={requirements} />
          )}
          {responsibilities.length > 0 && (
            <MatchSection title="Responsibilities" items={responsibilities} />
          )}
          {niceToHaves.length > 0 && (
            <MatchSection title="Nice to Haves" items={niceToHaves} defaultOpen={false} />
          )}
          {keywords.length > 0 && (
            <MatchSection title="Keywords" items={keywords} />
          )}
        </div>

        {/* Job Description */}
        {jobDescription && (
          <div className="px-5 py-4 border-t border-stone-100">
            <details className="group">
              <summary className="text-xs font-semibold text-stone-400 uppercase tracking-wider cursor-pointer hover:text-stone-600 transition-colors flex items-center gap-1.5">
                <ChevronRight className="w-3 h-3 group-open:rotate-90 transition-transform" />
                Job Description
              </summary>
              <div className="mt-3 p-4 rounded-lg bg-stone-50 border border-stone-100">
                <p className="text-sm text-stone-600 whitespace-pre-wrap leading-relaxed">{jobDescription}</p>
              </div>
            </details>
          </div>
        )}
      </div>
    </div>
  );
}
