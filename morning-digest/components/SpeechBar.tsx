'use client';

import { Article } from '@/lib/types';
import { SpeechControls } from '@/hooks/useSpeech';

interface Props {
  articles: Article[];
  speech: SpeechControls;
  onOpenSettings: () => void;
}

export function SpeechBar({ articles, speech, onOpenSettings }: Props) {
  const { isPlaying, isPaused, currentIndex, total, currentTitle, play, pause, resume, stop } =
    speech;

  if (!isPlaying) {
    return (
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-4 py-3 flex items-center gap-3 shadow-lg z-20">
        <button
          onClick={onOpenSettings}
          className="p-2 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors flex-shrink-0"
          title="音声設定"
        >
          ⚙️
        </button>
        <span className="text-gray-400 text-sm flex-1 truncate">
          {articles.length > 0
            ? `${articles.length} 件の記事`
            : '「更新」ボタンで記事を取得してください'}
        </span>
        <button
          onClick={() => play(articles)}
          disabled={articles.length === 0}
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors flex-shrink-0"
        >
          ▶ すべて読み上げる
        </button>
      </div>
    );
  }

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-blue-600 text-white px-4 py-3 flex items-center gap-3 shadow-lg z-20">
      {/* 進捗 + タイトル */}
      <div className="flex-1 min-w-0">
        <div className="text-xs opacity-70 mb-0.5">
          🎙️ {currentIndex + 1} / {total} 件目
        </div>
        <div className="text-sm font-medium truncate">{currentTitle ?? '...'}</div>
      </div>

      {/* コントロール */}
      <div className="flex items-center gap-2 flex-shrink-0">
        {isPaused ? (
          <button
            onClick={resume}
            className="p-2 rounded-lg bg-white/20 hover:bg-white/30 transition-colors"
            title="再開"
          >
            ▶
          </button>
        ) : (
          <button
            onClick={pause}
            className="p-2 rounded-lg bg-white/20 hover:bg-white/30 transition-colors"
            title="一時停止"
          >
            ⏸
          </button>
        )}

        {/* 停止ボタン — 赤く目立つ */}
        <button
          onClick={stop}
          className="flex items-center gap-1 px-3 py-2 rounded-lg bg-red-500 hover:bg-red-600 text-white text-sm font-semibold transition-colors"
          title="停止"
        >
          ■ 停止
        </button>
      </div>
    </div>
  );
}
