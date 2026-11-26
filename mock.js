// Mock(ネオンのときだけ): 科目を入力して、その科目のガントチャートを作る。タスク(名前・開始日・終了日・進み具合)を並べて、
// 今日の線と、模試の日の線も出る。背景はWebGPU(白黒のゴシックの大聖堂)。データは、このブラウザに、アカウントごとに保存する。
import { createGpuView } from './gpu-view.js?v=106';
import { WGSL } from './physics-bg.js?v=106';
import { t, getLang } from './i18n.js?v=106';

const host = document.getElementById('mock-view');
const stage = document.getElementById('mock-stage');
const $ = id => document.getElementById(id);
const rid = () => Math.random().toString(36).slice(2, 9);
const DW = 34;                       // 1日の幅(px)
const MAX_CHARTS = 30, MAX_TASKS = 60, MAX_DAYS = 400;
const PAL = ['#6ee7a0', '#5ac8ff', '#ffd166', '#ff7ab8', '#b794ff', '#ff9a5c'];
const LOCALES = { ja: 'ja-JP', en: 'en-GB', zh: 'zh-CN' };

// ---- 日付(YYYY-MM-DD ↔ 日数) ----
const DAY = 864e5;
const d2n = s => { const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(s || ''); return m ? Date.UTC(+m[1], +m[2] - 1, +m[3]) / DAY : NaN; };
const n2d = n => new Date(n * DAY);                       // UTC の 0 時
const n2s = n => n2d(n).toISOString().slice(0, 10);
const todayN = () => { const d = new Date(); return Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()) / DAY; };
const fmt = (n, o) => new Intl.DateTimeFormat(LOCALES[getLang()] || 'en-GB', { timeZone: 'UTC', ...o }).format(n2d(n));

let uid = '', data = { charts: [], cur: '' }, sel = '';   // sel: 選んでいるタスクのid(編集中)
const key = () => `mock:v1:${uid}`;
const clampPct = v => Math.max(0, Math.min(100, Math.round(Number(v)) || 0));
function load() {
  try {
    const d = JSON.parse(localStorage.getItem(key()));
    if (d && Array.isArray(d.charts)) {
      const charts = d.charts.slice(0, MAX_CHARTS).map(c => ({
        id: String(c.id || rid()), subject: String(c.subject || '').slice(0, 40) || '?', mock: Number.isFinite(d2n(c.mock)) ? c.mock : '',
        tasks: (Array.isArray(c.tasks) ? c.tasks : []).slice(0, MAX_TASKS).filter(x => Number.isFinite(d2n(x.start)) && Number.isFinite(d2n(x.end)) && d2n(x.end) >= d2n(x.start))
          .map(x => ({ id: String(x.id || rid()), name: String(x.name || '').slice(0, 40) || '?', start: x.start, end: x.end, pct: clampPct(x.pct) })),
      }));
      return { charts, cur: charts.some(c => c.id === d.cur) ? d.cur : (charts[0] ? charts[0].id : '') };
    }
  } catch { /* 無視 */ }
  return { charts: [], cur: '' };
}
const save = () => { try { localStorage.setItem(key(), JSON.stringify({ v: 1, ...data })); } catch { /* 無視 */ } };
const chart = () => data.charts.find(c => c.id === data.cur) || null;

const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const sparkle = '<svg class="mk-spark" viewBox="0 0 24 24" aria-hidden="true"><path d="M12 0l2.2 8.800L24 12l-9.800 3.200L12 24l-2.200-8.800L0 12l9.800-3.200z"/></svg>';

