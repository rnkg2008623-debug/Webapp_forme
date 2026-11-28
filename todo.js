// To-Do(ネオンのときだけ): やること(内容・日付・開始と終了の時刻)を入れて、選んだ日からの7日間を、時間割のように表示する。
// 横が時間(1時間ずつ)、縦が日。同じ時間に重なるものは、段を分けて並べる。下には、7日間のやることリスト(チェックで完了)。
// 背景はWebGPU(白黒のゴシックの大聖堂)。データは、このブラウザに、アカウントごとに保存する。
import { createGpuView } from './gpu-view.js?v=119';
import { WGSL } from './physics-bg.js?v=119';
import { t, getLang } from './i18n.js?v=119';

const host = document.getElementById('todo-view');
const stage = document.getElementById('todo-stage');
const $ = id => document.getElementById(id);
const rid = () => Math.random().toString(36).slice(2, 9);
const HW = 72, LANE = 46;                 // 1時間の幅(px) / 1段の高さ(px)
const MAX_TASKS = 600;
const PAL = ['#6ee7a0', '#5ac8ff', '#ffd166', '#ff7ab8', '#b794ff', '#ff9a5c', '#7defff', '#e55cff'];
const LOCALES = { ja: 'ja-JP', en: 'en-GB', zh: 'zh-CN' };

// ---- 日付・時刻 ----
const DAY = 864e5;
const d2n = s => { const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(s || ''); return m ? Date.UTC(+m[1], +m[2] - 1, +m[3]) / DAY : NaN; };
const n2s = n => new Date(n * DAY).toISOString().slice(0, 10);
const todayN = () => { const d = new Date(); return Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()) / DAY; };
const t2m = s => { const m = /^(\d{2}):(\d{2})$/.exec(s || ''); return m ? +m[1] * 60 + +m[2] : NaN; };
const m2t = m => `${String(Math.floor(m / 60)).padStart(2, '0')}:${String(m % 60).padStart(2, '0')}`;
const fmtD = (n, o) => new Intl.DateTimeFormat(LOCALES[getLang()] || 'en-GB', { timeZone: 'UTC', ...o }).format(new Date(n * DAY));
const nowMin = () => { const d = new Date(); return d.getHours() * 60 + d.getMinutes(); };

let uid = '', tasks = [], from = '', editId = '';
const key = () => `todo:v1:${uid}`;
function load() {
  try {
    const d = JSON.parse(localStorage.getItem(key()));
    if (d && Array.isArray(d.tasks)) {
      return d.tasks.slice(0, MAX_TASKS).filter(x => Number.isFinite(d2n(x.date)) && t2m(x.start) < t2m(x.end))
        .map(x => ({ id: String(x.id || rid()), title: String(x.title || '').slice(0, 60) || '?', date: x.date, start: x.start, end: x.end, done: !!x.done }));
    }
  } catch { /* 無視 */ }
  return [];
}
const save = () => { try { localStorage.setItem(key(), JSON.stringify({ v: 1, tasks })); } catch { /* 無視 */ } };
const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const colorOf = title => { let h = 0; for (const ch of title) h = (h * 31 + ch.charCodeAt(0)) >>> 0; return PAL[h % PAL.length]; };
const sparkle = '<svg class="td-spark" viewBox="0 0 24 24" aria-hidden="true"><path d="M12 0l2.2 8.800L24 12l-9.800 3.200L12 24l-2.200-8.800L0 12l9.800-3.200z"/></svg>';

