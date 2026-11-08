// 背景動画(標準スタイルのときだけ): 好きなmp4(500MBまで・3分まで)を、音なしで背景にループ再生する。
// 動画はこのブラウザの IndexedDB に保存する(サーバーには送らない)。なので、端末ごとに選ぶ。
import { t } from './i18n.js?v=81';

const MAX_BYTES = 500 * 1024 * 1024, MAX_SEC = 180;
const DB = 'bgvideo', STORE = 'v', KEY = 'bg';
const $ = id => document.getElementById(id);
const root = document.documentElement;

const idb = () => new Promise((res, rej) => {
  const r = indexedDB.open(DB, 1);
  r.onupgradeneeded = () => r.result.createObjectStore(STORE);
  r.onsuccess = () => res(r.result); r.onerror = () => rej(r.error);
});
async function tx(mode, fn) {
  const db = await idb();
  return new Promise((res, rej) => {
    const q = fn(db.transaction(STORE, mode).objectStore(STORE));
    q.onsuccess = () => res(q.result); q.onerror = () => rej(q.error);
  });
}
const load = () => tx('readonly', s => s.get(KEY));
const save = blob => tx('readwrite', s => s.put(blob, KEY));
const drop = () => tx('readwrite', s => s.delete(KEY));

let video = null, url = null, has = false;
const standard = () => root.dataset.theme !== 'neon';

function sync() {
  const on = has && standard();
  if (on && !video) {
    video = document.createElement('video');
    video.className = 'bg-video'; video.muted = true; video.loop = true; video.autoplay = true;
    video.playsInline = true; video.setAttribute('muted', ''); video.disablePictureInPicture = true;
    video.src = url;
    document.querySelector('.bg').appendChild(video);
  }
  if (video) {
    video.hidden = !on;
    if (on) video.play().catch(() => {}); else video.pause();
  }
  root.classList.toggle('has-bgvideo', on);
  const reset = $('bgv-reset'); if (reset) reset.hidden = !has;
}
function setBlob(blob) {
  if (url) URL.revokeObjectURL(url);
  if (video) { video.remove(); video = null; }
  url = blob ? URL.createObjectURL(blob) : null; has = !!blob; sync();
}
const msg = (s, ok) => { const m = $('bgv-msg'); if (!m) return; m.textContent = s; m.hidden = !s; m.classList.toggle('ok', !!ok); };

function duration(file) {
  return new Promise((res, rej) => {
    const v = document.createElement('video'), u = URL.createObjectURL(file);
    v.preload = 'metadata';
    v.onloadedmetadata = () => { const d = v.duration; URL.revokeObjectURL(u); res(d); };
    v.onerror = () => { URL.revokeObjectURL(u); rej(new Error('unreadable')); };
    v.src = u;
  });
}

async function pick(file) {
  msg('');
  if (!file) return;
  if (!(file.type === 'video/mp4' || /\.mp4$/i.test(file.name))) return msg(t('bgv.notMp4'));
  if (file.size > MAX_BYTES) return msg(t('bgv.tooBig'));
  let d;
  try { d = await duration(file); } catch { return msg(t('bgv.unreadable')); }
  if (!isFinite(d) || d > MAX_SEC) return msg(t('bgv.tooLong'));
  try { await save(file); } catch (e) { console.warn(e); return msg(t('bgv.saveFail')); }
  setBlob(file); msg(t('bgv.done'), true);
}

export async function mountBgVideo() {
  const input = $('bgv-file');
  $('bgv-btn').addEventListener('click', () => input.click());
  input.addEventListener('change', async () => { await pick(input.files[0]); input.value = ''; });
  $('bgv-reset').addEventListener('click', async () => { try { await drop(); } catch {} setBlob(null); msg(t('bgv.removed'), true); });
  new MutationObserver(sync).observe(root, { attributes: true, attributeFilter: ['data-theme'] });
  document.addEventListener('visibilitychange', () => { if (video && !document.hidden) sync(); });
  try { const b = await load(); if (b) setBlob(b); } catch { /* 保存を使えないブラウザ */ }
  sync();
}
