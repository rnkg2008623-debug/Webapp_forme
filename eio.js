// English IO(ネオンのときだけ): Intro など、好きな欄を作って、その回数を書いていく。数字を入れて Enter を押すと、横のメーターがその分上がる。
// 背景はWebGPU(白黒のゴシックの大聖堂)。データは、このブラウザに、アカウントごとに保存する。
import { createGpuView } from './gpu-view.js?v=113';
import { WGSL } from './physics-bg.js?v=113';
import { t } from './i18n.js?v=113';

const host = document.getElementById('eio-view');
const stage = document.getElementById('eio-stage');
const rid = () => Math.random().toString(36).slice(2, 9);
const clampTotal = v => Math.max(0, Math.min(99999, Math.floor(Number(v)) || 0));
const clampGoal = v => Math.max(1, Math.min(999, Math.floor(Number(v)) || 10));
const MAX_SUBS = 40, MAX_ITEMS = 40, MAX_TOTAL = 99999, DEFAULT_GOAL = 10;

let uid = '', items = [];
const key = () => `eio:v1:${uid}`;
function load() {
  try {
    const d = JSON.parse(localStorage.getItem(key()));
    if (d && Array.isArray(d.items)) return d.items.slice(0, MAX_ITEMS).map(i => ({
      id: String(i.id || rid()), name: String(i.name || '').slice(0, 30) || '?',
      total: clampTotal(i.total), goal: clampGoal(i.goal), open: !!i.open,
      subs: (Array.isArray(i.subs) ? i.subs : []).slice(0, MAX_SUBS).map(s => ({ id: String(s.id || rid()), name: String(s.name || '').slice(0, 30) || '?', total: clampTotal(s.total), goal: clampGoal(s.goal) })),
    }));
  } catch { /* 無視 */ }
  return [];
}
const save = () => { try { localStorage.setItem(key(), JSON.stringify({ v: 1, items })); } catch { /* 無視 */ } };

const sparkle = '<svg class="eio-spark" viewBox="0 0 24 24" aria-hidden="true"><path d="M12 0l2.2 8.800L24 12l-9.800 3.200L12 24l-2.200-8.800L0 12l9.800-3.200z"/></svg>';
const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
// 3回ごとに、その行の色が変わっていく(0〜2回: 白 → 3〜5回: 緑 → 6〜8回: 青 …、一巡したら白に戻る)
const PAL = ['#ffffff', '#6ee7a0', '#5ac8ff', '#ffd166', '#ff7ab8', '#b794ff', '#ff9a5c'];
const colorOf = n => PAL[Math.floor(n / 3) % PAL.length];
const pct = i => Math.min(100, Math.round(i.total / i.goal * 100));
const sum = () => items.reduce((s, i) => s + i.total + (i.subs || []).reduce((q, x) => q + x.total, 0), 0);

