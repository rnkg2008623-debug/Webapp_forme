// AFK(ネオンのときだけ): タイマーを動かしている間、一定の間隔(初期設定10秒)で、自動でガチャを引く。
// 景品は、プロフィールで使えるアイコンと、プロフィールの背景の飾り。図鑑で、どれを何個持っているか見られて、そこから使うものを選べる。
// 回数や持ち物は、このブラウザに、アカウントごとに保存する。使うものに選んだ景品は、Firestore(プロフィール)に入るので、他の人にも見える。
import { createGpuView } from './gpu-view.js?v=102';
import { WGSL } from './physics-bg.js?v=102';
import { firestore } from './auth.js?v=102';
import { onState } from './friends-ui.js?v=102';
import { unlockAudio, beep } from './sound.js?v=102';
import { t, getLang } from './i18n.js?v=102';
import { ITEMS, BY_ID, RATES, RARITIES, RARITY_LABEL, itemName, pull, frameSample, applyDeco } from './gacha-items.js?v=102';

const host = document.getElementById('afk-view');
const stage = document.getElementById('afk-stage');
const $ = id => document.getElementById(id);
const pad2 = n => String(n).padStart(2, '0');
const MAX_MIN = 720, DEFAULT_MIN = 25, DEFAULT_SEC = 10, MIN_SEC = 3, MAX_SEC = 3600;   // タイマーの最大は12時間(学習ログの上限と同じ)

let uid = '', f = null, db = null, social = null, me = { icon: '', deco: '' };
let data = { inv: {}, pulls: 0, sec: DEFAULT_SEC, minutes: DEFAULT_MIN };
const key = () => `afk:v1:${uid}`;
function load() {
  try {
    const d = JSON.parse(localStorage.getItem(key()));
    if (d && typeof d === 'object') {
      const inv = {};
      for (const [id, n] of Object.entries(d.inv || {})) if (BY_ID[id] && Number.isFinite(+n) && +n > 0) inv[id] = Math.floor(+n);
      return { inv, pulls: Math.max(0, Math.floor(+d.pulls) || 0), sec: Math.min(MAX_SEC, Math.max(MIN_SEC, Math.floor(+d.sec) || DEFAULT_SEC)), minutes: Math.min(MAX_MIN, Math.max(1, Math.floor(+d.minutes) || DEFAULT_MIN)) };
    }
  } catch { /* 無視 */ }
  return { inv: {}, pulls: 0, sec: DEFAULT_SEC, minutes: DEFAULT_MIN };
}
const save = () => { try { localStorage.setItem(key(), JSON.stringify({ v: 1, ...data })); } catch { /* 無視 */ } };
const owned = () => ITEMS.filter(i => data.inv[i.id]).length;

// ---- タイマー ----
const st = { mode: 'idle', total: 0, endAt: 0, remaining: 0, nextAt: 0, nextRemain: 0, session: 0, startedAt: 0 };
let ticker = 0;
const left = () => st.mode === 'running' ? Math.max(0, st.endAt - Date.now()) : st.mode === 'paused' ? st.remaining : st.mode === 'done' ? 0 : data.minutes * 60000;
const announce = start => window.dispatchEvent(new CustomEvent('study-session', { detail: { source: 'afk', start } }));
function say(text, ok) { const m = $('afk-msg'); if (!m) return; m.textContent = text; m.classList.toggle('ok', !!ok); m.hidden = !text; }
async function saveLog(minutes) {
  try {
    if (!f) ({ m: f, db } = await firestore());
    await f.addDoc(f.collection(db, 'users', uid, 'logs'), { title: 'AFK', minutes, pomodoros: 0, at: new Date() });
    return true;
  } catch (e) { console.error(e); return false; }
}

