"use client";

import { useResume } from "@/context/resume-context";
import { MessageSquare, Plus, Archive, Trash2, FileText, PanelLeftClose, PanelLeft } from "lucide-react";
import { useState } from "react";

export default function Sidebar() {
  const { sessions, activeSessionId, createSession, switchSession, deleteSession, sidebarView, setSidebarView } = useResume();
  const [expanded, setExpanded] = useState(false);
  const [logoHover, setLogoHover] = useState(false);

  return (
    <div
      className={`bg-stone-50 border-r border-stone-200 flex flex-col h-full shrink-0 transition-all duration-200 ease-in-out ${
        expanded ? "w-[260px]" : "w-[52px]"
      }`}
    >
      {/* Top: logo that becomes collapse/expand toggle on hover */}
      <div className={`flex items-center h-11 border-b border-stone-200 ${expanded ? "px-3" : "px-0 justify-center"}`}>
        {expanded ? (
          <div className="flex items-center gap-2 w-full">
            <button
              onClick={() => setExpanded(false)}
              onMouseEnter={() => setLogoHover(true)}
              onMouseLeave={() => setLogoHover(false)}
              className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-stone-100 transition-colors shrink-0"
            >
              {logoHover ? (
                <PanelLeftClose className="w-4 h-4 text-stone-500" />
              ) : (
                <FileText className="w-4 h-4 text-[#005149]" />
              )}
            </button>
            <span className="text-sm font-semibold text-stone-700 truncate">Resume Builder</span>
          </div>
        ) : (
          <button
            onClick={() => setExpanded(true)}
            onMouseEnter={() => setLogoHover(true)}
            onMouseLeave={() => setLogoHover(false)}
            className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-stone-100 transition-colors"
          >
            {logoHover ? (
              <PanelLeft className="w-4 h-4 text-stone-500" />
            ) : (
              <FileText className="w-4 h-4 text-[#005149]" />
            )}
          </button>
        )}
      </div>

      {/* Actions + Nav */}
      <div className={`py-2 space-y-0.5 ${expanded ? "px-3" : "px-2"}`}>
        <button
          onClick={() => { createSession(); setSidebarView("chat"); }}
          className={`w-full flex items-center gap-2.5 rounded-lg text-stone-500 hover:bg-stone-100 transition-colors ${
            expanded ? "px-3 py-2 text-sm" : "justify-center py-2.5"
          }`}
          title="New resume"
        >
          <Plus className="w-4 h-4 shrink-0" />
          {expanded && <span>New resume</span>}
        </button>
        <button
          onClick={() => setSidebarView("chat")}
          className={`w-full flex items-center gap-2.5 rounded-lg transition-colors ${
            expanded ? "px-3 py-2 text-sm" : "justify-center py-2.5"
          } ${sidebarView === "chat" ? "bg-stone-200/60 text-stone-800 font-medium" : "text-stone-500 hover:bg-stone-100"}`}
          title="Chat"
        >
          <MessageSquare className="w-4 h-4 shrink-0" />
          {expanded && <span>Chat</span>}
        </button>
        <button
          onClick={() => setSidebarView("vault")}
          className={`w-full flex items-center gap-2.5 rounded-lg transition-colors ${
            expanded ? "px-3 py-2 text-sm" : "justify-center py-2.5"
          } ${sidebarView === "vault" ? "bg-stone-200/60 text-stone-800 font-medium" : "text-stone-500 hover:bg-stone-100"}`}
          title="Career Vault"
        >
          <Archive className="w-4 h-4 shrink-0" />
          {expanded && <span>Career Vault</span>}
        </button>
        {/* Design mode accessed via resume preview hover button */}
      </div>

      {/* Resumes list — only when expanded */}
      {expanded ? (
        <div className="flex-1 overflow-y-auto px-3 pt-2">
          {sessions.length > 0 && (
            <>
              <p className="text-[11px] font-medium text-stone-400 uppercase tracking-wider px-3 pb-2">Resumes</p>
              <div className="space-y-0.5">
                {sessions.map((s) => (
                  <div
                    key={s.id}
                    className={`group flex items-center justify-between px-3 py-2 rounded-lg cursor-pointer transition-colors ${
                      s.id === activeSessionId && sidebarView === "chat"
                        ? "bg-stone-200/50 text-stone-800"
                        : "text-stone-600 hover:bg-stone-100"
                    }`}
                    onClick={() => { switchSession(s.id); setSidebarView("chat"); }}
                  >
                    <p className="text-sm truncate">{s.name}</p>
                    {sessions.length > 1 && (
                      <button
                        onClick={(e) => { e.stopPropagation(); deleteSession(s.id); }}
                        className="opacity-0 group-hover:opacity-100 text-stone-300 hover:text-red-400 transition-all p-0.5 shrink-0"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      ) : (
        <div className="flex-1" />
      )}

      {/* Bottom */}
      {expanded && (
        <div className="px-4 pb-3 pt-2 border-t border-stone-200">
          <p className="text-stone-300 text-[10px] px-2">Prototype v4</p>
        </div>
      )}
    </div>
  );
}
