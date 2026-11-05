// Physics(ネオンのときだけ): IBDP Physics HL の最初のページ。背景はWebGPU(白黒のゴシックの大聖堂+浮かぶ惑星)で、ずっと動いている。
import { createGpuView } from './gpu-view.js?v=67';
import { WGSL } from './physics-bg.js?v=67';

let punch = -10;           // 最後にページを切り替えた時刻(秒)。背景の演出に使う
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

const AREAS = [
  { id: 'A', title: 'Space, time and motion', icon: 'motion', subs: [['A.1', 'Kinematics'], ['A.2', 'Forces and momentum'], ['A.3', 'Work, energy and power'], ['A.4', 'Rigid body mechanics'], ['A.5', 'Galilean and special relativity']] },
  { id: 'B', title: 'The particulate nature of matter', icon: 'thermo', subs: [['B.1', 'Thermal energy transfers'], ['B.2', 'Greenhouse effect'], ['B.3', 'Gas laws'], ['B.4', 'Thermodynamics'], ['B.5', 'Current and circuits']] },
  { id: 'C', title: 'Wave behaviour', icon: 'wave', subs: [['C.1', 'Simple harmonic motion'], ['C.2', 'Wave model'], ['C.3', 'Wave phenomena'], ['C.4', 'Standing waves and resonance'], ['C.5', 'Doppler effect']] },
  { id: 'D', title: 'Fields', icon: 'magnet', subs: [['D.1', 'Gravitational fields'], ['D.2', 'Electric and magnetic fields'], ['D.3', 'Motion in electromagnetic fields'], ['D.4', 'Induction']] },
  { id: 'E', title: 'Nuclear and quantum physics', icon: 'atom', subs: [['E.1', 'Structure of the atom'], ['E.2', 'Quantum physics'], ['E.3', 'Radioactive decay'], ['E.4', 'Fission'], ['E.5', 'Fusion and stars']] },
];
// 領域ごとの説明(A は画面の見本どおり。B〜E は、IBの内容に沿って書いた説明で、あとで差し替えられる)
const INFO = {
  A: { sub: 'Study the motion of objects and the nature of space and time.', icon: 'planet', rows: [
    ['graph', 'Describing motion using equations, graphs and models.'], ['block', 'Forces, Newton\'s laws and conservation of momentum.'], ['bolt', 'Work, energy transfers, efficiency and power.'],
    ['cube', 'Rotation, torque, angular motion and equilibrium.'], ['well', 'Inertial frames, the speed of light and relativistic effects.']] },
  B: { sub: 'Study matter, thermal energy, gases and electric circuits.', icon: 'thermo', rows: [
    ['thermo', 'Heat, temperature, conduction, convection and radiation.'], ['sun', 'Radiation, the Earth\'s energy balance and climate.'], ['gas', 'Pressure, volume, temperature and the ideal gas.'],
    ['cycle', 'The laws of thermodynamics, entropy and heat engines.'], ['circuit', 'Charge, current, resistance and circuit analysis.']] },
  C: { sub: 'Study oscillations and the behaviour of waves.', icon: 'wave', rows: [
    ['spring', 'Oscillations, restoring forces and energy in simple harmonic motion.'], ['wave', 'Describing travelling waves and their properties.'], ['ripple', 'Reflection, refraction, diffraction, interference and polarization.'],
    ['standing', 'Standing waves, harmonics and resonance.'], ['doppler', 'Frequency changes from moving sources and observers.']] },
  D: { sub: 'Study gravitational, electric and magnetic fields.', icon: 'magnet', rows: [
    ['planet', 'Newton\'s law of gravitation, field strength and potential.'], ['charge', 'Coulomb\'s law, electric and magnetic fields and potential.'],
    ['particle', 'Charged particles moving in electric and magnetic fields.'], ['coil', 'Electromagnetic induction, Faraday\'s law and Lenz\'s law.']] },
  E: { sub: 'Study the atom, quantum behaviour and the nucleus.', icon: 'atom', rows: [
    ['atom', 'Atomic models, spectra and the energy levels of atoms.'], ['photon', 'Photons, the photoelectric effect and matter waves.'], ['decay', 'Nuclear stability, decay modes and half-life.'],
    ['split', 'Nuclear fission and energy generation.'], ['star', 'Nuclear fusion, the Sun and stellar evolution.']] },
};
Object.assign(ICONS, {
  motion: '<circle cx="8" cy="12" r="4"/><path d="M14 12h8M19 9l3 3-3 3M2 18h9"/>',
  thermo: '<path d="M10 4a2 2 0 0 1 4 0v9.500a4 4 0 1 1-4 0z"/><path d="M12 8v8"/><circle cx="12" cy="17" r="1.500"/><path d="M17 5h3M17 8h2M17 11h3"/>',
  wave: '<path d="M2 12c2-8 4-8 5 0s3 8 5 0 3-8 5 0 3 8 5 0"/><path d="M2 12h20" stroke-dasharray="1 3"/>',
  magnet: '<path d="M6 3v9a6 6 0 0 0 12 0V3h-4v9a2 2 0 0 1-4 0V3z"/><path d="M6 7h4M14 7h4"/><path d="M19 2l1-1M21 5h2M18 1v2"/>',
  atom: '<circle cx="12" cy="12" r="1.800"/><ellipse cx="12" cy="12" rx="10" ry="4"/><ellipse cx="12" cy="12" rx="10" ry="4" transform="rotate(60 12 12)"/><ellipse cx="12" cy="12" rx="10" ry="4" transform="rotate(120 12 12)"/>',
});

