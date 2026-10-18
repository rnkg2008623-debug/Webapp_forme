// Timer: 4桁(時間・分)を上下ボタンで設定 → Start でカウントダウン。終わると(または途中で終了すると)学習ログに記録する。
import { firestore } from './auth.js?v=17';

const $ = id => document.getElementById(id);
const MAX_MIN = 720;                 // 12時間(Firestore のルールの上限に合わせる)
const DIGIT_MAX = [1, 9, 5, 9];      // 時間の十の位 / 一の位 / 分の十の位 / 一の位
const DEFAULT = [0, 0, 2, 5];        // 最初は25分
const pad2 = n => String(n).padStart(2, '0');

export const digitsToMinutes = d => (d[0] * 10 + d[1]) * 60 + d[2] * 10 + d[3];
export function minutesToDigits(total) {
  const m = Math.min(Math.max(Math.round(total), 0), MAX_MIN);
  const h = Math.floor(m / 60), r = m % 60;
  return [Math.floor(h / 10), h % 10, Math.floor(r / 10), r % 10];
}
// 時計の針の角度(度)。長針 = 残りの「分」(60分で1周)、短針 = 残りの「時間」(12時間で1周)
export const minuteAngle = ms => (ms % 3600000) / 3600000 * 360;
export const hourAngle = ms => ms / (12 * 3600000) * 360;

const state = { digits: [...DEFAULT], mode: 'idle', total: 0, endAt: 0, remaining: 0 };
let user, db, f, audio, ticker;

// ---- 表示 ----
function wedgePath(deg) {
  if (deg <= 0) return '';
  if (deg >= 359.9) return 'M0 -94 A94 94 0 1 1 -0.01 -94 Z';
  const a = (deg - 90) * Math.PI / 180;
  return `M0 0 L0 -94 A94 94 0 ${deg > 180 ? 1 : 0} 1 ${(94 * Math.cos(a)).toFixed(2)} ${(94 * Math.sin(a)).toFixed(2)} Z`;
}
function remainingMs() {
  if (state.mode === 'running') return Math.max(0, state.endAt - Date.now());
  if (state.mode === 'paused') return state.remaining;
  if (state.mode === 'done') return 0;
  return digitsToMinutes(state.digits) * 60000;
}
function render() {
  const rem = remainingMs();
  const live = state.mode !== 'idle';
  const shown = live ? minutesToDigits(Math.ceil(rem / 60000)) : state.digits; // 動いている間は、残りを切り上げた分で表示
  shown.forEach((v, i) => {
    const o = $(`tm-d${i}`);
    o.textContent = String(v);
    o.setAttribute('aria-valuenow', String(v));
    o.setAttribute('aria-valuemax', String(DIGIT_MAX[i]));
    o.classList.toggle('locked', live);
    o.tabIndex = live ? -1 : 0;
  });
  document.querySelectorAll('.tm-ar').forEach(b => { b.disabled = live; });
  $('tm-min').setAttribute('transform', `rotate(${minuteAngle(rem)})`);
  $('tm-hour').setAttribute('transform', `rotate(${hourAngle(rem)})`);
  $('tm-wedge').setAttribute('d', wedgePath(rem >= 3600000 && rem % 3600000 === 0 ? 360 : minuteAngle(rem)));
  const labels = { idle: 'Start', running: 'Pause', paused: 'Resume', done: 'もう一度' };
  $('tm-start').textContent = labels[state.mode];
  $('tm-start').classList.toggle('alt', state.mode === 'running');
  $('tm-sub').hidden = !(state.mode === 'running' || state.mode === 'paused');
  const s = Math.ceil(rem / 1000);
  $('tm-left').textContent = live && state.mode !== 'done' ? `残り ${pad2(Math.floor(s / 3600))}:${pad2(Math.floor(s % 3600 / 60))}:${pad2(s % 60)}` : '';
  document.title = state.mode === 'running' ? `${pad2(Math.floor(s / 60))}:${pad2(s % 60)} · Home` : 'Home';
}
function say(text, ok) {
  const m = $('tm-msg');
  m.textContent = text; m.classList.toggle('ok', !!ok); m.hidden = !text;
}

