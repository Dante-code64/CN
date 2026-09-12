// src/rpg/helpers.js
// Funcoes pequenas que usam as tabelas de dados do RPG (ICONS, MAP_ZONES,
// MAP_COLS, etc, que moram em src/rpg/data.js) para calcular alguma coisa
// -- mas nao mexem no estado do jogador (G) nem no supabase.

import { ICONS, MAP_ZONES, MAP_COLS } from './data.js';

export function svgIcon(key) {
  const inner = ICONS[key];
  if (!inner) return '';
  return `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round">${inner}</svg>`;
}

export function zoneAt(x, y) { return MAP_ZONES[y * MAP_COLS + x]; }

export function pvpPower(p) {
  const atts = (p.str || 10) + (p.dex || 10) + (p.int_ ?? p.int ?? 10) + (p.vit || 10) + (p.wis || 10);
  const hpRatio = (p.max_hp || p.maxHp) ? (p.hp || 0) / (p.max_hp || p.maxHp) : 1;
  return (p.level || 1) * 15 + atts + Math.round(hpRatio * 20);
}

export function encounterChanceFor(danger) {
  return [0, .10, .15, .22, .22, .30][danger] || 0;
}

export function monsterForDanger(danger) {
  if (danger <= 1) return 'goblin';
  if (danger <= 3) return 'orc';
  if (danger === 4) return 'dragao';
  return 'lich';
}
