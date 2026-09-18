// src/ui/frameshop.js
// Loja de molduras de avatar (preview, comprar, equipar). Bem mais funcoes
// emprestadas do main.js dessa vez (G, updateHeader, addToFeed,
// applyAvatarFrame, applyFrameToWrap, renderAnimHtml, getLottieCatalog,
// _lottieCatalogCache, gsapStagger, notify) porque essa e a loja mais
// complexa do jogo -- envolve gastar Cry de verdade.

import { AVATAR_FRAMES, FRAME_CATEGORIES, ACHIEVEMENTS, AVATARS } from '../rpg/data.js';
import { escapeHtml } from '../utils/escapeHtml.js';
import {
  G, getLottieCatalog, _lottieCatalogCache, gsapStagger, notify, saveGame,
  renderAnimHtml, applyFrameToWrap, applyAvatarFrame, updateHeader, addToFeed, renderGallery
} from '../main.js';

export function equipAvatar(a) {
  G.avatar = a;
  saveGame(); updateHeader(); renderGallery();
  notify('success', `Avatar ${a} equipado!`);
}

// ══════════════════════════════════════════
//   LOJA DE MOLDURAS DE AVATAR (Galeria)
// ══════════════════════════════════════════
let frameShopCategory = 'todas';
export let previewedFrameId = null;

export function isFrameOwned(id) {
  if (id === 'none') return true;
  if (id.startsWith('lottie:')) return true;
  const frame = AVATAR_FRAMES.find(f => f.id === id);
  if (!frame) return false;
  if (frame.reqAch) return (G.achievements || []).includes(frame.reqAch);
  if (frame.seasonal) return frame.activeMonths.includes(new Date().getMonth());
  if (frame.cost === 0) return true;
  return (G.unlockedFrames || []).includes(id);
}

export function renderFrameShopTabs() {
  const el = document.getElementById('frame-shop-tabs');
  if (!el) return;
  el.innerHTML = FRAME_CATEGORIES.map(c => `<div class="frame-cat-tab ${frameShopCategory===c.id?'active':''}" onclick="setFrameShopCategory('${c.id}')">${c.name}</div>`).join('');
}
export function setFrameShopCategory(cat) {
  frameShopCategory = cat;
  renderFrameShopTabs();
  renderAvatarFrameShop();
}

