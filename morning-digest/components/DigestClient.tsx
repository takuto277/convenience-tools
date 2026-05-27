'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { Article, Category, FeedData } from '@/lib/types';
import { useSpeech, SpeechConfig, DEFAULT_SPEECH_CONFIG } from '@/hooks/useSpeech';
import { KeywordInput } from './KeywordInput';
import { CopyExportPanel } from './CopyExportPanel';
import { CopyButton } from './CopyButton';
import { ArticleCard } from './ArticleCard';
import { SpeechBar } from './SpeechBar';
import { VoiceSettingsModal } from './VoiceSettingsModal';

// ---- 定数 ----
const DEFAULT_KEYWORDS = ['Swift', 'Kotlin', 'Claude', 'Cursor', 'iOS', 'Android', 'AI'];
const GENRE_ORDER: Category[] = ['ai', 'frontend', 'go', 'mobile', 'general'];

type DateRange = '1d' | '3d' | '1w' | '1m' | 'all';
const DATE_OPTIONS: { value: DateRange; label: string; days: number }[] = [
  { value: '1d', label: '1日', days: 1 },
  { value: '3d', label: '3日', days: 3 },
  { value: '1w', label: '1週間', days: 7 },
  { value: '1m', label: '1ヶ月', days: 30 },
  { value: 'all', label: '全期間', days: 36500 },
];

function filterByDate(articles: Article[], range: DateRange): Article[] {
  if (range === 'all') return articles;
  const opt = DATE_OPTIONS.find((o) => o.value === range)!;
  const since = Date.now() - opt.days * 24 * 3600 * 1000;
  return articles.filter((a) => new Date(a.publishedAt).getTime() >= since);
}

