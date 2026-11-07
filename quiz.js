// Practice の問題集の画面(A1.2.3 Logic Gates)。1問ずつ答えて「Submit Answer」で採点基準を表示する。進み具合は、このブラウザに保存する。
import { SECTIONS, QUESTIONS, QUIZ_META } from './quiz-data.js?v=79';

export const QUIZ_CODES = [QUIZ_META.code];
export const quizTotal = code => (code === QUIZ_META.code ? QUIZ_META.total : 0);
const N = QUESTIONS.length;
const storeKey = code => `csq:${code}`;
const esc = s => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const fmt = s => esc(s).replace(/\*\*(.+?)\*\*/g, '<b>$1</b>').replace(/\*(.+?)\*/g, '<i>$1</i>');
const norm = s => String(s).toLowerCase().replace(/[\s·.*×&()]/g, '');

function load(code) {
  try { const v = JSON.parse(localStorage.getItem(storeKey(code))); if (v && typeof v === 'object') return { pos: 0, ans: {}, mk: {}, done: {}, flag: {}, ...v }; } catch { /* 無視 */ }
  return { pos: 0, ans: {}, mk: {}, done: {}, flag: {} };
}
const save = (code, st) => { try { localStorage.setItem(storeKey(code), JSON.stringify(st)); } catch { /* 無視 */ } };

// ---- 採点 ----
function partEarned(part, m) {
  if (m == null) return 0;
  if (part.type === 'text') return (Array.isArray(m) ? m : []).filter(Boolean).length;
  if (part.type === 'short') return m ? 1 : 0;
  return Math.max(0, Math.min(part.marks, Number(m) || 0));   // table / band
}
const qEarned = (st, qi) => QUESTIONS[qi].parts.reduce((n, p, pi) => n + partEarned(p, st.mk[qi]?.[pi]), 0);
const qTotal = qi => QUESTIONS[qi].parts.reduce((n, p) => n + p.marks, 0);
function totals(st) {
  let earned = 0, answered = 0;
  for (let i = 0; i < N; i++) if (st.done[i]) { earned += qEarned(st, i); answered++; }
  return { earned, answered, total: QUIZ_META.total };
}
// Practice の一覧・Overall 用: この問題集の得点(まだ何も解いていなければ null)
export function quizScore(code) {
  if (code !== QUIZ_META.code) return null;
  const st = load(code); const t = totals(st);
  return t.answered ? { earned: t.earned, total: t.total, answered: t.answered, pct: Math.round(t.earned / t.total * 100) } : null;
}

function autoMark(st, qi) {
  const q = QUESTIONS[qi]; st.mk[qi] = st.mk[qi] || {};
  q.parts.forEach((p, pi) => {
    if (st.mk[qi][pi] != null && st.done[qi]) return;
    const a = st.ans[qi]?.[pi];
    if (p.type === 'short') st.mk[qi][pi] = a != null && p.accept.includes(norm(a));
    else if (p.type === 'table') {
      const user = Array.isArray(a) ? a : [];
      const wrong = p.rows.filter((r, ri) => user[ri] !== String(r[r.length - 1])).length;
      st.mk[qi][pi] = Math.max(0, p.marks - (p.marks === 1 ? (wrong ? 1 : 0) : Math.ceil(wrong / 2)));
    } else st.mk[qi][pi] = p.type === 'text' ? p.pts.map(() => false) : 0;
  });
}

