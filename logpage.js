// Log data ページ: 3枚の画像から選ぶと、その画像にズームして、一瞬フェードアウトしてから次のページへ移る
(() => {
  const view = document.getElementById('log-view');
  const world = document.getElementById('lg-world');
  const fade = document.getElementById('lg-fade');
  const soonTitle = document.getElementById('soon-title');
  const NAMES = { manual: 'Log manually' };
  const ZOOM_MS = 850, FADE_MS = 240;
  const reduce = () => matchMedia('(prefers-reduced-motion: reduce)').matches;
  let busy = false;

  function reset(panel) {
    world.style.transition = 'none';
    world.style.transform = '';
    view.classList.remove('zooming');
    panel.classList.remove('is-target');
    void world.offsetWidth;            // transition なしの状態を確定させてから、元に戻す
    world.style.transition = '';
  }

  function go(target, panel) {
    if (busy) return;
    busy = true;
    if (reduce()) { window.appSetView(target); busy = false; return; }
    const area = view.getBoundingClientRect();
    const r = panel.getBoundingClientRect();
    const cx = r.left + r.width / 2, cy = r.top + r.height / 2;
    const scale = Math.max(area.width / r.width, area.height / r.height) * 1.04;
    // 選んだ画像の中心を軸にして、画面いっぱいになるまで拡大しながら、中央へ寄せる
    world.style.transformOrigin = `${cx - area.left}px ${cy - area.top}px`;
    view.classList.add('zooming');
    panel.classList.add('is-target');
    world.style.transform = `translate(${area.left + area.width / 2 - cx}px, ${area.top + area.height / 2 - cy}px) scale(${scale})`;
    setTimeout(() => {
      fade.classList.add('on');                                  // 一瞬だけフェードアウト
      setTimeout(() => {
        window.appSetView(target);
        reset(panel);
        requestAnimationFrame(() => { fade.classList.remove('on'); busy = false; }); // 次のページがふわっと現れる
      }, FADE_MS);
    }, ZOOM_MS);
  }

  view.querySelectorAll('[data-go]').forEach(btn => btn.addEventListener('click', () => {
    const panel = view.querySelector(`.lg-panel[data-go="${btn.dataset.go}"]`);
    go(btn.dataset.go, panel);
  }));
  // タイトルにカーソルを置いたとき、対応する画像も持ち上げる
  view.querySelectorAll('.lg-title').forEach(t => {
    const panel = () => view.querySelector(`.lg-panel[data-go="${t.dataset.go}"]`);
    t.addEventListener('pointerenter', () => panel().classList.add('hover'));
    t.addEventListener('pointerleave', () => panel().classList.remove('hover'));
    t.addEventListener('focus', () => panel().classList.add('hover'));
    t.addEventListener('blur', () => panel().classList.remove('hover'));
  });
  window.addEventListener('viewchange', e => { if (NAMES[e.detail]) soonTitle.textContent = NAMES[e.detail]; });
})();
