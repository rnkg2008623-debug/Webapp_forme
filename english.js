// English(ネオンのときだけ): 単語を CSV(English, meaning)で取り込んで、取り込みごとに「ボックス」(ラベルと日時つき)に分ける。
// ボックスを選ぶと、カードのクイズ(中央に問題、下に4択)で復習できる。単語ごとに、答えた回数・正解数・正解率を記録して、Statistic で見られる。
// 背景はWebGPU(白黒のゴシックの大聖堂)。データは、このブラウザに、アカウントごとに保存する。
import { createGpuView } from './gpu-view.js?v=118';
import { WGSL } from './physics-bg.js?v=118';
import { t, getLang } from './i18n.js?v=118';

const host = document.getElementById('english-view');
const stage = document.getElementById('english-stage');
const $ = id => document.getElementById(id);
const rid = () => Math.random().toString(36).slice(2, 9);
const MAX_WORDS_BOX = 3000, MAX_BOXES = 200, MAX_LEN = 120;
const LOCALES = { ja: 'ja-JP', en: 'en-GB', zh: 'zh-CN' };
const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const shuffle = a => { const x = [...a]; for (let i = x.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [x[i], x[j]] = [x[j], x[i]]; } return x; };

// ---- CSV ----
// 1行に「English, meaning」。区切りは、カンマ / タブ / セミコロン。"" で囲めば、中にカンマや改行を入れられる
export function parseCsv(text) {
  const src = String(text).replace(/^﻿/, '');
  const first = src.split(/\r?\n/).find(l => l.trim()) || '';
  const delim = first.includes('\t') ? '\t' : (first.match(/,/g) || []).length >= (first.match(/;/g) || []).length ? ',' : ';';
  const rows = []; let row = [], cell = '', q = false;
  for (let i = 0; i < src.length; i++) {
    const c = src[i];
    if (q) { if (c === '"') { if (src[i + 1] === '"') { cell += '"'; i++; } else q = false; } else cell += c; }
    else if (c === '"' && cell === '') q = true;
    else if (c === delim) { row.push(cell); cell = ''; }
    else if (c === '\n' || c === '\r') { if (c === '\r' && src[i + 1] === '\n') i++; row.push(cell); cell = ''; rows.push(row); row = []; }
    else cell += c;
  }
  if (cell !== '' || row.length) { row.push(cell); rows.push(row); }
  return rows.map(r => r.map(x => x.trim())).filter(r => r.some(x => x));
}
const HEADER_EN = /^(english|word|words|term|en|vocab|単語|英語)$/i, HEADER_MEAN = /^(meaning|meanings|japanese|translation|definition|means|ja|意味|日本語|訳)$/i;
export function wordsFromCsv(text) {
  let rows = parseCsv(text), skipped = 0, header = false;
  if (rows.length && HEADER_EN.test(rows[0][0] || '') && HEADER_MEAN.test(rows[0][1] || '')) { rows = rows.slice(1); header = true; }
  const seen = new Set(), words = [];
  for (const r of rows) {
    const en = (r[0] || '').slice(0, MAX_LEN), mean = (r[1] || '').slice(0, MAX_LEN);
    if (!en || !mean) { skipped++; continue; }
    const k = `${en.toLowerCase()}\u0001${mean}`; if (seen.has(k)) { skipped++; continue; } seen.add(k);
    words.push({ id: rid(), en, mean, n: 0, ok: 0, last: 0, streak: 0 });
  }
  return { words, skipped, header };
}

