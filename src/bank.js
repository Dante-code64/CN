// src/economy/bank.js
// Banco do jogador: depositar, sacar, PIX/transferencia (via RPC segura
// send_pix no Supabase -- o saldo e conferido e movido no servidor,
// nunca so no navegador).

import { _stripAt } from '../utils/format.js';
import {
  G, notify, saveGame, addToFeed, updateHeader, supabase,
  myId, findProfileByNameOrUsername, updateQuestProgress,
  renderQuests, sysLog
} from '../main.js';

export function pulseEl(id) {
  const el = document.getElementById(id);
  if (!el) return;
  el.classList.remove('pulse'); void el.offsetWidth; el.classList.add('pulse');
}

export function refreshBank() {
  document.getElementById('bank-wallet').textContent = G.wallet;
  document.getElementById('bank-balance').textContent = G.bank;
  document.getElementById('bank-total').textContent = G.wallet + G.bank;
  const h = document.getElementById('bank-history');
  const hist = (G.bankHistory || []).slice(-15).reverse();
  if (!hist.length) { h.innerHTML = '<div style="color:var(--text3);text-align:center;padding:20px">Sem movimentações</div>'; return; }
  h.innerHTML = hist.map(t => {
    const sign = t.amount > 0 ? '+' : '';
    const col = t.amount > 0 ? 'var(--green)' : 'var(--red)';
    return `<div class="bank-history-row">
      <span style="color:var(--text2)"><span style="color:${col};font-size:10px">${t.amount > 0 ? '▲' : '▼'}</span> ${t.desc}</span>
      <span style="color:${col};font-family:'JetBrains Mono',monospace;font-weight:600">${sign}${t.amount} Cry</span>
    </div>`;
  }).join('');
}

export function bankDeposit() {
  const amt = parseInt(document.getElementById('dep-amount').value);
  if (!amt || amt <= 0) return notify('error', 'Valor inválido');
  if (amt > G.wallet) return notify('error', 'Cry insuficiente na carteira');
  G.wallet -= amt; G.bank += amt;
  addBankHistory('Depósito', amt);
  updateQuestProgress('bank', amt);
  saveGame(); refreshBank(); updateHeader(); renderQuests();
  pulseEl('bank-wallet'); pulseEl('bank-balance');
  notify('success', `Depositou ${amt} Cry no banco!`);
  sysLog(`${G.name} depositou ${amt} Cry`);
}

export function bankWithdraw() {
  const amt = parseInt(document.getElementById('wit-amount').value);
  if (!amt || amt <= 0) return notify('error', 'Valor inválido');
  if (amt > G.bank) return notify('error', 'Saldo bancário insuficiente');
  G.bank -= amt; G.wallet += amt;
  addBankHistory('Saque', amt);
  saveGame(); refreshBank(); updateHeader();
  pulseEl('bank-wallet'); pulseEl('bank-balance');
  notify('success', `Sacou ${amt} Cry!`);
}

// PIX e Transferência são, na prática, a mesma coisa (só duas abas
// diferentes na UI) — as duas chamam esta função real, que usa a
// função send_pix() do banco (ver social-setup.sql). O saldo é
// conferido e movido no servidor, não no navegador: antes disso, o
// Cry só sumia da própria carteira e nunca chegava em ninguém.
export async function sendMoneyTo(targetInputId, amountInputId, label) {
  const target = _stripAt(document.getElementById(targetInputId).value);
  const amt = parseInt(document.getElementById(amountInputId).value);
  if (!target) return notify('error', 'Informe o destinatário');
  if (!amt || amt <= 0) return notify('error', 'Valor inválido');
  const me = myId();
  if (!me) return notify('error', 'Você precisa estar logado.');
  if (target.toLowerCase() === (G.name || '').toLowerCase()) return notify('error', 'Você não pode enviar Cry para você mesmo!');

  try {
    const profile = await findProfileByNameOrUsername(target, 'id,name');
    if (!profile) { notify('error', `Nenhum jogador chamado "${target}" foi encontrado.`); return; }

    const { data, error } = await supabase.rpc('send_pix', { p_to_id: profile.id, p_amount: amt, p_note: label });
    if (error) throw error;

    if (data && typeof data.newWallet === 'number') G.wallet = data.newWallet;
    else G.wallet -= amt; // fallback improvável, só por segurança visual

    addBankHistory(`${label} para ${profile.name}`, -amt);
    saveGame(); refreshBank(); updateHeader();
    pulseEl('bank-wallet');
    notify('success', `⚡ ${amt} Cry enviados para ${profile.name}!`);
    addToFeed(`💸 Enviou ${label} de ${amt} Cry para ${profile.name}`);
    sysLog(`${G.name} → ${label} ${amt} Cry → ${profile.name}`);
    document.getElementById(targetInputId).value = '';
    document.getElementById(amountInputId).value = '';
  } catch (e) {
    console.error(`Erro ao enviar ${label}`, e);
    notify('error', `Não foi possível enviar: ${e.message || 'erro desconhecido'}`);
  }
}
export function sendPix() { sendMoneyTo('pix-target', 'pix-amount', 'PIX'); }
export function sendTransfer() { sendMoneyTo('trans-target', 'trans-amount', 'Transferência'); }

export function addBankHistory(desc, amount) {
  G.bankHistory = G.bankHistory || [];
  G.bankHistory.push({ desc, amount, ts: Date.now() });
  if (G.bankHistory.length > 50) G.bankHistory = G.bankHistory.slice(-50);
}
