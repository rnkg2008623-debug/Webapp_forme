// お知らせ: オーナーのアカウントが出したお知らせを、全アカウントが受け取る。
// ヘッダーの Notice を押すと、フレンドと同じように、ページの上に画面が重なって出る(ページは変わらない)。
// オーナーのアカウントには、お知らせを「出す」タブ(タイトルと内容を入力)も出る。
import { firestore } from './auth.js?v=79';
import { t, getLang } from './i18n.js?v=79';
import { makeAvatar } from './friends-ui.js?v=79';

const OWNER = 'hireo559@gmail.com';   // firestore.rules の isOwner() と同じメールアドレス
const $ = id => document.getElementById(id);
const LOCALES = { ja: 'ja-JP', en: 'en-GB', zh: 'zh-CN' };

let f, db, user, isOwner = false;
let items = [];
let denied = false, loaded = false;
let view = 'list';
let fresh = new Set();    // 画面を開いたとき、まだ見ていなかったお知らせ(NEW 表示)
let opener;

const fmt = d => (d instanceof Date && !isNaN(d)
  ? new Intl.DateTimeFormat(LOCALES[getLang()] || 'en-GB', { year: 'numeric', month: 'short', day: 'numeric', weekday: 'short', hour: '2-digit', minute: '2-digit' }).format(d)
  : '');
function el(tag, className, text) {
  const n = document.createElement(tag);
  if (className) n.className = className;
  if (text != null) n.textContent = text;
  return n;
}

// ---- 既読(ブラウザごと・アカウントごとに、どの時刻まで見たかを覚える) ----
const seenKey = () => `noticeSeen:${user.uid}`;
const getSeen = () => { try { return Number(localStorage.getItem(seenKey())) || 0; } catch { return 0; } };
const setSeen = ms => { try { localStorage.setItem(seenKey(), String(ms)); } catch { /* 無視 */ } };
const unread = () => items.filter(n => n.at && n.at.getTime() > getSeen());
function markSeen() {
  const newest = items.reduce((m, n) => Math.max(m, n.at ? n.at.getTime() : 0), 0);
  if (newest > getSeen()) setSeen(newest);
  badge();
}
function badge() {
  const b = $('notice-badge');
  const n = overlay().hidden ? unread().length : 0;
  b.textContent = n > 9 ? '9+' : String(n);
  b.hidden = n === 0;
}

const overlay = () => $('notice-overlay');

// ---- 描画 ----
function render() {
  const list = $('no-list');
  $('no-h').textContent = view === 'compose' ? t('no.composeTitle') : view === 'board' ? t('bd.title') : t('no.title');
  list.hidden = view !== 'list';
  $('no-form').hidden = view !== 'compose';
  $('no-board').hidden = view !== 'board';
  if (view === 'board') renderBoard();
  document.querySelectorAll('[data-nview]').forEach(b => { const on = b.dataset.nview === view; b.classList.toggle('is-on', on); b.setAttribute('aria-pressed', String(on)); });
  if (view !== 'list') return;
  if (denied) { list.replaceChildren(el('p', 'fm-msg', t('no.denied'))); return; }
  if (!loaded) { list.replaceChildren(el('p', 'no-empty', t('no.loading'))); return; }
  if (!items.length) { list.replaceChildren(el('p', 'no-empty', t('no.empty'))); return; }
  list.replaceChildren(...items.map(n => {
    const card = el('article', 'no-item' + (fresh.has(n.id) ? ' is-new' : ''));
    const head = el('div', 'no-item-head');
    head.append(el('h3', 'no-item-title', n.title));
    if (fresh.has(n.id)) head.append(el('span', 'no-new', t('no.new')));
    const time = el('time', 'no-item-time', fmt(n.at));
    if (n.at) time.dateTime = n.at.toISOString();
    card.append(head, time, el('p', 'no-item-body', n.body));
    if (isOwner) {
      const del = el('button', 'no-del', t('no.del')); del.type = 'button';
      del.addEventListener('click', async () => {
        if (!confirm(t('no.confirmDel'))) return;
        del.disabled = true;
        try { await f.deleteDoc(f.doc(db, 'announcements', n.id)); }
        catch (e) { console.error(e); del.disabled = false; alert(t('no.delFail')); }
      });
      card.append(del);
    }
    return card;
  }));
}

