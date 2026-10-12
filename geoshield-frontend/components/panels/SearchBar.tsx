'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';

interface SearchBarProps {
  onSearch: (cellId: string) => void;
  searching: boolean;
  error: string | null;
  disabled?: boolean;
}

export default function SearchBar({ onSearch, searching, error, disabled = false }: SearchBarProps) {
  const [value, setValue] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  const handleSubmit = useCallback(
    (e?: React.FormEvent) => {
      e?.preventDefault();
      if (disabled) return;
      const trimmed = value.trim().toLowerCase();
      if (!trimmed) return;
      onSearch(trimmed);
    },
    [value, onSearch, disabled],
  );

  const fillExample = useCallback(
    (id: string) => {
      if (disabled) return;
      setValue(id);
      onSearch(id);
    },
    [onSearch, disabled],
  );

  // Keyboard shortcut: / to focus
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === '/' && document.activeElement?.tagName !== 'INPUT' && !disabled) {
        e.preventDefault();
        inputRef.current?.focus();
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [disabled]);

  const formatHint = value.trim().length > 0 && !/^r\d{4}_c\d{4}$/i.test(value.trim());

  return (
    <div className="absolute top-4 left-4 z-20 w-76 md:w-84 font-sans rounded border border-slate-700/90 bg-[#0d1527]/96 p-2 shadow-xl backdrop-blur-xs">
      <form onSubmit={handleSubmit} className="relative flex items-center">
        <input
          ref={inputRef}
          type="text"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder="Search cell ID (e.g. r0142_c0087)"
          aria-label="Search cell ID"
          className="h-8.5 w-full rounded border border-slate-400 bg-[#152238] pl-3 pr-14 text-xs font-normal text-slate-50 placeholder:text-slate-300 placeholder:opacity-100 focus:border-sky-400 focus:outline-none focus:ring-1 focus:ring-sky-400 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          disabled={searching || disabled}
        />
        <button
          type="submit"
          disabled={searching || disabled || !value.trim()}
          className="absolute right-1 top-1/2 -translate-y-1/2 h-6.5 rounded px-2.5 text-xs font-medium text-white bg-sky-600 hover:bg-sky-500 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-sky-300 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          aria-label="Search"
        >
          {searching ? '...' : 'Go'}
        </button>
      </form>

      {formatHint && !error && (
        <p className="mt-1.5 text-[11px] font-mono text-amber-300 px-0.5">
          Cell IDs look like r0142_c0087
        </p>
      )}

      {error && (
        <div
          role="alert"
          aria-live="assertive"
          className="mt-1.5 rounded border border-red-500/70 bg-red-950/95 px-2.5 py-1.5 text-xs text-red-100"
        >
          {error}
        </div>
      )}

      <div className="mt-2 flex items-center gap-2 px-0.5">
        <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-300 shrink-0">
          QUICK:
        </span>
        <div className="flex items-center gap-1.5 flex-wrap">
          <button
            type="button"
            onClick={() => fillExample('r0142_c0087')}
            disabled={disabled}
            className="h-7 inline-flex items-center rounded border border-slate-400 bg-slate-800/90 px-2.5 text-xs font-mono font-medium text-slate-100 hover:text-white hover:bg-slate-700 hover:border-slate-300 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-sky-400 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            r0142_c0087
          </button>
          <button
            type="button"
            onClick={() => fillExample('r0137_c0204')}
            disabled={disabled}
            className="h-7 inline-flex items-center rounded border border-slate-400 bg-slate-800/90 px-2.5 text-xs font-mono font-medium text-slate-100 hover:text-white hover:bg-slate-700 hover:border-slate-300 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-sky-400 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            r0137_c0204
          </button>
        </div>
      </div>
    </div>
  );
}