// ---- メインコンポーネント ----
export function DigestClient() {
  const [keywords, setKeywords] = useState<string[]>(DEFAULT_KEYWORDS);
  const [searchResults, setSearchResults] = useState<Article[]>([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);
  const [searchFetchedAt, setSearchFetchedAt] = useState<string | null>(null);
  const [dateRange, setDateRange] = useState<DateRange>('1w');

  const [digestData, setDigestData] = useState<FeedData | null>(null);

  const [showSettings, setShowSettings] = useState(false);
  const [speechConfig, setSpeechConfig] = useState<SpeechConfig>(DEFAULT_SPEECH_CONFIG);

  // ---- localStorage 復元 ----
  useEffect(() => {
    try {
      const kws = localStorage.getItem('morning-digest-keywords');
      if (kws) setKeywords(JSON.parse(kws));
      const cfg = localStorage.getItem('morning-digest-voice-config');
      if (cfg) setSpeechConfig({ ...DEFAULT_SPEECH_CONFIG, ...JSON.parse(cfg) });
      const dr = localStorage.getItem('morning-digest-date-range') as DateRange | null;
      if (dr) setDateRange(dr);
    } catch {}
  }, []);

  const updateKeywords = (kws: string[]) => {
    setKeywords(kws);
    try { localStorage.setItem('morning-digest-keywords', JSON.stringify(kws)); } catch {}
  };
  const updateDateRange = (dr: DateRange) => {
    setDateRange(dr);
    try { localStorage.setItem('morning-digest-date-range', dr); } catch {}
  };
  const updateSpeechConfig = (cfg: SpeechConfig) => {
    setSpeechConfig(cfg);
    try { localStorage.setItem('morning-digest-voice-config', JSON.stringify(cfg)); } catch {}
  };

  const speech = useSpeech(speechConfig);

  // ---- キーワード検索 ----
  const handleSearch = useCallback(async () => {
    if (keywords.length === 0) return;
    setSearchLoading(true);
    setSearchError(null);
    const opt = DATE_OPTIONS.find((o) => o.value === dateRange)!;
    try {
      const res = await fetch('/api/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ keywords, daysAgo: opt.days }),
      });
      if (!res.ok) throw new Error();
      const data = (await res.json()) as { articles: Article[]; fetchedAt: string };
      setSearchResults(data.articles);
      setSearchFetchedAt(data.fetchedAt);
    } catch {
      setSearchError('取得に失敗しました。しばらくしてから再試行してください。');
    } finally {
      setSearchLoading(false);
    }
  }, [keywords, dateRange]);

  // ---- ダイジェストフィード（Zenn/Qiita）----
  const loadDigest = useCallback(async () => {
    try {
      const res = await fetch('/api/articles');
      if (res.ok) setDigestData((await res.json()) as FeedData);
    } catch {}
  }, []);
  useEffect(() => { loadDigest(); }, [loadDigest]);

  // ---- 日付フィルター（表示側） ----
  const filteredSearchResults = useMemo(
    () => filterByDate(searchResults, dateRange),
    [searchResults, dateRange]
  );

  // キーワード別グループ
  const articlesByKeyword = useMemo(
    () =>
      keywords.reduce<Record<string, Article[]>>((acc, kw) => {
        acc[kw] = filteredSearchResults.filter((a) => a.keyword === kw);
        return acc;
      }, {}),
    [filteredSearchResults, keywords]
  );
  const unmatchedArticles = filteredSearchResults.filter(
    (a) => !a.keyword || !keywords.includes(a.keyword)
  );

  const lastTime = searchFetchedAt
    ? new Date(searchFetchedAt).toLocaleString('ja-JP', {
        month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit',
      })
    : null;

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* ヘッダー */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-4 pt-3 pb-2">
          {/* タイトル行 */}
          <div className="flex items-center gap-2 mb-2">
            <h1 className="text-base font-bold text-gray-900">🌅 Morning Digest</h1>
            {lastTime && <span className="text-xs text-gray-400">最終取得: {lastTime}</span>}
            <div className="flex-1" />
            <button
              onClick={() => setShowSettings(true)}
              className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 text-sm"
              title="音声設定"
            >⚙️</button>
          </div>

          {/* キーワード入力 */}
          <KeywordInput
            keywords={keywords}
            onChange={updateKeywords}
            onFetch={handleSearch}
            loading={searchLoading}
          />

          {/* 日付フィルター */}
          <div className="flex items-center gap-1.5 mt-2">
            <span className="text-xs text-gray-400">期間:</span>
            {DATE_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                onClick={() => updateDateRange(opt.value)}
                className={`px-2.5 py-0.5 rounded-full text-xs font-medium transition-colors ${
                  dateRange === opt.value
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-5">
        {/* === キーワード検索結果 === */}
        {filteredSearchResults.length > 0 && (
          <>
            {/* 全記事一括コピーバー */}
            <CopyExportPanel
              articles={filteredSearchResults}
              label="表示中の全記事"
            />

            {/* キーワード別セクション */}
            {keywords.map((kw) => {
              const arts = articlesByKeyword[kw] ?? [];
              if (arts.length === 0) return null;
              return (
                <KeywordSection
                  key={kw}
                  keyword={kw}
                  articles={arts}
                  onRead={(a) => speech.playSingle(a)}
                  readingId={speech.readingId}
                  onPlayAll={(a) => speech.play(a)}
                />
              );
            })}

            {unmatchedArticles.length > 0 && (
              <KeywordSection
                keyword="その他"
                articles={unmatchedArticles}
                onRead={(a) => speech.playSingle(a)}
                readingId={speech.readingId}
                onPlayAll={(a) => speech.play(a)}
              />
            )}
          </>
        )}

        {/* エラー */}
        {searchError && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-5 text-sm text-red-600">
            {searchError}
          </div>
        )}

        {/* 初回ガイダンス */}
        {searchResults.length === 0 && !searchLoading && !searchError && (
          <div className="text-center py-12 text-gray-400">
            <div className="text-5xl mb-4">🔍</div>
            <p className="text-sm">キーワードを入力して「最新を取得」してください</p>
            <p className="text-xs mt-1 text-gray-300">
              URLやタイトル+URLを一括コピーしてAIに貼り付けられます
            </p>
          </div>
        )}

        {/* === 朝のダイジェスト（Zenn/Qiita フィード）=== */}
        {searchResults.length === 0 && digestData && digestData.articles.length > 0 && (
          <div className="mt-2">
            <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">
              — 朝のフィード（Zenn / Qiita）
            </h2>
            {/* ダイジェスト全記事コピー */}
            <CopyExportPanel articles={digestData.articles} label="フィード全記事" />

            {GENRE_ORDER.map((genre) => {
              const arts = filterByDate(
                digestData.articles.filter((a) => a.category === genre),
                dateRange
              );
              if (arts.length === 0) return null;
              return (
                <DigestGenreSection
                  key={genre}
                  genre={genre}
                  articles={arts}
                  onRead={(a) => speech.playSingle(a)}
                  readingId={speech.readingId}
                />
              );
            })}
          </div>
        )}
      </main>

      <SpeechBar
        articles={filteredSearchResults.length > 0 ? filteredSearchResults : digestData?.articles ?? []}
        speech={speech}
        onOpenSettings={() => setShowSettings(true)}
      />

      {showSettings && (
        <VoiceSettingsModal
          config={speechConfig}
          onChange={updateSpeechConfig}
          onClose={() => setShowSettings(false)}
        />
      )}
    </div>
  );
}

// ---- キーワードセクション ----
interface KeywordSectionProps {
  keyword: string;
  articles: Article[];
  onRead: (a: Article) => void;
  onPlayAll: (a: Article[]) => void;
  readingId: string | null;
}

function KeywordSection({ keyword, articles, onRead, onPlayAll, readingId }: KeywordSectionProps) {
  const [open, setOpen] = useState(true);

  return (
    <section className="mb-6">
      <div
        className="flex items-center gap-2 mb-3 cursor-pointer group select-none"
        onClick={() => setOpen((v) => !v)}
      >
        {/* キーワードバッジ */}
        <span className="inline-flex items-center bg-gray-900 text-white px-3 py-1 rounded-full text-sm font-semibold">
          {keyword}
        </span>
        <span className="text-xs text-gray-400">{articles.length}件</span>

        {/* セクション別コピーボタン（ホバーで表示） */}
        <div className="ml-auto flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
          <CopyButton
            articles={articles}
            mode="urls"
            label="📋 URL"
            stopPropagation
            className="text-xs px-2 py-1 rounded-md bg-gray-100 text-gray-600 hover:bg-gray-200 transition-colors"
          />
          <CopyButton
            articles={articles}
            mode="titles"
            label="📋 タイトル+URL"
            stopPropagation
            className="text-xs px-2 py-1 rounded-md bg-blue-100 text-blue-700 hover:bg-blue-200 transition-colors"
          />
          <button
            onClick={(e) => { e.stopPropagation(); onPlayAll(articles); }}
            className="text-xs px-2 py-1 rounded-md bg-gray-100 text-gray-600 hover:bg-gray-200 transition-colors"
          >
            ▶ 読み上げ
          </button>
        </div>

        <span className="text-gray-300 text-sm ml-1">{open ? '▲' : '▼'}</span>
      </div>

      {open && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {articles.map((article) => (
            <ArticleCard
              key={article.id}
              article={article}
              onRead={onRead}
              isReading={readingId === article.id}
            />
          ))}
        </div>
      )}
    </section>
  );
}

// ---- ダイジェストジャンルセクション ----
const GENRE_LABELS: Record<Category, string> = {
  frontend: '🌐 Frontend', go: '🐹 Go', ai: '🤖 AI/ML', mobile: '📱 Mobile', general: '📰 General',
};
const GENRE_STYLES: Record<Category, string> = {
  frontend: 'bg-blue-100 text-blue-700',
  go: 'bg-cyan-100 text-cyan-700',
  ai: 'bg-purple-100 text-purple-700',
  mobile: 'bg-green-100 text-green-700',
  general: 'bg-orange-100 text-orange-700',
};

function DigestGenreSection({
  genre, articles, onRead, readingId,
}: {
  genre: Category;
  articles: Article[];
  onRead: (a: Article) => void;
  readingId: string | null;
}) {
  const [open, setOpen] = useState(true);

  return (
    <section className="mb-6">
      <div
        className="flex items-center gap-2 mb-3 cursor-pointer group select-none"
        onClick={() => setOpen((v) => !v)}
      >
        <span className={`px-3 py-1 rounded-full text-sm font-semibold ${GENRE_STYLES[genre]}`}>
          {GENRE_LABELS[genre]}
        </span>
        <span className="text-xs text-gray-400">{articles.length}件</span>

        {/* セクション別コピーボタン（ホバーで表示） */}
        <div className="ml-auto flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
          <CopyButton
            articles={articles}
            mode="urls"
            label="📋 URL"
            stopPropagation
            className="text-xs px-2 py-1 rounded-md bg-gray-100 text-gray-600 hover:bg-gray-200 transition-colors"
          />
          <CopyButton
            articles={articles}
            mode="titles"
            label="📋 タイトル+URL"
            stopPropagation
            className="text-xs px-2 py-1 rounded-md bg-blue-100 text-blue-700 hover:bg-blue-200 transition-colors"
          />
        </div>

        <span className="text-gray-300 text-sm ml-1">{open ? '▲' : '▼'}</span>
      </div>

      {open && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {articles.map((article) => (
            <ArticleCard
              key={article.id}
              article={article}
              onRead={onRead}
              isReading={readingId === article.id}
            />
          ))}
        </div>
      )}
    </section>
  );
}
