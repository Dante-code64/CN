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


export const NOTIF_ICONS = {
  friend_request: '🤝', friend_accept: '🤝',
  pvp_challenge: '⚔️', pvp_accept: '⚔️', pvp_decline: '⚔️', pvp_result: '🏆',
  guild_invite: '🛡️', guild_invite_accept: '🛡️',
  guild_join_request: '🛡️', guild_join_accept: '🛡️', guild_join_decline: '🛡️',
  post_like: '❤️', follow: '⭐', message: '💬', pix: '✦',
};

export const ONBOARDING_STEPS = [
  { icon:'👋', title:'Bem-vindo(a) à Crydan!', text:'Seu personagem já foi criado. Vamos dar uma volta rápida pra você conhecer tudo que tem por aqui.' },
  { icon:'🏠', title:'Início', text:'Sua tela principal. Mostra seu nível, vida, energia, fome e os avisos mais recentes.' },
  { icon:'⚔️', title:'RPG Medieval', text:'Vá em Batalha pra lutar contra monstros, Missões pra ganhar recompensas, e Guildas pra jogar em grupo. Tudo dá XP e Cry (a moeda do jogo).' },
  { icon:'🏦', title:'Economia', text:'No Banco você guarda seu Cry com segurança. No Mercado, Casas e Empresas você gasta e investe o que ganhou.' },
  { icon:'💬', title:'Conversas e Publicações', text:'Crie comunidades, converse com pessoas, mande fotos e vídeos, e publique o que quiser no feed.' },
  { icon:'🤖', title:'IA Companheira', text:'Crie a sua própria IA: escolha nome, idade, gênero e a personalidade dela. Cada pessoa pode ter uma IA diferente!' },
  { icon:'🎮', title:'Central de Jogos', text:'Jogo da Velha, Xadrez, Termo, Quiz e muito mais — sozinho, com um amigo ou contra o computador.' },
  { icon:'🖼️', title:'Galeria', text:'Deixe seu avatar único com molduras animadas — de anéis coloridos até um dragão de verdade voando ao redor da sua foto.' },
  { icon:'🎵', title:'Músicas', text:'Busque e toque músicas direto dentro do app, sem sair pra nenhum site.' },
  { icon:'🔧', title:'Config', text:'Mude o tema, a cor de destaque, a fonte, o fundo inteiro do app e muito mais — do seu jeito.' },
  { icon:'✨', title:'Pronto!', text:'É isso! Agora é só explorar. Boa jornada, aventureiro(a)!' },
];
