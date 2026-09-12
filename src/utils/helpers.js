// src/utils/helpers.js
// Funcoes pequenas e genericas, sem depender de dados do RPG nem do
// estado do jogador -- so recebem parametros e devolvem um resultado.

export function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

export function rarityColor(r) {
  return { common:'var(--text2)', uncommon:'var(--green)', rare:'var(--cyan)', epic:'var(--purple)', legendary:'var(--gold2)' }[r] || 'var(--text2)';
}

export function createDiceElement(id) {
  return `<div class="dice-3d-wrap"><div class="dice-3d" id="${id}">
    <div class="dice-face f1">⚀</div><div class="dice-face f2">⚁</div><div class="dice-face f3">⚂</div>
    <div class="dice-face f4">⚃</div><div class="dice-face f5">⚄</div><div class="dice-face f6">⚅</div>
  </div></div>`;
}

export function buildLinkHref(platform, value) {
  if (!value) return '';
  if (/^https?:\/\//i.test(value)) return value;
  if (platform.base) return platform.base + value.replace(/^@/, '');
  return '';
}

export function hslToHex(h, s, l) {
  s /= 100; l /= 100;
  const k = n => (n + h / 30) % 12;
  const a = s * Math.min(l, 1 - l);
  const f = n => l - a * Math.max(-1, Math.min(k(n) - 3, Math.min(9 - k(n), 1)));
  const toHex = x => Math.round(255 * x).toString(16).padStart(2, '0');
  return '#' + toHex(f(0)) + toHex(f(8)) + toHex(f(4));
}

export function uid(prefix) { return prefix + '_' + Date.now().toString(36) + Math.random().toString(36).slice(2, 7); }

export function fmtTime(ts) {
  const d = new Date(ts);
  return d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
}

export function initialsOf(name) {
  if (!name) return '?';
  const parts = name.trim().split(/\s+/);
  return (parts[0][0] + (parts[1] ? parts[1][0] : '')).toUpperCase();
}

export function normalizeUsernameInput(v) {
  return (v || '').toLowerCase().replace(/[^a-z0-9_.]/g, '');
}

export function getGreeting() {
  const h = new Date().getHours();
  if (h < 6) return 'Boa madrugada';
  if (h < 12) return 'Bom dia';
  if (h < 18) return 'Boa tarde';
  return 'Boa noite';
}
