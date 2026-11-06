// CS(ネオンのときだけ): 「IBDP Computer Science HL」の学習サイトの画面一式。背景はWebGPU(白黒のゴシックの大聖堂)で、ずっと動いている。
// 画面: home / topics / practice / pa(Practice の一覧。A1〜A4) / lesson(A1〜A4 の学習ページ) / case(Case Study)
import { createGpuView } from './gpu-view.js?v=77';
import { WGSL } from './cs-bg.js?v=77';
import { GROUPS, TERMS, FIGS } from './casestudy.js?v=77';
import { mountQuiz, quizScore, quizTotal, QUIZ_CODES } from './quiz.js?v=77';

const host = document.getElementById('cs-view');
const stage = document.getElementById('cs-stage');
const toast = document.getElementById('cs-toast');

// ---- アイコン ----
const ICONS = {
  chip: '<rect x="7" y="7" width="10" height="10" rx="1.5"/><rect x="10" y="10" width="4" height="4"/><path d="M9 3v3M12 3v3M15 3v3M9 18v3M12 18v3M15 18v3M3 9h3M3 12h3M3 15h3M18 9h3M18 12h3M18 15h3"/>',
  db: '<ellipse cx="12" cy="6" rx="7" ry="3"/><path d="M5 6v6c0 1.7 3.1 3 7 3s7-1.3 7-3V6M5 12v6c0 1.7 3.1 3 7 3s7-1.3 7-3v-6"/>',
  code: '<path d="M8 7l-5 5 5 5M16 7l5 5-5 5M14 4l-4 16"/>',
  shield: '<path d="M12 2.5l8 3v6c0 5-3.4 8.5-8 10-4.6-1.5-8-5-8-10v-6z"/><rect x="9" y="11" width="6" height="4.5" rx=".8"/><path d="M10.2 11V9.6a1.8 1.8 0 0 1 3.6 0V11"/>',
  gears: '<circle cx="9" cy="15" r="3"/><circle cx="9" cy="15" r="5.6" stroke-dasharray="2.4 1.8"/><circle cx="17" cy="7" r="2.2"/><circle cx="17" cy="7" r="4" stroke-dasharray="1.8 1.5"/>',
  book: '<path d="M12 6.5C9.8 5 6.5 4.5 3 5v13c3.5-.5 6.8 0 9 1.5 2.2-1.5 5.5-2 9-1.5V5c-3.5-.5-6.800 0-9 1.500zM12 6.500v13M6 8.500c1.500 0 2.800.2 4 .8M6 11.500c1.500 0 2.800.2 4 .8M18 8.500c-1.500 0-2.800.2-4 .8M18 11.500c-1.500 0-2.800.2-4 .8"/>',
  laptop: '<rect x="4" y="5" width="16" height="11" rx="1.2"/><path d="M2 19.500h20M10.500 8.500L8.500 10.500l2 2M13.500 8.500l2 2-2 2"/>',
  cap: '<path d="M2 9l10-5 10 5-10 5zM6 11.500V16c3 2.500 9 2.500 12 0v-4.500M22 9v6"/>',
  check: '<path d="M20 12v6a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h9M8.500 11l3.500 3.500L21 5"/>',
  binary: '<text x="2.500" y="8" font-size="7" stroke="none" fill="currentColor" font-family="monospace">0110</text><text x="2.500" y="15" font-size="7" stroke="none" fill="currentColor" font-family="monospace">0110</text><text x="2.500" y="22" font-size="7" stroke="none" fill="currentColor" font-family="monospace">0101</text>',
  cloud: '<path d="M7 18a4 4 0 0 1-.5-8A5.500 5.500 0 0 1 17 8.500 4.500 4.500 0 0 1 17.500 18z"/>',
  zip: '<path d="M7 3h7l4 4v14H7zM14 3v4h4M11 6h2M11 9h2M11 12h2"/><rect x="10" y="14" width="4" height="4" rx=".8"/>',
  ram: '<rect x="2" y="7.500" width="20" height="9" rx="1"/><path d="M5 10.500v3M9 10.500v3M13 10.500v3M17 10.500v3M5 16.500v2M9 16.500v2M13 16.500v2M17 16.500v2"/>',
  pipe: '<rect x="1.500" y="8" width="5.500" height="8" rx="1"/><rect x="9.200" y="8" width="5.500" height="8" rx="1"/><rect x="17" y="8" width="5.500" height="8" rx="1"/>',
  cycle: '<path d="M20 12a8 8 0 1 1-2.500-5.800M20 4v4h-4M9 12l2 2 4-4"/>',
  search: '<circle cx="11" cy="11" r="6"/><path d="M16 16l4 4"/>',
  home: '<path d="M3 11l9-8 9 8M5 10v10h5v-6h4v6h5V10"/>',
  lock: '<rect x="5" y="11" width="14" height="9" rx="2"/><path d="M8 11V8a4 4 0 0 1 8 0v3"/>',
  arrow: '<path d="M4 12h15M13 6l6 6-6 6"/>',
  chev: '<path d="M9 5l7 7-7 7"/>',
  down: '<path d="M6 9l6 6 6-6"/>',
  up: '<path d="M6 15l6-6 6 6"/>',
  user: '<circle cx="12" cy="8" r="4"/><path d="M4 21c0-4.400 3.600-7 8-7s8 2.600 8 7"/>',
  star: '<path d="M12 1.500l2.200 8.300 8.300 2.200-8.300 2.200L12 22.500l-2.200-8.300L1.500 12l8.300-2.200z"/>',
  net: '<circle cx="12" cy="12" r="2"/><circle cx="5" cy="6" r="1.500"/><circle cx="19" cy="6" r="1.500"/><circle cx="5" cy="18" r="1.500"/><circle cx="19" cy="18" r="1.500"/><path d="M12 12L5 6M12 12l7-6M12 12L5 18M12 12l7 6"/>',
  disk: '<circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="3"/><path d="M12 3v3"/>',
};
const ic = (n, cls = '') => `<svg class="cs-ic ${cls}" viewBox="0 0 24 24" aria-hidden="true">${ICONS[n]}</svg>`;
const sparkle = `<svg class="cs-spark" viewBox="0 0 24 24" aria-hidden="true">${ICONS.star}</svg>`;

