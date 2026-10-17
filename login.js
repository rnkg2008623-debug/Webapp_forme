// デモ用: サーバー認証はまだ無いので、入力が埋まっていればログイン成功として扱う
const form = document.getElementById('login-form');
const pass = document.getElementById('pass');
const eye = document.getElementById('eye');
const msg = document.getElementById('msg');

function show(text, info) {
  msg.textContent = text;
  msg.classList.toggle('info', !!info);
  msg.hidden = false;
}

eye.addEventListener('click', () => {
  const visible = pass.type === 'password';
  pass.type = visible ? 'text' : 'password';
  eye.classList.toggle('is-on', visible);
  eye.setAttribute('aria-label', visible ? 'パスワードを隠す' : 'パスワードを表示');
});

form.addEventListener('submit', e => {
  e.preventDefault();
  if (!form.email.value.trim() || !pass.value) {
    show('メールアドレスとパスワードを入力してください。');
    return;
  }
  try { sessionStorage.setItem('loggedIn', '1'); } catch (_) {}
  location.href = 'home.html';
});

document.getElementById('google').addEventListener('click', () => show('Google ログインは準備中です。', true));
document.getElementById('signup').addEventListener('click', e => { e.preventDefault(); show('新規登録は準備中です。', true); });