export async function renderAvatarFrameShop() {
  const el = document.getElementById('avatar-frame-shop');
  if (!el) return;
  const search = (document.getElementById('frame-shop-search')?.value || '').trim().toLowerCase();
  const lottieCat = await getLottieCatalog();
  const lottieFrames = lottieCat.filter(l => l.category === 'avatar').map(l => ({ id: 'lottie:' + l.id, name: '✨ ' + l.name, cat: 'lottie', lottieUrl: l.url, url: l.url, kind: l.kind, cost: 0, minLevel: 1 }));
  // As molduras antigas (CSS/tsParticles) saíram da loja de novas escolhas — só ficam
  // "custom_image"/"ring_custom" (conteúdo real do próprio jogador) e as novas Lottie/vídeo.
  // Quem já tinha uma moldura antiga equipada continua vendo ela na lista, como "clássica".
  const equippedId = G.avatarFrame || 'none';
  const realFrames = AVATAR_FRAMES.filter(f => f.customImage || f.customColor);
  const legacyEquippedFrame = (equippedId !== 'none' && !equippedId.startsWith('lottie:') && !realFrames.some(f => f.id === equippedId))
    ? AVATAR_FRAMES.filter(f => f.id === equippedId).map(f => ({ ...f, name: f.name + ' (clássica)' }))
    : [];
  let list = [...realFrames, ...lottieFrames, ...legacyEquippedFrame];
  if (frameShopCategory !== 'todas') list = list.filter(f => f.cat === frameShopCategory);
  if (search) list = list.filter(f => f.name.toLowerCase().includes(search));

  if (!list.length) {
    el.innerHTML = '<div style="grid-column:1/-1;text-align:center;color:var(--text3);padding:24px">Nenhuma moldura encontrada.</div>';
    return;
  }

  el.innerHTML = list.map(frame => {
    const owned = isFrameOwned(frame.id);
    const equipped = (G.avatarFrame || 'none') === frame.id;
    const meetsLevel = G.level >= (frame.minLevel || 1);
    const canAfford = G.wallet >= frame.cost;

    if (frame.lottieUrl) {
      return `<div class="frame-shop-card">
        <div class="avatar-frame-wrap frame-mini-wrap" style="position:relative;width:64px;height:64px;margin:0 auto 6px">
          <div class="profile-avatar" style="width:64px;height:64px;display:flex;align-items:center;justify-content:center;border-radius:50%;background:var(--bg3)">${AVATARS[0]}</div>
          <div class="frame-svg-slot" style="position:absolute;inset:-15%">${renderAnimHtml(frame, 'width:130%;height:130%;border-radius:50%')}</div>
        </div>
        <div class="frame-shop-name" title="${escapeHtml(frame.name)}">${escapeHtml(frame.name)}</div>
        ${equipped ? '<span class="badge badge-gold" style="width:100%;display:block">Equipada</span>' : `<button class="btn-sm btn-success" style="width:100%" onclick="equipOwnedFrame('${frame.id}')">Equipar</button>`}
      </div>`;
    }

    if (frame.customColor) {
      return `<div class="frame-shop-card">
        <div class="avatar-frame-wrap frame-mini-wrap" id="mini-${frame.id}">
          <div class="profile-avatar">${AVATARS[0]}</div>
          <div class="frame-svg-slot"></div>
        </div>
        <div class="frame-shop-name" title="${escapeHtml(frame.name)}">${escapeHtml(frame.name)}</div>
        <div class="frame-shop-price">Escolha qualquer cor</div>
        <input type="color" value="${G.customRingColor || '#d4a017'}" oninput="setCustomRingColor(this.value)" style="width:100%;height:26px;border:none;border-radius:6px;cursor:pointer;margin-bottom:6px;background:none">
        ${equipped ? '<span class="badge badge-gold" style="width:100%;display:block">Equipada</span>' : `<button class="btn-sm btn-success" style="width:100%" onclick="equipOwnedFrame('${frame.id}')">Equipar</button>`}
      </div>`;
    }

    if (frame.customImage) {
      return `<div class="frame-shop-card">
        <div class="avatar-frame-wrap frame-mini-wrap" id="mini-${frame.id}">
          <div class="profile-avatar">${AVATARS[0]}</div>
          <div class="frame-svg-slot"></div>
        </div>
        <div class="frame-shop-name" title="${escapeHtml(frame.name)}">${escapeHtml(frame.name)}</div>
        <div class="frame-shop-price">${G.customFrameImage ? 'Imagem carregada' : 'Envie uma imagem/GIF'}</div>
        <input type="file" id="custom-frame-file-input" accept="image/*" style="display:none" onchange="handleCustomFrameImageSelect(event)">
        <button class="btn-sm" style="width:100%;margin-bottom:6px" onclick="document.getElementById('custom-frame-file-input').click()">📁 Enviar Imagem/GIF</button>
        ${equipped ? '<span class="badge badge-gold" style="width:100%;display:block">Equipada</span>' : `<button class="btn-sm btn-success" style="width:100%" ${G.customFrameImage?'':'disabled'} onclick="equipOwnedFrame('${frame.id}')">Equipar</button>`}
      </div>`;
    }

    let actionBtn;
    if (equipped) {
      actionBtn = `<span class="badge badge-gold" style="width:100%;display:block">Equipada</span>`;
    } else if (owned) {
      actionBtn = `<button class="btn-sm btn-success" style="width:100%" onclick="equipOwnedFrame('${frame.id}')">Equipar</button>`;
    } else if (frame.reqAch) {
      const ach = ACHIEVEMENTS.find(a => a.id === frame.reqAch);
      actionBtn = `<button class="btn-sm" style="width:100%" disabled title="Desbloqueie a conquista: ${ach ? escapeHtml(ach.name) : '?'}">🏆 ${ach ? escapeHtml(ach.icon + ' ' + ach.name) : 'Conquista'}</button>`;
    } else if (frame.seasonal) {
      const MESES = ['janeiro','fevereiro','março','abril','maio','junho','julho','agosto','setembro','outubro','novembro','dezembro'];
      const nextMonth = frame.activeMonths[0];
      actionBtn = `<button class="btn-sm" style="width:100%" disabled title="Volta em ${MESES[nextMonth]}">🗓️ Fora de época</button>`;
    } else if (!meetsLevel) {
      actionBtn = `<button class="btn-sm" style="width:100%" disabled title="Requer Nível ${frame.minLevel}">🔒 Nv.${frame.minLevel}</button>`;
    } else {
      actionBtn = `<button class="btn-sm ${canAfford?'btn-primary':''}" style="width:100%" ${canAfford?'':'disabled'} onclick="buyAvatarFrame('${frame.id}')">🔒 ${frame.cost} Cry</button>`;
    }
    return `<div class="frame-shop-card">
      <div class="avatar-frame-wrap frame-mini-wrap" id="mini-${frame.id}">
        <div class="profile-avatar">${AVATARS[0]}</div>
        <div class="frame-svg-slot"></div>
      </div>
      <div class="frame-shop-name" title="${escapeHtml(frame.name)}">${escapeHtml(frame.name)}</div>
      <div class="frame-shop-price">${frame.cost === 0 ? 'Grátis' : frame.cost + ' Cry'}${frame.minLevel > 1 ? ' · Nv.' + frame.minLevel : ''}</div>
      <div style="display:flex;gap:4px;margin-bottom:6px">
        <button class="btn-sm" style="flex:1" onclick="previewAvatarFrame('${frame.id}')">👁️ Ver</button>
      </div>
      ${actionBtn}
    </div>`;
  }).join('');

  // aplica os efeitos visuais reais em cada miniatura da grade (não é só ícone, é a moldura de verdade)
  list.forEach(frame => {
    const wrap = document.getElementById('mini-' + frame.id);
    if (wrap) applyFrameToWrap(wrap, frame.id);
  });
  gsapStagger('.frame-shop-card', el);
}

