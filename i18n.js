// 言語の切り替え(English / 日本語 / 中文)。選んだ言語は、このブラウザの localStorage に保存する。
import { MESSAGES } from './messages.js?v=34';

export const LANGS = ['en', 'ja', 'zh'];
const KEY = 'lang';

function detect() {
  try {
    const saved = localStorage.getItem(KEY);
    if (LANGS.includes(saved)) return saved;
  } catch (_) { /* 保存された言語がなくても動く */ }
  const first = (typeof navigator !== 'undefined' ? (navigator.languages?.[0] || navigator.language || '') : 'ja').toLowerCase();
  if (first.startsWith('ja')) return 'ja';
  if (first.startsWith('zh')) return 'zh';
  return typeof navigator === 'undefined' ? 'ja' : 'en';
}

let lang = detect();
export const getLang = () => lang;
export const hasKey = key => key in MESSAGES[lang] || key in MESSAGES.ja;

// t('unit.min', { n: 5 }) → "5分" / "5 min" / "5分钟"
export function t(key, vars) {
  const raw = MESSAGES[lang]?.[key] ?? MESSAGES.ja[key] ?? key;
  if (!vars || typeof raw !== 'string') return raw;
  return raw.replace(/\{(\w+)\}/g, (_, k) => (vars[k] ?? ''));
}

// ログ1件の補足(例: "25分 ・ Pomodoro 1回 ・ 説明")。プロフィールと Log manually で共通。
export function logMeta(l) {
  return `${t('unit.min', { n: l.minutes })}${l.pomodoros ? t('log.pomo', { n: l.pomodoros }) : ''}${l.description ? ` ・ ${l.description}` : ''}`;
}

// data-i18n="キー" → 文字、data-i18n-attr="aria-label:キー;title:キー" → 属性
export function applyStatic(root = document) {
  root.querySelectorAll('[data-i18n]').forEach(e => { e.textContent = t(e.dataset.i18n); });
  root.querySelectorAll('[data-i18n-attr]').forEach(e => {
    for (const pair of e.dataset.i18nAttr.split(';')) {
      const [attr, key] = pair.split(':').map(s => s.trim());
      if (attr && key) e.setAttribute(attr, t(key));
    }
  });
  if (typeof document !== 'undefined') document.documentElement.lang = lang === 'zh' ? 'zh-CN' : lang;
}

export function setLang(next) {
  if (!LANGS.includes(next) || next === lang) return;
  lang = next;
  try { localStorage.setItem(KEY, next); } catch (_) { /* 保存できなくても、このページでは切り替わる */ }
  applyStatic();
  if (typeof window !== 'undefined') window.dispatchEvent(new CustomEvent('langchange', { detail: next }));
}

if (typeof document !== 'undefined') {
  applyStatic();
  document.documentElement.classList.remove('i18n-pending');
}
