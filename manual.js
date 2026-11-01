// Log manually: タイトル・作業時間・説明を入力して「完了」を押すと、学習ログ(学習時間)として記録する。右に、自分の最近のログ。
import { firestore } from './auth.js?v=38';
import { onLogs, mineLogs } from './logs-store.js?v=38';
import { relativeTime } from './stats.js?v=38';
import { t, logMeta } from './i18n.js?v=38';
import { fieldsToMinutes } from './timer.js?v=38';

const $ = id => document.getElementById(id);
const pad2 = n => String(n).padStart(2, '0');
let user, db, f;

function el(tag, className, text) {
  const n = document.createElement(tag);
  if (className) n.className = className;
  if (text != null) n.textContent = text;
  return n;
}
function say(text, ok) {
  const m = $('mn-msg');
  m.textContent = text; m.classList.toggle('ok', !!ok); m.hidden = !text;
}

// ---- 作業時間(時間:分)。数字をクリックして、キーボードで入力 ----
const H = $('mn-h'), M = $('mn-m');
function commit() {
  const total = fieldsToMinutes(H.value, M.value);
  H.value = pad2(Math.floor(total / 60));
  M.value = pad2(total % 60);
  return total;
}
for (const input of [H, M]) {
  input.addEventListener('focus', () => input.select());
  input.addEventListener('mouseup', e => { e.preventDefault(); input.select(); });
  input.addEventListener('input', () => {
    input.value = input.value.replace(/\D/g, '').slice(0, 2);
    say('');
    if (input === H && input.value.length === 2) M.focus();
  });
  input.addEventListener('blur', commit);
  input.addEventListener('keydown', e => {
    if (e.key === 'Enter') { e.preventDefault(); commit(); $('mn-desc').focus(); }
    else if (e.key === 'Backspace' && input === M && input.selectionStart === 0 && input.selectionEnd === 0) { e.preventDefault(); H.focus(); }
  });
}
$('mn-title').addEventListener('input', () => say(''));
$('mn-title').addEventListener('keydown', e => { if (e.key === 'Enter') { e.preventDefault(); H.focus(); } });

// ---- 完了 ----
$('mn-form').addEventListener('submit', async e => {
  e.preventDefault();
  const title = $('mn-title').value.trim();
  const minutes = commit();
  if (!title) { say(t('mn.needTitle')); $('mn-title').focus(); return; }
  if (minutes < 1) { say(t('mn.needTime')); H.focus(); return; }
  if (!db) { say(t('mn.wait')); return; }
  const button = $('mn-done');
  button.disabled = true;
  try {
    const description = $('mn-desc').value.trim();
    await f.addDoc(f.collection(db, 'users', user.uid, 'logs'), { title, minutes, pomodoros: 0, at: new Date(), ...(description ? { description } : {}) });
    say(t('mn.saved', { title, n: minutes }), true);
    $('mn-title').value = ''; $('mn-desc').value = ''; H.value = '00'; M.value = '00';
    $('mn-title').focus();
  } catch (err) {
    console.error(err);
    say(t('mn.fail'));
  } finally { button.disabled = false; }
});

// ---- my recent log(新しい順。ボックスの中をスクロールして、すべて見られる) ----
function renderLogs() {
  const items = mineLogs().map(l => {
    const li = el('li', 'mn-log');
    const left = el('div', 'mn-log-main');
    left.append(el('div', 'mn-log-title', l.title || t('log.default')), el('div', 'mn-log-sub', logMeta(l)));
    const time = el('time', 'mn-log-time', relativeTime(l.at));
    time.title = l.at.toLocaleString('ja-JP');
    li.append(left, time);
    return li;
  });
  $('mn-logs').replaceChildren(...(items.length ? items : [el('li', 'mn-empty', t('mn.empty'))]));
}

export async function mountManual(currentUser) {
  user = currentUser;
  onLogs(renderLogs);
  setInterval(renderLogs, 60000);
  ({ m: f, db } = await firestore());
}

// 言語を切り替えたら、画面を描き直す
window.addEventListener('langchange', () => { renderLogs(); say(''); });
