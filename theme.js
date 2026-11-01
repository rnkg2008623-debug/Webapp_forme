// 表示スタイル(標準 / ネオン)の切り替え。ネオンはWebGPUの3D背景(非対応のブラウザでは、CSSの簡易ネオン)。
const KEY = 'theme';
const root = document.documentElement;
const buttons = [...document.querySelectorAll('.st-theme')];
const note = document.querySelector('.st-gpu-note');

export const getTheme = () => (root.dataset.theme === 'neon' ? 'neon' : 'standard');

async function apply() {
  const neon = getTheme() === 'neon';
  buttons.forEach(b => { const on = b.dataset.theme === getTheme(); b.classList.toggle('is-on', on); b.setAttribute('aria-pressed', String(on)); });
  if (!neon && document.body.dataset.view === 'test') window.appSetView('home');
  const gpu = await import('./neon-bg.js?v=34');
  if (!neon) { gpu.stopNeon(); root.classList.remove('neon-gpu'); if (note) note.hidden = true; return; }
  const ok = await gpu.startNeon(document.querySelector('.bg'));
  root.classList.toggle('neon-gpu', ok);
  if (note) note.hidden = ok;
}

export function setTheme(next) {
  if (next === 'neon') root.dataset.theme = 'neon'; else delete root.dataset.theme;
  try { localStorage.setItem(KEY, next); } catch {}
  apply();
}

buttons.forEach(b => b.addEventListener('click', () => setTheme(b.dataset.theme)));
if (getTheme() === 'neon') apply(); else buttons.forEach(b => { const on = b.dataset.theme === 'standard'; b.classList.toggle('is-on', on); b.setAttribute('aria-pressed', String(on)); });

// Test ページ(ネオンのときだけ)。開いている間だけ、WebGPUの背景を動かす
const testView = document.getElementById('test-view');
window.addEventListener('viewchange', async e => {
  const test = await import('./test-bg.js?v=34');
  if (e.detail === 'test') test.startTest(testView); else test.stopTest();
});
if (document.body.dataset.view === 'test') import('./test-bg.js?v=34').then(m => m.startTest(testView));
// ページ送りのドット(見た目だけ)をゆっくり切り替える
const dots = [...document.querySelectorAll('.ts-dots i')];
let di = 0; setInterval(() => { dots[di].classList.remove('on'); di = (di + 1) % dots.length; dots[di].classList.add('on'); }, 3500);
