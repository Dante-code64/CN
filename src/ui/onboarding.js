// src/ui/onboarding.js
// Tour de boas-vindas (aquelas telas que aparecem na primeira vez que
// alguem abre o jogo). tourStep fica só aqui dentro -- nada de fora usa.
// closeOnboardingTour ficou no main.js de propósito: ela mexe no estado
// do jogador (G.tourSeen) e chama saveGame(), que ainda não foram
// modularizados -- então essa função continua lá por enquanto.

import { ONBOARDING_STEPS } from './constants.js';

// ══════════════════════════════════════════
//   TOUR DE BOAS-VINDAS (primeira vez no app)
// ══════════════════════════════════════════
let tourStep = 0;

export function startOnboardingTour() {
  tourStep = 0;
  renderOnboardingTour();
}

export function renderOnboardingTour() {
  let overlay = document.getElementById('onboarding-tour-overlay');
  if (!overlay) {
    overlay = document.createElement('div');
    overlay.id = 'onboarding-tour-overlay';
    overlay.className = 'call-overlay';
    document.body.appendChild(overlay);
  }
  const step = ONBOARDING_STEPS[tourStep];
  const isLast = tourStep === ONBOARDING_STEPS.length - 1;
  overlay.innerHTML = `
    <div class="call-box" style="max-width:380px;background:var(--bg2);border:1px solid var(--gold3);border-radius:14px;padding:28px">
      <div style="font-size:48px;margin-bottom:14px">${step.icon}</div>
      <div style="font-family:'Cinzel',serif;font-size:19px;color:var(--gold2);margin-bottom:10px">${step.title}</div>
      <div style="font-size:13px;color:var(--text2);line-height:1.6;margin-bottom:18px">${step.text}</div>
      <div style="display:flex;justify-content:center;gap:5px;margin-bottom:18px">
        ${ONBOARDING_STEPS.map((_,i) => `<span style="width:7px;height:7px;border-radius:50%;background:${i===tourStep?'var(--gold)':'var(--border2)'}"></span>`).join('')}
      </div>
      <div style="display:flex;gap:8px;justify-content:center">
        ${tourStep > 0 ? '<button class="btn btn-sm" onclick="tourPrev()">← Voltar</button>' : `<button class="btn btn-sm" onclick="closeOnboardingTour()">Pular</button>`}
        <button class="btn btn-primary" onclick="${isLast ? 'closeOnboardingTour()' : 'tourNext()'}">${isLast ? '🎉 Começar!' : 'Próximo →'}</button>
      </div>
    </div>`;
}
export function tourNext() { tourStep = Math.min(ONBOARDING_STEPS.length - 1, tourStep + 1); renderOnboardingTour(); }
export function tourPrev() { tourStep = Math.max(0, tourStep - 1); renderOnboardingTour(); }

export function replayTour() { startOnboardingTour(); }
