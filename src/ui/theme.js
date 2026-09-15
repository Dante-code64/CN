// src/ui/theme.js
// Tema claro/escuro, paleta de fundo, fonte, cor de destaque, reducao de
// movimento e modo compacto -- todas as preferencias visuais do app.

import { BG_PALETTES, FONT_OPTIONS } from '../rpg/data.js';
import { hslToHex } from '../utils/helpers.js';
import { G, notify, saveGame } from '../main.js';

// ── THEME ──────────────────────────────────
const _themeLottieEls = {};

export function initThemeLottie(elId) {
  const el = document.getElementById(elId);
  if (!el || _themeLottieEls[elId]) return;
  _themeLottieEls[elId] = el;
  const setup = () => {
    if (!el.dotLottie) { setTimeout(setup, 150); return; }
    el.dotLottie.addEventListener('load', () => {
      el.dotLottie.stateMachineLoad('StateMachine1');
      el.dotLottie.stateMachineStart();
      // Sincroniza a animação com o tema atual salvo, sem disparar aviso nem regravar o save
      if ((G.theme || 'dark') === 'dark') el.dotLottie.stateMachineFireEvent('transition');
    });
    el.dotLottie.addEventListener('stateMachineStateEntered', (ev) => {
      const state = ev.state || (ev.detail && ev.detail.state);
      if (state === 'Night Idle') syncOtherThemeWidgets(elId, 'dark');
      else if (state === 'Day Idle') syncOtherThemeWidgets(elId, 'light');
    });
  };
  setup();
}
export function syncOtherThemeWidgets(sourceId, theme) {
  applyTheme(theme);
  persistThemeSilently(theme);
  Object.entries(_themeLottieEls).forEach(([id, el]) => {
    if (id === sourceId || !el.dotLottie) return;
    const wantsNight = theme === 'dark';
    // Evita reprocessar: só dispara transição se o widget ainda não está no estado certo
    try { el.dotLottie.stateMachineFireEvent('transition'); } catch (e) {}
  });
}
export function persistThemeSilently(theme) {
  if (G && G.name && G.theme !== theme) { G.theme = theme; saveGame(); }
}

export function applyTheme(theme) {
  document.body.classList.toggle('theme-light', theme === 'light');
  const label = document.getElementById('theme-label');
  if (label) label.textContent = theme === 'light' ? 'Claro' : 'Escuro';
  const cfgLabel = document.getElementById('cfg-theme-current-label');
  if (cfgLabel) cfgLabel.textContent = theme === 'light' ? 'Claro' : 'Escuro';
  // persist theme to user save (G) instead of localStorage
  if (G && G.name) { G.theme = theme; saveGame(); }
  if (G && G.bgPalette && G.bgPalette !== 'default') applyBackgroundPalette(G.bgPalette, false);
}

export function toggleTheme() {
  const next = document.body.classList.contains('theme-light') ? 'dark' : 'light';
  setTheme(next);
}

// ── Reduzir animações (acessibilidade real: desliga transições/animações
// CSS pra quem sente desconforto com movimento, ou só quer uma interface
// mais parada) e Modo compacto (reduz espaçamento pra caber mais na tela).
export function toggleReduceMotion(on) {
  document.body.classList.toggle('reduce-motion', !!on);
  if (G && G.name) { G.reduceMotion = !!on; saveGame(); }
  notify('info', on ? '🧘 Animações reduzidas' : '✨ Animações normais', 1800);
}

export function toggleCompactMode(on) {
  document.body.classList.toggle('compact-mode', !!on);
  if (G && G.name) { G.compactMode = !!on; saveGame(); }
  notify('info', on ? '📐 Modo compacto ativado' : '📐 Modo compacto desativado', 1800);
}

export function applyInterfacePrefs() {
  if (!G) return;
  document.body.classList.toggle('reduce-motion', !!G.reduceMotion);
  document.body.classList.toggle('compact-mode', !!G.compactMode);
}

