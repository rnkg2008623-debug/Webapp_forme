// Compare: 自分と友だちの「今日」「今週(月曜〜今日)」の勉強時間を、棒グラフで比べる。
// ヘッダーの Compare を押すと、フレンドと同じように、ページの上に画面が重なって出る。開いている間だけ、ログを読み込む。
import { firestore } from './auth.js?v=56';
import { onState, makeAvatar } from './friends-ui.js?v=56';
import { t, duration } from './i18n.js?v=56';

const $ = id => document.getElementById(id);
let f, db, user;
let state = null;                  // friends-ui の状態(友だち・プロフィール)
const logs = new Map();            // uid -> [{ at: Date, minutes }]
const subs = new Map();            // uid -> 購読解除
const denied = new Set();
const ready = new Set();           // 最初のデータが届いた uid
let opener;

function el(tag, className, text) {
  const n = document.createElement(tag);
  if (className) n.className = className;
  if (text != null) n.textContent = text;
  return n;
}

// ---- 期間 ----
const dayStart = (d = new Date()) => new Date(d.getFullYear(), d.getMonth(), d.getDate());
function weekStart(d = new Date()) {   // 月曜 0:00(ローカル時間)
  const s = dayStart(d);
  s.setDate(s.getDate() - ((s.getDay() + 6) % 7));
  return s;
}
const sum = (list, since) => list.reduce((n, l) => (l.at >= since ? n + l.minutes : n), 0);

// ---- 読み込み(今週ぶんだけ。開いている間だけ購読) ----
function watch(uid) {
  if (subs.has(uid)) return;
  const q = f.query(f.collection(db, 'users', uid, 'logs'), f.where('at', '>=', weekStart()), f.orderBy('at', 'desc'), f.limit(500));
  subs.set(uid, f.onSnapshot(q,
    snap => { logs.set(uid, snap.docs.map(d => { const x = d.data(); return { at: x.at?.toDate?.(), minutes: x.minutes || 0 }; }).filter(l => l.at)); denied.delete(uid); ready.add(uid); render(); },
    err => { console.warn('ログを読み込めませんでした', err.code); if (err.code === 'permission-denied') denied.add(uid); ready.add(uid); render(); }));
}
function unwatchAll() { for (const off of subs.values()) off(); subs.clear(); logs.clear(); denied.clear(); ready.clear(); }
function syncSubs() {
  const want = new Set([user.uid, ...(state?.friends || []).map(x => x.uid)]);
  for (const [uid, off] of subs) if (!want.has(uid)) { off(); subs.delete(uid); logs.delete(uid); ready.delete(uid); denied.delete(uid); }
  for (const uid of want) watch(uid);
}

// ---- 描画 ----
function people() {
  const me = { uid: user.uid, name: t('cp.you'), initialOf: state?.me?.displayName || user.displayName || '', photo: state?.me?.photo || '', isMe: true };
  const others = (state?.friends || []).map(x => ({ uid: x.uid, name: state.profiles[x.uid]?.name ?? '…', photo: state.profiles[x.uid]?.photo || '', isMe: false }));
  return [me, ...others];
}

function section(title, note, rows, loading) {
  const box = el('section', 'cp-sec');
  const head = el('div', 'cp-sec-head'); head.append(el('h3', '', title), el('small', '', note));
  box.append(head);
  const max = Math.max(...rows.map(r => r.min), 1);
  const ranked = [...rows].sort((a, b) => b.min - a.min || (a.isMe ? -1 : 1));
  const list = el('ol', 'cp-rows');
  let rank = 0, prev = null;
  ranked.forEach((r, i) => {
    if (r.min !== prev) { rank = i + 1; prev = r.min; }
    const li = el('li', 'cp-row' + (r.isMe ? ' me' : '') + (rank === 1 && r.min > 0 ? ' first' : ''));
    li.append(el('span', 'cp-rank', r.min > 0 ? t('cp.rank', { n: rank }) : '–'));
    const who = el('div', 'cp-who');
    const av = makeAvatar(r.uid, r.initialOf || r.name, '', r.photo); av.classList.add('cp-av');
    who.append(av, el('span', 'cp-name', r.name));
    const track = el('div', 'cp-track');
    const bar = el('i', 'cp-bar'); bar.style.width = r.min > 0 ? `${Math.max(2, (r.min / max) * 100)}%` : '0';
    track.append(bar);
    const val = el('span', 'cp-val', r.denied ? '—' : (loading && !r.ready ? '…' : (r.min > 0 ? duration(r.min) : t('cp.noData'))));
    li.append(who, track, val);
    list.append(li);
  });
  box.append(list);
  // ひとこと(自分と、いちばん長い友だちとの差)
  const me = rows.find(r => r.isMe), others = rows.filter(r => !r.isMe && !r.denied);
  if (others.length && !loading) {
    const best = others.reduce((a, b) => (b.min > a.min ? b : a));
    let msg;
    if (me.min === 0 && best.min === 0) msg = t('cp.nobody');
    else if (me.min > best.min) msg = me.min - best.min >= 1 && others.length ? t('cp.top') + ' ' + t('cp.ahead', { name: best.name, t: duration(me.min - best.min) }) : t('cp.top');
    else if (me.min === best.min) msg = t('cp.tie');
    else msg = t('cp.behind', { name: best.name, t: duration(best.min - me.min) });
    box.append(el('p', 'cp-msg', msg));
  }
  return box;
}

function render() {
  if ($('compare-overlay').hidden) return;
  const body = $('cp-body');
  const ppl = people();
  const now = new Date(), ds = dayStart(now), ws = weekStart(now);
  const loading = ppl.some(p => !ready.has(p.uid));
  const rowsFor = since => ppl.map(p => ({ ...p, min: sum(logs.get(p.uid) || [], since), denied: denied.has(p.uid) && !p.isMe, ready: ready.has(p.uid) }));
  const parts = [section(t('cp.today'), '', rowsFor(ds), loading), section(t('cp.week'), t('cp.weekNote'), rowsFor(ws), loading)];
  if (ppl.length === 1) parts.push(el('p', 'cp-empty', t('cp.noFriends')));
  if (denied.size) parts.push(el('p', 'fm-msg', t('cp.denied')));
  body.replaceChildren(...parts);
}

// ---- 開閉 ----
const nav = () => document.querySelector('[data-target="compare"]');
const overlay = () => $('compare-overlay');
function open() {
  window.dispatchEvent(new CustomEvent('overlay-open', { detail: 'compare' }));
  opener = document.activeElement;
  overlay().hidden = false;
  nav().classList.add('is-open');
  syncSubs();
  render();
  $('cp-main').focus({ preventScroll: true });
}
function close() {
  overlay().hidden = true;
  nav().classList.remove('is-open');
  unwatchAll();
  opener?.focus?.();
}

export async function mountCompare(currentUser) {
  user = currentUser;
  ({ m: f, db } = await firestore());
  onState(s => { state = s; if (!overlay().hidden) { syncSubs(); render(); } });
  nav().addEventListener('click', () => (overlay().hidden ? open() : close()));
  overlay().addEventListener('click', e => { if (e.target === overlay()) close(); });
  $('cp-close').addEventListener('click', close);
  document.addEventListener('keydown', e => { if (e.key === 'Escape' && !overlay().hidden && $('ed')?.hidden !== false) close(); });
  window.addEventListener('overlay-open', e => { if (e.detail !== 'compare' && !overlay().hidden) close(); });
  window.addEventListener('langchange', render);
  setInterval(render, 60000);   // 日付が変わったら(0時をまたいだら)今日の合計を描き直す
}
