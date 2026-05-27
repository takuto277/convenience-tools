import { fetchZenn } from './fetchers/zenn';
import { fetchQiita } from './fetchers/qiita';
import { Article } from './types';

// 日本語ソースのみ（Zenn + Qiita）
export async function fetchAllFeeds(): Promise<Article[]> {
  const results = await Promise.allSettled([
    fetchZenn(),
    fetchQiita(),
  ]);

  const articles: Article[] = [];
  for (const result of results) {
    if (result.status === 'fulfilled') {
      articles.push(...result.value);
    } else {
      console.error('Feed fetch failed:', result.reason);
    }
  }

  // URL重複排除
  const seen = new Set<string>();
  return articles.filter((a) => {
    if (seen.has(a.url)) return false;
    seen.add(a.url);
    return true;
  });
}
