// フレンド機能の画面: 右サイドバーの一覧と、ページの上に重ねて表示するフレンドUI
//   左のレール: 人のマーク = フレンド一覧 / 人+のマーク = フレンド申請
import { startSocial, formatCode, SOCIAL_MESSAGES, LIMITS } from './social.js?v=14';
import { errorMessage } from './auth.js?v=14';

const $ = id => document.getElementById(id);
const LABELS = { online: 'Online', busy: 'Busy', offline: 'Offline' };
const ORDER = { online: 0, busy: 1, offline: 2 };
const ICONS = {
  pencil: '<svg viewBox="0 0 24 24"><path d="M4 20l1-4L16.5 4.5a2 2 0 0 1 3 3L8 19z"/><path d="M14.5 6.5l3 3"/></svg>',
  trash: '<svg viewBox="0 0 24 24"><path d="M4 7h16M10 11v6M14 11v6M6 7l1 13h10l1-13M9 7V4h6v3"/></svg>',
  check: '<svg viewBox="0 0 24 24"><path d="M5 12.5l4.5 4.5L19 7"/></svg>',
  cross: '<svg viewBox="0 0 24 24"><path d="M6 6l12 12M18 6L6 18"/></svg>',
};

// 表示名・自己紹介は利用者が入力した文字列なので、必ず textContent で表示する
function el(tag, className, text) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text != null) node.textContent = text;
  return node;
}
function iconButton(kind, label, className, onClick) {
  const b = el('button', `fo-ic ${className}`);
  b.type = 'button';
  b.setAttribute('aria-label', label);
  b.title = label;
  b.innerHTML = ICONS[kind]; // 固定のSVG文字列のみ
  b.addEventListener('click', onClick);
  return b;
}
function textButton(label, className, onClick) {
  const b = el('button', className, label);
  b.type = 'button';
  b.addEventListener('click', onClick);
  return b;
}
import { PHOTO_PATTERN } from './avatar-image.js?v=14';
function avatar(id, name, status, photo) {
  let h = 0;
  for (const ch of id) h = (h * 31 + ch.charCodeAt(0)) % 360;
  const a = el('span', 'fo-avatar', [...name][0]?.toUpperCase() || '?');
  a.style.background = `linear-gradient(160deg, hsl(${h} 55% 84%), hsl(${(h + 30) % 360} 40% 55%))`;
  if (photo && PHOTO_PATTERN.test(photo)) { // 画像があれば頭文字の代わりに表示(形式を確認してから CSS に渡す)
    a.textContent = '';
    a.style.backgroundImage = `url("${photo}")`;
    a.classList.add('has-photo');
  }
  if (status) a.append(el('span', `dot ${status}`));
  return a;
}
const pad = n => String(n).padStart(2, '0');
function lastSeen(p) {
  if (!p?.changed) return '最終ログイン: -';
  const d = new Date(p.changed);
  return `最終ログイン: ${d.getFullYear()}/${pad(d.getMonth() + 1)}/${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

let api, last, view = 'friends';
const listeners = [];
export const onState = fn => { listeners.push(fn); if (last) fn(last); };
const overlay = $('friend-overlay');
const statusOf = (s, id) => s.presence[id]?.state || 'offline';
const profile = (s, id) => s.profiles[id] || { name: '…', description: '' };

// ---- 共通: 操作の実行とエラー表示 ----
const attempt = async (task, show) => {
  try { await task(); return true; }
  catch (e) { show(SOCIAL_MESSAGES[e.code] || errorMessage(e)); return false; }
};

// ---- 編集ダイアログ(プロフィール / フレンドのメモ) ----
const ed = { form: $('ed-form'), msg: $('ed-msg') };
let editSubmit;
function openEdit({ title, note, fields, onSave }) {
  $('ed-title').textContent = title;
  $('ed-note').textContent = note || '';
  $('ed-note').hidden = !note;
  ed.msg.hidden = true;
  $('ed-fields').replaceChildren(...fields.map(fl => {
    const label = el('label', 'ed-field');
    label.append(el('span', 'fm-label', fl.label));
    const input = el('input');
    input.name = fl.name; input.value = fl.value; input.maxLength = fl.max; input.placeholder = fl.placeholder || '';
    label.append(input);
    return label;
  }));
  editSubmit = onSave;
  $('ed').hidden = false;
  $('ed-fields').querySelector('input').focus();
}
const closeEdit = () => { $('ed').hidden = true; };
ed.form.addEventListener('submit', async e => {
  e.preventDefault();
  const values = Object.fromEntries(new FormData(ed.form));
  const ok = await attempt(() => editSubmit(values), t => { ed.msg.textContent = t; ed.msg.hidden = false; });
  if (ok) closeEdit();
});
$('ed-cancel').addEventListener('click', closeEdit);
$('ed').addEventListener('click', e => { if (e.target === $('ed')) closeEdit(); });

// 自分のプロフィール編集(フレンドUIとプロフィール画面で共通)
export function editMyProfile() {
  const me = last.me;
  openEdit({
    title: 'プロフィールを編集',
    fields: [
      { name: 'displayName', label: 'ユーザー名', value: me.displayName, max: LIMITS.name },
      { name: 'description', label: '自己紹介(フレンドに表示されます)', value: me.description, max: LIMITS.description, placeholder: 'ひとこと' },
    ],
    onSave: v => api.actions.saveProfile(v),
  });
}

// ---- フレンド一覧(人のマーク) ----
function friendsView(s) {
  // 上部: 自分のプロフィールとステータス
  const bar = el('div', 'fo-me');
  const who = el('div', 'fo-me-who');
  who.append(avatar('me' + s.me.friendCode, s.me.displayName, s.myStatus, s.me.photo), (() => {
    const t = el('div', 'fo-me-text');
    t.append(el('div', 'fo-me-name', s.me.displayName), el('div', 'fo-desc', s.me.description || '自己紹介はまだありません'));
    return t;
  })());
  const seg = el('div', 'seg');
  seg.setAttribute('role', 'group'); seg.setAttribute('aria-label', 'ステータス');
  for (const key of ['online', 'busy']) {
    const b = el('button', key === s.myStatus ? 'is-on' : '');
    b.type = 'button'; b.setAttribute('aria-pressed', String(key === s.myStatus));
    b.append(el('span', `dot ${key}`), LABELS[key]);
    b.addEventListener('click', () => attempt(() => api.actions.setStatus(key), () => {}));
    seg.append(b);
  }
  bar.append(who, seg, iconButton('pencil', 'プロフィールを編集', 'neutral', editMyProfile));

  const friends = [...s.friends].sort((a, b) =>
    ORDER[statusOf(s, a.uid)] - ORDER[statusOf(s, b.uid)] || profile(s, a.uid).name.localeCompare(profile(s, b.uid).name));
  const cards = friends.map(fr => {
    const p = profile(s, fr.uid), st = statusOf(s, fr.uid), memo = s.memos[fr.uid];
    const card = el('article', 'fo-card');
    const info = el('div', 'fo-info');
    info.append(el('div', 'fo-name', p.name), el('div', 'fo-desc', p.description || '自己紹介はまだありません'));
    if (memo) info.append(el('div', 'fo-memo', `メモ: ${memo}`));
    const side = el('div', 'fo-side');
    const btns = el('div', 'fo-btns');
    const del = iconButton('trash', 'フレンドを削除', 'danger', () => {
      if (fr.confirming) return attempt(() => api.actions.remove(fr), () => {});
      fr.confirming = true;
      del.classList.add('confirm'); del.title = 'もう一度押すと削除します';
      setTimeout(() => { fr.confirming = false; del.classList.remove('confirm'); del.title = 'フレンドを削除'; }, 3000);
    });
    btns.append(iconButton('pencil', 'メモを編集', 'neutral', () => openEdit({
      title: `${p.name} さんのメモ`,
      note: 'このメモは自分だけに表示されます。',
      fields: [{ name: 'memo', label: 'メモ', value: memo || '', max: LIMITS.memo, placeholder: 'この人についてのメモ' }],
      onSave: v => api.actions.saveMemo(fr.uid, v.memo),
    })), del);
    side.append(btns, el('div', 'fo-seen', lastSeen(s.presence[fr.uid])));
    card.append(avatar(fr.uid, p.name, st, p.photo), info, side);
    return card;
  });
  return { bar, cards: cards.length ? cards : [el('p', 'fo-empty', 'まだフレンドがいません。左の「人+」のマークから、フレンドコードで申請できます。')] };
}

// ---- フレンド申請(人+のマーク) ----
const addState = { msg: '', ok: false };
function requestsView(s) {
  const bar = el('div', 'fo-add');
  const code = el('div', 'fo-code');
  code.append(el('span', 'fm-label', 'あなたのフレンドコード'), el('code', null, formatCode(s.me.friendCode)),
    textButton('コピー', 'fm-btn', async () => {
      try { await navigator.clipboard.writeText(formatCode(s.me.friendCode)); setMsg('フレンドコードをコピーしました。', true); }
      catch (_) { setMsg('コピーできませんでした。コードを選択してコピーしてください。'); }
    }));
  const form = el('form', 'fm-add');
  form.noValidate = true;
  const input = el('input');
  input.type = 'text'; input.id = 'fm-code-input'; input.maxLength = 12; input.autocomplete = 'off'; input.spellcheck = false;
  input.placeholder = '相手のフレンドコード (XXXX-XXXX)'; input.setAttribute('aria-label', '相手のフレンドコード');
  const submit = textButton('申請する', 'fm-btn primary', () => {}); submit.type = 'submit';
  form.append(input, submit);
  form.addEventListener('submit', async e => {
    e.preventDefault();
    await attempt(async () => {
      const name = await api.actions.sendRequest(input.value);
      input.value = '';
      setMsg(`${name} さんにフレンド申請を送りました。`, true);
    }, t => setMsg(t));
  });
  const msg = el('p', 'fm-msg'); msg.id = 'fm-msg'; msg.setAttribute('role', 'status');
  msg.hidden = !addState.msg; msg.textContent = addState.msg; msg.classList.toggle('ok', addState.ok);
  bar.append(code, form, msg);

  const cards = s.incoming.map(q => {
    const p = profile(s, q.uid);
    const card = el('article', 'fo-card request');
    const info = el('div', 'fo-info');
    info.append(el('div', 'fo-name', p.name), el('div', 'fo-desc', p.description || '自己紹介はまだありません'));
    const btns = el('div', 'fo-btns');
    btns.append(
      iconButton('check', '承認', 'ok', () => attempt(() => api.actions.accept(q), setMsg)),
      iconButton('cross', '拒否', 'danger', () => attempt(() => api.actions.decline(q), setMsg)));
    card.append(avatar(q.uid, p.name, undefined, p.photo), el('span', 'fo-div'), info, el('span', 'fo-div'), btns);
    return card;
  });
  if (!cards.length) cards.push(el('p', 'fo-empty', '届いているフレンド申請はありません。'));
  if (s.outgoing.length) {
    cards.push(el('h3', 'fo-sub', '送信した申請(承認待ち)'));
    for (const q of s.outgoing) {
      const p = profile(s, q.uid);
      const card = el('article', 'fo-card request pending');
      const info = el('div', 'fo-info');
      info.append(el('div', 'fo-name', p.name), el('div', 'fo-desc', p.description || '自己紹介はまだありません'));
      card.append(avatar(q.uid, p.name, undefined, p.photo), el('span', 'fo-div'), info, el('span', 'fo-div'),
        iconButton('cross', '申請を取り消す', 'danger', () => attempt(() => api.actions.cancel(q), setMsg)));
      cards.push(card);
    }
  }
  return { bar, cards };
}
function setMsg(text, ok) {
  addState.msg = text; addState.ok = !!ok;
  const m = $('fm-msg');
  if (m) { m.textContent = text; m.hidden = false; m.classList.toggle('ok', !!ok); }
}

// ---- 描画 ----
function render(state) {
  last = state;
  listeners.forEach(fn => fn(state));
  // サイドバー: 実際のオンライン状態
  const friends = [...state.friends].sort((a, b) =>
    ORDER[statusOf(state, a.uid)] - ORDER[statusOf(state, b.uid)] || profile(state, a.uid).name.localeCompare(profile(state, b.uid).name));
  $('friend-list').replaceChildren(...(friends.length ? friends.map(fr => {
    const li = el('li', 'fm-row');
    const info = el('div', 'fm-info');
    const stLine = el('div', 'state');
    stLine.append(el('span', `dot ${statusOf(state, fr.uid)}`), LABELS[statusOf(state, fr.uid)]);
    info.append(el('div', 'name', profile(state, fr.uid).name), stLine);
    const small = avatar(fr.uid, profile(state, fr.uid).name, undefined, profile(state, fr.uid).photo);
    small.classList.add('sm');
    li.append(small, info);
    return li;
  }) : [el('li', 'fm-empty', 'まだフレンドがいません。上の Friend から追加できます。')]));

  // 申請バッジ(ヘッダーと左レール)
  for (const id of ['friend-badge', 'rail-badge']) {
    $(id).textContent = String(state.incoming.length);
    $(id).hidden = state.incoming.length === 0;
  }

  if (overlay.hidden) return;
  // 入力中のテキストや位置を保ったまま描き直す
  const typed = document.activeElement?.id === 'fm-code-input' ? { v: document.activeElement.value, pos: document.activeElement.selectionStart } : null;
  const { bar, cards } = view === 'friends' ? friendsView(state) : requestsView(state);
  $('fo-bar').replaceChildren(bar);
  $('fo-list').replaceChildren(...cards);
  if (typed) { const i = $('fm-code-input'); i.value = typed.v; i.focus(); i.setSelectionRange(typed.pos, typed.pos); }
  document.querySelectorAll('.fo-tab').forEach(t => {
    const on = t.dataset.view === view;
    t.classList.toggle('is-on', on);
    t.setAttribute('aria-pressed', String(on));
  });
}

// ---- 開閉 ----
let opener;
const friendNav = document.querySelector('[data-target="friend"]');
function open(next) {
  opener = document.activeElement;
  view = next || view;
  overlay.hidden = false;
  document.body.classList.add('fo-open');
  friendNav.classList.add('is-open');
  render(last);
  $('fo-main').focus({ preventScroll: true });
}
function close() {
  overlay.hidden = true;
  document.body.classList.remove('fo-open');
  friendNav.classList.remove('is-open');
  opener?.focus?.();
}
friendNav.addEventListener('click', () => (overlay.hidden ? open() : close()));
overlay.addEventListener('click', e => { if (e.target === overlay) close(); }); // パネルの外側をクリックで閉じる
$('fo-close').addEventListener('click', close);
document.addEventListener('keydown', e => {
  if (e.key !== 'Escape') return;
  if (!$('ed').hidden) closeEdit(); else if (!overlay.hidden) close();
});
document.querySelectorAll('.fo-tab').forEach(t => t.addEventListener('click', () => { view = t.dataset.view; render(last); }));

export async function mountFriends(user) {
  api = await startSocial(user, render);
  return api;
}

export { avatar as makeAvatar };
