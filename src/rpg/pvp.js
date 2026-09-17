// src/rpg/pvp.js
// Duelos PvP entre jogadores: desafiar, aceitar/recusar, resolver (com o
// resultado sorteado no SERVIDOR via RPC pvp_respond_challenge -- ver a
// auditoria de segurança, essa parte já foi endurecida antes).

import { escapeHtml } from '../utils/escapeHtml.js';
import { _stripAt } from '../utils/format.js';
import { G, notify, updateHeader, addToFeed, saveGame, gainXP, supabase, findProfileByNameOrUsername, sysLog, myId } from '../main.js';

// Desafios de PvP reais, guardados na tabela pvp_challenges (ver
// social-setup.sql) — antes disso, "Desafiar" só mostrava um aviso
// pra você mesmo; o outro jogador nunca ficava sabendo. O resultado é
// calculado uma única vez, por quem aceita o desafio, e gravado no
// banco — assim as duas contas veem exatamente o mesmo resultado.
export async function startPvP() {
  const target = _stripAt(document.getElementById('pvp-target').value);
  if (!target) return notify('error', 'Informe o adversário');
  const me = myId();
  if (!me) return notify('error', 'Você precisa estar logado.');
  if (target.toLowerCase() === (G.name || '').toLowerCase()) return notify('error', 'Você não pode desafiar você mesmo!');
  try {
    const profile = await findProfileByNameOrUsername(target, 'id,name');
    if (!profile) { notify('error', `Nenhum jogador chamado "${target}" foi encontrado.`); return; }
    const { error } = await supabase.from('pvp_challenges').insert([{ challenger_id: me, target_id: profile.id }]);
    if (error) throw error;
    notify('info', `⚔️ Desafio enviado para ${profile.name}!`);
    addToFeed(`⚔️ Desafiou ${profile.name} para PvP`);
    sysLog(`${G.name} desafiou ${profile.name} PvP`);
    document.getElementById('pvp-target').value = '';
    renderPvpChallenges();
  } catch (e) {
    console.error('Erro ao desafiar', e);
    notify('error', 'Não foi possível enviar o desafio: ' + (e.message || 'erro desconhecido'));
  }
}
// Roda só no lado de quem ACEITA o desafio — decide o vencedor com uma
// aleatoriedade ponderada pelo "poder" de cada um (nível + atributos +
// % de vida), grava o resultado, e devolve pro chamador aplicar o
// prêmio se tiver vencido. A recompensa é criada do zero (como já
// acontece nas batalhas contra monstros) — não sai da carteira de quem
// perde, então não tem risco de saldo negativo nem disputa de quem
// "devia" pagar o quê.
export async function respondPvpChallenge(id, accept) {
  try {
    // O resultado e a recompensa agora são decididos inteiramente pelo servidor
    // (RPC pvp_respond_challenge, SECURITY DEFINER) -- o cliente só pede a ação e
    // exibe o que voltar. Isso fecha duas falhas do fluxo antigo: quem aceitava o
    // desafio conseguia sempre se declarar vencedor, e a recompensa era só um
    // "+G.wallet" local sem controle nenhum de duplicação.
    const { data, error } = await supabase.rpc('pvp_respond_challenge', { p_challenge_id: id, p_accept: accept });
    if (error) throw error;

    if (data.status === 'declined') {
      notify('info', 'Desafio recusado.');
      renderPvpChallenges();
      return;
    }

    if (data.i_won) {
      G.wallet = (G.wallet || 0) + (data.gold_gain || 0);
      if (data.xp_gain_suggestion) gainXP(data.xp_gain_suggestion);
      saveGame();
      addToFeed(`🏆 Venceu um duelo PvP! +${data.xp_gain_suggestion || 0} XP +${data.gold_gain || 0} Cry`);
      notify('success', `🏆 Você venceu o duelo! +${data.xp_gain_suggestion || 0} XP +${data.gold_gain || 0} Cry`);
    } else {
      addToFeed('💀 Perdeu um duelo de PvP.');
      notify('info', '💀 Você perdeu o duelo.');
    }
    renderPvpChallenges();
  } catch (e) {
    console.error('Erro ao responder desafio de PvP', e);
    notify('error', 'Não foi possível concluir o duelo: ' + (e.message || 'erro desconhecido'));
  }
}
// Confere desafios concluídos que ainda não foram "reclamados" nesta
// conta (dá prêmio pro vencedor, ou só avisa o perdedor) — necessário
// pro lado que NÃO clicou em aceitar também saber o resultado e
// receber a recompensa, já que a resolução roda só do outro lado.
export async function claimCompletedPvpChallenges(challenges) {
  // O ouro do duelo já foi creditado pelo servidor dentro de pvp_respond_challenge
  // (o lado que clicou em "Aceitar" chama a RPC e recebe o resultado na hora --
  // ver respondPvpChallenge). Esta função só cobre o OUTRO lado (quem desafiou e
  // ainda não sabia do resultado): aqui a gente só sincroniza a carteira com o
  // valor real do servidor (nunca soma de novo) e aplica o ganho de XP local.
  const me = myId();
  G.claimedPvpChallenges = G.claimedPvpChallenges || [];
  const toSync = challenges.filter(c => c.status === 'completed' && !G.claimedPvpChallenges.includes(c.id));
  if (!toSync.length) return;

  let changed = false;
  let myWallet = null;
  for (const c of toSync) {
    G.claimedPvpChallenges.push(c.id);
    changed = true;
    if (c.winner_id === me) {
      const xpGain = 30 + (G.level || 1) * 5;
      gainXP(xpGain);
      if (myWallet === null) {
        const { data: prof } = await supabase.from('profiles').select('wallet').eq('id', me).single();
        myWallet = prof ? prof.wallet : null;
      }
      if (myWallet !== null) G.wallet = myWallet;
      addToFeed(`🏆 Venceu um duelo PvP! +${xpGain} XP`);
      notify('success', `🏆 Você venceu um duelo de PvP! +${xpGain} XP`);
    } else {
      addToFeed('💀 Perdeu um duelo de PvP.');
      notify('info', '💀 Você perdeu um duelo de PvP.');
    }
  }
  if (changed) { saveGame(); updateHeader(); }
}

