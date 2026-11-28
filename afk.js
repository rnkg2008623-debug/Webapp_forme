// AFK(ネオンのときだけ): タイマーを動かしている間、一定の間隔(初期設定10秒)で、自動でガチャを引く。
// 景品は、プロフィールで使えるアイコンと、プロフィールの背景の飾り。図鑑で、どれを何個持っているか見られて、そこから使うものを選べる。
// 回数や持ち物は、このブラウザに、アカウントごとに保存する。使うものに選んだ景品は、Firestore(プロフィール)に入るので、他の人にも見える。
import { createGpuView } from './gpu-view.js?v=120';
import { WGSL } from './physics-bg.js?v=120';
import { firestore } from './auth.js?v=120';
import { onState } from './friends-ui.js?v=120';
import { unlockAudio, beep } from './sound.js?v=120';
import { t, getLang } from './i18n.js?v=120';
import { ITEMS, BY_ID, RATES_PCT, RARITIES, RARITY_LABEL, availableRarities, itemName, frameSample, applyDeco, plateImg } from './gacha-items.js?v=120';
import { UPGRADES, UPGRADE_KEYS, MAX_LEVEL, newLevels, clampLevels, effect, intervalSec, nextCost, sellPrice, rollPulls, DAILY, WAKE, WEEKLY, normalizeQuests, studiedMinutes, weekStart, isWakeWindow } from './afk-eco.js?v=120';

const host = document.getElementById('afk-view');
const stage = document.getElementById('afk-stage');
const $ = id => document.getElementById(id);
const pad2 = n => String(n).padStart(2, '0');
const MAX_MIN = 720, DEFAULT_MIN = 25;   // タイマーの最大は12時間(学習ログの上限と同じ)

let uid = '', f = null, db = null, social = null, me = { icon: '', deco: '', plate: '' };
const blankData = () => ({ inv: {}, pulls: 0, minutes: DEFAULT_MIN, coins: 0, upg: newLevels(), q: normalizeQuests(null) });
let data = blankData();
const key = () => `afk:v1:${uid}`;
function load() {
  try {
    const d = JSON.parse(localStorage.getItem(key()));
    if (d && typeof d === 'object') {
      const inv = {};
      for (const [id, n] of Object.entries(d.inv || {})) if (BY_ID[id] && Number.isFinite(+n) && +n > 0) inv[id] = Math.floor(+n);
      return { inv, pulls: Math.max(0, Math.floor(+d.pulls) || 0), minutes: Math.min(MAX_MIN, Math.max(1, Math.floor(+d.minutes) || DEFAULT_MIN)),
        coins: Math.max(0, Math.floor(+d.coins) || 0), upg: clampLevels(d.upg), q: normalizeQuests(d.q) };
    }
  } catch { /* 無視 */ }
  return blankData();
}
const save = () => { try { localStorage.setItem(key(), JSON.stringify({ v: 2, ...data })); } catch { /* 無視 */ } };
const fmtN = n => Number(n).toLocaleString();
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
  const iv = intervalSec(data.upg) * 1000;
  const nextIn = st.mode === 'running' ? Math.max(0, st.nextAt - Date.now()) : st.mode === 'paused' ? st.nextRemain : iv;
  const frac = live ? 1 - nextIn / iv : 0;
  $('afk-nextbar').style.width = `${Math.max(0, Math.min(1, frac)) * 100}%`;
  $('afk-nexttxt').textContent = live ? t('afk.nextIn', { n: Math.ceil(nextIn / 1000) }) : t('afk.everyN', { n: intervalSec(data.upg) });
  $('afk-session').textContent = String(st.session);
  host.classList.toggle('is-live', st.mode === 'running');
  document.title = st.mode === 'running' ? `${pad2(Math.floor(s / 60))}:${pad2(s % 60)} AFK` : 'Home';
}
function tick() {
  if (st.mode !== 'running') return;
  const now = Date.now();
  let guard = 0;
  while (now >= st.nextAt && st.nextAt <= st.endAt && guard++ < 200) { doPull(); st.nextAt += intervalSec(data.upg) * 1000; }
  if (now >= st.endAt) { complete(); return; }
  renderTimer();
}
function begin() {
  const minutes = Math.min(MAX_MIN, Math.max(0, (parseInt($('afk-h').value, 10) || 0) * 60 + (parseInt($('afk-m').value, 10) || 0)));
  if (minutes < 1) { say(t('afk.min1')); return; }
  data.minutes = minutes; save(); syncInputs();
  unlockAudio(); say('');
  st.total = minutes * 60000; st.endAt = Date.now() + st.total; st.nextAt = Date.now() + intervalSec(data.upg) * 1000; st.mode = 'running'; st.session = 0; st.startedAt = Date.now();
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
  $('afk-h').value = Math.floor(data.minutes / 60); $('afk-m').value = data.minutes % 60;
}

