// termo.js
// Jogo Termo (adivinhar palavra de 5 letras).
import { TERMO_WORDS } from './data.js';
import { gameReward, notify } from '../main.js';
/* ---------- 2. TERMO ---------- */
let termoWord, termoGuesses, termoRow, termoOver;
export function initGame_termo() {
  termoWord = TERMO_WORDS[Math.floor(Math.random()*TERMO_WORDS.length)];
  termoGuesses = []; termoRow = ''; termoOver = false;
  renderGame_termo();
}
export function renderGame_termo() {
  const c = document.getElementById('game-container');
  let rows = '';
  for (let i = 0; i < 6; i++) {
    const guess = termoGuesses[i];
    if (guess) {
      rows += `<div class="termo-row">${guess.letters.map(l => `<div class="termo-cell ${l.state}">${l.ch}</div>`).join('')}</div>`;
    } else if (i === termoGuesses.length) {
      const cur = (termoRow + '     ').slice(0,5).split('');
      rows += `<div class="termo-row">${cur.map(ch => `<div class="termo-cell">${ch.trim()}</div>`).join('')}</div>`;
    } else {
      rows += `<div class="termo-row">${'     '.split('').map(()=>`<div class="termo-cell"></div>`).join('')}</div>`;
    }
  }
  c.innerHTML = `
    <div class="card-title">🟩 Termo</div>
    <div style="font-size:12px;color:var(--text2);text-align:center;margin-bottom:10px">Adivinhe a palavra de 5 letras em até 6 tentativas.</div>
    ${rows}
    <div style="display:flex;gap:8px;justify-content:center;margin-top:12px">
      <input class="form-input" id="termo-input" maxlength="5" style="width:140px;text-transform:uppercase;text-align:center" ${termoOver?'disabled':''} onkeydown="if(event.key==='Enter'){termoSubmit();}">
      <button class="btn btn-primary" onclick="termoSubmit()" ${termoOver?'disabled':''}>Tentar</button>
      <button class="btn-sm" onclick="initGame_termo()">🔄 Nova Palavra</button>
    </div>`;
}
export function termoSubmit() {
  const input = document.getElementById('termo-input');
  const guess = input.value.trim().toUpperCase();
  if (guess.length !== 5) return notify('error', 'A palavra precisa ter 5 letras.');
  const target = termoWord.split('');
  const guessArr = guess.split('');
  const states = Array(5).fill('absent');
  const used = Array(5).fill(false);
  for (let i = 0; i < 5; i++) if (guessArr[i] === target[i]) { states[i] = 'correct'; used[i] = true; }
  for (let i = 0; i < 5; i++) {
    if (states[i] === 'correct') continue;
    const idx = target.findIndex((ch,j) => ch === guessArr[i] && !used[j]);
    if (idx >= 0) { states[i] = 'present'; used[idx] = true; }
  }
  termoGuesses.push({ letters: guessArr.map((ch,i) => ({ ch, state: states[i] })) });
  input.value = '';
  if (guess === termoWord) {
    termoOver = true; renderGame_termo();
    gameReward(20, 6); notify('success', `🎉 Você acertou "${termoWord}"! +20 Cry`);
    return;
  }
  if (termoGuesses.length >= 6) {
    termoOver = true; renderGame_termo();
    notify('error', `Fim de tentativas! A palavra era "${termoWord}".`);
    return;
  }
  renderGame_termo();
}

