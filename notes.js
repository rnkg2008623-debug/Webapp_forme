// Notes(標準スタイルのとき): ノートに書き出すようなメモ帳。カテゴリーごとのタブ、ページ送り(WebGPUでめくる)、保存、Export / Import。
// データは、このブラウザに、アカウントごとに保存する(書くたびに自動保存。Save ボタンでも保存)。
import { t } from './i18n.js?v=85';
import { playFlip, warmFlip } from './notes-flip.js?v=85';

const $ = id => document.getElementById(id);
const rid = () => Math.random().toString(36).slice(2, 9);
const HUES = [212, 345, 142, 32, 275, 190, 55];
const PAD_L = 76, PAD_R = 28, LINE = 34;      // 紙の左の余白(赤い線の右)、右の余白、1行の高さ(px)

let uid = '', data = null, flipping = false, saveTimer = 0, dirty = false;
const key = () => `notes:v1:${uid}`;

const newPage = (text = '') => ({ id: rid(), text, at: Date.now() });
const newCat = name => ({ id: rid(), name, pages: [newPage()], pi: 0 });
function fresh() {
  const d = { v: 1, cats: [newCat(t('nt.cat1')), newCat(t('nt.cat2')), newCat(t('nt.cat3'))], cur: '' };
  d.cur = d.cats[0].id; return d;
}
function load() {
  try { const d = JSON.parse(localStorage.getItem(key())); if (d && Array.isArray(d.cats) && d.cats.length) return d; } catch { /* 無視 */ }
  return fresh();
}
function persist() {
  clearTimeout(saveTimer); dirty = false;
  try { localStorage.setItem(key(), JSON.stringify(data)); return true; } catch { return false; }
}
const cat = () => data.cats.find(c => c.id === data.cur) || data.cats[0];
const page = () => cat().pages[cat().pi];
function status(msg, bad) { const s = $('nt-status'); s.textContent = msg; s.classList.toggle('bad', !!bad); }
const clock = () => new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
function queueSave() {
  dirty = true; status(t('nt.unsaved'));
  clearTimeout(saveTimer);
  saveTimer = setTimeout(() => { status(persist() ? `${t('nt.saved')} ${clock()}` : t('nt.saveFail'), false); }, 500);
}

// ---- 描画 ----
function renderTabs() {
  const box = $('nt-tabs');
  box.replaceChildren(...data.cats.map((c, i) => {
    const b = document.createElement('button');
    b.type = 'button'; b.className = 'nt-tab' + (c.id === data.cur ? ' on' : ''); b.role = 'tab';
    b.setAttribute('aria-selected', String(c.id === data.cur));
    b.style.setProperty('--h', HUES[i % HUES.length]);
    b.dataset.id = c.id; b.title = t('nt.renameHint');
    const name = document.createElement('span'); name.textContent = c.name; b.append(name);
    return b;
  }));
  const add = document.createElement('button');
  add.type = 'button'; add.className = 'nt-tab nt-add'; add.id = 'nt-addcat'; add.textContent = '+'; add.setAttribute('aria-label', t('nt.addCat'));
  box.append(add);
  const idx = Math.max(0, data.cats.findIndex(c => c.id === data.cur));
  $('nt-book').style.setProperty('--h', HUES[idx % HUES.length]);
}
function renderPage() {
  const c = cat(), ta = $('nt-text');
  ta.value = page().text;
  ta.scrollTop = 0;
  $('nt-count').textContent = `${c.pi + 1} / ${c.pages.length}`;
  $('nt-pageno').textContent = String(c.pi + 1);
  $('nt-prev').disabled = c.pi === 0;
  $('nt-next').disabled = c.pi >= c.pages.length - 1;
  $('nt-delcat').hidden = data.cats.length <= 1;
  const dots = $('nt-dots');
  dots.replaceChildren(...c.pages.slice(0, 12).map((_, i) => { const d = document.createElement('i'); d.className = i === c.pi ? 'on' : ''; return d; }));
}
function renderAll() { renderTabs(); renderPage(); }

