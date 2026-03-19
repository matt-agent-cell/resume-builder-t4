"use client";

import { useState, useRef, useEffect } from "react";

interface InlineEditProps {
  value: string;
  onSave: (value: string) => void;
  multiline?: boolean;
  className?: string;
  placeholder?: string;
  style?: React.CSSProperties;
}

export default function InlineEdit({ value, onSave, multiline, className = "", placeholder = "Type something...", style }: InlineEditProps) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(value);
  const ref = useRef<HTMLTextAreaElement | HTMLInputElement>(null);

  useEffect(() => { setDraft(value); }, [value]);

  useEffect(() => {
    if (editing && ref.current) {
      ref.current.focus();
      // Move cursor to end
      const len = ref.current.value.length;
      ref.current.setSelectionRange(len, len);
      // Auto-resize textarea
      if (multiline && ref.current instanceof HTMLTextAreaElement) {
        ref.current.style.height = "auto";
        ref.current.style.height = ref.current.scrollHeight + "px";
      }
    }
  }, [editing, multiline]);

  const save = () => {
    setEditing(false);
    if (draft !== value) onSave(draft);
  };

  const cancel = () => { setEditing(false); setDraft(value); };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !multiline) { e.preventDefault(); save(); }
    if (e.key === "Enter" && multiline && e.metaKey) { e.preventDefault(); save(); }
    if (e.key === "Escape") cancel();
  };

  if (editing) {
    const sharedClass = `bg-transparent outline-none w-full rounded-sm ring-0 border-0 p-0 m-0 ${className}`;

    if (multiline) {
      return (
        <textarea
          ref={ref as React.RefObject<HTMLTextAreaElement>}
          value={draft}
          onChange={(e) => {
            setDraft(e.target.value);
            e.target.style.height = "auto";
            e.target.style.height = e.target.scrollHeight + "px";
          }}
          onBlur={save}
          onKeyDown={handleKeyDown}
          className={`${sharedClass} resize-none overflow-hidden`}
          rows={1}
        />
      );
    }

    return (
      <input
        ref={ref as React.RefObject<HTMLInputElement>}
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        onBlur={save}
        onKeyDown={handleKeyDown}
        className={sharedClass}
      />
    );
  }

  return (
    <span
      className={`cursor-text rounded-sm transition-colors duration-150 hover:bg-[#005149]/5 ${className}`}
      style={style}
      onClick={() => setEditing(true)}
    >
      {value || <span className="text-stone-300 italic">{placeholder}</span>}
    </span>
  );
}
