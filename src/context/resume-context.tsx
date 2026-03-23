"use client";

import React, { createContext, useContext, useState, useCallback, useRef, type ReactNode } from "react";

/* ── Data types ── */

export interface BulletVersion {
  text: string;
  timestamp: number;
  source: string; // e.g. "original", "AlexChen-Google-Resume", session name
}

export interface VaultBullet {
  current: string;
  history: BulletVersion[];
}

export interface VaultExperience {
  id: string; title: string; company: string; location: string; dateRange: string;
  bullets: string[]; // kept for backward compat & simple access
  bulletHistory?: VaultBullet[]; // full version history per bullet
}
export interface VaultEducation {
  id: string; degree: string; school: string; dateRange: string; gpa?: string;
}

export interface CareerVault {
  contact: { name: string; email: string; phone: string; location: string; linkedin?: string; photo?: string };
  summary: string;
  experience: VaultExperience[];
  education: VaultEducation[];
  skills: string[];
}

export interface ResumeStyles {
  // Typography
  fontFamily?: string;
  fontSize?: number; // base size in px
  nameSize?: number; // multiplier for name
  headingSize?: number; // multiplier for section headings
  lineHeight?: number;
  headingStyle?: "uppercase" | "capitalize" | "normal";
  // Colors
  headingColor?: string;
  textColor?: string;
  accentColor?: string;
  dividerColor?: string;
  // Layout & Structure
  headerAlign?: "left" | "center" | "right";
  dateAlign?: "left" | "right";
  marginsX?: number; // left/right in px
  marginsY?: number; // top/bottom in px
  sectionSpacing?: number; // in px
  columns?: 1 | 2;
  // Visuals
  borderStyle?: "solid" | "double" | "dotted" | "none";
  dividerWeight?: number; // px
  skillStyle?: "pills" | "tags" | "comma" | "bars";
  bulletStyle?: "disc" | "dash" | "arrow" | "none";
  // Preferences
  dateFormat?: "MM/YYYY" | "Mon YYYY" | "Month YYYY" | "YYYY";
  showSummary?: boolean;
  showSkills?: boolean;
  showEducation?: boolean;
  sectionOrder?: string[];
  // Photo
  showPhoto?: boolean;
  photoSize?: number; // px
  photoShape?: "circle" | "rounded" | "square";
  // Legacy compat
  margins?: number;
}

export const defaultStyles: ResumeStyles = {
  fontFamily: "Inter",
  fontSize: 12,
  lineHeight: 1.5,
  nameSize: 1.67,
  headingSize: 1.0,
  headingStyle: "uppercase",
  headingColor: "#005149",
  textColor: "#1c1917",
  accentColor: "#005149",
  dividerColor: "#00514933",
  headerAlign: "left",
  dateAlign: "right",
  marginsX: 32,
  marginsY: 28,
  sectionSpacing: 20,
  columns: 1,
  borderStyle: "solid",
  dividerWeight: 1,
  skillStyle: "pills",
  bulletStyle: "disc",
  dateFormat: "Mon YYYY",
  showSummary: true,
  showSkills: true,
  showEducation: true,
  showPhoto: false,
  photoSize: 72,
  photoShape: "circle",
  margins: 32,
};

export interface ResumeData {
  contact: { name: string; email: string; phone: string; location: string; linkedin?: string; photo?: string };
  summary: string;
  experience: VaultExperience[];
  education: VaultEducation[];
  skills: string[];
  styles?: ResumeStyles;
}

export interface ChangeDiff { label: string; before: string; after: string; }
export interface ChatMessage { role: "user" | "assistant"; content: string; diffs?: ChangeDiff[]; }
export interface MatchItem {
  text: string;
  covered: boolean; // true = conveyed on resume, false = gap
  resumeEvidence?: string; // brief note of where/how it's covered
}

export interface MatchAnalysis {
  score: number;
  company?: string;
  // Legacy (kept for backward compat)
  matches: string[];
  gaps: string[];
  // Structured breakdown
  requirements?: MatchItem[];
  responsibilities?: MatchItem[];
  niceToHaves?: MatchItem[];
  keywords?: MatchItem[];
  scoreBreakdown?: {
    requirements: number; // % covered
    responsibilities: number;
    keywords: number;
  };
}

