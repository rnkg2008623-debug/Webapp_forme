// AFK のガチャの景品: プロフィールで使えるアイコン(icon)と、プロフィールの背景の飾り(deco)。
// レア度: COMMON(70%)=シンプルな色 / UNCOMMON(25%)=少しグラデーション / RARE(5%)=少し光る。
// id は Firestore(users/{uid} の icon / deco)にも入るので、英小文字・数字・ハイフンだけにする(firestore.rules の形式と同じ)。
export const RARITIES = ['common', 'uncommon', 'rare'];
export const RATES = { common: 0.70, uncommon: 0.25, rare: 0.05 };
export const RARITY_LABEL = { common: 'COMMON', uncommon: 'UNCOMMON', rare: 'RARE' };
export const ID_PATTERN = /^[a-z0-9-]{1,32}$/;

const GLYPHS = {
  star: 'M12 2.5l2.9 6.1 6.6.9-4.8 4.6 1.2 6.6L12 17.400 6.100 20.700l1.200-6.600L2.500 9.500l6.600-.9z',
  heart: 'M12 21s-7.500-4.600-9.500-9.200C1.200 8.200 3.400 5 6.600 5c2 0 3.500 1.100 5.400 3.200C13.900 6.100 15.400 5 17.400 5c3.200 0 5.400 3.200 4.100 6.800C19.500 16.400 12 21 12 21z',
  moon: 'M20 14.500A8.500 8.500 0 0 1 9.500 4 8.500 8.500 0 1 0 20 14.500z',
  bolt: 'M13 2L4.500 13.500H11L10 22l9-12h-6.500z',
  leaf: 'M5 19C5 9 11 4 20 4c0 9-5 15-15 15z',
  drop: 'M12 2.500c4 4.500 6.500 7.500 6.500 11a6.500 6.500 0 0 1-13 0c0-3.500 2.500-6.500 6.500-11z',
  flame: 'M12 2c1 4 5 6 5 11a5 5 0 0 1-10 0c0-2 1-3.500 2-4.500 0 2 1 3 2 3 0-3 0-6 1-9.500z',
  crown: 'M3 8l4.500 4L12 5l4.500 7L21 8l-2 11H5z',
  diamond: 'M12 3l8 6-8 12L4 9z',
};
// [id, 種類, レア度, 色1, 色2(グラデーション・光), 形, [English, 日本語, 中文]]
const I = (id, r, c1, c2, glyph, names) => ({ id, type: 'icon', rarity: r, c1, c2, glyph, names });
const D = (id, r, c1, c2, c3, names) => ({ id, type: 'deco', rarity: r, c1, c2, c3, names });
// RARE のイラスト素材(img/gacha/)。題材ごとに、リング・背景カード・名札の3つ
const TITLES = [
  ['shadow-walker', ['Shadow Walker', 'シャドウウォーカー', '暗影行者']],
  ['flame-keeper', ['Flame Keeper', 'フレイムキーパー', '炎之守护者']],
  ['moonlight-guardian', ['Moonlight Guardian', 'ムーンライトガーディアン', '月光守卫']],
  ['stormbringer', ['Stormbringer', 'ストームブリンガー', '风暴使者']],
  ['fate-seeker', ['Fate Seeker', 'フェイトシーカー', '寻命者']],
  ['the-fearless', ['The Fearless', 'ザ・フィアレス', '无畏者']],
];
const IMG = 'img/gacha/';
const RARE_SET = TITLES.flatMap(([slug, names]) => [
  { id: `i-${slug}`, type: 'icon', rarity: 'rare', img: `${IMG}ring-${slug}.webp`, names },
  { id: `d-${slug}`, type: 'deco', rarity: 'rare', img: `${IMG}bg-${slug}.webp`, names },
  { id: `p-${slug}`, type: 'plate', rarity: 'rare', img: `${IMG}plate-${slug}.webp`, names },
]);
export const ITEMS = [
  // ---- アイコン: COMMON(単色) ----
  I('i-red-star', 'common', '#e5534b', '#e5534b', 'star', ['Red Ring', '赤いリング', '红色圆环']),
  I('i-pink-heart', 'common', '#e86aa6', '#e86aa6', 'heart', ['Pink Ring', 'ピンクのリング', '粉色圆环']),
  I('i-slate-moon', 'common', '#5b6b8c', '#5b6b8c', 'moon', ['Slate Ring', 'くすんだ青のリング', '灰蓝圆环']),
  I('i-amber-bolt', 'common', '#e0a526', '#e0a526', 'bolt', ['Amber Ring', '琥珀色のリング', '琥珀圆环']),
  I('i-green-leaf', 'common', '#3fa66b', '#3fa66b', 'leaf', ['Green Ring', '緑のリング', '绿色圆环']),
  I('i-blue-drop', 'common', '#3b82d6', '#3b82d6', 'drop', ['Blue Ring', '青いリング', '蓝色圆环']),
  // ---- アイコン: UNCOMMON(グラデーション) ----
  I('i-ember-flame', 'uncommon', '#ff9a3c', '#ff3d6e', 'flame', ['Ember Ring', '燃えるリング', '余烬圆环']),
  I('i-sun-crown', 'uncommon', '#ffd45a', '#ff9f43', 'crown', ['Sun Ring', '太陽のリング', '太阳圆环']),
  I('i-frost-diamond', 'uncommon', '#4fd1ff', '#7b5bff', 'diamond', ['Frost Ring', '氷のリング', '冰晶圆环']),
  I('i-meadow-leaf', 'uncommon', '#7ee08a', '#1fa39a', 'leaf', ['Meadow Ring', '草原のリング', '草地圆环']),
  // ---- 背景の飾り: COMMON(単色) ----
  D('d-sky', 'common', '#cfe3ff', '#cfe3ff', '', ['Sky', '空色', '天空蓝']),
  D('d-mint', 'common', '#cdeedd', '#cdeedd', '', ['Mint', 'ミント', '薄荷绿']),
  D('d-peach', 'common', '#ffdcc8', '#ffdcc8', '', ['Peach', 'もも色', '蜜桃色']),
  D('d-lilac', 'common', '#e1d5f7', '#e1d5f7', '', ['Lilac', 'ライラック', '丁香紫']),
  D('d-lemon', 'common', '#fff2b3', '#fff2b3', '', ['Lemon', 'レモン', '柠檬黄']),
  D('d-rose', 'common', '#ffd3df', '#ffd3df', '', ['Rose', 'ローズ', '玫瑰粉']),
  // ---- 背景の飾り: UNCOMMON(グラデーション) ----
  D('d-sunset', 'uncommon', '#ffd1a8', '#ffa6c9', '', ['Sunset', '夕焼け', '日落']),
  D('d-ocean', 'uncommon', '#a8e6ff', '#9aa8ff', '', ['Ocean', '海', '海洋']),
  D('d-forest', 'uncommon', '#c4f0c2', '#7fd1b9', '', ['Forest', '森', '森林']),
  D('d-dusk', 'uncommon', '#d6b8ff', '#8fb3ff', '', ['Dusk', '黄昏', '黄昏']),
  // ---- RARE(イラスト): アイコンのリング / 背景カード / 名札(名前の横)。同じ6つの題材で、セットになっている ----
  ...RARE_SET,
];
export const BY_ID = Object.fromEntries(ITEMS.map(i => [i.id, i]));
export const itemName = (item, lang) => item.names[{ en: 0, ja: 1, zh: 2 }[lang] ?? 0];

