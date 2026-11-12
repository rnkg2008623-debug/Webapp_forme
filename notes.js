// Notes(標準スタイルのとき): ノートに書き出すようなメモ帳。カテゴリーごとのタブ、ページ送り(WebGPUでめくる)、保存、Export / Import。
// データは、このブラウザに、アカウントごとに保存する(書くたびに自動保存。Save ボタンでも保存)。
import { t } from './i18n.js?v=89';
import { playFlip, warmFlip } from './notes-flip.js?v=89';

const $ = id => document.getElementById(id);
const rid = () => Math.random().toString(36).slice(2, 9);
const HUES = [212, 345, 142, 32, 275, 190, 55];
const PAD_L = 76, PAD_R = 28, LINE = 34;      // 紙の左の余白(赤い線の右)、右の余白、1行の高さ(px)

let uid = '', data = null, flipping = false, saveTimer = 0, dirty = false;
const key = () => `notes:v1:${uid}`;

// 構造: カテゴリー(上のタブ) → フォルダ(タブごとに独立) → ページ
const newPage = (text = '') => ({ id: rid(), text, at: Date.now() });
const newFolder = name => ({ id: rid(), name, pages: [newPage()], pi: 0 });
const newCat = (name, folders) => { const fs = folders || []; return { id: rid(), name, folders: fs, fcur: fs[0] ? fs[0].id : '' }; };   // フォルダは、作るまでは0個
function fresh() {
  const cats = [newCat(t('nt.cat1')), newCat(t('nt.cat2')), newCat(t('nt.cat3'))];
  return { v: 4, cats, cur: cats[0].id };
}
// 前の形のデータ(v1: タブだけ / v2: フォルダの中にタブ)も、今の形に直す
function migrate(d) {
  const cl = (s, n) => String(s || '').slice(0, n);
  const pagesOf = c => (Array.isArray(c && c.pages) && c.pages.length ? c.pages.slice(0, 200) : [{}]).map(p => newPage(cl(p && p.text, 20000)));
  const fol = (name, c) => ({ id: rid(), name: cl(name, 20) || t('nt.untitled'), pages: pagesOf(c), pi: 0 });
  let cats = [];
  if (d && Array.isArray(d.cats) && d.cats.length && d.cats.every(c => Array.isArray(c && c.folders))) {            // v3
    cats = d.cats.slice(0, 30).map(c => newCat(cl(c.name, 20) || t('nt.untitled'), c.folders.slice(0, 50).map(f => fol(f.name, f))));
  } else if (d && Array.isArray(d.folders) && d.folders.length) {                                              // v2: 同じ名前のタブを1つにまとめ、元のフォルダを、そのタブの中のフォルダにする
    const by = new Map();
    for (const f of d.folders.slice(0, 50)) for (const c of (Array.isArray(f.cats) ? f.cats : []).slice(0, 30)) {
      const name = cl(c.name, 20) || t('nt.untitled');
      if (!by.has(name)) by.set(name, []);
      by.get(name).push(fol(f.name, c));
    }
    cats = [...by].map(([name, fs]) => newCat(name, fs));
  } else if (d && Array.isArray(d.cats) && d.cats.length) {                                                    // v1
    cats = d.cats.slice(0, 30).map(c => newCat(cl(c.name, 20) || t('nt.untitled'), [fol(t('nt.folder1'), c)]));
  }
  if (!cats.length) return null;
  return tidy({ v: 4, cats, cur: cats[0].id });
}
const blank = f => f.pages.every(p => !String(p.text || '').trim());
const DEFAULT_NAMES = new Set(['フォルダ1', 'Folder 1', '文件夹1', 'マイノート', 'My notes', '我的笔记']);
// 作った覚えのない空のフォルダ(昔のバージョンが自動で作ったもの)を片づける: 空で、初期の名前のもの / 別のタブに同じ名前のフォルダがあるもの
function tidy(d) {
  for (const c of d.cats) {
    c.folders = c.folders.filter(f => !(blank(f) && (DEFAULT_NAMES.has(f.name) || d.cats.some(o => o !== c && o.folders.some(x => x.name === f.name && !blank(x))))));
    if (!c.folders.some(f => f.id === c.fcur)) c.fcur = c.folders[0] ? c.folders[0].id : '';
  }
  if (!d.cats.some(c => c.id === d.cur)) d.cur = d.cats[0].id;
  d.v = 4; return d;
}
function load() {
  try {
    const raw = JSON.parse(localStorage.getItem(key()));
    if (raw && (raw.v === 3 || raw.v === 4) && Array.isArray(raw.cats) && raw.cats.length && raw.cats.every(c => Array.isArray(c.folders))) {
      if (raw.v === 3) { const d = tidy(raw); try { localStorage.setItem(key(), JSON.stringify(d)); } catch { /* 無視 */ } return d; }
      if (!raw.cats.some(c => c.id === raw.cur)) raw.cur = raw.cats[0].id;
      return raw;
    }
    const m = migrate(raw); if (m) return m;
  } catch { /* 無視 */ }
  return fresh();
}
function persist() {
  clearTimeout(saveTimer); dirty = false;
  try { localStorage.setItem(key(), JSON.stringify(data)); return true; } catch { return false; }
}
const C = () => data.cats.find(c => c.id === data.cur) || data.cats[0];          // いまのタブ(カテゴリー)
const fol = () => C().folders.find(f => f.id === C().fcur) || C().folders[0] || null;    // その中の、いまのフォルダ
const cat = fol;                                                                  // ページを持つのは、フォルダ(タブにフォルダがないときは null)
const savePage = () => { if (fol()) fol().pages[fol().pi].text = $('nt-text').value; };
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
  const c = cat(), ta = $('nt-text'), has = !!c;
  $('nt-sheet').classList.toggle('empty', !has);
  $('nt-empty').hidden = has;
  ['nt-newpage', 'nt-delpage'].forEach(id => { $(id).disabled = !has; });
  if (!has) {
    ta.value = ''; $('nt-count').textContent = '–'; $('nt-pageno').textContent = '';
    $('nt-prev').disabled = true; $('nt-next').disabled = true; $('nt-dots').replaceChildren();
    $('nt-delcat').hidden = data.cats.length <= 1;
    return;
  }
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
function renderFolders() {
  const box = $('nt-folders');
  box.replaceChildren(...C().folders.map(f => {
    const on = f.id === C().fcur;
    const b = document.createElement('button');
    b.type = 'button'; b.className = 'nt-folder' + (on ? ' on' : ''); b.dataset.id = f.id; b.title = t('nt.renameFolderHint');
    b.setAttribute('aria-pressed', String(on));
    b.innerHTML = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3 6.500A1.500 1.500 0 0 1 4.500 5h4.200l2 2.300h8.800A1.500 1.500 0 0 1 21 8.800v8.700a1.500 1.500 0 0 1-1.500 1.500h-15A1.500 1.500 0 0 1 3 17.500z"/></svg>';
    const name = document.createElement('span'); name.textContent = f.name; b.append(name);
    return b;
  }));
  const none = C().folders.length === 0;
  box.dataset.none = t('nt.noFolders');
  $('nt-renamefolder').hidden = none;
  $('nt-delfolder').hidden = none;
  $('nt-folderbar').classList.toggle('none', none);
  box.querySelector('.on')?.scrollIntoView({ block: 'nearest', inline: 'nearest' });
}
function renderAll() { renderFolders(); renderTabs(); renderPage(); }

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
  if (flipping || !cat()) return;
  const c = cat(); const from = c.pi;
  if (add) { c.pages.splice(from + 1, 0, newPage()); to = from + 1; }
  if (to < 0 || to >= c.pages.length || to === from) return;
  savePage();
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
  savePage(); persist();
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
const folderMd = (f, h = '#') => `${h} ${f.name}\n\n` + f.pages.map((p, i) => `${h}# ${t('nt.page')} ${i + 1}\n\n${p.text}\n`).join('\n');
function exportNow(kind) {
  savePage(); persist();
  const c = C(), f = fol();
  if (!f && (kind === 'page' || kind === 'folder')) { status(t('nt.emptyTab')); return; }
  if (kind === 'page') download(`${safe(c.name)}-${safe(f.name)}-p${f.pi + 1}-${stamp()}.txt`, page().text, 'text/plain;charset=utf-8');
  else if (kind === 'folder') download(`${safe(c.name)}-${safe(f.name)}-${stamp()}.md`, `# ${c.name}\n\n` + folderMd(f, '##'), 'text/markdown;charset=utf-8');
  else if (kind === 'cat') download(`${safe(c.name)}-${stamp()}.md`, `# ${c.name}\n\n` + c.folders.map(x => folderMd(x, '##')).join('\n'), 'text/markdown;charset=utf-8');
  else download(`notes-${stamp()}.json`, JSON.stringify(data, null, 2), 'application/json');
  status(t('nt.exported'));
}
function importFile(file) {
  const r = new FileReader();
  r.onload = () => {
    try {
      const m = migrate(JSON.parse(String(r.result)));
      if (!m) throw new Error('bad');
      data.cats.push(...m.cats); data.cur = m.cats[0].id; persist(); renderAll(); status(t('nt.imported'));
    } catch { status(t('nt.importBad'), true); }
  };
  r.readAsText(file);
}