export async function renderPvpChallenges() {
  const el = document.getElementById('pvp-challenges');
  if (!el) return;
  const me = myId();
  if (!me) return;
  try {
    const { data, error } = await supabase.from('pvp_challenges')
      .select('*')
      .or(`challenger_id.eq.${me},target_id.eq.${me}`)
      .order('created_at', { ascending: false })
      .limit(20);
    if (error) throw error;
    const challenges = data || [];

    await claimCompletedPvpChallenges(challenges.filter(c => c.status === 'completed'));

    const incoming = challenges.filter(c => c.target_id === me && c.status === 'pending');
    const outgoing = challenges.filter(c => c.challenger_id === me && c.status === 'pending');
    const recent = challenges.filter(c => c.status === 'completed' || c.status === 'declined').slice(0, 5);

    if (!incoming.length && !outgoing.length && !recent.length) {
      el.innerHTML = '<div style="color:var(--text3);font-size:12px;text-align:center">Nenhum desafio no momento.</div>';
      return;
    }

    const ids = [...new Set(challenges.flatMap(c => [c.challenger_id, c.target_id]))];
    const { data: profs } = await supabase.from('profiles').select('id,name').in('id', ids);
    const nameOf = id => (profs || []).find(p => p.id === id)?.name || 'Alguém';

    let html = '';
    incoming.forEach(c => {
      html += `<div style="display:flex;align-items:center;gap:8px;padding:6px 0;border-bottom:1px solid var(--border)">
        <span style="font-size:12px;flex:1;text-align:left">${escapeHtml(nameOf(c.challenger_id))} te desafiou</span>
        <button class="btn btn-sm btn-success" onclick="respondPvpChallenge('${c.id}',true)">Aceitar</button>
        <button class="btn btn-sm btn-danger" onclick="respondPvpChallenge('${c.id}',false)">Recusar</button>
      </div>`;
    });
    outgoing.forEach(c => {
      html += `<div style="padding:6px 0;border-bottom:1px solid var(--border);font-size:12px;color:var(--text3)">Aguardando resposta de ${escapeHtml(nameOf(c.target_id))}...</div>`;
    });
    recent.forEach(c => {
      const otherId = c.challenger_id === me ? c.target_id : c.challenger_id;
      let line;
      if (c.status === 'declined') line = `Desafio contra ${escapeHtml(nameOf(otherId))} foi recusado.`;
      else line = c.winner_id === me ? `🏆 Você venceu contra ${escapeHtml(nameOf(otherId))}.` : `💀 Você perdeu contra ${escapeHtml(nameOf(otherId))}.`;
      html += `<div style="padding:4px 0;font-size:11px;color:var(--text3)">${line}</div>`;
    });
    el.innerHTML = html;
  } catch (e) {
    console.error('Erro ao carregar desafios de PvP', e);
    el.innerHTML = '<div style="color:var(--red);font-size:12px;text-align:center">Erro ao carregar desafios.</div>';
  }
}

