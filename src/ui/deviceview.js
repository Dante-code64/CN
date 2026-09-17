// src/ui/deviceview.js
// Detecta e aplica a visao do dispositivo (PC / tablet / celular),
// inclusive reagindo ao redimensionar da janela.

import { DEVICE_VIEWS } from './constants.js';
import { G, saveGame } from '../main.js';

// ── DEVICE VIEW (PC / TABLET / CELULAR) ────
// ── Detecção automática de dispositivo (responsividade real) ───────────
// Antes disso, a "visão de dispositivo" só mudava se o usuário clicasse
// manualmente no botão de alternância — ou seja, todo mundo entrava no
// layout de PC por padrão, mesmo abrindo direto pelo celular. Agora o
// tamanho real da tela decide o layout inicial sozinho.
export function autoDetectDeviceView() {
  const w = window.innerWidth;
  if (w <= 860) return 'mobile';
  if (w <= 1180) return 'tablet';
  return 'pc';
}
let _deviceViewManualOverride = false;
export function setDeviceView(mode, manual = false) {
  if (!DEVICE_VIEWS[mode]) mode = 'pc';
  if (manual) _deviceViewManualOverride = true;
  document.body.classList.remove('view-pc', 'view-tablet', 'view-mobile', 'sidebar-open');
  document.body.classList.add('view-' + mode);
  const icon = document.getElementById('device-icon');
  const label = document.getElementById('device-label');
  if (icon) icon.textContent = DEVICE_VIEWS[mode].icon;
  if (label) label.textContent = DEVICE_VIEWS[mode].label;
  // persist device view to user save (G) instead of localStorage
  if (G && G.name) { G.deviceView = mode; saveGame(); }
}
window.addEventListener('resize', () => {
  clearTimeout(window._deviceResizeTimer);
  window._deviceResizeTimer = setTimeout(() => {
    // só reage ao tamanho real da tela se o usuário não escolheu manualmente
    // uma visão diferente (ex: forçar visualização mobile num PC pra testar)
    if (!_deviceViewManualOverride && document.getElementById('app-body')?.style.display === 'flex') {
      setDeviceView(autoDetectDeviceView());
    }
  }, 200);
});
export function toggleMobileSidebar() {
  document.body.classList.toggle('sidebar-open');
}
