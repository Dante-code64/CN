// src/games/helpers.js
// Funcoes pequenas dos mini-jogos que nao dependem do estado ao vivo de
// cada partida (tabuleiro, etc) -- so calculam alguma coisa a partir do
// que recebem por parametro.

import { BOT_DIFFICULTIES } from './data.js';

export function tttWinner(b) {
  const lines = [[0,1,2],[3,4,5],[6,7,8],[0,3,6],[1,4,7],[2,5,8],[0,4,8],[2,4,6]];
  for (const [a,b2,c2] of lines) if (b[a] && b[a] === b[b2] && b[a] === b[c2]) return b[a];
  if (b.every(x => x)) return 'empate';
  return null;
}

export function chessIsWhite(p) { return '♙♖♘♗♕♔'.includes(p); }

export function chessIsBlack(p) { return '♟♜♞♝♛♚'.includes(p); }

export function botDifficultyBar(currentVar, setterFnName) {
  return `<div class="game-mode-bar" style="flex-wrap:wrap">${Object.entries(BOT_DIFFICULTIES).map(([id, d]) =>
    `<button class="btn-sm ${currentVar===id?'btn-primary':''}" onclick="${setterFnName}('${id}')">${d.label}</button>`).join('')}</div>`;
}
