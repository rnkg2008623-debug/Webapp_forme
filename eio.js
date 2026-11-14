// English IO(ネオンのときだけ): Intro など、好きな欄を作って、その回数を書いていく。数字を入れて Enter を押すと、横のメーターがその分上がる。
// 背景はWebGPU(白黒のゴシックの大聖堂)。データは、このブラウザに、アカウントごとに保存する。
import { createGpuView } from './gpu-view.js?v=90';
import { WGSL } from './physics-bg.js?v=90';
import { t } from './i18n.js?v=90';

const host = document.getElementById('eio-view');
const stage = document.getElementById('eio-stage');
const rid = () => Math.random().toString(36).slice(2, 9);
const MAX_ITEMS = 40, MAX_TOTAL = 99999, DEFAULT_GOAL = 10;

let uid = '', items = [];
const key = () => `eio:v1:${uid}`;
function load() {
  try {
    const d = JSON.parse(localStorage.getItem(key()));
    if (d && Array.isArray(d.items)) return d.items.slice(0, MAX_ITEMS).map(i => ({
      id: String(i.id || rid()), name: String(i.name || '').slice(0, 30) || '?',
      total: Math.max(0, Math.min(MAX_TOTAL, Math.floor(Number(i.total)) || 0)), goal: Math.max(1, Math.min(999, Math.floor(Number(i.goal)) || DEFAULT_GOAL)),
    }));
  } catch { /* 無視 */ }
  return [];
}
const save = () => { try { localStorage.setItem(key(), JSON.stringify({ v: 1, items })); } catch { /* 無視 */ } };

const sparkle = '<svg class="eio-spark" viewBox="0 0 24 24" aria-hidden="true"><path d="M12 0l2.2 8.800L24 12l-9.800 3.200L12 24l-2.200-8.800L0 12l9.800-3.200z"/></svg>';
const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const pct = i => Math.min(100, Math.round(i.total / i.goal * 100));

function rowHtml(i) {
  return `<li class="eio-row ${i.total >= i.goal ? 'done' : ''}" data-id="${i.id}">
    <span class="eio-name" title="${esc(i.name)}">${esc(i.name)}</span>
    <label class="eio-add"><input class="eio-num" type="number" inputmode="numeric" min="-999" max="999" step="1" placeholder="${esc(t('eio.times'))}" aria-label="${esc(i.name)}: ${esc(t('eio.times'))}"><kbd>Enter</kbd></label>
    <div class="eio-meter" role="meter" aria-valuemin="0" aria-valuemax="${i.goal}" aria-valuenow="${Math.min(i.total, i.goal)}" aria-label="${esc(i.name)}"><i style="width:${pct(i)}%"></i><b class="eio-pop" aria-hidden="true"></b></div>
    <button type="button" class="eio-count" data-act="goal" title="${esc(t('eio.editGoal'))}"><strong>${i.total}</strong> / ${i.goal}</button>
    <button type="button" class="eio-ic" data-act="reset" aria-label="${esc(t('eio.reset'))}" title="${esc(t('eio.reset'))}"><svg viewBox="0 0 24 24"><path d="M4 12a8 8 0 1 0 2.500-5.800M4 4v4h4"/></svg></button>
    <button type="button" class="eio-ic" data-act="del" aria-label="${esc(t('eio.delete'))}" title="${esc(t('eio.delete'))}"><svg viewBox="0 0 24 24"><path d="M6 6l12 12M18 6L6 18"/></svg></button>
  </li>`;
}
function render() {
  stage.innerHTML = `<div class="eio-page">
    <header class="eio-head">${sparkle}<div><h2>English <em>IO</em></h2><p>${esc(t('eio.sub'))}</p></div>
      <div class="eio-total"><small>${esc(t('eio.total'))}</small><strong>${items.reduce((s, i) => s + i.total, 0)}</strong></div></header>
    <form class="eio-new" id="eio-new" autocomplete="off"><input id="eio-newname" maxlength="30" placeholder="${esc(t('eio.newPh'))}" aria-label="${esc(t('eio.newPh'))}"><button type="submit" class="eio-pill">${esc(t('eio.add'))}</button></form>
    ${items.length ? `<ul class="eio-list" id="eio-list">${items.map(rowHtml).join('')}</ul>` : `<div class="eio-empty"><p>${esc(t('eio.empty'))}</p><div class="eio-chips">${['Intro', 'Body', 'Conclusion'].map(n => `<button type="button" class="eio-pill" data-chip="${n}">${n}</button>`).join('')}</div></div>`}
    <p class="eio-hint">${esc(t('eio.hint'))}</p></div>`;
}

function bump(row, n, item) {   // メーターの上に「+3」を一瞬出す
  const pop = row.querySelector('.eio-pop'); if (!pop) return;
  pop.textContent = (n > 0 ? '+' : '') + n; pop.classList.remove('go'); void pop.offsetWidth; pop.classList.add('go');
}
function addTo(row, id, n) {
  const it = items.find(x => x.id === id); if (!it || !n) return;
  const before = it.total;
  it.total = Math.max(0, Math.min(MAX_TOTAL, it.total + n)); save();
  row.querySelector('.eio-meter i').style.width = pct(it) + '%';
  row.querySelector('.eio-meter').setAttribute('aria-valuenow', String(Math.min(it.total, it.goal)));
  row.querySelector('.eio-count strong').textContent = it.total;
  row.classList.toggle('done', it.total >= it.goal);
  bump(row, it.total - before, it);
  stage.querySelector('.eio-total strong').textContent = items.reduce((s, i) => s + i.total, 0);
}
function create(name) {
  name = String(name || '').trim().slice(0, 30);
  if (!name || items.length >= MAX_ITEMS) return;
  items.push({ id: rid(), name, total: 0, goal: DEFAULT_GOAL }); save(); render();
  stage.querySelector(`.eio-row:last-child .eio-num`)?.focus();
}

function wire() {
  stage.addEventListener('submit', e => {
    if (e.target.id !== 'eio-new') return;
    e.preventDefault(); const inp = $('eio-newname'); const v = inp.value; create(v);
  });
  stage.addEventListener('keydown', e => {
    if (e.key !== 'Enter' || !e.target.matches('.eio-num')) return;
    e.preventDefault();
    const row = e.target.closest('.eio-row'), n = Math.trunc(Number(e.target.value));
    if (!e.target.value.trim() || !Number.isFinite(n) || n === 0) { e.target.classList.add('bad'); setTimeout(() => e.target.classList.remove('bad'), 500); return; }
    addTo(row, row.dataset.id, Math.max(-999, Math.min(999, n)));
    e.target.value = '';
  });
  stage.addEventListener('click', e => {
    const chip = e.target.closest('[data-chip]'); if (chip) { create(chip.dataset.chip); return; }
    const b = e.target.closest('[data-act]'); if (!b) return;
    const row = b.closest('.eio-row'), it = items.find(x => x.id === row.dataset.id); if (!it) return;
    if (b.dataset.act === 'goal') {
      const v = Math.trunc(Number(prompt(t('eio.goalPrompt'), String(it.goal))));
      if (Number.isFinite(v) && v >= 1 && v <= 999) { it.goal = v; save(); render(); }
    } else if (b.dataset.act === 'reset') { if (confirm(t('eio.confirmReset'))) { it.total = 0; save(); render(); } }
    else if (b.dataset.act === 'del') { if (confirm(t('eio.confirmDel'))) { items = items.filter(x => x !== it); save(); render(); } }
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
