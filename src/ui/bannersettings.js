// src/ui/bannersettings.js
// Ajuste de banner: video de banner, posicao (X/Y) e zoom.

import { BANNER_PRESETS } from '../rpg/data.js';
import {
  G, notify, saveGame, refreshProfile, showModal, closeModalDirect
} from '../main.js';

// ── AJUSTE DE POSIÇÃO/ZOOM DO BANNER ──
export function getCurrentBannerCss() {
  if (G.banner) return `url('${G.banner.replace(/'/g, "\\'")}')`;
  const preset = BANNER_PRESETS.find(b => b.id === G.bannerPreset) || BANNER_PRESETS[0];
  return preset.css;
}
export function openBannerVideoModal() {
  const isVideo = G.bannerType === 'video' && G.bannerVideo;
  showModal('🎬 Banner em Vídeo', `
    <div style="font-size:12px;color:var(--text2);margin-bottom:12px;line-height:1.5">
      Deixe seu banner animado com um vídeo em loop, igual ao Discord Nitro. Cole o link de um vídeo (recomendado — sem limite de tamanho) ou envie um arquivo curto do seu dispositivo.
    </div>
    <div class="form-group"><label class="form-label">Link do vídeo (.mp4)</label><input class="form-input" id="banner-video-url" placeholder="https://exemplo.com/meu-video.mp4" value="${(G.bannerVideo && !G.bannerVideo.startsWith('data:')) ? G.bannerVideo : ''}"></div>
    <div class="form-group">
      <input type="file" id="banner-video-file-input" accept="video/*" style="display:none" onchange="handleBannerVideoFileSelect(event)">
      <button class="btn" style="width:100%" onclick="document.getElementById('banner-video-file-input').click()">📁 Carregar vídeo do dispositivo (máx. 3MB)</button>
    </div>
    <div style="display:flex;gap:8px">
      <button class="btn btn-primary" style="flex:1" onclick="saveBannerVideoUrl()">💾 Usar Vídeo como Banner</button>
      ${isVideo ? `<button class="btn btn-danger" onclick="removeBannerVideo()">✕ Remover</button>` : ''}
    </div>
  `);
}
export function saveBannerVideoUrl() {
  const url = document.getElementById('banner-video-url').value.trim();
  if (!url) return notify('error', 'Cole o link de um vídeo.');
  G.bannerVideo = url;
  G.bannerType = 'video';
  saveGame();
  refreshProfile();
  closeModalDirect();
  notify('success', '🎬 Banner em vídeo aplicado!');
}
export function handleBannerVideoFileSelect(e) {
  const file = e.target.files && e.target.files[0];
  if (!file) return;
  if (!file.type.startsWith('video/')) { notify('error', 'Selecione um arquivo de vídeo válido.'); e.target.value = ''; return; }
  if (file.size > 3 * 1024 * 1024) { notify('error', 'Vídeo muito grande (máx. 3MB) — o navegador guarda tudo localmente. Prefira colar um link de vídeo.'); e.target.value = ''; return; }
  const reader = new FileReader();
  reader.onload = function(ev) {
    G.bannerVideo = ev.target.result;
    G.bannerType = 'video';
    saveGame();
    refreshProfile();
    closeModalDirect();
    notify('success', '🎬 Banner em vídeo aplicado!');
  };
  reader.onerror = function() { notify('error', 'Não foi possível ler o vídeo selecionado.'); };
  reader.readAsDataURL(file);
  e.target.value = '';
}
export function removeBannerVideo() {
  G.bannerType = 'image';
  G.bannerVideo = '';
  saveGame();
  refreshProfile();
  closeModalDirect();
  notify('info', 'Banner em vídeo removido — voltando pra imagem.');
}
export function openBannerAdjustModal() {
  showModal('🖼️ Ajustar Banner', `
    <div style="margin-bottom:14px;border-radius:8px;overflow:hidden;position:relative;height:140px;background:var(--bg3)">
      <div id="banner-adjust-preview-img" style="position:absolute;inset:0"></div>
    </div>
    <div class="form-group"><label class="form-label">Posição Horizontal</label><input type="range" min="0" max="100" id="banner-adj-x" value="${G.bannerPosX ?? 50}" oninput="updateBannerAdjustPreview()"></div>
    <div class="form-group"><label class="form-label">Posição Vertical</label><input type="range" min="0" max="100" id="banner-adj-y" value="${G.bannerPosY ?? 50}" oninput="updateBannerAdjustPreview()"></div>
    <div class="form-group"><label class="form-label">Zoom</label><input type="range" min="100" max="250" id="banner-adj-zoom" value="${G.bannerZoom || 100}" oninput="updateBannerAdjustPreview()"></div>
    <button class="btn btn-primary" style="width:100%" onclick="saveBannerAdjust()">💾 Salvar Ajuste</button>
  `);
  updateBannerAdjustPreview();
}
export function updateBannerAdjustPreview() {
  const img = document.getElementById('banner-adjust-preview-img');
  if (!img) return;
  const x = document.getElementById('banner-adj-x').value;
  const y = document.getElementById('banner-adj-y').value;
  const zoom = document.getElementById('banner-adj-zoom').value;
  img.style.background = getCurrentBannerCss();
  img.style.backgroundSize = zoom + '%';
  img.style.backgroundPosition = x + '% ' + y + '%';
  img.style.backgroundRepeat = 'no-repeat';
}
export function saveBannerAdjust() {
  G.bannerPosX = parseInt(document.getElementById('banner-adj-x').value);
  G.bannerPosY = parseInt(document.getElementById('banner-adj-y').value);
  G.bannerZoom = parseInt(document.getElementById('banner-adj-zoom').value);
  saveGame();
  refreshProfile();
  closeModalDirect();
  notify('success', '🖼️ Banner ajustado!');
}

