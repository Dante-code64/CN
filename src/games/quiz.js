// quiz.js
// Quiz de perguntas sobre o Crydan.
import { QUIZ_QUESTIONS } from './data.js';
import { gameReward, notify, celebrate } from '../main.js';
/* ---------- 4. QUIZ ---------- */
let quizIndex, quizScore, quizOrder;
export function initGame_quiz() {
  quizOrder = QUIZ_QUESTIONS.map((_,i) => i).sort(() => Math.random()-0.5).slice(0,10);
  quizIndex = 0; quizScore = 0;
  renderGame_quiz();
}
export function renderGame_quiz() {
  const c = document.getElementById('game-container');
  if (quizIndex >= quizOrder.length) {
    const cry = quizScore * 5;
    gameReward(cry, quizScore);
    if (quizScore === quizOrder.length) celebrate('big');
    c.innerHTML = `
      <div class="card-title">❓ Quiz Crydan — Resultado</div>
      <div style="text-align:center;padding:30px">
        <div style="font-size:40px;margin-bottom:10px">🏆</div>
        <div style="font-size:18px;color:var(--gold2);margin-bottom:8px">Você acertou ${quizScore} de ${quizOrder.length}!</div>
        <div style="font-size:13px;color:var(--text3);margin-bottom:16px">+${cry} Cry</div>
        <button class="btn btn-primary" onclick="initGame_quiz()">🔄 Jogar Novamente</button>
      </div>`;
    return;
  }
  const q = QUIZ_QUESTIONS[quizOrder[quizIndex]];
  c.innerHTML = `
    <div class="card-title">❓ Quiz Crydan (${quizIndex+1}/${quizOrder.length}) — Pontos: ${quizScore}</div>
    <div style="font-size:15px;color:var(--text);margin-bottom:14px;text-align:center">${q.q}</div>
    <div style="display:flex;flex-direction:column;gap:8px;max-width:400px;margin:0 auto">
      ${q.options.map((op,i) => `<button class="btn" onclick="quizAnswer(${i})">${op}</button>`).join('')}
    </div>`;
}
export function quizAnswer(i) {
  const q = QUIZ_QUESTIONS[quizOrder[quizIndex]];
  if (i === q.a) { quizScore++; notify('success', '✅ Certa!', 1200); } else { notify('error', `❌ Errada — era "${q.options[q.a]}"`, 1800); }
  quizIndex++;
  renderGame_quiz();
}


