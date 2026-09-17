// src/economy/houses.js
// Imoveis: comprar, alugar, vender.

import { HOUSES } from '../rpg/data.js';
import { G, notify, saveGame, updateHeader, addToFeed, updateQuestProgress, sysLog } from '../main.js';

// ── HOUSES ─────────────────────────────────
export function renderHouses() {
  const bg = document.getElementById('houses-buy-grid');
  bg.innerHTML = HOUSES.map(h => `
    <div class="house-card" onclick="buyHouse('${h.id}')">
      <div class="house-header"><span class="house-icon">${h.icon}</span><div><div class="house-name">${h.name}</div><div style="font-size:11px;color:var(--text2)">${h.size}</div></div></div>
      <div class="house-body">
        <div class="house-stat"><span>Preço</span><span class="cry">${h.buyPrice} Cry</span></div>
        <div class="house-stat"><span>Renda/dia</span><span style="color:var(--green)">${h.perDay} Cry</span></div>
        <div style="font-size:11px;color:var(--text2);margin-top:4px">${h.desc}</div>
        <button class="btn btn-primary" style="width:100%;margin-top:8px">Comprar</button>
      </div>
    </div>
  `).join('');

  const rg = document.getElementById('houses-rent-grid');
  rg.innerHTML = HOUSES.map(h => `
    <div class="house-card" onclick="rentHouse('${h.id}')">
      <div class="house-header"><span class="house-icon">${h.icon}</span><div><div class="house-name">${h.name}</div><div style="font-size:11px;color:var(--text2)">${h.size}</div></div></div>
      <div class="house-body">
        <div class="house-stat"><span>Aluguel/mês</span><span class="cry">${h.rentPrice} Cry</span></div>
        <div style="font-size:11px;color:var(--text2);margin-top:4px">${h.desc}</div>
        <button class="btn btn-info" style="width:100%;margin-top:8px">Alugar</button>
      </div>
    </div>
  `).join('');

  const mh = document.getElementById('my-houses');
  if (!G.houses || !G.houses.length) { mh.innerHTML = '<div style="color:var(--text3);font-size:13px;padding:20px;text-align:center">Nenhum imóvel</div>'; return; }
  mh.innerHTML = G.houses.map(owned => {
    const h = HOUSES.find(hh => hh.id === owned.id) || {};
    return `<div class="house-card">
      <div class="house-header"><span class="house-icon">${h.icon||'🏡'}</span><div><div class="house-name">${h.name||owned.id}</div><span class="badge ${owned.rented?'badge-blue':'badge-gold'}" style="font-size:10px">${owned.rented?'Alugado':'Próprio'}</span></div></div>
      <div class="house-body">
        <div class="house-stat"><span>Renda</span><span style="color:var(--green)">${h.perDay||0} Cry/dia</span></div>
        <button class="btn btn-danger" style="width:100%;margin-top:8px" onclick="sellHouse('${owned.id}')">Vender</button>
      </div>
    </div>`;
  }).join('');
}

export function buyHouse(houseId) {
  const h = HOUSES.find(h => h.id === houseId);
  if (!h) return;
  if (G.wallet < h.buyPrice) return notify('error', `Precisa de ${h.buyPrice} Cry`);
  if (G.houses.find(owned => owned.id === houseId)) return notify('warn', 'Você já possui este imóvel!');
  G.wallet -= h.buyPrice;
  G.houses.push({ id: houseId, rented: false, boughtAt: Date.now() });
  addToFeed(`🏡 Comprou ${h.icon} ${h.name} por ${h.buyPrice} Cry`);
  updateQuestProgress('house', 1);
  saveGame(); updateHeader(); renderHouses();
  notify('success', `${h.icon} ${h.name} comprada!`);
  sysLog(`${G.name} comprou ${h.name}`);
}

export function rentHouse(houseId) {
  const h = HOUSES.find(h => h.id === houseId);
  if (!h) return;
  if (G.wallet < h.rentPrice) return notify('error', `Precisa de ${h.rentPrice} Cry`);
  G.wallet -= h.rentPrice;
  G.houses.push({ id: houseId, rented: true, boughtAt: Date.now() });
  addToFeed(`🏠 Alugou ${h.icon} ${h.name}`);
  updateQuestProgress('house', 1);
  saveGame(); updateHeader(); renderHouses();
  notify('success', `${h.icon} Alugado!`);
}

export function sellHouse(houseId) {
  const h = HOUSES.find(h => h.id === houseId);
  const idx = G.houses.findIndex(o => o.id === houseId);
  if (idx < 0) return;
  const owned = G.houses[idx];
  if (owned.rented) { G.houses.splice(idx, 1); saveGame(); renderHouses(); notify('info', 'Contrato cancelado.'); return; }
  const price = Math.floor((h?.buyPrice || 500) * 0.7);
  G.wallet += price;
  G.houses.splice(idx, 1);
  addToFeed(`💰 Vendeu imóvel por ${price} Cry`);
  saveGame(); updateHeader(); renderHouses();
  notify('success', `Vendeu por ${price} Cry!`);
}

