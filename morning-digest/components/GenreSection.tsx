'use client';

import { useState } from 'react';
import { Article, Category } from '@/lib/types';
import { ArticleCard } from './ArticleCard';

const CATEGORY_STYLES: Record<Category, string> = {
  frontend: 'bg-blue-100 text-blue-700 ring-blue-300',
  go: 'bg-cyan-100 text-cyan-700 ring-cyan-300',
  ai: 'bg-purple-100 text-purple-700 ring-purple-300',
  mobile: 'bg-green-100 text-green-700 ring-green-300',
  general: 'bg-orange-100 text-orange-700 ring-orange-300',
};

const CATEGORY_LABELS: Record<Category, string> = {
  frontend: 'Frontend',
  go: 'Go',
  ai: 'AI / ML',
  mobile: 'Mobile',
  general: 'General',
};

const CATEGORY_EMOJI: Record<Category, string> = {
  frontend: '🌐',
  go: '🐹',
  ai: '🤖',
  mobile: '📱',
  general: '📰',
};

interface Props {
  genre: Category;
  articles: Article[];
  onRead: (article: Article) => void;
  onPlayAll: (articles: Article[]) => void;
  readingId: string | null;
}

export function GenreSection({ genre, articles, onRead, onPlayAll, readingId }: Props) {
  const [open, setOpen] = useState(true);

  return (
    <section className="mb-8">
      {/* セクションヘッダー */}
      <div
        className="flex items-center gap-2 mb-3 cursor-pointer group select-none"
        onClick={() => setOpen((v) => !v)}
      >
        <span
          className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-semibold ${CATEGORY_STYLES[genre]}`}
        >
          {CATEGORY_EMOJI[genre]} {CATEGORY_LABELS[genre]}
        </span>
        <span className="text-xs text-gray-400 font-medium">{articles.length}件</span>

        {/* ホバー時: ジャンル一括読み上げボタン */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onPlayAll(articles);
          }}
          className="ml-auto text-xs text-blue-500 hover:text-blue-700 flex items-center gap-1 px-2 py-1 rounded-lg hover:bg-blue-50 transition-all opacity-0 group-hover:opacity-100"
        >
          ▶ このジャンルを読む
        </button>

        <span className="text-gray-300 text-sm ml-1">{open ? '▲' : '▼'}</span>
      </div>

      {open && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {articles.map((article) => (
            <ArticleCard
              key={article.id}
              article={article}
              onRead={onRead}
              isReading={readingId === article.id}
            />
          ))}
        </div>
      )}
    </section>
  );
}
