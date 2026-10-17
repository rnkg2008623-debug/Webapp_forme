// デモ用: サーバー認証はまだ無いので、入力が埋まっていればログイン成功として扱う
const form = document.getElementById('login-form');
const pass = document.getElementById('pass');
const eye = document.getElementById('eye');
const error = document.getElementById('error');

eye.addEventListener('click', () => {
  const show = pass.type === 'password';
  pass.type = show ? 'text' : 'password';
  eye.classList.toggle('is-on', show);
  eye.setAttribute('aria-label', show ? 'パスワードを隠す' : 'パスワードを表示');
});

form.addEventListener('submit', e => {
  e.preventDefault();
  if (!form.user.value.trim() || !pass.value) {
    error.textContent = 'メールアドレス（またはユーザー名）とパスワードを入力してください。';
    error.hidden = false;
    return;
  }
  try { sessionStorage.setItem('loggedIn', '1'); } catch (_) {}
  location.href = 'home.html';
});

document.getElementById('signup').addEventListener('click', e => e.preventDefault());
