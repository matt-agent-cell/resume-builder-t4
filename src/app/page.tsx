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
import DesignPanel from "@/components/design-panel";
import { useState, useEffect } from "react";
import { Download, Eye, EyeOff, Settings, GitCompareArrows, Menu, X, FileText, Archive, ChevronLeft } from "lucide-react";

type RightPanel = "resume" | "vault" | "match" | "compare" | null;
type MobileView = "chat" | "resume" | "vault" | "match" | "compare" | "design";

function useIsMobile() {
  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);
  return isMobile;
}

function AppContent() {
  const { step, showPreview, setShowPreview, sidebarView, setSidebarView, matchAnalysis, sessions, activeSessionId } = useResume();
  const [showExport, setShowExport] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [rightPanel, setRightPanel] = useState<RightPanel>("resume");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [mobileView, setMobileView] = useState<MobileView>("chat");
  const isMobile = useIsMobile();

  const activeSession = sessions.find((s) => s.id === activeSessionId);
  const resumeName = activeSession?.name || "Untitled Resume";

  // When sidebar view changes externally
  const effectiveRightPanel = sidebarView === "vault" ? "vault" : sidebarView === "design" ? "resume" : rightPanel;

  // Sync mobile view from sidebar/right panel changes
  useEffect(() => {
    if (isMobile && sidebarView === "design") {
      setMobileView("design");
    }
  }, [isMobile, sidebarView]);

  if (step !== "chat") {
    return <Onboarding />;
  }

  const hasRightPanel = effectiveRightPanel && effectiveRightPanel !== null;

  // Mobile: back to chat
  const goBack = () => {
    setMobileView("chat");
    setSidebarView("chat");
  };

  // Mobile: Design mode — split view (resume preview top, design tray bottom)
  if (isMobile && mobileView === "design") {
    return (
      <div className="h-screen flex flex-col bg-stone-100">
        {/* Compact header */}
        <header className="h-11 shrink-0 border-b border-stone-200 flex items-center px-3 bg-white gap-2">
          <button onClick={goBack} className="w-8 h-8 flex items-center justify-center rounded-lg text-stone-500 hover:bg-stone-100">
            <ChevronLeft className="w-5 h-5" />
          </button>
          <span className="text-sm font-medium text-stone-700 flex-1 truncate">Design</span>
          <button onClick={() => setShowExport(true)} className="w-8 h-8 flex items-center justify-center rounded-lg text-stone-400 hover:text-stone-600 hover:bg-stone-100">
            <Download className="w-4 h-4" />
          </button>
        </header>
        {/* Resume preview — top portion, scaled to fit */}
        <div className="flex-1 min-h-0 overflow-auto bg-stone-100 flex justify-center p-3">
          <div className="origin-top" style={{ transform: "scale(0.55)", transformOrigin: "top center", width: "8.5in", minHeight: "11in", flexShrink: 0 }}>
            <ResumePreview onDesignClick={() => {}} />
          </div>
        </div>
        {/* Design tray — bottom portion */}
        <div className="h-[45vh] shrink-0 border-t border-stone-200 bg-white rounded-t-2xl shadow-[0_-4px_20px_rgba(0,0,0,0.08)]">
          <div className="w-10 h-1 bg-stone-300 rounded-full mx-auto mt-2 mb-1" />
          <DesignPanel compact onClose={goBack} />
        </div>
        <ExportModal isOpen={showExport} onClose={() => setShowExport(false)} />
      </div>
    );
  }

  // Mobile: other full-screen views
  if (isMobile && mobileView !== "chat") {
    return (
      <div className="h-screen flex flex-col bg-white">
        {/* Mobile overlay header */}
        <header className="h-12 shrink-0 border-b border-stone-200 flex items-center px-3 bg-white gap-2">
          <button onClick={goBack} className="w-8 h-8 flex items-center justify-center rounded-lg text-stone-500 hover:bg-stone-100">
            <ChevronLeft className="w-5 h-5" />
          </button>
          <span className="text-sm font-medium text-stone-700 flex-1 truncate">
            {mobileView === "resume" && "Resume Preview"}
            {mobileView === "vault" && "Career Vault"}
            {mobileView === "match" && "Match Analysis"}
            {mobileView === "compare" && "Compare"}
          </span>
          {mobileView === "resume" && (
            <>
              <button onClick={() => setMobileView("design")} className="w-8 h-8 flex items-center justify-center rounded-lg text-stone-400 hover:text-stone-600 hover:bg-stone-100">
                <Settings className="w-4 h-4" />
              </button>
              <button onClick={() => setShowExport(true)} className="w-8 h-8 flex items-center justify-center rounded-lg text-stone-400 hover:text-stone-600 hover:bg-stone-100">
                <Download className="w-4 h-4" />
              </button>
            </>
          )}
        </header>
        <div className="flex-1 overflow-hidden">
          {mobileView === "resume" && <ResumePreview onDesignClick={() => setMobileView("design")} />}
          {mobileView === "vault" && <VaultEditor />}
          {mobileView === "match" && <MatchPanel onClose={goBack} />}
          {mobileView === "compare" && <CompareView onClose={goBack} />}
        </div>
        <ExportModal isOpen={showExport} onClose={() => setShowExport(false)} />
      </div>
    );
  }

  return (
    <div className="h-screen flex overflow-hidden bg-white">
      {/* Desktop sidebar */}
      <div className="hidden md:block">
        <Sidebar />
      </div>

      {/* Mobile sidebar drawer */}
      {isMobile && sidebarOpen && (
        <>
          <div className="fixed inset-0 bg-black/30 z-40" onClick={() => setSidebarOpen(false)} />
          <div className="fixed inset-y-0 left-0 w-72 bg-white z-50 shadow-xl flex flex-col animate-slide-in-left">
            <div className="h-12 flex items-center justify-between px-4 border-b border-stone-200">
              <span className="text-sm font-semibold text-stone-700">Resume Builder</span>
              <button onClick={() => setSidebarOpen(false)} className="w-8 h-8 flex items-center justify-center rounded-lg text-stone-400 hover:bg-stone-100">
                <X className="w-4 h-4" />
              </button>
            </div>
            <Sidebar alwaysExpanded onNavigate={() => setSidebarOpen(false)} />
          </div>
        </>
      )}

      <div className="flex-1 min-w-0 flex flex-col">
        {/* Top bar */}
        <header className="h-11 md:h-11 shrink-0 border-b border-stone-200 flex items-center justify-between px-2 md:px-3 bg-white">
          {/* Left */}
          <div className="flex items-center gap-1.5">
            {/* Mobile hamburger */}
            <button onClick={() => setSidebarOpen(true)} className="md:hidden w-8 h-8 flex items-center justify-center rounded-lg text-stone-500 hover:bg-stone-100">
              <Menu className="w-4.5 h-4.5" />
            </button>
            <span className="text-sm text-stone-500 font-medium truncate max-w-[140px] md:max-w-[200px]">{resumeName}</span>
          </div>

          {/* Right actions */}
          <div className="flex items-center gap-0.5 md:gap-1">
            {/* Mobile: quick view buttons */}
            <button
              onClick={() => isMobile ? setMobileView("resume") : (() => {
                const next = effectiveRightPanel === "resume" ? null : "resume";
                setRightPanel(next);
              })()}
              className="md:hidden w-8 h-8 flex items-center justify-center rounded-lg text-stone-400 hover:text-stone-600 hover:bg-stone-100"
              title="View resume"
            >
              <FileText className="w-4 h-4" />
            </button>

            {/* Compare */}
            <button
              onClick={() => {
                if (isMobile) { setMobileView("compare"); return; }
                const next = effectiveRightPanel === "compare" ? (showPreview ? "resume" : null) : "compare";
                setRightPanel(next);
                if (next === "compare") setSidebarView("chat");
              }}
              className={`h-8 items-center gap-1.5 px-2 md:px-3 rounded-lg text-xs font-medium transition-colors hidden md:flex ${
                effectiveRightPanel === "compare" ? "bg-[#005149]/10 text-[#005149]" : "text-stone-400 hover:text-stone-600 hover:bg-stone-100"
              }`}
            >
              <GitCompareArrows className="w-3.5 h-3.5" />
              <span className="hidden md:inline">Compare</span>
            </button>

            {/* Match score pill */}
            {matchAnalysis && (
              <button
                onClick={() => {
                  if (isMobile) { setMobileView("match"); return; }
                  const next = effectiveRightPanel === "match" ? (showPreview ? "resume" : null) : "match";
                  setRightPanel(next);
                  if (next === "match") setSidebarView("chat");
                }}
                className={`h-7 md:h-8 flex items-center gap-1 px-2 md:px-3 rounded-full text-xs font-medium transition-colors ${
                  effectiveRightPanel === "match"
                    ? "bg-[#005149]/15 text-[#005149]"
                    : "bg-[#005149]/8 text-[#005149] hover:bg-[#005149]/15"
                }`}
              >
                {matchAnalysis.score}%
                <span className="hidden md:inline"> match</span>
              </button>
            )}

            {/* Download */}
            <button
              onClick={() => setShowExport(true)}
              className="w-8 h-8 flex items-center justify-center rounded-lg text-stone-400 hover:text-stone-600 hover:bg-stone-100 transition-colors"
            >
              <Download className="w-4 h-4" />
            </button>

            {/* Settings gear — desktop only */}
            <div className="relative hidden md:block">
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

            {/* Mobile: more menu */}
            <div className="relative md:hidden">
              <button
                onClick={() => setShowSettings(!showSettings)}
                className="w-8 h-8 flex items-center justify-center rounded-lg text-stone-400 hover:text-stone-600 hover:bg-stone-100"
              >
                <Settings className="w-4 h-4" />
              </button>
              {showSettings && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setShowSettings(false)} />
                  <div className="absolute right-0 top-full mt-1 z-50 bg-white border border-stone-200 rounded-lg shadow-lg py-1 w-52">
                    <button onClick={() => { setMobileView("vault"); setShowSettings(false); }}
                      className="w-full flex items-center gap-2.5 px-3 py-2.5 text-sm text-stone-600 hover:bg-stone-50">
                      <Archive className="w-4 h-4" /> Career Vault
                    </button>
                    <button onClick={() => { setMobileView("compare"); setShowSettings(false); }}
                      className="w-full flex items-center gap-2.5 px-3 py-2.5 text-sm text-stone-600 hover:bg-stone-50">
                      <GitCompareArrows className="w-4 h-4" /> Compare
                    </button>
                    <button onClick={() => { setMobileView("design"); setSidebarView("design"); setShowSettings(false); }}
                      className="w-full flex items-center gap-2.5 px-3 py-2.5 text-sm text-stone-600 hover:bg-stone-50">
                      <Settings className="w-4 h-4" /> Design Settings
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </header>

        {/* Content */}
        <div className="flex-1 flex overflow-hidden">
          {effectiveRightPanel === "compare" && !isMobile ? (
            <div className="w-full">
              <CompareView onClose={() => setRightPanel(showPreview ? "resume" : null)} />
            </div>
          ) : (
            <>
              {/* Left: chat or design panel */}
              <div className={`${hasRightPanel && !isMobile ? "w-1/2" : "w-full"}`}>
                {sidebarView === "design" && !isMobile ? <DesignPanel onClose={() => setSidebarView("chat")} /> : <ChatPanel onViewResume={() => setMobileView("resume")} />}
              </div>
              {/* Right panel — desktop only */}
              {!isMobile && effectiveRightPanel === "vault" && (
                <div className="w-1/2 border-l border-stone-200">
                  <VaultEditor />
                </div>
              )}
              {!isMobile && effectiveRightPanel === "match" && (
                <div className="w-1/2 border-l border-stone-200">
                  <MatchPanel onClose={() => setRightPanel(showPreview ? "resume" : null)} />
                </div>
              )}
              {!isMobile && effectiveRightPanel === "resume" && (
                <div className="w-1/2 border-l border-stone-200">
                  <ResumePreview onDesignClick={() => setSidebarView(sidebarView === "design" ? "chat" : "design")} />
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