// ---- ガチャを1回引く(乱数は crypto から。レア度 → そのレア度の中から均等に) ----
const rand = () => crypto.getRandomValues(new Uint32Array(1))[0] / 4294967296;
export function pickRarity(r = rand()) { return r < RATES.common ? 'common' : r < RATES.common + RATES.uncommon ? 'uncommon' : 'rare'; }
export function pull(r1 = rand(), r2 = rand()) {
  const pool = ITEMS.filter(i => i.rarity === pickRarity(r1));
  return pool[Math.min(pool.length - 1, Math.floor(r2 * pool.length))];
}

// ---- 見た目 ----
const NS = 'http://www.w3.org/2000/svg';
// アイコン: 色の丸の中に、白い形(大きさは font-size で決まる)
export function iconEl(item, extraClass = '') {
  const s = document.createElement('span');
  s.className = `gx-icon ${extraClass}`.trim(); s.dataset.r = item.rarity;
  s.style.setProperty('--c1', item.c1); s.style.setProperty('--c2', item.c2);
  const svg = document.createElementNS(NS, 'svg'); svg.setAttribute('viewBox', '0 0 24 24'); svg.setAttribute('aria-hidden', 'true');
  const p = document.createElementNS(NS, 'path'); p.setAttribute('d', GLYPHS[item.glyph]); svg.append(p); s.append(svg);
  return s;
}
// 背景の飾り: 要素に、クラスと色を付ける(item が null なら外す)。中身の文字が読めるよう、上に薄い膜を重ねる(色は CSS 側)
export function applyDeco(node, item) {
  node.classList.remove('gx-deco', 'gx-img');
  node.removeAttribute('data-r');
  for (const k of ['--g', '--glow']) node.style.removeProperty(k);
  if (!item || item.type !== 'deco') return;
  if (item.img) {   // イラストの背景カード
    node.classList.add('gx-deco', 'gx-img'); node.dataset.r = item.rarity;
    node.style.setProperty('--g', `url("${item.img}") center / cover no-repeat`); node.style.setProperty('--glow', '#7c8cff');
    return;
  }
  const bg = item.rarity === 'common' ? item.c1
    : item.rarity === 'uncommon' ? `linear-gradient(135deg, ${item.c1}, ${item.c2})`
    : `linear-gradient(135deg, ${item.c1}, ${item.c2} 55%, ${item.c3})`;
  node.classList.add('gx-deco'); node.dataset.r = item.rarity;
  node.style.setProperty('--g', bg); node.style.setProperty('--glow', item.c2);
}

