// 選んだ画像を、指定した範囲で正方形に切り抜いて小さくし、JPEG のデータURLにする(Firebase Storage は使わない)
export const PHOTO_PATTERN = /^data:image\/(jpeg|png|webp);base64,[A-Za-z0-9+/=]+$/;
export const MAX_PHOTO_CHARS = 38000; // Firestore のルールの上限(40000)より少し小さく
export const AVATAR_SIZE = 256;
const fail = code => Object.assign(new Error(code), { code });

// 画像ファイルを読み込む(形式と大きさを確認。スマホ写真の向きも補正される)
export async function loadImage(file) {
  if (!/^image\/(png|jpeg|webp|gif)$/.test(file.type)) throw fail('bad-type');
  if (file.size > 10 * 1024 * 1024) throw fail('too-big');
  try { return await createImageBitmap(file); } catch (_) { throw fail('decode'); }
}

// crop = { x, y, side }: 元画像の中の切り抜き範囲(正方形)
export function cropToDataUrl(bitmap, crop, size = AVATAR_SIZE) {
  const canvas = document.createElement('canvas');
  canvas.width = canvas.height = size;
  const ctx = canvas.getContext('2d');
  ctx.fillStyle = '#fff'; // 透過PNGの背景
  ctx.fillRect(0, 0, size, size);
  ctx.imageSmoothingQuality = 'high';
  ctx.drawImage(bitmap, crop.x, crop.y, crop.side, crop.side, 0, 0, size, size);
  for (const quality of [0.88, 0.75, 0.6, 0.45, 0.3]) {
    const url = canvas.toDataURL('image/jpeg', quality);
    if (url.length <= MAX_PHOTO_CHARS && PHOTO_PATTERN.test(url)) return url;
  }
  throw fail('too-big');
}

// 範囲を選ばずに、中央を切り抜く
export async function toAvatarDataUrl(file, size = AVATAR_SIZE) {
  const bitmap = await loadImage(file);
  const side = Math.min(bitmap.width, bitmap.height);
  const url = cropToDataUrl(bitmap, { x: (bitmap.width - side) / 2, y: (bitmap.height - side) / 2, side }, size);
  bitmap.close?.();
  return url;
}
