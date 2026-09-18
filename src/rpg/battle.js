// src/rpg/battle.js
// Sistema de batalha PvE (contra monstros): cooldown, efeitos visuais
// (textos flutuantes, flash de impacto, tremida de tela) e a luta em si.

import { MONSTERS, SHOP_ITEMS, BATTLE_COOLDOWN } from './data.js';
import { sleep, createDiceElement } from '../utils/helpers.js';
import { addBankHistory } from '../economy/bank.js';
import { G, notify, celebrate, rollDiceVisual, updateHeader, addToFeed, saveGame, refreshDashboard, gainXP, updateQuestProgress, sysLog, activeEvent } from '../main.js';

export let battleInProgress = false;
export function battleCooldownRemaining() {
  if (!G.lastBattle) return 0;
  return BATTLE_COOLDOWN - (Date.now() - G.lastBattle);
}

export function updateBattleCooldown() {
  const el = document.getElementById('battle-cooldown');
  if (!el) return;
  const remaining = battleCooldownRemaining();
  if (remaining <= 0) { el.textContent = 'Disponível'; el.style.color = 'var(--green)'; }
  else { el.textContent = Math.ceil(remaining / 1000) + 's'; el.style.color = 'var(--cyan)'; }
  const hpEl = document.getElementById('battle-hp-display');
  if (hpEl) hpEl.textContent = `${G.hp}/${G.maxHp || G.hp}`;
}
export function showBattleResultOverlay(win, title, subtitle) {
  const overlay = document.createElement('div');
  overlay.className = 'battle-result-overlay';
  overlay.innerHTML = `
    <div class="battle-result-box">
      <div style="font-size:64px;margin-bottom:10px">${win ? '🏆' : '💀'}</div>
      <div class="battle-result-title ${win ? 'win' : 'lose'}">${title}</div>
      <div style="font-size:14px;color:var(--text2);margin-bottom:20px">${subtitle}</div>
      <button class="btn btn-primary" onclick="this.closest('.battle-result-overlay').remove()">Continuar</button>
    </div>`;
  document.body.appendChild(overlay);
  if (win) celebrate('big');
  setTimeout(() => { if (overlay.parentNode) overlay.remove(); }, 4500);
}
// ══════════════════════════════════════════
//   FX DE BATALHA (GSAP — dano flutuante, impacto, tremor, crítico)
// ══════════════════════════════════════════
export function spawnFloatingText(colEl, text, opts = {}) {
  if (!colEl) return;
  const { color = '#ff6b5b', size = 20, crit = false } = opts;
  const el = document.createElement('div');
  el.textContent = text;
  el.style.cssText = `position:absolute;left:50%;top:26%;transform:translate(-50%,0);font-family:'Cinzel',serif;font-weight:800;font-size:${size}px;color:${color};text-shadow:0 2px 8px rgba(0,0,0,.7),0 0 14px ${color}55;pointer-events:none;z-index:20;white-space:nowrap;`;
  colEl.appendChild(el);
  if (typeof gsap === 'undefined') { setTimeout(() => el.remove(), 900); return; }
  gsap.timeline({ onComplete: () => el.remove() })
    .fromTo(el, { y: 6, opacity: 0, scale: crit ? 0.4 : 0.7 }, { y: -6, opacity: 1, scale: crit ? 1.35 : 1, duration: 0.18, ease: 'back.out(3)' })
    .to(el, { y: -46, duration: 0.65, ease: 'power1.out' }, '<')
    .to(el, { opacity: 0, duration: 0.25 }, '-=0.2');
}
export function impactFlash(avatarElId, color = 'rgba(255,255,255,0.85)') {
  const target = document.getElementById(avatarElId);
  if (!target || !target.parentElement) return;
  const flash = document.createElement('div');
  flash.style.cssText = `position:absolute;left:50%;top:42%;width:70px;height:70px;border-radius:50%;background:radial-gradient(circle, ${color}, transparent 70%);transform:translate(-50%,-50%) scale(0.3);pointer-events:none;z-index:5;`;
  target.parentElement.appendChild(flash);
  if (typeof gsap === 'undefined') { setTimeout(() => flash.remove(), 350); return; }
  gsap.to(flash, { scale: 1.5, opacity: 0, duration: 0.4, ease: 'power2.out', onComplete: () => flash.remove() });
}
export function shakeArena() {
  const arena = document.getElementById('battle-arena-card');
  if (!arena || typeof gsap === 'undefined') return;
  gsap.fromTo(arena, { x: 0 }, { x: 7, duration: 0.05, repeat: 5, yoyo: true, ease: 'power1.inOut', onComplete: () => gsap.set(arena, { x: 0 }) });
}

