# Arquitetura do Crydan

## Visão geral

O Crydan é uma **Single Page Application** escrita em JavaScript puro (sem React/Vue/etc.), com todo o front-end concentrado em **um único arquivo `index.html`** (HTML + `<style>` + `<script>`). O backend é inteiramente o **Supabase**: banco Postgres, autenticação, Storage (imagens/áudio/vídeo) e duas Edge Functions (`ai-chat`, `send-push`).

```
Navegador (index.html)
   │
   ├─ supabase-js  ──►  Supabase Auth (login/cadastro)
   ├─ supabase-js  ──►  Postgres via PostgREST (tabelas, RPCs)
   ├─ supabase-js  ──►  Storage (avatares, banners, áudio de chat, animações)
   └─ fetch()      ──►  Edge Functions (IA do companheiro, push notifications)
```

Não existe servidor de aplicação próprio — o navegador fala direto com o Supabase. Por isso **o banco de dados é a única fronteira de confiança real** (ver `SECURITY.md`): tudo que o JavaScript do cliente decide pode, em teoria, ser manipulado por um usuário mal-intencionado abrindo o console do navegador, então toda regra de negócio importante (economia, XP, banimento, permissões) é validada de novo no banco, não só no front-end.

## Por que tudo está em um `index.html` só

Esse não foi o formato escolhido do zero — é o resultado do jogo ter crescido organicamente, funcionalidade sobre funcionalidade, sem uma pausa para reestruturar. Isso tem um custo real (arquivo com quase 1MB, ~17 mil linhas), mas também um benefício que vale reconhecer: não existe nenhum passo de build separando "o que está escrito" de "o que está rodando" — o que está no arquivo é exatamente o que o navegador executa. Isso tornou possível fazer toda a auditoria e as correções de segurança descritas em `SECURITY.md` com confiança de que nada ficaria "escondido" num módulo não revisado.

### Organização interna do arquivo

Embora seja um arquivo só, o código dentro dele já segue uma separação por assunto (mesmo sem arquivos separados). Os blocos principais, na ordem em que aparecem:

1. **`<style>`** — variáveis de tema (`:root`, `body.theme-light`), depois os componentes visuais (cards, botões, sidebar, mapa, etc.)
2. **Configuração e constantes** — cliente Supabase, tabelas de dados estáticos do jogo (`AVATAR_FRAMES`, `MONSTERS`, `MAP_ZONES`, `BANNER_ANIMS`, `FRAME_CATEGORIES`)
3. **Autenticação e sessão** — login, cadastro (com captcha), troca de e-mail, OAuth
4. **Estado do jogador** — o objeto global `G` (ver abaixo) e as funções `saveGame()`/`syncProfile()` que sincronizam com o Supabase
5. **Sistemas de jogo** — batalha, mapa 2D, inventário, guildas, empregos, banco
6. **Social** — posts, comentários, curtidas, amizades, seguidores, stories, chat (privado, grupos, comunidades)
7. **Painel de administração** — telas e funções `adm*`, todas exigindo confirmação do banco via `is_admin()` (nunca só uma checagem no JavaScript)

### O objeto de estado global `G`

```js
let G = { name, level, wallet, bank, crystals, inventory, avatarFrame, ... };
```

Esse objeto guarda o progresso do jogador logado em memória durante a sessão, é salvo periodicamente na tabela `saves` (coluna `data`, tipo `jsonb`) via `saveGame()`, e uma cópia resumida (nome, avatar, nível, carteira...) é espelhada na tabela `profiles` via `syncProfile()` para que outros jogadores consigam ver o perfil público sem precisar ler o save privado de ninguém.

Migrar esse `G` global para módulos de estado separados (`authStore`, `rpgStore`, `economyStore`...) é uma refatoração legítima e desejável, mas que só deve ser feita:
- com o site rodando localmente para testar cada mudança na hora, e
- em pequenos passos, um sistema de cada vez (ex.: primeiro `authStore`, testar tudo, depois `economyStore`, testar tudo de novo).

Isso não foi feito ainda porque exige alguém testando o resultado ao vivo a cada etapa — ver nota em `CONTRIBUTING.md`.

## Fluxo de dados típico (exemplo: comprar um item)

```
Clique no botão "Comprar"
   → JS calcula se o jogador pode pagar (feedback rápido pro usuário)
   → chamada a uma função RPC no Postgres (ex.: rpc('buy_item', {...}))
   → o banco confere de novo o saldo e as regras (é aqui que a compra é validada de verdade)
   → o banco debita o saldo e insere o item numa única transação
   → o JS atualiza a tela com o resultado que voltou do banco
```

O princípio geral: **o cliente sugere, o banco decide.**
