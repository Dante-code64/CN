// src/economy/companies.js
// Empresas: comprar, vender.

import { COMPANIES } from '../rpg/data.js';
import { G, notify, saveGame, updateHeader, addToFeed, sysLog } from '../main.js';

// ── COMPANIES ──────────────────────────────
export function renderCompanies() {
  const cg = document.getElementById('companies-grid');
  cg.innerHTML = COMPANIES.map(c => `
    <div class="company-card">
      <div class="company-name">${c.icon} ${c.name}</div>
      <div class="company-stat"><span>Preço</span><span class="cry">${c.price} Cry</span></div>
      <div class="company-stat"><span>Renda/h</span><span style="color:var(--green)">${c.income} Cry</span></div>
      <div class="company-stat"><span>Funcionários</span><span>${c.staff}</span></div>
      <div style="font-size:11px;color:var(--text2);margin:6px 0">${c.desc}</div>
      <button class="btn btn-primary" style="width:100%" onclick="buyCompany('${c.id}')">Comprar Empresa</button>
    </div>
  `).join('');

  const mc = document.getElementById('my-companies');
  if (!G.companies || !G.companies.length) { mc.innerHTML = '<div style="color:var(--text3);font-size:13px;padding:20px;text-align:center">Sem empresas</div>'; return; }
  mc.innerHTML = G.companies.map(owned => {
    const c = COMPANIES.find(cc => cc.id === owned.id) || {};
    return `<div class="company-card">
      <div class="company-name">${c.icon||'🏢'} ${c.name||owned.id}</div>
      <div class="company-stat"><span>Renda/h</span><span style="color:var(--green)">${c.income||0} Cry</span></div>
      <div class="company-stat"><span>Status</span><span class="badge badge-green">Ativa</span></div>
      <button class="btn btn-danger" style="width:100%;margin-top:8px" onclick="sellCompany('${owned.id}')">Vender Empresa</button>
    </div>`;
  }).join('');
}

export function buyCompany(cId) {
  const c = COMPANIES.find(c => c.id === cId);
  if (!c) return;
  if (G.wallet < c.price) return notify('error', `Precisa de ${c.price} Cry`);
  if (G.companies.find(o => o.id === cId)) return notify('warn', 'Você já possui esta empresa!');
  G.wallet -= c.price;
  G.companies.push({ id: cId, boughtAt: Date.now() });
  addToFeed(`🏢 Comprou a empresa ${c.icon} ${c.name}`);
  saveGame(); updateHeader(); renderCompanies();
  notify('success', `${c.icon} ${c.name} adquirida!`);
  sysLog(`${G.name} comprou empresa ${c.name}`);
}

export function sellCompany(cId) {
  const c = COMPANIES.find(c => c.id === cId);
  const idx = G.companies.findIndex(o => o.id === cId);
  if (idx < 0) return;
  const price = Math.floor((c?.price || 1000) * 0.6);
  G.wallet += price;
  G.companies.splice(idx, 1);
  saveGame(); updateHeader(); renderCompanies();
  notify('success', `Vendeu empresa por ${price} Cry!`);
}

