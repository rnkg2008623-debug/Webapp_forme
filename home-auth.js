// ホーム画面はログイン済みのユーザーだけが見られる。未ログインならログイン画面へ戻す。
import { onUser, logOut } from './auth.js?v=35';
import { t, getLang, setLang } from './i18n.js?v=35';
import { mountFriends } from './friends-ui.js?v=35';
import { mountProfile } from './profile.js?v=35';
import { mountTimer } from './timer.js?v=35';
import { mountPomodoro } from './pomodoro.js?v=35';
import { startLogs } from './logs-store.js?v=35';
import { mountRecent } from './recent.js?v=35';
import { mountManual } from './manual.js?v=35';
import './theme.js?v=35';

let social;
onUser(async user => {
  if (!user) return location.replace('index.html');
  document.documentElement.classList.remove('auth-pending');
  if (social) return;
  try { social = await mountFriends(user); mountProfile(user, social).catch(e => console.error('プロフィールを開始できませんでした', e)); startLogs(user).catch(e => console.error('学習ログを読み込めませんでした', e)); mountRecent(); mountManual(user); mountTimer(user).catch(e => console.error('タイマーを開始できませんでした', e)); mountPomodoro(user).catch(e => console.error('Pomodoroを開始できませんでした', e)); }
  catch (e) { console.error('フレンド機能を開始できませんでした', e); document.getElementById('friend-list').replaceChildren(Object.assign(document.createElement('li'), { className: 'fm-empty', textContent: t('fr.loadFail') })); }
});

document.getElementById('logout').addEventListener('click', async () => {
  try { await social?.actions.stop(); await logOut(); } finally { location.replace('index.html'); }
});

// ---- Settings: 言語の切り替え ----
const langButtons = [...document.querySelectorAll('.st-lang[data-lang]')];
const markLang = () => langButtons.forEach(b => { const on = b.dataset.lang === getLang(); b.classList.toggle('is-on', on); b.setAttribute('aria-pressed', String(on)); });
langButtons.forEach(b => b.addEventListener('click', () => setLang(b.dataset.lang)));
window.addEventListener('langchange', markLang);
markLang();
