// フレンド機能のデータ層: プロフィール・フレンドコード・申請・フレンド(Firestore)と、オンライン状態(Realtime Database)
import { firestore, realtime } from './auth.js?v=8';

const ALPHABET = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789'; // 0/O, 1/I/L など紛らわしい文字を除く
const genCode = () => Array.from(crypto.getRandomValues(new Uint8Array(8)), b => ALPHABET[b % ALPHABET.length]).join('');
export const formatCode = c => `${c.slice(0, 4)}-${c.slice(4)}`;
export const normalizeCode = s => s.toUpperCase().replace(/[^A-Z0-9]/g, '');
const pairId = (a, b) => [a, b].sort().join('_');
const STATUS_KEY = 'myStatus';
const fail = code => Object.assign(new Error(code), { code });

export const SOCIAL_MESSAGES = {
  'bad-code': 'フレンドコードは8文字で入力してください。',
  'not-found': 'そのフレンドコードのユーザーが見つかりません。',
  self: '自分自身にはフレンド申請できません。',
  'already-friends': 'すでにフレンドです。',
  'already-sent': 'すでに申請を送っています。',
  'incoming-exists': '相手から申請が届いています。「届いた申請」から承認してください。',
};

export async function startSocial(user, render) {
  const [{ m: f, db }, { m: r, db: rtdb }] = await Promise.all([firestore(), realtime()]);
  const uid = user.uid;
  const state = { me: null, friends: [], incoming: [], outgoing: [], presence: {}, myStatus: 'online' };
  try { if (localStorage.getItem(STATUS_KEY) === 'busy') state.myStatus = 'busy'; } catch (_) { /* 保存できなくても動く */ }
  const notify = () => render(state);

  // ---- ユーザー名の取得(キャッシュ) ----
  const names = new Map();
  async function nameOf(id) {
    if (!names.has(id)) {
      try {
        const s = await f.getDoc(f.doc(db, 'users', id));
        names.set(id, s.exists() ? s.data().displayName : '(不明なユーザー)');
      } catch (_) { names.set(id, '(不明なユーザー)'); }
    }
    return names.get(id);
  }

  // ---- プロフィールとフレンドコード(初回ログイン時に作成。Googleなら Google の名前が初期値) ----
  async function ensureProfile() {
    const ref = f.doc(db, 'users', uid);
    const snap = await f.getDoc(ref);
    if (snap.exists()) return snap.data();
    const displayName = (user.displayName || (user.email || '').split('@')[0] || 'User').trim().slice(0, 20) || 'User';
    for (let i = 0; i < 5; i++) {
      const code = genCode();
      const batch = f.writeBatch(db);
      batch.set(f.doc(db, 'friendCodes', code), { uid });
      batch.set(ref, { displayName, friendCode: code, createdAt: f.serverTimestamp() });
      try { await batch.commit(); return { displayName, friendCode: code }; }
      catch (e) { if (e.code !== 'permission-denied' || i === 4) throw e; /* コードが重複したら作り直す */ }
    }
  }
  state.me = await ensureProfile();
  names.set(uid, state.me.displayName);

  // ---- オンライン状態(接続が切れると自動でオフラインになる) ----
  const myRef = r.ref(rtdb, `status/${uid}`);
  const stamp = () => r.serverTimestamp();
  const unsubConn = r.onValue(r.ref(rtdb, '.info/connected'), snap => {
    if (!snap.val()) return;
    r.onDisconnect(myRef).set({ state: 'offline', changed: stamp() })
      .then(() => r.set(myRef, { state: state.myStatus, changed: stamp() }));
  });

  // ---- フレンドのオンライン状態を購読 ----
  const watchers = new Map();
  function syncWatchers() {
    const ids = new Set(state.friends.map(x => x.uid));
    for (const [id, off] of watchers) if (!ids.has(id)) { off(); watchers.delete(id); delete state.presence[id]; }
    for (const id of ids) {
      if (watchers.has(id)) continue;
      watchers.set(id, r.onValue(r.ref(rtdb, `status/${id}`), s => {
        state.presence[id] = s.val()?.state || 'offline';
        notify();
      }));
    }
  }

  // ---- Firestore のリアルタイム購読 ----
  const unsubs = [];
  unsubs.push(f.onSnapshot(f.query(f.collection(db, 'friendships'), f.where('members', 'array-contains', uid)), async snap => {
    const list = await Promise.all(snap.docs.map(async d => {
      const other = d.data().members.find(x => x !== uid);
      return { uid: other, name: await nameOf(other), pair: d.id };
    }));
    state.friends = list.sort((a, b) => a.name.localeCompare(b.name));
    syncWatchers();
    notify();
  }));
  unsubs.push(f.onSnapshot(f.query(f.collection(db, 'friendRequests'), f.where('to', '==', uid)), async snap => {
    state.incoming = await Promise.all(snap.docs.map(async d => ({ id: d.id, uid: d.data().from, name: await nameOf(d.data().from) })));
    notify();
  }));
  unsubs.push(f.onSnapshot(f.query(f.collection(db, 'friendRequests'), f.where('from', '==', uid)), async snap => {
    state.outgoing = await Promise.all(snap.docs.map(async d => ({ id: d.id, uid: d.data().to, name: await nameOf(d.data().to) })));
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
      return nameOf(other);
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
    async setStatus(next) {
      state.myStatus = next;
      try { localStorage.setItem(STATUS_KEY, next); } catch (_) { /* 無視 */ }
      await r.set(myRef, { state: next, changed: stamp() });
      notify();
    },
    // ログアウト時: すぐにオフラインにして、購読をすべて止める
    async stop() {
      unsubs.forEach(u => u());
      watchers.forEach(off => off());
      unsubConn();
      try { await r.onDisconnect(myRef).cancel(); await r.set(myRef, { state: 'offline', changed: stamp() }); } catch (_) { /* 切断時の自動処理に任せる */ }
    },
  };
  notify();
  return { state, actions };
}