// ---- データ ----
const SECTIONS = [
  ['A1', 'Computer Fundamentals', 'chip'], ['A2', 'Networks', 'net'], ['A3', 'Databases', 'db'],
  ['A4', 'Machine Learning', 'gears'], ['Theme B', 'Application Development', 'code'], ['Case Study', 'Prescribed Case Study', 'book'],
];
// 各ユニットのトピック一覧(コード順)。「…」で終わるものは、画像で途中までしか読めなかったタイトル(全文が分かったら差し替える)。
// コードのない行は、ユニットのノート・資料。
const TOPICS = {
  A1: [
    'Unit 1 Computer Fundamentals AI',
    'A1.1.1 CPU components', 'A1.1.2 GPU', 'A1.1.3 Differences between CPU and GPU', 'A1.1.4 Types of Primary Memory',
    'A1.1.5 Fetch Decode Execute Cycle', 'A1.1.6 Pipelining HL', 'A1.1.7 Secondary memory', 'A1.1.8 Compression', 'A1.1.9 Cloud computing',
    'A1.2.1 Data representation', 'A1.2.2 Use of binary to store data', 'A1.2.3 Logic Gates', 'A1.2.4 Truth tables', 'A1.2.5 Logic Diagrams',
    'A1.3.1 Operating Systems', 'A1.3.2 Functions of an OS', 'A1.3.3 Scheduling Algorithms', 'A1.3.4 Evaluate the use of polling and interrupt ha…',
    'A1.3.5 Role of the OS in managing multitasking an…', 'A1.3.6 Control Systems', 'A1.3.7 Control Systems in the Real World',
    'A1.4.1 Evaluate the translation processes of interpr…',
  ],
  A2: [
    'Unit 2 Networks NotebookLM',
    'A2.1.1 Describe the purpose and characteristics of…', 'A2.1.2 Describe the purpose, benefits and limitatio…', 'A2.1.3 Functions of Network Devices',
    'A2.1.4 Network protocols used for transport and a…', 'A2.1.5 Describe the function of the TCP/IP model',
    'A2.2.1 Describe the functions and practical applic…', 'A2.2.2 Describe the function of servers. (HL only)', 'A2.2.3 Compare and contrast networking models',
    'A2.2.4 Explain the concepts and applications of ne…',
    'A2.3.1 Describe Different Types of IP Addressing', 'A2.3.2 Compare types of media for data transmiss…', 'A2.3.3 Explain how packet switching is used to sen…',
    'A2.3.4 Explain how static routing and dynamic rou…',
    'A2.4.1 Discuss the effectiveness of firewalls at pro…', 'A2.4.2 Describe common network vulnerabilities', 'A2.4.3 Describe common network countermeasures',
    'A2.4.4 Describe the process of encryption and dig…',
  ],
  A3: [
    'A3.1.1 Explain the features, benefits and limitations…',
    'A3.2.1 Describe Database Schemas', 'A3.2.2 Construct ERDs', 'A3.2.3 Outline the different data types used in rela…',
    'A3.2.4 Construct tables for relational databases', 'A3.2.5 Explain the difference between normal forms', 'A3.2.6 Construct a database normalized to 3NF fo…',
    'A3.2.7 Evaluate the need for denormalizing databa…',
    'A3.3.1 Outline the differences between data langu…', 'A3.3.2 Construct queries between two tables in SQL', 'A3.3.3 Explain how SQL can be used to update dat…',
    'A3.3.4 Construct calculations within a database u…', 'A3.3.5 Describe different database views', 'A3.3.6 Describe how transactions maintain data in…',
    'A3.4.1 Outline the different types of databases as …', 'A3.4.2 Explain the primary objectives of data ware…', 'A3.4.3 Explain the role of online analytical process…',
    'A3.4.4 Describe the features of distributed databa…',
  ],
  A4: [
    'A4.1.1 Types of Machine Learning and their applic…', 'A4.1.2 Hardware requirements for various scenario…',
    'A4.2.1 Data cleaning', 'A4.2.2 Feature selection', 'A4.2.3 Describe the importance of dimensionality …',
    'A4.3.1 Explain how linear regression is used to pre…', 'A4.3.2 Explain how classifications techniques in su…', 'A4.3.3 Explain the role of hyperparameter tuning …',
    'A4.3.4 Describe how clustering techniques in unsu…', 'A4.3.5 Describe how learning techniques using th…', 'A4.3.6 Describe how an agent learns to make deci…',
    'A4.3.7 Describe the application of genetic algorith…', 'A4.3.8 Outline the structure and function of ANNs …', 'A4.3.9 Describe how CNNs are designed to adapti…',
    'A4.3.10 Explain the importance of model selection…',
    'Case Study for Paper 1',
    'A4.4.1 Discuss the ethical implications of machine …', 'A4.4.2 Discuss ethical aspects of the increasing in…',
  ],
};
const parseTopic = line => { const m = /^(A\d\.\d+\.\d+)\s+(.*)$/.exec(line); return m ? { code: m[1], title: m[2] } : { code: '', title: line }; };
const unit = (code, name, icon, tagline) => {
  const rows = TOPICS[code].map(parseTopic);
  return {
    code, name, practiceName: name, icon, tagline,
    lessons: rows.map(r => [r.code, r.title, '', r.code ? icon : 'book', 'start']),      // [コード, タイトル, 説明, アイコン, 状態]
    practice: rows.filter(r => r.code).reverse().map(r => [r.code, r.title, '', 0, icon]),  // Practice は新しいコードから(正答率は、まだ記録なし)
    topicCount: rows.filter(r => r.code).length,
    overall: [0, '0 / 0'],
  };
};
const UNITS = {
  A1: unit('A1', 'Computer Fundamentals', 'chip', 'Understanding how computers work.'),
  A2: unit('A2', 'Networks', 'net', 'How computers communicate and share data.'),
  A3: unit('A3', 'Databases', 'db', 'Organizing, querying and managing data.'),
  A4: unit('A4', 'Machine Learning', 'gears', 'How machines learn from data.'),
};
const unitOf = c => UNITS[c] || UNITS.A1;

