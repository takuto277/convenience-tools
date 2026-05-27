import { NextRequest, NextResponse } from 'next/server';
import { searchByKeywords } from '@/lib/fetchers/search';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as { keywords?: unknown; daysAgo?: unknown };
    const keywords = body.keywords;
    const daysAgo = typeof body.daysAgo === 'number' ? Math.min(Math.max(body.daysAgo, 1), 365) : 7;

    if (!Array.isArray(keywords) || keywords.length === 0) {
      return NextResponse.json({ error: 'keywords array is required' }, { status: 400 });
    }

    // 文字列のみ受け付ける（セキュリティ: 入力値をバリデート）
    const validKeywords = keywords
      .filter((k): k is string => typeof k === 'string')
      .map((k) => k.trim().slice(0, 50))
      .filter(Boolean)
      .slice(0, 20); // 最大20キーワード

    if (validKeywords.length === 0) {
      return NextResponse.json({ error: 'No valid keywords' }, { status: 400 });
    }

    const articles = await searchByKeywords(validKeywords, daysAgo);
    return NextResponse.json({ articles, fetchedAt: new Date().toISOString() });
  } catch (error) {
    console.error('Search failed:', error);
    return NextResponse.json({ error: 'Search failed' }, { status: 500 });
  }
}
