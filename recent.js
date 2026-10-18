// ホームの Recent log: 自分と友だちの最近の学習ログを、新しい順に並べる(ボックスの中をスクロールして、好きなだけ見られる)
import { onState } from './friends-ui.js?v=24';
import { onLogs, feedLogs, setFriends, ownerId } from './logs-store.js?v=24';
import { relativeTime } from './stats.js?v=24';

const list = document.getElementById('recent-list');
let state = null;

const docIcon = () => {
  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  svg.setAttribute('viewBox', '0 0 24 24');
  const p1 = document.createElementNS(svg.namespaceURI, 'path'); p1.setAttribute('d', 'M6 2.5h8l5 5V20a1.5 1.5 0 0 1-1.5 1.5h-11A1.5 1.5 0 0 1 5 20V4A1.5 1.5 0 0 1 6 2.5z');
  const p2 = document.createElementNS(svg.namespaceURI, 'path'); p2.setAttribute('d', 'M14 2.5V8h5M8.5 13h7M8.5 16.5h7');
  svg.append(p1, p2);
  return svg;
};
function el(tag, className, text) {
  const n = document.createElement(tag);
  if (className) n.className = className;
  if (text != null) n.textContent = text;
  return n;
}

function render() {
  const logs = feedLogs(60);
  const items = logs.map(l => {
    const mine = l.owner === ownerId();
    const who = mine ? 'あなた' : (state?.profiles[l.owner]?.name ?? '…');
    const li = el('li', mine ? '' : 'friend');
    const body = el('div');
    body.append(el('div', 'name', l.title), el('div', 'date', `${who} ・ ${l.minutes}分 ・ ${relativeTime(l.at)}`));
    li.title = l.description || '';
    li.append(docIcon(), body);
    return li;
  });
  list.replaceChildren(...(items.length ? items : [el('li', 'empty', 'まだログがありません。Timer や Pomodoro を終えると、ここに表示されます。')]));
}

export function mountRecent() {
  onState(s => { state = s; setFriends(s.friends.map(f => f.uid)); render(); });
  onLogs(render);
  setInterval(render, 60000);   // 「5分前」などを更新
}