// ---- 7日間 ----
const days = () => { const a = d2n(from); return Array.from({ length: 7 }, (_, i) => a + i); };
const inRange = x => { const n = d2n(x.date), a = d2n(from); return n >= a && n < a + 7; };
function hourRange(list) {
  let lo = 6, hi = 24;
  for (const x of list) { lo = Math.min(lo, Math.floor(t2m(x.start) / 60)); hi = Math.max(hi, Math.ceil(t2m(x.end) / 60)); }
  return [lo, Math.min(24, hi)];
}
function lanesFor(list) {      // 時間が重なるものは、別の段に置く
  const sorted = [...list].sort((a, b) => t2m(a.start) - t2m(b.start) || t2m(a.end) - t2m(b.end)), ends = [], out = new Map();
  for (const x of sorted) {
    let k = ends.findIndex(e => e <= t2m(x.start)); if (k < 0) { k = ends.length; ends.push(0); }
    ends[k] = t2m(x.end); out.set(x.id, k);
  }
  return [out, Math.max(1, ends.length)];
}

function calendarHtml() {
  const list = tasks.filter(inRange), [h0, h1] = hourRange(list), cols = h1 - h0, today = todayN();
  const heads = Array.from({ length: cols }, (_, i) => `<span class="td-h" style="width:${HW}px">${String(h0 + i).padStart(2, '0')}:00</span>`).join('');
  const rows = days().map(n => {
    const dayTasks = list.filter(x => d2n(x.date) === n), [lane, count] = lanesFor(dayTasks), wd = new Date(n * DAY).getUTCDay();
    const blocks = dayTasks.map(x => {
      const s = t2m(x.start), e = t2m(x.end), L = lane.get(x.id);
      return `<button type="button" class="td-block${x.done ? ' done' : ''}${x.id === editId ? ' sel' : ''}" data-edit="${x.id}" style="left:${(s / 60 - h0) * HW}px;width:${Math.max(18, (e - s) / 60 * HW - 3)}px;top:${4 + L * LANE}px;height:${LANE - 6}px;--c:${colorOf(x.title)}" title="${esc(x.title)} ${x.start}–${x.end}"><b>${esc(x.title)}</b><small>${x.start}–${x.end}</small></button>`;
    }).join('');
    const nowLine = n === today && nowMin() / 60 >= h0 && nowMin() / 60 <= h1 ? `<i class="td-now" style="left:${(nowMin() / 60 - h0) * HW}px"></i>` : '';
    return `<div class="td-day${n === today ? ' today' : ''}${wd === 0 || wd === 6 ? ' we' : ''}"><div class="td-dl"><b>${esc(fmtD(n, { weekday: 'short' }))}</b><span>${esc(fmtD(n, { month: 'numeric', day: 'numeric' }))}</span></div><div class="td-track" style="width:${cols * HW}px;height:${8 + count * LANE}px">${blocks}${nowLine}</div></div>`;
  }).join('');
  return `<div class="td-scroll"><div class="td-grid" data-h0="${h0}" style="width:calc(var(--dl) + ${cols * HW}px);--hw:${HW}px"><div class="td-headrow"><div class="td-corner">${esc(t('td.dayTime'))}</div><div class="td-hours">${heads}</div></div>${rows}</div></div>`;
}
function listHtml() {
  const groups = days().map(n => {
    const items = tasks.filter(x => d2n(x.date) === n).sort((a, b) => t2m(a.start) - t2m(b.start));
    const rows = items.length ? items.map(x => `<li class="${x.done ? 'done' : ''}" style="--c:${colorOf(x.title)}"><button type="button" class="td-check" role="checkbox" aria-checked="${x.done}" data-done="${x.id}" aria-label="${esc(t('td.done'))}"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12.500l4.500 4.500L19 7"/></svg></button><time>${x.start}–${x.end}</time><span class="td-ttl">${esc(x.title)}</span><button type="button" class="td-ic" data-edit="${x.id}" aria-label="${esc(t('td.edit'))}" title="${esc(t('td.edit'))}"><svg viewBox="0 0 24 24"><path d="M4 20l1-4L16.500 4.500a2 2 0 0 1 3 3L8 19z"/></svg></button><button type="button" class="td-ic" data-del="${x.id}" aria-label="${esc(t('td.delete'))}" title="${esc(t('td.delete'))}"><svg viewBox="0 0 24 24"><path d="M6 6l12 12M18 6L6 18"/></svg></button></li>`).join('') : `<li class="none">${esc(t('td.none'))}</li>`;
    return `<section class="td-group${n === todayN() ? ' today' : ''}"><h4>${esc(fmtD(n, { weekday: 'long', month: 'short', day: 'numeric' }))}</h4><ul>${rows}</ul></section>`;
  }).join('');
  return groups;
}
function formHtml() {
  const x = editId ? tasks.find(q => q.id === editId) : null;
  return `<form class="td-form" id="td-form" autocomplete="off">
    <label class="td-f td-f-title"><span>${esc(t('td.what'))}</span><input id="td-title" maxlength="60" value="${esc(x ? x.title : '')}" placeholder="${esc(t('td.whatPh'))}"></label>
    <label class="td-f"><span>${esc(t('td.date'))}</span><input id="td-date" type="date" value="${x ? x.date : (inRange({ date: from }) ? (d2n(from) <= todayN() && todayN() < d2n(from) + 7 ? n2s(todayN()) : from) : from)}"></label>
    <label class="td-f"><span>${esc(t('td.start'))}</span><input id="td-start" type="time" value="${x ? x.start : '09:00'}"></label>
    <label class="td-f"><span>${esc(t('td.end'))}</span><input id="td-end" type="time" value="${x ? x.end : '10:00'}"></label>
    <div class="td-btns"><button type="submit" class="td-pill solid">${esc(x ? t('td.save') : t('td.add'))}</button>${x ? `<button type="button" class="td-pill" data-cancel>${esc(t('td.cancel'))}</button><button type="button" class="td-pill danger" data-del="${x.id}">${esc(t('td.delete'))}</button>` : ''}</div>
    <p class="td-msg" id="td-msg" role="status" hidden></p></form>`;
}
function render(keepScroll = true, keepForm = true) {
  const sc = stage.querySelector('.td-scroll'), pos = keepScroll && sc ? [sc.scrollLeft, sc.scrollTop] : null;
  // 入力途中の内容は、日付の移動などで描き直しても、消さない(編集中のときは、編集の内容にする)
  const typed = keepForm && !editId && $('td-title') ? { title: $('td-title').value, date: $('td-date').value, start: $('td-start').value, end: $('td-end').value } : null;
  const a = d2n(from), count = tasks.filter(inRange).length, left = tasks.filter(x => inRange(x) && !x.done).length;
  stage.innerHTML = `<div class="td-page">
    <header class="td-head">${sparkle}<div><h2>To-Do <em>Week</em></h2><p>${esc(t('td.sub'))}</p></div></header>
    <h3 class="td-h3">${esc(editId ? t('td.editTask') : t('td.addTask'))}</h3>${formHtml()}
    <div class="td-range"><label class="td-f"><span>${esc(t('td.from'))}</span><input id="td-from" type="date" value="${from}"></label>
      <button type="button" class="td-pill sm" data-shift="-7" aria-label="${esc(t('td.prevWeek'))}">‹ 7</button><button type="button" class="td-pill sm" data-today>${esc(t('td.today'))}</button><button type="button" class="td-pill sm" data-shift="7" aria-label="${esc(t('td.nextWeek'))}">7 ›</button>
      <span class="td-sum">${esc(fmtD(a, { month: 'short', day: 'numeric' }))} – ${esc(fmtD(a + 6, { month: 'short', day: 'numeric' }))} · ${esc(t('td.count', { n: count, l: left }))}</span></div>
    ${calendarHtml()}
    <h3 class="td-h3">${esc(t('td.listTitle'))}</h3><div class="td-list">${listHtml()}</div></div>`;
  if (typed) { $('td-title').value = typed.title; if (typed.date) $('td-date').value = typed.date; if (typed.start) $('td-start').value = typed.start; if (typed.end) $('td-end').value = typed.end; }
  const nsc = stage.querySelector('.td-scroll');
  if (nsc) {
    nsc.style.setProperty('--dl', getComputedStyle(nsc.querySelector('.td-corner')).width);
    if (pos) { nsc.scrollLeft = pos[0]; nsc.scrollTop = pos[1]; }
    else { const [h0] = hourRange(tasks.filter(inRange)); nsc.scrollLeft = Math.max(0, (Math.max(h0, new Date().getHours() - 2) - h0) * HW); }
  }
}
const msg = s => { const m = $('td-msg'); if (m) { m.textContent = s; m.hidden = !s; } };

