'use client';

import { Article, Category } from '@/lib/types';

const CATEGORY_STYLES: Record<Category, string> = {
  frontend: 'bg-blue-100 text-blue-700',
  go: 'bg-cyan-100 text-cyan-700',
  ai: 'bg-purple-100 text-purple-700',
  mobile: 'bg-green-100 text-green-700',
  general: 'bg-orange-100 text-orange-700',
};

const CATEGORY_LABELS: Record<Category, string> = {
  frontend: 'Frontend',
  go: 'Go',
  ai: 'AI/ML',
  mobile: 'Mobile',
  general: 'General',
};

interface Props {
  article: Article;
  onRead: (article: Article) => void;
  isReading: boolean;
}

export function ArticleCard({ article, onRead, isReading }: Props) {
  const date = new Date(article.publishedAt).toLocaleDateString('ja-JP', {
    month: 'short',
    day: 'numeric',
  });

  return (
    <div
      className={`bg-white rounded-xl shadow-sm border flex flex-col gap-2 p-4 transition-all ${
        isReading
          ? 'border-blue-400 shadow-blue-100 shadow-md'
          : 'border-gray-100 hover:shadow-md'
      }`}
    >
      <div className="flex items-center gap-2 text-xs text-gray-500">
        <span
          className={`px-2 py-0.5 rounded-full font-medium ${CATEGORY_STYLES[article.category]}`}
        >
          {CATEGORY_LABELS[article.category]}
        </span>
        <span className="font-medium text-gray-600">{article.source}</span>
        <span className="ml-auto">{date}</span>
      </div>

      <h3 className="text-sm font-semibold text-gray-900 leading-snug line-clamp-3">
        {article.title}
      </h3>

      {article.summary && (
        <p className="text-xs text-gray-400 line-clamp-2">{article.summary}</p>
      )}

      <div className="flex items-center gap-2 mt-auto pt-1">
        <button
          onClick={() => onRead(article)}
          className={`flex items-center gap-1 text-xs px-2 py-1 rounded-md transition-colors ${
            isReading
              ? 'bg-blue-500 text-white'
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
        >
          {isReading ? '⏸ 読み上げ中' : '🔊 読む'}
        </button>
        <a
          href={article.url}
          target="_blank"
          rel="noopener noreferrer"
          className="ml-auto text-xs text-blue-500 hover:text-blue-700"
        >
          開く →
        </a>
      </div>
    </div>
  );
}