// ---- ガチャ ----
const hist = [];   // この画面を開いてから引いたもの(新しい順)
let lastResults = [];
function doPull() {
  const rolls = rollPulls(data.upg), results = [];
  for (const r of rolls) {
    const n = r.dupe ? 2 : 1, isNew = !data.inv[r.item.id];
    data.inv[r.item.id] = (data.inv[r.item.id] || 0) + n; data.pulls++; st.session++;
    const res = { it: r.item, isNew, ranked: r.ranked, dupe: r.dupe, twice: r.twice };
    results.push(res); hist.unshift(res);
  }
  hist.length = Math.min(hist.length, 14); save(); lastResults = results;
  showResult(results); renderStats();
  if (!$('afk-dex').hidden) renderDex();
  if (!$('afk-shop').hidden) renderShop();
  const tier = Math.max(...results.map(x => RARITIES.indexOf(x.it.rarity)));
  if (tier >= 2) { beep(Math.min(3, tier - 1)); flash(); }   // RARE 以上は、光って、音が鳴る(上のレア度ほど、音が多い)
}
function preview(it, big) {
  if (it.type === 'icon') return frameSample(it, big ? 'big' : '');
  if (it.type === 'plate') { const w = document.createElement('div'); w.className = `afk-plate ${big ? 'big' : ''}`; w.append(plateImg(it)); return w; }
  const d = document.createElement('div'); d.className = `afk-deco ${big ? 'big' : ''}`; applyDeco(d, it);
  const l1 = document.createElement('i'), l2 = document.createElement('i'); d.append(l1, l2);
  return d;
}
const typeLabel = it => t(it.type === 'icon' ? 'afk.typeIcon' : it.type === 'plate' ? 'afk.typePlate' : 'afk.typeDeco');
const tagEl = (cls, text) => Object.assign(document.createElement('b'), { className: `afk-tag ${cls}`, textContent: text });
const tagsOf = h => [...(h.isNew ? [tagEl('new', 'NEW')] : []), ...(h.ranked ? [tagEl('rank', t('afk.tagRank'))] : []), ...(h.dupe ? [tagEl('dup', t('afk.tagDup'))] : []), ...(h.twice ? [tagEl('dbl', t('afk.tagDbl'))] : [])];
function showResult(results) {
  const box = $('afk-last');
  const best = results.reduce((m, x) => (RARITIES.indexOf(x.it.rarity) > RARITIES.indexOf(m.it.rarity) ? x : m), results[0]);
  box.dataset.r = best.it.rarity; box.classList.remove('pop'); void box.offsetWidth; box.classList.add('pop');
  box.classList.toggle('multi', results.length > 1);
  box.replaceChildren(...results.map(h => {
    const c = document.createElement('div'); c.className = 'afk-lone'; c.dataset.r = h.it.rarity;
    const nm = document.createElement('div'); nm.className = 'afk-lname'; nm.textContent = itemName(h.it, getLang());
    const rar = document.createElement('div'); rar.className = 'afk-lrar'; rar.textContent = `${RARITY_LABEL[h.it.rarity]} · ${typeLabel(h.it)}`;
    const tags = document.createElement('div'); tags.className = 'afk-ltags'; tags.append(...tagsOf(h));
    c.append(preview(h.it, true), nm, rar, tags); return c;
  }));
  $('afk-hist').replaceChildren(...hist.map(h => {
    const li = document.createElement('li'); li.dataset.r = h.it.rarity;
    const name = document.createElement('span'); name.textContent = itemName(h.it, getLang());
    li.append(preview(h.it, false), name, ...tagsOf(h)); return li;
  }));
}
function flash() { const fl = $('afk-flash'); fl.classList.remove('go'); void fl.offsetWidth; fl.classList.add('go'); }
function renderStats() {
  $('afk-pulls').textContent = String(data.pulls);
  $('afk-dexcount').textContent = `${owned()}/${ITEMS.length}`;
  $('afk-coins').textContent = fmtN(data.coins);
  const iv = $('afk-intv'); if (iv) iv.textContent = String(intervalSec(data.upg));
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
    const sb = document.createElement('button'); sb.type = 'button'; sb.className = 'afk-sell'; sb.dataset.sell = it.id;
    sb.textContent = t('afk.sellOne', { c: fmtN(sellPrice(it.rarity, data.upg)) });
    const row = document.createElement('div'); row.className = 'afk-btnrow'; row.append(b, sb);
    c.append(row);
  }
  return c;
}
function renderDex() {
  const sum = availableRarities().map(r => { const all = ITEMS.filter(i => i.rarity === r), got = all.filter(i => data.inv[i.id]).length; return `<span class="afk-sum" data-r="${r}"><b>${RARITY_LABEL[r]}</b> ${got}/${all.length}</span>`; }).join('');
  $('afk-dexsum').innerHTML = `<span class="afk-sum all"><b>${t('afk.collected')}</b> ${owned()}/${ITEMS.length}</span>${sum}`;
  const grid = (type, id) => $(id).replaceChildren(...ITEMS.filter(i => i.type === type).map(card));
  grid('icon', 'afk-icons'); grid('deco', 'afk-decos'); grid('plate', 'afk-plates');
}
async function use(id) {
  const it = BY_ID[id]; if (!it || !data.inv[id] || !social) return;
  const on = me[it.type] === id;
  const btn = stage.querySelector(`[data-use="${id}"]`); if (btn) btn.disabled = true;
  try { await social.actions.setCosmetic(it.type, on ? null : id); setDexMsg(on ? t('afk.unequipped') : t('afk.equipped'), true); }
  catch (e) { console.error(e); setDexMsg(e?.code === 'permission-denied' ? t('afk.equipDenied') : `${t('afk.equipFail')} (${e?.code || e?.message || '?'})`); }
  if (btn) btn.disabled = false;
}
function setDexMsg(text, ok) { const m = $('afk-dexmsg'); m.textContent = text; m.classList.toggle('ok', !!ok); m.hidden = !text; }

