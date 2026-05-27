import { Article, Category } from '../types';

interface QiitaItem {
  id: string;
  title: string;
  url: string;
  created_at: string;
  tags: { name: string }[];
}

// タグごとに個別クエリ（OR構文を使わず安定的に取得）
const QUERIES: { query: string; category: Category }[] = [
  { query: 'tag:JavaScript', category: 'frontend' },
  { query: 'tag:TypeScript', category: 'frontend' },
  { query: 'tag:Go', category: 'go' },
  { query: 'tag:ChatGPT', category: 'ai' },
  { query: 'tag:LLM', category: 'ai' },
  { query: 'tag:機械学習', category: 'ai' },
  { query: 'tag:iOS', category: 'mobile' },
  { query: 'tag:Android', category: 'mobile' },
];

export async function fetchQiita(): Promise<Article[]> {
  const articles: Article[] = [];

  await Promise.allSettled(
    QUERIES.map(async ({ query, category }) => {
      const data: QiitaItem[] = await fetch(
        `https://qiita.com/api/v2/items?query=${encodeURIComponent(query)}&per_page=4`,
        { next: { revalidate: 3600 } }
      ).then((r) => r.json());

      if (!Array.isArray(data)) return;

      for (const item of data) {
        articles.push({
          id: `qiita-${item.id}`,
          title: item.title,
          url: item.url,
          source: 'Qiita',
          category,
          publishedAt: item.created_at,
          fetchedAt: new Date().toISOString(),
        });
      }
    })
  );

  return articles;
}
