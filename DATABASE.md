# Banco de Dados do Crydan

Postgres via Supabase, projeto `mkwqkedrnmzhyrpwzpse` (região `sa-east-1`, São Paulo). Todas as 54 tabelas do schema `public` têm **RLS ativado** — não existe tabela aberta sem regra de acesso.

## Tabelas por área

### Identidade e conta
- **`profiles`** — dados públicos do jogador (nome, @usuário, avatar, nível, carteira/banco espelhados, moldura de avatar, selo de verificação, status de banimento/suspensão)
- **`saves`** — o progresso completo e privado do jogador, num único campo `jsonb` (`data`): inventário, missões, atributos, tudo. Só o próprio dono e a administração leem.
- **`app_admins`** — lista de quem é administrador (a fonte de verdade da função `is_admin()`)
- **`banned_emails`**, **`blocked_email_keywords`** — bloqueio de cadastro (ver `SECURITY.md`)
- **`user_legal_acceptances`**, **`legal_document_versions`** — aceite de Termos/Privacidade
- **`push_subscriptions`** — inscrições de notificação push (Web Push/VAPID)

### Economia
- **`pix_transfers`** — transferências de Cry entre jogadores
- **`crystal_packages`**, **`crystal_purchases`**, **`crystal_grants`** — compra de cristais (moeda premium) e concessões administrativas

### RPG
- **`classes`** — lista oficial de classes jogáveis (só admin edita)
- **`characters`**, **`items`**, **`game_sessions`** — schema legado/alternativo de personagem (pouco usado hoje; o estado de jogo principal vive em `saves.data`)
- **`pvp_challenges`** — desafios de PvP entre jogadores

### Guildas
- **`guilds`**, **`guild_members`**, **`guild_level_config`**, **`guild_achievements`**, **`guild_missions`**, **`guild_seasons`**, **`guild_wars`**, **`guild_vault_transactions`**, **`guild_invites`**, **`guild_join_requests`**, **`guild_creation_requests`**
- Desde a última mudança de regra, guildas **não são mais criadas diretamente** — um jogador registra um pedido em `guild_creation_requests`, e só a administração aprova (`admin_approve_guild_request`) ou recusa (`admin_decline_guild_request`).

### Social
- **`posts`**, **`post_comments`**, **`post_likes`** — feed
- **`friend_requests`**, **`follows`**, **`close_friends`**, **`blocked_users`**, **`restricted_users`** — grafo social e moderação
- **`stories`**, **`story_views`**, **`story_reactions`** — stories temporários
- **`messages`** (DM 1-a-1 do jogo), **`private_messages`** (sistema alternativo/legado), **`groups`**/**`group_members`**/**`group_messages`**, **`communities`**/**`community_members`**/**`community_channels`**/**`channel_messages`** — os diferentes níveis de chat
- **`notifications`** — central de notificações (dispara push via trigger)

### Administração
- **`admin_logs`** — toda ação administrativa relevante, com admin, ação, alvo e motivo
- **`feedback`** — feedback de jogadores e canal de suporte pra contas banidas/suspensas
- **`user_reports`** — denúncias entre jogadores
- **`app_settings`** — configurações globais do app (chave/valor)

### Cosmético
- **`lottie_animations`** — catálogo de animações (moldura de avatar / banner) gerenciado pela administração, com upload de arquivo ou link externo

## Funções importantes (RPC)

| Função | O que faz |
|---|---|
| `is_admin()` | Confere se `auth.uid()` está em `app_admins`. Base de toda checagem de permissão administrativa. |
| `is_restricted()` | Confere se o usuário atual está banido ou suspenso. Usada nas políticas de RLS de quase toda ação social. |
| `clamp_saves_data()` (trigger) | Força limites sãos em nível/atributos/economia/classe a cada gravação em `saves`, ignorado apenas para admins. |
| `protect_moderation_columns()` (trigger) | Impede que banimento/suspensão/selo sejam alterados fora de uma ação de admin verificada. |
| `reject_banned_email()` (trigger) | Roda antes de qualquer cadastro; aplica todas as camadas de bloqueio de e-mail e o disjuntor de cadastro em massa. |
| `detect_suspicious_progress()` (trigger) | Suspende automaticamente contas com progresso/economia anormal. |
| `admin_ban_player`, `admin_unban_player`, `admin_set_suspension`, `admin_grant_crystals`, `admin_delete_account`, `admin_reset_account`, `admin_set_verified_badge`, `admin_approve_guild_request`, `admin_decline_guild_request` | Ações administrativas — todas checam `is_admin()` internamente e são bloqueadas para usuários não autenticados. |

## Storage (arquivos)

| Bucket | Conteúdo | Quem escreve |
|---|---|---|
| `post-media` | Fotos/vídeos de publicações | Dono da publicação |
| `chat-audio` | Áudios de mensagem de voz | Qualquer autenticado |
| `chat-media` | Fotos enviadas em conversas | Qualquer autenticado |
| `profile-animations` | Animações de avatar/banner (Lottie, vídeo, GIF) | Só administração |

## Convenções

- Toda tabela nova deve nascer com RLS ativado e pelo menos uma política de `SELECT` — nunca deixar uma tabela sem nenhuma política (isso bloqueia todo mundo, inclusive quem deveria ter acesso — já aconteceu, ver histórico de `push_subscriptions`).
- Novas políticas devem usar `(select auth.uid())` em vez de `auth.uid()` cru (evita reavaliação linha a linha — ver `SECURITY.md`).
- Antes de criar uma segunda política permissiva para a mesma tabela+ação, considere se dá pra fundir com uma existente usando `OR`.
