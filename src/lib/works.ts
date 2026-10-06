import { getCollection } from 'astro:content';

// 下書きを除いて新しい順に並べる
export async function getWorks() {
  const works = await getCollection('works', ({ data }) => !data.draft);
  return works.sort((a, b) => b.data.date.getTime() - a.data.date.getTime());
}

export const formatDate = (d: Date) =>
  `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, '0')}.${String(d.getDate()).padStart(2, '0')}`;
