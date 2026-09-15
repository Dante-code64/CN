// src/ui/profilecustomization.js
// Links do perfil (redes sociais) e fundo personalizado do app.

import { LINK_PLATFORMS } from '../rpg/data.js';
import { escapeHtml } from '../utils/escapeHtml.js';
import { buildLinkHref } from '../utils/helpers.js';
import { G, notify, saveGame } from '../main.js';

// ── LINKS DO PERFIL (múltiplas plataformas) ──
export function renderProfileLinks() {
  const el = document.getElementById('profile-link-row');
  if (!el) return;
  G.profileLinks = G.profileLinks || {};
  const filled = LINK_PLATFORMS.filter(p => G.profileLinks[p.id]);
  if (!filled.length) { el.style.display = 'none'; el.innerHTML = ''; return; }
  el.style.display = 'flex';
  el.style.flexWrap = 'wrap';
  el.style.gap = '8px';
  el.innerHTML = filled.map(p => {
    const value = G.profileLinks[p.id];
    const href = buildLinkHref(p, value);
    if (href) return `<a class="social-pill" href="${href}" target="_blank" rel="noopener">${p.icon} ${escapeHtml(p.name)}</a>`;
    return `<span class="social-pill" style="cursor:default">${p.icon} ${escapeHtml(value)}</span>`;
  }).join('');
}

// ── FUNDO PERSONALIZADO (foto da galeria) ──
export function applyCustomBgImage(dataUrl, persist = true) {
  document.body.style.backgroundImage = `url("${dataUrl}")`;
  document.body.classList.add('custom-bg-image');
  if (persist && G && G.name) { G.customBgImage = dataUrl; saveGame(); }
}
export function removeCustomBgImage(persist = true) {
  document.body.style.backgroundImage = '';
  document.body.classList.remove('custom-bg-image');
  const btn = document.getElementById('cfg-bg-image-remove');
  if (btn) btn.style.display = 'none';
  if (persist && G && G.name) { G.customBgImage = ''; saveGame(); }
  if (persist) notify('info', 'Imagem de fundo removida.');
}
export function handleBgImageFileSelect(e) {
  const file = e.target.files && e.target.files[0];
  if (!file) return;
  if (!file.type.startsWith('image/')) { notify('error', 'Selecione um arquivo de imagem válido.'); e.target.value = ''; return; }
  if (file.size > 4 * 1024 * 1024) { notify('error', 'Imagem muito grande (máx. 4MB).'); e.target.value = ''; return; }
  const reader = new FileReader();
  reader.onload = function(ev) {
    applyCustomBgImage(ev.target.result, true);
    const btn = document.getElementById('cfg-bg-image-remove');
    if (btn) btn.style.display = 'inline-block';
    notify('success', '🖼️ Fundo do app atualizado com sua foto!');
  };
  reader.onerror = function() { notify('error', 'Não foi possível ler a imagem selecionada.'); };
  reader.readAsDataURL(file);
  e.target.value = '';
}

export function saveProfileLinks() {
  G.profileLinks = G.profileLinks || {};
  LINK_PLATFORMS.forEach(p => {
    const input = document.getElementById('cfg-link-' + p.id);
    if (input) G.profileLinks[p.id] = input.value.trim();
  });
  saveGame();
  renderProfileLinks();
  notify('success', '🔗 Links do perfil salvos!');
}
