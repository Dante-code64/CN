# Como colocar o Crydan no ar (passo a passo bem simples)

## ⚠️ MUITO IMPORTANTE — leia isto primeiro se amizade, mensagens, publicações, ranking ou duelos não estão funcionando
Se pedidos de amizade, mensagens diretas, publicações, ranking ou desafios de PvP **não estão chegando/aparecendo pra outra pessoa**, o motivo quase certo é que os arquivos SQL abaixo nunca foram rodados no seu Supabase — sem eles, as tabelas que guardam essas informações **não existem no banco**, e cada uma dessas ações falha silenciosamente (o app tenta salvar num lugar que não existe).

Rode os 3 arquivos abaixo, **nesta ordem**, no SQL Editor do Supabase (Supabase → seu projeto → SQL Editor → New query → colar o conteúdo do arquivo → Run). É seguro rodar de novo mesmo que já tenha rodado uma versão antiga antes — os arquivos foram escritos pra não duplicar nem quebrar nada se rodados mais de uma vez:

1. **`social-setup.sql`** — cria as tabelas de perfis públicos, pedidos de amizade, mensagens diretas, PIX e desafios de PvP. **Sem isso, nada de social funciona entre contas diferentes.**
2. **`public-profile-setup.sql`** — adiciona o @usuário único (estilo Instagram), bio, moldura, banner, riqueza, batalhas e missões concluídas à tabela de perfis públicos. **Precisa disso pro Ranking mostrar todo mundo de verdade, e não só você.**
3. **`posts-setup.sql`** — cria a tabela de publicações do Feed, visível para todo mundo (antes, cada publicação ficava salva só na sua própria conta, por isso ninguém mais via).

Depois de rodar os 3, tudo isso passa a funcionar de verdade entre contas diferentes: amizade, mensagens, PvP, publicações, ranking geral e busca/visualização de perfil por @usuário.

## O que ainda é só simulado localmente (não chega pra outras contas)
Pra você ter o mapa completo e real do que já foi conectado de verdade e o que ainda não foi: **Comunidades/canais, Guildas e Casamento** ainda funcionam só dentro da sua própria conta — quando você cria uma comunidade ou entra numa guilda, isso não é visível/compartilhado com outras contas de verdade ainda (é a mesma situação que Publicações estava antes desta atualização). Amizade, Mensagens Diretas, PvP, Publicações, Ranking e Perfil Público **já são 100% reais** entre contas diferentes. Se quiser, esse é o próximo passo natural — construir Comunidades/Guildas com tabelas reais no Supabase, do mesmo jeito que foi feito com Publicações.

## O que já está pronto
- `index.html` — o app inteiro, já conectado ao seu banco de dados real no Supabase (projeto "Crydan", `mkwqkedrnmzhyrpwzpse`).
- As tabelas `saves` e `app_settings` já foram criadas no seu Supabase, com segurança (cada pessoa só vê e edita os próprios dados).
- `vite.config.js`, `vercel.json`, `package.json` — arquivos que dizem pro Vercel como construir e publicar o site.

Não precisa configurar nenhuma senha ou chave na Vercel — a chave pública do Supabase já está dentro do `index.html` (isso é seguro, é assim que o Supabase é feito pra funcionar).

## Passo 1 — Colocar os arquivos no GitHub
1. Entre em [github.com](https://github.com) e crie um repositório novo (pode ser privado).
2. Suba todos os arquivos desta pasta pra esse repositório (dá pra arrastar e soltar direto no site do GitHub, em "Add file → Upload files").

## Passo 2 — Conectar com a Vercel
1. Entre em [vercel.com](https://vercel.com) e faça login (dá pra usar sua conta do GitHub).
2. Clique em **"Add New..." → "Project"**.
3. Escolha o repositório que você acabou de criar.
4. A Vercel já vai reconhecer que é um projeto Vite sozinha (por causa do `vercel.json`). Não precisa mudar nada.
5. Clique em **"Deploy"**.

## Passo 3 — Pronto!
Em cerca de 1 minuto, a Vercel te dá um link (tipo `crydan.vercel.app`). Esse link já é o app funcionando, com banco de dados de verdade.

## Uma coisa pra você verificar no Supabase
No painel do Supabase, em **Authentication → Settings**, tem uma opção "Confirm email". Se ela estiver **ligada**, quem criar conta precisa clicar num link no e-mail antes de conseguir entrar. Se você quiser que a pessoa entre na hora, sem confirmar e-mail, é só desligar essa opção lá.

## NOVO — Área de administração (sem senha fixa)
A senha de admin que ficava escrita direto no código foi removida — qualquer pessoa que abrisse "Ver código-fonte" da página conseguia ler ela. Agora a administração usa a mesma conta (e-mail/senha) do Crydan, só que precisa estar marcada como admin no banco.

**Configuração (uma vez só):**
1. No SQL Editor do Supabase, rode o arquivo `admin-setup.sql` (está nesta pasta). Ele cria uma tabelinha `app_admins` — sem essa tabela, ninguém entra na administração.
2. Entre no Crydan publicado e crie sua conta normalmente, como jogador.
3. No painel do Supabase, vá em **Authentication → Users**, encontre seu usuário e copie o **User UID**.
4. Volte no SQL Editor e rode (trocando pelo seu UUID):
   ```sql
   INSERT INTO public.app_admins (id) VALUES ('cole-seu-uuid-aqui');
   ```
5. Pronto! Agora, ao clicar em "Área de Administração" e entrar com essa conta, você cai no painel.

Para adicionar outro administrador depois, repita o passo 4 com o UUID da outra pessoa (ela precisa ter criado conta antes).

## NOVO — "Esqueci minha senha" agora funciona
Tem um link "Esqueci minha senha" na tela de login. Pra ele funcionar direitinho, confira uma coisa no Supabase:
- Vá em **Authentication → URL Configuration**.
- Em **Site URL** e **Redirect URLs**, adicione o link do seu site publicado na Vercel (ex: `https://crydan.vercel.app`).

Sem isso, o Supabase pode recusar o redirecionamento depois que a pessoa clicar no link do e-mail de recuperação.

## NOVO — Tela de cadastro reformulada
A tela de criar conta agora é um assistente em 4 etapas (nome + @usuário único/idade/classe → avatar com moldura animada → banner com animação → revisão), com pré-visualização ao vivo de como o perfil vai ficar. O @usuário é obrigatório, único em toda a plataforma (mesmas regras do Instagram: letras minúsculas, números, ponto e underline) e verificado em tempo real enquanto a pessoa digita — não dá pra avançar pra próxima etapa com um @usuário inválido ou já em uso. Usa as mesmas ~85 molduras e 10 animações de banner que já existiam no app (incluindo o dragão) — nada novo pra manter, só reorganizado numa experiência melhor logo na entrada.

## Se quiser testar no seu computador antes
```
npm install
npm run dev
```
Isso abre o app localmente pra você testar antes de publicar.
