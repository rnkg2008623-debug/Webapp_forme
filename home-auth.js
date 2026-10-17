// ホーム画面はログイン済みのユーザーだけが見られる。未ログインならログイン画面へ戻す。
import { onUser, logOut } from './auth.js';

onUser(user => {
  if (!user) return location.replace('index.html');
  document.documentElement.classList.remove('auth-pending');
});

document.getElementById('logout').addEventListener('click', async () => {
  try { await logOut(); } finally { location.replace('index.html'); }
});