// アイコンの飾り枠: アバターのまわりに、リングと、角の小さな印を付ける(item が null なら外す)。リングの見た目は CSS(.gx-frame)
export function applyFrame(node, item) {
  node.classList.remove('gx-frame', 'gx-ringimg');
  node.removeAttribute('data-fr');
  node.querySelector(':scope > .gx-orn')?.remove();
  node.querySelector(':scope > .gx-ring')?.remove();
  for (const k of ['--c1', '--c2']) node.style.removeProperty(k);
  if (!item || item.type !== 'icon') return;
  if (item.img) {   // イラストのリング: アバターの上から重ねる(中は透明)
    node.classList.add('gx-frame', 'gx-ringimg'); node.dataset.fr = item.rarity;
    const im = document.createElement('img'); im.className = 'gx-ring'; im.src = item.img; im.alt = ''; im.decoding = 'async'; im.draggable = false;
    node.append(im); return;
  }
  node.classList.add('gx-frame'); node.dataset.fr = item.rarity;
  node.style.setProperty('--c1', item.c1); node.style.setProperty('--c2', item.c2);
  const orn = document.createElement('span'); orn.className = 'gx-orn'; orn.setAttribute('aria-hidden', 'true'); orn.append(iconEl(item));
  node.append(orn);
}
// 図鑑・結果に出す見本: 丸いアバターに、枠を付けたもの
export function frameSample(item, extraClass = '') {
  const s = document.createElement('span'); s.className = `gx-sample ${extraClass}`.trim();
  applyFrame(s, item); return s;
}

// 名札: 名前の横に、小さく並べる(item が null なら外す)。node の中に <img> を足す
export function applyPlate(node, item) {
  node.querySelectorAll(':scope > .gx-plate').forEach(n => n.remove());
  if (!item || item.type !== 'plate') return;
  const im = document.createElement('img'); im.className = 'gx-plate'; im.src = item.img; im.alt = item.names[0]; im.decoding = 'async'; im.draggable = false;
  node.append(im);
}
export const plateImg = item => { const im = document.createElement('img'); im.className = 'gx-plate flat'; im.src = item.img; im.alt = item.names[0]; im.decoding = 'async'; im.draggable = false; return im; };
