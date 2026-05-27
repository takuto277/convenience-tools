'use client';

import { useRef, useState } from 'react';

interface Props {
  keywords: string[];
  onChange: (keywords: string[]) => void;
  onFetch: () => void;
  loading: boolean;
}

export function KeywordInput({ keywords, onChange, onFetch, loading }: Props) {
  const [input, setInput] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  const addKeyword = (raw: string) => {
    // カンマ区切りで複数追加も対応
    const items = raw.split(/[,、]/).map((s) => s.trim()).filter(Boolean);
    const newKws = items.filter((k) => !keywords.includes(k));
    if (newKws.length > 0) onChange([...keywords, ...newKws]);
    setInput('');
  };

  const removeKeyword = (kw: string) => onChange(keywords.filter((k) => k !== kw));

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (input) {
        addKeyword(input);
      } else {
        onFetch();
      }
    } else if (e.key === ',') {
      e.preventDefault();
      if (input) addKeyword(input);
    } else if (e.key === 'Backspace' && !input && keywords.length > 0) {
      removeKeyword(keywords[keywords.length - 1]);
    }
  };

  return (
    <div className="flex items-start gap-2">
      {/* タグ入力エリア */}
      <div
        className="flex-1 flex flex-wrap gap-1.5 items-center border border-gray-200 rounded-xl px-3 py-2 bg-white focus-within:ring-2 focus-within:ring-blue-400 cursor-text min-h-[42px]"
        onClick={() => inputRef.current?.focus()}
      >
        {keywords.map((kw) => (
          <span
            key={kw}
            className="inline-flex items-center gap-1 bg-blue-100 text-blue-700 px-2.5 py-0.5 rounded-full text-sm font-medium"
          >
            {kw}
            <button
              onClick={(e) => { e.stopPropagation(); removeKeyword(kw); }}
              className="text-blue-400 hover:text-blue-700 leading-none ml-0.5"
            >
              ×
            </button>
          </span>
        ))}
        <input
          ref={inputRef}
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          onBlur={() => { if (input) addKeyword(input); }}
          placeholder={keywords.length === 0 ? 'キーワードを入力 (例: Swift, Claude, Cursor)' : '+ 追加...'}
          className="flex-1 outline-none text-sm min-w-28 bg-transparent placeholder:text-gray-300"
        />
      </div>

      {/* 取得ボタン */}
      <button
        onClick={onFetch}
        disabled={keywords.length === 0 || loading}
        className="flex items-center gap-1.5 bg-blue-600 text-white px-4 py-2 rounded-xl text-sm font-semibold hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors whitespace-nowrap h-[42px]"
      >
        <span className={loading ? 'inline-block animate-spin' : ''}>🔍</span>
        {loading ? '取得中...' : '最新を取得'}
      </button>
    </div>
  );
}
