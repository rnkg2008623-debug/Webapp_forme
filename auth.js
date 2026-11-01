// Firebase Authentication のラッパー。設定が空のときは SDK を読み込まず、isConfigured=false になる。
import { firebaseConfig } from './firebase-config.js?v=36';
import { t, hasKey } from './i18n.js?v=36';

const SDK = 'https://www.gstatic.com/firebasejs/10.14.1';
export const isConfigured = Boolean(firebaseConfig.apiKey && firebaseConfig.authDomain && firebaseConfig.projectId);

let ready;
function load() {
  if (!isConfigured) return Promise.reject(Object.assign(new Error('not-configured'), { code: 'app/not-configured' }));
  ready ??= Promise.all([import(`${SDK}/firebase-app.js`), import(`${SDK}/firebase-auth.js`)]).then(([app, auth]) => {
    const fbApp = app.initializeApp(Object.fromEntries(Object.entries(firebaseConfig).filter(([, v]) => v)));
    return { auth, instance: auth.getAuth(fbApp), app: fbApp };
  });
  return ready;
}

// Firestore / Realtime Database は必要になったときだけ読み込む
const services = {};
function service(name, file, getter) {
  services[name] ??= load().then(async ({ app }) => {
    const m = await import(`${SDK}/${file}`);
    return { m, db: m[getter](app) };
  });
  return services[name];
}
export const firestore = () => service('fs', 'firebase-firestore.js', 'getFirestore');
export const realtime = () => service('rt', 'firebase-database.js', 'getDatabase');

export async function signUp(email, password, displayName) {
  const { auth, instance } = await load();
  const cred = await auth.createUserWithEmailAndPassword(instance, email, password);
  try { await auth.updateProfile(cred.user, { displayName }); } catch (_) { /* 表示名はホームで補われる */ }
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

// エラーコード → 画面に出す文言(言語は i18n.js が決める)
const ALIASES = { 'auth/user-not-found': 'auth/invalid-credential', 'auth/wrong-password': 'auth/invalid-credential' };
export const isCancelled = e => ['auth/popup-closed-by-user', 'auth/cancelled-popup-request'].includes(e?.code);
export const errorMessage = e => {
  const code = ALIASES[e?.code] || e?.code;
  return hasKey(`err.${code}`) ? t(`err.${code}`) : t('err.default');
};