// ---- 描画: タイマー ----
function renderTimer() {
  const live = st.mode === 'running' || st.mode === 'paused';
  const s = Math.ceil(left() / 1000);
  $('afk-clock').textContent = `${pad2(Math.floor(s / 3600))}:${pad2(Math.floor(s % 3600 / 60))}:${pad2(s % 60)}`;
  $('afk-settings').hidden = live;
  const labels = { idle: t('afk.start'), running: t('afk.pause'), paused: t('afk.resume'), done: t('afk.again') };
  $('afk-go').textContent = labels[st.mode]; $('afk-go').classList.toggle('alt', st.mode === 'running');
  $('afk-finish').hidden = !live;
  const nextIn = st.mode === 'running' ? Math.max(0, st.nextAt - Date.now()) : st.mode === 'paused' ? st.nextRemain : data.sec * 1000;
  const frac = live ? 1 - nextIn / (data.sec * 1000) : 0;
  $('afk-nextbar').style.width = `${Math.max(0, Math.min(1, frac)) * 100}%`;
  $('afk-nexttxt').textContent = live ? t('afk.nextIn', { n: Math.ceil(nextIn / 1000) }) : t('afk.everyN', { n: data.sec });
  $('afk-session').textContent = String(st.session);
  host.classList.toggle('is-live', st.mode === 'running');
  document.title = st.mode === 'running' ? `${pad2(Math.floor(s / 60))}:${pad2(s % 60)} AFK` : 'Home';
}
function tick() {
  if (st.mode !== 'running') return;
  const now = Date.now();
  let guard = 0;
  while (now >= st.nextAt && st.nextAt <= st.endAt && guard++ < 200) { doPull(); st.nextAt += data.sec * 1000; }
  if (now >= st.endAt) { complete(); return; }
  renderTimer();
}
function begin() {
  const minutes = Math.min(MAX_MIN, Math.max(0, (parseInt($('afk-h').value, 10) || 0) * 60 + (parseInt($('afk-m').value, 10) || 0)));
  if (minutes < 1) { say(t('afk.min1')); return; }
  const sec = Math.trunc(Number($('afk-sec').value));
  data.minutes = minutes; data.sec = Number.isFinite(sec) ? Math.min(MAX_SEC, Math.max(MIN_SEC, sec)) : DEFAULT_SEC; save(); syncInputs();
  unlockAudio(); say('');
  st.total = minutes * 60000; st.endAt = Date.now() + st.total; st.nextAt = Date.now() + data.sec * 1000; st.mode = 'running'; st.session = 0; st.startedAt = Date.now();
  announce(Date.now());
  clearInterval(ticker); ticker = setInterval(tick, 250);
  renderTimer();
}
function pause() { st.remaining = Math.max(0, st.endAt - Date.now()); st.nextRemain = Math.max(0, st.nextAt - Date.now()); st.mode = 'paused'; renderTimer(); }
function resume() { st.endAt = Date.now() + st.remaining; st.nextAt = Date.now() + st.nextRemain; st.mode = 'running'; renderTimer(); }
function back() { clearInterval(ticker); announce(null); st.mode = 'idle'; renderTimer(); }
async function complete() {
  clearInterval(ticker); announce(null); st.mode = 'done'; beep(); renderTimer();
  const minutes = Math.round(st.total / 60000);
  say(await saveLog(minutes) ? t('afk.done', { n: minutes, p: st.session }) : t('afk.doneFail', { n: minutes }), true);
}
async function finishEarly() {
  const minutes = Math.floor((st.total - left()) / 60000), pulls = st.session;
  back();
  if (minutes < 1) { say(t('afk.under1', { p: pulls })); return; }
  say(await saveLog(minutes) ? t('afk.rec', { n: minutes, p: pulls }) : t('afk.recFail', { n: minutes }), true);
}
function toggle() {
  if (st.mode === 'idle') begin(); else if (st.mode === 'running') pause(); else if (st.mode === 'paused') resume(); else { back(); say(''); }
}
function syncInputs() {
  $('afk-h').value = Math.floor(data.minutes / 60); $('afk-m').value = data.minutes % 60; $('afk-sec').value = data.sec;
}

// ---- ガチャ ----
const hist = [];   // この画面を開いてから引いたもの(新しい順)
function doPull() {
  const it = pull(), isNew = !data.inv[it.id];
  data.inv[it.id] = (data.inv[it.id] || 0) + 1; data.pulls++; st.session++; save();
  hist.unshift({ it, isNew }); hist.length = Math.min(hist.length, 12);
  showResult(it, isNew); renderStats();
  if (!$('afk-dex').hidden) renderDex();
  if (it.rarity === 'rare') { beep(1); flash(); }
}
function preview(it, big) {
  if (it.type === 'icon') return frameSample(it, big ? 'big' : '');
  const d = document.createElement('div'); d.className = `afk-deco ${big ? 'big' : ''}`; applyDeco(d, it);
  const l1 = document.createElement('i'), l2 = document.createElement('i'); d.append(l1, l2);
  return d;
}
const typeLabel = it => t(it.type === 'icon' ? 'afk.typeIcon' : 'afk.typeDeco');
function showResult(it, isNew) {
  const box = $('afk-last');
  box.dataset.r = it.rarity; box.classList.remove('pop'); void box.offsetWidth; box.classList.add('pop');
  const nm = document.createElement('div'); nm.className = 'afk-lname'; nm.textContent = itemName(it, getLang());
  const rar = document.createElement('div'); rar.className = 'afk-lrar'; rar.textContent = `${RARITY_LABEL[it.rarity]} · ${typeLabel(it)}`;
  const tags = document.createElement('div'); tags.className = 'afk-ltags'; if (isNew) { const n = document.createElement('b'); n.className = 'afk-new'; n.textContent = 'NEW'; tags.append(n); }
  box.replaceChildren(preview(it, true), nm, rar, tags);
  const ul = $('afk-hist');
  ul.replaceChildren(...hist.map(h => {
    const li = document.createElement('li'); li.dataset.r = h.it.rarity;
    const name = document.createElement('span'); name.textContent = itemName(h.it, getLang());
    li.append(preview(h.it, false), name, ...(h.isNew ? [Object.assign(document.createElement('b'), { className: 'afk-new', textContent: 'NEW' })] : []));
    return li;
  }));
}
function flash() { const fl = $('afk-flash'); fl.classList.remove('go'); void fl.offsetWidth; fl.classList.add('go'); }
function renderStats() {
  $('afk-pulls').textContent = String(data.pulls);
  $('afk-dexcount').textContent = `${owned()}/${ITEMS.length}`;
}

