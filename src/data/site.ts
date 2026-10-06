// サイト全体の設定。名前やリンクはここを書き換える
export const site = {
  name: 'Teruyoshi',
  tagline: 'Video / Illustration / Code',
  description: 'てるよしのポートフォリオ。動画やイラストなどの制作物と、ブログへのリンクをまとめています。',
};

export type BlogSource = {
  name: string;
  // プロフィールページの URL。空なら「準備中」として表示する
  url: string;
  // RSS の URL。設定するとビルド時に最新記事を取り込む
  feed: string;
};

export const blogs: BlogSource[] = [
  { name: 'note', url: '', feed: '' }, // 例: https://note.com/<id> / https://note.com/<id>/rss
  { name: 'Zenn', url: '', feed: '' }, // 例: https://zenn.dev/<id> / https://zenn.dev/<id>/feed
];

export const socials: { name: string; url: string }[] = [
  { name: 'GitHub', url: 'https://github.com/teruyoshii' },
];