// 大きな行(sid なし)も、ミニ行(sid あり)も、同じ作り: 名前 / 回数の入力 / メーター / 回数と目標
function rowHtml(i, parent) {
  const sid = parent ? ` data-sid="${i.id}"` : '', pid = parent ? parent.id : i.id;
  const nm = esc(i.name);
  const name = parent
    ? `<span class="eio-name" data-act="rename" title="${esc(t('eio.renameHint'))}">${nm}</span>`
    : `<span class="eio-namebox"><button type="button" class="eio-tg" data-act="toggle" aria-expanded="${!!i.open}" aria-label="${esc(t('eio.mini'))}: ${nm}"><svg viewBox="0 0 24 24"><path d="M9 6l6 6-6 6"/></svg></button><span class="eio-name" data-act="rename" title="${esc(t('eio.renameHint'))}">${nm}</span>${i.subs.length ? `<small class="eio-badge">${i.subs.length}</small>` : ''}</span>`;
  return `<div class="eio-row ${parent ? 'eio-mini' : ''} ${i.total >= i.goal ? 'done' : ''}" data-id="${pid}"${sid} style="--c:${colorOf(i.total)}">
    ${name}
    <div class="eio-addwrap"><label class="eio-add"><input class="eio-num" type="number" inputmode="numeric" min="-999" max="999" step="1" placeholder="${esc(t('eio.times'))}" aria-label="${nm}: ${esc(t('eio.times'))}"><kbd>Enter</kbd></label><button type="button" class="eio-minus" data-act="minus" ${i.total ? '' : 'disabled'} aria-label="${esc(t('eio.minus'))}" title="${esc(t('eio.minus'))}">−</button></div>
    <div class="eio-meter" role="meter" aria-valuemin="0" aria-valuemax="${i.goal}" aria-valuenow="${Math.min(i.total, i.goal)}" aria-label="${nm}"><i style="width:${pct(i)}%"></i><b class="eio-pop" aria-hidden="true"></b></div>
    <button type="button" class="eio-count" data-act="goal" title="${esc(t('eio.editGoal'))}"><strong>${i.total}</strong> / ${i.goal}</button>
  </div>`;
}
function itemHtml(i) {
  const subs = i.open ? `<div class="eio-subs">
      ${i.subs.length ? `<ul>${i.subs.map(s => `<li>${rowHtml(s, i)}</li>`).join('')}</ul>` : ''}
      <form class="eio-newsub" data-id="${i.id}" autocomplete="off"><input class="eio-subname" maxlength="30" placeholder="${esc(t('eio.newSubPh'))}" aria-label="${esc(t('eio.newSubPh'))}"><button type="submit" class="eio-pill">${esc(t('eio.addMini'))}</button></form>
    </div>` : '';
  return `<li class="eio-item ${i.open ? 'open' : ''}" data-item="${i.id}">${rowHtml(i)}${subs}</li>`;
}
function render() {
  stage.innerHTML = `<div class="eio-page">
    <header class="eio-head">${sparkle}<div><h2>English <em>IO</em></h2><p>${esc(t('eio.sub'))}</p></div>
      <div class="eio-total"><small>${esc(t('eio.total'))}</small><strong>${sum()}</strong></div></header>
    <form class="eio-new" id="eio-new" autocomplete="off"><input id="eio-newname" maxlength="30" placeholder="${esc(t('eio.newPh'))}" aria-label="${esc(t('eio.newPh'))}"><button type="submit" class="eio-pill">${esc(t('eio.add'))}</button></form>
    ${items.length ? `<ul class="eio-list" id="eio-list">${items.map(itemHtml).join('')}</ul>` : `<div class="eio-empty"><p>${esc(t('eio.empty'))}</p><div class="eio-chips">${['Intro', 'Body', 'Conclusion'].map(n => `<button type="button" class="eio-pill" data-chip="${n}">${n}</button>`).join('')}</div></div>`}
    <p class="eio-hint">${esc(t('eio.hint'))}</p></div>`;
}

