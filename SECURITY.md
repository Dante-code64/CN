# Segurança do Crydan

Este documento descreve o modelo de segurança atual e o histórico de incidentes/correções — não é um documento teórico, reflete decisões tomadas em resposta a ataques reais já sofridos pela plataforma.

## Princípio central: o navegador nunca é a autoridade final

Todo dado que chega do cliente (JavaScript rodando no navegador de qualquer pessoa) é tratado como **não confiável**, mesmo vindo do próprio jogo. Concretamente:

- **Economia (carteira, banco, cristais):** toda escrita na tabela `saves` passa por um trigger (`clamp_saves_data`) que força os valores a ficarem dentro de limites sãos, independente do que o cliente tentou salvar. Jogadores comuns não conseguem se dar ouro/cristais infinitos editando o estado local ou chamando a API diretamente.
- **Nível e atributos:** mesmo trigger — nível máximo e atributos são recalculados/limitados no banco, não apenas na tela.
- **Classe do personagem:** só pode ser uma das classes cadastradas na tabela `classes` (gerenciada exclusivamente pela administração); qualquer outro valor é rejeitado na escrita.
- **Banimento/suspensão/selo de verificação:** essas colunas em `profiles` são protegidas por um trigger (`protect_moderation_columns`) que desfaz qualquer alteração que não venha de uma sessão de admin (`is_admin()`) ou de uma rotina interna de confiança sinalizada explicitamente (`app.system_moderation`). Um jogador comum não consegue se autopromover a administrador nem se desbanir editando dados direto.
- **Ações administrativas** (banir, suspender, dar/tirar cristais, aprovar guilda, conceder selo, excluir conta, resetar conta) só existem como funções RPC no banco (`admin_*`), cada uma checando `is_admin()` internamente antes de fazer qualquer coisa — e essas funções foram explicitamente bloqueadas para usuários não autenticados (`revoke execute ... from anon`), como camada extra de defesa.
- Toda ação administrativa relevante é registrada em `admin_logs` (quem, o quê, quando, motivo).

## RLS (Row Level Security)

Toda tabela do schema `public` tem RLS ativado, com políticas específicas por ação (`SELECT`/`INSERT`/`UPDATE`/`DELETE`). O padrão geral:

- Um usuário só lê/edita os próprios registros (mensagens, posts, saves, perfil), **ou**
- a administração pode agir sobre qualquer registro (`is_admin()`), **ou**
- o dado é público por natureza (lista de guildas, publicações do feed, classes disponíveis).

Em 2026-08, uma auditoria completa das políticas encontrou e corrigiu:
- **110 políticas** que recalculavam `auth.uid()`/`auth.role()` linha a linha em vez de uma vez por consulta (impacto de performance, não de segurança) — corrigidas trocando `auth.uid()` por `(select auth.uid())`, uma otimização documentada oficialmente pelo Supabase que não muda o resultado lógico.
- **~24 políticas duplicadas/sobrepostas** na mesma tabela+ação (ex.: uma política "dono pode apagar" e outra separada "admin pode apagar" na mesma tabela) — fundidas em uma única política por ação, mantendo a regra `dono OU admin` via `OR`, sem alterar quem tem acesso a quê.

## Restrição de contas (moderação social)

Contas banidas ou suspensas (`is_restricted()`) são bloqueadas de: postar, comentar, curtir com efeito colateral em notificação, seguir, mandar mensagem, entrar em guilda/comunidade, desafiar para PvP, e editar mensagens antigas. Essa checagem foi auditada e reforçada tabela por tabela após se descobrir que algumas ações sociais (stories, canais de comunidade, mensagens de grupo) não tinham essa trava aplicada — hoje todas têm.

## Sistemas anti-abuso (cadastro)

Depois de um ataque real (script automatizado criando dezenas de contas por minuto), foram implementadas várias camadas, todas independentes entre si:

1. **Bloqueio por palavra no e-mail** — lista administrável de palavras (`blocked_email_keywords`) que impede o cadastro se o e-mail contiver qualquer uma delas.
2. **Bloqueio de "leva" de e-mails parecidos** — se o mesmo padrão de e-mail (ignorando números) aparecer 4+ vezes no mesmo domínio em menos de 2 horas, o cadastro é recusado e o e-mail é banido automaticamente.
3. **Disjuntor geral de cadastro** — se 10+ contas forem criadas em menos de 3 minutos no site inteiro, todo novo cadastro é pausado automaticamente por alguns minutos (se autodestrava sozinho).
4. **CAPTCHA (Cloudflare Turnstile)** na tela de cadastro, validado no servidor pelo próprio Supabase Auth — impede scripts de criarem conta em massa mesmo que descubram um jeito de contornar as 3 camadas acima.
5. **Detecção de progresso suspeito** — subir muitos níveis, ganhar ouro ou registrar muitas batalhas em pouco tempo dispara suspensão automática da conta com o motivo registrado em log, para revisão humana depois.

## Notificações Push

O gatilho que envia notificações push (via `pg_net` para uma Edge Function) está isolado em um bloco `begin...exception when others then...end` — uma falha no envio do push **nunca** derruba a ação original do usuário (curtir, comentar, mandar mensagem). Essa proteção foi adicionada depois de um bug real em que uma falha silenciosa no push estava impedindo curtidas e mensagens de serem salvas.

## Itens pendentes conhecidos

- **Proteção contra senha vazada** (checagem contra a base do HaveIBeenPwned): recurso nativo do Supabase Auth, mas só pode ser ativado pelo painel do Supabase (Authentication → Attack Protection) — não é possível ativar via SQL/API.
- **`eval()` / `new Function()`**: existiam no código (um mecanismo redundante para "garantir" que funções de `onclick` fossem encontradas). Removidos em 2026-08 após confirmação de que o navegador já resolve isso nativamente sem necessidade de código dinâmico.
