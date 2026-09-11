// src/ui/constants.js
// Configurações fixas de interface (rótulos, categorias de navegação,
// visões de dispositivo, config de chamada de vídeo, cores de stories).

export const FB_TYPE_LABEL = { bug:'🐞 Bug', sugestao:'💡 Sugestão', elogio:'💚 Elogio', outro:'✏️ Outro' };

export const RTC_CONFIG = { iceServers: [{ urls: ['stun:stun.l.google.com:19302', 'stun:stun1.l.google.com:19302'] }] };

export const DEVICE_VIEWS = {
  pc:     { icon: '🖥️', label: 'PC' },
  tablet: { icon: '📱', label: 'Tablet' },
  mobile: { icon: '📲', label: 'Celular' },
};

export const MOBILE_NAV_CATEGORIES = {
  principal: [ {p:'inicio',i:'inicio',l:'Início'}, {p:'perfil',i:'perfil',l:'Perfil'}, {p:'meupersonagem',i:'meupersonagem',l:'Meu Personagem'}, {p:'inventario',i:'inventario',l:'Inventário'}, {p:'galeria',i:'galeria',l:'Galeria'}, {p:'conquistas',i:'conquistas',l:'Conquistas'} ],
  rpg: [ {p:'batalha',i:'batalha',l:'Batalha'}, {p:'missoes',i:'missoes',l:'Missões'}, {p:'guildas',i:'guildas',l:'Guildas'}, {p:'boss',i:'boss',l:'Chefes'}, {p:'mapa',i:'mapa',l:'Mapa'}, {p:'coleta',i:'coleta',l:'Coleta'} ],
  economia: [ {p:'banco',i:'banco',l:'Banco'}, {p:'mercado',i:'mercado',l:'Mercado'}, {p:'casas',i:'casas',l:'Casas'}, {p:'empresas',i:'empresas',l:'Empresas'}, {p:'empregos',i:'empregos',l:'Empregos'} ],
  social: [ {p:'conversas',i:'conversas',l:'Conversas'}, {p:'amigos',i:'amigos',l:'Amigos'}, {p:'publicacoes',i:'publicacoes',l:'Publicações'}, {p:'casamento',i:'casamento',l:'Casamento'}, {p:'ranking',i:'ranking',l:'Ranking'}, {p:'eventos',i:'eventos',l:'Eventos'} ],
  entretenimento: [ {p:'musicas',i:'musicas',l:'Músicas'}, {p:'jogos',i:'jogos',l:'Jogos'}, {p:'iacompanheira',i:'iacompanheira',l:'IA Companheira'} ],
  sistema: [ {p:'feedback',i:'feedback',l:'Feedback'}, {p:'config',i:'config',l:'Config'} ],
};

export const MOBILE_PANEL_TO_CAT = {};
Object.entries(MOBILE_NAV_CATEGORIES).forEach(([cat, items]) => items.forEach(it => MOBILE_PANEL_TO_CAT[it.p] = cat));
export const STORY_COLORS = ['#8c1621', '#5b3a86', '#1a5276', '#1e5c3a', '#7a4a12', '#2a2a2a'];

export const STORY_REACT_EMOJIS = ['❤️', '🔥', '😂', '😮', '👏', '✦'];

