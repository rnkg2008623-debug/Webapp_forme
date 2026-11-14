// ホーム画面はログイン済みのユーザーだけが見られる。未ログインならログイン画面へ戻す。
import { onUser, logOut } from './auth.js?v=90';
import { t, getLang, setLang } from './i18n.js?v=90';
import { mountFriends } from './friends-ui.js?v=90';
import { mountProfile } from './profile.js?v=90';
import { mountTimer } from './timer.js?v=90';
import { mountPomodoro } from './pomodoro.js?v=90';
import { startLogs } from './logs-store.js?v=90';
import { mountRecent } from './recent.js?v=90';
import { mountManual } from './manual.js?v=90';
import { mountNotices } from './notices.js?v=90';
import { mountCompare } from './compare.js?v=90';
import './theme.js?v=90';
import { mountEio } from './eio.js?v=90';
import { mountNotes } from './notes.js?v=90';
import { mountBgVideo } from './bgvideo.js?v=90';

let social;
onUser(async user => {
  if (!user) return location.replace('index.html');
  document.documentElement.classList.remove('auth-pending');
  if (social) return;
  mountCompare(user).catch(e => console.error('Compareを開始できませんでした', e));
  try { mountEio(user); } catch (e) { console.error('English IOを開始できませんでした', e); }
  try { mountNotes(user); } catch (e) { console.error('Notesを開始できませんでした', e); }
  mountBgVideo().catch(e => console.error('背景動画を開始できませんでした', e));
  mountNotices(user).catch(e => console.error('お知らせを開始できませんでした', e));
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
