// Firebase Authentication のラッパー。設定が空のときは SDK を読み込まず、isConfigured=false になる。
import { firebaseConfig } from './firebase-config.js';

const SDK = 'https://www.gstatic.com/firebasejs/10.14.1';
export const isConfigured = Boolean(firebaseConfig.apiKey && firebaseConfig.authDomain && firebaseConfig.projectId);

let ready;
function load() {
  if (!isConfigured) return Promise.reject(Object.assign(new Error('not-configured'), { code: 'app/not-configured' }));
  ready ??= Promise.all([import(`${SDK}/firebase-app.js`), import(`${SDK}/firebase-auth.js`)]).then(([app, auth]) => {
    const instance = auth.getAuth(app.initializeApp(firebaseConfig));
    return { auth, instance };
  });
  return ready;
}

export async function signUp(email, password) {
  const { auth, instance } = await load();
  const cred = await auth.createUserWithEmailAndPassword(instance, email, password);
  try { await auth.sendEmailVerification(cred.user); } catch (_) { /* 確認メールの送信失敗は登録自体を止めない */ }
  return cred.user;
}

export async function logIn(email, password) {
  const { auth, instance } = await load();
  return (await auth.signInWithEmailAndPassword(instance, email, password)).user;
}

// ログインと新規登録で共通(初めての Google アカウントなら自動でアカウントが作られる)
export async function withGoogle() {
  const { auth, instance } = await load();
  return (await auth.signInWithPopup(instance, new auth.GoogleAuthProvider())).user;
}

export async function logOut() {
  const { auth, instance } = await load();
  await auth.signOut(instance);
}

// コールバックには user か null が渡る。読み込みに失敗したときも null で呼ぶ。
export function onUser(callback) {
  load().then(({ auth, instance }) => auth.onAuthStateChanged(instance, callback)).catch(() => callback(null));
}

const MESSAGES = {
  'app/not-configured': 'Firebase の設定が未完了です。firebase-config.js に設定を入力してください。',
  'auth/email-already-in-use': 'このメールアドレスはすでに登録されています。ログインしてください。',
  'auth/invalid-email': 'メールアドレスの形式が正しくありません。',
  'auth/weak-password': 'パスワードが弱すぎます。8文字以上で設定してください。',
  'auth/invalid-credential': 'メールアドレスまたはパスワードが違います。',
  'auth/user-not-found': 'メールアドレスまたはパスワードが違います。',
  'auth/wrong-password': 'メールアドレスまたはパスワードが違います。',
  'auth/too-many-requests': '試行回数が多すぎます。しばらくしてからやり直してください。',
  'auth/network-request-failed': 'ネットワークに接続できません。通信環境を確認してください。',
  'auth/popup-blocked': 'ポップアップがブロックされました。許可してからもう一度お試しください。',
  'auth/unauthorized-domain': 'このドメインが Firebase の承認済みドメインに登録されていません。',
  'auth/operation-not-allowed': 'この認証方法が Firebase で有効になっていません。',
};
export const isCancelled = e => ['auth/popup-closed-by-user', 'auth/cancelled-popup-request'].includes(e?.code);
export const errorMessage = e => MESSAGES[e?.code] || '処理に失敗しました。時間をおいてやり直してください。';
