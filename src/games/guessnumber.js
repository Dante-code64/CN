// guessnumber.js
// Adivinhe o Número (1 a 100).
import { gameReward } from '../main.js';
/* ---------- 8. ADIVINHE O NÚMERO ---------- */
let numTarget, numTries, numMin, numMax;
export function initGame_numero() {
  numTarget = Math.floor(Math.random()*100)+1; numTries = 0; numMin = 1; numMax = 100;
  renderGame_numero('Pense em um número entre 1 e 100... já pensei no meu! Tente adivinhar.');
}
export function renderGame_numero(msg) {
  const c = document.getElementById('game-container');
  c.innerHTML = `
    <div class="card-title">🔢 Adivinhe o Número</div>
    <div style="text-align:center;font-size:13px;color:var(--text2);margin-bottom:14px">${msg}</div>
    <div style="text-align:center;font-size:12px;color:var(--text3);margin-bottom:10px">Tentativas: ${numTries} · Intervalo atual: ${numMin} a ${numMax}</div>
    <div style="display:flex;gap:8px;justify-content:center">
      <input class="form-input" id="num-input" type="number" min="1" max="100" style="width:120px;text-align:center" onkeydown="if(event.key==='Enter'){numGuess();}">
      <button class="btn btn-primary" onclick="numGuess()">Tentar</button>
      <button class="btn-sm" onclick="initGame_numero()">🔄 Novo Jogo</button>
    </div>`;
}
export function numGuess() {
  const input = document.getElementById('num-input');
  const g = parseInt(input.value);
  if (isNaN(g)) return;
  numTries++;
  if (g === numTarget) {
    const cry = Math.max(5, 30 - numTries*2);
    gameReward(cry, 4);
    renderGame_numero(`🎉 Acertou em ${numTries} tentativas! +${cry} Cry`);
  } else if (g < numTarget) {
    numMin = Math.max(numMin, g+1);
    renderGame_numero(`${g} é menor que o número secreto. Tente mais alto!`);
  } else {
    numMax = Math.min(numMax, g-1);
    renderGame_numero(`${g} é maior que o número secreto. Tente mais baixo!`);
  }
}

