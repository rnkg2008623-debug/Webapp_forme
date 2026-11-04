// 表示スタイル(標準 / ネオン)の切り替え。ネオンはWebGPUの3D背景(非対応のブラウザでは、CSSの簡易ネオン)。
const KEY = 'theme';
const root = document.documentElement;
const buttons = [...document.querySelectorAll('.st-theme')];
const note = document.querySelector('.st-gpu-note');

export const getTheme = () => (root.dataset.theme === 'neon' ? 'neon' : 'standard');

async function apply() {
  const neon = getTheme() === 'neon';
  buttons.forEach(b => { const on = b.dataset.theme === getTheme(); b.classList.toggle('is-on', on); b.setAttribute('aria-pressed', String(on)); });
  if (!neon && document.body.dataset.view === 'cs') window.appSetView('home');
  const gpu = await import('./neon-bg.js?v=52');
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

// CS 画面(ネオンのときだけ): 開いている間だけ、WebGPUの背景を動かす
async function syncCs(view) {
  if (getTheme() !== 'neon') return;
  const m = await import('./cs.js?v=52');
  if (view === 'cs') m.cs.start(); else m.cs.stop();
}
window.addEventListener('viewchange', e => syncCs(e.detail));
if (document.body.dataset.view === 'cs') syncCs('cs');
