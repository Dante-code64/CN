// simon.js
// Sequencia Genius (Simon).
import { SIMON_COLORS } from './data.js';
import { gameReward, notify } from '../main.js';
/* ---------- 10. SEQUÊNCIA GENIUS (Simon) ---------- */
let simonSeq, simonPlayerStep, simonPlaying, simonBest;
export function initGame_simon() {
  simonSeq = []; simonPlayerStep = 0; simonPlaying = false; simonBest = simonBest || 0;
  renderGame_simon();
}
export function renderGame_simon() {
  const c = document.getElementById('game-container');
  c.innerHTML = `
    <div class="card-title">🎵 Sequência Genius — Recorde: ${simonBest}</div>
    <div style="text-align:center;font-size:13px;color:var(--text2);margin-bottom:10px">Rodada: ${simonSeq.length}</div>
    <div class="simon-board">
      ${SIMON_COLORS.map((col,i) => `<div class="simon-btn" id="simon-${i}" style="background:${col.c};color:${col.c}" onclick="simonPlayerClick(${i})"></div>`).join('')}
    </div>
    <div style="text-align:center;margin-top:12px">
      <button class="btn btn-primary" onclick="simonStart()" ${simonPlaying?'disabled':''}>${simonSeq.length?'▶️ Próxima Rodada':'▶️ Começar'}</button>
    </div>`;
}
export function simonStart() {
  simonSeq.push(Math.floor(Math.random()*4));
  simonPlayerStep = 0;
  simonPlaying = true;
  renderGame_simon();
  simonPlaySequence();
}
export async function simonPlaySequence() {
  for (let i = 0; i < simonSeq.length; i++) {
    await new Promise(r => setTimeout(r, 500));
    const btn = document.getElementById('simon-' + simonSeq[i]);
    if (btn) btn.classList.add('lit');
    await new Promise(r => setTimeout(r, 400));
    if (btn) btn.classList.remove('lit');
  }
  simonPlaying = false;
}
export function simonPlayerClick(i) {
  if (simonPlaying) return;
  if (i === simonSeq[simonPlayerStep]) {
    simonPlayerStep++;
    if (simonPlayerStep === simonSeq.length) {
      if (simonSeq.length > simonBest) simonBest = simonSeq.length;
      gameReward(simonSeq.length * 3, 2);
      notify('success', `✅ Rodada ${simonSeq.length} completa!`);
      renderGame_simon();
    }
  } else {
    notify('error', `❌ Errou! Sua sequência foi até ${simonSeq.length-1}.`);
    simonSeq = []; simonPlayerStep = 0;
    renderGame_simon();
  }
}