// ---- データ ----
let uid = '', data = { boxes: [] };
const key = () => `eng:v1:${uid}`;
function load() {
  try {
    const d = JSON.parse(localStorage.getItem(key()));
    if (d && Array.isArray(d.boxes)) return { boxes: d.boxes.slice(0, MAX_BOXES).map(b => ({
      id: String(b.id || rid()), label: String(b.label || '').slice(0, 40), at: Number(b.at) || Date.now(),
      words: (Array.isArray(b.words) ? b.words : []).slice(0, MAX_WORDS_BOX).map(w => ({ id: String(w.id || rid()), en: String(w.en || '').slice(0, MAX_LEN), mean: String(w.mean || '').slice(0, MAX_LEN),
        n: Math.max(0, Math.floor(+w.n) || 0), ok: Math.max(0, Math.min(Math.floor(+w.n) || 0, Math.floor(+w.ok) || 0)), last: Number(w.last) || 0, streak: Math.max(0, Math.floor(+w.streak) || 0) })).filter(w => w.en && w.mean) })) };
  } catch { /* 無視 */ }
  return { boxes: [] };
}
const save = () => { try { localStorage.setItem(key(), JSON.stringify({ v: 1, ...data })); return true; } catch { return false; } };
const allWords = () => data.boxes.flatMap(b => b.words);
const acc = w => (w.n ? w.ok / w.n : null);
const pct = v => (v === null ? '–' : `${Math.round(v * 100)}%`);
const fmtDT = ms => new Intl.DateTimeFormat(LOCALES[getLang()] || 'en-GB', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }).format(new Date(ms));
const fmtD = ms => (ms ? new Intl.DateTimeFormat(LOCALES[getLang()] || 'en-GB', { month: 'short', day: 'numeric' }).format(new Date(ms)) : '–');
const sum = (arr, f) => arr.reduce((s, x) => s + f(x), 0);
const boxStat = b => { const n = sum(b.words, w => w.n), ok = sum(b.words, w => w.ok); return { n, ok, acc: n ? ok / n : null, seen: b.words.filter(w => w.n).length, mastered: b.words.filter(w => w.n >= 3 && w.ok / w.n >= 0.8).length }; };

// ---- 状態 ----
let tab = 'boxes', setupId = '', quiz = null, statBox = 'all', statSort = 'acc', statDir = 1, statQ = '', statShow = 100, impText = '', impLabel = '', impMsg = '';
const sparkle = '<svg class="eg-spark" viewBox="0 0 24 24" aria-hidden="true"><path d="M12 0l2.2 8.800L24 12l-9.800 3.200L12 24l-2.200-8.800L0 12l9.800-3.200z"/></svg>';

// ---- クイズ ----
function buildQuestion(w, dir, box) {
  const text = (x, d) => (d === 'en2m' ? x.mean : x.en);
  const ans = text(w, dir), seen = new Set([ans]), picks = [];
  const pool = [...shuffle(box.words.filter(x => x.id !== w.id)), ...shuffle(allWords().filter(x => x.id !== w.id && !box.words.includes(x)))];
  for (const x of pool) { const s = text(x, dir); if (seen.has(s)) continue; seen.add(s); picks.push(s); if (picks.length === 3) break; }
  return { id: w.id, dir, ask: dir === 'en2m' ? w.en : w.mean, ans, choices: shuffle([ans, ...picks]), picked: -1 };
}
function startQuiz(boxId, opt) {
  const box = data.boxes.find(b => b.id === boxId); if (!box) return;
  let list = box.words;
  if (opt.mode === 'weak') { const weak = list.filter(w => w.n < 3 || w.ok / w.n < 0.7); if (weak.length) list = weak; }
  list = shuffle(list); if (opt.count > 0) list = list.slice(0, opt.count);
  const qs = list.map(w => buildQuestion(w, opt.dir === 'mixed' ? (Math.random() < 0.5 ? 'en2m' : 'm2en') : opt.dir, box));
  quiz = { boxId, qs, i: 0, correct: 0, missed: [], done: false };
  setupId = ''; render();
}
function answer(k) {
  const q = quiz.qs[quiz.i]; if (!q || q.picked >= 0 || k < 0 || k >= q.choices.length) return;
  q.picked = k;
  const w = data.boxes.find(b => b.id === quiz.boxId)?.words.find(x => x.id === q.id);
  const right = q.choices[k] === q.ans;
  if (w) { w.n++; w.last = Date.now(); if (right) { w.ok++; w.streak++; } else w.streak = 0; save(); }
  if (right) quiz.correct++; else quiz.missed.push({ ask: q.ask, ans: q.ans, picked: q.choices[k] });
  render();
}
function nextQ() {
  if (!quiz) return;
  const q = quiz.qs[quiz.i]; if (!q || q.picked < 0) return;
  if (quiz.i + 1 >= quiz.qs.length) quiz.done = true; else quiz.i++;
  render();
}

