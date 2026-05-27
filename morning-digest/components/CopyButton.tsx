'use client';

import { useState } from 'react';
import { Article } from '@/lib/types';

export type CopyMode = 'urls' | 'titles' | 'prompt';

const PROMPT_PREFIX = `以下の技術記事を読んで、エンジニアとして重要なポイントを整理してください。

## 出力形式
### 📊 今日のトレンドサマリー
[全体的な傾向と注目トピック]

### 📌 記事別ポイント
[各記事の重要ポイントを箇条書き]

### 💡 覚えておくべきこと
[API変更・新機能・注意点など]

### ✅ アクションアイテム
- [ ] 試したいこと
- [ ] 深掘りしたいこと

---

`;

/** 記事リストをコピー用テキストにフォーマット */
export function formatArticlesForCopy(articles: Article[], mode: CopyMode): string {
  if (articles.length === 0) return '';

  // キーワードまたはカテゴリでグループ化
  const groups = articles.reduce<Record<string, Article[]>>((acc, a) => {
    const g = a.keyword ?? a.category ?? 'その他';
    (acc[g] ??= []).push(a);
    return acc;
  }, {});

  const body = Object.entries(groups)
    .map(([group, arts]) => {
      const header = `## ${group} (${arts.length}件)`;
      const items =
        mode === 'urls'
          ? arts.map((a) => a.url).join('\n')
          : arts
              .map((a) => `■ ${a.title}\n  ${a.url}`)
              .join('\n\n');
      return `${header}\n${items}`;
    })
    .join('\n\n');

  return mode === 'prompt' ? PROMPT_PREFIX + body : body;
}

interface Props {
  articles: Article[];
  mode: CopyMode;
  label: string;
  className?: string;
  /** クリックイベントの伝播を止める（セクションヘッダー等で使用） */
  stopPropagation?: boolean;
}

export function CopyButton({ articles, mode, label, className, stopPropagation }: Props) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async (e: React.MouseEvent) => {
    if (stopPropagation) e.stopPropagation();
    if (articles.length === 0) return;
    await navigator.clipboard.writeText(formatArticlesForCopy(articles, mode));
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <button
      onClick={handleCopy}
      disabled={articles.length === 0}
      className={className}
    >
      {copied ? '✓ コピー済み' : label}
    </button>
  );
}
