# Como contribuir com o Crydan

## Antes de mexer em qualquer coisa

1. Leia `ARCHITECTURE.md` pra entender onde as coisas ficam dentro do `index.html`.
2. Se a mudança envolve dinheiro, XP, nível, banimento ou qualquer permissão — leia `SECURITY.md` primeiro. Regra de ouro: **o navegador nunca decide sozinho**, só o banco.
3. Se a mudança envolve uma tabela nova ou uma política de RLS nova, leia `DATABASE.md` e siga as convenções lá.

## Checklist antes de publicar uma mudança

- [ ] O site abre sem erro no console do navegador
- [ ] Login e cadastro continuam funcionando
- [ ] Se mexeu em economia/RPG: testar comprar algo, ganhar XP, subir de nível
- [ ] Se mexeu em social: testar curtir, comentar, mandar mensagem, seguir alguém
- [ ] Se mexeu em RLS/permissões: testar como jogador comum **e** como administrador
- [ ] Se adicionou arquivo estático novo (ícone, animação, service worker): confirmar que está dentro de `public/`, não solto na raiz
- [ ] Se mexeu no painel de administração: confirmar que uma conta sem `is_admin()` continua sem conseguir usar a função

## Sobre dividir o `index.html` em módulos

Essa reestruturação é desejável a longo prazo, mas **não deve ser feita de uma vez, e não deve ser feita sem alguém testando o site rodando de verdade a cada passo**. O motivo é simples: sem rodar o site depois de cada mudança, não tem como saber se uma função que um botão depende ainda está acessível depois de mover código de lugar.

Se for encarar esse projeto, a sequência seria:

```
extrair um sistema (ex: autenticação)
   → mover pro seu próprio arquivo/módulo
   → o site inteiro continua rodando, com esse pedaço importado
   → testar TODAS as telas que usam login/cadastro/sessão
   → só then seguir pro próximo sistema (ex: social)
```

Nunca mover mais de um sistema por vez, e nunca sem testar entre um e outro.

## Nunca faça

- Não confie em `if (isAdmin)` no JavaScript como proteção — isso é só pra esconder botão da interface. A proteção de verdade é a checagem `is_admin()` dentro da função do banco.
- Não crie uma tabela nova sem pelo menos uma política de RLS de `SELECT` (uma tabela com RLS ativado e zero políticas bloqueia geral, inclusive administração).
- Não use `auth.uid()` cru em política de RLS nova — use `(select auth.uid())`.
- Não use `eval()` ou `new Function()` pra resolver problema de escopo — em um `<script>` comum (não-module), toda função declarada normalmente já é acessível globalmente pelo próprio navegador.
- Não faça `catch (e) {}` silencioso em uma ação que o jogador disparou de propósito (enviar algo, apagar algo, comprar algo) — se pode falhar, o jogador precisa saber. Silêncio só é aceitável em leituras de fundo/limpeza (ver exemplos comentados no próprio código).
