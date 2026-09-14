// src/games/connect4.js
// Jogo Conecta 4 (Lig4) inteiro: tabuleiro, regras, IA e recompensa.
// Essa e a primeira vez que um modulo "pede" coisa de volta pro main.js
// (gameReward, notify) -- main.js continua sendo o dono dessas duas
// funcoes (elas mexem na ficha do jogador), so ficaram exportaveis.

import { BOT_DIFFICULTIES } from './data.js';
import { botDifficultyBar } from './helpers.js';
import { gameReward, notify } from '../main.js';

/* ---------- 5. CONECTA 4 ---------- */
let c4Board, c4Turn, c4Mode, c4Over, c4Difficulty;
export function initGame_conecta4() {
  c4Board = Array(7).fill(null).map(() => Array(6).fill(null));
  c4Turn = 1; c4Mode = c4Mode || 'ai'; c4Over = false;
  c4Difficulty = c4Difficulty || 'dificil';
  renderGame_conecta4();
}
export function renderGame_conecta4() {
  const c = document.getElementById('game-container');
  let html = '';
  for (let row = 0; row < 6; row++) {
    for (let col = 0; col < 7; col++) {
      const v = c4Board[col][row];
      html += `<div class="c4-cell ${v===1?'p1':v===2?'p2':'empty'}" onclick="c4Play(${col})"></div>`;
    }
  }
  c.innerHTML = `
    <div class="card-title">🔴 Conecta 4</div>
    <div class="game-mode-bar">
      <button class="btn-sm ${c4Mode==='ai'?'btn-primary':''}" onclick="c4SetMode('ai')">Contra IA</button>
      <button class="btn-sm ${c4Mode==='2p'?'btn-primary':''}" onclick="c4SetMode('2p')">2 Jogadores</button>
      <button class="btn-sm" onclick="initGame_conecta4()">🔄 Reiniciar</button>
    </div>
    ${c4Mode==='ai' ? botDifficultyBar(c4Difficulty, 'c4SetDifficulty') : ''}
    <div id="c4-status" style="text-align:center;margin-bottom:8px;font-size:13px;color:var(--gold2)">Vez do jogador ${c4Turn} ${c4Turn===1?'🔴':'🟡'}</div>
    <div class="c4-board">${html}</div>`;
}
export function c4SetMode(m) { c4Mode = m; initGame_conecta4(); }
export function c4SetDifficulty(d) { c4Difficulty = d; renderGame_conecta4(); }
export function c4LowestRow(col) {
  for (let row = 5; row >= 0; row--) if (!c4Board[col][row]) return row;
  return -1;
}
export function c4CheckWin(board, player) {
  for (let col = 0; col < 7; col++) for (let row = 0; row < 6; row++) {
    if (board[col][row] !== player) continue;
    const dirs = [[1,0],[0,1],[1,1],[1,-1]];
    for (const [dx,dy] of dirs) {
      let count = 1;
      for (let s = 1; s < 4; s++) { const c2=col+dx*s, r2=row+dy*s; if (c2>=0&&c2<7&&r2>=0&&r2<6&&board[c2][r2]===player) count++; else break; }
      if (count >= 4) return true;
    }
  }
  return false;
}
export function c4Play(col) {
  if (c4Over) return;
  const row = c4LowestRow(col);
  if (row < 0) return;
  c4Board[col][row] = c4Turn;
  if (c4CheckWin(c4Board, c4Turn)) return c4End(c4Turn);
  if (c4Board.every(colArr => colArr.every(v => v))) return c4End('empate');
  c4Turn = c4Turn === 1 ? 2 : 1;
  renderGame_conecta4();
  if (c4Mode === 'ai' && c4Turn === 2 && !c4Over) setTimeout(c4AiMove, 450);
}
export function c4AiMove() {
  const diff = BOT_DIFFICULTIES[c4Difficulty] || BOT_DIFFICULTIES.dificil;
  const validCols = [0,1,2,3,4,5,6].filter(c2 => c4LowestRow(c2) >= 0);

  // dificuldade fácil: quase sempre joga aleatório, ignorando estratégia
  if (Math.random() < diff.randomChance) {
    const col = validCols[Math.floor(Math.random() * validCols.length)];
    const row = c4LowestRow(col);
    c4Board[col][row] = 2;
    if (c4CheckWin(c4Board, 2)) return c4End(2);
    if (c4Board.every(colArr => colArr.every(v => v))) return c4End('empate');
    c4Turn = 1;
    renderGame_conecta4();
    return;
  }

  let move = null;
  // 1) vence agora se puder
  for (const col of validCols) { const row = c4LowestRow(col); c4Board[col][row]=2; if (c4CheckWin(c4Board,2)) move=col; c4Board[col][row]=null; if (move!==null) break; }
  // 2) bloqueia vitória do adversário
  if (move === null) for (const col of validCols) { const row = c4LowestRow(col); c4Board[col][row]=1; if (c4CheckWin(c4Board,1)) move=col; c4Board[col][row]=null; if (move!==null) break; }
  // 3) difícil/impossível: evita jogar numa coluna que dá de bandeja a
  // vitória pro adversário na jogada seguinte (olha 1 jogada à frente)
  if (move === null && (c4Difficulty === 'dificil' || c4Difficulty === 'impossivel')) {
    const safeCols = validCols.filter(col => {
      const row = c4LowestRow(col);
      c4Board[col][row] = 2;
      const rowAbove = row - 1;
      let unsafe = false;
      if (rowAbove >= 0) { c4Board[col][rowAbove] = 1; if (c4CheckWin(c4Board, 1)) unsafe = true; c4Board[col][rowAbove] = null; }
      c4Board[col][row] = null;
      return !unsafe;
    });
    const pool = safeCols.length ? safeCols : validCols;
    // prefere colunas centrais (mais opções de conexão) como critério de desempate
    pool.sort((a, b) => Math.abs(a - 3) - Math.abs(b - 3));
    move = pool[0];
  }
  if (move === null) {
    const pool = [...validCols].sort((a, b) => Math.abs(a - 3) - Math.abs(b - 3));
    move = pool[0];
  }
  const row = c4LowestRow(move);
  c4Board[move][row] = 2;
  if (c4CheckWin(c4Board, 2)) return c4End(2);
  if (c4Board.every(colArr => colArr.every(v => v))) return c4End('empate');
  c4Turn = 1;
  renderGame_conecta4();
}
export function c4End(w) {
  c4Over = true; renderGame_conecta4();
  const status = document.getElementById('c4-status');
  status.textContent = w === 'empate' ? 'Empate!' : `Jogador ${w} venceu!`;
  if (w === 1) { gameReward(20, 6); notify('success', '🏆 Você venceu! +20 Cry'); }
}

