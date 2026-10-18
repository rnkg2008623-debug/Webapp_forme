// フレンド機能のデータ層: プロフィール・フレンドコード・申請・フレンド(Firestore)と、オンライン状態(Realtime Database)
import { firestore, realtime } from './auth.js?v=12';

const ALPHABET = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789'; // 0/O, 1/I/L など紛らわしい文字を除く
const genCode = () => Array.from(crypto.getRandomValues(new Uint8Array(8)), b => ALPHABET[b % ALPHABET.length]).join('');
export const formatCode = c => `${c.slice(0, 4)}-${c.slice(4)}`;
export const normalizeCode = s => s.toUpperCase().replace(/[^A-Z0-9]/g, '');
const pairId = (a, b) => [a, b].sort().join('_');
const STATUS_KEY = 'myStatus';
const fail = code => Object.assign(new Error(code), { code });
export const LIMITS = { name: 20, description: 60, memo: 60 };

export const SOCIAL_MESSAGES = {
  'bad-code': 'フレンドコードは8文字で入力してください。',
  'not-found': 'そのフレンドコードのユーザーが見つかりません。',
  self: '自分自身にはフレンド申請できません。',
  'already-friends': 'すでにフレンドです。',
  'already-sent': 'すでに申請を送っています。',
  'incoming-exists': '相手から申請が届いています。申請の一覧から承認してください。',
  'empty-name': 'ユーザー名を入力してください。',
};

