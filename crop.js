// アイコンの切り抜き画面: ドラッグで位置、スライダー(またはホイール・ピンチ)で拡大縮小を決める
import { cropToDataUrl } from './avatar-image.js?v=30';
import { t } from './i18n.js?v=30';

const ZOOM_MAX = 4;
const clamp = (v, lo, hi) => Math.min(hi, Math.max(lo, v));
const SVG = {
  back: '<svg viewBox="0 0 24 24"><path d="M19 12H5M11 6l-6 6 6 6"/></svg>',
  out: '<svg viewBox="0 0 24 24"><circle cx="11" cy="11" r="7"/><path d="M16.5 16.5L21 21M8 11h6"/></svg>',
  in: '<svg viewBox="0 0 24 24"><circle cx="11" cy="11" r="7"/><path d="M16.5 16.5L21 21M8 11h6M11 8v6"/></svg>',
};
function el(tag, className, attrs = {}) {
  const n = document.createElement(tag);
  if (className) n.className = className;
  Object.entries(attrs).forEach(([k, v]) => n.setAttribute(k, v));
  return n;
}

// bitmap を受け取り、適用なら JPEG のデータURL、キャンセルなら null を返す
export function openCropper(bitmap) {
  return new Promise(resolve => {
    const opener = document.activeElement;
    const overlay = el('div', 'cr');
    const card = el('div', 'cr-card', { role: 'dialog', 'aria-modal': 'true', 'aria-label': t('crop.title') });
    const head = el('div', 'cr-head');
    const back = el('button', 'cr-back', { type: 'button', 'aria-label': t('common.cancel') });
    back.innerHTML = SVG.back; // 固定のSVG文字列のみ
    const title = el('h2', 'cr-title'); title.textContent = t('crop.title');
    const apply = el('button', 'cr-apply', { type: 'button' }); apply.textContent = t('crop.apply');
    head.append(back, title, apply);

    const stageBox = el('div', 'cr-stage');
    const canvas = el('canvas', 'cr-canvas', { tabindex: '0', role: 'img', 'aria-label': t('crop.canvasAria') });
    stageBox.append(canvas);
    const hint = el('p', 'cr-hint'); hint.textContent = t('crop.hint');

    const foot = el('div', 'cr-foot');
    const zOut = el('span', 'cr-zi'); zOut.innerHTML = SVG.out;
    const zIn = el('span', 'cr-zi'); zIn.innerHTML = SVG.in;
    const slider = el('input', 'cr-slider', { type: 'range', min: '1', max: String(ZOOM_MAX), step: '0.01', value: '1', 'aria-label': t('crop.zoomAria') });
    foot.append(zOut, slider, zIn);
    card.append(head, stageBox, hint, foot);
    overlay.append(card);
    document.body.append(overlay);

    // ---- 寸法 ----
    const stageW = Math.round(Math.min(560, window.innerWidth - 32));
    const stageH = Math.round(Math.min(stageW * 0.9, window.innerHeight - 250, 520));
    const dpr = window.devicePixelRatio || 1;
    canvas.width = stageW * dpr; canvas.height = stageH * dpr;
    canvas.style.width = `${stageW}px`; canvas.style.height = `${stageH}px`;
    const ctx = canvas.getContext('2d');
    const F = Math.min(stageW, stageH) - 40;              // 切り抜き枠(正方形)の一辺
    const fx = (stageW - F) / 2, fy = (stageH - F) / 2;
    const s0 = F / Math.min(bitmap.width, bitmap.height);   // 枠いっぱいに収まる最小の倍率

    let zoom = 1, ox, oy;
    const scale = () => s0 * zoom;
    function limit() {
      const w = bitmap.width * scale(), h = bitmap.height * scale();
      ox = clamp(ox, fx + F - w, fx);
      oy = clamp(oy, fy + F - h, fy);
    }
    function setZoom(next) { // 枠の中心を動かさずに拡大縮小
      next = clamp(next, 1, ZOOM_MAX);
      const cx = fx + F / 2, cy = fy + F / 2;
      const px = (cx - ox) / scale(), py = (cy - oy) / scale();
      zoom = next;
      ox = cx - px * scale(); oy = cy - py * scale();
      limit();
      slider.value = String(zoom);
      draw();
    }
    ox = fx + F / 2 - bitmap.width * scale() / 2;
    oy = fy + F / 2 - bitmap.height * scale() / 2;
    limit();

    function draw() {
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, stageW, stageH);
      const w = bitmap.width * scale(), h = bitmap.height * scale();
      ctx.drawImage(bitmap, ox, oy, w, h);
      // 枠の外を暗くする
      ctx.fillStyle = 'rgba(25, 35, 55, .55)';
      ctx.beginPath(); ctx.rect(0, 0, stageW, stageH); ctx.rect(fx, fy, F, F);
      ctx.fill('evenodd');
      // 枠と、実際に表示される丸い範囲のガイド
      ctx.strokeStyle = '#1d9bf0'; ctx.lineWidth = 3; ctx.strokeRect(fx, fy, F, F);
      ctx.strokeStyle = 'rgba(255,255,255,.75)'; ctx.lineWidth = 1.5; ctx.setLineDash([6, 5]);
      ctx.beginPath(); ctx.arc(fx + F / 2, fy + F / 2, F / 2 - 2, 0, Math.PI * 2); ctx.stroke(); ctx.setLineDash([]);
    }
    draw();

    // ---- 操作: ドラッグ・ピンチ・ホイール・キーボード ----
    const pointers = new Map();
    let pinch = null;
    canvas.addEventListener('pointerdown', e => {
      canvas.setPointerCapture(e.pointerId);
      pointers.set(e.pointerId, { x: e.clientX, y: e.clientY });
      if (pointers.size === 2) { const [a, b] = [...pointers.values()]; pinch = { d: Math.hypot(a.x - b.x, a.y - b.y), z: zoom }; }
      canvas.classList.add('drag');
    });
    canvas.addEventListener('pointermove', e => {
      const p = pointers.get(e.pointerId);
      if (!p) return;
      if (pointers.size === 2 && pinch) {
        pointers.set(e.pointerId, { x: e.clientX, y: e.clientY });
        const [a, b] = [...pointers.values()];
        setZoom(pinch.z * Math.hypot(a.x - b.x, a.y - b.y) / pinch.d);
        return;
      }
      ox += e.clientX - p.x; oy += e.clientY - p.y;
      pointers.set(e.pointerId, { x: e.clientX, y: e.clientY });
      limit(); draw();
    });
    const release = e => { pointers.delete(e.pointerId); pinch = null; if (!pointers.size) canvas.classList.remove('drag'); };
    canvas.addEventListener('pointerup', release);
    canvas.addEventListener('pointercancel', release);
    canvas.addEventListener('wheel', e => { e.preventDefault(); setZoom(zoom * Math.exp(-e.deltaY * 0.0015)); }, { passive: false });
    slider.addEventListener('input', () => setZoom(Number(slider.value)));
    canvas.addEventListener('keydown', e => {
      const step = e.shiftKey ? 30 : 10;
      const moves = { ArrowLeft: [-step, 0], ArrowRight: [step, 0], ArrowUp: [0, -step], ArrowDown: [0, step] };
      if (moves[e.key]) { e.preventDefault(); ox += moves[e.key][0]; oy += moves[e.key][1]; limit(); draw(); }
      else if (e.key === '+' || e.key === '=') { e.preventDefault(); setZoom(zoom + 0.2); }
      else if (e.key === '-') { e.preventDefault(); setZoom(zoom - 0.2); }
    });

    // ---- 終了 ----
    function done(result) {
      document.removeEventListener('keydown', onKey, true);
      overlay.remove();
      opener?.focus?.();
      resolve(result);
    }
    function onKey(e) {
      if (e.key === 'Escape') { e.preventDefault(); e.stopPropagation(); done(null); }
      else if (e.key === 'Tab') { // ダイアログの外に出ないようにする
        const items = [back, apply, canvas, slider];
        const i = items.indexOf(document.activeElement);
        const next = items[(i + (e.shiftKey ? items.length - 1 : 1)) % items.length];
        e.preventDefault(); next.focus();
      }
    }
    document.addEventListener('keydown', onKey, true);
    back.addEventListener('click', () => done(null));
    overlay.addEventListener('pointerdown', e => { if (e.target === overlay) done(null); });
    apply.addEventListener('click', () => {
      try {
        const k = 1 / scale();
        done(cropToDataUrl(bitmap, { x: (fx - ox) * k, y: (fy - oy) * k, side: F * k }));
      } catch (err) { done(Promise.reject(err)); }
    });
    apply.focus();
  }).then(r => r); // 失敗は呼び出し側で扱う
}
