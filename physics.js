// Physics(ネオンのときだけ): IBDP Physics HL の最初のページ。背景はWebGPU(白黒のゴシックの大聖堂+浮かぶ惑星)で、ずっと動いている。
import { createGpuView } from './gpu-view.js?v=61';
import { WGSL } from './physics-bg.js?v=61';

const host = document.getElementById('physics-view');
const stage = document.getElementById('ph-stage');
const toast = document.getElementById('ph-toast');

const ICONS = {
  book: '<path d="M12 6.5C9.8 5 6.5 4.5 3 5v13c3.5-.5 6.8 0 9 1.5 2.2-1.5 5.5-2 9-1.5V5c-3.5-.5-6.8 0-9 1.5zM12 6.5v13"/>',
  pencil: '<path d="M4 20l1-4L16.500 4.500a2 2 0 0 1 3 3L8 19zM14.500 6.500l3 3"/><path d="M3 5l2-2 4 4-2 2zM15 17l2 2 2-2-2-2"/>',
  layers: '<path d="M12 3l9 5-9 5-9-5z"/><path d="M3 12l9 5 9-5M3 16l9 5 9-5"/>',
  chart: '<path d="M4 20V13M10 20V9M16 20v-5M22 20V6"/><path d="M3 20h19M15 4h5v5M20 4l-6 6-3-3-5 5"/>',
  search: '<circle cx="11" cy="11" r="6"/><path d="M16 16l4 4"/>',
  arrow: '<path d="M4 12h15M13 6l6 6-6 6"/>',
  star: '<path d="M12 1.500l2.200 8.300 8.300 2.200-8.300 2.200L12 22.500l-2.200-8.300L1.500 12l8.300-2.200z"/>',
};
const ic = (n, cls = '') => `<svg class="ph-ic ${cls}" viewBox="0 0 24 24" aria-hidden="true">${ICONS[n]}</svg>`;

const CARDS = [
  ['book', 'Topics', 'Study by unit and subtopic'],
  ['pencil', 'Practice', 'Test your understanding'],
  ['layers', 'Resources', 'Notes, formulas, and more'],
  ['chart', 'Progress', 'Track your performance'],
];

stage.innerHTML = `
  <header class="ph-top">
    <a class="ph-brand" href="#" data-home aria-label="Home">${ic('star', 'star')}<span>IBDP<br>Physics HL</span></a>
    <nav class="ph-nav"><a href="#" class="on" data-home>Home</a><a href="#" data-soon>Topics</a><a href="#" data-soon>Practice</a><a href="#" data-soon>Resources</a><a href="#" data-soon>About</a></nav>
    <div class="ph-acts"><button class="ph-iconbtn" data-soon aria-label="Search">${ic('search')}</button></div>
  </header>
  <div class="ph-scene" aria-hidden="true">
    <span class="ph-eq e1">F = ma</span><span class="ph-eq e2">E = mc<sup>2</sup></span><span class="ph-eq e3">p = mv</span><span class="ph-eq e4">v<sup>2</sup> = u<sup>2</sup> + 2as</span>
    <svg class="ph-wave" viewBox="0 0 300 110"><path d="M0 55 C 25 -5, 50 -5, 75 55 S 125 115, 150 55 S 200 -5, 225 55 S 275 115, 300 55"/></svg>
    <svg class="ph-field" viewBox="0 0 200 200"><g class="lines">${Array.from({ length: 18 }, (_, i) => `<line x1="100" y1="100" x2="${(100 + 98 * Math.cos(i * Math.PI / 9)).toFixed(1)}" y2="${(100 + 98 * Math.sin(i * Math.PI / 9)).toFixed(1)}"/>`).join('')}</g><circle cx="100" cy="100" r="40"/><circle cx="100" cy="100" r="70"/><circle class="core" cx="100" cy="100" r="3.500"/></svg>
    <svg class="ph-armil" viewBox="0 0 120 120"><circle cx="60" cy="60" r="50"/><ellipse class="r1" cx="60" cy="60" rx="50" ry="18"/><ellipse class="r2" cx="60" cy="60" rx="18" ry="50"/><ellipse class="r3" cx="60" cy="60" rx="38" ry="50"/><circle cx="60" cy="60" r="4"/></svg>
    <svg class="ph-glass" viewBox="0 0 80 130"><path class="frame" d="M10 6h60M10 124h60M16 6c0 38 20 44 24 59-4 15-24 21-24 59M64 6c0 38-20 44-24 59 4 15 24 21 24 59"/><path class="top" d="M24 16c6 14 12 18 16 22 4-4 10-8 16-22z"/><path class="bot" d="M40 70c10 18 18 28 22 46H18c4-18 12-28 22-46z"/><line class="fall" x1="40" y1="64" x2="40" y2="116"/></svg>
  </div>
  <section class="ph-hero">
    <div class="ph-eyebrow"><i>◆</i> I B D P <i>◆</i></div>
    <h2 class="ph-title">Physics HL</h2>
    <div class="ph-rule"><i></i><b>◆◆</b><i></i></div>
    <p class="ph-tag"><span>◆</span> Study <em>·</em> Practice <em>·</em> Master <span>◆</span></p>
  </section>
  <div class="ph-cards">${CARDS.map(([i, a, b]) => `<button class="ph-card" data-soon>${ic(i, 'big')}<b>${a}</b><em>${b}</em>${ic('arrow', 'sm')}</button>`).join('')}</div>`;

let toastTimer = 0;
function say(msg) {
  toast.textContent = msg; toast.hidden = false; toast.classList.add('on');
  clearTimeout(toastTimer); toastTimer = setTimeout(() => { toast.classList.remove('on'); setTimeout(() => { toast.hidden = true; }, 300); }, 1600);
}
stage.addEventListener('click', e => {
  if (e.target.closest('[data-home]')) { e.preventDefault(); return; }
  if (e.target.closest('[data-soon]')) { e.preventDefault(); say('Coming soon'); }
});

const view = createGpuView(WGSL);
export const physics = { start: () => view.start(host), stop: () => view.stop() };
