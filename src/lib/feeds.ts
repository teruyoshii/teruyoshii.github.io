import type { BlogSource } from '../data/site';

export type FeedItem = { title: string; url: string; date: Date; source: string };

const pick = (xml: string, tag: string) => {
  const m = xml.match(new RegExp(`<${tag}[^>]*>([\\s\\S]*?)</${tag}>`));
  return m ? m[1].replace(/^<!\[CDATA\[|\]\]>$/g, '').trim() : '';
};

// RSS をビルド時に読み込む。取得に失敗してもビルドは止めない
export async function fetchLatest(sources: BlogSource[], limit = 5): Promise<FeedItem[]> {
  const results = await Promise.all(
    sources
      .filter((s) => s.feed)
      .map(async (s) => {
        try {
          const res = await fetch(s.feed, { signal: AbortSignal.timeout(8000) });
          if (!res.ok) return [];
          const xml = await res.text();
          return [...xml.matchAll(/<item[\s>][\s\S]*?<\/item>/g)].map(([item]) => ({
            title: pick(item, 'title'),
            url: pick(item, 'link'),
            date: new Date(pick(item, 'pubDate')),
            source: s.name,
          }));
        } catch {
          console.warn(`[feeds] ${s.name} の RSS を取得できませんでした`);
          return [];
        }
      }),
  );
  return results
    .flat()
    .filter((i) => i.title && i.url)
    .sort((a, b) => b.date.getTime() - a.date.getTime())
    .slice(0, limit);
}
