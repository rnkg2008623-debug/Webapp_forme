// デモ用: サーバー認証はまだ無いので、入力が埋まっていればログイン成功として扱う
const body = document.body;
const loginPanel = document.querySelector('.panel-left');
const signupView = document.getElementById('signup-view');

function show(el, text, info) {
  el.textContent = text;
  el.classList.toggle('info', !!info);
  el.hidden = false;
}

// パスワード表示切り替え(ログイン・新規登録共通)
document.querySelectorAll('.eye').forEach(btn => btn.addEventListener('click', () => {
  const input = document.getElementById(btn.dataset.for);
  const visible = input.type === 'password';
  input.type = visible ? 'text' : 'password';
  btn.classList.toggle('is-on', visible);
  btn.setAttribute('aria-label', visible ? 'パスワードを隠す' : 'パスワードを表示');
}));

function enter() {
  try { sessionStorage.setItem('loggedIn', '1'); } catch (_) {}
  location.href = 'home.html';
}

// ---- ログイン ----
const form = document.getElementById('login-form');
const msg = document.getElementById('msg');
form.addEventListener('submit', e => {
  e.preventDefault();
  if (!form.email.value.trim() || !form.pass.value) {
    show(msg, 'メールアドレスとパスワードを入力してください。');
    return;
  }
  enter();
});
document.getElementById('google').addEventListener('click', () => show(msg, 'Google ログインは準備中です。', true));

// ---- 画面切り替え(背景に入っていく演出。CSS側で0.4秒後に新規登録カードが出る) ----
function setMode(signup) {
  body.classList.toggle('mode-signup', signup);
  signupView.inert = !signup;
  signupView.setAttribute('aria-hidden', String(!signup));
  loginPanel.inert = signup;
  setTimeout(() => (signup ? document.getElementById('su-email') : document.getElementById('email')).focus({ preventScroll: true }), 700);
}
document.getElementById('signup').addEventListener('click', e => { e.preventDefault(); setMode(true); });
document.getElementById('to-login').addEventListener('click', e => { e.preventDefault(); setMode(false); });
document.addEventListener('keydown', e => { if (e.key === 'Escape' && body.classList.contains('mode-signup')) setMode(false); });

// ---- 新規登録 ----
const sForm = document.getElementById('signup-form');
const sMsg = document.getElementById('su-msg');
sForm.addEventListener('submit', e => {
  e.preventDefault();
  const email = sForm.email.value.trim();
  if (!email || !sForm.pass.value || !sForm.confirm.value) return show(sMsg, 'すべての項目を入力してください。');
  if (!/^\S+@\S+\.\S+$/.test(email)) return show(sMsg, 'メールアドレスの形式が正しくありません。');
  if (sForm.pass.value.length < 8) return show(sMsg, 'パスワードは8文字以上にしてください。');
  if (sForm.pass.value !== sForm.confirm.value) return show(sMsg, 'パスワードが一致しません。');
  enter();
});
document.getElementById('su-google').addEventListener('click', () => show(sMsg, 'Google 登録は準備中です。', true));
