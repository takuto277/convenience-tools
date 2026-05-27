import { Article, Category } from '../types';

interface DevToArticle {
  id: number;
  title: string;
  url: string;
  description: string;
  published_at: string;
}

const TAGS: { tag: string; category: Category }[] = [
  { tag: 'javascript', category: 'frontend' },
  { tag: 'typescript', category: 'frontend' },
  { tag: 'go', category: 'go' },
  { tag: 'ai', category: 'ai' },
  { tag: 'machinelearning', category: 'ai' },
  { tag: 'ios', category: 'mobile' },
  { tag: 'android', category: 'mobile' },
];

export async function fetchDevTo(): Promise<Article[]> {
  const articles: Article[] = [];

  await Promise.allSettled(
    TAGS.map(async ({ tag, category }) => {
      const data: DevToArticle[] = await fetch(
        `https://dev.to/api/articles?tag=${tag}&per_page=3&top=1`,
        { next: { revalidate: 3600 } }
      ).then((r) => r.json());

      for (const item of data) {
        articles.push({
          id: `devto-${item.id}`,
          title: item.title,
          url: item.url,
          summary: item.description || undefined,
          source: 'dev.to',
          category,
          publishedAt: item.published_at,
          fetchedAt: new Date().toISOString(),
        });
      }
    })
  );

  return articles;
}
