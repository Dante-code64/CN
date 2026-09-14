// dice.js
// Rolar Dados.
import { createDiceElement } from '../utils/helpers.js';
import { rollDiceVisual } from '../main.js';
/* ---------- 13. ROLAR DADOS ---------- */
let diceCount = 2;
export function initGame_dados() { renderGame_dados(); }
export function renderGame_dados() {
  const c = document.getElementById('game-container');
  let diceHtml = '';
  for (let i = 0; i < diceCount; i++) diceHtml += createDiceElement('dice-solo-' + i);
  c.innerHTML = `
    <div class="card-title">🎲 Rolar Dados</div>
    <div style="text-align:center;font-size:12px;color:var(--text2);margin-bottom:14px">Escolha quantos dados de 6 lados rolar e clique em rolar.</div>
    <div class="game-mode-bar" style="justify-content:center">
      ${[1,2,3,4].map(n => `<button class="btn-sm ${diceCount===n?'btn-primary':''}" onclick="diceSetCount(${n})">${n} dado${n>1?'s':''}</button>`).join('')}
    </div>
    <div style="display:flex;justify-content:center;gap:24px;flex-wrap:wrap;margin:20px 0">${diceHtml}</div>
    <div id="dice-solo-result" style="text-align:center;font-size:20px;color:var(--gold2);font-family:'Cinzel',serif;min-height:28px"></div>
    <div style="text-align:center;margin-top:14px"><button class="btn btn-primary" onclick="diceRollSolo()">🎲 Rolar!</button></div>`;
}
export function diceSetCount(n) { diceCount = n; renderGame_dados(); }
export async function diceRollSolo() {
  const promises = [];
  for (let i = 0; i < diceCount; i++) promises.push(rollDiceVisual('dice-solo-' + i));
  const results = await Promise.all(promises);
  const sum = results.reduce((a,b) => a+b, 0);
  document.getElementById('dice-solo-result').textContent = `Resultado: ${results.join(' + ')} = ${sum}`;
}