// ---- 開閉 ----
const nav = () => document.querySelector('[data-target="notice"]');
function open() {
  window.dispatchEvent(new CustomEvent('overlay-open', { detail: 'notice' }));
  opener = document.activeElement;
  fresh = new Set(unread().map(n => n.id));
  view = 'list';
  overlay().hidden = false;
  nav().classList.add('is-open');
  render();
  markSeen();
  $('no-main').focus({ preventScroll: true });
}
function close() {
  stopBoard();
  overlay().hidden = true;
  nav().classList.remove('is-open');
  fresh = new Set();
  badge();
  opener?.focus?.();
}

// ---- 出す(オーナーのみ) ----
function say(text, ok) { const m = $('no-msg'); m.textContent = text; m.classList.toggle('ok', !!ok); m.hidden = !text; }
function wireCompose() {
  const title = $('no-title'), body = $('no-body');
  const count = () => { $('no-count').textContent = `${body.value.length} / 2000`; };
  body.addEventListener('input', () => { count(); say(''); });
  title.addEventListener('input', () => say(''));
  $('no-form').addEventListener('submit', async e => {
    e.preventDefault();
    const ti = title.value.trim(), bo = body.value.trim();
    if (!ti) { say(t('no.needTitle')); title.focus(); return; }
    if (!bo) { say(t('no.needBody')); body.focus(); return; }
    const send = $('no-send'); send.disabled = true;
    try {
      await f.addDoc(f.collection(db, 'announcements'), { title: ti, body: bo, at: f.serverTimestamp() });
      title.value = ''; body.value = ''; count(); say('');
      view = 'list'; render();
    } catch (err) { console.error(err); say(t('no.fail')); }
    finally { send.disabled = false; }
  });
}

export async function mountNotices(currentUser) {
  user = currentUser;
  isOwner = (user.email || '').toLowerCase() === OWNER;
  document.querySelectorAll('[data-owner-only]').forEach(b => { b.hidden = !isOwner; });
  wireBoard();
  overlay().classList.toggle('no-owner', isOwner);
  nav().addEventListener('click', () => (overlay().hidden ? open() : close()));
  overlay().addEventListener('click', e => { if (e.target === overlay()) close(); });
  $('no-close').addEventListener('click', close);
  document.addEventListener('keydown', e => { if (e.key === 'Escape' && !overlay().hidden && $('ed')?.hidden !== false) close(); });
  document.querySelectorAll('[data-nview]').forEach(b => b.addEventListener('click', () => { view = b.dataset.nview; if (view === 'board') startBoard(); render(); if (view === 'compose') $('no-title').focus(); if (view === 'board') $('bd-text').focus(); }));
  window.addEventListener('overlay-open', e => { if (e.detail !== 'notice' && !overlay().hidden) close(); });
  window.addEventListener('langchange', () => { render(); });
  if (isOwner) wireCompose();
  ({ m: f, db } = await firestore());
  f.onSnapshot(
    f.query(f.collection(db, 'announcements'), f.orderBy('at', 'desc'), f.limit(100)),
    snap => {
      items = snap.docs.map(d => { const x = d.data({ serverTimestamps: 'estimate' }); return { id: d.id, title: x.title || '', body: x.body || '', at: x.at?.toDate?.() }; });
      loaded = true; denied = false;
      if (!overlay().hidden) { for (const n of unread()) fresh.add(n.id); render(); markSeen(); } else badge();
    },
    err => { console.warn('お知らせを読み込めませんでした', err.code); denied = true; loaded = true; if (!overlay().hidden) render(); });
}