// ---- 起動 ----
export function mountNotes(user) {
  uid = user.uid; data = load();
  const ta = $('nt-text');
  renderAll();
  ta.addEventListener('input', () => { if (!cat()) return; savePage(); page().at = Date.now(); queueSave(); });
  $('nt-prev').addEventListener('click', () => goPage(cat().pi - 1));
  $('nt-next').addEventListener('click', () => goPage(cat().pi + 1));
  $('nt-newpage').addEventListener('click', () => goPage(0, true));
  $('nt-delpage').addEventListener('click', () => {
    if (!cat() || !confirm(t('nt.confirmDelPage'))) return;
    const c = cat();
    if (c.pages.length === 1) c.pages[0] = newPage(); else { c.pages.splice(c.pi, 1); c.pi = Math.min(c.pi, c.pages.length - 1); }
    persist(); renderPage(); status(`${t('nt.saved')} ${clock()}`);
  });
  $('nt-save').addEventListener('click', () => { savePage(); status(persist() ? `${t('nt.saved')} ${clock()}` : t('nt.saveFail'), false); });
  $('nt-tabs').addEventListener('click', e => {
    if (e.target.closest('#nt-addcat')) {
      const name = (prompt(t('nt.newCatName'), '') || '').trim().slice(0, 20);
      if (!name || flipping) return;
      savePage(); const c = newCat(name); data.cats.push(c); data.cur = c.id; persist(); renderAll(); return;
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
  const folders = $('nt-folders');
  const swap = () => { const s = $('nt-sheet'); s.classList.remove('turn-next', 'turn-prev', 'swap'); void s.offsetWidth; s.classList.add('swap'); };
  $('nt-emptynew').addEventListener('click', () => $('nt-newfolder').click());
  $('nt-newfolder').addEventListener('click', () => {
    if (flipping) return;
    const name = (prompt(t('nt.newFolderName'), `${t('nt.folder')} ${C().folders.length + 1}`) || '').trim().slice(0, 20);
    if (!name) return;
    savePage(); const f = newFolder(name); C().folders.push(f); C().fcur = f.id; persist(); renderAll(); swap();
    folders.scrollTo({ left: folders.scrollWidth, behavior: 'smooth' }); ta.focus();
  });
  folders.addEventListener('click', e => {
    const b = e.target.closest('.nt-folder'); if (!b || flipping || b.dataset.id === C().fcur) return;
    savePage(); persist(); C().fcur = b.dataset.id; renderAll(); swap();
  });
  folders.addEventListener('dblclick', e => { if (e.target.closest('.nt-folder')) renameFolder(e.target.closest('.nt-folder').dataset.id); });
  folders.addEventListener('wheel', e => { if (Math.abs(e.deltaY) > Math.abs(e.deltaX)) { folders.scrollLeft += e.deltaY; e.preventDefault(); } }, { passive: false });   // 縦のホイールで、横にスクロール
  function renameFolder(id) {
    const f = C().folders.find(x => x.id === id); if (!f) return;
    const name = (prompt(t('nt.renameFolder'), f.name) || '').trim().slice(0, 20);
    if (name) { f.name = name; persist(); renderFolders(); }
  }
  $('nt-renamefolder').addEventListener('click', () => renameFolder(C().fcur));
  $('nt-delfolder').addEventListener('click', () => {
    if (!confirm(t('nt.confirmDelFolder'))) return;
    const i = C().folders.findIndex(f => f.id === C().fcur); C().folders.splice(i, 1); C().fcur = C().folders[Math.max(0, i - 1)].id; persist(); renderAll(); swap();
  });
  const menu = $('nt-exmenu');
  $('nt-export').addEventListener('click', e => { e.stopPropagation(); menu.hidden = !menu.hidden; $('nt-export').setAttribute('aria-expanded', String(!menu.hidden)); });
  document.addEventListener('click', e => { if (!e.target.closest('.nt-exwrap')) { menu.hidden = true; $('nt-export').setAttribute('aria-expanded', 'false'); } });
  menu.addEventListener('click', e => { const b = e.target.closest('[data-ex]'); if (!b) return; menu.hidden = true; if (b.dataset.ex === 'import') $('nt-file').click(); else exportNow(b.dataset.ex); });
  $('nt-file').addEventListener('change', e => { const f = e.target.files[0]; if (f) importFile(f); e.target.value = ''; });
  window.addEventListener('beforeunload', () => { if (dirty) { savePage(); persist(); } });
  window.addEventListener('viewchange', e => { if (e.detail === 'notes') warmFlip(); if (e.detail !== 'notes' && dirty) { savePage(); persist(); } });
  window.addEventListener('langchange', () => { renderTabs(); renderFolders(); renderPage(); });
  status(t('nt.ready'));
}
