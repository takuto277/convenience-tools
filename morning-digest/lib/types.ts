export type Category = 'frontend' | 'go' | 'ai' | 'mobile' | 'general';

export interface Article {
  id: string;
  title: string;
  url: string;
  summary?: string;
  source: string;
  category: Category;
  keyword?: string;   // キーワード検索で使用
  publishedAt: string;
  fetchedAt: string;
}

export interface FeedData {
  articles: Article[];
  lastFetched: string;
}
