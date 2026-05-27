// キーワードベースの横断検索 (Hacker News Algolia + Qiita + Zenn topic)
// Algolia は最新順ソート、Qiita はキーワード検索

import Parser from 'rss-parser';
import { Article } from '../types';

const rssParser = new Parser();

// 指定日数前の Unix timestamp
function sinceUnix(daysAgo: number): number {
  return Math.floor(Date.now() / 1000) - daysAgo * 24 * 3600;
}

// ---- Hacker News (Algolia 最新順) ----
interface HNHit {
  objectID: string;
  title: string;
  url?: string;
  created_at: string;
}

async function searchHackerNews(keyword: string, daysAgo: number): Promise<Article[]> {
  const since = sinceUnix(daysAgo);
  const data = await fetch(
    `https://hn.algolia.com/api/v1/search_by_date?query=${encodeURIComponent(keyword)}&tags=story&numericFilters=created_at_i>${since}&hitsPerPage=8`,
    { next: { revalidate: 3600 } }
  ).then((r) => r.json());

  const hits: HNHit[] = data?.hits ?? [];
  return hits
    .filter((h) => h.url)
    .map((h) => ({
      id: `hn-${h.objectID}`,
      title: h.title,
      url: h.url!,
      source: 'Hacker News',
      category: 'general' as const,
      keyword,
      publishedAt: h.created_at,
      fetchedAt: new Date().toISOString(),
    }));
}

// ---- Qiita (キーワード検索・最新順) ----
interface QiitaItem {
  id: string;
  title: string;
  url: string;
  created_at: string;
}

async function searchQiita(keyword: string, daysAgo: number): Promise<Article[]> {
  const since = new Date(Date.now() - daysAgo * 24 * 3600 * 1000).toISOString().split('T')[0];
  const data = await fetch(
    `https://qiita.com/api/v2/items?query=${encodeURIComponent(keyword)}+created:>=${since}&per_page=8&sort=created`,
    { next: { revalidate: 3600 } }
  ).then((r) => r.json());

  if (!Array.isArray(data)) return [];
  return (data as QiitaItem[]).map((item) => ({
    id: `qiita-${item.id}`,
    title: item.title,
    url: item.url,
    source: 'Qiita',
    category: 'general' as const,
    keyword,
    publishedAt: item.created_at,
    fetchedAt: new Date().toISOString(),
  }));
}

// ---- Zenn topic (キーワードがトピック名として存在する場合のみ) ----
async function searchZennTopic(keyword: string): Promise<Article[]> {
  const topic = keyword.toLowerCase().replace(/[\s.+#]/g, '');
  try {
    const feed = await rssParser.parseURL(`https://zenn.dev/topics/${topic}/feed`);
    return feed.items.slice(0, 6).map((item) => ({
      id: `zenn-${topic}-${encodeURIComponent(item.link ?? '').slice(-20)}`,
      title: item.title ?? '',
      url: item.link ?? '',
      summary: item.contentSnippet?.slice(0, 200) || undefined,
      source: 'Zenn',
      category: 'general' as const,
      keyword,
      publishedAt: item.pubDate ? new Date(item.pubDate).toISOString() : new Date().toISOString(),
      fetchedAt: new Date().toISOString(),
    }));
  } catch {
    return []; // トピックが存在しない場合はスキップ
  }
}

// ---- 1キーワードで全ソースを並列検索 ----
export async function searchByKeyword(keyword: string, daysAgo = 7): Promise<Article[]> {
  const results = await Promise.allSettled([
    searchHackerNews(keyword, daysAgo),
    searchQiita(keyword, daysAgo),
    searchZennTopic(keyword),
  ]);

  const articles: Article[] = [];
  for (const r of results) {
    if (r.status === 'fulfilled') articles.push(...r.value);
  }
  return articles;
}

// ---- 複数キーワードを並列検索してマージ ----
export async function searchByKeywords(keywords: string[], daysAgo = 7): Promise<Article[]> {
  const results = await Promise.allSettled(keywords.map((kw) => searchByKeyword(kw, daysAgo)));

  const articles: Article[] = [];
  for (const r of results) {
    if (r.status === 'fulfilled') articles.push(...r.value);
  }

  // URL 重複排除（同じ記事が複数キーワードにヒットする場合、最初のキーワードを残す）
  const seen = new Set<string>();
  return articles.filter((a) => {
    if (!a.url || seen.has(a.url)) return false;
    seen.add(a.url);
    return true;
  });
}