// ---- 描画 ----
function range(c) {
  const today = todayN();
  const ns = c.tasks.flatMap(x => [d2n(x.start), d2n(x.end)]);
  if (Number.isFinite(d2n(c.mock))) ns.push(d2n(c.mock));
  let lo = Math.min(today, ...(ns.length ? ns : [today])) - 2, hi = Math.max(today + 27, ...(ns.length ? ns : [today])) + 3;
  if (hi - lo + 1 > MAX_DAYS) hi = lo + MAX_DAYS - 1;
  return [lo, hi];
}
function chartHtml(c) {
  const [lo, hi] = range(c), days = hi - lo + 1, today = todayN();
  // ヘッダー: 月の帯 + 日
  let months = '', i = 0;
  while (i < days) {
    const d = n2d(lo + i), len = Math.min(days - i, new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth() + 1, 0)).getUTCDate() - d.getUTCDate() + 1);
    months += `<span class="mk-month" style="width:${len * DW}px">${esc(fmt(lo + i, { year: 'numeric', month: 'short' }))}</span>`; i += len;
  }
  let dayCells = '';
  for (let k = 0; k < days; k++) {
    const n = lo + k, w = n2d(n).getUTCDay();
    dayCells += `<span class="mk-day${w === 0 || w === 6 ? ' we' : ''}${n === today ? ' today' : ''}" style="width:${DW}px">${n2d(n).getUTCDate()}</span>`;
  }
  const rows = c.tasks.length ? c.tasks.map((x, idx) => {
    const s = d2n(x.start), e = d2n(x.end), col = PAL[idx % PAL.length];
    return `<div class="mk-row${x.id === sel ? ' sel' : ''}" data-id="${x.id}" style="--c:${col}">
      <div class="mk-name" title="${esc(x.name)}"><span>${esc(x.name)}</span></div>
      <div class="mk-track" style="width:${days * DW}px"><div class="mk-bar" style="left:${(s - lo) * DW}px;width:${(e - s + 1) * DW - 4}px" title="${esc(x.name)}: ${esc(fmt(s, { month: 'short', day: 'numeric' }))} – ${esc(fmt(e, { month: 'short', day: 'numeric' }))}"><i style="width:${x.pct}%"></i><b>${x.pct ? x.pct + '%' : ''}</b></div></div>
    </div>`;
  }).join('') : `<div class="mk-none">${esc(t('mk.noTasks'))}</div>`;
  const mockN = d2n(c.mock);
  const marks = `${today >= lo && today <= hi ? `<div class="mk-mark today" style="left:calc(var(--nw) + ${(today - lo + .5) * DW}px)"><em>${esc(t('mk.today'))}</em></div>` : ''}${Number.isFinite(mockN) && mockN >= lo && mockN <= hi ? `<div class="mk-mark exam" style="left:calc(var(--nw) + ${(mockN - lo + .5) * DW}px)"><em>${esc(t('mk.mockDay'))}</em></div>` : ''}`;
  return `<div class="mk-scroll" id="mk-scroll" data-lo="${lo}"><div class="mk-grid" style="width:calc(var(--nw) + ${days * DW}px)">
      <div class="mk-headrow"><div class="mk-corner">${esc(c.subject)}</div><div class="mk-heads"><div class="mk-months">${months}</div><div class="mk-days">${dayCells}</div></div></div>
      <div class="mk-body">${rows}${marks}</div></div></div>`;
}
function formHtml(c) {
  const x = sel ? c.tasks.find(q => q.id === sel) : null;
  const s0 = x ? x.start : n2s(todayN()), e0 = x ? x.end : n2s(todayN() + 6);
  return `<form class="mk-form" id="mk-form" autocomplete="off">
    <h3>${esc(x ? t('mk.editTask') : t('mk.addTask'))}</h3>
    <label class="mk-f mk-f-name"><span>${esc(t('mk.taskName'))}</span><input id="mk-tname" maxlength="40" value="${esc(x ? x.name : '')}" placeholder="${esc(t('mk.taskPh'))}"></label>
    <label class="mk-f"><span>${esc(t('mk.start'))}</span><input id="mk-tstart" type="date" value="${s0}"></label>
    <label class="mk-f"><span>${esc(t('mk.end'))}</span><input id="mk-tend" type="date" value="${e0}"></label>
    <label class="mk-f mk-f-pct"><span>${esc(t('mk.progress'))}</span><input id="mk-tpct" type="number" min="0" max="100" step="5" value="${x ? x.pct : 0}"></label>
    <div class="mk-btns"><button type="submit" class="mk-pill solid">${esc(x ? t('mk.save') : t('mk.add'))}</button>${x ? `<button type="button" class="mk-pill" data-act="cancel">${esc(t('mk.cancel'))}</button><button type="button" class="mk-pill danger" data-act="deltask">${esc(t('mk.delete'))}</button>` : ''}</div>
    <p class="mk-msg" id="mk-msg" role="status" hidden></p></form>`;
}
function render(fresh) {
  const keepScroll = !fresh && $('mk-scroll') ? [$('mk-scroll').scrollLeft, $('mk-scroll').scrollTop] : null;
  const c = chart();
  const tabs = data.charts.map(x => `<button type="button" class="mk-tab${x.id === data.cur ? ' on' : ''}" data-chart="${x.id}" title="${esc(t('mk.renameHint'))}"><span>${esc(x.subject)}</span></button>`).join('');
  stage.innerHTML = `<div class="mk-page">
    <header class="mk-head">${sparkle}<div><h2>Mock <em>Gantt</em></h2><p>${esc(t('mk.sub'))}</p></div></header>
    <form class="mk-new" id="mk-new" autocomplete="off"><input id="mk-newsubject" maxlength="40" placeholder="${esc(t('mk.newPh'))}" aria-label="${esc(t('mk.newPh'))}"><button type="submit" class="mk-pill solid">${esc(t('mk.create'))}</button></form>
    ${data.charts.length ? `<div class="mk-tabs" id="mk-tabs" role="tablist">${tabs}</div>` : ''}
    ${c ? `<div class="mk-bar-top"><label class="mk-mockdate"><span>${esc(t('mk.mockDate'))}</span><input id="mk-mockdate" type="date" value="${esc(c.mock)}"></label><button type="button" class="mk-pill danger sm" data-act="delchart">${esc(t('mk.delChart'))}</button></div>${chartHtml(c)}${formHtml(c)}`
      : `<div class="mk-empty"><p>${esc(t('mk.empty'))}</p></div>`}
  </div>`;
  const sc = $('mk-scroll');
  if (sc) {
    if (keepScroll) { sc.scrollLeft = keepScroll[0]; sc.scrollTop = keepScroll[1]; }
    else { const today = todayN(), lo = +sc.dataset.lo; sc.scrollLeft = Math.max(0, (today - lo - 3) * DW); }
  }
}
function msg(s) { const m = $('mk-msg'); if (m) { m.textContent = s; m.hidden = !s; } }

