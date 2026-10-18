// ホーム画面はログイン済みのユーザーだけが見られる。未ログインならログイン画面へ戻す。
import { onUser, logOut } from './auth.js?v=26';
import { mountFriends } from './friends-ui.js?v=26';
import { mountProfile } from './profile.js?v=26';
import { mountTimer } from './timer.js?v=26';
import { mountPomodoro } from './pomodoro.js?v=26';
import { startLogs } from './logs-store.js?v=26';
import { mountRecent } from './recent.js?v=26';
import { mountManual } from './manual.js?v=26';

let social;
onUser(async user => {
  if (!user) return location.replace('index.html');
  document.documentElement.classList.remove('auth-pending');
  if (social) return;
  try { social = await mountFriends(user); mountProfile(user, social).catch(e => console.error('プロフィールを開始できませんでした', e)); startLogs(user).catch(e => console.error('学習ログを読み込めませんでした', e)); mountRecent(); mountManual(user); mountTimer(user).catch(e => console.error('タイマーを開始できませんでした', e)); mountPomodoro(user).catch(e => console.error('Pomodoroを開始できませんでした', e)); }
  catch (e) { console.error('フレンド機能を開始できませんでした', e); document.getElementById('friend-list').replaceChildren(Object.assign(document.createElement('li'), { className: 'fm-empty', textContent: 'フレンド機能を読み込めませんでした。' })); }
});

document.getElementById('logout').addEventListener('click', async () => {
  try { await social?.actions.stop(); await logOut(); } finally { location.replace('index.html'); }
});
