import { Article, FeedData } from './types';

// インメモリキャッシュ（Vercel本番環境でも機能する）
let memoryCache: FeedData | null = null;

export function saveArticles(articles: Article[]): void {
  const data: FeedData = {
    articles,
    lastFetched: new Date().toISOString(),
  };
  memoryCache = data;

  // ローカル環境ではファイルに永続化（Vercelでは read-only なので無視）
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const fs = require('fs') as typeof import('fs');
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const path = require('path') as typeof import('path');
    const dir = path.join(process.cwd(), 'data');
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(path.join(dir, 'articles.json'), JSON.stringify(data, null, 2), 'utf-8');
  } catch {
    // 読み取り専用ファイルシステム（Vercel）ではスキップ
  }
}

export function loadArticles(): FeedData | null {
  if (memoryCache) return memoryCache;

  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const fs = require('fs') as typeof import('fs');
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const path = require('path') as typeof import('path');
    const file = path.join(process.cwd(), 'data', 'articles.json');
    if (fs.existsSync(file)) {
      const raw = fs.readFileSync(file, 'utf-8');
      memoryCache = JSON.parse(raw) as FeedData;
      return memoryCache;
    }
  } catch {
    // 無視
  }

  return null;
}

export function isStale(lastFetched: string, maxAgeMinutes = 60): boolean {
  return Date.now() - new Date(lastFetched).getTime() > maxAgeMinutes * 60 * 1000;
}