// ---- 画面のテンプレート ----
const topNav = (page, brand) => `
  <header class="cs-top ${brand ? 'with-brand' : ''}">
    <a class="cs-brand" data-go="home" href="#" aria-label="Home">${sparkle}${brand ? '<span>IBDP<br>Computer Science HL</span>' : ''}</a>
    <nav class="cs-nav">
      <a data-go="home" href="#" class="${page === 'home' ? 'on' : ''}">Home</a>
      <a data-go="topics" href="#" class="${page === 'topics' ? 'on' : ''}">Topics${page === 'home' || page === 'topics' ? ic('down', 'sm') : ''}</a>
      <a data-go="practice" href="#" class="${page === 'practice' || page === 'pa' ? 'on' : ''}">Practice</a>
      <a data-soon href="#">Resources</a><a data-soon href="#">About</a>
    </nav>
    <div class="cs-acts"><button class="cs-iconbtn" data-soon aria-label="Search">${ic('search')}</button></div>
  </header>`;
const esc = s => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/"/g, '&quot;');
const orn = '<div class="cs-orn"><i></i><b>' + '✦' + '</b><i></i></div>';

const PAGES = {
  home: () => `${topNav('home', false)}
    <section class="cs-hero">
      <div class="cs-cross">${ic('star', 'big')}<i></i></div>
      <div class="cs-eyebrow"><span>❦</span>IBDP<span class="flip">❦</span></div>
      <h2 class="cs-h1">Computer Science HL</h2>
      <div class="cs-rule"><i></i><b>◆</b><i></i></div>
      <p class="cs-track">IBDP Computer Science HL Study Platform</p>
      <div class="cs-btns"><button class="cs-btn solid" data-go="topics"><span>Start Learning ${ic('arrow', 'sm')}</span></button><button class="cs-btn" data-go="topics"><span>Explore Topics</span></button></div>
    </section>
    <div class="cs-cards four">
      ${[['laptop', 'Syllabus', 'IBDP CS HL (2027)', 'topics'], ['book', 'Topics', 'A1 – D4', 'topics'], ['check', 'Practice', 'Questions & Past Paper', 'practice'], ['cap', 'Resources', 'Notes, Code, Tools', '']]
        .map(([i, a, b, go]) => `<button class="cs-card" ${go ? `data-go="${go}"` : 'data-soon'}>${ic(i, 'lead')}<span><b>${a}</b><em>${b}</em></span>${ic('chev', 'sm')}</button>`).join('')}
    </div>
    <div class="cs-dots"><i class="on"></i><i></i><i></i></div>`,

  topics: () => `${topNav('topics', false)}
    <section class="cs-head center"><p class="cs-track small">IBDP · Computer Science HL</p>${sparkle}<h2 class="cs-h2">Select a Topic</h2><div class="cs-rule"><i></i><b>✦</b><i></i></div></section>
    <div class="cs-cards grid wide">${SECTIONS.map(([c, n, i]) => `<button class="cs-card tile" ${UNITS[c] ? `data-go="lesson:${c}"` : c === 'Case Study' ? 'data-go="case"' : 'data-soon'}><i class="cs-top-star">✦</i>${ic(i, 'lead')}<span><strong>${c}</strong><em>${n}</em></span>${ic('chev', 'sm')}</button>`).join('')}</div>`,

  practice: () => `${topNav('practice', true)}
    <section class="cs-head center"><div class="cs-rule"><i></i><b>✦</b><i></i></div><h2 class="cs-h2">Practice</h2><div class="cs-rule thin"><i></i><b>✦</b><i></i></div><p class="cs-track small">✦ &nbsp;Choose a Section to Practice&nbsp; ✦</p></section>
    <div class="cs-cards grid"><!---->${SECTIONS.map(([c, n, i]) => `<button class="cs-card tile v" ${UNITS[c] ? `data-go="pa:${c}"` : c === 'Case Study' ? 'data-go="case"' : 'data-soon'}><i class="cs-top-star">✦</i>${ic(i, 'lead')}<span><strong>${c}</strong><em>${n}</em></span>${ic('chev', 'sm side')}</button>`).join('')}</div>
    <div class="cs-bottom-orn">${orn}</div>`,

  pa: (code = 'A1') => {
    const u = unitOf(code);
    const codes = u.practice.map(r => r[0]).filter(c => QUIZ_CODES.includes(c));
    const earned = codes.reduce((n, c) => n + (quizScore(c)?.earned || 0), 0), total = codes.reduce((n, c) => n + quizTotal(c), 0);
    const overall = total ? [Math.round(earned / total * 100), `${earned} / ${total} marks`] : u.overall;
    return `${topNav('pa', true)}
    <div class="cs-split">
      <aside class="cs-side panel">
        <h3 class="cs-side-title">${sparkle}Practice</h3><div class="cs-rule thin"><i></i><b>◆</b><i></i></div>
        <ul class="cs-menu">${SECTIONS.map(([c, n]) => `<li><button class="${c === u.code ? 'on' : ''}" ${UNITS[c] ? `data-go="pa:${c}"` : c === 'Case Study' ? 'data-go="case"' : 'data-soon'}><b>${c}</b><span>${n}</span>${ic('chev', 'sm')}</button></li>`).join('')}</ul>
      </aside>
      <section class="cs-main">
        <div class="cs-crumb">${ic('home', 'sm')}<a data-go="practice" href="#">Practice</a>${ic('chev', 'sm')}<span>${u.code}</span></div>
        <div class="cs-mhead">
          <div class="cs-mtitle">${ic(u.icon, 'huge')}<div><h2><i>${u.code}</i> <em>${u.practiceName}</em></h2><p>Practice questions for ${u.code}. Test your understanding and track your progress.</p></div></div>
          <div class="cs-overall panel"><div class="ring big" style="--p:${overall[0]}"><span>${overall[0]}%</span></div><div><b>${u.code} Overall</b><p>Correct: ${overall[1]}</p></div></div>
        </div>
        <ul class="cs-rows">${u.practice.map(([c, n, d, p0, i], k) => { const sc = quizScore(c), p = sc ? sc.pct : p0, link = QUIZ_CODES.includes(c); return `<li class="cs-row ${link ? 'link' : ''} ${k === 0 ? 'hot' : ''}" ${link ? `data-go="quiz:${c}" tabindex="0" role="link"` : 'data-soon'}>${ic(i, 'lead')}<code>${c}</code><span><b>${n}</b>${d ? `<em>${d}</em>` : ''}</span><strong>${p}%</strong><div class="ring" style="--p:${p}"></div>${ic('chev', 'sm')}</li>`; }).join('')}</ul>
      </section>
    </div>`; },

  quiz: code => `${topNav('pa', true)}<div class="cq" data-code="${esc(code || 'A1.2.3')}"></div>`,

  case: () => {
    const badge = l => (l === 'hl' ? '<span class="cs-badge hl">HL only</span>' : '<span class="cs-badge">SL + HL</span>');
    const term = t => `<article class="cs-term panel" id="ct-${t.id}" data-q="${esc(t.term.toLowerCase())}">
        <header><h3>${esc(t.term)}</h3>${badge(t.level)}<span class="cs-ref">lines ${t.ref}</span></header>
        <p class="en">${esc(t.en)}</p>${t.fig ? FIGS[t.fig] : ''}<p class="ja" lang="ja">${esc(t.ja)}</p></article>`;
    return `${topNav('case', true)}
    <div class="cs-split cs-case">
      <aside class="cs-side panel cs-index">
        <h3 class="cs-side-title">${sparkle}Key terms</h3>
        <input class="cs-search" type="search" placeholder="Search terms…" aria-label="Search terms">
        <div class="cs-langs" role="group" aria-label="Language"><button data-mode="both" class="on">EN + 日本語</button><button data-mode="en">EN</button><button data-mode="ja">日本語</button></div>
        <nav>${GROUPS.map(g => `<div class="cs-ig" data-g="${g.id}"><h4>${g.title}<small>${g.ja}</small></h4>${TERMS.filter(t => t.group === g.id).map(t => `<a href="#" data-jump="ct-${t.id}" data-q="${esc(t.term.toLowerCase())}">${esc(t.term)}${t.level === 'hl' ? '<i>HL</i>' : ''}</a>`).join('')}</div>`).join('')}</nav>
      </aside>
      <section class="cs-main cs-doc" data-mode="both">
        <div class="cs-crumb">${ic('home', 'sm')}<a data-go="practice" href="#">Practice</a>${ic('chev', 'sm')}<span>Case Study</span></div>
        <div class="cs-casehead"><p class="cs-track small">IBDP · Computer Science · for May &amp; November 2027</p><h2 class="cs-h2 left">Generative AI for image creation <em>— a diffuse vision</em></h2>
          <p class="cs-lede">Every key term of the case study, explained section by section in English and Japanese. <span class="cs-badge">SL + HL</span> terms are for everyone; <span class="cs-badge hl">HL only</span> terms are for higher level only. “lines” refer to the numbered lines in the case study booklet.</p></div>
        ${GROUPS.map(g => `<div class="cs-group" data-g="${g.id}"><h2 class="cs-gt"><span>${g.title}</span><small>${g.ja}</small></h2>${TERMS.filter(t => t.group === g.id).map(term).join('')}</div>`).join('')}
        <p class="cs-none" hidden>No matching terms.</p>
        <p class="cs-foot">Source: IB Computer Science Case Study 2027. Explanations are study notes written for this platform.</p>
      </section>
    </div>`;
  },

  lesson: (code = 'A1') => { const u = unitOf(code); return `<div class="cs-split lesson">
      <aside class="cs-side panel">
        <div class="cs-lbrand" data-go="home">${ic('cycle', 'lead')}<span><small>IBDP</small>Computer Science HL</span></div><div class="cs-rule thin"><i></i><b>✦</b><i></i></div>
        ${SECTIONS.map(([c, n, i]) => (c === u.code
          ? `<button class="cs-acc on">${ic(i, 'lead')}<b>${c}</b>${ic('up', 'sm')}</button><ul class="cs-sub">${u.lessons.map(([lc, ln], k) => `<li class="${k === 0 ? 'on' : ''}" title="${esc(ln)}"><i></i><code>${lc || '·'}</code><span>${esc(ln)}</span></li>`).join('')}</ul>`
          : `<button class="cs-acc" ${UNITS[c] ? `data-go="lesson:${c}"` : c === 'Case Study' ? 'data-go="case"' : 'data-soon'}>${ic(i, 'lead')}<b>${c}</b>${ic('down', 'sm')}</button>`)).join('')}
      </aside>
      <section class="cs-main">
        <div class="cs-lhead">
          <div class="cs-ltitle">${sparkle}<div><h2><i>${u.code}</i> <em>${u.name}</em></h2><p>${u.tagline}</p></div></div>
          <div class="cs-quote">“ Small steps<br>&nbsp; build great understanding.”</div>
          <div class="cs-prog panel"><button class="cs-iconbtn" data-soon aria-label="Search">${ic('search')}</button><div><small>Progress</small><div class="bar"><i></i></div></div><span>0/${u.topicCount}</span><button class="cs-iconbtn round" data-go="home" aria-label="Account">${ic('user')}</button></div>
        </div>
        <ul class="cs-lessons">${u.lessons.map(([c, n, d, i, st], k) => `<li class="cs-lesson ${st} ${QUIZ_CODES.includes(c) ? 'link' : ''}" ${QUIZ_CODES.includes(c) ? `data-go="quiz:${c}" tabindex="0" role="link"` : ''}><div class="cs-thumb">${ic(i, 'thumb')}</div><span class="num">${k + 1}</span><span class="txt"><b><code>${c}</code>${n}</b>${d ? `<em>${d}</em>` : ''}</span>${st === 'start' ? `<button class="cs-start" ${QUIZ_CODES.includes(c) ? `data-go="quiz:${c}"` : 'data-soon'}>Start ${ic('arrow', 'sm')}</button>` : `<button class="cs-start locked" disabled>${ic('lock', 'sm')} Locked ${ic('arrow', 'sm')}</button>`}</li>`).join('')}</ul>
        <p class="cs-foot">— Knowledge turns into power —</p>
      </section>
    </div>`; },
};
// ページごとの背景の見え方: 紫がかり(tint)と、落ち着かせる度合い(dim)
const LOOK = { quiz: [0, 0.3], case: [0, 0.6], home: [0, 0], topics: [0, 0.12], practice: [0, 0.05], pa: [0, 0.55], lesson: [0, 0.3] };

