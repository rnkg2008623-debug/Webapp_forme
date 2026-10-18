// プロフィール画面: 自分の情報、学習の集計、日ごとの学習時間のグラフ、Log history
import { firestore } from './auth.js?v=12';
import { formatCode } from './social.js?v=12';
import { onState, editMyProfile, makeAvatar } from './friends-ui.js?v=12';
import { computeStats, dailySeries, niceScale, relativeTime, sampleLogs } from './stats.js?v=12';

const $ = id => document.getElementById(id);
const el = (tag, className, text) => {
  const n = document.createElement(tag);
  if (className) n.className = className;
  if (text != null) n.textContent = text;
  return n;
};
const WEEK = ['日', '月', '火', '水', '木', '金', '土'];
const md = d => `${d.getMonth() + 1}/${d.getDate()}`;
const fmt = (n, digits = 1) => n.toFixed(digits).replace(/\.0+$/, '');

const state = { logs: [], preview: false, loaded: false, error: false, me: null };

// ---- 自分の情報 ----
function renderMe() {
  const me = state.me;
  if (!me) return;
  const av = makeAvatar('me' + me.friendCode, me.displayName);
  $('pf-avatar').replaceWith(Object.assign(av, { id: 'pf-avatar', className: 'fo-avatar pf-avatar' }));
  $('pf-name').textContent = me.displayName;
  $('pf-uid').textContent = formatCode(me.friendCode);
  const d = $('pf-desc');
  d.textContent = me.description || '自己紹介はまだありません。右上の鉛筆から追加できます。';
  d.classList.toggle('empty', !me.description);
}

// ---- 集計 ----
const activeLogs = () => (state.preview ? sampleLogs() : state.logs);
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
  s += `<text class="pf-axis" x="${PAD.l - 10}" y="${PAD.t - 12}" text-anchor="end">時間 (hrs)</text>`;
  s += `<text class="pf-axis" x="${W - PAD.r}" y="${H - 6}" text-anchor="end">日にち</text>`;
  const every = Math.ceil(series.length / 7);
  series.forEach((p, i) => { if ((series.length - 1 - i) % every === 0) s += `<text class="pf-tick" x="${x(i)}" y="${H - PAD.b + 20}" text-anchor="middle">${md(p.date)}</text>`; });
  const pts = series.map((p, i) => `${x(i)},${y(p.hours)}`).join(' ');
  s += `<polygon fill="url(#pf-fill)" points="${x(0)},${y(0)} ${pts} ${x(series.length - 1)},${y(0)}"/>`;
  s += `<polyline class="pf-line" points="${pts}"/>`;
  if (series.length <= 31) series.forEach((p, i) => { s += `<circle class="pf-dot" cx="${x(i)}" cy="${y(p.hours)}" r="3.2"/>`; });
  s += `<g id="pf-mark" hidden><line class="pf-cross" y1="${PAD.t}" y2="${H - PAD.b}"/><circle class="pf-dot on" r="5"/></g>`;
  if (!activeLogs().length) s += `<text class="pf-none" x="${W / 2}" y="${H / 2 - 8}" text-anchor="middle">記録はまだありません</text>`;
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
  mark.hidden = false;
  mark.querySelector('line').setAttribute('x1', cx); mark.querySelector('line').setAttribute('x2', cx);
  mark.querySelector('circle').setAttribute('cx', cx); mark.querySelector('circle').setAttribute('cy', cy);
  tip.textContent = `${md(p.date)}(${WEEK[p.date.getDay()]})  ${fmt(p.hours, 2)} hrs`;
  tip.hidden = false;
  tip.style.left = `${cx / W * box.width}px`;
  tip.style.top = `${Math.max(cy / H * box.height - 12, 0)}px`;
}
$('pf-svg').addEventListener('pointermove', hover);
$('pf-svg').addEventListener('pointerdown', hover);
$('pf-svg').addEventListener('pointerleave', () => { tip.hidden = true; $('pf-mark')?.setAttribute('hidden', ''); });
$('pf-range').addEventListener('change', renderChart);

// ---- Log history ----
function renderHistory() {
  const logs = [...activeLogs()].sort((a, b) => b.at - a.at).slice(0, 30);
  $('pf-preview').hidden = !state.preview;
  const items = logs.map(l => {
    const li = el('li', 'pf-log');
    const left = el('div', 'pf-log-main');
    left.append(el('div', 'pf-log-title', l.title || '学習'), el('div', 'pf-log-sub', `${l.minutes}分${l.pomodoros ? ` ・ Pomodoro ${l.pomodoros}回` : ''}`));
    li.append(left, el('time', 'pf-log-time', relativeTime(l.at)));
    li.querySelector('time').title = l.at.toLocaleString('ja-JP');
    return li;
  });
  if (!items.length) {
    const li = el('li', 'pf-empty');
    li.append(el('p', null, state.error
      ? 'ログを読み込めませんでした。Firestore のルールが最新か確認してください。'
      : state.loaded ? '学習ログはまだありません。学習を記録すると、ここに新しい順で表示されます。' : '読み込み中…'));
    if (state.loaded || state.error) {
      const b = el('button', 'fm-btn', 'サンプルで表示を確認');
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
$('pf-copy').addEventListener('click', async () => {
  const b = $('pf-copy');
  try { await navigator.clipboard.writeText($('pf-uid').textContent); b.textContent = 'コピーしました'; }
  catch (_) { b.textContent = '選択してコピー'; }
  setTimeout(() => { b.textContent = 'コピー'; }, 1800);
});

export async function mountProfile(user) {
  onState(s => { state.me = s.me; renderMe(); });
  renderAll();
  setInterval(renderHistory, 60000); // 「5分前」などを更新
  const { m: f, db } = await firestore();
  const since = new Date(); since.setDate(since.getDate() - 365); since.setHours(0, 0, 0, 0);
  f.onSnapshot(
    f.query(f.collection(db, 'users', user.uid, 'logs'), f.where('at', '>=', since), f.orderBy('at', 'desc'), f.limit(2000)),
    snap => {
      state.logs = snap.docs.map(d => ({ id: d.id, ...d.data(), at: d.data().at?.toDate?.() })).filter(l => l.at);
      state.loaded = true; state.error = false;
      renderAll();
    },
    err => { console.error(err); state.error = true; renderAll(); });
}
