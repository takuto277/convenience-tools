import { Article, Category } from '../types';

interface HNStory {
  id: number;
  title: string;
  url?: string;
  score: number;
  time: number;
  type: string;
}

function categorize(title: string): Category {
  const t = title.toLowerCase();
  if (/\b(ai|llm|gpt|claude|gemini|openai|anthropic|ml|machine.?learning|deep.?learning|neural|chatgpt)\b/.test(t))
    return 'ai';
  if (/\b(go|golang)\b/.test(t)) return 'go';
  if (/\b(react|vue|angular|typescript|javascript|css|html|next\.?js|svelte|remix|vite|webpack)\b/.test(t))
    return 'frontend';
  if (/\b(ios|swift|swiftui|android|kotlin|mobile|flutter|react.?native)\b/.test(t))
    return 'mobile';
  return 'general';
}

export async function fetchHackerNews(): Promise<Article[]> {
  const ids: number[] = await fetch(
    'https://hacker-news.firebaseio.com/v0/topstories.json',
    { next: { revalidate: 3600 } }
  ).then((r) => r.json());

  const top30 = ids.slice(0, 30);
  const stories = await Promise.all(
    top30.map((id) =>
      fetch(`https://hacker-news.firebaseio.com/v0/item/${id}.json`, {
        next: { revalidate: 3600 },
      })
        .then((r) => r.json() as Promise<HNStory>)
        .catch(() => null)
    )
  );

  return stories
    .filter((s): s is HNStory => s !== null && s.type === 'story' && !!s.url)
    .map((s) => ({
      id: `hn-${s.id}`,
      title: s.title,
      url: s.url!,
      source: 'Hacker News',
      category: categorize(s.title),
      publishedAt: new Date(s.time * 1000).toISOString(),
      fetchedAt: new Date().toISOString(),
    }));
}
