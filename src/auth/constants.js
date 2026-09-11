// src/auth/constants.js
// Regras fixas de login/cadastro -- nada aqui muda sozinho.

export const USERNAME_REGEX = /^(?!.*\.\.)[a-z0-9_][a-z0-9_.]{0,28}[a-z0-9_]$|^[a-z0-9_]$/;

export const OAUTH_PROVIDERS = [
  { id: 'google', label: 'Google', icon: '🟢' },
  { id: 'discord', label: 'Discord', icon: '🟣' },
];