// サブトピック(A1〜A5 など)の中身。いまは A5 だけ。ほかは、内容が決まったら追加する
const SUBS = {
  A5: { area: 'A', title: 'Galilean and special relativity', icon: 'well', sub: 'Inertial frames, the speed of light and relativistic effects.', rows: [
    ['frames', 'Reference frames and Lorentz transformations', 'Inertial frames, Lorentz transformations and their use.'],
    ['clock', 'Effects of relativity', 'Time dilation, length contraction and mass\u2013energy equivalence.'],
    ['spacetime', 'Spacetime diagrams', 'Representing and analysing events in spacetime.']] },
};
Object.assign(ICONS, {
  frames: '<path d="M4 20V3M4 3l-2 3M4 3l2 3M4 20h17M21 20l-3-2M21 20l-3 2"/><path d="M4 20L16 8" stroke-dasharray="2 2"/><path d="M8 17c3-1 6-4 9-5M17 12l-3.500.5M17 12l-1.500 3"/>',
  clock: '<circle cx="15" cy="12" r="7"/><path d="M15 8v4l2.500 2M2 8h5M1 12h4M2 16h5"/>',
  spacetime: '<path d="M5 20V4M5 4l-2 3M5 4l2 3M5 20h15M20 20l-3-2M20 20l-3 2"/><path d="M5 20L18 6M5 8l9 9" stroke-dasharray="2 2"/>',
});

const topNav = page => `
  <header class="ph-top">
    <a class="ph-brand" href="#" data-go="home" aria-label="Home">${ic('star', 'star')}<span>IBDP<br>Physics HL</span></a>
    <nav class="ph-nav"><a href="#" data-go="home" class="${page === 'home' ? 'on' : ''}">Home</a><a href="#" data-go="topics" class="${page === 'topics' ? 'on' : ''}">Topics</a><a href="#" data-soon>Practice</a><a href="#" data-soon>Resources</a><a href="#" data-soon>About</a></nav>
    <div class="ph-acts"><button class="ph-iconbtn" data-soon aria-label="Search">${ic('search')}</button></div>
  </header>`;

