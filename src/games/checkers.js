// checkers.js
// Damas.
import { gameReward, notify } from '../main.js';
/* ---------- 12. DAMAS ---------- */
let checkersBoard, checkersTurn, checkersSelected, checkersOver;
export function initGame_damas() {
  checkersBoard = Array(8).fill(null).map(() => Array(8).fill(null));
  for (let r=0;r<3;r++) for (let c=0;c<8;c++) if ((r+c)%2===1) checkersBoard[r][c] = { p:2, king:false };
  for (let r=5;r<8;r++) for (let c=0;c<8;c++) if ((r+c)%2===1) checkersBoard[r][c] = { p:1, king:false };
  checkersTurn = 1; checkersSelected = null; checkersOver = false;
  renderGame_damas();
}
export function renderGame_damas() {
  const c = document.getElementById('game-container');
  let html = '';
  for (let r=0;r<8;r++) for (let col=0;col<8;col++) {
    const isLight = (r+col)%2===0;
    const piece = checkersBoard[r][col];
    const sel = checkersSelected && checkersSelected[0]===r && checkersSelected[1]===col;
    html += `<div class="checkers-cell ${isLight?'light':'dark'} ${sel?'selected':''}" onclick="checkersClick(${r},${col})">${piece ? `<div class="checkers-piece p${piece.p} ${piece.king?'king':''}"></div>` : ''}</div>`;
  }
  c.innerHTML = `
    <div class="card-title">⚫ Damas</div>
    <div style="text-align:center;margin-bottom:10px;font-size:13px;color:var(--gold2)">${checkersOver ? 'Fim de jogo!' : `Vez do jogador ${checkersTurn} ${checkersTurn===1?'🔴':'⚪'}`}</div>
    <div class="checkers-board">${html}</div>
    <div style="text-align:center;margin-top:10px"><button class="btn-sm" onclick="initGame_damas()">🔄 Reiniciar</button></div>`;
}
export function checkersValidMove(piece, r1, c1, r2, c2) {
  if (checkersBoard[r2][c2]) return null;
  const dr = r2-r1, dc = c2-c1;
  if (Math.abs(dc) !== Math.abs(dr)) return null;
  const dir = piece.p === 1 ? -1 : 1;
  if (Math.abs(dr) === 1 && (piece.king || dr === dir)) return { capture:null };
  if (Math.abs(dr) === 2 && (piece.king || dr === dir*2)) {
    const midR = r1 + dr/2, midC = c1 + dc/2;
    const mid = checkersBoard[midR][midC];
    if (mid && mid.p !== piece.p) return { capture:[midR,midC] };
  }
  return null;
}
export function checkersClick(r, c) {
  if (checkersOver) return;
  const piece = checkersBoard[r][c];
  if (checkersSelected) {
    const [r1,c1] = checkersSelected;
    const sel = checkersBoard[r1][c1];
    if (r1===r && c1===c) { checkersSelected = null; renderGame_damas(); return; }
    const move = checkersValidMove(sel, r1, c1, r, c);
    if (move) {
      checkersBoard[r][c] = sel; checkersBoard[r1][c1] = null;
      if (move.capture) checkersBoard[move.capture[0]][move.capture[1]] = null;
      if ((sel.p===1 && r===0) || (sel.p===2 && r===7)) sel.king = true;
      checkersSelected = null;
      const oppPieces = checkersBoard.flat().filter(p => p && p.p !== sel.p);
      if (!oppPieces.length) {
        checkersOver = true; renderGame_damas();
        gameReward(25, 7); notify('success', `🏆 Jogador ${sel.p} venceu!`);
        return;
      }
      checkersTurn = checkersTurn === 1 ? 2 : 1;
      renderGame_damas();
    } else {
      if (piece && piece.p === checkersTurn) { checkersSelected = [r,c]; renderGame_damas(); }
      else { checkersSelected = null; renderGame_damas(); }
    }
  } else {
    if (piece && piece.p === checkersTurn) { checkersSelected = [r,c]; renderGame_damas(); }
  }
}