// ---- ページめくりの絵(紙・罫線・赤い線・文字を、textarea と同じ見た目で2D canvasに描く) ----
function wrap(ctx, text, maxW) {
  const lines = [];
  for (const para of String(text).split('\n')) {
    if (!para) { lines.push(''); continue; }
    const tokens = para.match(/[　-鿿＀-￯]|\s+|[^\s　-鿿＀-￯]+/g) || [];
    let cur = '';
    for (const tok of tokens) {
      if (ctx.measureText(cur + tok).width <= maxW || !cur.trim()) {
        if (ctx.measureText(cur + tok).width > maxW) {      // 長すぎる単語は、文字ごとに折り返す
          for (const ch of tok) { if (ctx.measureText(cur + ch).width > maxW && cur) { lines.push(cur); cur = ''; } cur += ch; }
        } else cur += tok;
      } else { lines.push(cur.trimEnd()); cur = tok.trimStart(); }
    }
    lines.push(cur);
  }
  return lines;
}
function sheetImage(text, no) {
  const sheet = $('nt-sheet'), ta = $('nt-text');
  const W = sheet.clientWidth, H = sheet.clientHeight, dpr = Math.min(devicePixelRatio || 1, 1.5);
  const cv = document.createElement('canvas'); cv.width = Math.round(W * dpr); cv.height = Math.round(H * dpr);
  const g = cv.getContext('2d'); g.scale(dpr, dpr);
  const cs = getComputedStyle(sheet);
  g.fillStyle = cs.getPropertyValue('--paper').trim() || '#fffdf5'; g.fillRect(0, 0, W, H);
  g.strokeStyle = cs.getPropertyValue('--rule').trim() || '#bcd4ee'; g.lineWidth = 1;
  for (let y = LINE; y < H; y += LINE) { g.beginPath(); g.moveTo(0, y - .5); g.lineTo(W, y - .5); g.stroke(); }
  g.strokeStyle = cs.getPropertyValue('--margin').trim() || '#f0a0a0'; g.beginPath(); g.moveTo(PAD_L - 16.5, 0); g.lineTo(PAD_L - 16.5, H); g.stroke();
  const tcs = getComputedStyle(ta);
  g.font = `${tcs.fontStyle} ${tcs.fontWeight} ${tcs.fontSize} ${tcs.fontFamily}`; g.fillStyle = tcs.color; g.textBaseline = 'middle';
  const maxW = ta.clientWidth - PAD_L - PAD_R;
  const top = ta === document.activeElement || true ? ta.scrollTop : 0;
  wrap(g, text, maxW).forEach((ln, i) => { const y = i * LINE - top; if (y > -LINE && y < H) g.fillText(ln, PAD_L, y + LINE / 2 + 1); });
  g.font = `600 14px ${tcs.fontFamily}`; g.fillStyle = 'rgba(80,90,110,.75)'; g.textAlign = 'right'; g.textBaseline = 'alphabetic'; g.fillText(String(no), W - 18, H - 12);
  return cv;
}

// ---- ページ移動 ----
async function goPage(to, add) {
  if (flipping) return;
  const c = cat(); const from = c.pi;
  if (add) { c.pages.splice(from + 1, 0, newPage()); to = from + 1; }
  if (to < 0 || to >= c.pages.length || to === from) return;
  page().text = $('nt-text').value;
  const fromImg = sheetImage(c.pages[from].text, from + 1), toImg = sheetImage(c.pages[to].text, to + 1);
  flipping = true; $('nt-sheet').classList.add('flipping');
  const dir = to > from ? 1 : -1;
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  let played = false;
  if (!reduce) played = await playFlip($('nt-sheet'), fromImg, toImg, dir);
  c.pi = to; renderPage(); persist(); status(`${t('nt.saved')} ${clock()}`);
  if (!played && !reduce) {   // WebGPU が使えないとき: CSSで、ふわっと切り替える
    const s = $('nt-sheet'); s.classList.remove('turn-next', 'turn-prev'); void s.offsetWidth; s.classList.add(dir > 0 ? 'turn-next' : 'turn-prev');
  }
  $('nt-sheet').classList.remove('flipping'); flipping = false;
  $('nt-text').focus({ preventScroll: true });
}
function selectCat(id) {
  if (flipping || id === data.cur) return;
  page().text = $('nt-text').value; persist();
  data.cur = id; renderAll();
  const s = $('nt-sheet'); s.classList.remove('turn-next', 'turn-prev', 'swap'); void s.offsetWidth; s.classList.add('swap');
}

