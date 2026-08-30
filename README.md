# Crydan — Snapshot do schema Supabase (funções e policies)

Este diretório é um **espelho, extraído agora do banco de produção** (`mkwqkedrnmzhyrpwzpse`),
de tudo que hoje só existe "ao vivo" no Supabase e não estava versionado no repositório.

**Isto NÃO é uma migração.** Nenhum destes arquivos foi aplicado ao banco — eles documentam
exatamente o que já está rodando em produção neste momento (30/08/2026), para permitir
revisão de código e servir de base para as próximas correções (economia/PvP autoritativos).

## Conteúdo

- `functions/00_helpers.sql` — `is_admin()`, `is_restricted()`
- `functions/10_admin.sql` — as 9 funções `admin_*` (ban, unban, grant crystals, reset conta, etc.)
- `functions/20_economy.sql` — `send_pix`, `apply_referral_code`, `approve_crystal_purchase`, `reject_crystal_purchase`
- `functions/30_guild.sql` — as 16 funções `guild_*`
- `functions/40_group_community.sql` — as 11 funções `group_*` e `community_*`
- `functions/50_misc.sql` — `touch_last_seen`
- `policies/saves_profiles.sql` — policies de RLS atuais das tabelas `saves` e `profiles`
  (documentadas, **não alteradas** — ver observações de segurança no cabeçalho do arquivo)

## Achados já confirmados a partir deste snapshot (ver auditoria completa no chat)

1. `saves` tem policy de UPDATE `is_admin() OR auth.uid() = id`, **sem `with_check`** —
   qualquer usuário autenticado pode sobrescrever `data` (que inclui `wallet`, `bank`, `xp`,
   `level`, inventário) com qualquer valor, direto pela API, sem passar por `saveGame()`.
2. `send_pix` lê o saldo de `saves.data->>'wallet'` — exatamente o campo do item 1. Isso permite
   inflar o próprio saldo e "lavar" o valor transferindo para outra conta via PIX, ficando
   registrado como transferência real em `pix_transfers`.
3. `profiles` tem uma **segunda cópia** de `wallet`/`bank`/`level`/`battles`/`quests_completed`,
   também escrita diretamente pelo cliente em `syncProfile()` (index.html), a partir do mesmo
   estado não confiável `G`.
4. As funções `admin_*`, `guild_*`, `group_*`, `community_*` em si estão bem escritas:
   `SECURITY DEFINER` + `SET search_path TO 'public'` + checagem de `is_admin()`/papel do
   chamador antes de qualquer efeito. Não foi encontrado um caso de RPC administrativa sem
   verificação de permissão.
5. `admin_reset_account` já escreve em `profiles.wallet`/`level`, reforçando que `profiles`
   é usada como fonte "oficial" em pelo menos um fluxo administrativo — mais um motivo para
   ela (e não `saves.data`) virar a única fonte de verdade.

## Próximo passo (ainda não feito)

Nenhuma alteração de schema foi aplicada. A correção do item 1/2/3 (tornar wallet/XP/level
server-authoritative) será feita como uma migração separada, revisada e testada antes de
aplicar em produção — ver roadmap na auditoria.