export interface CoverLetter {
  greeting: string;
  paragraphs: string[];
  closing: string;
  signature: string;
}

export interface ResumeSession {
  id: string;
  name: string;
  messages: ChatMessage[];
  resume: ResumeData;
  originalResume: ResumeData; // snapshot at session creation for compare
  jobDescription: string;
  matchAnalysis: MatchAnalysis | null;
  coverLetter: CoverLetter | null;
  createdAt: number;
}

export type Step = "welcome" | "upload" | "review" | "chat";

/* ── State ── */

interface AppState {
  step: Step;
  vault: CareerVault | null;
  sessions: ResumeSession[];
  activeSessionId: string | null;
  showPreview: boolean;
  sidebarView: "chat" | "vault" | "design";
}

/* ── Context value ── */

interface Ctx extends AppState {
  setStep: (s: Step) => void;
  setVault: (v: CareerVault) => void;
  updateVault: (fn: (v: CareerVault) => CareerVault) => void;
  // Session management
  createSession: (name?: string) => string;
  switchSession: (id: string) => void;
  renameSession: (id: string, name: string) => void;
  deleteSession: (id: string) => void;
  // Active session shortcuts
  activeSession: ResumeSession | null;
  resume: ResumeData | null;
  messages: ChatMessage[];
  jobDescription: string;
  matchAnalysis: MatchAnalysis | null;
  addMessage: (msg: ChatMessage) => void;
  addMessages: (msgs: ChatMessage[]) => void;
  updateLastAssistantMessage: (content: string) => void;
  setJobDescription: (jd: string) => void;
  setMatchAnalysis: (ma: MatchAnalysis) => void;
  updateResume: (fn: (r: ResumeData) => ResumeData) => void;
  setResume: (r: ResumeData) => void;
  applyResumeChanges: (changes: { section: string; id?: string; field?: string; value: unknown }[]) => ChangeDiff[];
  setShowPreview: (b: boolean) => void;
  setSidebarView: (v: "chat" | "vault" | "design") => void;
  // Vault sync: push new data from resume edits into vault
  syncToVault: (resume: ResumeData) => void;
  highlightedSections: Set<string>;
  coverLetter: CoverLetter | null;
  setCoverLetter: (cl: CoverLetter) => void;
  updateCoverLetter: (fn: (cl: CoverLetter) => CoverLetter) => void;
}

const ResumeContext = createContext<Ctx | null>(null);

let sessionCounter = 0;