const find = row => { const it = items.find(x => x.id === row.dataset.id); return it ? (row.dataset.sid ? it.subs.find(s => s.id === row.dataset.sid) : it) : null; };
function bump(row, n) {   // メーターの上に「+3」を一瞬出す
  const pop = row.querySelector('.eio-pop'); if (!pop) return;
  pop.textContent = (n > 0 ? '+' : '') + n; pop.classList.remove('go'); void pop.offsetWidth; pop.classList.add('go');
}
function addTo(row, n) {
  const it = find(row); if (!it || !n) return;
  const before = it.total;
  it.total = Math.max(0, Math.min(MAX_TOTAL, it.total + n)); save();
  row.querySelector('.eio-meter i').style.width = pct(it) + '%';
  row.querySelector('.eio-meter').setAttribute('aria-valuenow', String(Math.min(it.total, it.goal)));
  row.querySelector('.eio-count strong').textContent = it.total;
  row.classList.toggle('done', it.total >= it.goal);
  row.querySelector('.eio-minus').disabled = it.total === 0;
  row.style.setProperty('--c', colorOf(it.total));
  bump(row, it.total - before);
  stage.querySelector('.eio-total strong').textContent = sum();
}
function create(name) {
  name = String(name || '').trim().slice(0, 30);
  if (!name || items.length >= MAX_ITEMS) return;
  items.push({ id: rid(), name, total: 0, goal: DEFAULT_GOAL, open: false, subs: [] }); save(); render();
  stage.querySelector(`.eio-item:last-child .eio-num`)?.focus();
}
function createSub(parentId, name) {
  const it = items.find(x => x.id === parentId); name = String(name || '').trim().slice(0, 30);
  if (!it || !name || it.subs.length >= MAX_SUBS) return;
  const s = { id: rid(), name, total: 0, goal: DEFAULT_GOAL }; it.subs.push(s); it.open = true; save(); render();
  stage.querySelector(`.eio-row[data-sid="${s.id}"] .eio-num`)?.focus();
}

function wire() {
  stage.addEventListener('submit', e => {
    e.preventDefault();
    if (e.target.id === 'eio-new') create($('eio-newname').value);
    else if (e.target.classList.contains('eio-newsub')) createSub(e.target.dataset.id, e.target.querySelector('.eio-subname').value);
  });
  stage.addEventListener('keydown', e => {
    if (e.key !== 'Enter' || !e.target.matches('.eio-num')) return;
    e.preventDefault();
    const row = e.target.closest('.eio-row'), n = Math.trunc(Number(e.target.value));
    if (!e.target.value.trim() || !Number.isFinite(n) || n === 0) { e.target.classList.add('bad'); setTimeout(() => e.target.classList.remove('bad'), 500); return; }
    addTo(row, Math.max(-999, Math.min(999, n)));
    e.target.value = '';
  });
  function rename(row) {
    const it = find(row); if (!it) return;
    const name = (prompt(t('eio.renamePrompt'), it.name) || '').trim().slice(0, 30);
    if (name) { it.name = name; save(); render(); }
  }
  stage.addEventListener('dblclick', e => { const r = e.target.closest('[data-act="rename"]'); if (r) rename(r.closest('.eio-row')); });
  stage.addEventListener('click', e => {
    const chip = e.target.closest('[data-chip]'); if (chip) { create(chip.dataset.chip); return; }
    const b = e.target.closest('[data-act]'); if (!b) return;
    const row = b.closest('.eio-row'), it = find(row); if (!it) return;
    if (b.dataset.act === 'goal') {
      const v = Math.trunc(Number(prompt(t('eio.goalPrompt'), String(it.goal))));
      if (Number.isFinite(v) && v >= 1 && v <= 999) { it.goal = v; save(); render(); }
    } else if (b.dataset.act === 'minus') {   // 間違えて足したとき: 数字を入れて押すと、その分だけ減らす。空なら1回減らす
      const inp = row.querySelector('.eio-num'), n = Math.abs(Math.trunc(Number(inp.value))) || 1;
      addTo(row, -Math.min(n, 999)); inp.value = '';
    } else if (b.dataset.act === 'toggle') { it.open = !it.open; save(); render(); if (it.open) stage.querySelector(`.eio-item[data-item="${it.id}"] .eio-subname`)?.focus(); }
  });
}
const $ = id => document.getElementById(id);

let punch = -10;
const view = createGpuView(WGSL, now => {
  const x = Math.min(1, Math.max(0, (now - punch) / 1.1));
  return [0, 0, now - punch, x < 1 ? Math.sin(Math.PI * x) * 0.9 : 0];
});
export const eio = { start: () => { punch = performance.now() / 1000; return view.start(host); }, stop: () => view.stop() };

export function mountEio(user) {
  uid = user.uid; items = load(); render(); wire();
  window.addEventListener('langchange', render);
}
