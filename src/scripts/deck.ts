import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

// テープ1本ぶんの再生時間（カウンター表示用、秒）
const TAPE_SECONDS = 60 * 6;

const timecode = (sec: number) =>
  [sec / 3600, (sec % 3600) / 60, sec % 60].map((v) => String(Math.floor(v)).padStart(2, '0')).join(':');

const rad = (deg: number) => (deg * Math.PI) / 180;

/**
 * 左右の大きなリールの円周上にカードを並べ、スクロールでリールごと回す。
 * 左リールには画像側（data-side="l"）、右リールには説明側（data-side="r"）が載り、
 * 同じ組のカードが同時に正面（左リールは3時、右リールは9時の位置）に来る。
 * 両リールは本物のカセットと同じ向きに回るので、左は下から、右は上から次のカードが現れる。
 */
export function initDeck() {
  const deck = document.querySelector<HTMLElement>('[data-deck]');
  const stage = document.querySelector<HTMLElement>('[data-stage]');
  if (!deck || !stage) return;

  const pairs = gsap.utils.toArray<HTMLElement>('[data-pair]');
  const lefts = pairs.map((p) => p.querySelector<HTMLElement>('[data-side="l"]')!);
  const rights = pairs.map((p) => p.querySelector<HTMLElement>('[data-side="r"]')!);
  const hubs = { l: document.querySelector<HTMLElement>('[data-hub="left"]')!, r: document.querySelector<HTMLElement>('[data-hub="right"]')! };
  const spins = { l: hubs.l.querySelector('[data-spin]'), r: hubs.r.querySelector('[data-spin]') };
  const tapes = { l: hubs.l.querySelector('[data-tape]'), r: hubs.r.querySelector('[data-tape]') };
  const chapters = gsap.utils.toArray<HTMLAnchorElement>('[data-chapter]');
  const counter = document.querySelector<HTMLElement>('[data-counter]');
  const index = document.querySelector<HTMLElement>('[data-index]');
  const last = pairs.length - 1;

  const mm = gsap.matchMedia();

  // PC（横長の画面）かつ「動きを減らす」設定がオフのときだけリール表示にする
  mm.add('(min-width: 900px) and (min-aspect-ratio: 5/4) and (prefers-reduced-motion: no-preference)', () => {
    document.documentElement.classList.add('is-deck');

    // 画面サイズから決まる寸法。リサイズのたびに計算し直す
    const g = { w: 0, h: 0, r: 0, cy: 0, lx: 0, rx: 0, step: 0, hub: 0 };
    const measure = () => {
      g.w = stage.clientWidth;
      g.h = stage.clientHeight;
      const cardW = Math.min(g.w * 0.27, g.h * 0.62);
      const cardH = cardW * 0.75;
      g.r = g.w * 0.46; // リールの中心からカード中心までの距離
      g.cy = g.h / 2;
      g.lx = g.w * 0.29 - g.r; // 左リールの中心（画面の外）
      g.rx = g.w * 0.71 + g.r; // 右リールの中心（画面の外）
      g.step = (Math.atan((cardH * 1.35) / g.r) * 180) / Math.PI; // 隣のカードとの角度
      g.hub = (g.r - cardW / 2 - 28) * 2;
      stage.style.setProperty('--card-w', `${cardW}px`);
      stage.style.setProperty('--card-h', `${cardH}px`);
      stage.style.setProperty('--hub', `${g.hub}px`);
      gsap.set(hubs.l, { x: g.lx - g.hub / 2, y: g.cy - g.hub / 2 });
      gsap.set(hubs.r, { x: g.rx - g.hub / 2, y: g.cy - g.hub / 2 });
    };

    let active = -1;
    // pos は「いま正面にある組の番号」。0.5 なら 1組目と2組目の中間
    const render = (pos: number) => {
      pairs.forEach((_, i) => {
        const d = i - pos;
        const a = d * g.step;
        const alpha = Math.abs(d) > 2.2 ? 0 : gsap.utils.clamp(0.12, 1, 1 - Math.abs(d) * 0.7);
        gsap.set(lefts[i], {
          x: g.lx + g.r * Math.cos(rad(a)),
          y: g.cy + g.r * Math.sin(rad(a)),
          xPercent: -50,
          yPercent: -50,
          rotation: a,
          autoAlpha: alpha,
        });
        gsap.set(rights[i], {
          x: g.rx + g.r * Math.cos(rad(180 + a)),
          y: g.cy + g.r * Math.sin(rad(180 + a)),
          xPercent: -50,
          yPercent: -50,
          rotation: a,
          autoAlpha: alpha,
        });
      });

      const turn = -pos * g.step;
      gsap.set([spins.l, spins.r], { rotation: turn, svgOrigin: '100 100' });
      // 右のリールから左のリールへテープが巻き取られていく
      const t = last ? pos / last : 0;
      gsap.set(tapes.l, { attr: { r: 44 + 46 * t } });
      gsap.set(tapes.r, { attr: { r: 90 - 46 * t } });

      if (counter) counter.textContent = timecode(t * TAPE_SECONDS);
      const i = Math.round(pos);
      if (i !== active) {
        active = i;
        if (index) index.textContent = String(i + 1).padStart(2, '0');
        const current = chapters.findLastIndex((c) => Number(c.dataset.chapter) <= i);
        chapters.forEach((c, j) => c.classList.toggle('is-active', j === current));
      }
    };

    const state = { pos: 0 };
    const play = gsap.to(state, {
      pos: last,
      ease: 'none',
      onUpdate: () => render(state.pos),
      scrollTrigger: {
        trigger: deck,
        pin: stage,
        start: 'top top',
        end: () => `+=${window.innerHeight * last * 0.9}`,
        scrub: 0.8,
        snap: { snapTo: 1 / last, inertia: false, duration: { min: 0.25, max: 0.7 }, ease: 'power2.inOut' },
        invalidateOnRefresh: true,
        onRefresh: () => {
          measure();
          render(state.pos);
        },
      },
    });

    measure();
    render(0);

    const onChapter = (e: Event) => {
      const i = Number((e.currentTarget as HTMLElement).dataset.chapter);
      const st = play.scrollTrigger;
      if (!st) return;
      e.preventDefault();
      window.scrollTo({ top: st.start + (st.end - st.start) * (i / last), behavior: 'smooth' });
    };
    chapters.forEach((c) => c.addEventListener('click', onChapter));

    return () => {
      chapters.forEach((c) => c.removeEventListener('click', onChapter));
      document.documentElement.classList.remove('is-deck');
      gsap.set([...lefts, ...rights, hubs.l, hubs.r], { clearProps: 'all' });
      ['--card-w', '--card-h', '--hub'].forEach((p) => stage.style.removeProperty(p));
    };
  });
}
