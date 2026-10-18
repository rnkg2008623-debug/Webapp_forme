// プロフィール画面の集計(ブラウザ依存なしの純粋な関数)。日付の区切りは利用者のローカル時間。
const pad = n => String(n).padStart(2, '0');
export const dayKey = d => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
const addDays = (d, n) => { const x = new Date(d.getFullYear(), d.getMonth(), d.getDate() + n); return x; };

// logs: [{ at: Date, minutes: number, pomodoros?: number, title?: string }]
export function minutesByDay(logs) {
  const map = new Map();
  for (const l of logs) map.set(dayKey(l.at), (map.get(dayKey(l.at)) || 0) + (l.minutes || 0));
  return map;
}

export function computeStats(logs, now = new Date()) {
  const byDay = minutesByDay(logs);
  // streak: 今日(まだ記録がなければ昨日)から、記録のある日が連続している日数
  let cursor = byDay.get(dayKey(now)) ? now : addDays(now, -1);
  let streak = 0;
  while (byDay.get(dayKey(cursor))) { streak++; cursor = addDays(cursor, -1); }
  const totalMinutes = logs.reduce((s, l) => s + (l.minutes || 0), 0);
  const pomodoros = logs.reduce((s, l) => s + (l.pomodoros || 0), 0);
  let week = 0;
  for (let i = 0; i < 7; i++) week += byDay.get(dayKey(addDays(now, -i))) || 0;
  return { streak, totalHours: totalMinutes / 60, pomodoros, weekAvgHours: week / 7 / 60 };
}

// 直近 days 日分の、1日ごとの学習時間(時間)。最後の要素が今日。
export function dailySeries(logs, days, now = new Date()) {
  const byDay = minutesByDay(logs);
  return Array.from({ length: days }, (_, i) => {
    const date = addDays(now, i - (days - 1));
    return { date, hours: (byDay.get(dayKey(date)) || 0) / 60 };
  });
}

// グラフの縦軸の上限(キリのいい値)と目盛り
export function niceScale(maxValue, ticks = 4) {
  const max = Math.max(maxValue, 1);
  const raw = max / ticks;
  const mag = 10 ** Math.floor(Math.log10(raw));
  const step = [1, 2, 2.5, 5, 10].map(m => m * mag).find(s => s >= raw);
  return { step, max: step * Math.ceil(max / step) };
}

export function relativeTime(date, now = new Date()) {
  const s = Math.max(0, Math.round((now - date) / 1000));
  if (s < 60) return 'たった今';
  const m = Math.floor(s / 60);
  if (m < 60) return `${m}分前`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}時間前`;
  const d = Math.round((new Date(now.getFullYear(), now.getMonth(), now.getDate()) - new Date(date.getFullYear(), date.getMonth(), date.getDate())) / 86400000);
  if (d === 1) return '昨日';
  if (d < 7) return `${d}日前`;
  return `${date.getFullYear()}/${pad(date.getMonth() + 1)}/${pad(date.getDate())}`;
}

// 画面確認用のサンプル(保存はしない)。日付から決まるので毎回同じ形になる。
export function sampleLogs(now = new Date()) {
  const titles = ['英語 リスニング', '数学 演習', '物理 復習', '世界史 まとめ', '化学 問題集', '英単語'];
  const logs = [];
  for (let i = 0; i < 40; i++) {
    if (i % 9 === 5) continue; // ところどころ休む
    const at = addDays(now, -i);
    at.setHours(9 + ((i * 5) % 11), (i * 13) % 60, 0, 0);
    if (at > now) at.setTime(now.getTime() - 5 * 60000);
    const minutes = 25 * (1 + ((i * 3) % 5));
    logs.push({ id: `s${i}`, title: titles[i % titles.length], minutes, pomodoros: Math.round(minutes / 25), at });
  }
  return logs;
}
