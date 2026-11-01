const stats = [
  ['Mon', 47], ['Tue', 50], ['Wed', 68], ['Thu', 57], ['Fri', 70], ['Sat', 96], ['Sun', 88],
];



// chart: smooth line + area
(function drawChart() {
  const svg = document.getElementById('chart');
  const L = 28, R = 226, T = 8, B = 100;
  const x = i => L + 6 + i * (R - L - 8) / (stats.length - 1);
  const y = v => B - v / 100 * (B - T);
  const pts = stats.map(([, v], i) => [x(i), y(v)]);
  let d = `M${pts[0][0]},${pts[0][1]}`;
  for (let i = 1; i < pts.length; i++) {
    const [x0, y0] = pts[i - 1], [x1, y1] = pts[i], cx = (x0 + x1) / 2;
    d += ` C${cx},${y0} ${cx},${y1} ${x1},${y1}`;
  }
  let s = `<defs><linearGradient id="ag" x1="0" y1="0" x2="0" y2="1">
    <stop offset="0" stop-color="#3b6fd8" stop-opacity=".28"/><stop offset="1" stop-color="#3b6fd8" stop-opacity=".03"/></linearGradient></defs>`;
  s += `<line x1="${L}" y1="${T - 2}" x2="${L}" y2="${B}" stroke="#c9cdd6" stroke-width=".6"/>`;
  [0, 50, 100].forEach(v => {
    s += `<text x="${L - 4}" y="${y(v) + 2.5}" text-anchor="end">${v}</text>`;
  });
  s += `<path d="${d} L${pts.at(-1)[0]},${B} L${pts[0][0]},${B} Z" fill="url(#ag)"/>`;
  s += `<path d="${d}" fill="none" stroke="#4a7be0" stroke-width="1.2"/>`;
  pts.forEach(([px, py], i) => {
    const hi = stats[i][1] === Math.max(...stats.map(a => a[1]));
    s += `<circle cx="${px}" cy="${py}" r="${hi ? 3 : 1.6}" fill="${hi ? '#fff' : '#4a7be0'}" stroke="#4a7be0" stroke-width="${hi ? 1.4 : 0}"/>`;
    s += `<text x="${px}" y="${B + 12}" text-anchor="middle">${stats[i][0]}</text>`;
  });
  svg.innerHTML = s;
})();

// nav: 画面の切り替え(ヘッダーは固定。その下だけが入れ替わる)
//   home: ホーム / log: Log data / timer, pomodoro, manual: Log data の中のページ / profile: Profile
const VIEWS = { home: null, log: 'log', timer: 'log', pomodoro: 'log', manual: 'log', profile: 'profile', settings: 'settings', test: 'test', test2: 'test2', cs: 'cs' };
const navButtons = [...document.querySelectorAll('.nav-item[data-target]')];
function setView(name) {
  if (!(name in VIEWS) || ((name === 'test' || name === 'test2' || name === 'cs') && document.documentElement.dataset.theme !== 'neon')) name = 'home';   // Test はネオンのときだけ
  document.body.dataset.view = name;
  navButtons.forEach(b => b.classList.toggle('is-active', b.dataset.target === VIEWS[name]));
  try { history.replaceState(null, '', name === 'home' ? location.pathname + location.search : `#${name}`); } catch (_) { /* 無視 */ }
  window.dispatchEvent(new CustomEvent('viewchange', { detail: name }));
}
window.appSetView = setView;
navButtons.forEach(btn => btn.addEventListener('click', () => {
  const t = btn.dataset.target;
  if (t === 'friend') return;          // フレンドはページの上に重ねて表示する(friends-ui.js)
  if (t in VIEWS) setView(t);
}));
document.querySelector('.logo').addEventListener('click', e => { e.preventDefault(); setView('home'); });
setView(location.hash.slice(1));
window.addEventListener('hashchange', () => { const n = location.hash.slice(1) || 'home'; if (document.body.dataset.view !== n) setView(n); });