export async function startBattle(monsterId) {

  const m = MONSTERS[monsterId];
  if (!m) return;
  if (battleInProgress) return notify('warn', '⏳ Uma batalha já está em andamento!');
  const remaining = battleCooldownRemaining();
  if (remaining > 0) return notify('warn', `⏳ Aguarde ${Math.ceil(remaining/1000)}s para batalhar novamente.`);
  if (G.hp <= 0) return notify('error', 'Você está sem HP! Use uma poção primeiro.');
  if (G.hunger <= 10) return notify('error', '⚠️ Muito faminto para batalhar!');

  battleInProgress = true;
  G.lastBattle = Date.now();
  saveGame();
  updateBattleCooldown();

  document.getElementById('battle-log-card').style.display = 'block';
  document.getElementById('battle-arena-card').style.display = 'block';
  const log = document.getElementById('battle-log');
  log.innerHTML = '';
  const playerAvatarEl = document.getElementById('battle-player-avatar');
  if ((G.class || '').toLowerCase() === 'mago') {
    playerAvatarEl.innerHTML = `<dotlottie-wc src="/Interactive_Mage_animation.lottie" style="width:100%;height:100%;background:transparent" autoplay loop></dotlottie-wc>`;
  } else {
    playerAvatarEl.textContent = G.avatarPhoto ? '🧑' : (G.avatar || '⚔️');
  }
  document.getElementById('battle-monster-avatar').textContent = m.icon;
  document.getElementById('battle-monster-name').textContent = m.name;
  const diceRow = document.getElementById('battle-dice-row');
  diceRow.innerHTML = createDiceElement('battle-dice-p') + createDiceElement('battle-dice-m');

  let playerHp = G.hp;
  const playerMaxHp = G.hp;
  let monsterHp = m.hp;
  const playerAtk = G.str + (G.equipped.weapon ? (SHOP_ITEMS.find(i=>i.id===G.equipped.weapon)?.power||0) : 0);
  const playerDef = G.vit + (G.equipped.armor ? (SHOP_ITEMS.find(i=>i.id===G.equipped.armor)?.power||0) : 0);

  function addLog(msg, col='var(--text)') {
    log.innerHTML += `<div style="color:${col};padding:3px 0;border-bottom:1px solid var(--border)">${msg}</div>`;
    log.scrollTop = log.scrollHeight;
  }
  function updateBars() {
    document.getElementById('battle-player-hp-bar').style.width = Math.max(0, (playerHp/playerMaxHp)*100) + '%';
    document.getElementById('battle-monster-hp-bar').style.width = Math.max(0, (monsterHp/m.hp)*100) + '%';
  }
  function shake(id) { const el = document.getElementById(id); el.classList.remove('hit'); void el.offsetWidth; el.classList.add('hit'); }
  function lunge(id) { const el = document.getElementById(id); el.classList.remove('attack'); void el.offsetWidth; el.classList.add('attack'); }

  addLog(`⚔️ Batalha iniciada contra ${m.icon} ${m.name}!`, 'var(--gold2)');
  updateBars();

  let round = 1;
  while (playerHp > 0 && monsterHp > 0) {
    const [diceP, diceM] = await Promise.all([rollDiceVisual('battle-dice-p'), rollDiceVisual('battle-dice-m')]);
    await sleep(150);

    const playerCrit = Math.random() < 0.15;
    let pDmg = Math.max(1, playerAtk - m.def + diceP);
    if (playerCrit) pDmg = Math.round(pDmg * 1.8);
    monsterHp -= pDmg;
    lunge('battle-player-avatar'); shake('battle-monster-avatar');
    impactFlash('battle-monster-avatar', playerCrit ? 'rgba(240,192,64,0.9)' : 'rgba(255,255,255,0.8)');
    spawnFloatingText(document.getElementById('battle-monster-col'), playerCrit ? `CRÍTICO! −${pDmg}` : `−${pDmg}`, { color: playerCrit ? '#f0c040' : '#ff6b5b', size: playerCrit ? 23 : 19, crit: playerCrit });
    if (playerCrit) shakeArena();
    updateBars();
    addLog(`Rodada ${round}: 🎲${diceP}${playerCrit ? ' · CRÍTICO!' : ''} — Você causou ${pDmg} de dano! ${m.icon} HP: ${Math.max(0,monsterHp)}/${m.hp}`, playerCrit ? 'var(--gold2)' : 'var(--green)');
    await sleep(500);

    if (monsterHp <= 0) break;

    const monsterCrit = Math.random() < 0.1;
    let mDmg = Math.max(1, m.atk - playerDef + diceM);
    if (monsterCrit) mDmg = Math.round(mDmg * 1.7);
    playerHp = Math.max(0, playerHp - mDmg);
    lunge('battle-monster-avatar'); shake('battle-player-avatar');
    impactFlash('battle-player-avatar', monsterCrit ? 'rgba(214,45,45,0.9)' : 'rgba(255,255,255,0.8)');
    spawnFloatingText(document.getElementById('battle-player-col'), monsterCrit ? `CRÍTICO! −${mDmg}` : `−${mDmg}`, { color: monsterCrit ? '#ff3b3b' : '#ff6b5b', size: monsterCrit ? 23 : 19, crit: monsterCrit });
    if (monsterCrit) shakeArena();
    updateBars();
    addLog(`${m.icon} 🎲${diceM}${monsterCrit ? ' · CRÍTICO!' : ''} — causou ${mDmg} de dano! Seu HP: ${playerHp}/${playerMaxHp}`, 'var(--red)');
    await sleep(500);

    round++;
  }

  battleInProgress = false;
  if (monsterHp <= 0) {
    let xpGain = m.xp; let cryGain = m.cry;
    if (activeEvent === 'xp') xpGain *= 2;
    gainXP(xpGain);
    G.wallet += cryGain;
    G.totalEarned = (G.totalEarned||0) + cryGain;
    G.battles++; G.wins++;
    G.stats = G.stats || {}; G.stats.totalBattles = (G.stats.totalBattles||0)+1; G.stats.totalKills = (G.stats.totalKills||0)+1;
    addBankHistory(`Vitória vs ${m.name}`, cryGain);
    updateQuestProgress('battle', 1);
    addToFeed(`⚔️ Derrotou ${m.icon} ${m.name}! +${xpGain}XP +${cryGain}Cry`);
    addLog(`🏆 VITÓRIA! +${xpGain} XP +${cryGain} Cry`, 'var(--gold2)');
    G.hp = playerHp;
    saveGame(); updateHeader(); refreshDashboard();
    sysLog(`${G.name} derrotou ${m.name}`);
    showBattleResultOverlay(true, 'VITÓRIA!', `+${xpGain} XP · +${cryGain} Cry`);
  } else {
    G.hp = 10; G.battles++; G.losses++;
    addLog(`💀 DERROTA! Você foi derrotado por ${m.name}...`, 'var(--red)');
    addToFeed(`💀 Derrotado por ${m.icon} ${m.name}`);
    saveGame(); refreshDashboard();
    showBattleResultOverlay(false, 'DERROTA!', `${m.name} foi mais forte dessa vez.`);
  }
}
