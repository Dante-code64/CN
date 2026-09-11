// src/utils/escapeHtml.js
// Extraído do antigo bloco <script> único (src/main.js) — primeira função
// realmente movida pra um módulo próprio, depois que a fusão em 1 módulo ES
// (etapa anterior) destravou fazer isso função por função sem o problema de
// ordem de execução entre scripts clássicos.

export function escapeHtml(s) {
  return String(s).replace(/[&<>"']/g, ch => ({ '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;' }[ch]));
}

// URLs de mídia enviadas pelo usuário (foto/vídeo de post) que vão para dentro de
// atributos HTML, CSS url(...) ou strings de onclick precisam disso, não de
// escapeHtml — o navegador decodifica entidades HTML do atributo ANTES de o CSS/JS
// dali dentro ser interpretado, então &#39; vira ' de novo bem a tempo de quebrar o
// contexto. Como uma URL de verdade nunca tem aspas literais, removê-las resolve.
export function safeMediaUrl(u) {
  return String(u || '').replace(/['"]/g, '');
}
