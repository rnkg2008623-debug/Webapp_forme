// ホーム画面はログイン済みのユーザーだけが見られる。未ログインならログイン画面へ戻す。
import { onUser, logOut } from './auth.js?v=7';
import { mountFriends } from './friends-ui.js?v=7';

let social;
onUser(async user => {
  if (!user) return location.replace('index.html');
  document.documentElement.classList.remove('auth-pending');
  if (social) return;
  try { social = await mountFriends(user); }
  catch (e) { console.error('フレンド機能を開始できませんでした', e); document.getElementById('friend-list').replaceChildren(Object.assign(document.createElement('li'), { className: 'fm-empty', textContent: 'フレンド機能を読み込めませんでした。' })); }
});

document.getElementById('logout').addEventListener('click', async () => {
  try { await social?.actions.stop(); await logOut(); } finally { location.replace('index.html'); }
});
