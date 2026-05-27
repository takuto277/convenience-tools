import Parser from 'rss-parser';
import { Article, Category } from '../types';

const parser = new Parser();

const TOPIC_FEEDS: { topic: string; category: Category }[] = [
  { topic: 'javascript', category: 'frontend' },
  { topic: 'typescript', category: 'frontend' },
  { topic: 'go', category: 'go' },
  { topic: 'ai', category: 'ai' },
  { topic: 'ios', category: 'mobile' },
  { topic: 'android', category: 'mobile' },
];

export async function fetchZenn(): Promise<Article[]> {
  const articles: Article[] = [];

  await Promise.allSettled(
    TOPIC_FEEDS.map(async ({ topic, category }) => {
      const feed = await parser.parseURL(`https://zenn.dev/topics/${topic}/feed`);
      for (const item of feed.items.slice(0, 5)) {
        if (!item.title || !item.link) continue;
        articles.push({
          id: `zenn-${topic}-${encodeURIComponent(item.link).slice(-20)}`,
          title: item.title,
          url: item.link,
          summary: item.contentSnippet?.slice(0, 200) || undefined,
          source: 'Zenn',
          category,
          publishedAt: item.pubDate
            ? new Date(item.pubDate).toISOString()
            : new Date().toISOString(),
          fetchedAt: new Date().toISOString(),
        });
      }
    })
  );

  return articles;
}
