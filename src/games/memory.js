// memory.js
// Jogo da Memória (cartas viradas).
import { MEMORY_EMOJIS } from './data.js';
import { gameReward, notify } from '../main.js';
/* ---------- 6. JOGO DA MEMÓRIA ---------- */
let memCards, memFlipped, memMatched, memMoves, memBusy;
export function initGame_memoria() {
  const pairs = [...MEMORY_EMOJIS, ...MEMORY_EMOJIS];
  memCards = pairs.sort(() => Math.random()-0.5);
  memFlipped = []; memMatched = []; memMoves = 0; memBusy = false;
  renderGame_memoria();
}
export function renderGame_memoria() {
  const c = document.getElementById('game-container');
  c.innerHTML = `
    <div class="card-title">🃏 Jogo da Memória — Movimentos: ${memMoves}</div>
    <div class="memory-board">
      ${memCards.map((e,i) => `<div class="memory-card ${memFlipped.includes(i)||memMatched.includes(i)?'flipped':''}" onclick="memFlip(${i})">${memFlipped.includes(i)||memMatched.includes(i)?e:'❔'}</div>`).join('')}
    </div>
    <div style="text-align:center;margin-top:10px">
      ${memMatched.length === memCards.length ? '<span class="badge badge-green">🎉 Completou!</span>' : ''}
      <button class="btn-sm" style="margin-left:8px" onclick="initGame_memoria()">🔄 Reiniciar</button>
    </div>`;
}
export function memFlip(i) {
  if (memBusy || memFlipped.includes(i) || memMatched.includes(i) || memFlipped.length >= 2) return;
  memFlipped.push(i);
  renderGame_memoria();
  if (memFlipped.length === 2) {
    memMoves++;
    memBusy = true;
    const [a,b] = memFlipped;
    if (memCards[a] === memCards[b]) {
      memMatched.push(a,b); memFlipped = []; memBusy = false;
      renderGame_memoria();
      if (memMatched.length === memCards.length) { gameReward(20, 6); notify('success', `🎉 Completou em ${memMoves} movimentos! +20 Cry`); }
    } else {
      setTimeout(() => { memFlipped = []; memBusy = false; renderGame_memoria(); }, 800);
    }
  }
}

