// AFK のガチャの景品。題材ごとに、アイコンのリング(icon)・背景カード(deco)・名札(plate)の3つ。
// レア度: COMMON(70%)=淡い色(灰紫) / UNCOMMON(25%)=緑 / RARE(5%)=青の光(イラスト素材 img/gacha/)。
// id は Firestore(users/{uid} の icon / deco / plate)にも入るので、英小文字・数字・ハイフンだけにする(firestore.rules の形式と同じ)。
// レア度は13段階(上に行くほど出にくい)。確率は(%)。画像の素材がまだないレア度は、素材が届くまで、出ない扱い(下の pickRarity を参照)
export const RARITIES = ['common', 'uncommon', 'rare', 'epic', 'legendary', 'mythic', 'exalted', 'divine', 'celestial', 'transcendent', 'eternal', 'singularity', 'primordial'];
export const RATES_PCT = {
  common: 95.123367, uncommon: 4, rare: 0.666667, epic: 0.133333, legendary: 0.04, mythic: 0.02, exalted: 0.01, divine: 0.003333,
  celestial: 0.002, transcendent: 0.001, eternal: 0.000333, singularity: 0.0002, primordial: 0.0001,
};
export const RARITY_LABEL = Object.fromEntries(RARITIES.map(r => [r, r.toUpperCase()]));
// 表示用の色(CSS の --rc にも同じ色)
export const RARITY_COLOR = { common: '#cfd3e8', uncommon: '#6ee7a0', rare: '#6aa8ff', epic: '#b794ff', legendary: '#f5c24c', mythic: '#ff5c8a', exalted: '#d9ccff', divine: '#ffe9a8', celestial: '#7d8cff', transcendent: '#c08cff', eternal: '#9fd8ff', singularity: '#f0e6ff', primordial: '#ffd98a' };
export const ID_PATTERN = /^[a-z0-9-]{1,32}$/;

