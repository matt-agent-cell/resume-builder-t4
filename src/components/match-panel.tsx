"use client";

import { useResume } from "@/context/resume-context";
import { X, CheckCircle2, AlertCircle, FileText } from "lucide-react";

export default function MatchPanel({ onClose }: { onClose: () => void }) {
  const { matchAnalysis, jobDescription } = useResume();

  if (!matchAnalysis) {
    return (
      <div className="h-full flex flex-col items-center justify-center p-8 text-center">
        <FileText className="w-10 h-10 text-stone-200 mb-4" />
        <p className="text-stone-500 font-medium mb-1">No match analysis yet</p>
        <p className="text-stone-400 text-sm">Paste a job description in the chat to get a match score and gap analysis.</p>
      </div>
    );
  }

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
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#005149]/10">
            <span className="text-lg font-bold text-[#005149]">{matchAnalysis.score}%</span>
            <span className="text-xs text-[#005149]/70 font-medium">match</span>
          </div>
          <button onClick={onClose} className="p-1 rounded-md text-stone-400 hover:text-stone-600 hover:bg-stone-100 transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-5 space-y-6">
        {/* Score bar */}
        <div>
          <div className="w-full h-2 bg-stone-100 rounded-full overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-500"
              style={{
                width: `${matchAnalysis.score}%`,
                backgroundColor: matchAnalysis.score >= 70 ? "#005149" : matchAnalysis.score >= 40 ? "#d97706" : "#dc2626",
              }}
            />
          </div>
        </div>

        {/* What matches */}
        {matchAnalysis.matches.length > 0 && (
          <div>
            <h3 className="text-xs font-semibold text-stone-500 uppercase tracking-wider mb-3">What matches</h3>
            <div className="space-y-2">
              {matchAnalysis.matches.map((m, i) => (
                <div key={i} className="flex items-start gap-2.5 p-3 rounded-lg bg-emerald-50/50">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 mt-0.5 shrink-0" />
                  <span className="text-sm text-stone-700">{m}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Gaps / Missing */}
        {matchAnalysis.gaps.length > 0 && (
          <div>
            <h3 className="text-xs font-semibold text-stone-500 uppercase tracking-wider mb-3">Gaps to address</h3>
            <div className="space-y-2">
              {matchAnalysis.gaps.map((g, i) => (
                <div key={i} className="flex items-start gap-2.5 p-3 rounded-lg bg-amber-50/50">
                  <AlertCircle className="w-4 h-4 text-amber-500 mt-0.5 shrink-0" />
                  <span className="text-sm text-stone-700">{g}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Job Description */}
        {jobDescription && (
          <div>
            <h3 className="text-xs font-semibold text-stone-500 uppercase tracking-wider mb-3">Job Description</h3>
            <div className="p-4 rounded-lg bg-stone-50 border border-stone-100">
              <p className="text-sm text-stone-600 whitespace-pre-wrap leading-relaxed">{jobDescription}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
