-- ============================================================
-- Crydan — Tabela de administradores (substitui a senha fixa)
-- Execute isso no SQL Editor do seu projeto Supabase (mkwqkedrnmzhyrpwzpse)
-- ============================================================

-- Antes disso não existia. A tabela guarda só o ID de quem é admin.
-- Um usuário SÓ consegue perguntar "eu sou admin?" (sobre a própria conta) —
-- não consegue ler quem mais é admin, nem se promover sozinho, porque não
-- existe política de INSERT/UPDATE/DELETE liberada para o usuário comum.

CREATE TABLE public.app_admins (
  id         UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  criado_em  TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

ALTER TABLE public.app_admins ENABLE ROW LEVEL SECURITY;

-- Cada usuário logado só pode checar a própria linha (se existir, é admin)
CREATE POLICY "Usuário só vê se ele mesmo é admin"
  ON public.app_admins FOR SELECT TO authenticated
  USING (auth.uid() = id);

-- Propositalmente NÃO existe política de INSERT/UPDATE/DELETE aqui.
-- Isso significa que ninguém consegue se promover a admin sozinho pelo
-- app — só é possível adicionar um admin manualmente, direto no painel
-- do Supabase (Table Editor ou SQL Editor), como dono do projeto.

-- ============================================================
-- COMO SE TORNAR O PRIMEIRO ADMIN (faça isso uma vez)
-- ============================================================
-- 1. Entre no Crydan publicado e crie sua conta normalmente,
--    como jogador (mesmo e-mail/senha que você quer usar como admin).
-- 2. No painel do Supabase, vá em Authentication → Users.
-- 3. Encontre seu usuário na lista e copie o "User UID" dele.
-- 4. Volte aqui no SQL Editor e rode (trocando o UUID abaixo):
--
--    INSERT INTO public.app_admins (id) VALUES ('cole-seu-uuid-aqui');
--
-- 5. Pronto! Agora, ao clicar em "Área de Administração" no Crydan e
--    fazer login com essa conta, você entra no painel de administração.
--
-- Para adicionar outro admin depois, repita o passo 4 com o UUID da
-- outra pessoa (ela precisa ter criado conta normalmente primeiro).
