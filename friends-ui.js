// フレンド機能の画面: 右サイドバーの一覧、Friend ダイアログ、申請バッジ
import { startSocial, formatCode, SOCIAL_MESSAGES } from './social.js?v=7';
import { errorMessage } from './auth.js?v=7';

const $ = id => document.getElementById(id);
const LABELS = { online: 'Online', busy: 'Busy', offline: 'Offline' };
const ORDER = { online: 0, busy: 1, offline: 2 };

// 表示名は利用者が入力した文字列なので、必ず textContent で表示する
function el(tag, className, text) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text != null) node.textContent = text;
  return node;
}
function avatar(id, name) {
  let h = 0;
  for (const ch of id) h = (h * 31 + ch.charCodeAt(0)) % 360;
  const a = el('span', 'avatar', [...name][0]?.toUpperCase() || '?');
  a.style.background = `linear-gradient(160deg, hsl(${h} 60% 80%), hsl(${(h + 30) % 360} 45% 45%))`;
  return a;
}
function stateLine(status) {
  const s = el('div', 'state');
  s.append(el('span', `dot ${status}`), LABELS[status]);
  return s;
}
function button(label, className, onClick) {
  const b = el('button', className, label);
  b.type = 'button';
  b.addEventListener('click', onClick);
  return b;
}
function row(person, status, ...buttons) {
  const li = el('li', 'fm-row');
  const info = el('div', 'fm-info');
  info.append(el('div', 'name', person.name));
  if (status) info.append(stateLine(status));
  li.append(avatar(person.uid, person.name), info, ...buttons);
  return li;
}
function empty(text) { return el('li', 'fm-empty', text); }

let api;
const modal = $('friend-modal');
const msg = $('fm-msg');
function say(text, ok) {
  msg.textContent = text;
  msg.classList.toggle('ok', !!ok);
  msg.hidden = false;
}
const attempt = async task => {
  try { await task(); } catch (e) { say(SOCIAL_MESSAGES[e.code] || errorMessage(e)); }
};

function render(state) {
  const statusOf = id => state.presence[id] || 'offline';
  const sorted = [...state.friends].sort((a, b) => ORDER[statusOf(a.uid)] - ORDER[statusOf(b.uid)] || a.name.localeCompare(b.name));

  // サイドバー
  const side = $('friend-list');
  side.replaceChildren(...(sorted.length
    ? sorted.map(p => row(p, statusOf(p.uid)))
    : [empty('まだフレンドがいません。上の Friend から追加できます。')]));

  // 申請バッジ
  const badge = $('friend-badge');
  badge.textContent = String(state.incoming.length);
  badge.hidden = state.incoming.length === 0;

  // ダイアログ: 自分
  $('fm-name').textContent = state.me.displayName;
  $('fm-code').textContent = formatCode(state.me.friendCode);
  document.querySelectorAll('#status-seg button').forEach(b => {
    const on = b.dataset.s === state.myStatus;
    b.classList.toggle('is-on', on);
    b.setAttribute('aria-pressed', String(on));
  });

  // ダイアログ: 申請とフレンド
  $('fm-incoming').replaceChildren(...(state.incoming.length
    ? state.incoming.map(q => row(q, null,
        button('承認', 'fm-btn primary', () => attempt(() => api.actions.accept(q))),
        button('拒否', 'fm-btn', () => attempt(() => api.actions.decline(q)))))
    : [empty('届いている申請はありません。')]));
  $('fm-outgoing').replaceChildren(...(state.outgoing.length
    ? state.outgoing.map(q => row(q, null, el('span', 'fm-tag', '承認待ち'),
        button('取消', 'fm-btn', () => attempt(() => api.actions.cancel(q)))))
    : [empty('送信中の申請はありません。')]));
  $('fm-friends').replaceChildren(...(sorted.length
    ? sorted.map(p => row(p, statusOf(p.uid), button('削除', 'fm-btn', e => {
        if (p.confirming) return attempt(() => api.actions.remove(p));
        p.confirming = true;
        const b = e.currentTarget;
        b.textContent = '本当に削除';
        b.classList.add('danger');
        setTimeout(() => { p.confirming = false; b.textContent = '削除'; b.classList.remove('danger'); }, 3000);
      })))
    : [empty('フレンドはまだいません。')]));
}

// ---- ダイアログの開閉 ----
let opener;
function open() { opener = document.activeElement; modal.hidden = false; $('fm-code-input').focus(); }
function close() { modal.hidden = true; msg.hidden = true; opener?.focus?.(); }
document.querySelector('[data-target="friend"]').addEventListener('click', open);
$('fm-close').addEventListener('click', close);
modal.addEventListener('click', e => { if (e.target === modal) close(); });
document.addEventListener('keydown', e => { if (e.key === 'Escape' && !modal.hidden) close(); });

// ---- 操作 ----
$('fm-add').addEventListener('submit', e => {
  e.preventDefault();
  const input = $('fm-code-input');
  attempt(async () => {
    const name = await api.actions.sendRequest(input.value);
    input.value = '';
    say(`${name} さんにフレンド申請を送りました。`, true);
  });
});
$('fm-copy').addEventListener('click', async () => {
  try { await navigator.clipboard.writeText($('fm-code').textContent); say('フレンドコードをコピーしました。', true); }
  catch (_) { say('コピーできませんでした。コードを選択してコピーしてください。'); }
});
document.querySelectorAll('#status-seg button').forEach(b =>
  b.addEventListener('click', () => attempt(() => api.actions.setStatus(b.dataset.s))));

export async function mountFriends(user) {
  api = await startSocial(user, render);
  return api;
}
