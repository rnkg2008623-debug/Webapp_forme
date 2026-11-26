// AFK のガチャの景品。題材ごとに、アイコンのリング(icon)・背景カード(deco)・名札(plate)の3つ。
// レア度: COMMON(70%)=淡い色(灰紫) / UNCOMMON(25%)=緑 / RARE(5%)=青の光(イラスト素材 img/gacha/)。
// id は Firestore(users/{uid} の icon / deco / plate)にも入るので、英小文字・数字・ハイフンだけにする(firestore.rules の形式と同じ)。
export const RARITIES = ['common', 'uncommon', 'rare'];
export const RATES = { common: 0.70, uncommon: 0.25, rare: 0.05 };
export const RARITY_LABEL = { common: 'COMMON', uncommon: 'UNCOMMON', rare: 'RARE' };
export const ID_PATTERN = /^[a-z0-9-]{1,32}$/;

// イラスト素材(img/gacha/)。題材ごとに、リング・背景カード・名札の3つ(COMMON / UNCOMMON / RARE)
const TITLES_COMMON = [
  ['newcomer', ['Newcomer', 'ニューカマー', '新人']],
  ['wanderer', ['Wanderer', 'ワンダラー', '流浪者']],
  ['apprentice', ['Apprentice', 'アプレンティス', '学徒']],
  ['traveler', ['Traveler', 'トラベラー', '旅行者']],
  ['explorer', ['Explorer', 'エクスプローラー', '探险家']],
  ['dreamer', ['Dreamer', 'ドリーマー', '梦想者']],
];
const TITLES_UNCOMMON = [
  ['pathfinder', ['Pathfinder', 'パスファインダー', '开路者']],
  ['night-walker', ['Night Walker', 'ナイトウォーカー', '夜行者']],
  ['seeker-of-truth', ['Seeker of Truth', 'シーカー・オブ・トゥルース', '求真者']],
  ['silent-observer', ['Silent Observer', 'サイレントオブザーバー', '静默观察者']],
  ['rising-star', ['Rising Star', 'ライジングスター', '新星']],
  ['fortune-seeker', ['Fortune Seeker', 'フォーチュンシーカー', '寻运者']],
];
const TITLES = [
  ['shadow-walker', ['Shadow Walker', 'シャドウウォーカー', '暗影行者']],
  ['flame-keeper', ['Flame Keeper', 'フレイムキーパー', '炎之守护者']],
  ['moonlight-guardian', ['Moonlight Guardian', 'ムーンライトガーディアン', '月光守卫']],
  ['stormbringer', ['Stormbringer', 'ストームブリンガー', '风暴使者']],
  ['fate-seeker', ['Fate Seeker', 'フェイトシーカー', '寻命者']],
  ['the-fearless', ['The Fearless', 'ザ・フィアレス', '无畏者']],
];
const IMG = 'img/gacha/';
const setOf = (rarity, titles) => titles.flatMap(([slug, names]) => [
  { id: `i-${slug}`, type: 'icon', rarity, img: `${IMG}ring-${slug}.webp`, names },
  { id: `d-${slug}`, type: 'deco', rarity, img: `${IMG}bg-${slug}.webp`, names },
  { id: `p-${slug}`, type: 'plate', rarity, img: `${IMG}plate-${slug}.webp`, names },
]);
const COMMON_SET = setOf('common', TITLES_COMMON), UNCOMMON_SET = setOf('uncommon', TITLES_UNCOMMON), RARE_SET = setOf('rare', TITLES);
export const ITEMS = [
  // ---- COMMON(イラスト・淡い色): リング・背景カード・名札 ----
  ...COMMON_SET,
  // ---- UNCOMMON(イラスト・緑): リング・背景カード・名札 ----
  ...UNCOMMON_SET,
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

// ---- 見た目(全部、イラスト素材 img/gacha/ の画像) ----
// 背景カード: 要素に、クラスと画像を付ける(item が null なら外す)。文字が読めるよう、上に薄い膜を重ねる(CSS の .gx-img)
export function applyDeco(node, item) {
  node.classList.remove('gx-deco', 'gx-img');
  node.removeAttribute('data-r');
  node.style.removeProperty('--g');
  if (!item || item.type !== 'deco') return;
  node.classList.add('gx-deco', 'gx-img'); node.dataset.r = item.rarity;
  node.style.setProperty('--g', `url("${item.img}") center / cover no-repeat`);
}
// アイコンのリング: アバターの上から重ねる画像(中は透明)。item が null なら外す
export function applyFrame(node, item) {
  node.classList.remove('gx-frame', 'gx-ringimg');
  node.removeAttribute('data-fr');
  node.querySelector(':scope > .gx-ring')?.remove();
  if (!item || item.type !== 'icon') return;
  node.classList.add('gx-frame', 'gx-ringimg'); node.dataset.fr = item.rarity;
  const im = document.createElement('img'); im.className = 'gx-ring'; im.src = item.img; im.alt = ''; im.decoding = 'async'; im.draggable = false;
  node.append(im);
}
// 図鑑・結果に出す見本: 丸いアバターに、リングを付けたもの
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