// ---- みんなの今日(誰でも、今日やったことを書いて、みんなに見せられる) ----
let posts = [], postsLoaded = false, postsDenied = false, offPosts = null, myName = '';
function startBoard() {
  if (offPosts || !db) return;
  postsLoaded = false; postsDenied = false;
  offPosts = f.onSnapshot(
    f.query(f.collection(db, 'dailyPosts'), f.orderBy('at', 'desc'), f.limit(100)),
    snap => { posts = snap.docs.map(d => { const x = d.data({ serverTimestamps: 'estimate' }); return { id: d.id, uid: x.uid, name: x.name || '?', text: x.text || '', at: x.at?.toDate?.() }; }); postsLoaded = true; postsDenied = false; if (view === 'board' && !overlay().hidden) renderBoard(); },
    err => { console.warn('みんなの今日を読み込めませんでした', err.code); postsDenied = true; postsLoaded = true; if (view === 'board') renderBoard(); });
}
function stopBoard() { if (offPosts) { offPosts(); offPosts = null; } }
const sameDay = (a, b) => a && b && a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
function renderBoard() {
  const list = $('bd-list');
  if (postsDenied) { list.replaceChildren(el('p', 'fm-msg', t('bd.denied'))); return; }
  if (!postsLoaded) { list.replaceChildren(el('p', 'no-empty', t('no.loading'))); return; }
  if (!posts.length) { list.replaceChildren(el('p', 'no-empty', t('bd.empty'))); return; }
  const now = new Date();
  list.replaceChildren(...posts.map(pst => {
    const mine = pst.uid === user.uid;
    const card = el('article', 'bd-post' + (mine ? ' mine' : ''));
    const av = makeAvatar(pst.uid, pst.name, '', ''); av.classList.add('bd-av');
    const head = el('div', 'bd-head'), who = el('b', 'bd-name', mine ? `${pst.name} (${t('bd.you')})` : pst.name);
    const time = el('time', 'bd-time', fmt(pst.at)); if (pst.at) time.dateTime = pst.at.toISOString();
    head.append(who, time);
    if (sameDay(pst.at, now)) head.append(el('span', 'bd-today', t('bd.today')));
    const body = el('div', 'bd-body'); body.append(head, el('p', 'bd-text', pst.text));
    card.append(av, body);
    if (mine || isOwner) {
      const del = el('button', 'no-del', t('bd.del')); del.type = 'button';
      del.addEventListener('click', async () => { if (!confirm(t('bd.confirmDel'))) return; del.disabled = true; try { await f.deleteDoc(f.doc(db, 'dailyPosts', pst.id)); } catch (e) { console.error(e); del.disabled = false; alert(t('bd.delFail')); } });
      card.append(del);
    }
    return card;
  }));
}
function wireBoard() {
  const text = $('bd-text'), msg = $('bd-msg');
  const say2 = s => { msg.textContent = s; msg.hidden = !s; };
  text.addEventListener('input', () => { $('bd-count').textContent = `${text.value.length} / 500`; say2(''); });
  $('bd-form').addEventListener('submit', async e => {
    e.preventDefault();
    const body = text.value.trim();
    if (!body) { say2(t('bd.needText')); text.focus(); return; }
    const send = $('bd-send'); send.disabled = true;
    try {
      if (!myName) { const s = await f.getDoc(f.doc(db, 'users', user.uid)); myName = s.data()?.displayName || user.displayName || 'User'; }
      await f.addDoc(f.collection(db, 'dailyPosts'), { uid: user.uid, name: myName, text: body, at: f.serverTimestamp() });
      text.value = ''; $('bd-count').textContent = '0 / 500'; say2('');
    } catch (err) { console.error(err); say2(t('bd.fail')); } finally { send.disabled = false; }
  });
}