function wire() {
  stage.addEventListener('submit', e => {
    if (e.target.id !== 'td-form') return;
    e.preventDefault();
    const title = $('td-title').value.trim().slice(0, 60), date = $('td-date').value, s = $('td-start').value, en = $('td-end').value;
    if (!title) return msg(t('td.needTitle'));
    if (!Number.isFinite(d2n(date))) return msg(t('td.needDate'));
    if (!Number.isFinite(t2m(s)) || !Number.isFinite(t2m(en))) return msg(t('td.needTime'));
    if (t2m(en) <= t2m(s)) return msg(t('td.badTime'));
    const x = editId ? tasks.find(q => q.id === editId) : null;
    if (x) Object.assign(x, { title, date, start: s, end: en });
    else { if (tasks.length >= MAX_TASKS) return msg(t('td.tooMany')); tasks.push({ id: rid(), title, date, start: s, end: en, done: false }); }
    editId = ''; save();
    // 入れた日が、いまの7日間の外なら、その日を先頭にして見せる
    if (!inRange({ date })) from = date;
    render(false, false);
  });
  stage.addEventListener('click', e => {
    const done = e.target.closest('[data-done]');
    if (done) { const x = tasks.find(q => q.id === done.dataset.done); if (x) { x.done = !x.done; save(); render(); } return; }
    const del = e.target.closest('[data-del]');
    if (del) { if (confirm(t('td.confirmDel'))) { tasks = tasks.filter(q => q.id !== del.dataset.del); if (editId === del.dataset.del) editId = ''; save(); render(); } return; }
    const ed = e.target.closest('[data-edit]');
    if (ed) { editId = ed.dataset.edit; render(); $('td-title')?.focus({ preventScroll: true }); stage.querySelector('.td-form')?.scrollIntoView({ block: 'nearest' }); return; }
    if (e.target.closest('[data-cancel]')) { editId = ''; render(); return; }
    const sh = e.target.closest('[data-shift]'); if (sh) { from = n2s(d2n(from) + Number(sh.dataset.shift)); render(false); return; }
    if (e.target.closest('[data-today]')) { from = n2s(todayN()); render(false); }
  });
  stage.addEventListener('change', e => { if (e.target.id === 'td-from' && Number.isFinite(d2n(e.target.value))) { from = e.target.value; render(false); } });
  window.addEventListener('langchange', () => render());
  window.addEventListener('viewchange', e => { if (e.detail === 'todo') render(false); });   // 開くたびに、今日の線を最新にする
  setInterval(() => {   // 今の時刻の線だけ、動かす(入力中のフォームは、描き直さない)
    const i = stage.querySelector('.td-now'), g = stage.querySelector('.td-grid');
    if (i && g) i.style.left = `${(nowMin() / 60 - Number(g.dataset.h0)) * HW}px`;
  }, 60000);
}

let punch = -10;
const view = createGpuView(WGSL, now => {
  const x = Math.min(1, Math.max(0, (now - punch) / 1.1));
  return [0, 0, now - punch, x < 1 ? Math.sin(Math.PI * x) * 0.9 : 0];
});
export const todo = { start: () => { punch = performance.now() / 1000; return view.start(host); }, stop: () => view.stop() };

export function mountTodo(user) {
  uid = user.uid; tasks = load(); from = n2s(todayN()); render(false); wire();
}
