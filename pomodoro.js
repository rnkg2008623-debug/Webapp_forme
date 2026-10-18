// Pomodoro: 作業 → 休憩 を繰り返す。作業が終わるたびに学習ログ(Pomodoro 1回)を記録する。
import { firestore } from './auth.js?v=27';
import { unlockAudio, beep, pon } from './sound.js?v=27';

const $ = id => document.getElementById(id);
const pad2 = n => String(n).padStart(2, '0');
const WORK_OPTIONS = [10, 15, 20, 25, 30, 35, 40, 45, 50, 55, 60, 75, 90];
const BREAK_OPTIONS = [3, 5, 10, 15, 20, 25, 30];
const STORAGE_KEY = 'pomodoroSettings';

export const formatClock = ms => { const s = Math.ceil(ms / 1000); return `${pad2(Math.floor(s / 60))}:${pad2(s % 60)}`; };

const state = { work: 25, rest: 5, mode: 'idle', phase: 'work', total: 0, endAt: 0, remaining: 0, completed: 0 };
let user, db, f, ticker;
const announce = start => window.dispatchEvent(new CustomEvent('study-session', { detail: { source: 'pomodoro', start } }));

function remainingMs() {
  if (state.mode === 'running') return Math.max(0, state.endAt - Date.now());
  if (state.mode === 'paused') return state.remaining;
  return state.work * 60000;
}
function fill(select, options) {
  select.replaceChildren(...options.map(v => Object.assign(document.createElement('option'), { value: String(v), textContent: String(v) })));
}
function say(text, ok) {
  const m = $('pm-msg');
  m.textContent = text; m.classList.toggle('ok', !!ok); m.hidden = !text;
}
function render() {
  const live = state.mode !== 'idle';
  const rem = remainingMs();
  $('pm-time').textContent = formatClock(rem);
  $('pm-time').classList.toggle('rest', live && state.phase === 'rest');
  $('pm-phase').textContent = !live ? `作業 ${state.work}分 → 休憩 ${state.rest}分`
    : `${state.phase === 'work' ? '作業中' : '休憩中'}${state.mode === 'paused' ? '(一時停止)' : ''}`;
  $('pm-count').hidden = state.completed === 0;
  $('pm-count').textContent = `完了した Pomodoro: ${state.completed}回`;
  $('pm-work').disabled = $('pm-break').disabled = live;
  $('pm-work').value = String(state.work);
  $('pm-break').value = String(state.rest);
  document.querySelectorAll('.pm-preset').forEach(b => {
    const on = Number(b.dataset.work) === state.work && Number(b.dataset.break) === state.rest;
    b.classList.toggle('is-on', on);
    b.setAttribute('aria-pressed', String(on));
    b.disabled = live;
  });
  $('pm-start').textContent = { idle: 'スタート', running: '一時停止', paused: '再開' }[state.mode];
  $('pm-start').classList.toggle('alt', state.mode === 'running');
  $('pm-sub').hidden = !live;
  document.title = state.mode === 'running' ? `${formatClock(rem)} · ${state.phase === 'work' ? '作業' : '休憩'}` : 'Home';
}
function saveSettings() { try { localStorage.setItem(STORAGE_KEY, JSON.stringify({ work: state.work, rest: state.rest })); } catch (_) { /* 保存できなくても動く */ } }

async function saveLog(minutes, pomodoros) {
  try {
    await f.addDoc(f.collection(db, 'users', user.uid, 'logs'), { title: 'Pomodoro', minutes, pomodoros, at: new Date() });
    return true;
  } catch (e) { console.error(e); return false; }
}
function begin(phase) {
  state.phase = phase;
  state.total = (phase === 'work' ? state.work : state.rest) * 60000;
  state.endAt = Date.now() + state.total;
  state.mode = 'running';
  render();
}
async function phaseDone() {
  // 次のフェーズを先に始める(記録の保存を待つ間に、タイマーがもう一度終了と判定しないように)
  if (state.phase === 'work') {
    pon();   // 休憩に入る合図: 「ポーン」
    const minutes = state.work;
    state.completed += 1;
    begin('rest');
    say(`作業が終わりました。${state.rest}分、休憩しましょう。`, true);
    const ok = await saveLog(minutes, 1);
    if (!ok) say(`作業が終わりました。(記録を保存できませんでした)${state.rest}分、休憩しましょう。`, true);
    else if (state.phase === 'rest') say(`作業が終わりました。記録しました。${state.rest}分、休憩しましょう。`, true);
  } else {
    beep(2);
    begin('work');
    say('休憩が終わりました。次の作業を始めます。', true);
  }
}
function tick() {
  if (state.mode === 'running' && remainingMs() <= 0) phaseDone(); else render();
}
function startOrToggle() {
  if (state.mode === 'idle') { unlockAudio(); say(''); begin('work'); announce(Date.now()); clearInterval(ticker); ticker = setInterval(tick, 250); }
  else if (state.mode === 'running') { state.remaining = remainingMs(); state.mode = 'paused'; render(); }
  else { state.endAt = Date.now() + state.remaining; state.mode = 'running'; render(); }
}
async function stop() {
  const worked = state.phase === 'work' && state.mode !== 'idle' ? Math.floor((state.total - remainingMs()) / 60000) : 0;
  clearInterval(ticker);
  announce(null);
  state.mode = 'idle'; state.phase = 'work';
  const had = state.completed;
  state.completed = 0;
  render();
  if (worked >= 1) say(await saveLog(worked, 0) ? `作業した${worked}分を記録しました。(完了 ${had}回)` : '(記録を保存できませんでした)', true);
  else say(had ? `お疲れさまでした。完了した Pomodoro は ${had}回です。` : '');
}

export async function mountPomodoro(currentUser) {
  user = currentUser;
  ({ m: f, db } = await firestore());
}

fill($('pm-work'), WORK_OPTIONS);
fill($('pm-break'), BREAK_OPTIONS);
try {
  const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || 'null');
  if (saved && WORK_OPTIONS.includes(saved.work) && BREAK_OPTIONS.includes(saved.rest)) { state.work = saved.work; state.rest = saved.rest; }
} catch (_) { /* 無視 */ }
$('pm-work').addEventListener('change', e => { state.work = Number(e.target.value); saveSettings(); render(); });
$('pm-break').addEventListener('change', e => { state.rest = Number(e.target.value); saveSettings(); render(); });
document.querySelectorAll('.pm-preset').forEach(b => b.addEventListener('click', () => {
  state.work = Number(b.dataset.work); state.rest = Number(b.dataset.break); saveSettings(); render();
}));
$('pm-start').addEventListener('click', startOrToggle);
$('pm-stop').addEventListener('click', stop);
window.addEventListener('beforeunload', e => { if (state.mode !== 'idle') { e.preventDefault(); e.returnValue = ''; } });
render();