export function mountQuiz(root, code, api) {
  const st = load(code);
  const save1 = () => save(code, st);
  root.innerHTML = `
    <div class="cs-crumb">${api.icon('home', 'sm')}<a data-go="practice" href="#">Practice</a>${api.icon('chev', 'sm')}<a data-go="pa:A1" href="#">A1</a>${api.icon('chev', 'sm')}<span>${QUIZ_META.code} ${esc(QUIZ_META.title)}</span></div>
    <div class="cq-head">
      <div class="cs-mtitle">${api.icon('chip', 'huge')}<div><h2><i>${QUIZ_META.code}</i> <em>${esc(QUIZ_META.title)}</em></h2><p class="cq-sub">Practice Quiz</p></div></div>
      <div class="cs-overall panel cq-prog" id="cq-prog"></div>
    </div>
    <div class="cq-stage">
      <button class="cq-arrow" id="cq-prev" aria-label="Previous question">${api.icon('chev', 'flip')}</button>
      <div class="cq-card" id="cq-card"></div>
      <button class="cq-arrow" id="cq-next" aria-label="Next question">${api.icon('chev')}</button>
    </div>
    <div class="cq-dots" id="cq-dots" role="tablist" aria-label="Questions"></div>
    <div class="cq-bar"><button class="cs-btn cq-exit" id="cq-exit"><span>${api.icon('arrow', 'sm flip')} Exit</span></button><button class="cs-btn solid cq-submit" id="cq-submit"><span></span></button></div>`;
  const $ = id => root.querySelector('#' + id);
  const clamp = i => Math.max(0, Math.min(N, i));

  // ---- 描画 ----
  function paintProgress() {
    const t = totals(st), pct = Math.round(t.earned / t.total * 100);
    $('cq-prog').innerHTML = `<div class="ring big" style="--p:${pct}"><span>${pct}%</span></div><div><b>Section Progress</b><p><strong>${t.earned}</strong> / ${t.total} marks · ${t.answered} / ${N} answered</p></div>`;
  }
  function paintDots() {
    $('cq-dots').innerHTML = QUESTIONS.map((q, i) => {
      const full = st.done[i] ? (qEarned(st, i) === qTotal(i) ? 'full' : qEarned(st, i) > 0 ? 'part' : 'zero') : '';
      return `<button class="cq-dot ${full} ${i === st.pos ? 'now' : ''} ${st.flag[i] ? 'flag' : ''}" data-goto="${i}" aria-label="Question ${i + 1}" title="Q${i + 1}"></button>`;
    }).join('') + `<button class="cq-dot sum ${st.pos === N ? 'now' : ''}" data-goto="${N}" aria-label="Results" title="Results"></button>`;
  }
  function partInput(qi, pi, p) {
    const done = st.done[qi], a = st.ans[qi]?.[pi];
    const lab = p.label ? `<div class="cq-plabel">${esc(p.label)} <small>[${p.marks}]</small></div>` : '';
    if (p.type === 'text' || p.type === 'band') return `${lab}<textarea class="cq-ta" data-p="${pi}" rows="${p.type === 'band' ? 7 : 3}" placeholder="${esc(p.placeholder || 'Write your answer here…')}" ${done ? 'readonly' : ''}>${esc(a || '')}</textarea>`;
    if (p.type === 'short') return `${lab}<input class="cq-in" data-p="${pi}" type="text" autocomplete="off" spellcheck="false" placeholder="Your answer" value="${esc(a || '')}" ${done ? 'readonly' : ''}>`;
    const user = Array.isArray(a) ? a : [];
    return `<table class="cq-tt"><thead><tr>${p.inputs.map(x => `<th>${x}</th>`).join('')}<th class="out">${p.out}</th></tr></thead><tbody>${p.rows.map((r, ri) => `<tr>${r.slice(0, -1).map(b => `<td>${b}</td>`).join('')}<td class="out"><button type="button" class="cq-cell ${user[ri] === '0' || user[ri] === '1' ? 'set' : ''}" data-p="${pi}" data-row="${ri}" ${done ? 'disabled' : ''}>${user[ri] === '0' || user[ri] === '1' ? user[ri] : '–'}</button></td></tr>`).join('')}</tbody></table><p class="cq-note">Click the output cells to set 0 or 1.${p.note ? ' ' + esc(p.note) : ''}</p>`;
  }
  function partMarking(qi, pi, p) {
    const m = st.mk[qi]?.[pi];
    if (p.type === 'text') return `<ul class="cq-pts">${p.pts.map((pt, k) => `<li><label><input type="checkbox" data-mp="${pi}" data-k="${k}" ${m?.[k] ? 'checked' : ''}> <span>${esc(pt)} <small>[1]</small></span></label></li>`).join('')}</ul><p class="cq-model">${esc(p.model)}</p>`;
    if (p.type === 'short') return `<p class="cq-model"><b>Answer:</b> ${esc(p.answer)}</p><label class="cq-own"><input type="checkbox" data-mp="${pi}" ${m ? 'checked' : ''}> <span>${m ? 'Correct' : 'Count as correct'} <small>[1]</small></span></label>`;
    if (p.type === 'table') {
      const user = st.ans[qi]?.[pi] || [];
      return `<table class="cq-tt cq-key"><thead><tr>${p.inputs.map(x => `<th>${x}</th>`).join('')}<th class="out">${p.out}</th><th>You</th></tr></thead><tbody>${p.rows.map((r, ri) => { const ok = user[ri] === String(r[r.length - 1]); return `<tr>${r.map((b, bi) => `<td class="${bi === r.length - 1 ? 'out' : ''}">${b}</td>`).join('')}<td class="you ${ok ? 'ok' : 'bad'}">${user[ri] ?? '–'}</td></tr>`; }).join('')}</tbody></table><p class="cq-note"><b>${partEarned(p, m)} / ${p.marks}</b> marks (marked automatically)</p>`;
    }
    return `<ul class="cq-guide">${p.guide.map(g => `<li>${esc(g)}</li>`).join('')}</ul><p class="cq-model">${esc(p.bands)}</p><label class="cq-own">Your mark: <select data-mp="${pi}" data-band>${Array.from({ length: p.marks + 1 }, (_, k) => `<option value="${k}" ${Number(m) === k ? 'selected' : ''}>${k}</option>`).join('')}</select> / ${p.marks}</label>`;
  }
  function paintCard() {
    const card = $('cq-card');
    if (st.pos >= N) {   // 結果
      const t = totals(st);
      const rows = SECTIONS.map(sec => {
        let e = 0, tot = 0, a = 0, c = 0;
        QUESTIONS.forEach((q, i) => { if (q.sec !== sec.id) return; c++; tot += qTotal(i); if (st.done[i]) { e += qEarned(st, i); a++; } });
        const pct = tot ? Math.round(e / tot * 100) : 0;
        return `<li><span class="cq-rs"><b>${sec.title}</b> <small>${esc(sec.sub)}</small></span><span class="cq-rbar"><i style="width:${pct}%"></i></span><span class="cq-rv">${e} / ${tot}</span><small class="cq-ra">${a}/${c} answered</small></li>`;
      }).join('');
      card.innerHTML = `<div class="cq-meta">Results</div><div class="cq-res"><div class="ring big" style="--p:${Math.round(t.earned / t.total * 100)}"><span>${Math.round(t.earned / t.total * 100)}%</span></div><div><h3>${t.earned} / ${t.total} marks</h3><p>${t.answered} of ${N} questions answered</p></div></div><ul class="cq-rlist">${rows}</ul><button class="cq-reset" id="cq-reset">Reset my answers</button>`;
      return;
    }
    const q = QUESTIONS[st.pos], sec = SECTIONS.find(x => x.id === q.sec), done = st.done[st.pos];
    const mk = qTotal(st.pos);
    const flag = `<button class="cq-flag ${st.flag[st.pos] ? 'on' : ''}" id="cq-flag" aria-pressed="${!!st.flag[st.pos]}" aria-label="Mark for review" title="Mark for review"><svg viewBox="0 0 24 24"><path d="M6 3h12v18l-6-4-6 4z"/></svg></button>`;
    const parts = q.parts.map((p, pi) => `<div class="cq-part">${partInput(st.pos, pi, p)}${done ? `<div class="cq-mark"><h4>Mark scheme</h4>${partMarking(st.pos, pi, p)}</div>` : ''}</div>`).join('');
    card.innerHTML = `<div class="cq-meta"><span>Q ${st.pos + 1} / ${N}</span><small>${sec.title}: ${esc(sec.sub)} · [${mk} mark${mk > 1 ? 's' : ''}]</small>${flag}</div>
      <p class="cq-q">${fmt(q.q)}</p>${q.hint ? `<p class="cq-hint">${esc(q.hint)}</p>` : ''}<div class="cq-rule"><i></i><b>✦</b><i></i></div>${parts}
      ${done ? `<p class="cq-got" id="cq-got">Your score: <b>${qEarned(st, st.pos)} / ${mk}</b></p>` : ''}`;
    card.scrollTop = 0;
  }
  function paintBar() {
    const btn = $('cq-submit'), span = btn.firstElementChild;
    if (st.pos >= N) { btn.hidden = true; return; }
    btn.hidden = false;
    span.innerHTML = st.done[st.pos] ? (st.pos === N - 1 ? `Results ${api.icon('arrow', 'sm')}` : `Next Question ${api.icon('arrow', 'sm')}`) : `Submit Answer ${api.icon('arrow', 'sm')}`;
    $('cq-prev').disabled = st.pos === 0; $('cq-next').disabled = st.pos >= N;
  }
  const paintAll = () => { paintProgress(); paintDots(); paintCard(); paintBar(); };
  const go = i => { st.pos = clamp(i); save1(); paintAll(); };

  // ---- 操作 ----
  root.addEventListener('input', e => {
    const el = e.target, card = el.closest('.cq-card'); if (!card || st.pos >= N) return;
    if (el.matches('.cq-ta, .cq-in')) { (st.ans[st.pos] = st.ans[st.pos] || {})[el.dataset.p] = el.value; save1(); }
  });
  root.addEventListener('change', e => {
    const el = e.target;
    if (!el.matches('[data-mp]')) return;
    const pi = Number(el.dataset.mp), p = QUESTIONS[st.pos].parts[pi];
    st.mk[st.pos] = st.mk[st.pos] || {};
    if (p.type === 'text') { const arr = st.mk[st.pos][pi] || p.pts.map(() => false); arr[Number(el.dataset.k)] = el.checked; st.mk[st.pos][pi] = arr; }
    else if (p.type === 'short') st.mk[st.pos][pi] = el.checked;
    else st.mk[st.pos][pi] = Number(el.value);
    save1(); paintProgress(); paintDots();
    const got = $('cq-got'); if (got) got.innerHTML = `Your score: <b>${qEarned(st, st.pos)} / ${qTotal(st.pos)}</b>`;
  });
  root.addEventListener('click', e => {
    const cell = e.target.closest('.cq-cell');
    if (cell && !st.done[st.pos]) {
      const pi = cell.dataset.p, ri = Number(cell.dataset.row);
      const arr = (st.ans[st.pos] = st.ans[st.pos] || {})[pi] || []; const cur = arr[ri];
      arr[ri] = cur === '0' ? '1' : cur === '1' ? undefined : '0';
      st.ans[st.pos][pi] = Array.from({ length: QUESTIONS[st.pos].parts[pi].rows.length }, (_, k) => arr[k] ?? '');
      cell.textContent = arr[ri] ?? '–'; cell.classList.toggle('set', arr[ri] === '0' || arr[ri] === '1'); save1(); return;
    }
    const dot = e.target.closest('[data-goto]'); if (dot) { go(Number(dot.dataset.goto)); return; }
    if (e.target.closest('#cq-prev')) { go(st.pos - 1); return; }
    if (e.target.closest('#cq-next')) { go(st.pos + 1); return; }
    if (e.target.closest('#cq-flag')) { st.flag[st.pos] = !st.flag[st.pos]; save1(); paintCard(); paintDots(); return; }
    if (e.target.closest('#cq-exit')) { api.back(); return; }
    if (e.target.closest('#cq-reset')) { if (confirm('Reset all your answers and marks for this quiz?')) { for (const k of ['ans', 'mk', 'done', 'flag']) st[k] = {}; st.pos = 0; save1(); paintAll(); } return; }
    if (e.target.closest('#cq-submit')) {
      if (st.pos >= N) return;
      if (!st.done[st.pos]) { autoMark(st, st.pos); st.done[st.pos] = true; save1(); paintAll(); }
      else go(st.pos + 1);
    }
  });
  const onKey = e => {   // ← → で前後の問題へ(この画面を開いている間だけ)
    if (!root.isConnected) { document.removeEventListener('keydown', onKey); return; }
    if (e.target.matches?.('textarea, input, select')) return;
    if (e.key === 'ArrowRight') go(st.pos + 1); else if (e.key === 'ArrowLeft') go(st.pos - 1);
  };
  document.addEventListener('keydown', onKey);
  paintAll();
}
