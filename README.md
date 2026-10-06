# teruyoshii.github.io

てるよしのポートフォリオサイト。Astro + TypeScript + GSAP で作り、GitHub Pages で公開します。

## 開発

```sh
npm install
npm run dev      # http://localhost:4321
npm run build    # 型チェックしてから dist/ に出力
```

## 更新のしかた

| 何を | どこを |
| --- | --- |
| 制作物を追加 | `src/content/works/` に `.md` を1つ追加（書き方はサンプル参照） |
| 動画・画像ファイル | `public/works/` に置き、md の `video` / `image` にパスを書く |
| About の文章 | `src/content/profile/about.md` |
| 名前・ブログ・SNS のリンク | `src/data/site.ts`（note / Zenn の RSS を書くと最新記事を自動表示） |
| 色・フォント | `src/styles/tokens.css` |

## 構成

- `src/pages/index.astro` … トップ。画像と説明のペアを左右のリールに載せて回すデッキ表示
- `src/scripts/deck.ts` … スクロールに合わせてリールを回し、円周上のカード位置・テープ巻き取りを計算する GSAP の処理
- `src/components/Reel.astro` … リールの SVG
- スマホ幅や「視差効果を減らす」設定のときは、デッキ表示をやめて縦に並べる

## 公開

`master` に push すると GitHub Actions（`.github/workflows/deploy.yml`）が GitHub Pages に公開します。