// ---- 描画 ----
const tabsHtml = () => `<div class="eg-tabs" role="tablist">${[['boxes', t('eg.tabBoxes')], ['import', t('eg.tabImport')], ['stats', t('eg.tabStats')]].map(([k, l]) => `<button type="button" role="tab" data-tab="${k}" class="${tab === k && !quiz ? 'on' : ''}">${esc(l)}</button>`).join('')}</div>`;
function boxesHtml() {
  if (!data.boxes.length) return `<div class="eg-empty"><p>${esc(t('eg.noBoxes'))}</p><button type="button" class="eg-pill solid" data-tab="import">${esc(t('eg.goImport'))}</button></div>`;
  const list = [...data.boxes].sort((a, b) => b.at - a.at);
  let lastDay = '';
  return list.map(b => {
    const day = new Intl.DateTimeFormat(LOCALES[getLang()] || 'en-GB', { year: 'numeric', month: 'long', day: 'numeric' }).format(new Date(b.at)), s = boxStat(b);
    const head = day !== lastDay ? `<h3 class="eg-day">${esc(day)}</h3>` : ''; lastDay = day;
    return `${head}<article class="eg-box" data-box="${b.id}"><div class="eg-boxtop"><h4 title="${esc(t('eg.renameHint'))}" data-rename="${b.id}">${esc(b.label || t('eg.noLabel'))}</h4><time>${esc(fmtDT(b.at))}</time></div>
      <div class="eg-boxnums"><span><b>${b.words.length}</b>${esc(t('eg.words'))}</span><span><b>${pct(s.acc)}</b>${esc(t('eg.accuracy'))}</span><span><b>${s.mastered}</b>${esc(t('eg.mastered'))}</span><span><b>${fmtN(s.n)}</b>${esc(t('eg.answers'))}</span></div>
      <div class="eg-bar"><i style="width:${b.words.length ? s.mastered / b.words.length * 100 : 0}%"></i></div>
      <div class="eg-boxbtns"><button type="button" class="eg-pill solid sm" data-study="${b.id}" ${b.words.length >= 2 ? '' : 'disabled'}>${esc(t('eg.study'))}</button><button type="button" class="eg-pill sm" data-resetbox="${b.id}">${esc(t('eg.resetStats'))}</button><button type="button" class="eg-pill sm danger" data-delbox="${b.id}">${esc(t('eg.deleteBox'))}</button></div></article>`;
  }).join('');
}
const fmtN = n => Number(n).toLocaleString();
function setupHtml() {
  const b = data.boxes.find(x => x.id === setupId); if (!b) return '';
  const sel = (id, opts, cur) => `<select id="${id}">${opts.map(([v, l]) => `<option value="${v}" ${String(v) === String(cur) ? 'selected' : ''}>${esc(l)}</option>`).join('')}</select>`;
  return `<div class="eg-setup"><h3>${esc(b.label || t('eg.noLabel'))} <small>${b.words.length} ${esc(t('eg.words'))}</small></h3>
    <label>${esc(t('eg.dir'))}${sel('eg-dir', [['en2m', t('eg.dirEn')], ['m2en', t('eg.dirMean')], ['mixed', t('eg.dirMixed')]], 'en2m')}</label>
    <label>${esc(t('eg.mode'))}${sel('eg-mode', [['all', t('eg.modeAll')], ['weak', t('eg.modeWeak')]], 'all')}</label>
    <label>${esc(t('eg.count'))}${sel('eg-count', [[10, '10'], [20, '20'], [50, '50'], [0, t('eg.countAll')]], Math.min(20, b.words.length) === b.words.length ? 0 : 20)}</label>
    <div class="eg-btns"><button type="button" class="eg-pill solid" data-start="${b.id}">${esc(t('eg.start'))}</button><button type="button" class="eg-pill" data-cancel>${esc(t('eg.cancel'))}</button></div></div>`;
}
function quizHtml() {
  if (quiz.done) {
    const n = quiz.qs.length, rate = n ? Math.round(quiz.correct / n * 100) : 0;
    const missed = quiz.missed.length ? `<h4>${esc(t('eg.missed'))}</h4><ul class="eg-missed">${quiz.missed.map(m => `<li><b>${esc(m.ask)}</b><span>${esc(m.ans)}</span><em>${esc(m.picked)}</em></li>`).join('')}</ul>` : `<p class="eg-perfect">${esc(t('eg.perfect'))}</p>`;
    return `<div class="eg-result"><h3>${esc(t('eg.result'))}</h3><div class="eg-score"><b>${quiz.correct}</b> / ${n}<small>${rate}%</small></div>${missed}<div class="eg-btns"><button type="button" class="eg-pill solid" data-retry>${esc(t('eg.retry'))}</button><button type="button" class="eg-pill" data-quit>${esc(t('eg.backBoxes'))}</button></div></div>`;
  }
  const q = quiz.qs[quiz.i], answered = q.picked >= 0, w = data.boxes.find(b => b.id === quiz.boxId)?.words.find(x => x.id === q.id);
  const choices = q.choices.map((c, k) => { const cls = !answered ? '' : c === q.ans ? ' right' : k === q.picked ? ' wrong' : ' dim'; return `<button type="button" class="eg-choice${cls}" data-pick="${k}" ${answered ? 'disabled' : ''}><kbd>${k + 1}</kbd><span>${esc(c)}</span></button>`; }).join('');
  const fb = answered ? `<p class="eg-fb ${q.choices[q.picked] === q.ans ? 'ok' : 'ng'}">${esc(q.choices[q.picked] === q.ans ? t('eg.right') : t('eg.wrong', { a: q.ans }))}${w ? ` <small>${esc(t('eg.wordStat', { n: w.n, a: pct(acc(w)) }))}</small>` : ''}</p>` : '';
  return `<div class="eg-quizbar"><button type="button" class="eg-pill sm" data-quit>${esc(t('eg.quit'))}</button><div class="eg-prog"><i style="width:${(quiz.i + (answered ? 1 : 0)) / quiz.qs.length * 100}%"></i></div><span>${quiz.i + 1} / ${quiz.qs.length} · ${quiz.correct} ✓</span></div>
    <div class="eg-card" data-dir="${q.dir}"><small>${esc(q.dir === 'en2m' ? t('eg.askEn') : t('eg.askMean'))}</small><div class="eg-q">${esc(q.ask)}</div></div>
    ${fb}<div class="eg-choices">${choices}</div>
    <div class="eg-next">${answered ? `<button type="button" class="eg-pill solid" data-next>${esc(quiz.i + 1 >= quiz.qs.length ? t('eg.finish') : t('eg.next'))} <kbd>Enter</kbd></button>` : `<span class="eg-hint">${esc(t('eg.keyHint'))}</span>`}</div>`;
}
function importHtml() {
  return `<div class="eg-import"><h3>${esc(t('eg.importTitle'))}</h3><p class="eg-note">${esc(t('eg.importNote'))}</p>
    <pre class="eg-sample">English,meaning\nabandon,見捨てる\nambiguous,あいまいな</pre>
    <label class="eg-f"><span>${esc(t('eg.label'))}</span><input id="eg-label" maxlength="40" value="${esc(impLabel)}" placeholder="${esc(t('eg.labelPh'))}"></label>
    <label class="eg-f"><span>${esc(t('eg.paste'))}</span><textarea id="eg-text" rows="9" placeholder="English,meaning">${esc(impText)}</textarea></label>
    <div class="eg-btns"><label class="eg-pill file">${esc(t('eg.chooseFile'))}<input id="eg-file" type="file" accept=".csv,.tsv,.txt,text/csv,text/plain" hidden></label><button type="button" class="eg-pill solid" id="eg-import">${esc(t('eg.import'))}</button></div>
    <p class="eg-preview" id="eg-preview"></p><p class="eg-msg" id="eg-msg" role="status" ${impMsg ? '' : 'hidden'}>${esc(impMsg)}</p></div>`;
}
function statsHtml() {
  const words = statBox === 'all' ? allWords() : (data.boxes.find(b => b.id === statBox)?.words || []);
  const n = sum(words, w => w.n), ok = sum(words, w => w.ok), seen = words.filter(w => w.n).length, mastered = words.filter(w => w.n >= 3 && w.ok / w.n >= 0.8).length;
  const q = statQ.trim().toLowerCase();
  let rows = words.map(w => ({ w, box: data.boxes.find(b => b.words.includes(w)) })).filter(r => !q || r.w.en.toLowerCase().includes(q) || r.w.mean.toLowerCase().includes(q));
  const val = { acc: r => (acc(r.w) === null ? 2 : acc(r.w)), n: r => r.w.n, ok: r => r.w.ok, wrong: r => r.w.n - r.w.ok, en: r => r.w.en.toLowerCase(), last: r => r.w.last }[statSort];
  rows.sort((a, b) => { const x = val(a), y = val(b); return (x < y ? -1 : x > y ? 1 : 0) * statDir; });
  const shown = rows.slice(0, statShow);
  const th = (k, l) => `<th><button type="button" data-sort="${k}" class="${statSort === k ? 'on' : ''}">${esc(l)}${statSort === k ? (statDir > 0 ? ' ▲' : ' ▼') : ''}</button></th>`;
  const boxRows = [...data.boxes].sort((a, b) => b.at - a.at).map(b => { const s = boxStat(b); return `<tr><td>${esc(b.label || t('eg.noLabel'))}</td><td>${esc(fmtD(b.at))}</td><td>${b.words.length}</td><td>${s.n}</td><td>${pct(s.acc)}</td><td>${s.mastered}</td></tr>`; }).join('');
  return `<div class="eg-stats"><div class="eg-cards"><div><b>${fmtN(words.length)}</b><span>${esc(t('eg.words'))}</span></div><div><b>${fmtN(seen)}</b><span>${esc(t('eg.seen'))}</span></div><div><b>${fmtN(n)}</b><span>${esc(t('eg.answers'))}</span></div><div><b>${pct(n ? ok / n : null)}</b><span>${esc(t('eg.accuracy'))}</span></div><div><b>${fmtN(mastered)}</b><span>${esc(t('eg.mastered'))}</span></div></div>
    <p class="eg-note">${esc(t('eg.masteredNote'))}</p>
    ${data.boxes.length ? `<h3>${esc(t('eg.perBox'))}</h3><div class="eg-tablewrap"><table class="eg-table"><thead><tr><th>${esc(t('eg.label'))}</th><th>${esc(t('eg.importedAt'))}</th><th>${esc(t('eg.words'))}</th><th>${esc(t('eg.answers'))}</th><th>${esc(t('eg.accuracy'))}</th><th>${esc(t('eg.mastered'))}</th></tr></thead><tbody>${boxRows}</tbody></table></div>` : ''}
    <h3>${esc(t('eg.perWord'))}</h3><div class="eg-filters"><select id="eg-statbox"><option value="all">${esc(t('eg.allBoxes'))}</option>${[...data.boxes].sort((a, b) => b.at - a.at).map(b => `<option value="${b.id}" ${b.id === statBox ? 'selected' : ''}>${esc(b.label || t('eg.noLabel'))} · ${esc(fmtD(b.at))}</option>`).join('')}</select><input id="eg-statq" type="search" value="${esc(statQ)}" placeholder="${esc(t('eg.search'))}"></div>
    <div class="eg-tablewrap"><table class="eg-table words"><thead><tr>${th('en', 'English')}<th>${esc(t('eg.meaning'))}</th>${th('n', t('eg.answers'))}${th('ok', t('eg.correct'))}${th('wrong', t('eg.incorrect'))}${th('acc', t('eg.accuracy'))}${th('last', t('eg.lastAns'))}</tr></thead><tbody>${shown.map(({ w }) => { const a = acc(w); return `<tr><td class="en">${esc(w.en)}</td><td>${esc(w.mean)}</td><td>${w.n}</td><td>${w.ok}</td><td>${w.n - w.ok}</td><td class="accell"><span class="eg-mini"><i style="width:${a === null ? 0 : a * 100}%" class="${a !== null && a < 0.7 ? 'low' : ''}"></i></span>${pct(a)}</td><td>${esc(fmtD(w.last))}</td></tr>`; }).join('') || `<tr><td colspan="7" class="none">${esc(t('eg.noWords'))}</td></tr>`}</tbody></table></div>
    ${rows.length > shown.length ? `<div class="eg-btns"><button type="button" class="eg-pill sm" data-more>${esc(t('eg.more', { n: rows.length - shown.length }))}</button></div>` : ''}</div>`;
}
function render() {
  const keepScroll = stage.scrollTop;
  let body;
  if (quiz) body = quizHtml(); else if (setupId) body = setupHtml(); else body = tab === 'boxes' ? boxesHtml() : tab === 'import' ? importHtml() : statsHtml();
  stage.innerHTML = `<div class="eg-page"><header class="eg-head">${sparkle}<div><h2>English <em>Cards</em></h2><p>${esc(t('eg.sub'))}</p></div>${tabsHtml()}</header>${body}</div>`;
  stage.scrollTop = keepScroll;
  if (tab === 'import' && !quiz && !setupId) updatePreview();
}
function updatePreview() {
  const ta = $('eg-text'), pv = $('eg-preview'); if (!ta || !pv) return;
  const r = wordsFromCsv(ta.value);
  pv.textContent = ta.value.trim() ? t('eg.found', { n: r.words.length, s: r.skipped }) : '';
}
async function readFile(file) {
  const buf = await file.arrayBuffer();
  let s = new TextDecoder('utf-8').decode(buf);
  if (s.includes('�')) { try { s = new TextDecoder('shift_jis').decode(buf); } catch { /* そのまま */ } }   // Excel の日本語CSV(Shift-JIS)
  return s;
}