// ---- 動作 ----
function changeDigit(i, delta) {
  if (state.mode !== 'idle') return;
  const d = state.digits;
  d[i] = (d[i] + delta + DIGIT_MAX[i] + 1) % (DIGIT_MAX[i] + 1);
  if (digitsToMinutes(d) > MAX_MIN) state.digits = minutesToDigits(MAX_MIN);
  say('');
  render();
}
function setDigit(i, value) {
  if (state.mode !== 'idle') return;
  state.digits[i] = Math.min(value, DIGIT_MAX[i]);
  if (digitsToMinutes(state.digits) > MAX_MIN) state.digits = minutesToDigits(MAX_MIN);
  say('');
  render();
}
function beep() {
  if (!audio) return;
  [0, 0.28, 0.56].forEach(t => {
    const osc = audio.createOscillator(), gain = audio.createGain();
    osc.type = 'sine'; osc.frequency.value = 880;
    gain.gain.setValueAtTime(0.0001, audio.currentTime + t);
    gain.gain.exponentialRampToValueAtTime(0.25, audio.currentTime + t + 0.03);
    gain.gain.exponentialRampToValueAtTime(0.0001, audio.currentTime + t + 0.22);
    osc.connect(gain).connect(audio.destination);
    osc.start(audio.currentTime + t); osc.stop(audio.currentTime + t + 0.25);
  });
}
async function saveLog(minutes) {
  try {
    await f.addDoc(f.collection(db, 'users', user.uid, 'logs'), { title: 'Timer', minutes, pomodoros: 0, at: new Date() });
    return true;
  } catch (e) { console.error(e); return false; }
}
function tick() {
  if (state.mode === 'running' && remainingMs() <= 0) return complete();
  render();
}
function start() {
  const minutes = digitsToMinutes(state.digits);
  if (minutes < 1) { say('1分以上に設定してください。'); return; }
  try { audio ??= new (window.AudioContext || window.webkitAudioContext)(); audio.resume?.(); } catch (_) { /* 音なしで動く */ }
  state.total = minutes * 60000;
  state.endAt = Date.now() + state.total;
  state.mode = 'running';
  say('');
  clearInterval(ticker); ticker = setInterval(tick, 250);
  render();
}
function pause() { state.remaining = remainingMs(); state.mode = 'paused'; clearInterval(ticker); render(); }
function resume() { state.endAt = Date.now() + state.remaining; state.mode = 'running'; clearInterval(ticker); ticker = setInterval(tick, 250); render(); }
function back() { clearInterval(ticker); state.mode = 'idle'; render(); }
async function complete() {
  clearInterval(ticker);
  state.mode = 'done';
  beep();
  render();
  const minutes = Math.round(state.total / 60000);
  say(await saveLog(minutes) ? `完了です。${minutes}分を記録しました。` : `完了です。(${minutes}分の記録を保存できませんでした)`, true);
}
async function finishEarly() {
  const elapsed = state.total - remainingMs();
  const minutes = Math.floor(elapsed / 60000);
  back();
  if (minutes < 1) { say('1分未満のため、記録されませんでした。'); return; }
  say(await saveLog(minutes) ? `${minutes}分を記録しました。` : `(${minutes}分の記録を保存できませんでした)`, true);
}

export async function mountTimer(currentUser) {
  user = currentUser;
  ({ m: f, db } = await firestore());
}

// ---- 画面の操作(ログイン前でも設定はできる。記録だけ mountTimer 後に有効) ----
document.querySelectorAll('.tm-ar').forEach(b => b.addEventListener('click', () => changeDigit(Number(b.dataset.i), Number(b.dataset.d))));
document.querySelectorAll('.tm-oval').forEach(o => o.addEventListener('keydown', e => {
  const i = Number(o.dataset.i);
  if (e.key === 'ArrowUp') { e.preventDefault(); changeDigit(i, 1); }
  else if (e.key === 'ArrowDown') { e.preventDefault(); changeDigit(i, -1); }
  else if (/^[0-9]$/.test(e.key)) { e.preventDefault(); setDigit(i, Number(e.key)); if (i < 3) $(`tm-d${i + 1}`).focus(); }
}));
$('tm-start').addEventListener('click', () => {
  if (state.mode === 'idle') start();
  else if (state.mode === 'running') pause();
  else if (state.mode === 'paused') resume();
  else { state.mode = 'idle'; say(''); render(); }
});
$('tm-reset').addEventListener('click', () => { back(); say(''); });
$('tm-finish').addEventListener('click', finishEarly);
window.addEventListener('beforeunload', e => { if (state.mode === 'running' || state.mode === 'paused') { e.preventDefault(); e.returnValue = ''; } });
render();