const PAGES = {
  sub: (id = 'A5') => {
    const d = SUBS[id] || SUBS.A5, a = AREAS.find(x => x.id === d.area), code = id;
    return `${topNav('topics')}
    <div class="ph-split">
      <aside class="ph-side">
        <h3 class="ph-side-t">${ic('star', 'star sm2')}Topics</h3><div class="ph-side-rule"></div>
        <ul>${AREAS.map(x => x.id !== a.id ? `<li><button data-go="area:${x.id}"><span>${x.id}. ${x.title}</span>${ic('chev', 'sm')}</button></li>`
          : `<li class="grp"><button class="open" data-go="area:${x.id}"><span>${x.id}. ${x.title}</span>${ic('down', 'sm')}</button><ul class="subnav">${x.subs.map(([c, n]) => { const k = c.replace('.', ''); return `<li><button class="${k === code ? 'on' : ''}" ${SUBS[k] ? `data-go="sub:${k}"` : 'data-soon'}><code>${k}</code><span>${n}</span>${k === code ? ic('chev', 'sm') : ''}</button></li>`; }).join('')}</ul></li>`).join('')}</ul>
      </aside>
      <section class="ph-main">
        <div class="ph-crumb"><a href="#" data-go="home" aria-label="Home">${ic('home')}</a><a href="#" data-go="topics">Topics</a>${ic('chev', 'sm')}<a href="#" data-go="area:${a.id}">${a.id}. ${a.title}</a>${ic('chev', 'sm')}<span>${code} ${d.title}</span></div>
        <div class="ph-ahead ph-shead">${ic(d.icon, 'huge')}<div><h2><i>${code}</i> ${d.title}</h2><p>${d.sub}</p></div></div>
        <div class="ph-rule slim"><i></i><b>◆</b><i></i></div>
        <ul class="ph-subs ph-leaf">${d.rows.map(([i, t, desc]) => `<li class="ph-sub plain" data-soon tabindex="0" role="button"><span class="ico">${ic(i, 'lead')}</span><span class="txt"><b>${t}</b><em>${desc}</em></span>${ic('chev', 'sm')}</li>`).join('')}</ul>
      </section>
    </div>`;
  },

  area: (id = 'A') => {
    const a = AREAS.find(x => x.id === id) || AREAS[0], inf = INFO[a.id];
    return `${topNav('topics')}
    <div class="ph-split">
      <aside class="ph-side">
        <h3 class="ph-side-t">${ic('star', 'star sm2')}Topics</h3><div class="ph-side-rule"></div>
        <ul>${AREAS.map(x => `<li><button class="${x.id === a.id ? 'on' : ''}" data-go="area:${x.id}"><span>${x.id}. ${x.title}</span>${ic('chev', 'sm')}</button></li>`).join('')}</ul>
      </aside>
      <section class="ph-main">
        <div class="ph-crumb"><a href="#" data-go="home" aria-label="Home">${ic('home')}</a><a href="#" data-go="topics">Topics</a>${ic('chev', 'sm')}<span>${a.id}. ${a.title}</span></div>
        <div class="ph-ahead">${ic(inf.icon, 'huge')}<div><h2>${a.id}. ${a.title}</h2><p>${inf.sub}</p></div></div>
        <div class="ph-rule slim"><i></i><b>◆</b><i></i></div>
        <ul class="ph-subs">${a.subs.map(([c, n], k) => `<li class="ph-sub" ${SUBS[c.replace('.', '')] ? `data-go="sub:${c.replace('.', '')}"` : 'data-soon'} tabindex="0" role="button">${ic(inf.rows[k][0], 'lead')}<i class="code">${c.replace('.', '')}</i><span class="txt"><b>${n}</b><em>${inf.rows[k][1]}</em></span>${ic('chev', 'sm')}</li>`).join('')}</ul>
      </section>
    </div>`;
  },

  home: () => `${topNav('home')}
  <section class="ph-hero">
    <div class="ph-eyebrow"><i>◆</i> I B D P <i>◆</i></div>
    <h2 class="ph-title">Physics HL</h2>
    <div class="ph-rule"><i></i><b>◆◆</b><i></i></div>
    <p class="ph-tag"><span>◆</span> Study <em>·</em> Practice <em>·</em> Master <span>◆</span></p>
  </section>
  <div class="ph-cards">${CARDS.map(([i, a, b]) => `<button class="ph-card" ${a === 'Topics' ? 'data-go="topics"' : 'data-soon'}>${ic(i, 'big')}<b>${a}</b><em>${b}</em>${ic('arrow', 'sm')}</button>`).join('')}</div>`,

  topics: () => `${topNav('topics')}
  <section class="ph-thead">
    <div class="ph-orbit" aria-hidden="true"><i></i></div>
    <h2 class="ph-title ph-t2">Topics</h2>
    <p class="ph-tag ph-tag2"><span>◆</span> Choose a Topic Area <span>◆</span></p>
  </section>
  <div class="ph-areas">${AREAS.map(a => `<article class="ph-area a-${a.id}" data-go="area:${a.id}" tabindex="0" role="button" aria-label="${a.id}. ${a.title}">
      ${ic(a.icon, 'big')}
      <span class="ph-ah"><b>${a.id}. ${a.title}</b>${ic('chev', 'chev')}</span>
      <ul>${a.subs.map(([c, n]) => `<li data-go="${SUBS[c.replace('.', '')] ? `sub:${c.replace('.', '')}` : `area:${a.id}`}"><code>${c}</code><span>${n}</span></li>`).join('')}</ul>
    </article>`).join('')}</div>`,
};
Object.assign(ICONS, {
  chev: '<path d="M9 5l7 7-7 7"/>',
  down: '<path d="M6 9l6 6 6-6"/>',
  home: '<path d="M3 11l9-8 9 8M5 10v10h5v-6h4v6h5V10"/>',
  planet: '<circle cx="12" cy="12" r="5"/><path d="M2.500 15c-1.500-3 4-7.500 11-9.500M21.500 9c1.500 3-4 7.500-11 9.500"/>',
  graph: '<path d="M3 3v18h18"/><path d="M5 19C9 18 12 14 14 8c1-3 3-4 5-4"/><circle cx="17" cy="5" r="1.200"/><path d="M17 6.500V19M5 8h12" stroke-dasharray="1.500 2"/>',
  block: '<rect x="6" y="8" width="8" height="7"/><path d="M14 11.500h7M18.500 9l2.500 2.500-2.500 2.500M3 18h18M4 21l2-3M8 21l2-3M12 21l2-3M16 21l2-3"/>',
  bolt: '<path d="M13 2L5 13.500h6L10 22l9-12h-6.500z"/>',
  cube: '<path d="M12 3l8 4v10l-8 4-8-4V7z"/><path d="M4 7l8 4 8-4M12 11v10" stroke-dasharray="2 2"/>',
  well: '<ellipse cx="12" cy="5" rx="9" ry="2.500"/><path d="M3 5c3 5 5 8 7 13M21 5c-3 5-5 8-7 13M10 18h4M7 8c3 2 7 2 10 0M8.500 12c2 1.500 5 1.500 7 0"/>',
  sun: '<circle cx="12" cy="12" r="4"/><path d="M12 2v3M12 19v3M2 12h3M19 12h3M5 5l2 2M17 17l2 2M19 5l-2 2M7 17l-2 2"/>',
  gas: '<rect x="3" y="4" width="18" height="16" rx="1.500"/><circle cx="8" cy="9" r="1.500"/><circle cx="15" cy="8" r="1.500"/><circle cx="11" cy="14" r="1.500"/><circle cx="17" cy="15" r="1.500"/><path d="M8 9l3 5M15 8l2 7" stroke-dasharray="1 2"/>',
  cycle: '<path d="M5 18V6l5 3 4 5 5 1M5 18h14"/><path d="M12 4l2 2-2 2M19 15l-2-2"/>',
  circuit: '<path d="M4 6h16v12H4zM9 6v-0M4 12h4M16 12h4"/><path d="M8 9v6M11 10v4"/><circle cx="14.500" cy="12" r="1.500"/>',
  spring: '<path d="M12 2v4l-4 1.500 8 2-8 2 8 2-8 2 4 1.500v5"/>',
  ripple: '<circle cx="9" cy="12" r="3"/><circle cx="9" cy="12" r="6.500"/><circle cx="16" cy="12" r="3"/><circle cx="16" cy="12" r="6.500"/>',
  standing: '<path d="M3 12c2-7 4-7 6 0s4 7 6 0 4-7 6 0"/><path d="M3 12c2 7 4 7 6 0s4-7 6 0 4 7 6 0" opacity=".6"/>',
  doppler: '<circle cx="8" cy="12" r="2"/><path d="M12 7c2 3 2 7 0 10M15.500 5c3 4.500 3 9.500 0 14M19 3c4 6 4 12 0 18"/>',
  charge: '<circle cx="12" cy="12" r="3"/><path d="M12 7V3M12 21v-4M7 12H3M21 12h-4M8.500 8.500l-2-2M17.500 17.500l-2-2M15.500 8.500l2-2M6.500 17.500l2-2"/><path d="M11 12h2M12 11v2"/>',
  particle: '<circle cx="6" cy="18" r="1.800"/><path d="M7 16.500C10 12 12 8 18 6M15 4l3 2-2 3"/><path d="M4 8h2M9 8h2M14 8h2M4 12h2M9 12h2M4 4h2M9 4h2" opacity=".5"/>',
  coil: '<path d="M3 12c0-4 3-4 3 0s3 4 3 0 3-4 3 0 3 4 3 0 3-4 3 0"/><path d="M3 12h-1M21 12h1M12 4v3M10.500 5.500L12 4l1.500 1.500"/>',
  atom: ICONS.atom,
  photon: '<path d="M2 12c2-6 4-6 6 0s4 6 6 0 3-4 4-2M16 8l5 4-5 4"/>',
  decay: '<circle cx="9" cy="12" r="4"/><circle cx="9" cy="12" r="1.200"/><path d="M14 9l6-3M14 12h7M14 15l6 3"/>',
  split: '<circle cx="12" cy="12" r="3"/><path d="M12 3v6M12 15v6M3 12h6M15 12h6"/><path d="M5 5l3 3M19 5l-3 3M5 19l3-3M19 19l-3-3" opacity=".6"/>',
  star: ICONS.star,
});

