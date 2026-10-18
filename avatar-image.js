// 選んだ画像を、中央で正方形に切り抜いて小さくし、JPEG のデータURLにする(Firebase Storage は使わない)
export const PHOTO_PATTERN = /^data:image\/(jpeg|png|webp);base64,[A-Za-z0-9+/=]+$/;
export const MAX_PHOTO_CHARS = 38000; // Firestore のルールの上限(40000)より少し小さく
const fail = code => Object.assign(new Error(code), { code });

export async function toAvatarDataUrl(file, size = 192) {
  if (!/^image\/(png|jpeg|webp|gif)$/.test(file.type)) throw fail('bad-type');
  if (file.size > 10 * 1024 * 1024) throw fail('too-big');
  let bitmap;
  try { bitmap = await createImageBitmap(file); } catch (_) { throw fail('decode'); }
  const side = Math.min(bitmap.width, bitmap.height);
  const canvas = document.createElement('canvas');
  canvas.width = canvas.height = size;
  const ctx = canvas.getContext('2d');
  ctx.fillStyle = '#fff'; // 透過PNGの背景
  ctx.fillRect(0, 0, size, size);
  ctx.imageSmoothingQuality = 'high';
  ctx.drawImage(bitmap, (bitmap.width - side) / 2, (bitmap.height - side) / 2, side, side, 0, 0, size, size);
  bitmap.close?.();
  for (const quality of [0.85, 0.7, 0.55, 0.4]) {
    const url = canvas.toDataURL('image/jpeg', quality);
    if (url.length <= MAX_PHOTO_CHARS && PHOTO_PATTERN.test(url)) return url;
  }
  throw fail('too-big');
}
