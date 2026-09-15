// src/ui/bannershop.js
// Loja de animacoes de banner (preview + equipar). G, applyBannerAnim,
// getLottieCatalog, mountBannerFx e gsapStagger continuam morando no
// main.js (fazem parte do "motor" central do app) -- so ficaram
// importaveis por este modulo, mesmo padrao de import circular ja usado
// nos mini-jogos.

import { BANNER_ANIMS } from '../rpg/data.js';
import { escapeHtml } from '../utils/escapeHtml.js';
import { G, _lottieCatalogCache, applyBannerAnim, getLottieCatalog, mountBannerFx, gsapStagger, notify } from '../main.js';

let previewedBannerId = null;
export async function renderBannerAnimShop() {
  const el = document.getElementById('banner-anim-shop');
  if (!el) return;
  const current = G.bannerAnim || 'none';
  const lottieCat = await getLottieCatalog();
  const lottieList = lottieCat.filter(l => l.category === 'banner').map(l => ({ id: 'lottie:' + l.id, name: '✨ ' + l.name, lottieUrl: l.url }));
  // As animações antigas (feitas só com CSS/tsParticles) saíram da loja — só oferecemos
  // animações reais (vídeo/Lottie) daqui pra frente. Se o jogador já tinha uma das antigas
  // equipada, ela continua aparecendo (marcada como "clássica") pra não sumir do nada.
  const legacyEquipped = (current !== 'none' && !current.startsWith('lottie:'))
    ? BANNER_ANIMS.filter(a => a.id === current).map(a => ({ ...a, name: a.name + ' (clássica)' }))
    : [];
  const list = [{ id: 'none', name: 'Nenhuma' }, ...lottieList, ...legacyEquipped];
  el.innerHTML = list.map(a => {
    const equipped = current === a.id;
    return `<div class="frame-shop-card">
      <div class="profile-banner" id="banner-mini-${a.id.replace(':','_')}" style="height:44px;border-radius:8px;position:relative;overflow:hidden;background:linear-gradient(135deg,var(--bg3),var(--bg4));margin-bottom:6px">
        <div class="banner-fx-slot" id="banner-mini-fx-${a.id.replace(':','_')}"></div>
      </div>
      <div class="frame-shop-name" title="${escapeHtml(a.name)}">${escapeHtml(a.name)}</div>
      <div style="display:flex;gap:4px;margin-bottom:6px">
        <button class="btn-sm" style="flex:1" onclick="previewBannerAnim('${a.id}')">👁️ Ver</button>
      </div>
      ${equipped ? '<span class="badge badge-gold" style="width:100%;display:block">Equipada</span>' : `<button class="btn-sm btn-success" style="width:100%" onclick="equipBannerAnim('${a.id}')">Equipar</button>`}
    </div>`;
  }).join('');
  list.forEach(a => {
    const banner = document.getElementById('banner-mini-' + a.id.replace(':','_'));
    if (banner && a.id !== 'none' && !a.id.startsWith('lottie:')) banner.classList.add('anim-' + a.id);
    mountBannerFx('banner-mini-fx-' + a.id.replace(':','_'), a.id);
  });
  gsapStagger('.frame-shop-card', el);
}
export function previewBannerAnim(id) {
  previewedBannerId = id;
  const isLottie = id.startsWith('lottie:');
  const lEntry = isLottie ? (_lottieCatalogCache || []).find(l => l.id === id.slice(7)) : null;
  const anim = isLottie ? { id, name: lEntry ? '✨ ' + lEntry.name : 'Lottie' } : (BANNER_ANIMS.find(a => a.id === id) || { id: 'none', name: 'Nenhuma' });
  const card = document.getElementById('banner-preview-card');
  card.style.display = 'block';
  const box = document.getElementById('banner-preview-box');
  BANNER_ANIMS.forEach(a => box.classList.remove('anim-' + a.id));
  if (id !== 'none' && !isLottie) box.classList.add('anim-' + id);
  mountBannerFx('banner-preview-fx', id);
  document.getElementById('banner-preview-name').textContent = anim.name;
  card.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}
export function equipBannerAnim(id) {
  applyBannerAnim(id, true);
  renderBannerAnimShop();
  if (id.startsWith('lottie:')) {
    const l = (_lottieCatalogCache || []).find(x => x.id === id.slice(7));
    notify('success', `✨ ${l ? l.name : 'Animação'} aplicada ao banner!`);
    closeBannerPreview();
    return;
  }
  const anim = BANNER_ANIMS.find(a => a.id === id);
  notify('success', `${anim ? anim.name : 'Nenhuma animação'} aplicada ao banner!`);
  closeBannerPreview();
}
export function confirmEquipPreviewedBanner() {
  if (previewedBannerId === null) return;
  equipBannerAnim(previewedBannerId);
}
export function closeBannerPreview() {
  previewedBannerId = null;
  const card = document.getElementById('banner-preview-card');
  if (card) card.style.display = 'none';
}