const scene = `
  <div class="ph-scene" id="ph-scene" aria-hidden="true">
    <span class="ph-eq e1">F = ma</span><span class="ph-eq e2">E = mc<sup>2</sup></span><span class="ph-eq e3">p = mv</span><span class="ph-eq e4">v<sup>2</sup> = u<sup>2</sup> + 2as</span>
    <svg class="ph-wave" viewBox="0 0 300 110"><path d="M0 55 C 25 -5, 50 -5, 75 55 S 125 115, 150 55 S 200 -5, 225 55 S 275 115, 300 55"/></svg>
    <svg class="ph-field" viewBox="0 0 200 200"><g class="lines">${Array.from({ length: 18 }, (_, i) => `<line x1="100" y1="100" x2="${(100 + 98 * Math.cos(i * Math.PI / 9)).toFixed(1)}" y2="${(100 + 98 * Math.sin(i * Math.PI / 9)).toFixed(1)}"/>`).join('')}</g><circle cx="100" cy="100" r="40"/><circle cx="100" cy="100" r="70"/><circle class="core" cx="100" cy="100" r="3.500"/></svg>
    <svg class="ph-armil" viewBox="0 0 120 120"><circle cx="60" cy="60" r="50"/><ellipse class="r1" cx="60" cy="60" rx="50" ry="18"/><ellipse class="r2" cx="60" cy="60" rx="18" ry="50"/><ellipse class="r3" cx="60" cy="60" rx="38" ry="50"/><circle cx="60" cy="60" r="4"/></svg>
    <svg class="ph-glass" viewBox="0 0 80 130"><path class="frame" d="M10 6h60M10 124h60M16 6c0 38 20 44 24 59-4 15-24 21-24 59M64 6c0 38-20 44-24 59 4 15 24 21 24 59"/><path class="top" d="M24 16c6 14 12 18 16 22 4-4 10-8 16-22z"/><path class="bot" d="M40 70c10 18 18 28 22 46H18c4-18 12-28 22-46z"/><line class="fall" x1="40" y1="64" x2="40" y2="116"/></svg>
  </div>`;
