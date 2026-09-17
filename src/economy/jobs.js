// src/economy/jobs.js
// Empregos: candidatar, demitir, trabalhar turno.

import { JOBS } from '../rpg/data.js';
import { addBankHistory } from './bank.js';
import { G, notify, saveGame, updateHeader, addToFeed, updateQuestProgress, sysLog, gainXP, activeEvent } from '../main.js';

// ── JOBS ───────────────────────────────────
export function renderJobs() {
  document.getElementById('current-job').textContent = G.job ? JOBS.find(j => j.id === G.job)?.name || G.job : 'Desempregado';
  document.getElementById('job-salary').textContent = G.job ? (G.jobSalary || 0) + ' Cry/turno' : '—';
  updateWorkCooldown();

  const list = document.getElementById('jobs-list');
  list.innerHTML = JOBS.map(job => {
    const hasTools = job.needs.every(n => G.inventory.some(i => i.id === n));
    const isCurrentJob = G.job === job.id;
    const canWork = G.hunger > 20 && G.energy > 10;
    const meetsLevel = G.level >= (job.minLevel || 1);
    const locked = !meetsLevel && !isCurrentJob;
    const missingTools = job.needs.filter(n => !G.inventory.some(i => i.id === n));
    return `<div class="market-item" style="${locked ? 'opacity:0.55' : ''}">
      <span style="font-size:24px">${job.icon}</span>
      <div style="flex:1">
        <div style="font-size:14px;font-family:'Cinzel',serif;color:var(--gold)">${job.name}</div>
        <div style="font-size:11px;color:var(--text2)">${job.desc}</div>
        <div style="font-size:10px;color:${meetsLevel?'var(--text3)':'var(--red)'};margin-top:2px">Requer: Nível ${job.minLevel || 1}${!meetsLevel ? ` (você é Nv.${G.level})` : ''}</div>
        ${job.needs.length ? `<div style="font-size:10px;margin-top:2px;color:${missingTools.length?'var(--red)':'var(--green)'}">
          Ferramenta: ${job.needs.join(', ')} ${missingTools.length ? `— <span style="text-decoration:underline;cursor:pointer" onclick="navigate('mercado')">comprar na loja 🛒</span>` : '✓ você já tem'}
        </div>` : ''}
      </div>
      <div style="text-align:right">
        <div class="cry" style="font-size:14px;margin-bottom:4px">${job.salary} Cry/turno</div>
        <div style="font-size:10px;color:var(--text3)">Turno: 1 min</div>
      </div>
      <div style="display:flex;flex-direction:column;gap:4px">
        <button class="btn btn-sm ${isCurrentJob?'btn-danger':'btn-success'}" ${locked?'disabled':''} onclick="${isCurrentJob?'quitJob()':`applyJob('${job.id}')`}" title="${locked ? 'Nível insuficiente' : ''}">${isCurrentJob?'Demitir-se':(locked ? '🔒 Bloqueado' : 'Candidatar')}</button>
        ${isCurrentJob ? `<button class="btn btn-sm btn-gold" onclick="workShift()" ${canWork?'':' disabled'}>⚡ Trabalhar</button>` : ''}
      </div>
    </div>`;
  }).join('');
}

export function applyJob(jobId) {
  const job = JOBS.find(j => j.id === jobId);
  if (!job) return;
  if (G.level < (job.minLevel || 1)) return notify('error', `Nível insuficiente! ${job.name} requer Nível ${job.minLevel}.`);
  const hasTools = job.needs.every(n => G.inventory.some(i => i.id === n));
  if (!hasTools && job.needs.length > 0) return notify('error', `Falta ferramenta: ${job.needs.join(', ')}. Compre na Loja (🛒 Mercado).`);
  G.job = jobId;
  G.jobSalary = job.salary;
  addToFeed(`💼 Empregado como ${job.icon} ${job.name}`);
  saveGame(); renderJobs();
  notify('success', `Empregado como ${job.name}!`);
  sysLog(`${G.name} emprego: ${job.name}`);
}

export function quitJob() {
  if (!G.job) return;
  const job = JOBS.find(j => j.id === G.job);
  G.job = null; G.jobSalary = 0;
  addToFeed(`👋 Saiu do emprego de ${job?.name||'?'}`);
  saveGame(); renderJobs();
  notify('info', 'Você se demitiu.');
}

export function workShift() {
  if (!G.job) return notify('error', 'Sem emprego!');
  if (G.hunger <= 20) return notify('error', '⚠️ Muito faminto para trabalhar! Coma algo primeiro.');
  if (G.energy <= 10) return notify('error', '⚠️ Sem energia para trabalhar!');

  const now = Date.now();
  const cooldown = 60 * 1000; // 1 min demo (60*60*1000 = 1h)
  if (G.lastWork && (now - G.lastWork) < cooldown) {
    const remaining = Math.ceil((cooldown - (now - G.lastWork)) / 1000);
    return notify('warn', `⏳ Aguarde ${remaining}s para o próximo turno`);
  }

  const job = JOBS.find(j => j.id === G.job);
  let salary = G.jobSalary || job.salary;
  if (activeEvent === 'gold') salary *= 2;

  G.wallet += salary;
  G.totalEarned = (G.totalEarned || 0) + salary;
  G.hunger = Math.max(0, G.hunger - 20);
  G.energy = Math.max(0, G.energy - 10);
  G.lastWork = now;
  G.workTurns = (G.workTurns || 0) + 1;
  G.stats = G.stats || {};
  G.stats.totalWork = (G.stats.totalWork || 0) + 1;

  gainXP(15);
  updateQuestProgress('work', 1);
  addBankHistory(`Salário — ${job.name}`, salary);
  addToFeed(`💼 Trabalhou como ${job.icon} ${job.name} (+${salary} Cry)`);
  saveGame(); updateHeader(); renderJobs();
  notify('success', `💼 Turno concluído! +${salary} Cry`);
  sysLog(`${G.name} trabalhou (${job.name}) +${salary} Cry`);
}

export function updateWorkCooldown() {
  const el = document.getElementById('work-cooldown');
  if (!el) return;
  if (!G.lastWork) { el.textContent = 'Disponível'; return; }
  const cooldown = 60 * 1000;
  const remaining = cooldown - (Date.now() - G.lastWork);
  if (remaining <= 0) { el.textContent = 'Disponível'; }
  else { el.textContent = Math.ceil(remaining/1000) + 's'; }
}
