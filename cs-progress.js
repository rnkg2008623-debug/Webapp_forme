// CS の「復習済み」チェックと、その色(Settings で選ぶ)。このブラウザに保存する。
const KEY_DONE = 'csDone', KEY_COLOR = 'csDoneColor', DEFAULT = '#6ee7a0';
const PRESETS = ['#6ee7a0', '#5ac8ff', '#ffd166', '#ff7ab8', '#b794ff', '#ff9a5c'];
const root = document.documentElement;

let done;
try { done = new Set(JSON.parse(localStorage.getItem(KEY_DONE) || '[]')); } catch { done = new Set(); }
const saveDone = () => { try { localStorage.setItem(KEY_DONE, JSON.stringify([...done])); } catch { /* 無視 */ } };

export const isDone = code => done.has(code);
export function toggleDone(code) { if (done.has(code)) done.delete(code); else done.add(code); saveDone(); return done.has(code); }
export const countDone = codes => codes.filter(c => done.has(c)).length;

const validColor = c => /^#[0-9a-f]{6}$/i.test(c || '');
export function getColor() { try { const c = localStorage.getItem(KEY_COLOR); if (validColor(c)) return c; } catch { /* 無視 */ } return DEFAULT; }
export function setColor(c) {
  if (!validColor(c)) return;
  try { localStorage.setItem(KEY_COLOR, c); } catch { /* 無視 */ }
  applyColor(); window.dispatchEvent(new CustomEvent('csdonecolor'));
}
function applyColor() {
  const c = getColor();
  root.style.setProperty('--cs-done', c);
  document.querySelectorAll('.cs-swatch').forEach(b => { const on = b.dataset.color === c; b.classList.toggle('is-on', on); b.setAttribute('aria-pressed', String(on)); });
  const pick = document.getElementById('cs-done-pick'); if (pick && pick.value !== c) pick.value = c;
}

// Settings の色えらび
const wrap = document.getElementById('cs-done-colors');
if (wrap) {
  wrap.append(...PRESETS.map(c => {
    const b = document.createElement('button');
    b.type = 'button'; b.className = 'cs-swatch'; b.dataset.color = c; b.style.setProperty('--c', c); b.setAttribute('aria-label', c);
    b.addEventListener('click', () => setColor(c));
    return b;
  }));
  document.getElementById('cs-done-pick')?.addEventListener('input', e => setColor(e.target.value));
}
applyColor();
