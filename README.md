# Crydan

Crydan é um RPG social medieval baseado em navegador: os jogadores criam um personagem, sobem de nível, batalham contra monstros, entram em guildas, compram e vendem no mercado, mandam mensagem uns aos outros, publicam posts e stories, e interagem numa comunidade dentro do próprio jogo.

- **Site em produção:** https://crydan.vercel.app
- **Stack:** HTML + JavaScript puro (sem framework de UI) · [Supabase](https://supabase.com) (Postgres + Auth + Storage + Edge Functions) · [Vite](https://vitejs.dev) (build) · [Vercel](https://vercel.com) (hospedagem)

## Estrutura do repositório

```
index.html          → toda a aplicação (HTML + CSS + JS num arquivo só — ver ARCHITECTURE.md)
terms.html           → Termos de Uso
privacy.html          → Política de Privacidade
public/               → arquivos estáticos servidos "como estão" pelo Vite:
  sw.js                 service worker (push notifications)
  manifest.json         manifesto do PWA (ícone, nome, cores)
  favicon.ico, icon-*.png
  *.lottie              animações interativas (avatar/tema)
vite.config.js         configuração de build (Vite)
vercel.json            configuração de deploy (rewrites de rota, framework)
package.json
*.sql                  scripts SQL de referência (setup histórico — ver DATABASE.md pro estado atual)
```

> ⚠️ **Importante sobre a pasta `public/`:** como o projeto usa Vite, qualquer arquivo estático que precise ser acessado direto pela raiz do site (`/sw.js`, `/manifest.json`, ícones, etc.) **precisa estar dentro de `public/`**. Um arquivo solto na raiz do repositório (fora de `public/`) não é copiado pro build e vira 404 no site publicado. Esse foi um bug real já corrigido durante o desenvolvimento — ver `SECURITY.md`/histórico de decisões.

## Como rodar localmente

```bash
npm install
npm run dev      # ambiente de desenvolvimento (Vite)
npm run build    # gera a pasta dist/ pronta pra produção
```

O jogo se conecta a um projeto Supabase já configurado (URL e chave pública ficam direto no `index.html`, não são segredo — é o modelo padrão do Supabase, a segurança de verdade mora nas regras RLS do banco, não em esconder essas duas strings).

## Deploy

O deploy é automático: todo push na branch principal do GitHub aciona um novo build no Vercel (configurado em `vercel.json`, `framework: "vite"`, saída em `dist/`).

## Documentação relacionada

- [`ARCHITECTURE.md`](./ARCHITECTURE.md) — como o código está organizado hoje e por quê
- [`SECURITY.md`](./SECURITY.md) — modelo de segurança, RLS, sistemas anti-abuso
- [`DATABASE.md`](./DATABASE.md) — tabelas, funções e triggers do Supabase
- [`CONTRIBUTING.md`](./CONTRIBUTING.md) — checklist antes de mudar algo
