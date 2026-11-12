// Log manually: タイトル・作業時間・説明を入力して「完了」を押すと、学習ログ(学習時間)として記録する。右に、自分の最近のログ。
import { firestore } from './auth.js?v=89';
import { onLogs, mineLogs } from './logs-store.js?v=89';
import { relativeTime } from './stats.js?v=89';
import { t, getLang, duration } from './i18n.js?v=89';
import { fieldsToMinutes } from './timer.js?v=89';

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
// 1件ごとに、タイトル・作業時間・日にち(時刻つき)・説明(全文)を表示する
const LOCALES = { ja: 'ja-JP', en: 'en-GB', zh: 'zh-CN' };
const fmtWhen = d => (d instanceof Date && !isNaN(d)
  ? new Intl.DateTimeFormat(LOCALES[getLang()] || 'en-GB', { year: 'numeric', month: 'short', day: 'numeric', weekday: 'short', hour: '2-digit', minute: '2-digit' }).format(d)
  : '');
let editingId = null;   // 編集中のログ(編集中は、一覧を描き直さない)
const pencil = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 20h4L19 9l-4-4L4 16v4zM13.5 6.5l4 4"/></svg>';
const toLocalInput = d => `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}T${pad2(d.getHours())}:${pad2(d.getMinutes())}`;

function editForm(l) {
  const form = el('form', 'mn-edit');
  form.noValidate = true;
  const title = el('input', 'mn-e-title'); title.type = 'text'; title.maxLength = 40; title.value = l.title; title.setAttribute('aria-label', t('h.mn.titleAria'));
  const row = el('div', 'mn-e-row');
  const h = el('input', 'mn-e-num'); h.type = 'number'; h.min = 0; h.max = 12; h.value = Math.floor(l.minutes / 60); h.setAttribute('aria-label', t('mn.hShort'));
  const m = el('input', 'mn-e-num'); m.type = 'number'; m.min = 0; m.max = 59; m.value = l.minutes % 60; m.setAttribute('aria-label', t('unit.minShort'));
  const when = el('input', 'mn-e-when'); when.type = 'datetime-local'; when.value = toLocalInput(l.at); when.max = toLocalInput(new Date()); when.setAttribute('aria-label', t('mn.when'));
  row.append(h, el('span', '', t('mn.hShort')), m, el('span', '', t('unit.minShort')), when);
  const desc = el('textarea', 'mn-e-desc'); desc.rows = 3; desc.maxLength = 200; desc.value = l.description; desc.placeholder = 'description'; desc.setAttribute('aria-label', t('h.mn.descAria'));
  const msg = el('p', 'tm-msg'); msg.hidden = true; msg.setAttribute('role', 'status');
  const bar = el('div', 'mn-e-bar');
  const save = el('button', 'mn-e-save', t('mn.save')); save.type = 'submit';
  const cancel = el('button', 'mn-e-cancel', t('mn.cancel')); cancel.type = 'button';
  const del = el('button', 'mn-e-del', t('mn.delete')); del.type = 'button';
  bar.append(save, cancel, del);
  form.append(title, row, desc, msg, bar);
  const fail = text => { msg.textContent = text; msg.hidden = !text; };
  const close = () => { editingId = null; renderLogs(); };
  cancel.addEventListener('click', close);
  form.addEventListener('submit', async e => {
    e.preventDefault();
    const newTitle = title.value.trim();
    const minutes = (parseInt(h.value, 10) || 0) * 60 + (parseInt(m.value, 10) || 0);
    const at = new Date(when.value);
    if (!newTitle) { fail(t('mn.needTitle')); title.focus(); return; }
    if (minutes < 1 || minutes > 720) { fail(t('mn.needTime')); h.focus(); return; }
    if (isNaN(at)) { fail(t('mn.future')); when.focus(); return; }
    if (at.getTime() > Date.now() + 60000) { fail(t('mn.future')); when.focus(); return; }
    const description = desc.value.trim();
    save.disabled = true;
    try {
      await f.updateDoc(f.doc(db, 'users', user.uid, 'logs', l.docId), { title: newTitle, minutes, at, description: description || f.deleteField() });
      close();
    } catch (err) { console.error(err); fail(t('mn.editFail')); save.disabled = false; }
  });
  del.addEventListener('click', async () => {
    if (!confirm(t('mn.confirmDel'))) return;
    del.disabled = true;
    try { await f.deleteDoc(f.doc(db, 'users', user.uid, 'logs', l.docId)); close(); }
    catch (err) { console.error(err); fail(t('mn.delFail')); del.disabled = false; }
  });
  setTimeout(() => title.focus(), 0);
  return form;
}

function renderLogs() {
  if (editingId) return;
  const items = mineLogs().map(l => {
    const li = el('li', 'mn-log');
    const top = el('div', 'mn-log-top');
    const edit = el('button', 'mn-log-edit'); edit.type = 'button'; edit.innerHTML = pencil; edit.title = t('mn.edit'); edit.setAttribute('aria-label', t('mn.editAria'));
    edit.addEventListener('click', () => { editingId = l.id; li.replaceChildren(editForm(l)); li.classList.add('editing'); });
    top.append(el('div', 'mn-log-title', l.title || t('log.default')), el('span', 'mn-log-dur', duration(l.minutes)), edit);
    const meta = el('div', 'mn-log-when');
    const time = el('time', '', fmtWhen(l.at) || relativeTime(l.at));
    if (l.at instanceof Date && !isNaN(l.at)) time.dateTime = l.at.toISOString();
    meta.append(time);
    if (l.pomodoros) meta.append(el('span', 'mn-log-pomo', 'Pomodoro ×' + l.pomodoros));
    li.append(top, meta, el('p', 'mn-log-desc' + (l.description ? '' : ' none'), l.description || t('mn.noDesc')));
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
window.addEventListener('langchange', () => { editingId = null; renderLogs(); say(''); });