export function setTheme(theme) {
  applyTheme(theme);
  if (G && G.name) { G.theme = theme; saveGame(); }
  notify('info', theme === 'light' ? '☀️ Tema claro ativado' : '🌙 Tema escuro ativado', 2000);
}

// ── PERSONALIZAÇÃO: cor de destaque, fundo do app, fonte e foto de perfil ──
export function hexToHsl(hex) {
  let r = parseInt(hex.slice(1, 3), 16) / 255, g = parseInt(hex.slice(3, 5), 16) / 255, b = parseInt(hex.slice(5, 7), 16) / 255;
  const max = Math.max(r, g, b), min = Math.min(r, g, b);
  let h, s, l = (max + min) / 2;
  if (max === min) { h = s = 0; }
  else {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r: h = (g - b) / d + (g < b ? 6 : 0); break;
      case g: h = (b - r) / d + 2; break;
      default: h = (r - g) / d + 4;
    }
    h *= 60;
  }
  return { h, s: s * 100, l: l * 100 };
}

export function applyAccentColor(hex, persist = true) {
  const { h, s } = hexToHsl(hex);
  const gold = hex;
  const gold2 = hslToHex(h, Math.min(s + 15, 90), 62);
  const gold3 = hslToHex(h, Math.min(s + 5, 85), 26);
  document.body.style.setProperty('--gold', gold);
  document.body.style.setProperty('--gold2', gold2);
  document.body.style.setProperty('--gold3', gold3);
  document.body.style.setProperty('--accent', gold);
  if (persist && G && G.name) { G.accent = hex; saveGame(); }
}

export function applyBackgroundPalette(id, persist = true) {
  const pal = BG_PALETTES.find(p => p.id === id) || BG_PALETTES[0];
  if (pal.id === 'default') {
    ['--bg', '--bg2', '--bg3', '--bg4', '--border', '--border2', '--text', '--text2', '--text3'].forEach(v => document.body.style.removeProperty(v));
  } else {
    const light = document.body.classList.contains('theme-light');
    const { h, s } = pal;
    if (light) {
      document.body.style.setProperty('--bg', hslToHex(h, Math.min(s, 40), 93));
      document.body.style.setProperty('--bg2', hslToHex(h, Math.min(s, 35), 98));
      document.body.style.setProperty('--bg3', hslToHex(h, Math.min(s, 35), 89));
      document.body.style.setProperty('--bg4', hslToHex(h, Math.min(s, 35), 82));
      document.body.style.setProperty('--border', hslToHex(h, Math.min(s, 30), 76));
      document.body.style.setProperty('--border2', hslToHex(h, Math.min(s, 30), 65));
      document.body.style.setProperty('--text', hslToHex(h, 20, 16));
      document.body.style.setProperty('--text2', hslToHex(h, 15, 34));
      document.body.style.setProperty('--text3', hslToHex(h, 12, 52));
    } else {
      document.body.style.setProperty('--bg', hslToHex(h, s, 6));
      document.body.style.setProperty('--bg2', hslToHex(h, s, 10));
      document.body.style.setProperty('--bg3', hslToHex(h, s, 14));
      document.body.style.setProperty('--bg4', hslToHex(h, s, 19));
      document.body.style.setProperty('--border', hslToHex(h, Math.min(s + 5, 45), 24));
      document.body.style.setProperty('--border2', hslToHex(h, Math.min(s + 8, 50), 32));
      document.body.style.setProperty('--text', hslToHex(h, 25, 88));
      document.body.style.setProperty('--text2', hslToHex(h, 20, 62));
      document.body.style.setProperty('--text3', hslToHex(h, 15, 42));
    }
  }
  if (persist && G && G.name) { G.bgPalette = id; saveGame(); }
}

export function applyFont(fontId, persist = true) {
  const f = FONT_OPTIONS.find(x => x.id === fontId) || FONT_OPTIONS[0];
  document.body.style.setProperty('--font-body', f.css);
  if (persist && G && G.name) { G.font = fontId; saveGame(); }
}

