import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

// テープ1本ぶんの再生時間（カウンター表示用、秒）
const TAPE_SECONDS = 60 * 6;
// リールが最後までに回る回数
const TURNS = 5;

const timecode = (sec: number) =>
  [sec / 3600, (sec % 3600) / 60, sec % 60].map((v) => String(Math.floor(v)).padStart(2, '0')).join(':');

export function initDeck() {
  const deck = document.querySelector<HTMLElement>('[data-deck]');
  const stage = document.querySelector<HTMLElement>('[data-stage]');
  const win = document.querySelector<HTMLElement>('[data-window]');
  const track = document.querySelector<HTMLElement>('[data-track]');
  if (!deck || !stage || !win || !track) return;

  const panels = gsap.utils.toArray<HTMLElement>('[data-panel]', track);
  const chapters = gsap.utils.toArray<HTMLAnchorElement>('[data-chapter]');
  const counter = document.querySelector<HTMLElement>('[data-counter]');
  const spins = gsap.utils.toArray<SVGGElement>('[data-reel] [data-spin]');
  const leftTape = document.querySelector('[data-reel="left"] [data-tape]');
  const rightTape = document.querySelector('[data-reel="right"] [data-tape]');
  const steps = panels.length - 1;

  const mm = gsap.matchMedia();

  // PC かつ「動きを減らす」設定がオフのときだけ、横に流れるデッキ表示にする
  mm.add('(min-width: 900px) and (min-height: 560px) and (prefers-reduced-motion: no-preference)', () => {
    document.documentElement.classList.add('is-deck');
    track.style.setProperty('--panels', String(panels.length));

    const glitch = { shift: 0 };
    const setShift = gsap.quickTo(glitch, 'shift', {
      duration: 0.3,
      ease: 'power2.out',
      onUpdate: () => win.style.setProperty('--shift', `${glitch.shift.toFixed(2)}px`),
    });
    let active = -1;

    const play = gsap.timeline({
      defaults: { ease: 'none' },
      scrollTrigger: {
        trigger: deck,
        pin: stage,
        start: 'top top',
        end: () => `+=${window.innerHeight * steps * 1.2}`,
        scrub: 0.6,
        snap: { snapTo: 1 / steps, inertia: false, duration: { min: 0.2, max: 0.6 }, ease: 'power1.inOut' },
        invalidateOnRefresh: true,
        onUpdate: (self) => {
          // 速くスクロールするほど見出しが少しにじむ（VHS のトラッキングずれ風）
          setShift(gsap.utils.clamp(-6, 6, self.getVelocity() / 400));
        },
      },
      onUpdate() {
        const p = this.progress();
        if (counter) counter.textContent = timecode(p * TAPE_SECONDS);
        const i = Math.round(p * steps);
        if (i !== active) {
          active = i;
          chapters.forEach((c, j) => c.classList.toggle('is-active', j === i));
        }
      },
    });

    play
      .to(track, { x: () => -(track.scrollWidth - win.clientWidth) }, 0)
      .to(spins, { rotation: 360 * TURNS, svgOrigin: '100 100' }, 0)
      // 右のリールから左のリールへテープが巻き取られていく
      .fromTo(leftTape, { attr: { r: 44 } }, { attr: { r: 90 } }, 0)
      .fromTo(rightTape, { attr: { r: 90 } }, { attr: { r: 44 } }, 0);

    // パネルが窓に入ってきたら中身をふわっと出す
    panels.forEach((panel) => {
      gsap.from(panel.querySelectorAll('[data-reveal]'), {
        y: 24,
        autoAlpha: 0,
        stagger: 0.06,
        duration: 0.5,
        ease: 'power2.out',
        scrollTrigger: {
          trigger: panel,
          containerAnimation: play,
          start: 'left 60%',
          toggleActions: 'play none none reverse',
        },
      });
    });

    const onChapter = (e: Event) => {
      const i = Number((e.currentTarget as HTMLElement).dataset.chapter);
      const st = play.scrollTrigger;
      if (!st) return;
      e.preventDefault();
      window.scrollTo({ top: st.start + (st.end - st.start) * (i / steps), behavior: 'smooth' });
    };
    chapters.forEach((c) => c.addEventListener('click', onChapter));

    return () => {
      chapters.forEach((c) => c.removeEventListener('click', onChapter));
      document.documentElement.classList.remove('is-deck');
      track.style.removeProperty('--panels');
    };
  });
}
