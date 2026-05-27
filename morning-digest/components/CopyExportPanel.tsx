'use client';

import { Article } from '@/lib/types';
import { CopyButton } from './CopyButton';

interface Props {
  articles: Article[];
  label?: string;
}

/** 全記事一括コピーバー */
export function CopyExportPanel({ articles, label }: Props) {
  if (articles.length === 0) return null;

  return (
    <div className="bg-white border border-gray-200 rounded-xl px-4 py-3 mb-5 shadow-sm">
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-sm text-gray-500 font-medium">
          {label ?? '全記事'}
          <span className="text-gray-400 ml-1">({articles.length}件)</span>
        </span>

        <div className="flex-1" />

        <CopyButton
          articles={articles}
          mode="urls"
          label="📋 URLを一括コピー"
          className="px-3 py-1.5 rounded-lg text-sm font-medium bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors"
        />
        <CopyButton
          articles={articles}
          mode="titles"
          label="📋 タイトル+URLを一括コピー"
          className="px-3 py-1.5 rounded-lg text-sm font-medium bg-blue-600 text-white hover:bg-blue-700 transition-colors"
        />
        <CopyButton
          articles={articles}
          mode="prompt"
          label="🤖 AIプロンプト付き"
          className="px-3 py-1.5 rounded-lg text-sm font-medium bg-purple-600 text-white hover:bg-purple-700 transition-colors"
        />
      </div>
    </div>
  );
}
