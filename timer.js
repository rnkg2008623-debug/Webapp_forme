// Timer: 数字(時間:分)をクリックしてキーボードで設定 → Start でカウントダウン。
// 時計の針は1本。経過に合わせて進み、通った部分を薄い水色で塗る。針が12に戻ったら、終了。
// 終わると(または途中で終了すると)学習ログに記録する。
import { firestore } from './auth.js?v=34';
import { unlockAudio, beep } from './sound.js?v=34';
import { t } from './i18n.js?v=34';

const $ = id => document.getElementById(id);
const MAX_MIN = 720;                 // 12時間(Firestore のルールの上限に合わせる)
const DEFAULT_MIN = 25;
const pad2 = n => String(n).padStart(2, '0');

// 針の角度(度): 経過した割合 × 360。0 = 12時の位置。終了すると 360(= 12に戻る)
export const progressAngle = (elapsedMs, totalMs) => totalMs > 0 ? Math.min(Math.max(elapsedMs / totalMs, 0), 1) * 360 : 0;
// 欄の文字から分に直す(「0:90」は1時間30分になる)。最大12時間
export function fieldsToMinutes(hText, mText) {
  const n = v => parseInt(String(v).replace(/\D/g, ''), 10) || 0;
  return Math.min(n(hText) * 60 + n(mText), MAX_MIN);
}

const state = { minutes: DEFAULT_MIN, mode: 'idle', total: 0, endAt: 0, remaining: 0 };
let user, db, f, ticker, raf;
const H = () => $('tm-h'), M = () => $('tm-m');

// ---- 表示 ----
function wedgePath(deg) {
  if (deg <= 0.05) return '';
  if (deg >= 359.95) return 'M0 -94 A94 94 0 1 1 -0.01 -94 Z';
  const a = (deg - 90) * Math.PI / 180;
  return `M0 0 L0 -94 A94 94 0 ${deg > 180 ? 1 : 0} 1 ${(94 * Math.cos(a)).toFixed(2)} ${(94 * Math.sin(a)).toFixed(2)} Z`;
}
function remainingMs() {
  if (state.mode === 'running') return Math.max(0, state.endAt - Date.now());
  if (state.mode === 'paused') return state.remaining;
  if (state.mode === 'done') return 0;
  return state.minutes * 60000;
}
function writeFields(totalMinutes) {
  H().value = pad2(Math.floor(totalMinutes / 60));
  M().value = pad2(totalMinutes % 60);
}
function renderClock() {
  const deg = state.mode === 'idle' ? 0 : progressAngle(state.total - remainingMs(), state.total);
  $('tm-hand').setAttribute('transform', `rotate(${deg % 360})`);
  $('tm-wedge').setAttribute('d', wedgePath(deg));
}
function render() {
  const rem = remainingMs();
  const live = state.mode !== 'idle';
  if (live) writeFields(Math.ceil(rem / 60000));   // 動いている間は、設定した時間が減っていく
  for (const input of [H(), M()]) { input.readOnly = live; input.tabIndex = live ? -1 : 0; input.classList.toggle('locked', live); }
  renderClock();
  const labels = { idle: 'Start', running: 'Pause', paused: 'Resume', done: t('tm.again') };
  $('tm-start').textContent = labels[state.mode];
  $('tm-start').classList.toggle('alt', state.mode === 'running');
  $('tm-sub').hidden = !(state.mode === 'running' || state.mode === 'paused');
  $('tm-hint').hidden = state.mode !== 'idle';
  const s = Math.ceil(rem / 1000);
  $('tm-left').textContent = (state.mode === 'running' || state.mode === 'paused') ? t('tm.left', { t: `${pad2(Math.floor(s / 3600))}:${pad2(Math.floor(s % 3600 / 60))}:${pad2(s % 60)}` }) : '';
  document.title = state.mode === 'running' ? `${pad2(Math.floor(s / 60))}:${pad2(s % 60)} · Home` : 'Home';
}
function say(text, ok) {
  const m = $('tm-msg');
  m.textContent = text; m.classList.toggle('ok', !!ok); m.hidden = !text;
}