export async function startSocial(user, render) {
  const [{ m: f, db }, { m: r, db: rtdb }] = await Promise.all([firestore(), realtime()]);
  const uid = user.uid;
  const state = {
    me: null, friends: [], incoming: [], outgoing: [],
    profiles: {},   // uid -> { name, description }(フレンド・申請相手の公開プロフィール)
    memos: {},      // friendUid -> 自分だけに見えるメモ
    presence: {},   // uid -> { state, changed }
    myStatus: 'online',
  };
  try { if (localStorage.getItem(STATUS_KEY) === 'busy') state.myStatus = 'busy'; } catch (_) { /* 保存できなくても動く */ }
  const notify = () => render(state);

  // ---- プロフィール ----
  async function ensureProfile() {
    const ref = f.doc(db, 'users', uid);
    const snap = await f.getDoc(ref);
    if (snap.exists()) return snap.data();
    const displayName = (user.displayName || (user.email || '').split('@')[0] || 'User').trim().slice(0, LIMITS.name) || 'User';
    for (let i = 0; i < 5; i++) {
      const code = genCode();
      const batch = f.writeBatch(db);
      batch.set(f.doc(db, 'friendCodes', code), { uid });
      batch.set(ref, { displayName, friendCode: code, createdAt: f.serverTimestamp() });
      try { await batch.commit(); return { displayName, friendCode: code }; }
      catch (e) { if (e.code !== 'permission-denied' || i === 4) throw e; /* コードが重複したら作り直す */ }
    }
  }
  const mine = await ensureProfile();
  state.me = { displayName: mine.displayName, description: mine.description || '', friendCode: mine.friendCode };

  // 相手のプロフィールは、変更がすぐ反映されるよう購読しておく
  const profileSubs = new Map();
  function watchProfile(id) {
    if (profileSubs.has(id)) return;
    profileSubs.set(id, f.onSnapshot(f.doc(db, 'users', id), s => {
      const d = s.exists() ? s.data() : null;
      state.profiles[id] = { name: d?.displayName ?? '(不明なユーザー)', description: d?.description ?? '' };
      notify();
    }, () => { state.profiles[id] = { name: '(不明なユーザー)', description: '' }; notify(); }));
  }

  // ---- オンライン状態(接続が切れると自動でオフラインになる) ----
  const myRef = r.ref(rtdb, `status/${uid}`);
  const stamp = () => r.serverTimestamp();
  const unsubConn = r.onValue(r.ref(rtdb, '.info/connected'), snap => {
    if (!snap.val()) return;
    r.onDisconnect(myRef).set({ state: 'offline', changed: stamp() })
      .then(() => r.set(myRef, { state: state.myStatus, changed: stamp() }));
  });
  const watchers = new Map();
  function syncWatchers() {
    const ids = new Set(state.friends.map(x => x.uid));
    for (const [id, off] of watchers) if (!ids.has(id)) { off(); watchers.delete(id); delete state.presence[id]; }
    for (const id of ids) {
      if (watchers.has(id)) continue;
      watchers.set(id, r.onValue(r.ref(rtdb, `status/${id}`), s => {
        const v = s.val();
        state.presence[id] = { state: v?.state || 'offline', changed: v?.changed || null };
        notify();
      }));
    }
  }

  // ---- Firestore のリアルタイム購読 ----
  const unsubs = [];
  unsubs.push(f.onSnapshot(f.query(f.collection(db, 'friendships'), f.where('members', 'array-contains', uid)), snap => {
    state.friends = snap.docs.map(d => ({ uid: d.data().members.find(x => x !== uid), pair: d.id }));
    state.friends.forEach(x => watchProfile(x.uid));
    syncWatchers();
    notify();
  }));
  unsubs.push(f.onSnapshot(f.query(f.collection(db, 'friendRequests'), f.where('to', '==', uid)), snap => {
    state.incoming = snap.docs.map(d => ({ id: d.id, uid: d.data().from }));
    state.incoming.forEach(x => watchProfile(x.uid));
    notify();
  }));
  unsubs.push(f.onSnapshot(f.query(f.collection(db, 'friendRequests'), f.where('from', '==', uid)), snap => {
    state.outgoing = snap.docs.map(d => ({ id: d.id, uid: d.data().to }));
    state.outgoing.forEach(x => watchProfile(x.uid));
    notify();
  }));
  unsubs.push(f.onSnapshot(f.collection(db, 'users', uid, 'memos'), snap => {
    state.memos = Object.fromEntries(snap.docs.map(d => [d.id, d.data().text]));
    notify();
  }));

  const actions = {
    async sendRequest(raw) {
      const code = normalizeCode(raw);
      if (code.length !== 8) throw fail('bad-code');
      const c = await f.getDoc(f.doc(db, 'friendCodes', code));
      if (!c.exists()) throw fail('not-found');
      const other = c.data().uid;
      if (other === uid) throw fail('self');
      if (state.friends.some(x => x.uid === other)) throw fail('already-friends');
      if (state.outgoing.some(x => x.uid === other)) throw fail('already-sent');
      if (state.incoming.some(x => x.uid === other)) throw fail('incoming-exists');
      await f.setDoc(f.doc(db, 'friendRequests', `${uid}_${other}`), { from: uid, to: other, status: 'pending', createdAt: f.serverTimestamp() });
      const p = await f.getDoc(f.doc(db, 'users', other));
      return p.exists() ? p.data().displayName : 'ユーザー';
    },
    async accept(req) {
      const batch = f.writeBatch(db);
      batch.set(f.doc(db, 'friendships', pairId(uid, req.uid)), { members: [uid, req.uid].sort(), since: f.serverTimestamp() });
      batch.delete(f.doc(db, 'friendRequests', req.id));
      batch.delete(f.doc(db, 'friendRequests', `${uid}_${req.uid}`)); // 同時に送り合っていた場合の片方
      await batch.commit();
    },
    decline: req => f.deleteDoc(f.doc(db, 'friendRequests', req.id)),
    cancel: req => f.deleteDoc(f.doc(db, 'friendRequests', req.id)),
    remove: friend => f.deleteDoc(f.doc(db, 'friendships', friend.pair)),
    async saveProfile({ displayName, description }) {
      displayName = displayName.trim();
      description = description.trim();
      if (!displayName) throw fail('empty-name');
      await f.updateDoc(f.doc(db, 'users', uid), { displayName, description });
      state.me = { ...state.me, displayName, description };
      notify();
    },
    async saveMemo(friendUid, text) {
      const ref = f.doc(db, 'users', uid, 'memos', friendUid);
      text = text.trim();
      if (text) await f.setDoc(ref, { text });
      else await f.deleteDoc(ref);
    },
    async setStatus(next) {
      state.myStatus = next;
      try { localStorage.setItem(STATUS_KEY, next); } catch (_) { /* 無視 */ }
      await r.set(myRef, { state: next, changed: stamp() });
      notify();
    },
    // ログアウト時: すぐにオフラインにして、購読をすべて止める
    async stop() {
      unsubs.forEach(u => u());
      profileSubs.forEach(u => u());
      watchers.forEach(off => off());
      unsubConn();
      try { await r.onDisconnect(myRef).cancel(); await r.set(myRef, { state: 'offline', changed: stamp() }); } catch (_) { /* 切断時の自動処理に任せる */ }
    },
  };
  notify();
  return { state, actions };
}
