import { signUp, logIn, withGoogle, onUser, errorMessage, isCancelled } from './auth.js?v=33';
import { t, getLang, setLang } from './i18n.js?v=33';

const body = document.body;
const loginPanel = document.querySelector('.panel-left');
const signupView = document.getElementById('signup-view');

function show(el, text, info) {
  el.textContent = text;
  el.classList.toggle('info', !!info);
  el.hidden = false;
}
const enter = () => location.replace('home.html');

// ログイン済みならそのままホームへ
onUser(user => { if (user) enter(); });

// パスワード表示切り替え(ログイン・新規登録共通)
document.querySelectorAll('.eye').forEach(btn => btn.addEventListener('click', () => {
  const input = document.getElementById(btn.dataset.for);
  const visible = input.type === 'password';
  input.type = visible ? 'text' : 'password';
  btn.classList.toggle('is-on', visible);
  btn.setAttribute('aria-label', visible ? t('pw.hide') : t('pw.show'));
}));

// 送信中はボタンを無効にして二重送信を防ぐ
async function run(el, button, task) {
  el.hidden = true;
  button.disabled = true;
  try {
    await task();
    enter();
  } catch (e) {
    if (!isCancelled(e)) { console.error(e); show(el, errorMessage(e)); }
    button.disabled = false;
  }
}

// ---- ログイン ----
const form = document.getElementById('login-form');
const msg = document.getElementById('msg');
form.addEventListener('submit', e => {
  e.preventDefault();
  const email = form.email.value.trim();
  if (!email || !form.pass.value) return show(msg, t('login.enter'));
  run(msg, form.querySelector('.submit-btn'), () => logIn(email, form.pass.value));
});
const googleBtn = document.getElementById('google');
googleBtn.addEventListener('click', () => run(msg, googleBtn, withGoogle));

// ---- 画面切り替え(背景に入っていく演出。CSS側で0.4秒後に新規登録カードが出る) ----
function setMode(signup) {
  body.classList.toggle('mode-signup', signup);
  signupView.inert = !signup;
  signupView.setAttribute('aria-hidden', String(!signup));
  loginPanel.inert = signup;
  setTimeout(() => (signup ? document.getElementById('su-name') : document.getElementById('email')).focus({ preventScroll: true }), 700);
}
document.getElementById('signup').addEventListener('click', e => { e.preventDefault(); setMode(true); });
document.getElementById('to-login').addEventListener('click', e => { e.preventDefault(); setMode(false); });
document.addEventListener('keydown', e => { if (e.key === 'Escape' && body.classList.contains('mode-signup')) setMode(false); });

// ---- 新規登録 ----
const sForm = document.getElementById('signup-form');
const sMsg = document.getElementById('su-msg');
sForm.addEventListener('submit', e => {
  e.preventDefault();
  const name = sForm.name.value.trim();
  const email = sForm.email.value.trim();
  if (!name || !email || !sForm.pass.value || !sForm.confirm.value) return show(sMsg, t('su.all'));
  if (name.length > 20) return show(sMsg, t('su.name20'));
  if (!/^\S+@\S+\.\S+$/.test(email)) return show(sMsg, t('su.email'));
  if (sForm.pass.value.length < 8) return show(sMsg, t('su.pw8'));
  if (sForm.pass.value !== sForm.confirm.value) return show(sMsg, t('su.match'));
  run(sMsg, sForm.querySelector('.submit-btn'), () => signUp(email, sForm.pass.value, name));
});
const suGoogle = document.getElementById('su-google');
suGoogle.addEventListener('click', () => run(sMsg, suGoogle, withGoogle));

// ---- 言語の切り替え(ログイン前でも選べる) ----
const langButtons = [...document.querySelectorAll('[data-lang]')];
const markLang = () => langButtons.forEach(b => { const on = b.dataset.lang === getLang(); b.classList.toggle('is-on', on); b.setAttribute('aria-pressed', String(on)); });
langButtons.forEach(b => b.addEventListener('click', () => setLang(b.dataset.lang)));
window.addEventListener('langchange', () => {
  markLang();
  for (const btn of document.querySelectorAll('.eye')) btn.setAttribute('aria-label', btn.classList.contains('is-on') ? t('pw.hide') : t('pw.show'));
});
markLang();
