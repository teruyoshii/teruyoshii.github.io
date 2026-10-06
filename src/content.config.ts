import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

// 制作物（動画・イラストなど）。src/content/works/*.md を1作品1ファイルで書く
const works = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/works' }),
  schema: z.object({
    title: z.string(),
    kind: z.enum(['video', 'illustration', 'other']),
    date: z.coerce.date(),
    summary: z.string(),
    // YouTube の動画 ID（長い動画向け）
    youtube: z.string().optional(),
    // public/ 以下に置いた動画・画像のパス（例: /works/loop.webm）
    video: z.string().optional(),
    image: z.string().optional(),
    draft: z.boolean().default(false),
  }),
});

// About ページ用の文章
const profile = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/profile' }),
  schema: z.object({
    title: z.string(),
    summary: z.string(),
  }),
});

export const collections = { works, profile };
