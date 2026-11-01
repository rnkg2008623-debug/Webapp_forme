// プロフィール画面: 自分の情報、学習の集計、日ごとの学習時間のグラフ、Log history
import { firestore } from './auth.js?v=33';
import { formatCode, socialMessage } from './social.js?v=33';
import { t, logMeta } from './i18n.js?v=33';
import { errorMessage } from './auth.js?v=33';
import { loadImage } from './avatar-image.js?v=33';
import { openCropper } from './crop.js?v=33';
import { onState, editMyProfile, makeAvatar } from './friends-ui.js?v=33';
import { computeStats, dailySeries, niceScale, relativeTime, sampleLogs } from './stats.js?v=33';

const $ = id => document.getElementById(id);
const el = (tag, className, text) => {
  const n = document.createElement(tag);
  if (className) n.className = className;
  if (text != null) n.textContent = text;
  return n;
};
const md = d => `${d.getMonth() + 1}/${d.getDate()}`;
const fmt = (n, digits = 1) => n.toFixed(digits).replace(/\.0+$/, '');

// subject: 'me' = 自分のプロフィール / 友だちの uid = その友だちのプロフィール(同じ画面で、相手のデータを表示する)
const state = { subject: 'me', logs: [], preview: false, loaded: false, error: false, me: null, snap: null, friendLogs: [], friendLoaded: false, friendError: false };
const isMe = () => state.subject === 'me';
const LABELS = { online: 'Online', busy: 'Busy', offline: 'Offline' };

// ---- 表示中の人の情報(自分、または友だち) ----
function subjectInfo() {
  if (isMe()) return state.me && { name: state.me.displayName, description: state.me.description, photo: state.me.photo, code: state.me.friendCode, key: 'me' + state.me.friendCode };
  const fr = state.snap?.profiles[state.subject];
  return fr && { name: fr.name, description: fr.description, photo: fr.photo, code: fr.friendCode, key: state.subject };
}
const studyingText = p => {
  if (!p?.studying || p.state === 'offline') return '';
  const min = Math.max(0, Math.floor((Date.now() - p.studying) / 60000));
  return `Studying for ${String(Math.floor(min / 60)).padStart(2, '0')}:${String(min % 60).padStart(2, '0')}h`;
};
function renderMe() {
  const who = subjectInfo();
  if (!who) return;
  const root = $('profile-view');
  root.dataset.subject = isMe() ? 'me' : 'friend';
  $('pf-back').hidden = isMe();
  const av = makeAvatar(who.key, who.name, undefined, who.photo);
  $('pf-photo-remove').hidden = !isMe() || !who.photo;
  av.id = 'pf-avatar';
  av.classList.add('pf-avatar');
  $('pf-avatar').replaceWith(av);
  $('pf-avatar-btn').disabled = !isMe();
  $('pf-avatar-btn').title = isMe() ? t('pf.avatarClick') : '';
  $('pf-name').textContent = who.name;
  $('pf-uid').textContent = who.code ? formatCode(who.code) : '—';
  const d = $('pf-desc');
  d.textContent = who.description || (isMe() ? t('pf.descEmptyMe') : t('pf.descEmpty'));
  d.classList.toggle('empty', !who.description);
  // 友だちのときは、いまの状態(Online / Studying for ...)も出す
  const pr = $('pf-presence');
  const presence = isMe() ? null : state.snap?.presence[state.subject];
  pr.hidden = isMe();
  if (!isMe()) {
    const st = presence?.state || 'offline';
    const dot = el('span', `dot ${st}`);
    const studying = studyingText(presence);
    pr.replaceChildren(dot, LABELS[st], ...(studying ? [el('span', 'sep', '|'), el('span', 'study', studying)] : []));
  }
}

// ---- 集計 ----
const activeLogs = () => (state.preview ? sampleLogs() : isMe() ? state.logs : state.friendLogs);
const loaded = () => (isMe() ? state.loaded : state.friendLoaded);
const failed = () => (isMe() ? state.error : state.friendError);
function renderStats() {
  const s = computeStats(activeLogs());
  $('st-streak').textContent = String(s.streak);
  $('st-total').textContent = fmt(s.totalHours);
  $('st-pomo').textContent = String(s.pomodoros);
  $('st-avg').textContent = fmt(s.weekAvgHours);
}

