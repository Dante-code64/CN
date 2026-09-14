// rockpaperscissors.js
// Pedra, Papel e Tesoura.
import { gameReward } from '../main.js';
/* ---------- 7. PEDRA, PAPEL, TESOURA ---------- */
let pptScore;
export function initGame_ppt() {
  pptScore = pptScore || { win:0, lose:0, draw:0 };
  renderGame_ppt('', '', '');
}
export function renderGame_ppt(playerChoice, aiChoice, result) {
  const c = document.getElementById('game-container');
  const icons = { pedra:'🪨', papel:'📄', tesoura:'✂️' };
  c.innerHTML = `
    <div class="card-title">✂️ Pedra, Papel e Tesoura</div>
    <div style="text-align:center;font-size:13px;color:var(--text3);margin-bottom:14px">Vitórias: ${pptScore.win} · Derrotas: ${pptScore.lose} · Empates: ${pptScore.draw}</div>
    ${playerChoice ? `<div style="text-align:center;font-size:40px;margin-bottom:10px">${icons[playerChoice]} vs ${icons[aiChoice]}</div><div style="text-align:center;font-size:16px;color:var(--gold2);margin-bottom:16px">${result}</div>` : ''}
    <div style="display:flex;gap:12px;justify-content:center">
      <button class="btn" style="font-size:24px;padding:16px" onclick="pptPlay('pedra')">🪨</button>
      <button class="btn" style="font-size:24px;padding:16px" onclick="pptPlay('papel')">📄</button>
      <button class="btn" style="font-size:24px;padding:16px" onclick="pptPlay('tesoura')">✂️</button>
    </div>`;
}
export function pptPlay(choice) {
  const options = ['pedra','papel','tesoura'];
  const ai = options[Math.floor(Math.random()*3)];
  let result;
  if (choice === ai) { result = 'Empate!'; pptScore.draw++; }
  else if ((choice==='pedra'&&ai==='tesoura')||(choice==='papel'&&ai==='pedra')||(choice==='tesoura'&&ai==='papel')) { result = 'Você venceu!'; pptScore.win++; gameReward(8, 2); }
  else { result = 'A IA venceu!'; pptScore.lose++; }
  renderGame_ppt(choice, ai, result);
}

