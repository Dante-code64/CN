// src/utils/format.js
// Extraído do antigo bloco <script> único (src/main.js).

export function timeAgo(iso) {
  const diff = Math.max(0, Date.now() - new Date(iso).getTime());
  const m = Math.floor(diff / 60000);
  if (m < 1) return 'agora';
  if (m < 60) return m + 'min';
  const h = Math.floor(m / 60);
  if (h < 24) return h + 'h';
  return Math.floor(h / 24) + 'd';
}

export function formatCry(n) {
  return Math.floor(n || 0).toLocaleString('pt-BR');
}

export function formatLastSeen(iso) {
  if (!iso) return '';
  const diffMs = Date.now() - new Date(iso).getTime();
  if (diffMs < 3 * 60000) return '<span style="color:var(--green)">● Online agora</span>';
  return `<span style="color:var(--text3)">Visto por último há ${timeAgo(iso)}</span>`;
}

export function _stripAt(v) { return (v || '').trim().replace(/^@/, ''); }