// ---- 操作 ----
function wire() {
  stage.addEventListener('submit', e => {
    e.preventDefault();
    if (e.target.id === 'mk-new') {
      const name = $('mk-newsubject').value.trim().slice(0, 40);
      if (!name || data.charts.length >= MAX_CHARTS) return;
      const c = { id: rid(), subject: name, mock: '', tasks: [] }; data.charts.push(c); data.cur = c.id; sel = ''; save(); render();
    } else if (e.target.id === 'mk-form') {
      const c = chart(); if (!c) return;
      const name = $('mk-tname').value.trim().slice(0, 40), s = $('mk-tstart').value, en = $('mk-tend').value, pct = clampPct($('mk-tpct').value);
      if (!name) return msg(t('mk.needName'));
      if (!Number.isFinite(d2n(s)) || !Number.isFinite(d2n(en))) return msg(t('mk.needDates'));
      if (d2n(en) < d2n(s)) return msg(t('mk.badRange'));
      if (d2n(en) - d2n(s) > MAX_DAYS - 10) return msg(t('mk.tooLong'));
      const x = sel ? c.tasks.find(q => q.id === sel) : null;
      if (x) Object.assign(x, { name, start: s, end: en, pct });
      else { if (c.tasks.length >= MAX_TASKS) return msg(t('mk.tooMany')); c.tasks.push({ id: rid(), name, start: s, end: en, pct }); }
      sel = ''; save(); render();
    }
  });
  stage.addEventListener('click', e => {
    const tab = e.target.closest('[data-chart]');
    if (tab) {
      if (e.detail >= 2) { renameChart(tab.dataset.chart); return; }          // ダブルクリック: 科目名を変える
      if (tab.dataset.chart !== data.cur) { data.cur = tab.dataset.chart; sel = ''; save(); render(); }
      return;
    }
    const act = e.target.closest('[data-act]');
    if (act) {
      const c = chart(); if (!c) return;
      if (act.dataset.act === 'cancel') { sel = ''; render(); }
      else if (act.dataset.act === 'deltask') { if (confirm(t('mk.confirmDelTask'))) { c.tasks = c.tasks.filter(x => x.id !== sel); sel = ''; save(); render(); } }
      else if (act.dataset.act === 'delchart') { if (confirm(t('mk.confirmDelChart'))) { data.charts = data.charts.filter(x => x !== c); data.cur = data.charts[0] ? data.charts[0].id : ''; sel = ''; save(); render(); } }
      return;
    }
    const row = e.target.closest('.mk-row');
    if (row) { sel = sel === row.dataset.id ? '' : row.dataset.id; render(); $('mk-tname')?.focus({ preventScroll: true }); }
  });
  function renameChart(id) {
    const c = data.charts.find(x => x.id === id); if (!c) return;
    const name = (prompt(t('mk.renamePrompt'), c.subject) || '').trim().slice(0, 40);
    if (name) { c.subject = name; save(); render(); }
  }
  stage.addEventListener('change', e => {
    if (e.target.id !== 'mk-mockdate') return;
    const c = chart(); if (!c) return;
    c.mock = Number.isFinite(d2n(e.target.value)) ? e.target.value : ''; save(); render();
  });
}

let punch = -10;
const view = createGpuView(WGSL, now => {
  const x = Math.min(1, Math.max(0, (now - punch) / 1.1));
  return [0, 0, now - punch, x < 1 ? Math.sin(Math.PI * x) * 0.9 : 0];
});
export const mock = { start: () => { punch = performance.now() / 1000; return view.start(host); }, stop: () => view.stop() };

export function mountMock(user) {
  uid = user.uid; data = load(); render(); wire();
  window.addEventListener('langchange', () => render());
  window.addEventListener('viewchange', e => { if (e.detail === 'mock') render(true); });   // 開くたびに、今日の線を最新にして、今日のあたりへスクロール
}