function wire() {
  stage.addEventListener('click', e => {
    const q = sel => e.target.closest(sel);
    let x;
    if ((x = q('[data-tab]'))) { tab = x.dataset.tab; quiz = null; setupId = ''; impMsg = ''; render(); return; }
    if ((x = q('[data-study]'))) { setupId = x.dataset.study; render(); return; }
    if ((x = q('[data-start]'))) { const o = { dir: $('eg-dir').value, mode: $('eg-mode').value, count: Number($('eg-count').value) }; startQuiz(x.dataset.start, o); if (quiz) quiz.opt = o; return; }
    if (q('[data-cancel]')) { setupId = ''; render(); return; }
    if ((x = q('[data-pick]'))) { answer(Number(x.dataset.pick)); return; }
    if (q('[data-next]')) { nextQ(); return; }
    if (q('[data-quit]')) { quiz = null; setupId = ''; render(); return; }
    if (q('[data-retry]')) { const b = quiz.boxId, o = quiz.opt || { dir: 'en2m', mode: 'all', count: 20 }; startQuiz(b, o); quiz.opt = o; return; }
    if ((x = q('[data-delbox]'))) { if (confirm(t('eg.confirmDel'))) { data.boxes = data.boxes.filter(b => b.id !== x.dataset.delbox); save(); render(); } return; }
    if ((x = q('[data-resetbox]'))) { if (confirm(t('eg.confirmReset'))) { const b = data.boxes.find(b2 => b2.id === x.dataset.resetbox); b?.words.forEach(w => { w.n = 0; w.ok = 0; w.last = 0; w.streak = 0; }); save(); render(); } return; }
    if ((x = q('[data-rename]'))) { if (e.detail >= 2) { const b = data.boxes.find(b2 => b2.id === x.dataset.rename); const v = (prompt(t('eg.renamePrompt'), b?.label || '') ?? '').trim().slice(0, 40); if (b && v) { b.label = v; save(); render(); } } return; }
    if ((x = q('[data-sort]'))) { const k = x.dataset.sort; if (statSort === k) statDir = -statDir; else { statSort = k; statDir = k === 'en' ? 1 : (k === 'acc' ? 1 : -1); } render(); return; }
    if (q('[data-more]')) { statShow += 200; render(); return; }
    if (q('#eg-import')) { doImport(); }
  });
  stage.addEventListener('input', e => {
    if (e.target.id === 'eg-text') { impText = e.target.value; updatePreview(); }
    else if (e.target.id === 'eg-label') impLabel = e.target.value;
    else if (e.target.id === 'eg-statq') { statQ = e.target.value; const pos = e.target.selectionStart; statShow = 100; render(); const i = $('eg-statq'); i.focus(); i.setSelectionRange(pos, pos); }
  });
  stage.addEventListener('change', async e => {
    if (e.target.id === 'eg-statbox') { statBox = e.target.value; statShow = 100; render(); }
    else if (e.target.id === 'eg-file') { const f = e.target.files[0]; if (!f) return; impText = await readFile(f); if (!impLabel) impLabel = f.name.replace(/\.[^.]+$/, '').slice(0, 40); e.target.value = ''; render(); }
  });
  document.addEventListener('keydown', e => {
    if (document.body.dataset.view !== 'english' || !quiz || quiz.done || e.target.closest('input, textarea, select')) return;
    if (e.key >= '1' && e.key <= '4') { answer(Number(e.key) - 1); e.preventDefault(); }
    else if (e.key === 'Enter' || e.key === ' ') { if (quiz.qs[quiz.i].picked >= 0) { nextQ(); e.preventDefault(); } }
  });
  window.addEventListener('langchange', () => render());
}
function doImport() {
  const label = $('eg-label').value.trim().slice(0, 40), text = $('eg-text').value;
  const r = wordsFromCsv(text);
  const say = s => { impMsg = s; const m = $('eg-msg'); if (m) { m.textContent = s; m.hidden = !s; } };
  if (!r.words.length) return say(t('eg.importNone'));
  if (data.boxes.length >= MAX_BOXES) return say(t('eg.tooManyBoxes'));
  const words = r.words.slice(0, MAX_WORDS_BOX);
  data.boxes.push({ id: rid(), label: label || t('eg.defaultLabel'), at: Date.now(), words });
  if (!save()) { data.boxes.pop(); return say(t('eg.saveFail')); }
  const n = words.length, s = r.skipped + (r.words.length - n); impText = ''; impLabel = ''; impMsg = t('eg.imported', { n, s });
  tab = 'boxes'; render();
  const m = document.createElement('p'); m.className = 'eg-msg ok'; m.textContent = impMsg; stage.querySelector('.eg-page').insertBefore(m, stage.querySelector('.eg-page > :nth-child(2)')); impMsg = '';
}

let punch = -10;
const view = createGpuView(WGSL, now => {
  const x = Math.min(1, Math.max(0, (now - punch) / 1.1));
  return [0, 0, now - punch, x < 1 ? Math.sin(Math.PI * x) * 0.9 : 0];
});
export const english = { start: () => { punch = performance.now() / 1000; return view.start(host); }, stop: () => view.stop() };

export function mountEnglish(user) { uid = user.uid; data = load(); render(); wire(); }