// ---- Export / Import ----
function download(name, body, type) {
  const url = URL.createObjectURL(new Blob([body], { type }));
  const a = document.createElement('a'); a.href = url; a.download = name; document.body.append(a); a.click(); a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 2000);
}
const safe = s => String(s).replace(/[\\/:*?"<>|]+/g, '_').trim().slice(0, 40) || 'notes';
const stamp = () => new Date().toISOString().slice(0, 10);
function exportNow(kind) {
  page().text = $('nt-text').value; persist();
  const c = cat();
  if (kind === 'page') download(`${safe(c.name)}-p${c.pi + 1}-${stamp()}.txt`, page().text, 'text/plain;charset=utf-8');
  else if (kind === 'cat') download(`${safe(c.name)}-${stamp()}.md`, `# ${c.name}\n\n` + c.pages.map((p, i) => `## ${t('nt.page')} ${i + 1}\n\n${p.text}\n`).join('\n'), 'text/markdown;charset=utf-8');
  else download(`notes-${stamp()}.json`, JSON.stringify(data, null, 2), 'application/json');
  status(t('nt.exported'));
}
function importFile(file) {
  const r = new FileReader();
  r.onload = () => {
    try {
      const d = JSON.parse(String(r.result));
      if (!d || !Array.isArray(d.cats) || !d.cats.length) throw new Error('bad');
      const clean = d.cats.slice(0, 30).map(c => ({
        id: rid(), name: String(c.name || '').slice(0, 20) || t('nt.untitled'),
        pages: (Array.isArray(c.pages) && c.pages.length ? c.pages.slice(0, 200) : [{}]).map(p => newPage(String(p.text || '').slice(0, 20000))), pi: 0,
      }));
      data.cats.push(...clean); data.cur = clean[0].id; persist(); renderAll(); status(t('nt.imported'));
    } catch { status(t('nt.importBad'), true); }
  };
  r.readAsText(file);
}

// ---- 起動 ----
export function mountNotes(user) {
  uid = user.uid; data = load();
  const ta = $('nt-text');
  renderAll();
  ta.addEventListener('input', () => { page().text = ta.value; page().at = Date.now(); queueSave(); });
  $('nt-prev').addEventListener('click', () => goPage(cat().pi - 1));
  $('nt-next').addEventListener('click', () => goPage(cat().pi + 1));
  $('nt-newpage').addEventListener('click', () => goPage(0, true));
  $('nt-delpage').addEventListener('click', () => {
    if (!confirm(t('nt.confirmDelPage'))) return;
    const c = cat();
    if (c.pages.length === 1) c.pages[0] = newPage(); else { c.pages.splice(c.pi, 1); c.pi = Math.min(c.pi, c.pages.length - 1); }
    persist(); renderPage(); status(`${t('nt.saved')} ${clock()}`);
  });
  $('nt-save').addEventListener('click', () => { page().text = ta.value; status(persist() ? `${t('nt.saved')} ${clock()}` : t('nt.saveFail'), false); });
  $('nt-tabs').addEventListener('click', e => {
    if (e.target.closest('#nt-addcat')) {
      const name = (prompt(t('nt.newCatName'), '') || '').trim().slice(0, 20);
      if (!name || flipping) return;
      page().text = ta.value; const c = newCat(name); data.cats.push(c); data.cur = c.id; persist(); renderAll(); return;
    }
    const b = e.target.closest('.nt-tab[data-id]'); if (b) selectCat(b.dataset.id);
  });
  $('nt-tabs').addEventListener('dblclick', e => {
    const b = e.target.closest('.nt-tab[data-id]'); if (!b) return;
    const c = data.cats.find(x => x.id === b.dataset.id);
    const name = (prompt(t('nt.renameCat'), c.name) || '').trim().slice(0, 20);
    if (name) { c.name = name; persist(); renderTabs(); }
  });
  $('nt-delcat').addEventListener('click', () => {
    if (!confirm(t('nt.confirmDelCat'))) return;
    const i = data.cats.findIndex(c => c.id === data.cur); data.cats.splice(i, 1); data.cur = data.cats[Math.max(0, i - 1)].id; persist(); renderAll();
  });
  const menu = $('nt-exmenu');
  $('nt-export').addEventListener('click', e => { e.stopPropagation(); menu.hidden = !menu.hidden; $('nt-export').setAttribute('aria-expanded', String(!menu.hidden)); });
  document.addEventListener('click', e => { if (!e.target.closest('.nt-exwrap')) { menu.hidden = true; $('nt-export').setAttribute('aria-expanded', 'false'); } });
  menu.addEventListener('click', e => { const b = e.target.closest('[data-ex]'); if (!b) return; menu.hidden = true; if (b.dataset.ex === 'import') $('nt-file').click(); else exportNow(b.dataset.ex); });
  $('nt-file').addEventListener('change', e => { const f = e.target.files[0]; if (f) importFile(f); e.target.value = ''; });
  window.addEventListener('beforeunload', () => { if (dirty) { page().text = ta.value; persist(); } });
  window.addEventListener('viewchange', e => { if (e.detail === 'notes') warmFlip(); if (e.detail !== 'notes' && dirty) { page().text = ta.value; persist(); } });
  window.addEventListener('langchange', () => { renderTabs(); renderPage(); });
  status(t('nt.ready'));
}
