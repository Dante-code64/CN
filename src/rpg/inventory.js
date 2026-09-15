// src/rpg/inventory.js
// Inventario do jogador: listar, usar item, adicionar/remover.

import { G, notify, saveGame, addToFeed, gainXP, refreshDashboard } from '../main.js';

// ── INVENTORY ──────────────────────────────
export function renderInventory() {
  const inv = G.inventory || [];
  renderInvGrid('inventory-grid', inv);
  renderInvGrid('inv-weapons-grid', inv.filter(i => i.type === 'weapon' || i.type === 'shield' || i.type === 'armor' || i.type === 'helmet' || i.type === 'amulet'));
  renderInvGrid('inv-armor-grid', inv.filter(i => i.type === 'armor' || i.type === 'shield' || i.type === 'helmet'));
  renderInvGrid('inv-cons-grid', inv.filter(i => i.type === 'food' || i.type === 'potion'));
  renderInvGrid('inv-mat-grid', inv.filter(i => i.type === 'material'));
}

export function renderInvGrid(id, items) {
  const el = document.getElementById(id);
  if (!el) return;
  if (!items.length) { el.innerHTML = '<div style="color:var(--text3);font-size:13px;padding:20px;text-align:center;grid-column:1/-1">Vazio</div>'; return; }
  el.innerHTML = items.map(item => {
    const isEq = Object.values(G.equipped).includes(item.id);
    return `<div class="inv-item item-rarity-${item.rarity||'common'} ${isEq?'equipped':''}" onclick="useItem('${item.id}')" title="${item.desc||''}">
      <span class="item-icon">${item.icon}</span>
      <div class="item-name">${item.name}</div>
      ${item.qty > 1 ? `<div class="item-qty">x${item.qty}</div>` : ''}
    </div>`;
  }).join('');
}

export function useItem(itemId) {
  const idx = G.inventory.findIndex(i => i.id === itemId);
  if (idx < 0) return;
  const item = G.inventory[idx];
  if (item.type === 'food') {
    G.hunger = Math.min(G.maxHunger, G.hunger + item.power);
    G.energy = Math.min(100, Math.round(G.hunger));
    removeFromInventory(itemId, 1);
    addToFeed(`🍽️ Comeu ${item.name} (+${item.power} fome)`);
    notify('success', `🍽️ +${item.power} Fome!`);
  } else if (item.type === 'potion') {
    if (item.id.includes('hp')) { G.hp = Math.min(G.maxHp, G.hp + item.power); notify('success', `+${item.power} HP`); }
    else if (item.id.includes('mana')) { G.mana = Math.min(G.maxMana, G.mana + item.power); notify('success', `+${item.power} Mana`); }
    else if (item.id.includes('stamina')) { G.stamina = Math.min(G.maxStamina, G.stamina + item.power); notify('success', `+${item.power} Stamina`); }
    else if (item.id === 'pergaminho') { gainXP(item.power); notify('success', `+${item.power} XP!`); }
    removeFromInventory(itemId, 1);
    addToFeed(`🧪 Usou ${item.name}`);
  } else if (['weapon','shield','armor','amulet','helmet'].includes(item.type)) {
    const slot = item.type;
    if (G.equipped[slot] === item.id) { G.equipped[slot] = null; notify('info', `${item.name} desequipado`); }
    else { G.equipped[slot] = item.id; notify('success', `${item.name} equipado!`); }
  }
  saveGame(); renderInventory(); refreshDashboard();
}

export function addToInventory(item, qty = 1) {
  const existing = G.inventory.find(i => i.id === item.id);
  if (existing) { existing.qty = (existing.qty || 1) + qty; }
  else { G.inventory.push({ ...item, qty }); }
  G.itemsCollected = (G.itemsCollected || 0) + qty;
}

export function removeFromInventory(itemId, qty = 1) {
  const idx = G.inventory.findIndex(i => i.id === itemId);
  if (idx < 0) return;
  G.inventory[idx].qty = (G.inventory[idx].qty || 1) - qty;
  if (G.inventory[idx].qty <= 0) G.inventory.splice(idx, 1);
}
