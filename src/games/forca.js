// forca.js
// Jogo da Forca.
import { FORCA_WORDS, HANGMAN_STAGES } from './data.js';
import { gameReward, notify } from '../main.js';
/* ---------- 3. FORCA ---------- */
let forcaWord, forcaGuessed, forcaWrong;
export function initGame_forca() {
  forcaWord = FORCA_WORDS[Math.floor(Math.random()*FORCA_WORDS.length)];
  forcaGuessed = []; forcaWrong = 0;
  renderGame_forca();
}
export function renderGame_forca() {
  const c = document.getElementById('game-container');
  const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');
  const won = forcaWord.split('').every(ch => forcaGuessed.includes(ch));
  const lost = forcaWrong >= 6;
  c.innerHTML = `
    <div class="card-title">🪢 Forca</div>
    <div class="hangman-figure">${HANGMAN_STAGES[forcaWrong]}</div>
    <div class="word-blanks">${forcaWord.split('').map(ch => forcaGuessed.includes(ch) || lost ? `<span style="${!forcaGuessed.includes(ch)&&lost?'color:var(--red)':''}">${ch}</span>` : '_').join('')}</div>
    <div style="text-align:center;font-size:12px;color:var(--text3);margin-bottom:10px">Erros: ${forcaWrong}/6</div>
    <div style="display:flex;flex-wrap:wrap;gap:4px;justify-content:center;max-width:400px;margin:0 auto">
      ${letters.map(l => `<button class="letter-btn" ${forcaGuessed.includes(l)||won||lost?'disabled':''} onclick="forcaGuess('${l}')">${l}</button>`).join('')}
    </div>
    <div style="text-align:center;margin-top:12px">
      ${won ? '<span class="badge badge-green">🎉 Você venceu!</span>' : ''}
      ${lost ? `<span class="badge badge-red">💀 Fim de jogo! Era "${forcaWord}"</span>` : ''}
      <button class="btn-sm" style="margin-left:8px" onclick="initGame_forca()">🔄 Nova Palavra</button>
    </div>`;
  if (won && !window._forcaRewarded) { window._forcaRewarded = true; gameReward(18, 5); notify('success', '🎉 +18 Cry'); }
  if (!won) window._forcaRewarded = false;
}
export function forcaGuess(l) {
  if (forcaGuessed.includes(l)) return;
  forcaGuessed.push(l);
  if (!forcaWord.includes(l)) forcaWrong++;
  renderGame_forca();
}

