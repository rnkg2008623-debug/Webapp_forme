// 表示スタイル(標準 / ネオン)の切り替え。ネオンはWebGPUの3D背景(非対応のブラウザでは、CSSの簡易ネオン)。
const KEY = 'theme';
const root = document.documentElement;
const buttons = [...document.querySelectorAll('.st-theme')];
const note = document.querySelector('.st-gpu-note');

export const getTheme = () => (root.dataset.theme === 'neon' ? 'neon' : 'standard');

async function apply() {
  const neon = getTheme() === 'neon';
  buttons.forEach(b => { const on = b.dataset.theme === getTheme(); b.classList.toggle('is-on', on); b.setAttribute('aria-pressed', String(on)); });
  if (!neon && /^(test2?|cs)$/.test(document.body.dataset.view)) window.appSetView('home');
  const gpu = await import('./neon-bg.js?v=41');
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
const test2View = document.getElementById('test2-view');
// 今のページに合わせて、Test / Test2 の背景を動かす(開いていない方は止める)
async function syncTest(view) {
  if (getTheme() !== 'neon') return;
  const [a, b, c] = await Promise.all([import('./test-bg.js?v=41'), import('./test2-bg.js?v=41'), import('./cs.js?v=41')]);
  if (view === 'test') a.startTest(testView); else a.stopTest();
  if (view === 'test2') b.test2.start(test2View); else b.test2.stop();
  if (view === 'cs') c.cs.start(); else c.cs.stop();
}
window.addEventListener('viewchange', e => syncTest(e.detail));
if (/^(test2?|cs)$/.test(document.body.dataset.view)) syncTest(document.body.dataset.view);
// ページ送りのドット(見た目だけ)をゆっくり切り替える
document.querySelectorAll('.ts-dots').forEach(box => {
  const dots = [...box.querySelectorAll('i')]; let di = 0;
  setInterval(() => { dots[di].classList.remove('on'); di = (di + 1) % dots.length; dots[di].classList.add('on'); }, 3500);
});

// Knowledge を押すと、ページはそのままで、背景が動いて赤ベースになる(もう一度押す / 他のカードを押すと紫に戻る)
const cards = [...document.querySelectorAll('#test-view .ts-card')];
cards.forEach(card => card.addEventListener('click', async () => {
  const red = card.dataset.mode === 'red' && !testView.classList.contains('red');
  const test = await import('./test-bg.js?v=41');
  test.setRed(red, testView);
  cards.forEach(c => c.classList.toggle('is-on', red && c === card));
}));

// Test2: Threats = 鎖が全部切れて前へ進む / Knowledge = 鎖が上下から生えてくる / Practice = 鎖が全部下へ下がっていく(もう一度押すと元に戻る)
const gxCards = [...document.querySelectorAll('#test2-view .gx-card')];
gxCards.forEach(card => card.addEventListener('click', async () => {
  const m = await import('./test2-bg.js?v=41');
  const on = m.setMode(card.dataset.mode);
  gxCards.forEach(c => c.classList.toggle('is-on', on === c.dataset.mode));
}));