// ---- 図鑑 ----
function card(it) {
  const n = data.inv[it.id] || 0;
  const equipped = me[it.type] === it.id;
  const c = document.createElement('div'); c.className = `afk-item${n ? '' : ' locked'}${equipped ? ' equipped' : ''}`; c.dataset.r = it.rarity; c.dataset.id = it.id;
  const pv = document.createElement('div'); pv.className = 'afk-pv'; pv.append(preview(it, false)); if (!n) pv.append(Object.assign(document.createElement('span'), { className: 'afk-q', textContent: '?' }));
  const nm = document.createElement('div'); nm.className = 'afk-iname'; nm.textContent = n ? itemName(it, getLang()) : '???';
  const meta = document.createElement('div'); meta.className = 'afk-imeta';
  meta.append(Object.assign(document.createElement('span'), { className: 'afk-rar', textContent: RARITY_LABEL[it.rarity] }), Object.assign(document.createElement('b'), { className: 'afk-cnt', textContent: `×${n}` }));
  c.append(pv, nm, meta);
  if (n) {
    const b = document.createElement('button'); b.type = 'button'; b.className = 'afk-use'; b.dataset.use = it.id;
    b.textContent = equipped ? t('afk.unequip') : t('afk.equip'); b.setAttribute('aria-pressed', String(equipped));
    c.append(b);
  }
  return c;
}
function renderDex() {
  const sum = RARITIES.map(r => { const all = ITEMS.filter(i => i.rarity === r), got = all.filter(i => data.inv[i.id]).length; return `<span class="afk-sum" data-r="${r}"><b>${RARITY_LABEL[r]}</b> ${got}/${all.length}</span>`; }).join('');
  $('afk-dexsum').innerHTML = `<span class="afk-sum all"><b>${t('afk.collected')}</b> ${owned()}/${ITEMS.length}</span>${sum}`;
  const grid = (type, id) => $(id).replaceChildren(...ITEMS.filter(i => i.type === type).map(card));
  grid('icon', 'afk-icons'); grid('deco', 'afk-decos');
}
async function use(id) {
  const it = BY_ID[id]; if (!it || !data.inv[id] || !social) return;
  const on = me[it.type] === id;
  const btn = stage.querySelector(`[data-use="${id}"]`); if (btn) btn.disabled = true;
  try { await social.actions.setCosmetic(it.type, on ? null : id); setDexMsg(on ? t('afk.unequipped') : t('afk.equipped'), true); }
  catch (e) { console.error(e); setDexMsg(t('afk.equipFail')); }
  if (btn) btn.disabled = false;
}
function setDexMsg(text, ok) { const m = $('afk-dexmsg'); m.textContent = text; m.classList.toggle('ok', !!ok); m.hidden = !text; }

