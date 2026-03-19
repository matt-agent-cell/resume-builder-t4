"use client";

import { ResumeProvider, useResume } from "@/context/resume-context";
import Onboarding from "@/components/onboarding";
import ChatPanel from "@/components/chat-panel";
import ResumePreview from "@/components/resume-preview";
import Sidebar from "@/components/sidebar";
import VaultEditor from "@/components/vault-editor";
import ExportModal from "@/components/export-modal";
import CompareView from "@/components/compare-view";
import MatchPanel from "@/components/match-panel";
import { useState } from "react";
import { Download, Eye, EyeOff, Settings, GitCompareArrows } from "lucide-react";

type RightPanel = "resume" | "vault" | "match" | "compare" | null;

function AppContent() {
  const { step, showPreview, setShowPreview, sidebarView, setSidebarView, matchAnalysis, sessions, activeSessionId } = useResume();
  const [showExport, setShowExport] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [rightPanel, setRightPanel] = useState<RightPanel>("resume");

  const activeSession = sessions.find((s) => s.id === activeSessionId);
  const resumeName = activeSession?.name || "Untitled Resume";

  // Sync sidebarView to rightPanel
  const handleVaultClick = () => {
    if (rightPanel === "vault") {
      setRightPanel(showPreview ? "resume" : null);
      setSidebarView("chat");
    } else {
      setRightPanel("vault");
    }
  };

  // When sidebar view changes externally
  const effectiveRightPanel = sidebarView === "vault" ? "vault" : rightPanel;

  if (step !== "chat") {
    return <Onboarding />;
  }

  const hasRightPanel = effectiveRightPanel && effectiveRightPanel !== null;

  return (
    <div className="h-screen flex overflow-hidden bg-white">
      <Sidebar />

      <div className="flex-1 min-w-0 flex flex-col">
        {/* Top bar */}
        <header className="h-11 shrink-0 border-b border-stone-200 flex items-center justify-between px-3 bg-white">
          {/* Left: resume name */}
          <div className="flex items-center gap-2">
            <span className="text-sm text-stone-500 font-medium truncate max-w-[200px]">{resumeName}</span>
          </div>

          {/* Center/Right: actions */}
          <div className="flex items-center gap-1">
            <button
              onClick={() => {
                const next = effectiveRightPanel === "compare" ? (showPreview ? "resume" : null) : "compare";
                setRightPanel(next);
                if (next === "compare") setSidebarView("chat");
              }}
              className={`h-8 flex items-center gap-1.5 px-3 rounded-lg text-xs font-medium transition-colors ${
                effectiveRightPanel === "compare" ? "bg-[#005149]/10 text-[#005149]" : "text-stone-400 hover:text-stone-600 hover:bg-stone-100"
              }`}
            >
              <GitCompareArrows className="w-3.5 h-3.5" />
              Compare
            </button>

            {/* Match score pill */}
            {matchAnalysis && (
              <button
                onClick={() => {
                  const next = effectiveRightPanel === "match" ? (showPreview ? "resume" : null) : "match";
                  setRightPanel(next);
                  if (next === "match") setSidebarView("chat");
                }}
                className={`h-8 flex items-center gap-1.5 px-3 rounded-full text-xs font-medium transition-colors ${
                  effectiveRightPanel === "match"
                    ? "bg-[#005149]/15 text-[#005149]"
                    : "bg-[#005149]/8 text-[#005149] hover:bg-[#005149]/15"
                }`}
              >
                {matchAnalysis.score}% match
              </button>
            )}

            <button
              onClick={() => setShowExport(true)}
              className="w-8 h-8 flex items-center justify-center rounded-lg text-stone-400 hover:text-stone-600 hover:bg-stone-100 transition-colors"
            >
              <Download className="w-4 h-4" />
            </button>
            <div className="relative">
              <button
                onClick={() => setShowSettings(!showSettings)}
                className="w-8 h-8 flex items-center justify-center rounded-lg text-stone-400 hover:text-stone-600 hover:bg-stone-100 transition-colors"
              >
                <Settings className="w-4 h-4" />
              </button>
              {showSettings && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setShowSettings(false)} />
                  <div className="absolute right-0 top-full mt-1 z-50 bg-white border border-stone-200 rounded-lg shadow-lg py-1 w-48">
                    <button
                      onClick={() => {
                        const newShow = !showPreview;
                        setShowPreview(newShow);
                        if (newShow && effectiveRightPanel === null) setRightPanel("resume");
                        if (!newShow && effectiveRightPanel === "resume") setRightPanel(null);
                        setShowSettings(false);
                      }}
                      className="w-full flex items-center gap-2.5 px-3 py-2 text-sm text-stone-600 hover:bg-stone-50 transition-colors"
                    >
                      {showPreview ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      {showPreview ? "Hide resume" : "Show resume"}
                    </button>
                  </div>
                </>
              )}
            </div>

            {/* end actions */}
          </div>
        </header>

        {/* Content */}
        <div className="flex-1 flex overflow-hidden">
          {effectiveRightPanel === "compare" ? (
            <div className="w-full">
              <CompareView onClose={() => setRightPanel(showPreview ? "resume" : null)} />
            </div>
          ) : (
            <>
              {/* Left: always chat */}
              <div className={hasRightPanel ? "w-1/2" : "w-full"}>
                <ChatPanel />
              </div>
              {/* Right panel */}
              {effectiveRightPanel === "vault" && (
                <div className="w-1/2 border-l border-stone-200">
                  <VaultEditor />
                </div>
              )}
              {effectiveRightPanel === "match" && (
                <div className="w-1/2 border-l border-stone-200">
                  <MatchPanel onClose={() => setRightPanel(showPreview ? "resume" : null)} />
                </div>
              )}
              {effectiveRightPanel === "resume" && (
                <div className="w-1/2 border-l border-stone-200">
                  <ResumePreview />
                </div>
              )}
            </>
          )}
        </div>
      </div>

      <ExportModal isOpen={showExport} onClose={() => setShowExport(false)} />
    </div>
  );
}

export default function Page() {
  return (
    <ResumeProvider>
      <AppContent />
    </ResumeProvider>
  );
}