// ---- 折れ線グラフ(日にち × 時間) ----
const W = 800, H = 300, PAD = { l: 58, r: 24, t: 30, b: 44 };
let plot = null; // { series, x, y }
function renderChart() {
  const days = Number($('pf-range').value);
  const series = dailySeries(activeLogs(), days);
  const { step, max } = niceScale(Math.max(...series.map(p => p.hours)));
  const x = i => PAD.l + (series.length === 1 ? 0 : i * (W - PAD.l - PAD.r) / (series.length - 1));
  const y = v => H - PAD.b - v / max * (H - PAD.b - PAD.t);
  plot = { series, x, y };

  let s = '<defs><linearGradient id="pf-fill" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="var(--accent)" stop-opacity=".22"/><stop offset="1" stop-color="var(--accent)" stop-opacity="0"/></linearGradient></defs>';
  for (let v = 0; v <= max + 1e-9; v += step) {
    s += `<line class="pf-grid" x1="${PAD.l}" x2="${W - PAD.r}" y1="${y(v)}" y2="${y(v)}"/><text class="pf-tick" x="${PAD.l - 10}" y="${y(v) + 4}" text-anchor="end">${fmt(v, step < 1 ? 2 : 1)}</text>`;
  }
  s += `<text class="pf-axis" x="${PAD.l - 10}" y="${PAD.t - 12}" text-anchor="end">${t('pf.axisY')}</text>`;
  s += `<text class="pf-axis" x="${W - PAD.r}" y="${H - 6}" text-anchor="end">${t('pf.axisX')}</text>`;
  const every = Math.ceil(series.length / 7);
  series.forEach((p, i) => { if ((series.length - 1 - i) % every === 0) s += `<text class="pf-tick" x="${x(i)}" y="${H - PAD.b + 20}" text-anchor="middle">${md(p.date)}</text>`; });
  const pts = series.map((p, i) => `${x(i)},${y(p.hours)}`).join(' ');
  s += `<polygon fill="url(#pf-fill)" points="${x(0)},${y(0)} ${pts} ${x(series.length - 1)},${y(0)}"/>`;
  s += `<polyline class="pf-line" points="${pts}"/>`;
  if (series.length <= 31) series.forEach((p, i) => { s += `<circle class="pf-dot" cx="${x(i)}" cy="${y(p.hours)}" r="3.2"/>`; });
  s += `<g id="pf-mark" style="display:none"><line class="pf-cross" y1="${PAD.t}" y2="${H - PAD.b}"/><circle class="pf-dot on" r="5"/></g>`;
  if (!activeLogs().length) s += `<text class="pf-none" x="${W / 2}" y="${H / 2 - 8}" text-anchor="middle">${t('pf.none')}</text>`;
  $('pf-svg').innerHTML = s;
}
// ホバー(タップ)で、その日の時間を表示
const tip = el('div', 'pf-tip'); tip.hidden = true;
$('pf-svg').parentElement.append(tip);
function hover(e) {
  if (!plot) return;
  const box = $('pf-svg').getBoundingClientRect();
  const sx = (e.clientX - box.left) * W / box.width;
  const n = plot.series.length;
  const i = Math.max(0, Math.min(n - 1, Math.round((sx - PAD.l) / ((W - PAD.l - PAD.r) / Math.max(n - 1, 1)))));
  const p = plot.series[i], cx = plot.x(i), cy = plot.y(p.hours);
  const mark = $('pf-mark');
  mark.style.display = '';
  mark.querySelector('line').setAttribute('x1', cx); mark.querySelector('line').setAttribute('x2', cx);
  mark.querySelector('circle').setAttribute('cx', cx); mark.querySelector('circle').setAttribute('cy', cy);
  tip.textContent = `${t('time.weekFmt', { d: md(p.date), w: t('time.week')[p.date.getDay()] })}  ${fmt(p.hours, 2)} hrs`;
  tip.hidden = false;
  tip.style.left = `${cx / W * box.width}px`;
  tip.style.top = `${Math.max(cy / H * box.height - 12, 0)}px`;
}
$('pf-svg').addEventListener('pointermove', hover);
$('pf-svg').addEventListener('pointerdown', hover);
$('pf-svg').addEventListener('pointerleave', () => { tip.hidden = true; const m = $('pf-mark'); if (m) m.style.display = 'none'; });
$('pf-range').addEventListener('change', renderChart);

// ---- Log history ----
function renderHistory() {
  const logs = [...activeLogs()].sort((a, b) => b.at - a.at).slice(0, 30);
  $('pf-preview').hidden = !state.preview || !isMe();
  const items = logs.map(l => {
    const li = el('li', 'pf-log');
    const left = el('div', 'pf-log-main');
    left.append(el('div', 'pf-log-title', l.title || t('log.default')), el('div', 'pf-log-sub', logMeta(l)));
    li.append(left, el('time', 'pf-log-time', relativeTime(l.at)));
    li.querySelector('time').title = l.at.toLocaleString('ja-JP');
    return li;
  });
  if (!items.length) {
    const li = el('li', 'pf-empty');
    const name = subjectInfo()?.name ?? '';
    li.append(el('p', null, failed()
      ? (isMe() ? t('pf.errMe') : t('pf.errFriend', { name }))
      : !loaded() ? t('common.loading')
      : isMe() ? t('pf.emptyMe')
      : t('pf.emptyFriend', { name })));
    if (isMe() && (loaded() || failed())) {
      const b = el('button', 'fm-btn', t('pf.sample'));
      b.type = 'button';
      b.addEventListener('click', () => { state.preview = true; renderAll(); });
      li.append(b);
    }
    items.push(li);
  }
  $('pf-logs').replaceChildren(...items);
}
$('pf-preview-off').addEventListener('click', () => { state.preview = false; renderAll(); });