export function ResumeProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AppState>({
    step: "welcome",
    vault: null,
    sessions: [],
    activeSessionId: null,
    showPreview: true,
    sidebarView: "chat",
  });

  // Ref to access current state synchronously (for diff capture)
  const stateRef = useRef(state);
  stateRef.current = state;

  /* ── Helpers ── */
  const updateActiveSession = useCallback((fn: (s: ResumeSession) => ResumeSession) => {
    setState((st) => ({
      ...st,
      sessions: st.sessions.map((s) => s.id === st.activeSessionId ? fn(s) : s),
    }));
  }, []);

  const getActive = (st: AppState): ResumeSession | null =>
    st.sessions.find((s) => s.id === st.activeSessionId) || null;

  /* ── Setters ── */
  const setStep = useCallback((step: Step) => setState((s) => ({ ...s, step })), []);
  const setShowPreview = useCallback((showPreview: boolean) => setState((s) => ({ ...s, showPreview })), []);
  const setSidebarView = useCallback((sidebarView: "chat" | "vault" | "design") => setState((s) => ({ ...s, sidebarView })), []);

  const setVault = useCallback((vault: CareerVault) => {
    // Initialize bulletHistory for any experiences that don't have it
    const now = Date.now();
    const enriched = {
      ...vault,
      experience: vault.experience.map((exp) => ({
        ...exp,
        bulletHistory: exp.bulletHistory || exp.bullets.map((b) => ({
          current: b,
          history: [{ text: b, timestamp: now, source: "original" }],
        })),
      })),
    };
    setState((s) => ({ ...s, vault: enriched }));
  }, []);
  const updateVault = useCallback((fn: (v: CareerVault) => CareerVault) => {
    setState((s) => s.vault ? { ...s, vault: fn(s.vault) } : s);
  }, []);

  const setResume = useCallback((resume: ResumeData) => {
    // Also init vault if not set
    setState((s) => {
      const newVault = s.vault || { ...resume };
      return {
        ...s,
        vault: s.vault ? s.vault : newVault,
        sessions: s.sessions.map((ses) => ses.id === s.activeSessionId ? { ...ses, resume } : ses),
      };
    });
  }, []);

  const updateResume = useCallback((fn: (r: ResumeData) => ResumeData) => {
    updateActiveSession((s) => ({ ...s, resume: fn(s.resume) }));
  }, [updateActiveSession]);

  const createSession = useCallback((name?: string): string => {
    const id = `session-${++sessionCounter}-${Date.now()}`;
    setState((s) => {
      const resume: ResumeData = s.vault
        ? JSON.parse(JSON.stringify(s.vault))
        : { contact: { name: "", email: "", phone: "", location: "" }, summary: "", experience: [], education: [], skills: [] };
      const session: ResumeSession = {
        id, name: name || "Untitled Resume",
        messages: [], resume, originalResume: JSON.parse(JSON.stringify(resume)),
        jobDescription: "", matchAnalysis: null, coverLetter: null, createdAt: Date.now(),
      };
      return { ...s, sessions: [session, ...s.sessions], activeSessionId: id, step: "chat" };
    });
    return id;
  }, []);

  const switchSession = useCallback((id: string) => {
    setState((s) => ({ ...s, activeSessionId: id, step: "chat" }));
  }, []);

  const renameSession = useCallback((id: string, name: string) => {
    setState((s) => ({ ...s, sessions: s.sessions.map((ses) => ses.id === id ? { ...ses, name } : ses) }));
  }, []);

  const deleteSession = useCallback((id: string) => {
    setState((s) => {
      const sessions = s.sessions.filter((ses) => ses.id !== id);
      const activeSessionId = s.activeSessionId === id ? (sessions[0]?.id || null) : s.activeSessionId;
      return { ...s, sessions, activeSessionId };
    });
  }, []);

  const addMessage = useCallback((msg: ChatMessage) => {
    updateActiveSession((s) => ({ ...s, messages: [...s.messages, msg] }));
  }, [updateActiveSession]);

  const addMessages = useCallback((msgs: ChatMessage[]) => {
    updateActiveSession((s) => ({ ...s, messages: [...s.messages, ...msgs] }));
  }, [updateActiveSession]);

  const updateLastAssistantMessage = useCallback((content: string) => {
    updateActiveSession((s) => {
      const msgs = [...s.messages];
      const last = msgs.length - 1;
      if (last >= 0 && msgs[last].role === "assistant") msgs[last] = { ...msgs[last], content };
      return { ...s, messages: msgs };
    });
  }, [updateActiveSession]);

  const setJobDescription = useCallback((jd: string) => {
    updateActiveSession((s) => ({ ...s, jobDescription: jd }));
  }, [updateActiveSession]);

  const setMatchAnalysis = useCallback((ma: MatchAnalysis) => {
    updateActiveSession((s) => {
      const updated = { ...s, matchAnalysis: ma };
      // Auto-rename untitled resumes when we get a company name
      if (ma.company && (s.name === "Untitled Resume" || s.name.startsWith("Resume "))) {
        const contactName = s.resume.contact.name.replace(/\s+/g, "") || "Resume";
        updated.name = `${contactName}-${ma.company}-Resume`;
      }
      return updated;
    });
  }, [updateActiveSession]);

  const syncToVault = useCallback((resume: ResumeData, sessionName?: string) => {
    setState((s) => {
      if (!s.vault) return s;
      const v = { ...s.vault, experience: s.vault.experience.map((e) => ({ ...e })) };
      const source = sessionName || "AI Edit";
      const now = Date.now();

      for (const exp of resume.experience) {
        const vaultExp = v.experience.find((e) => e.id === exp.id);
        if (!vaultExp) {
          // New experience — add with initial history
          v.experience.push({
            ...exp,
            bulletHistory: exp.bullets.map((b) => ({
              current: b,
              history: [{ text: b, timestamp: now, source: "original" }],
            })),
          });
        } else {
          // Existing experience — check each bullet for changes
          const updatedHistory = [...(vaultExp.bulletHistory || [])];

          for (let i = 0; i < exp.bullets.length; i++) {
            const newText = exp.bullets[i];
            if (i < updatedHistory.length) {
              // Existing bullet — add version if changed
              if (updatedHistory[i].current !== newText) {
                updatedHistory[i] = {
                  current: newText,
                  history: [...updatedHistory[i].history, { text: newText, timestamp: now, source }],
                };
              }
            } else {
              // New bullet added
              updatedHistory.push({
                current: newText,
                history: [{ text: newText, timestamp: now, source }],
              });
            }
          }

          vaultExp.bullets = exp.bullets;
          vaultExp.bulletHistory = updatedHistory;
        }
      }

      // Merge new skills
      const skillSet = new Set(v.skills);
      for (const sk of resume.skills) { skillSet.add(sk); }
      v.skills = Array.from(skillSet);

      // Merge education
      for (const edu of resume.education) {
        if (!v.education.find((e) => e.id === edu.id)) {
          v.education.push({ ...edu });
        }
      }

      return { ...s, vault: v };
    });
  }, []);

  const [highlightedSections, setHighlightedSections] = useState<Set<string>>(new Set());

  const applyResumeChanges = useCallback((changes: { section: string; id?: string; field?: string; value: unknown }[]): ChangeDiff[] => {
    // Track which sections changed for highlight animation
    const sections = new Set(changes.map((c) => c.id ? `${c.section}-${c.id}` : c.section));
    setHighlightedSections(sections);
    setTimeout(() => setHighlightedSections(new Set()), 3000);

    // Capture diffs before applying
    const diffs: ChangeDiff[] = [];
    const currentState = stateRef.current;
    const activeS = currentState.sessions.find((ses) => ses.id === currentState.activeSessionId);
    if (activeS) {
      const cur = activeS.resume;
      for (const c of changes) {
        if (c.section === "summary" && typeof c.value === "string" && cur.summary !== c.value) {
          diffs.push({ label: "Professional Summary", before: cur.summary || "(empty)", after: c.value });
        } else if (c.section === "skills" && Array.isArray(c.value)) {
          const oldSkills = (cur.skills || []).join(", ");
          const newSkills = (c.value as string[]).join(", ");
          if (oldSkills !== newSkills) diffs.push({ label: "Skills", before: oldSkills || "(none)", after: newSkills });
        } else if (c.section === "experience" && c.id && c.field === "bullets") {
          const exp = cur.experience.find((e) => e.id === c.id);
          if (exp) {
            const oldBullets = (exp.bullets || []).join("\n• ");
            const newBullets = (c.value as string[]).join("\n• ");
            if (oldBullets !== newBullets) diffs.push({ label: `${exp.title} — Bullets`, before: oldBullets ? `• ${oldBullets}` : "(empty)", after: `• ${newBullets}` });
          }
        } else if (c.section === "experience" && c.id && c.field) {
          const exp = cur.experience.find((e) => e.id === c.id);
          if (exp) {
            const oldVal = String((exp as unknown as Record<string, unknown>)[c.field] || "");
            const newVal = String(c.value || "");
            if (oldVal !== newVal) diffs.push({ label: `${exp.title} — ${c.field}`, before: oldVal || "(empty)", after: newVal });
          }
        } else if (c.section === "contact" && c.field) {
          const oldVal = String((cur.contact as unknown as Record<string, unknown>)[c.field] || "");
          const newVal = String(c.value || "");
          if (oldVal !== newVal) diffs.push({ label: `Contact — ${c.field}`, before: oldVal || "(empty)", after: newVal });
        }
      }
    }

    updateActiveSession((s) => {
      let r = { ...s.resume };
      for (const c of changes) {
        if (c.section === "summary" && typeof c.value === "string") r = { ...r, summary: c.value };
        else if (c.section === "skills" && Array.isArray(c.value)) r = { ...r, skills: c.value as string[] };
        else if (c.section === "contact" && c.field) r = { ...r, contact: { ...r.contact, [c.field]: c.value } };
        else if (c.section === "experience" && c.id) {
          r = { ...r, experience: r.experience.map((e) => e.id === c.id ? { ...e, ...(c.field ? { [c.field]: c.value } : (c.value as object)) } : e) };
        } else if (c.section === "education" && c.id) {
          r = { ...r, education: r.education.map((e) => e.id === c.id ? { ...e, ...(c.field ? { [c.field]: c.value } : (c.value as object)) } : e) };
        } else if (c.section === "styles" && typeof c.value === "object" && c.value !== null) {
          r = { ...r, styles: { ...(r.styles || defaultStyles), ...(c.value as Partial<ResumeStyles>) } };
        }
      }
      // Handle coverLetter changes separately (not part of resume)
      let cl = s.coverLetter;
      for (const c of changes) {
        if (c.section === "coverLetter" && typeof c.value === "object" && c.value !== null) {
          cl = c.value as CoverLetter;
        }
      }
      return { ...s, resume: r, coverLetter: cl };
    });

    // Sync changes to vault (deferred to next tick so state is updated)
    setTimeout(() => {
      setState((s) => {
        const active = s.sessions.find((ses) => ses.id === s.activeSessionId);
        if (!active || !s.vault) return s;
        // Run sync logic inline
        const v = { ...s.vault, experience: s.vault.experience.map((e) => ({ ...e })) };
        const source = active.name || "AI Edit";
        const now = Date.now();
        const resume = active.resume;

        for (const exp of resume.experience) {
          const vaultExp = v.experience.find((e) => e.id === exp.id);
          if (!vaultExp) {
            v.experience.push({
              ...exp,
              bulletHistory: exp.bullets.map((b) => ({
                current: b,
                history: [{ text: b, timestamp: now, source: "original" }],
              })),
            });
          } else {
            const updatedHistory = [...(vaultExp.bulletHistory || [])];
            for (let i = 0; i < exp.bullets.length; i++) {
              const newText = exp.bullets[i];
              if (i < updatedHistory.length) {
                if (updatedHistory[i].current !== newText) {
                  updatedHistory[i] = {
                    current: newText,
                    history: [...updatedHistory[i].history, { text: newText, timestamp: now, source }],
                  };
                }
              } else {
                updatedHistory.push({
                  current: newText,
                  history: [{ text: newText, timestamp: now, source }],
                });
              }
            }
            vaultExp.bullets = exp.bullets;
            vaultExp.bulletHistory = updatedHistory;
          }
        }

        const skillSet = new Set(v.skills);
        for (const sk of resume.skills) { skillSet.add(sk); }
        v.skills = Array.from(skillSet);

        return { ...s, vault: v };
      });
    }, 100);

    return diffs;
  }, [updateActiveSession]);

  const setCoverLetter = useCallback((cl: CoverLetter) => {
    updateActiveSession((s) => ({ ...s, coverLetter: cl }));
  }, [updateActiveSession]);

  const updateCoverLetter = useCallback((fn: (cl: CoverLetter) => CoverLetter) => {
    updateActiveSession((s) => {
      if (!s.coverLetter) return s;
      return { ...s, coverLetter: fn(s.coverLetter) };
    });
  }, [updateActiveSession]);

  const active = getActive(state);

  return (
    <ResumeContext.Provider value={{
      ...state,
      activeSession: active,
      resume: active?.resume || null,
      messages: active?.messages || [],
      jobDescription: active?.jobDescription || "",
      matchAnalysis: active?.matchAnalysis || null,
      setStep, setVault, updateVault,
      createSession, switchSession, renameSession, deleteSession,
      addMessage, addMessages, updateLastAssistantMessage, setJobDescription, setMatchAnalysis,
      updateResume, setResume, applyResumeChanges,
      setShowPreview, setSidebarView, syncToVault, highlightedSections,
      coverLetter: active?.coverLetter || null, setCoverLetter, updateCoverLetter,
    }}>
      {children}
    </ResumeContext.Provider>
  );
}

export function useResume() {
  const ctx = useContext(ResumeContext);
  if (!ctx) throw new Error("useResume must be used within ResumeProvider");
  return ctx;
}
