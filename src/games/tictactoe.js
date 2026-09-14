// src/games/tictactoe.js
// Jogo da Velha inteiro: tabuleiro, regras, IA (minimax) e recompensa.
// Mesma tecnica do connect4.js: importa gameReward/notify de volta do
// main.js (import circular, ja testado e funcionando).

import { BOT_DIFFICULTIES } from './data.js';
import { botDifficultyBar, tttWinner } from './helpers.js';
import { gameReward, notify } from '../main.js';

/* ---------- 1. JOGO DA VELHA ---------- */
let tttBoard, tttTurn, tttMode, tttOver, tttDifficulty;
// ── Dificuldade do bot (compartilhada entre os jogos) ───────────────
// 4 níveis: fácil (bastante aleatório), médio, difícil (quase sempre
// joga a melhor jogada) e impossível (sempre joga perfeitamente).

export function initGame_velha() {
  tttBoard = Array(9).fill(null); tttTurn = 'X'; tttMode = tttMode || 'ai'; tttOver = false;
  tttDifficulty = tttDifficulty || 'dificil';
  renderGame_velha();
}
export function renderGame_velha() {
  const c = document.getElementById('game-container');
  c.innerHTML = `
    <div class="card-title">❌⭕ Jogo da Velha</div>
    <div class="game-mode-bar">
      <button class="btn-sm ${tttMode==='ai'?'btn-primary':''}" onclick="tttSetMode('ai')">Contra IA</button>
      <button class="btn-sm ${tttMode==='2p'?'btn-primary':''}" onclick="tttSetMode('2p')">2 Jogadores</button>
      <button class="btn-sm" onclick="initGame_velha()">🔄 Reiniciar</button>
    </div>
    ${tttMode==='ai' ? botDifficultyBar(tttDifficulty, 'tttSetDifficulty') : ''}
    <div id="ttt-status" style="text-align:center;margin-bottom:10px;font-size:14px;color:var(--gold2)">Vez de: ${tttTurn}</div>
    <div class="ttt-board">${tttBoard.map((v,i)=>`<div class="ttt-cell" onclick="tttPlay(${i})">${v||''}</div>`).join('')}</div>`;
}
export function tttSetMode(m) { tttMode = m; initGame_velha(); }
export function tttSetDifficulty(d) { tttDifficulty = d; renderGame_velha(); }
export function tttPlay(i) {
  if (tttOver || tttBoard[i]) return;
  tttBoard[i] = tttTurn;
  const w = tttWinner(tttBoard);
  if (w) return tttEnd(w);
  tttTurn = tttTurn === 'X' ? 'O' : 'X';
  renderGame_velha();
  if (tttMode === 'ai' && tttTurn === 'O' && !tttOver) setTimeout(tttAiMove, 400);
}
export function tttAiMove() {
  const diff = BOT_DIFFICULTIES[tttDifficulty] || BOT_DIFFICULTIES.dificil;
  const avail = tttBoard.map((v,i) => v ? null : i).filter(v => v !== null);
  let chosenIndex;
  if (Math.random() < diff.randomChance) {
    chosenIndex = avail[Math.floor(Math.random() * avail.length)];
  } else {
    chosenIndex = tttMinimax(tttBoard, 'O').index;
  }
  tttBoard[chosenIndex] = 'O';
  const w = tttWinner(tttBoard);
  if (w) return tttEnd(w);
  tttTurn = 'X';
  renderGame_velha();
}
export function tttMinimax(board, player) {
  const avail = board.map((v,i) => v ? null : i).filter(v => v !== null);
  const winner = tttWinner(board);
  if (winner === 'X') return { score:-10 };
  if (winner === 'O') return { score:10 };
  if (winner === 'empate') return { score:0 };
  const moves = avail.map(i => {
    const nb = board.slice(); nb[i] = player;
    return { index:i, score: tttMinimax(nb, player === 'O' ? 'X' : 'O').score };
  });
  return player === 'O' ? moves.reduce((a,b) => b.score > a.score ? b : a) : moves.reduce((a,b) => b.score < a.score ? b : a);
}
export function tttEnd(w) {
  tttOver = true; renderGame_velha();
  document.getElementById('ttt-status').textContent = w === 'empate' ? 'Empate!' : `${w} venceu!`;
  if (w === 'X') { gameReward(15, 5); notify('success', '🏆 Você venceu! +15 Cry'); }
  else if (w === 'O' && tttMode === 'ai') notify('info', 'A IA venceu dessa vez!');
}


