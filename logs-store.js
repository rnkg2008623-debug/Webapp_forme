// 学習ログの共有ストア: 自分のログと、友だちのログ(ホームの Recent log 用)を購読して、新しい順にまとめる
import { firestore } from './auth.js?v=35';

let f, db, uid;
let mine = [];
const theirs = new Map();   // 友だちの uid -> ログ
const subs = new Map();     // 友だちの uid -> 購読解除
let wanted = [];
const denied = new Set();   // 読み込みを拒否された友だち(ルール未更新のとき)
const listeners = [];
const emit = () => listeners.forEach(fn => fn());

const toLog = (owner, d) => {
  const x = d.data();
  return { id: `${owner}/${d.id}`, owner, title: x.title || '', minutes: x.minutes || 0, pomodoros: x.pomodoros || 0, description: x.description || '', at: x.at?.toDate?.() };
};

export const mineLogs = () => mine;
export const feedLogs = (limit = 100) => [...mine, ...[...theirs.values()].flat()].sort((a, b) => b.at - a.at).slice(0, limit);
export const ownerId = () => uid;
export const deniedCount = () => denied.size;
export function onLogs(fn) { listeners.push(fn); fn(); }

export async function startLogs(user) {
  ({ m: f, db } = await firestore());
  uid = user.uid;
  f.onSnapshot(
    f.query(f.collection(db, 'users', uid, 'logs'), f.orderBy('at', 'desc'), f.limit(50)),
    snap => { mine = snap.docs.map(d => toLog(uid, d)).filter(l => l.at); emit(); },
    err => console.error('自分のログを読み込めませんでした', err));
  setFriends(wanted);
}

// 友だちが増減したときに呼ぶ。友だちのログは1人ぶん最新20件まで読む。
export function setFriends(ids) {
  wanted = ids;
  if (!db) return;
  const want = new Set(ids);
  for (const [id, off] of subs) if (!want.has(id)) { off(); subs.delete(id); theirs.delete(id); denied.delete(id); emit(); }
  for (const id of want) {
    if (subs.has(id)) continue;
    subs.set(id, f.onSnapshot(
      f.query(f.collection(db, 'users', id, 'logs'), f.orderBy('at', 'desc'), f.limit(20)),
      snap => { theirs.set(id, snap.docs.map(d => toLog(id, d)).filter(l => l.at)); denied.delete(id); emit(); },
      err => { console.warn('友だちのログを読み込めませんでした', err.code); if (err.code === 'permission-denied') denied.add(id); emit(); }));
  }
}