// ---- 背景(WebGPU) ----
const look = { tint: 0, dim: 0, tT: 0, tD: 0, last: performance.now() / 1000 };
let punch = -10;
const view = createGpuView(WGSL, now => {
  const dt = Math.min(0.1, now - look.last); look.last = now;
  const k = 1 - Math.exp(-dt * 2.2);
  look.tint += (look.tT - look.tint) * k; look.dim += (look.tD - look.dim) * k;
  const x = Math.min(1, Math.max(0, (now - punch) / 1.1));
  const pulse = x < 1 ? Math.sin(Math.PI * x) * 0.9 : 0;          // 画面の切り替えで、ぐっと奥へ引き込まれる
  return [0, 0, 0, pulse, look.tint, look.dim];
});

// ---- 画面の切り替え ----
let page = 'home';
let toastTimer = 0;
function say(msg) {
  toast.textContent = msg; toast.hidden = false; toast.classList.add('on');
  clearTimeout(toastTimer); toastTimer = setTimeout(() => { toast.classList.remove('on'); setTimeout(() => { toast.hidden = true; }, 300); }, 1600);
}
let current = '';          // いま開いている画面(例: 'lesson:A1')
let quizFrom = '';         // 問題集を開く前にいた画面。Exit で、そこへ戻る
try { quizFrom = sessionStorage.csQuizFrom || ''; } catch {}
function show(target) {
  const [next, arg] = String(target).split(':');   // 例: 'lesson:A2'
  if (next === 'quiz' && current && !current.startsWith('quiz')) { quizFrom = current; try { sessionStorage.csQuizFrom = quizFrom; } catch {} }
  current = String(target);
  page = next;
  stage.innerHTML = `<div class="cs-page cs-p-${next}">${PAGES[next](arg)}</div>`;
  stage.firstElementChild.scrollTop = 0;
  [look.tT, look.tD] = LOOK[next];
  punch = performance.now() / 1000;
  host.dataset.page = next;
  host.dataset.unit = arg || '';
  // 来た画面が分からないときは、そのユニットの学習ページへ戻る
  if (next === 'quiz') mountQuiz(stage.querySelector('.cq'), arg || 'A1.2.3', { icon: ic, back: () => show(quizFrom && /^(lesson|pa):/.test(quizFrom) ? quizFrom : `lesson:${String(arg || 'A1.2.3').split('.')[0]}`) });
  try { sessionStorage.csPage = target; } catch {}
}
stage.addEventListener('input', e => {   // 用語の検索
  if (!e.target.matches('.cs-search')) return;
  const q = e.target.value.trim().toLowerCase(); let n = 0;
  stage.querySelectorAll('.cs-term').forEach(a => { const hit = !q || a.dataset.q.includes(q); a.hidden = !hit; if (hit) n++; });
  stage.querySelectorAll('.cs-index nav a').forEach(a => { a.hidden = !!q && !a.dataset.q.includes(q) && !stage.querySelector('#' + a.dataset.jump + ':not([hidden])'); });
  stage.querySelectorAll('.cs-group').forEach(g => { g.hidden = !g.querySelector('.cs-term:not([hidden])'); });
  stage.querySelectorAll('.cs-ig').forEach(g => { g.hidden = !g.querySelector('a:not([hidden])'); });
  const none = stage.querySelector('.cs-none'); if (none) none.hidden = n > 0;
});
stage.addEventListener('click', e => {
  const jump = e.target.closest('[data-jump]');
  if (jump) { e.preventDefault(); const t = stage.querySelector('#' + jump.dataset.jump); t?.scrollIntoView({ behavior: 'smooth', block: 'start' }); t?.classList.add('flash'); setTimeout(() => t?.classList.remove('flash'), 1400); return; }
  const lm = e.target.closest('.cs-langs button');
  if (lm) { stage.querySelector('.cs-doc').dataset.mode = lm.dataset.mode; lm.parentElement.querySelectorAll('button').forEach(b => b.classList.toggle('on', b === lm)); return; }
  const go = e.target.closest('[data-go]');
  if (go) { e.preventDefault(); show(go.dataset.go); return; }
  if (e.target.closest('[data-soon]')) { e.preventDefault(); say('Coming soon'); }
  const dots = e.target.closest('.cs-dots i');
  if (dots) { dots.parentElement.querySelectorAll('i').forEach(i => i.classList.toggle('on', i === dots)); }
});
stage.addEventListener('keydown', e => {   // Enter で、リンクの行を開く
  const row = e.target.closest('[data-go][tabindex]');
  if (row && e.key === 'Enter') { e.preventDefault(); show(row.dataset.go); }
});
setInterval(() => {   // ホームのページ送りのドット(見た目だけ)
  const d = [...stage.querySelectorAll('.cs-dots i')]; if (!d.length) return;
  const n = d.findIndex(i => i.classList.contains('on')); d[n].classList.remove('on'); d[(n + 1) % d.length].classList.add('on');
}, 3500);

let start0 = 'home';
try { if (String(sessionStorage.csPage).split(':')[0] in PAGES) start0 = sessionStorage.csPage; } catch {}
show(start0);

export const cs = { start: () => view.start(host), stop: () => view.stop() };