// ---- 画面 ----
const sparkle = '<svg class="afk-spark" viewBox="0 0 24 24" aria-hidden="true"><path d="M12 0l2.2 8.800L24 12l-9.800 3.200L12 24l-2.200-8.800L0 12l9.800-3.200z"/></svg>';
function build() {
  const rates = RARITIES.map(r => `<span data-r="${r}">${RARITY_LABEL[r]} ${Math.round(RATES[r] * 100)}%</span>`).join('');
  stage.innerHTML = `<div class="afk-page">
    <header class="afk-head">${sparkle}<div><h2>AFK <em>Gacha</em></h2><p>${t('afk.sub')}</p></div>
      <div class="afk-tabs" role="tablist"><button type="button" class="on" data-tab="gacha" role="tab">${t('afk.tabGacha')}</button><button type="button" data-tab="dex" role="tab">${t('afk.tabDex')} <small id="afk-dexcount">0/${ITEMS.length}</small></button></div></header>
    <section id="afk-gacha"><div class="afk-grid">
      <div class="afk-card afk-timer">
        <div class="afk-clock" id="afk-clock">25:00</div>
        <div class="afk-settings" id="afk-settings">
          <label>${t('afk.length')}<span class="afk-hm"><input id="afk-h" type="number" min="0" max="12" inputmode="numeric" aria-label="h"><b>:</b><input id="afk-m" type="number" min="0" max="59" inputmode="numeric" aria-label="min"></span></label>
          <label>${t('afk.interval')}<span class="afk-sc"><input id="afk-sec" type="number" min="${MIN_SEC}" max="${MAX_SEC}" inputmode="numeric" aria-label="sec"><i>${t('afk.sec')}</i></span></label>
        </div>
        <div class="afk-next"><div class="afk-bar"><i id="afk-nextbar"></i></div><span id="afk-nexttxt"></span></div>
        <div class="afk-btns"><button type="button" class="afk-pill solid" id="afk-go"></button><button type="button" class="afk-pill" id="afk-finish" hidden>${t('afk.finish')}</button></div>
        <p class="afk-msg" id="afk-msg" role="status" hidden></p>
        <dl class="afk-nums"><div><dt>${t('afk.thisSession')}</dt><dd id="afk-session">0</dd></div><div><dt>${t('afk.totalPulls')}</dt><dd id="afk-pulls">0</dd></div></dl>
      </div>
      <div class="afk-card afk-res">
        <h3>${t('afk.latest')}</h3>
        <div class="afk-last" id="afk-last" data-r="none"><p class="afk-wait">${t('afk.waiting')}</p></div>
        <div class="afk-rates">${rates}</div>
        <h4>${t('afk.history')}</h4><ul class="afk-hist" id="afk-hist"></ul>
      </div>
    </div></section>
    <section id="afk-dex" hidden>
      <div class="afk-dexsum" id="afk-dexsum"></div><p class="afk-msg" id="afk-dexmsg" role="status" hidden></p>
      <h3 class="afk-h3">${t('afk.icons')}</h3><div class="afk-items" id="afk-icons"></div>
      <h3 class="afk-h3">${t('afk.decos')}</h3><div class="afk-items" id="afk-decos"></div>
    </section>
    <div class="afk-flash" id="afk-flash" aria-hidden="true"></div></div>`;
  syncInputs(); renderStats(); renderTimer();
  if (hist.length) showResult(hist[0].it, hist[0].isNew);
  if (!$('afk-dex').hidden) renderDex();
}
function wire() {
  stage.addEventListener('click', e => {
    const tab = e.target.closest('[data-tab]');
    if (tab) {
      const dex = tab.dataset.tab === 'dex';
      stage.querySelectorAll('[data-tab]').forEach(b => b.classList.toggle('on', b === tab));
      $('afk-gacha').hidden = dex; $('afk-dex').hidden = !dex; if (dex) renderDex(); return;
    }
    if (e.target.closest('#afk-go')) { toggle(); return; }
    if (e.target.closest('#afk-finish')) { finishEarly(); return; }
    const u = e.target.closest('[data-use]'); if (u) use(u.dataset.use);
  });
  stage.addEventListener('change', e => {   // 開始前に、時間や間隔を変えたら、すぐ覚える
    if (!e.target.matches('#afk-h, #afk-m, #afk-sec') || st.mode === 'running' || st.mode === 'paused') return;
    const minutes = Math.min(MAX_MIN, Math.max(1, (parseInt($('afk-h').value, 10) || 0) * 60 + (parseInt($('afk-m').value, 10) || 0)));
    const sec = Math.trunc(Number($('afk-sec').value));
    data.minutes = minutes; data.sec = Number.isFinite(sec) ? Math.min(MAX_SEC, Math.max(MIN_SEC, sec)) : DEFAULT_SEC; save(); syncInputs(); renderTimer();
  });
  stage.addEventListener('keydown', e => { if (e.key === 'Enter' && e.target.matches('#afk-h, #afk-m, #afk-sec')) { e.preventDefault(); if (st.mode === 'idle') begin(); } });
  window.addEventListener('beforeunload', e => { if (st.mode === 'running' || st.mode === 'paused') { e.preventDefault(); e.returnValue = ''; } });
  window.addEventListener('langchange', () => { const dexOpen = !$('afk-dex').hidden; build(); if (dexOpen) { stage.querySelector('[data-tab="dex"]').click(); } });
}

let punch = -10;
const view = createGpuView(WGSL, now => {
  const x = Math.min(1, Math.max(0, (now - punch) / 1.1));
  return [0, 0, now - punch, x < 1 ? Math.sin(Math.PI * x) * 0.9 : 0];
});
export const afk = { start: () => { punch = performance.now() / 1000; return view.start(host); }, stop: () => view.stop() };

export function mountAfk(user, api) {
  uid = user.uid; social = api; data = load();
  build(); wire();
  onState(s => { me = { icon: s.me?.icon || '', deco: s.me?.deco || '' }; if (!$('afk-dex').hidden) renderDex(); });
  firestore().then(x => { ({ m: f, db } = x); }).catch(() => {});
}