stage.innerHTML = `${scene}<div class="ph-body" id="ph-body"></div>`;
const body = document.getElementById('ph-body');
let page = 'home';
function show(target) {
  let [next, arg] = String(target).split(':');   // 例: 'area:A'
  if (!(next in PAGES)) next = 'home';
  page = next;
  body.innerHTML = PAGES[next](arg);
  body.className = `ph-body ph-p-${next}`;
  body.style.animation = 'none'; void body.offsetWidth; body.style.animation = '';   // 同じ動きを、毎回はじめからやり直す
  stage.dataset.page = next;
  host.dataset.page = next;
  punch = performance.now() / 1000;
  try { sessionStorage.phPage = arg ? `${next}:${arg}` : next; } catch {}
}

let toastTimer = 0;
function say(msg) {
  toast.textContent = msg; toast.hidden = false; toast.classList.add('on');
  clearTimeout(toastTimer); toastTimer = setTimeout(() => { toast.classList.remove('on'); setTimeout(() => { toast.hidden = true; }, 300); }, 1600);
}
stage.addEventListener('click', e => {
  const go = e.target.closest('[data-go]');
  if (go) { e.preventDefault(); show(go.dataset.go); return; }
  if (e.target.closest('[data-soon]')) { e.preventDefault(); say('Coming soon'); }
});
let start0 = 'home';
try { if (String(sessionStorage.phPage).split(':')[0] in PAGES) start0 = sessionStorage.phPage; } catch {}
show(start0);
stage.addEventListener('keydown', e => {   // Enter で、押せる行を開く
  const row = e.target.closest('[tabindex][data-go], [tabindex][data-soon]');
  if (row && e.key === 'Enter') row.click();
});

// ページを切り替えるたびに、背景がぐっと奥へ引き込まれ、衝撃波が走る(Computer Science と同じ演出)
const view = createGpuView(WGSL, now => {
  const x = Math.min(1, Math.max(0, (now - punch) / 1.1));
  const pulse = x < 1 ? Math.sin(Math.PI * x) * 0.9 : 0;
  return [0, 0, now - punch, pulse];
});
export const physics = { start: () => view.start(host), stop: () => view.stop() };
