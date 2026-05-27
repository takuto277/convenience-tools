import { NextResponse } from 'next/server';
import { fetchAllFeeds } from '@/lib/feeds';
import { saveArticles } from '@/lib/storage';

export const dynamic = 'force-dynamic';

// 強制的に最新情報を取得して保存
export async function POST() {
  try {
    const articles = await fetchAllFeeds();
    saveArticles(articles);
    return NextResponse.json({
      success: true,
      count: articles.length,
      lastFetched: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Failed to fetch feeds:', error);
    return NextResponse.json({ error: 'Failed to fetch feeds' }, { status: 500 });
  }
}
