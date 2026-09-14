// chess.js
// Xadrez com regras simplificadas (sem xeque-mate, roque, en passant).
import { chessIsWhite, chessIsBlack } from './helpers.js';
import { gameReward, notify } from '../main.js';
/* ---------- 11. XADREZ (regras simplificadas) ---------- */
let chessBoard, chessTurn, chessSelected, chessOver;
export function initGame_xadrez() {
  chessBoard = [
    ['♜','♞','♝','♛','♚','♝','♞','♜'],
    ['♟','♟','♟','♟','♟','♟','♟','♟'],
    ['','','','','','','',''],
    ['','','','','','','',''],
    ['','','','','','','',''],
    ['','','','','','','',''],
    ['♙','♙','♙','♙','♙','♙','♙','♙'],
    ['♖','♘','♗','♕','♔','♗','♘','♖'],
  ];
  chessTurn = 'w'; chessSelected = null; chessOver = false;
  renderGame_xadrez();
}
export function chessValidMove(piece, r1, c1, r2, c2) {
  const dr = r2-r1, dc = c2-c1;
  const target = chessBoard[r2][c2];
  const isWhite = chessIsWhite(piece);
  if (target && chessIsWhite(target) === isWhite) return false;
  const type = piece;
  const absdr = Math.abs(dr), absdc = Math.abs(dc);
  const pathClear = () => {
    const stepR = Math.sign(dr), stepC = Math.sign(dc);
    let r = r1+stepR, c = c1+stepC;
    while (r !== r2 || c !== c2) { if (chessBoard[r][c]) return false; r+=stepR; c+=stepC; }
    return true;
  };
  if (type === '♙') { if (dc===0 && !target && (dr===-1 || (r1===6 && dr===-2 && !chessBoard[r1-1][c1]))) return true; if (absdc===1 && dr===-1 && target && chessIsBlack(target)) return true; return false; }
  if (type === '♟') { if (dc===0 && !target && (dr===1 || (r1===1 && dr===2 && !chessBoard[r1+1][c1]))) return true; if (absdc===1 && dr===1 && target && chessIsWhite(target)) return true; return false; }
  if (type === '♖' || type === '♜') return (dr===0 || dc===0) && pathClear();
  if (type === '♗' || type === '♝') return absdr===absdc && pathClear();
  if (type === '♕' || type === '♛') return (dr===0 || dc===0 || absdr===absdc) && pathClear();
  if (type === '♘' || type === '♞') return (absdr===2 && absdc===1) || (absdr===1 && absdc===2);
  if (type === '♔' || type === '♚') return absdr<=1 && absdc<=1;
  return false;
}
export function renderGame_xadrez() {
  const c = document.getElementById('game-container');
  let html = '';
  for (let r=0;r<8;r++) for (let col=0;col<8;col++) {
    const isLight = (r+col)%2===0;
    const sel = chessSelected && chessSelected[0]===r && chessSelected[1]===col;
    html += `<div class="chess-cell ${isLight?'light':'dark'} ${sel?'selected':''}" onclick="chessClick(${r},${col})">${chessBoard[r][col]}</div>`;
  }
  c.innerHTML = `
    <div class="card-title">♟️ Xadrez <span style="font-size:11px;color:var(--text3)">(regras simplificadas — sem xeque-mate, roque ou en passant)</span></div>
    <div style="text-align:center;margin-bottom:10px;font-size:13px;color:var(--gold2)">${chessOver ? 'Fim de jogo!' : `Vez das ${chessTurn==='w'?'Brancas':'Pretas'}`}</div>
    <div class="chess-board">${html}</div>
    <div style="text-align:center;margin-top:10px"><button class="btn-sm" onclick="initGame_xadrez()">🔄 Reiniciar</button></div>`;
}
export function chessClick(r, c) {
  if (chessOver) return;
  const piece = chessBoard[r][c];
  if (chessSelected) {
    const [r1,c1] = chessSelected;
    const sel = chessBoard[r1][c1];
    if (r1===r && c1===c) { chessSelected = null; renderGame_xadrez(); return; }
    if (chessValidMove(sel, r1, c1, r, c)) {
      const captured = chessBoard[r][c];
      chessBoard[r][c] = sel; chessBoard[r1][c1] = '';
      chessSelected = null;
      if (captured === '♚' || captured === '♔') {
        chessOver = true; renderGame_xadrez();
        gameReward(30, 8); notify('success', `🏆 ${chessTurn==='w'?'Brancas':'Pretas'} venceram capturando o rei!`);
        return;
      }
      chessTurn = chessTurn === 'w' ? 'b' : 'w';
      renderGame_xadrez();
    } else {
      if (piece && ((chessTurn==='w'&&chessIsWhite(piece))||(chessTurn==='b'&&chessIsBlack(piece)))) { chessSelected = [r,c]; renderGame_xadrez(); }
      else { chessSelected = null; renderGame_xadrez(); }
    }
  } else {
    if (piece && ((chessTurn==='w'&&chessIsWhite(piece))||(chessTurn==='b'&&chessIsBlack(piece)))) { chessSelected = [r,c]; renderGame_xadrez(); }
  }
}