// ---- 売る・買う ----
let shopMsgTimer = 0;
function shopMsg(text, ok) {
  for (const id of ['afk-shopmsg', 'afk-dexmsg']) { const m = $(id); if (!m) continue; m.textContent = text; m.classList.toggle('ok', !!ok); m.hidden = !text; }
  clearTimeout(shopMsgTimer); if (text) shopMsgTimer = setTimeout(() => shopMsg(''), 4000);
}
function sellItem(id) {
  const it = BY_ID[id], n = data.inv[id] || 0; if (!it || !n) return;
  if (n === 1) {
    if (me[it.type] === id) { shopMsg(t('afk.sellEquipped')); return; }
    if (!confirm(t('afk.confirmLast'))) return;
  }
  const c = sellPrice(it.rarity, data.upg);
  data.inv[id] = n - 1; if (data.inv[id] <= 0) delete data.inv[id];
  data.coins += c; save(); renderStats(); renderDex(); renderShop(); shopMsg(t('afk.sold', { c: fmtN(c) }), true);
}
const extrasOf = r => ITEMS.filter(i => i.rarity === r).reduce((s, i) => s + Math.max(0, (data.inv[i.id] || 0) - 1), 0);
function sellExtras(r) {
  const n = extrasOf(r); if (!n) { shopMsg(t('afk.noExtras')); return; }
  const c = n * sellPrice(r, data.upg);
  if (!confirm(t('afk.confirmBulk', { n: fmtN(n), c: fmtN(c) }))) return;
  for (const i of ITEMS) if (i.rarity === r && (data.inv[i.id] || 0) > 1) data.inv[i.id] = 1;
  data.coins += c; save(); renderStats(); renderDex(); renderShop(); shopMsg(t('afk.sold', { c: fmtN(c) }), true);
}
function buyUpgrade(k) {
  const cost = nextCost(data.upg, k);
  if (cost === null) return;
  if (data.coins < cost) { shopMsg(t('afk.notEnough')); return; }
  data.coins -= cost; data.upg[k]++; save(); renderStats(); renderShop(); renderTimer(); if (!$('afk-dex').hidden) renderDex(); shopMsg(t('afk.bought'), true);
}
const unitVal = (k, v) => `${v}${UPGRADES[k].unit}`;
function renderShop() {
  const lv = data.upg;
  const rows = availableRarities().map(r => {
    const all = ITEMS.filter(i => i.rarity === r), types = all.filter(i => data.inv[i.id]).length, ex = extrasOf(r), price = sellPrice(r, lv);
    return `<li class="afk-sellrow" data-r="${r}"><b>${RARITY_LABEL[r]}</b><span class="afk-price">${t('afk.perOne', { c: fmtN(price) })}</span><span class="afk-have">${t('afk.haveTypes', { a: types, b: all.length })} · ${t('afk.extra', { n: fmtN(ex) })}</span><button type="button" class="afk-pill sm" data-sellall="${r}" ${ex ? '' : 'disabled'}>${t('afk.sellDup', { c: fmtN(ex * price) })}</button></li>`;
  }).join('');
  const cards = UPGRADE_KEYS.map(k => {
    const L = lv[k], max = L >= MAX_LEVEL, cost = nextCost(lv, k);
    const pips = Array.from({ length: MAX_LEVEL }, (_, i) => `<i class="${i < L ? 'on' : ''}"></i>`).join('');
    return `<div class="afk-up" data-up="${k}"><div class="afk-uphead"><h4>${t(`afk.up.${k}`)}</h4><span class="afk-lv">${max ? 'MAX' : `Lv ${L}`}</span></div>
      <p class="afk-updesc">${t(`afk.up.${k}.d`)}</p>
      <div class="afk-pips" aria-hidden="true">${pips}</div>
      <div class="afk-upnow"><span>${t('afk.now')}</span><b>${unitVal(k, effect(lv, k))}</b>${max ? '' : `<span class="afk-arrow">→</span><b class="nx">${unitVal(k, UPGRADES[k].values[L + 1])}</b>`}</div>
      <button type="button" class="afk-pill ${max ? '' : 'solid'}" data-buy="${k}" ${max || data.coins < cost ? 'disabled' : ''}>${max ? t('afk.max') : t('afk.buy', { c: fmtN(cost) })}</button></div>`;
  }).join('');
  $('afk-shopbody').innerHTML = `<h3 class="afk-h3">${t('afk.upgrades')}</h3><div class="afk-ups">${cards}</div>
    <h3 class="afk-h3">${t('afk.shopSell')}</h3><p class="afk-note">${t('afk.sellNote', { b: effect(lv, 'sell') })}</p><ul class="afk-sellrows">${rows}</ul>`;
}