// ---- 入力(数字をクリック → キーボード) ----
// 入力欄の内容を確定する(桁あふれは繰り上げ、最大12時間)。確定した分を返す。
function commitFields() {
  const total = fieldsToMinutes(H().value, M().value);
  state.minutes = total;
  writeFields(total);
  return total;
}
for (const input of [H(), M()]) {
  // フォーカスしたら全選択(そのまま打てば置き換わる)。マウスでは、離したときにカーソルが置かれて選択が解除されるので、それを止める
  input.addEventListener('focus', () => { if (!input.readOnly) input.select(); });
  input.addEventListener('mouseup', e => { if (!input.readOnly) { e.preventDefault(); input.select(); } });
  input.addEventListener('input', () => {
    input.value = input.value.replace(/\D/g, '').slice(0, 2);
    say('');
    if (input === H() && input.value.length === 2) { M().focus(); }   // 時間を2桁入れたら、そのまま分へ
  });
  input.addEventListener('change', () => { if (state.mode === 'idle') commitFields(); });
  input.addEventListener('blur', () => { if (state.mode === 'idle') commitFields(); });
  input.addEventListener('keydown', e => {
    if (input.readOnly) return;
    const step = input === H() ? 60 : 1;
    if (e.key === 'ArrowUp' || e.key === 'ArrowDown') {
      e.preventDefault();
      const total = Math.min(Math.max(fieldsToMinutes(H().value, M().value) + (e.key === 'ArrowUp' ? step : -step), 0), MAX_MIN);
      state.minutes = total; writeFields(total); input.select();
    } else if (e.key === 'Enter') { e.preventDefault(); input.blur(); startOrToggle(); }
    else if (e.key === 'Backspace' && input === M() && input.selectionStart === 0 && input.selectionEnd === 0) { e.preventDefault(); H().focus(); }
  });
}

// ---- 動作 ----
async function saveLog(minutes) {
  try {
    await f.addDoc(f.collection(db, 'users', user.uid, 'logs'), { title: 'Timer', minutes, pomodoros: 0, at: new Date() });
    return true;
  } catch (e) { console.error(e); return false; }
}
// 友だちのホームに「Studying for ...」と出すための合図
const announce = start => window.dispatchEvent(new CustomEvent('study-session', { detail: { source: 'timer', start } }));
function stopLoops() { clearInterval(ticker); cancelAnimationFrame(raf); }
function startLoops() {
  stopLoops();
  ticker = setInterval(() => { if (state.mode === 'running' && remainingMs() <= 0) complete(); else render(); }, 250);
  const loop = () => { if (state.mode !== 'running') return; renderClock(); raf = requestAnimationFrame(loop); };  // 針をなめらかに動かす
  raf = requestAnimationFrame(loop);
}
function start() {
  const minutes = commitFields();
  if (minutes < 1) { say(t('tm.min1')); H().focus(); return; }
  unlockAudio();
  state.total = minutes * 60000;
  state.endAt = Date.now() + state.total;
  state.mode = 'running';
  say('');
  announce(Date.now());
  startLoops();
  render();
}
function pause() { state.remaining = remainingMs(); state.mode = 'paused'; stopLoops(); render(); }
function resume() { state.endAt = Date.now() + state.remaining; state.mode = 'running'; startLoops(); render(); }
function back() { stopLoops(); announce(null); state.mode = 'idle'; writeFields(state.minutes); render(); }
async function complete() {
  stopLoops();
  announce(null);
  state.mode = 'done';
  beep();
  render();
  const minutes = Math.round(state.total / 60000);
  say(await saveLog(minutes) ? t('tm.done', { n: minutes }) : t('tm.doneFail', { n: minutes }), true);
}
async function finishEarly() {
  const minutes = Math.floor((state.total - remainingMs()) / 60000);
  back();
  if (minutes < 1) { say(t('tm.under1')); return; }
  say(await saveLog(minutes) ? t('tm.rec', { n: minutes }) : t('tm.recFail', { n: minutes }), true);
}
function startOrToggle() {
  if (state.mode === 'idle') start();
  else if (state.mode === 'running') pause();
  else if (state.mode === 'paused') resume();
  else { back(); say(''); }
}

export async function mountTimer(currentUser) {
  user = currentUser;
  ({ m: f, db } = await firestore());
}

$('tm-start').addEventListener('click', startOrToggle);
$('tm-reset').addEventListener('click', () => { back(); say(''); });
$('tm-finish').addEventListener('click', finishEarly);
window.addEventListener('beforeunload', e => { if (state.mode === 'running' || state.mode === 'paused') { e.preventDefault(); e.returnValue = ''; } });
writeFields(state.minutes);
render();

// 言語を切り替えたら、画面を描き直す(動いている間のメッセージは、次の更新で切り替わる)
window.addEventListener('langchange', () => { render(); say(''); });