function renderAll() { renderStats(); renderChart(); renderHistory(); }

$('pf-edit').addEventListener('click', editMyProfile);

// ---- アイコンの変更(クリック → 画像を選ぶ → 切り抜いて保存) ----
let socialApi;
const photoMsg = $('pf-photo-msg');
const say = (text, ok) => { photoMsg.textContent = text; photoMsg.classList.toggle('ok', !!ok); photoMsg.hidden = !text; };
$('pf-avatar-btn').addEventListener('click', () => $('pf-file').click());
$('pf-file').addEventListener('change', async e => {
  const file = e.target.files[0];
  e.target.value = ''; // 同じ画像をもう一度選べるように
  if (!file) return;
  const btn = $('pf-avatar-btn');
  say('');
  let bitmap;
  try {
    bitmap = await loadImage(file);
    const url = await openCropper(bitmap); // 範囲と大きさを選ぶ。キャンセルなら null
    if (!url) return;
    btn.disabled = true; say(t('pf.saving'), true);
    await socialApi.actions.savePhoto(url);
    say(t('pf.saved'), true);
  } catch (err) {
    console.error(err);
    say(socialMessage(err.code) || errorMessage(err));
  } finally { bitmap?.close?.(); btn.disabled = false; }
});
$('pf-photo-remove').addEventListener('click', async () => {
  try { await socialApi.actions.removePhoto(); say(t('pf.reset'), true); }
  catch (err) { say(socialMessage(err.code) || errorMessage(err)); }
});
$('pf-copy').addEventListener('click', async () => {
  const b = $('pf-copy');
  try { await navigator.clipboard.writeText($('pf-uid').textContent); b.textContent = t('pf.copied'); }
  catch (_) { b.textContent = t('pf.copyManual'); }
  setTimeout(() => { b.textContent = t('common.copy'); }, 1800);
});

// ---- 自分 ⇄ 友だち の切り替え ----
let fsApi = null;            // { f, db }
let friendUnsub = null;
let pendingFriend = null;
const since = () => { const d = new Date(); d.setDate(d.getDate() - 365); d.setHours(0, 0, 0, 0); return d; };

function subscribeFriend(uid) {
  friendUnsub?.();
  friendUnsub = null;
  state.friendLogs = []; state.friendLoaded = false; state.friendError = false;
  if (!fsApi) return;
  const { f, db } = fsApi;
  friendUnsub = f.onSnapshot(
    f.query(f.collection(db, 'users', uid, 'logs'), f.where('at', '>=', since()), f.orderBy('at', 'desc'), f.limit(2000)),
    snap => {
      if (state.subject !== uid) return;
      state.friendLogs = snap.docs.map(d => ({ id: d.id, ...d.data(), at: d.data().at?.toDate?.() })).filter(l => l.at);
      state.friendLoaded = true; state.friendError = false;
      renderAll();
    },
    err => { console.error(err); if (state.subject === uid) { state.friendError = true; renderAll(); } });
}
function setSubject(next) {
  state.subject = next;
  state.preview = false;
  if (isMe()) { friendUnsub?.(); friendUnsub = null; } else subscribeFriend(next);
  $('pf-range').value = '7';
  renderMe();
  renderAll();
  $('profile-view').scrollTop = 0;
}
$('pf-back').addEventListener('click', () => setSubject('me'));
// 友だちの名前が押されたら、Profile の画面に切り替えて、その人のデータを出す
window.addEventListener('open-friend-profile', e => { pendingFriend = e.detail.uid; window.appSetView('profile'); });
window.addEventListener('viewchange', e => {
  if (e.detail !== 'profile') return;
  const next = pendingFriend;
  pendingFriend = null;
  setSubject(next || 'me');   // ヘッダーの Profile から開いたときは、いつも自分のプロフィール
});

export async function mountProfile(user, api) {
  socialApi = api;
  onState(s => {
    state.me = s.me;
    state.snap = s;
    if (!isMe() && !s.friends.some(fr => fr.uid === state.subject)) { setSubject('me'); return; }   // フレンドを解除したら、自分に戻る
    renderMe();
  });
  renderAll();
  setInterval(() => { renderHistory(); renderMe(); }, 60000); // 「5分前」「Studying for」などを更新
  const { m: f, db } = await firestore();
  fsApi = { f, db };
  if (!isMe()) subscribeFriend(state.subject);
  f.onSnapshot(
    f.query(f.collection(db, 'users', user.uid, 'logs'), f.where('at', '>=', since()), f.orderBy('at', 'desc'), f.limit(2000)),
    snap => {
      state.logs = snap.docs.map(d => ({ id: d.id, ...d.data(), at: d.data().at?.toDate?.() })).filter(l => l.at);
      state.loaded = true; state.error = false;
      renderAll();
    },
    err => { console.error(err); state.error = true; renderAll(); });
}

// 言語を切り替えたら、画面を描き直す
window.addEventListener('langchange', () => { renderMe(); renderAll(); });