export function buyAvatarFrame(id) {
  const frame = AVATAR_FRAMES.find(f => f.id === id);
  if (!frame) return;
  if (G.level < (frame.minLevel || 1)) return notify('error', `Requer Nível ${frame.minLevel}.`);
  if (isFrameOwned(id)) return equipOwnedFrame(id);
  if (G.wallet < frame.cost) return notify('error', 'Cry insuficiente para comprar esta moldura.');
  G.wallet -= frame.cost;
  G.unlockedFrames = G.unlockedFrames || [];
  G.unlockedFrames.push(id);
  applyAvatarFrame(id, true);
  updateHeader();
  addToFeed(`🎭 Desbloqueou a moldura "${frame.name}"!`);
  notify('success', `${frame.name} comprada e equipada!`);
  renderAvatarFrameShop();
  closeFramePreview();
}

export function equipOwnedFrame(id) {
  applyAvatarFrame(id, true);
  renderAvatarFrameShop();
  if (id.startsWith('lottie:')) {
    const l = (_lottieCatalogCache || []).find(x => x.id === id.slice(7));
    notify('success', `${l ? '✨ ' + l.name : 'Moldura'} equipada!`);
    closeFramePreview();
    return;
  }
  const frame = AVATAR_FRAMES.find(f => f.id === id);
  notify('success', `${frame ? frame.name : 'Moldura'} equipada!`);
  closeFramePreview();
}

export function previewAvatarFrame(id) {
  previewedFrameId = id;
  const isLottie = id.startsWith('lottie:');
  const lEntry = isLottie ? (_lottieCatalogCache || []).find(l => l.id === id.slice(7)) : null;
  const frame = isLottie ? { id, name: lEntry ? '✨ ' + lEntry.name : 'Lottie', cost: 0 } : (AVATAR_FRAMES.find(f => f.id === id) || { id: 'none', name: 'Nenhuma', cost: 0 });
  const card = document.getElementById('frame-preview-card');
  card.style.display = 'block';
  document.getElementById('frame-preview-avatar').innerHTML = G.avatarPhoto ? `<img src="${G.avatarPhoto}" alt="Seu avatar">` : (G.avatar || '⚔️');
  const owned = isFrameOwned(id);
  document.getElementById('frame-preview-name').innerHTML = `${escapeHtml(frame.name)}${!owned ? ` <span style="color:var(--text3);font-size:12px">— ${frame.cost} Cry</span>` : ''}`;
  applyFrameToWrap(document.getElementById('frame-preview-wrap'), id);
  card.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

export function confirmEquipPreviewedFrame() {
  if (!previewedFrameId) return;
  if (!isFrameOwned(previewedFrameId)) { buyAvatarFrame(previewedFrameId); return; }
  equipOwnedFrame(previewedFrameId);
}

export function closeFramePreview() {
  previewedFrameId = null;
  const card = document.getElementById('frame-preview-card');
  if (card) card.style.display = 'none';
}
