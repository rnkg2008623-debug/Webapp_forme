// AFK の経済: 売却のコイン、アップグレード、クエスト。計算だけをここに置く(画面は afk.js)。
import { pickRarity, higherRarity, pullFrom, rand } from './gacha-items.js?v=115';

// レア度ごとの売却のコイン(1個あたり)
export const SELL = { common: 5, uncommon: 25, rare: 100, epic: 500, legendary: 1000, mythic: 2500, exalted: 5000, divine: 7500, celestial: 10000, transcendent: 15000, eternal: 20000, primordial: 30000 };
// アップグレード: レベル0〜10。costs[n] = レベル n に上げるための値段、values[n] = レベル n のときの効果
export const UPGRADES = {
  interval: { unit: 's', costs: [0, 100, 200, 300, 400, 500, 750, 1000, 2500, 5000, 10000], values: [15, 14, 13, 12, 11, 10, 9, 8, 7, 6, 5] },
  dupe: { unit: '%', costs: [0, 50, 100, 250, 500, 1000, 1250, 2500, 5000, 7500, 12500], values: [0, 0.01, 0.05, 0.1, 0.4, 0.8, 1, 2, 3, 4, 5] },
  dpull: { unit: '%', costs: [0, 50, 150, 250, 500, 1000, 1250, 2500, 3750, 5000, 7500], values: [1, 2, 3, 3.5, 4, 5, 6, 7, 8, 9, 10] },
  sell: { unit: '%', costs: [0, 100, 200, 350, 500, 1000, 1500, 3000, 5000, 7500, 10000], values: [0, 10, 20, 30, 40, 50, 60, 70, 80, 90, 100] },
  rank: { unit: '%', costs: [0, 250, 400, 600, 850, 1000, 1500, 3000, 5000, 7500, 10000], values: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10] },
};
export const UPGRADE_KEYS = Object.keys(UPGRADES);
export const MAX_LEVEL = 10;
export const newLevels = () => Object.fromEntries(UPGRADE_KEYS.map(k => [k, 0]));
export const clampLevels = o => Object.fromEntries(UPGRADE_KEYS.map(k => [k, Math.max(0, Math.min(MAX_LEVEL, Math.floor(+o?.[k]) || 0))]));
export const effect = (lv, key) => UPGRADES[key].values[lv[key]];
export const intervalSec = lv => effect(lv, 'interval');
export const nextCost = (lv, key) => (lv[key] >= MAX_LEVEL ? null : UPGRADES[key].costs[lv[key] + 1]);
export const sellPrice = (rarity, lv) => Math.round(SELL[rarity] * (1 + effect(lv, 'sell') / 100));

// ガチャ1回ぶん: ダブル引き(同時に2回)→ 各回に、ランクアップ(レア度+1)→ おまけ(同じものを、もう1個)
export function rollPulls(lv, rng = rand) {
  const twice = rng() < effect(lv, 'dpull') / 100, out = [];
  for (let i = 0; i < (twice ? 2 : 1); i++) {
    let rarity = pickRarity(rng()), ranked = false;
    if (rng() < effect(lv, 'rank') / 100) { const up = higherRarity(rarity); if (up !== rarity) { rarity = up; ranked = true; } }
    const item = pullFrom(rarity, rng());
    out.push({ item, ranked, dupe: rng() < effect(lv, 'dupe') / 100, twice });
  }
  return out;
}

// ---- 日付 ----
const pad = n => String(n).padStart(2, '0');
export const dayKey = (d = new Date()) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
export const dayStart = (d = new Date()) => new Date(d.getFullYear(), d.getMonth(), d.getDate());
export function weekStart(d = new Date()) { const x = dayStart(d); x.setDate(x.getDate() - (x.getDay() + 6) % 7); return x; }   // 月曜日の0時
export const weekKey = d => dayKey(weekStart(d));
export const isWakeWindow = (d = new Date()) => { const m = d.getHours() * 60 + d.getMinutes(); return m >= 180 && m < 375; };   // 3:00 以上、6:15 より前

// ---- クエスト(勉強時間は、学習ログの合計) ----
export const DAILY = [{ id: 'd2', hours: 2, coins: 100 }, { id: 'd4', hours: 4, coins: 200 }, { id: 'd6', hours: 6, coins: 200 }, { id: 'd8', hours: 8, coins: 200 }];
export const WAKE = { id: 'wake', coins: 100 };
export const WEEKLY = [{ id: 'w30', hours: 30, coins: 300 }, { id: 'w50', hours: 50, coins: 500 }, { id: 'w55', hours: 55, coins: 800 }];
export const newQuests = (now = new Date()) => ({ day: dayKey(now), dClaimed: [], wake: false, wakeClaimed: false, week: weekKey(now), wClaimed: [] });
// 日付・週が変わっていたら、その分をリセットする
export function normalizeQuests(q, now = new Date()) {
  const fresh = newQuests(now), out = { ...fresh, ...(q || {}) };
  if (out.day !== fresh.day) { out.day = fresh.day; out.dClaimed = []; out.wake = false; out.wakeClaimed = false; }
  if (out.week !== fresh.week) { out.week = fresh.week; out.wClaimed = []; }
  out.dClaimed = (Array.isArray(out.dClaimed) ? out.dClaimed : []).filter(id => DAILY.some(x => x.id === id));
  out.wClaimed = (Array.isArray(out.wClaimed) ? out.wClaimed : []).filter(id => WEEKLY.some(x => x.id === id));
  out.wake = !!out.wake; out.wakeClaimed = !!out.wakeClaimed;
  return out;
}
// ログ(at: Date, minutes)から、今日と今週の勉強時間(分)
export function studiedMinutes(logs, now = new Date()) {
  const d0 = dayStart(now).getTime(), w0 = weekStart(now).getTime();
  let today = 0, week = 0;
  for (const l of logs) { const ms = l.at instanceof Date ? l.at.getTime() : NaN; if (!(ms >= w0)) continue; const m = Number(l.minutes) || 0; week += m; if (ms >= d0) today += m; }
  return { today, week };
}
