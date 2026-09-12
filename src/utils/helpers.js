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