// ---- クエスト ----
let logs = [];   // 今週ぶんの、自分の学習ログ
const studied = () => studiedMinutes(logs);
function claimQuest(kind, id) {
  data.q = normalizeQuests(data.q);
  let reward = 0;
  const st0 = studied();
  if (kind === 'daily') { const x = DAILY.find(q => q.id === id); if (x && !data.q.dClaimed.includes(id) && st0.today >= x.hours * 60) { data.q.dClaimed.push(id); reward = x.coins; } }
  else if (kind === 'weekly') { const x = WEEKLY.find(q => q.id === id); if (x && !data.q.wClaimed.includes(id) && st0.week >= x.hours * 60) { data.q.wClaimed.push(id); reward = x.coins; } }
  else if (kind === 'wake') { if (data.q.wake && !data.q.wakeClaimed) { data.q.wakeClaimed = true; reward = WAKE.coins; } }
  if (!reward) return;
  data.coins += reward; save(); renderStats(); renderQuests(); renderShop(); shopMsg(t('afk.gotCoins', { c: fmtN(reward) }), true);
}
function checkWake() {
  data.q = normalizeQuests(data.q);
  if (!data.q.wake && isWakeWindow()) { data.q.wake = true; save(); if ($('afk-quests') && !$('afk-quests').hidden) renderQuests(); }
}
function questBlock(title, hours, steps, claimed, kind, maxH) {
  const pct = Math.min(100, hours / maxH * 100);
  const marks = steps.map(s => `<i style="left:${s.hours / maxH * 100}%" class="${hours >= s.hours ? 'on' : ''}"><em>${s.hours}h</em></i>`).join('');
  const rows = steps.map(s => {
    const done = hours >= s.hours, got = claimed.includes(s.id);
    const right = got ? `<span class="afk-got">${t('afk.claimed')}</span>` : done ? `<button type="button" class="afk-pill sm solid" data-claim="${kind}:${s.id}">${t('afk.claim', { c: s.coins })}</button>` : `<span class="afk-left">${t('afk.hoursLeft', { h: +(s.hours - hours).toFixed(1) })}</span>`;
    return `<li class="${got ? 'got' : done ? 'ready' : ''}"><span>${t('afk.studyH', { h: s.hours })}</span><b class="afk-reward">+${fmtN(s.coins)}</b>${right}</li>`;
  }).join('');
  return `<div class="afk-qblock"><div class="afk-qhead"><h3>${title}</h3><span class="afk-qh">${t('afk.progressH', { n: +hours.toFixed(1), m: maxH })}</span></div>
    <div class="afk-qbar"><div class="afk-qfill" style="width:${pct}%"></div>${marks}</div><ul class="afk-qrows">${rows}</ul></div>`;
}
function renderQuests() {
  data.q = normalizeQuests(data.q);
  const s = studied(), q = data.q;
  const wakeRight = q.wakeClaimed ? `<span class="afk-got">${t('afk.claimed')}</span>` : q.wake ? `<button type="button" class="afk-pill sm solid" data-claim="wake:wake">${t('afk.claim', { c: WAKE.coins })}</button>` : `<span class="afk-left">${t('afk.wakeWait')}</span>`;
  $('afk-questbody').innerHTML = questBlock(t('afk.dailyQ'), s.today / 60, DAILY, q.dClaimed, 'daily', 8)
    + `<div class="afk-qblock wake"><ul class="afk-qrows"><li class="${q.wakeClaimed ? 'got' : q.wake ? 'ready' : ''}"><span>${t('afk.wakeQ')}<small>${t('afk.wakeHint')}</small></span><b class="afk-reward">+${WAKE.coins}</b>${wakeRight}</li></ul></div>`
    + questBlock(t('afk.weeklyQ'), s.week / 60, WEEKLY, q.wClaimed, 'weekly', 55);
}

