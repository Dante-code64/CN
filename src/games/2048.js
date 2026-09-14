// 2048.js
// Jogo 2048. currentGame vem do main.js so pra saber se essa tela ainda
// esta aberta quando o teclado for apertado (evita atalho fantasma).
import { gameReward, notify, currentGame } from '../main.js';
/* ---------- 9. 2048 ---------- */
let g2048Board, g2048Over, g2048Score, g2048KeyHandler;
export function initGame_2048() {
  g2048Board = Array(4).fill(null).map(() => Array(4).fill(0));
  g2048Score = 0; g2048Over = false;
  g2048Spawn(); g2048Spawn();
  renderGame_2048();
  if (g2048KeyHandler) document.removeEventListener('keydown', g2048KeyHandler);
  g2048KeyHandler = (e) => {
    if (currentGame !== '2048') return;
    const map = { ArrowUp:'up', ArrowDown:'down', ArrowLeft:'left', ArrowRight:'right' };
    if (map[e.key]) { e.preventDefault(); g2048Move(map[e.key]); }
  };
  document.addEventListener('keydown', g2048KeyHandler);
}
export function g2048Spawn() {
  const empty = [];
  for (let r=0;r<4;r++) for (let c=0;c<4;c++) if (!g2048Board[r][c]) empty.push([r,c]);
  if (!empty.length) return;
  const [r,c] = empty[Math.floor(Math.random()*empty.length)];
  g2048Board[r][c] = Math.random() < 0.9 ? 2 : 4;
}
export function renderGame_2048() {
  const c = document.getElementById('game-container');
  const colors = { 2:'#eee4da',4:'#ede0c8',8:'#f2b179',16:'#f59563',32:'#f67c5f',64:'#f65e3b',128:'#edcf72',256:'#edcc61',512:'#edc850',1024:'#edc53f',2048:'#edc22e' };
  let html = '';
  for (let r=0;r<4;r++) for (let col=0;col<4;col++) {
    const v = g2048Board[r][col];
    html += `<div class="g2048-tile" style="background:${v?colors[v]||'#3c3a32':''};color:${v>4?'#fff':'#555'}">${v||''}</div>`;
  }
  c.innerHTML = `
    <div class="card-title">🎯 2048 — Pontos: ${g2048Score}</div>
    <div style="text-align:center;font-size:12px;color:var(--text3);margin-bottom:10px">Use as setas do teclado (⬆️⬇️⬅️➡️) para jogar</div>
    <div class="g2048-board">${html}</div>
    <div style="display:flex;gap:6px;justify-content:center;margin-top:12px">
      <button class="btn-sm" onclick="g2048Move('up')">⬆️</button>
      <button class="btn-sm" onclick="g2048Move('left')">⬅️</button>
      <button class="btn-sm" onclick="g2048Move('down')">⬇️</button>
      <button class="btn-sm" onclick="g2048Move('right')">➡️</button>
      <button class="btn-sm" onclick="initGame_2048()">🔄</button>
    </div>
    ${g2048Over ? '<div style="text-align:center;margin-top:10px"><span class="badge badge-red">Fim de jogo!</span></div>' : ''}`;
}
export function g2048Slide(row) {
  let arr = row.filter(v => v);
  for (let i=0;i<arr.length-1;i++) if (arr[i]===arr[i+1]) { arr[i]*=2; g2048Score += arr[i]; arr.splice(i+1,1); }
  while (arr.length < 4) arr.push(0);
  return arr;
}
export function g2048Move(dir) {
  if (g2048Over) return;
  const before = JSON.stringify(g2048Board);
  let b = g2048Board;
  const rotate = (board) => board[0].map((_,i) => board.map(row => row[i]).reverse());
  if (dir === 'left') b = b.map(row => g2048Slide(row));
  else if (dir === 'right') b = b.map(row => g2048Slide(row.slice().reverse()).reverse());
  else if (dir === 'up') { b = rotate(rotate(rotate(b))); b = b.map(row => g2048Slide(row)); b = rotate(b); }
  else if (dir === 'down') { b = rotate(b); b = b.map(row => g2048Slide(row)); b = rotate(rotate(rotate(b))); }
  g2048Board = b;
  if (JSON.stringify(g2048Board) !== before) {
    g2048Spawn();
    const hasMoves = g2048Board.some((row,r) => row.some((v,c) => !v || (c<3&&row[c+1]===v) || (r<3&&g2048Board[r+1][c]===v)));
    if (!hasMoves) { g2048Over = true; gameReward(Math.floor(g2048Score/20), 3); notify('info', `Fim de jogo! Pontuação: ${g2048Score}`); }
  }
  renderGame_2048();
}

