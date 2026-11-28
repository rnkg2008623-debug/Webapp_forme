// 表示スタイル(標準 / ネオン)の切り替え。ネオンはWebGPUの3D背景(非対応のブラウザでは、CSSの簡易ネオン)。
import './cs-progress.js?v=119';
const KEY = 'theme';
const root = document.documentElement;
const buttons = [...document.querySelectorAll('.st-theme')];
const note = document.querySelector('.st-gpu-note');

export const getTheme = () => (root.dataset.theme === 'neon' ? 'neon' : 'standard');

async function apply() {
  const neon = getTheme() === 'neon';
  buttons.forEach(b => { const on = b.dataset.theme === getTheme(); b.classList.toggle('is-on', on); b.setAttribute('aria-pressed', String(on)); });
  if (!neon && /^(cs|physics|todo|mock|afk|english)$/.test(document.body.dataset.view)) window.appSetView('home');
  if (neon && document.body.dataset.view === 'notes') window.appSetView('home');
  const gpu = await import('./neon-bg.js?v=119');
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

// CS / Physics 画面(ネオンのときだけ): 開いている間だけ、WebGPUの背景を動かす
async function syncGpuViews(view) {
  if (getTheme() !== 'neon') return;
  const [cs, ph, io, mk, ak, eg] = await Promise.all([import('./cs.js?v=119'), import('./physics.js?v=119'), import('./todo.js?v=119'), import('./mock.js?v=119'), import('./afk.js?v=119'), import('./english.js?v=119')]);
  if (view === 'cs') cs.cs.start(); else cs.cs.stop();
  if (view === 'physics') ph.physics.start(); else ph.physics.stop();
  if (view === 'todo') io.todo.start(); else io.todo.stop();
  if (view === 'mock') mk.mock.start(); else mk.mock.stop();
  if (view === 'afk') ak.afk.start(); else ak.afk.stop();
  if (view === 'english') eg.english.start(); else eg.english.stop();
}
window.addEventListener('viewchange', e => syncGpuViews(e.detail));
if (/^(cs|physics|todo|mock|afk|english)$/.test(document.body.dataset.view)) syncGpuViews(document.body.dataset.view);
