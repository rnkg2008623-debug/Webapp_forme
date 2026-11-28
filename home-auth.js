// ホーム画面はログイン済みのユーザーだけが見られる。未ログインならログイン画面へ戻す。
import { onUser, logOut } from './auth.js?v=120';
import { t, getLang, setLang } from './i18n.js?v=120';
import { mountFriends } from './friends-ui.js?v=120';
import { mountProfile } from './profile.js?v=120';
import { mountTimer } from './timer.js?v=120';
import { mountPomodoro } from './pomodoro.js?v=120';
import { startLogs } from './logs-store.js?v=120';
import { mountRecent } from './recent.js?v=120';
import { mountManual } from './manual.js?v=120';
import { mountNotices } from './notices.js?v=120';
import { mountCompare } from './compare.js?v=120';
import './theme.js?v=120';
import { mountAfk } from './afk.js?v=120';
import { mountMock } from './mock.js?v=120';
import { mountEnglish } from './english.js?v=120';
import { mountTodo } from './todo.js?v=120';
import { mountNotes } from './notes.js?v=120';
import { mountBgVideo } from './bgvideo.js?v=120';

let social;
onUser(async user => {
  if (!user) return location.replace('index.html');
  document.documentElement.classList.remove('auth-pending');
  if (social) return;
  mountCompare(user).catch(e => console.error('Compareを開始できませんでした', e));
  try { mountMock(user); } catch (e) { console.error('Mockを開始できませんでした', e); }
  try { mountEnglish(user); } catch (e) { console.error('Englishを開始できませんでした', e); }
  try { mountTodo(user); } catch (e) { console.error('To-Doを開始できませんでした', e); }
  try { mountNotes(user); } catch (e) { console.error('Notesを開始できませんでした', e); }
  mountBgVideo().catch(e => console.error('背景動画を開始できませんでした', e));
  mountNotices(user).catch(e => console.error('お知らせを開始できませんでした', e));
  try { social = await mountFriends(user); mountProfile(user, social).catch(e => console.error('プロフィールを開始できませんでした', e)); try { mountAfk(user, social); } catch (e) { console.error('AFKを開始できませんでした', e); } startLogs(user).catch(e => console.error('学習ログを読み込めませんでした', e)); mountRecent(); mountManual(user); mountTimer(user).catch(e => console.error('タイマーを開始できませんでした', e)); mountPomodoro(user).catch(e => console.error('Pomodoroを開始できませんでした', e)); }
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
