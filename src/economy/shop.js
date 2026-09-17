// src/economy/shop.js
// Loja de itens: comprar, vender, comprar rapido.

import { SHOP_ITEMS } from '../rpg/data.js';
import { rarityColor } from '../utils/helpers.js';
import { addToInventory, removeFromInventory, renderInventory } from '../rpg/inventory.js';
import { G, notify, saveGame, updateHeader, addToFeed, updateQuestProgress, sysLog } from '../main.js';

// ── SHOP ───────────────────────────────────
export function renderShop() {
  const grid = document.getElementById('shop-grid');
  grid.innerHTML = SHOP_ITEMS.filter(i => !['food'].includes(i.type) || true).map(item => `
    <div class="market-item">
      <span style="font-size:22px">${item.icon}</span>
      <div>
        <div style="font-size:13px;color:var(--text)">${item.name}</div>
        <div style="font-size:11px;color:var(--text2)">${item.desc} • <span style="color:${rarityColor(item.rarity)}">${item.rarity}</span></div>
      </div>
      <div class="market-price">${item.price} ✦</div>
      <button class="btn btn-sm btn-primary" onclick="buyItem('${item.id}')">Comprar</button>
    </div>
  `).join('');

  const sellGrid = document.getElementById('inv-for-sale');
  if (!G.inventory.length) { sellGrid.innerHTML = '<div style="color:var(--text3);font-size:13px;padding:10px;text-align:center">Inventário vazio</div>'; return; }
  sellGrid.innerHTML = '<div style="font-family:\'Cinzel\',serif;font-size:12px;color:var(--gold);margin-bottom:8px">Itens para vender:</div>' +
    G.inventory.map(item => `
    <div class="market-item" style="margin-bottom:6px">
      <span style="font-size:20px">${item.icon}</span>
      <div><div style="font-size:13px">${item.name}</div><div style="font-size:11px;color:var(--text2)">x${item.qty||1}</div></div>
      <div class="market-price">${Math.floor((SHOP_ITEMS.find(s=>s.id===item.id)?.price||10)*0.5)} ✦</div>
      <button class="btn btn-sm btn-danger" onclick="sellItem('${item.id}')">Vender</button>
    </div>
  `).join('');
}


export function buyItem(itemId) {
  const item = SHOP_ITEMS.find(i => i.id === itemId);
  if (!item) return;
  if (G.wallet < item.price) return notify('error', `Cry insuficiente! Precisa de ${item.price} Cry`);
  G.wallet -= item.price;
  addToInventory(item);
  G.itemsBought = (G.itemsBought || 0) + 1;
  addToFeed(`🛒 Comprou ${item.icon} ${item.name} por ${item.price} Cry`);
  updateQuestProgress('buy', 1);
  saveGame(); updateHeader();
  notify('success', `${item.icon} ${item.name} adquirido!`);
  sysLog(`${G.name} comprou ${item.name}`);
}

export function buyQuick(id, icon, name, price, type) {
  const item = SHOP_ITEMS.find(i => i.id === id) || { id, icon, name, price, type, power:20, rarity:'common', desc:'' };
  if (G.wallet < price) return notify('error', `Precisa de ${price} Cry`);
  G.wallet -= price;
  addToInventory(item);
  saveGame(); updateHeader(); renderInventory();
  notify('success', `${icon} ${name} comprado!`);
}

export function sellItem(itemId) {
  const item = G.inventory.find(i => i.id === itemId);
  if (!item) return;
  const shop = SHOP_ITEMS.find(s => s.id === itemId);
  const price = Math.floor((shop?.price || 10) * 0.5);
  removeFromInventory(itemId, 1);
  G.wallet += price;
  G.totalEarned = (G.totalEarned || 0) + price;
  addToFeed(`💰 Vendeu ${item.icon} ${item.name} por ${price} Cry`);
  saveGame(); updateHeader(); renderShop();
  notify('success', `Vendeu por ${price} Cry!`);
}