// ---- 画面 ----
const sparkle = '<svg class="afk-spark" viewBox="0 0 24 24" aria-hidden="true"><path d="M12 0l2.2 8.800L24 12l-9.800 3.200L12 24l-2.200-8.800L0 12l9.800-3.200z"/></svg>';
function build() {
  const have = new Set(availableRarities());
  const pct = v => `${+v.toFixed(6)}%`;
  const rates = `<details class="afk-ratelist"><summary>${t('afk.rates')}</summary><ul>${RARITIES.map(r => `<li data-r="${r}"${have.has(r) ? '' : ' class="pending"'}><b>${RARITY_LABEL[r]}</b><span>${pct(RATES_PCT[r])}</span>${have.has(r) ? '' : `<em>${t('afk.soon')}</em>`}</li>`).join('')}</ul>${have.size < RARITIES.length ? `<p>${t('afk.ratesNote')}</p>` : ''}</details>`;
  stage.innerHTML = `<div class="afk-page">
    <header class="afk-head">${sparkle}<div><h2>AFK <em>Gacha</em></h2><p>${t('afk.sub')}</p></div>
      <div class="afk-right"><div class="afk-coinchip" title="${t('afk.coins')}"><svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="9"/><path d="M12 7v10M9.500 9.500h4a1.800 1.800 0 0 1 0 3.600h-3a1.800 1.800 0 0 0 0 3.600h4.200"/></svg><b id="afk-coins">0</b></div>
      <div class="afk-tabs" role="tablist"><button type="button" class="on" data-tab="gacha" role="tab">${t('afk.tabGacha')}</button><button type="button" data-tab="shop" role="tab">${t('afk.tabShop')}</button><button type="button" data-tab="quests" role="tab">${t('afk.tabQuests')}</button><button type="button" data-tab="dex" role="tab">${t('afk.tabDex')} <small id="afk-dexcount">0/${ITEMS.length}</small></button></div></div></header>
    <section id="afk-gacha"><div class="afk-grid">
      <div class="afk-card afk-timer">
        <div class="afk-clock" id="afk-clock">25:00</div>
        <div class="afk-settings" id="afk-settings">
          <label>${t('afk.length')}<span class="afk-hm"><input id="afk-h" type="number" min="0" max="12" inputmode="numeric" aria-label="h"><b>:</b><input id="afk-m" type="number" min="0" max="59" inputmode="numeric" aria-label="min"></span></label>
          <label>${t('afk.interval')}<span class="afk-sc"><b id="afk-intv">15</b><i>${t('afk.sec')}</i></span></label>
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
    <section id="afk-shop" hidden><p class="afk-msg" id="afk-shopmsg" role="status" hidden></p><div id="afk-shopbody"></div></section>
    <section id="afk-quests" hidden><div id="afk-questbody"></div></section>
    <section id="afk-dex" hidden>
      <div class="afk-dexsum" id="afk-dexsum"></div><p class="afk-msg" id="afk-dexmsg" role="status" hidden></p>
      <h3 class="afk-h3">${t('afk.icons')}</h3><div class="afk-items" id="afk-icons"></div>
      <h3 class="afk-h3">${t('afk.decos')}</h3><div class="afk-items" id="afk-decos"></div>
      <h3 class="afk-h3">${t('afk.plates')}</h3><div class="afk-items wide" id="afk-plates"></div>
    </section>
    <div class="afk-flash" id="afk-flash" aria-hidden="true"></div></div>`;
  syncInputs(); renderStats(); renderTimer(); renderShop(); renderQuests();
  if (hist.length) showResult(lastResults);
}
let currentTab = 'gacha';
function openTab(name) {
  currentTab = name;
  stage.querySelectorAll('[data-tab]').forEach(b => b.classList.toggle('on', b.dataset.tab === name));
  for (const [id, n] of [['afk-gacha', 'gacha'], ['afk-shop', 'shop'], ['afk-quests', 'quests'], ['afk-dex', 'dex']]) $(id).hidden = n !== name;
  if (name === 'dex') renderDex(); if (name === 'shop') renderShop(); if (name === 'quests') { checkWake(); renderQuests(); }
}
function wire() {
  stage.addEventListener('click', e => {
    const tab = e.target.closest('[data-tab]');
    if (tab) { openTab(tab.dataset.tab); return; }
    const sell = e.target.closest('[data-sell]'); if (sell) { sellItem(sell.dataset.sell); return; }
    const sellAll = e.target.closest('[data-sellall]'); if (sellAll) { sellExtras(sellAll.dataset.sellall); return; }
    const buy = e.target.closest('[data-buy]'); if (buy) { buyUpgrade(buy.dataset.buy); return; }
    const claim = e.target.closest('[data-claim]'); if (claim) { const [kind, id] = claim.dataset.claim.split(':'); claimQuest(kind, id); return; }
    if (e.target.closest('#afk-go')) { toggle(); return; }
    if (e.target.closest('#afk-finish')) { finishEarly(); return; }
    const u = e.target.closest('[data-use]'); if (u) use(u.dataset.use);
  });
  stage.addEventListener('change', e => {   // 開始前に、時間や間隔を変えたら、すぐ覚える
    if (!e.target.matches('#afk-h, #afk-m') || st.mode === 'running' || st.mode === 'paused') return;
    data.minutes = Math.min(MAX_MIN, Math.max(1, (parseInt($('afk-h').value, 10) || 0) * 60 + (parseInt($('afk-m').value, 10) || 0))); save(); syncInputs(); renderTimer();
  });
  stage.addEventListener('keydown', e => { if (e.key === 'Enter' && e.target.matches('#afk-h, #afk-m')) { e.preventDefault(); if (st.mode === 'idle') begin(); } });
  window.addEventListener('beforeunload', e => { if (st.mode === 'running' || st.mode === 'paused') { e.preventDefault(); e.returnValue = ''; } });
  window.addEventListener('langchange', () => { const cur = currentTab; build(); openTab(cur); });
}

