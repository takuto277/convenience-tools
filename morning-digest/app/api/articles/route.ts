import { NextResponse } from 'next/server';
import { loadArticles, saveArticles, isStale } from '@/lib/storage';
import { fetchAllFeeds } from '@/lib/feeds';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const cached = loadArticles();
    if (cached && !isStale(cached.lastFetched)) {
      return NextResponse.json(cached);
    }

    // キャッシュなし or 古い場合は新規取得
    const articles = await fetchAllFeeds();
    saveArticles(articles);
    return NextResponse.json({ articles, lastFetched: new Date().toISOString() });
  } catch (error) {
    console.error('Failed to get articles:', error);
    return NextResponse.json({ error: 'Failed to fetch articles' }, { status: 500 });
  }
}