// イラスト素材(img/gacha/)。題材ごとに、リング・背景カード・名札の3つ(COMMON 〜 EXALTED)
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
const TITLES_EPIC = [
  ['master-of-illusions', ['Master of Illusions', 'マスター・オブ・イリュージョン', '幻象大师']],
  ['the-fallen-knight', ['The Fallen Knight', 'ザ・フォールン・ナイト', '堕落骑士']],
  ['lord-of-shadows', ['Lord of Shadows', 'ロード・オブ・シャドウズ', '暗影之主']],
  ['keeper-of-secrets', ['Keeper of Secrets', 'キーパー・オブ・シークレッツ', '秘密守护者']],
  ['the-unbroken', ['The Unbroken', 'ジ・アンブロークン', '不屈者']],
  ['harbinger-of-dawn', ['Harbinger of Dawn', 'ハービンジャー・オブ・ドーン', '黎明先驱']],
];
const TITLES_LEGENDARY = [
  ['the-uncrowned-king', ['The Uncrowned King', '戴冠なき王', '无冕之王']],
  ['dragon-sovereign', ['Dragon Sovereign', 'ドラゴン・ソブリン', '龙之君主']],
  ['the-conqueror', ['The Conqueror', 'ザ・コンカラー', '征服者']],
  ['the-chosen-one', ['The Chosen One', '選ばれし者', '天选之人']],
  ['emperor-of-ashes', ['Emperor of Ashes', '灰の皇帝', '灰烬皇帝']],
  ['the-last-guardian', ['The Last Guardian', '最後の守護者', '最后的守护者']],
];
const TITLES_MYTHIC = [
  ['the-immortal', ['The Immortal', '不死なる者', '不朽者']],
  ['the-godslayer', ['The Godslayer', '神殺し', '弑神者']],
  ['herald-of-chaos', ['Herald of Chaos', 'ヘラルド・オブ・カオス', '混沌使者']],
  ['heir-of-the-titans', ['Heir of the Titans', '巨人の継承者', '泰坦后裔']],
  ['the-abyssal-monarch', ['The Abyssal Monarch', '深淵の君主', '深渊君主']],
  ['oracle-of-destiny', ['Oracle of Destiny', '運命の神託', '命运神谕']],
];
const TITLES_EXALTED = [
  ['the-ascended', ['The Ascended', '昇天者', '飞升者']],
  ['the-enlightened', ['The Enlightened', '悟りを得た者', '觉悟者']],
  ['the-supreme-one', ['The Supreme One', '至高の存在', '至高者']],
  ['the-unrivaled', ['The Unrivaled', '並ぶ者なき者', '无双者']],
  ['sovereign-of-order', ['Sovereign of Order', '秩序の君主', '秩序之主']],
  ['the-perfect-being', ['The Perfect Being', '完全なる存在', '完美存在']],
];
const TITLES_DIVINE = [
  ['god-of-wisdom', ['God of Wisdom', '知恵の神', '智慧之神']],
  ['god-of-creation', ['God of Creation', '創造の神', '创造之神']],
  ['god-of-destruction', ['God of Destruction', '破壊の神', '毁灭之神']],
  ['god-of-judgment', ['God of Judgment', '審判の神', '审判之神']],
  ['god-of-dreams', ['God of Dreams', '夢の神', '梦之神']],
  ['god-of-harmony', ['God of Harmony', '調和の神', '和谐之神']],
];
const TITLES_CELESTIAL = [
  ['ruler-of-the-stars', ['Ruler of the Stars', '星々の統治者', '群星统治者']],
  ['monarch-of-the-cosmos', ['Monarch of the Cosmos', '宇宙の君主', '宇宙君主']],
  ['keeper-of-the-heavens', ['Keeper of the Heavens', '天界の番人', '天界守护者']],
  ['architect-of-galaxies', ['Architect of Galaxies', '銀河の設計者', '星系建筑师']],
  ['sovereign-of-the-moon', ['Sovereign of the Moon', '月の君主', '月之君主']],
  ['the-astral-emperor', ['The Astral Emperor', '星界の皇帝', '星界皇帝']],
];
const TITLES_TRANSCENDENT = [
  ['the-unbound', ['The Unbound', '解き放たれし者', '无拘者']],
  ['the-omniscient', ['The Omniscient', '全知なる者', '全知者']],
  ['the-omnipresent', ['The Omnipresent', '遍在する者', '无所不在者']],
  ['weaver-of-reality', ['Weaver of Reality', '現実を紡ぐ者', '现实编织者']],
  ['architect-of-dimensions', ['Architect of Dimensions', '次元の設計者', '维度建筑师']],
  ['the-one-beyond', ['The One Beyond', '彼方なる者', '彼岸之人']],
];
const TITLES_ETERNAL = [
  ['the-everlasting', ['The Everlasting', '永遠なる者', '永恒者']],
  ['the-timeless', ['The Timeless', '時を超えし者', '超越时间者']],
  ['the-immutable', ['The Immutable', '不変なる者', '不变者']],
  ['the-endless-sovereign', ['The Endless Sovereign', '終わりなき君主', '无尽君主']],
  ['the-undying-monarch', ['The Undying Monarch', '不滅の王', '不死君主']],
  ['the-infinite-one', ['The Infinite One', '無限なる者', '无限者']],
];
const TITLES_SINGULARITY = [
  ['the-absolute', ['The Absolute', '絶対者', '绝对者']],
  ['the-nameless', ['The Nameless', '名もなき者', '无名者']],
  ['the-undefined', ['The Undefined', '未定義なる者', '未定义者']],
  ['the-one-and-only', ['The One and Only', '唯一無二', '独一无二']],
  ['the-final-observer', ['The Final Observer', '最後の観測者', '最终观测者']],
  ['the-origin-of-all', ['The Origin of All', '万物の起源', '万物之源']],
];
const TITLES_PRIMORDIAL = [
  ['ruler-of-time', ['Ruler of Time', '時の支配者', '时间主宰']],
  ['ruler-of-death', ['Ruler of Death', '死の支配者', '死亡主宰']],
  ['ruler-of-life', ['Ruler of Life', '生命の支配者', '生命主宰']],
  ['ruler-of-space', ['Ruler of Space', '空間の支配者', '空间主宰']],
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
const EPIC_SET = setOf('epic', TITLES_EPIC), LEGENDARY_SET = setOf('legendary', TITLES_LEGENDARY), MYTHIC_SET = setOf('mythic', TITLES_MYTHIC), EXALTED_SET = setOf('exalted', TITLES_EXALTED);
const DIVINE_SET = setOf('divine', TITLES_DIVINE), CELESTIAL_SET = setOf('celestial', TITLES_CELESTIAL), TRANSCENDENT_SET = setOf('transcendent', TITLES_TRANSCENDENT), ETERNAL_SET = setOf('eternal', TITLES_ETERNAL), SINGULARITY_SET = setOf('singularity', TITLES_SINGULARITY), PRIMORDIAL_SET = setOf('primordial', TITLES_PRIMORDIAL);
export const ITEMS = [
  // ---- COMMON(イラスト・淡い色): リング・背景カード・名札 ----
  ...COMMON_SET,
  // ---- UNCOMMON(イラスト・緑): リング・背景カード・名札 ----
  ...UNCOMMON_SET,
  // ---- RARE(イラスト): アイコンのリング / 背景カード / 名札(名前の横)。同じ6つの題材で、セットになっている ----
  ...RARE_SET,
  // ---- EPIC(紫) / LEGENDARY(金) / MYTHIC(深紅と紫) / EXALTED(白と紫と金) ----
  ...EPIC_SET, ...LEGENDARY_SET, ...MYTHIC_SET, ...EXALTED_SET,
  // ---- DIVINE(白と金) / CELESTIAL(宇宙の紺) / TRANSCENDENT(紫の光) / ETERNAL(白い花と時) / SINGULARITY(黒と白の光) ----
  ...DIVINE_SET, ...CELESTIAL_SET, ...TRANSCENDENT_SET, ...ETERNAL_SET, ...SINGULARITY_SET,
  // ---- PRIMORDIAL(最高): 時・死・生命・空間の4題材(リング・背景カード・名札) ----
  ...PRIMORDIAL_SET,
];
export const BY_ID = Object.fromEntries(ITEMS.map(i => [i.id, i]));
export const itemName = (item, lang) => item.names[{ en: 0, ja: 1, zh: 2 }[lang] ?? 0];

// ---- ガチャを1回引く(乱数は crypto から。レア度 → そのレア度の中から均等に) ----
const rand = () => crypto.getRandomValues(new Uint32Array(1))[0] / 4294967296;
// 景品があるレア度だけが、対象。素材がまだないレア度の分は、あるレア度の中で、確率に応じて按分される(例: いまは COMMON / UNCOMMON / RARE だけ)
export const availableRarities = () => RARITIES.filter(r => ITEMS.some(i => i.rarity === r));
export function effectiveRates() {
  const av = availableRarities(), total = av.reduce((s, r) => s + RATES_PCT[r], 0);
  return Object.fromEntries(av.map(r => [r, RATES_PCT[r] / total]));
}
export function pickRarity(x = rand()) {
  const rates = effectiveRates(); let acc = 0, last = 'common';
  for (const r of RARITIES) { if (!(r in rates)) continue; acc += rates[r]; last = r; if (x < acc) return r; }
  return last;
}
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
  const im = document.createElement('img'); im.className = 'gx-ring'; im.src = item.img; im.alt = ''; im.decoding = 'async'; im.loading = 'lazy'; im.draggable = false;
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
  const im = document.createElement('img'); im.className = 'gx-plate'; im.src = item.img; im.alt = item.names[0]; im.decoding = 'async'; im.loading = 'lazy'; im.draggable = false;
  node.append(im);
}
export const plateImg = item => { const im = document.createElement('img'); im.className = 'gx-plate flat'; im.src = item.img; im.alt = item.names[0]; im.decoding = 'async'; im.loading = 'lazy'; im.draggable = false; return im; };