let punch = -10;
const view = createGpuView(WGSL, now => {
  const x = Math.min(1, Math.max(0, (now - punch) / 1.1));
  return [0, 0, now - punch, x < 1 ? Math.sin(Math.PI * x) * 0.9 : 0];
});
export const afk = { start: () => { punch = performance.now() / 1000; return view.start(host); }, stop: () => view.stop() };

export function mountAfk(user, api) {
  uid = user.uid; social = api; data = load();
  build(); wire(); checkWake();
  setInterval(() => { checkWake(); if (!$('afk-quests').hidden) renderQuests(); }, 20000);
  onState(s => { me = { icon: s.me?.icon || '', deco: s.me?.deco || '', plate: s.me?.plate || '' }; if (!$('afk-dex').hidden) renderDex(); });
  firestore().then(x => {
    ({ m: f, db } = x);
    // 今週ぶんの自分の学習ログ(クエストの勉強時間)。AFK で記録したぶんも、ここに入る
    f.onSnapshot(f.query(f.collection(db, 'users', uid, 'logs'), f.where('at', '>=', weekStart()), f.orderBy('at', 'desc'), f.limit(2000)),
      snap => { logs = snap.docs.map(d => { const v = d.data(); return { minutes: v.minutes || 0, at: v.at?.toDate?.() }; }).filter(l => l.at); renderQuests(); },
      err => console.warn('今週の学習ログを読み込めませんでした', err.code));
  }).catch(() => {});
}
