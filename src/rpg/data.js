// src/rpg/data.js
// "Tabelas de dados" do jogo -- coisas fixas que não mudam sozinhas
// durante o jogo: quais classes existem, o que a loja vende, quais
// missões existem, etc. Pensa nisso como as PÁGINAS DE REGRAS de um
// jogo de tabuleiro: o tabuleiro (a página) não muda, só as peças que
// os jogadores movem em cima dele mudam. Por isso é seguro tirar do
// main.js: nada aqui depende de G (o estado do jogador) nem do supabase.

export const SAVE_KEY = 'crydan_v1';

// ── DATA TABLES ────────────────────────────
export const CLASSES = {
  guerreiro: { icon:'⚔️', str:5, dex:2, int:1, vit:4, wis:1, hp:120, mana:40, stamina:100 },
  mago:      { icon:'🔮', str:1, dex:2, int:6, vit:2, wis:4, hp:70,  mana:120, stamina:60 },
  arqueiro:  { icon:'🏹', str:3, dex:6, int:2, vit:2, wis:2, hp:90,  mana:50,  stamina:100 },
  curandeiro:{ icon:'💚', str:1, dex:2, int:4, vit:3, wis:5, hp:80,  mana:100, stamina:70 },
  ladino:    { icon:'🗡️', str:3, dex:5, int:3, vit:2, wis:2, hp:85,  mana:60,  stamina:90 },
  paladino:  { icon:'🛡️', str:4, dex:2, int:2, vit:5, wis:2, hp:130, mana:60,  stamina:90 },
  druida:    { icon:'🌿', str:2, dex:3, int:4, vit:3, wis:4, hp:85,  mana:90,  stamina:80 },
  necromante:{ icon:'💀', str:2, dex:2, int:6, vit:2, wis:3, hp:70,  mana:130, stamina:60 },
};

export const RANKS = [
  { name:'Recruta',  min:1,  icon:'🎖️', cls:'rank-recruit' },
  { name:'Guerreiro',min:5,  icon:'⚔️', cls:'rank-warrior' },
  { name:'Cavaleiro',min:15, icon:'🛡️', cls:'rank-knight'  },
  { name:'Elite',    min:25, icon:'🌟', cls:'rank-elite'   },
  { name:'Campeão',  min:40, icon:'🔥', cls:'rank-champion'},
  { name:'Lenda',    min:60, icon:'👑', cls:'rank-legend'  },
  { name:'Mítico',   min:80, icon:'💎', cls:'rank-mythic'  },
];

export const SHOP_ITEMS = [
  { id:'espada_ferro',   name:'Espada de Ferro',   icon:'🗡️', type:'weapon', price:80,  power:12, rarity:'common',   desc:'+12 ATK' },
  { id:'espada_aco',     name:'Espada de Aço',     icon:'⚔️', type:'weapon', price:200, power:25, rarity:'uncommon', desc:'+25 ATK' },
  { id:'arco_madeira',   name:'Arco de Madeira',   icon:'🏹', type:'weapon', price:60,  power:10, rarity:'common',   desc:'+10 ATK' },
  { id:'cajado',         name:'Cajado Arcano',      icon:'🪄', type:'weapon', price:150, power:20, rarity:'uncommon', desc:'+20 ATK' },
  { id:'escudo_ferro',   name:'Escudo de Ferro',   icon:'🛡️', type:'shield', price:70,  power:15, rarity:'common',   desc:'+15 DEF' },
  { id:'armadura_couro', name:'Armadura de Couro', icon:'🥋', type:'armor',  price:50,  power:8,  rarity:'common',   desc:'+8 DEF'  },
  { id:'armadura_ferro', name:'Armadura de Ferro', icon:'🛡️', type:'armor',  price:150, power:20, rarity:'uncommon', desc:'+20 DEF' },
  { id:'elmo_ferro',     name:'Elmo de Ferro',     icon:'⛑️', type:'helmet', price:60,  power:6,  rarity:'common',   desc:'+6 DEF'  },
  { id:'amuleto_forca',  name:'Amuleto da Força',  icon:'💪', type:'amulet', price:100, power:5,  rarity:'rare',     desc:'+5 FOR'  },
  { id:'bota_ligeireza', name:'Botas da Ligeireza',icon:'👢', type:'armor',  price:90,  power:0,  rarity:'uncommon', desc:'+10 DEX' },
  { id:'pao',            name:'Pão',                icon:'🍞', type:'food',   price:5,   power:20, rarity:'common',   desc:'+20 Fome' },
  { id:'carne',          name:'Carne Assada',       icon:'🍖', type:'food',   price:15,  power:50, rarity:'common',   desc:'+50 Fome' },
  { id:'sopa',           name:'Sopa do Aventureiro',icon:'🍲', type:'food',   price:25,  power:80, rarity:'uncommon', desc:'+80 Fome' },
  { id:'banquete',       name:'Banquete Real',      icon:'🍽️', type:'food',   price:60,  power:100,rarity:'rare',    desc:'+100 Fome' },
  { id:'pocao_hp',       name:'Poção de HP',        icon:'🧪', type:'potion', price:30,  power:30, rarity:'common',   desc:'+30 HP' },
  { id:'pocao_mana',     name:'Poção de Mana',      icon:'💙', type:'potion', price:25,  power:25, rarity:'common',   desc:'+25 Mana' },
  { id:'pocao_stamina',  name:'Poção de Stamina',   icon:'💚', type:'potion', price:20,  power:30, rarity:'common',   desc:'+30 Stamina' },
  { id:'pergaminho',     name:'Pergaminho de XP',   icon:'📜', type:'special',price:100, power:200,rarity:'rare',    desc:'+200 XP' },

  // ── Ferramentas de trabalho ──────────────────────────────────────
  // Antes esses itens eram exigidos pelos empregos (JOBS.needs) mas não
  // existiam em lugar nenhum pra comprar — 5 dos 7 empregos ficavam
  // permanentemente travados. Agora dá pra comprar todos aqui.
  { id:'picareta',       name:'Picareta',           icon:'⛏️', type:'material',price:120,  power:0, rarity:'common',   desc:'Ferramenta para trabalhar como Mineiro' },
  { id:'martelo',        name:'Martelo de Forja',   icon:'🔨', type:'material',price:280,  power:0, rarity:'uncommon', desc:'Ferramenta para trabalhar como Ferreiro' },
  { id:'balança',        name:'Balança Comercial',  icon:'⚖️', type:'material',price:450,  power:0, rarity:'uncommon', desc:'Ferramenta para trabalhar como Comerciante' },
  { id:'caldeirão',      name:'Caldeirão Arcano',   icon:'🍯', type:'material',price:800,  power:0, rarity:'rare',     desc:'Ferramenta para trabalhar como Alquimista' },
  { id:'traje_nobre',    name:'Traje Nobre',        icon:'🎽', type:'material',price:1500, power:0, rarity:'epic',     desc:'Traje necessário para trabalhar como Nobre' },
];

export const HOUSES = [
  { id:'cabana',   name:'Cabana Rústica',    icon:'🛖', buyPrice:500,  rentPrice:30, perDay:0,  size:'Pequena', desc:'Básica mas aconchegante' },
  { id:'casa',     name:'Casa do Vilarejo',  icon:'🏠', buyPrice:1500, rentPrice:80, perDay:5,  size:'Média',   desc:'Uma casa confortável' },
  { id:'chale',    name:'Chalé das Colinas', icon:'⛺', buyPrice:2500, rentPrice:120,perDay:10, size:'Média',   desc:'Vista panorâmica' },
  { id:'mansao',   name:'Mansão Nobre',      icon:'🏰', buyPrice:8000, rentPrice:300,perDay:30, size:'Grande',  desc:'Para nobres e ricos' },
  { id:'castelo',  name:'Castelo Crydan',    icon:'🏯', buyPrice:25000,rentPrice:800,perDay:80, size:'Enorme',  desc:'O ápice do luxo em Crydan' },
];

export const COMPANIES = [
  { id:'taverna',    name:'Taverna',          icon:'🍺', price:2000,  income:50,  staff:3,  desc:'Sirva bebidas e comidas' },
  { id:'ferraria',   name:'Ferraria',         icon:'⚒️', price:3500,  income:80,  staff:4,  desc:'Forje armas e armaduras' },
  { id:'farmacia',   name:'Farmácia Arcana',  icon:'⚗️', price:5000,  income:120, staff:3,  desc:'Venda poções e remédios' },
  { id:'mina',       name:'Mina de Cristal',  icon:'💎', price:8000,  income:200, staff:8,  desc:'Extraia recursos preciosos' },
  { id:'castelo_neg',name:'Empresa Comercial',icon:'🏦', price:15000, income:400, staff:12, desc:'Império comercial em Crydan' },
];

export const JOBS = [
  { id:'lavrador',  name:'Lavrador',      icon:'🌾', salary:20,  cooldown:3600, minLevel:1,  needs:[], desc:'Cuide dos campos' },
  { id:'mineiro',   name:'Mineiro',       icon:'⛏️', salary:35,  cooldown:3600, minLevel:3,  needs:['picareta'],    desc:'Mine recursos preciosos' },
  { id:'ferreiro',  name:'Ferreiro',      icon:'🔨', salary:50,  cooldown:3600, minLevel:6,  needs:['martelo'],     desc:'Forje equipamentos' },
  { id:'comerciante',name:'Comerciante',  icon:'🧑‍💼',salary:65,  cooldown:3600, minLevel:9,  needs:['balança'],     desc:'Compre e venda no mercado' },
  { id:'guarda',    name:'Guarda Real',   icon:'💂', salary:80,  cooldown:3600, minLevel:12, needs:['espada_ferro'],'desc':'Proteja o reino' },
  { id:'alquimista',name:'Alquimista',    icon:'⚗️', salary:100, cooldown:3600, minLevel:16, needs:['caldeirão'],   desc:'Crie poções e elixires' },
  { id:'nobre',     name:'Nobre',         icon:'👑', salary:150, cooldown:3600, minLevel:20, needs:['traje_nobre'],  desc:'Administre terras e recursos' },
];

export const QUESTS = [
  { id:'q1', name:'Primeira Aventura',    icon:'⚔️', desc:'Complete sua primeira batalha',      xp:50,  cry:20,  type:'battle',  target:1 },
  { id:'q2', name:'Coleta Inicial',       icon:'⛏️', desc:'Colete 5 materiais',                 xp:30,  cry:15,  type:'collect', target:5 },
  { id:'q3', name:'Comerciante Novato',   icon:'🛒', desc:'Compre um item na loja',             xp:25,  cry:10,  type:'buy',     target:1 },
  { id:'q4', name:'Poupador',             icon:'🏦', desc:'Deposite 100 Cry no banco',          xp:40,  cry:30,  type:'bank',    target:100 },
  { id:'q5', name:'Caçador de Monstros',  icon:'👹', desc:'Derrote 10 monstros',               xp:150, cry:80,  type:'battle',  target:10 },
  { id:'q6', name:'Guilda Nova',          icon:'🛡️', desc:'Entre ou crie uma guilda',           xp:100, cry:50,  type:'guild',   target:1 },
  { id:'q7', name:'Chefe de Fazenda',     icon:'🌾', desc:'Trabalhe 5 turnos de emprego',       xp:100, cry:60,  type:'work',    target:5 },
  { id:'q8', name:'Proprietário',         icon:'🏡', desc:'Compre ou alugue uma propriedade',   xp:200, cry:150, type:'house',   target:1 },
  { id:'q9', name:'Lendário',             icon:'⭐', desc:'Alcance o nível 20',                 xp:500, cry:300, type:'level',   target:20 },
  { id:'q10',name:'Casado!',              icon:'💍', desc:'Case-se com outro aventureiro',      xp:300, cry:200, type:'marry',   target:1 },
];

export const BOSSES = [
  { id:'dragao_antigo',  name:'Dragão Antigo',    icon:'🐲', level:20, hp:5000, xp:500, cry:300, desc:'O Terror dos Céus' },
  { id:'lich_rei',       name:'Lich Rei',          icon:'💀', level:30, hp:8000, xp:800, cry:500, desc:'Senhor dos Mortos' },
  { id:'golem_cristal',  name:'Golem de Cristal',  icon:'💎', level:15, hp:3000, xp:300, cry:200, desc:'Guardião do Cristal' },
  { id:'fenix',          name:'Fênix Negra',       icon:'🦅', level:35, hp:12000,xp:1200,cry:800, desc:'Ave da Destruição' },
  { id:'demonio',        name:'Arquidêmônio',      icon:'😈', level:50, hp:20000,xp:2000,cry:1500,desc:'O Fim de Crydan' },
];

export const ACHIEVEMENTS = [
  { id:'first_login',  name:'Bem-vindo!',          icon:'👋', desc:'Criou sua conta',                  pts:10,  cond:'always' },
  { id:'first_battle', name:'Primeiro Sangue',     icon:'⚔️', desc:'Venceu primeira batalha',          pts:20,  cond:'wins>=1' },
  { id:'lvl5',         name:'Aprendiz',            icon:'⭐', desc:'Alcançou nível 5',                 pts:30,  cond:'level>=5' },
  { id:'lvl10',        name:'Aventureiro',         icon:'🌟', desc:'Alcançou nível 10',                pts:50,  cond:'level>=10' },
  { id:'lvl25',        name:'Herói',               icon:'🦸', desc:'Alcançou nível 25',                pts:100, cond:'level>=25' },
  { id:'lvl50',        name:'Lenda Viva',          icon:'👑', desc:'Alcançou nível 50',                pts:250, cond:'level>=50' },
  { id:'rich',         name:'Rico',                icon:'💰', desc:'Acumulou 10.000 Cry',             pts:50,  cond:'totalCry>=10000' },
  { id:'very_rich',    name:'Milionário',           icon:'💎', desc:'Acumulou 100.000 Cry',            pts:200, cond:'totalCry>=100000' },
  { id:'married',      name:'Coração Partido',     icon:'💍', desc:'Se casou',                        pts:40,  cond:'married' },
  { id:'guild_member', name:'Membro de Guilda',    icon:'🛡️', desc:'Entrou em uma guilda',            pts:30,  cond:'guild' },
  { id:'home_owner',   name:'Dono da Casa',        icon:'🏡', desc:'Comprou um imóvel',               pts:50,  cond:'houses>=1' },
  { id:'boss_killer',  name:'Caçador de Chefes',   icon:'👹', desc:'Derrotou um boss',               pts:100, cond:'bossKills>=1' },
  { id:'collector',    name:'Colecionador',        icon:'🎒', desc:'Coletou 50 itens',               pts:40,  cond:'itemsCollected>=50' },
  { id:'worker',       name:'Trabalhador',         icon:'💼', desc:'Completou 20 turnos de trabalho', pts:60,  cond:'workTurns>=20' },
];

export const MAP_ZONES = [
  { icon:'🏘️', name:'Vilarejo',       danger:0  }, { icon:'🌿', name:'Floresta',    danger:1  }, { icon:'⛰️', name:'Montanhas',  danger:2  }, { icon:'🏜️', name:'Deserto',     danger:2  }, { icon:'❄️', name:'Tundra',       danger:3  },
  { icon:'🌊', name:'Costa',          danger:1  }, { icon:'🕍', name:'Ruínas',      danger:3  }, { icon:'🌋', name:'Vulcão',      danger:4  }, { icon:'🌊', name:'Pântano',     danger:2  }, { icon:'🏔️', name:'Pico Gelado',  danger:4  },
  { icon:'🌾', name:'Planície',       danger:0  }, { icon:'🏛️', name:'Templo',      danger:3  }, { icon:'💀', name:'Caverna',     danger:3  }, { icon:'🌸', name:'Vale Místico', danger:1  }, { icon:'🌑', name:'Abismo',       danger:5  },
  { icon:'🛡️', name:'Forte',         danger:0  }, { icon:'🌲', name:'Floresta Antiga',danger:3},{ icon:'🐉', name:'Ninho Dragão',danger:5  }, { icon:'⚔️', name:'Campo de Guerra',danger:4},{ icon:'🏰', name:'Castelo',      danger:2  },
  { icon:'🧙', name:'Torre do Mago',  danger:3  }, { icon:'🌀', name:'Portal Arcano',danger:4 }, { icon:'🎪', name:'Feira',       danger:0  }, { icon:'⛏️', name:'Mina Antiga',  danger:3  }, { icon:'👑', name:'Capital',       danger:0  },
];



export const AVATARS = ['⚔️','🔮','🏹','💚','🗡️','🛡️','🌿','💀','👑','🌟','🔥','❄️','⚡','🌙','☀️','🐉','🦅','🐺','🦁','🐻','🦊','🦋','🌸','💎','🏆'];

export const ACCENT_COLORS = ['#d4a017','#00d4ff','#9b59ff','#e74c3c','#27ae60','#e67e22','#ff6bcb','#5cd6d6','#4a90e2','#ff4757','#2ed573','#ffa502','#eccc68','#a4b0be','#ff6348','#7bed9f'];

// Paleta de cores de fundo do app (32 opções) — cada uma gera um tema completo (bg/bg2/bg3/bg4/bordas/texto)
export const BG_PALETTES = [
  { id:'default',   name:'Padrão (Crydan)', h:225, s:35, swatch:'#10141c' },
  { id:'onix',       name:'Ônix',            h:0,   s:0,  swatch:'#1a1a1a' },
  { id:'grafite',    name:'Grafite',         h:220, s:8,  swatch:'#20242c' },
  { id:'chumbo',     name:'Chumbo',          h:210, s:5,  swatch:'#23262b' },
  { id:'meianoite',  name:'Meia-noite',      h:225, s:45, swatch:'#141238' },
  { id:'marinho',    name:'Azul Marinho',    h:215, s:55, swatch:'#0c2540' },
  { id:'oceano',     name:'Oceano',          h:200, s:55, swatch:'#0a3548' },
  { id:'safira',     name:'Safira',          h:210, s:60, swatch:'#0c2f52' },
  { id:'indigo',     name:'Índigo',          h:245, s:50, swatch:'#221a4a' },
  { id:'violeta',    name:'Violeta',         h:260, s:45, swatch:'#291a44' },
  { id:'ametista',   name:'Ametista',        h:270, s:45, swatch:'#2c1a42' },
  { id:'roxoreal',   name:'Roxo Real',       h:280, s:50, swatch:'#301a48' },
  { id:'magenta',    name:'Magenta',         h:310, s:45, swatch:'#3a1633' },
  { id:'rosachoque', name:'Rosa Choque',     h:330, s:50, swatch:'#3c1428' },
  { id:'vinho',      name:'Vinho',           h:350, s:45, swatch:'#3a151d' },
  { id:'rubi',       name:'Rubi',            h:0,   s:50, swatch:'#3c1414' },
  { id:'carmesim',   name:'Carmesim',        h:5,   s:55, swatch:'#3e1512' },
  { id:'coral',      name:'Coral',           h:12,  s:55, swatch:'#3e1c10' },
  { id:'terracota',  name:'Terracota',       h:20,  s:45, swatch:'#3a2314' },
  { id:'ambar',      name:'Âmbar',           h:35,  s:45, swatch:'#382a10' },
  { id:'dourado',    name:'Dourado',         h:42,  s:45, swatch:'#362d0e' },
  { id:'mostarda',   name:'Mostarda',        h:48,  s:45, swatch:'#34300e' },
  { id:'oliva',      name:'Oliva',           h:65,  s:35, swatch:'#2c2e12' },
  { id:'lima',       name:'Lima',            h:85,  s:35, swatch:'#242e12' },
  { id:'musgo',      name:'Verde Musgo',     h:100, s:30, swatch:'#1e2a16' },
  { id:'floresta',   name:'Floresta',        h:135, s:35, swatch:'#122a1c' },
  { id:'esmeralda',  name:'Esmeralda',       h:150, s:40, swatch:'#0e2e20' },
  { id:'menta',      name:'Menta',           h:165, s:35, swatch:'#122c26' },
  { id:'turquesa',   name:'Turquesa',        h:178, s:40, swatch:'#0e2c2a' },
  { id:'ciano',      name:'Ciano',           h:190, s:45, swatch:'#0a2c34' },
  { id:'azulgelo',   name:'Azul Gelo',       h:200, s:35, swatch:'#16262e' },
  { id:'cobalto',    name:'Cobalto',         h:222, s:50, swatch:'#101c3c' },
  { id:'petroleo',   name:'Petróleo',        h:195, s:30, swatch:'#152428' },
];

// Opções de fonte para o corpo do texto do site
export const FONT_OPTIONS = [
  { id:'crimson',  name:'Crimson Pro (padrão)', css:"'Crimson Pro', serif" },
  { id:'inter',    name:'Inter',                css:"'Inter', sans-serif" },
  { id:'poppins',  name:'Poppins',              css:"'Poppins', sans-serif" },
  { id:'merri',    name:'Merriweather',         css:"'Merriweather', serif" },
  { id:'lora',     name:'Lora',                 css:"'Lora', serif" },
  { id:'nunito',   name:'Nunito',               css:"'Nunito', sans-serif" },
  { id:'montserrat', name:'Montserrat',         css:"'Montserrat', sans-serif" },
  { id:'robotoslab', name:'Roboto Slab',        css:"'Roboto Slab', serif" },
  { id:'playfair', name:'Playfair Display',     css:"'Playfair Display', serif" },
  { id:'spacegrotesk', name:'Space Grotesk',    css:"'Space Grotesk', sans-serif" },
  { id:'garamond', name:'EB Garamond',          css:"'EB Garamond', serif" },
];

export const BANNER_PRESETS = [
  { id:'roxo',   css:'linear-gradient(135deg, #1a1030 0%, #2a1550 100%)' },
  { id:'dourado',css:'linear-gradient(135deg, #3a2a05 0%, #7a5c00 100%)' },
  { id:'cyan',   css:'linear-gradient(135deg, #05202a 0%, #0a4a5a 100%)' },
  { id:'verde',  css:'linear-gradient(135deg, #0a2a15 0%, #1a5a30 100%)' },
  { id:'vermelho',css:'linear-gradient(135deg, #2a0a0a 0%, #5a1a1a 100%)' },
  { id:'noite',  css:'linear-gradient(135deg, #05060a 0%, #10141c 100%)' },
];

export const AVATAR_FRAMES_SPECIAL = [
  { id:'none',     name:'Nenhuma',              icon:'⭕', cost:0, minLevel:1, cat:'basicas' },
  { id:'dourado',  name:'Anel Dourado',         icon:'🟡', cost:0, minLevel:1, cat:'basicas', particles:'dourada' },
  { id:'gelo',     name:'Gelo Eterno',          icon:'❄️', cost:0, minLevel:1, cat:'elementais', particles:'gelo' },
  { id:'arcano',   name:'Runas Arcanas',        icon:'🔮', cost:0, minLevel:1, cat:'misticas', particles:'arcana' },
  { id:'sombrio',  name:'Sombrio',              icon:'🌑', cost:0, minLevel:1, cat:'misticas', particles:'sombria' },
  { id:'arcoiris', name:'Prisma',               icon:'🌈', cost:0, minLevel:1, cat:'especiais', particles:'prisma' },
  { id:'dragao',   name:'Fúria do Dragão',      icon:'🐉', cost:0, minLevel:1, cat:'lendarias', svg:true, particles:'brasa' },
  { id:'orelhas',  name:'Orelhas Felinas',      icon:'🐱', cost:0, minLevel:1, cat:'criaturas' },
  { id:'presas',   name:'Presas Ancestrais',    icon:'🦷', cost:0, minLevel:1, cat:'criaturas' },
  { id:'pelagem',  name:'Pelagem Selvagem',     icon:'🐺', cost:0, minLevel:1, cat:'criaturas' },
  { id:'lasso',    name:'Laço Encantado',       icon:'🪢', cost:0, minLevel:1, cat:'especiais' },
  { id:'lua',      name:'Lua Crescente',        icon:'🌙', cost:0, minLevel:1, cat:'elementais', particles:'estelar' },
  { id:'cometa',   name:'Chuva de Estrelas',    icon:'☄️', cost:0, minLevel:1, cat:'elementais', particles:'estelar' },
  { id:'coracao',  name:'Corações Flutuantes',  icon:'💗', cost:0, minLevel:1, cat:'especiais', particles:'prisma' },
  { id:'eletrico', name:'Anel Elétrico',        icon:'⚡', cost:0, minLevel:1, cat:'elementais', particles:'eletrica' },
  { id:'fenix',    name:'Asas de Fênix',        icon:'🔥', cost:0, minLevel:1, cat:'lendarias', particles:'brasa' },
  { id:'galaxia',  name:'Campo Estelar',        icon:'🌌', cost:0, minLevel:1, cat:'misticas', particles:'estelar' },
  { id:'tempestade',name:'Coração da Tempestade',icon:'🌩️', cost:0, minLevel:1, cat:'elementais', particles:'eletrica' },
  { id:'anjo',     name:'Plumas Celestiais',    icon:'😇', cost:0, minLevel:1, cat:'lendarias', particles:'celeste' },
  { id:'realeza',  name:'Coroa Real',           icon:'👑', cost:0, minLevel:1, cat:'especiais', particles:'dourada' },
  { id:'oceano',   name:'Marés Profundas',      icon:'🌊', cost:0, minLevel:1, cat:'elementais', particles:'gelo' },
  { id:'vampiro',  name:'Sangue Ancestral',     icon:'🩸', cost:0, minLevel:1, cat:'criaturas', particles:'sombria' },
  { id:'floresta', name:'Videiras Vivas',       icon:'🌿', cost:0, minLevel:1, cat:'criaturas', particles:'venenosa' },
  { id:'fantasma', name:'Sussurro Espectral',   icon:'👻', cost:0, minLevel:1, cat:'misticas', particles:'espectral' },
  { id:'vazio',    name:'Portal do Vazio',      icon:'🕳️', cost:0, minLevel:1, cat:'misticas', particles:'espectral' },
  { id:'cristal',  name:'Cristais Vivos',       icon:'💎', cost:0, minLevel:1, cat:'especiais', particles:'prisma' },
  { id:'nebulosa', name:'Nebulosa Cósmica',     icon:'🪐', cost:0, minLevel:1, cat:'misticas', particles:'estelar' },
  { id:'veneno',   name:'Névoa Tóxica',         icon:'☠️', cost:0, minLevel:1, cat:'criaturas', particles:'venenosa' },
];

export const AVATAR_FRAMES_PREMIUM = [
  { id:'auraestelar',   name:'Aura Estelar ✦ novo',   particles:'estelar',   cat:'lendarias' },
  { id:'auravulcanica', name:'Aura Vulcânica ✦ novo', particles:'vulcanica', cat:'elementais' },
  { id:'auraespectral', name:'Aura Espectral ✦ novo', particles:'espectral', cat:'misticas' },
  { id:'auragelo',      name:'Aura de Gelo ✦ novo',   particles:'gelo',      cat:'elementais' },
  { id:'auradourada',   name:'Aura Dourada ✦ novo',   particles:'dourada',   cat:'lendarias' },
  { id:'aurasombria',   name:'Aura Sombria ✦ novo',   particles:'sombria',   cat:'misticas' },
  // Recompensas visuais de conquista — só desbloqueiam jogando, nunca à venda.
  { id:'coroalendaria',   name:'Coroa Lendária 👑',      particles:'dourada',   cat:'lendarias', reqAch:'lvl50' },
  { id:'auramilionaria',  name:'Aura do Milionário 💎',  particles:'estelar',   cat:'lendarias', reqAch:'very_rich' },
  { id:'marcacacador',    name:'Marca do Caçador 👹',    particles:'vulcanica', cat:'especiais', reqAch:'boss_killer' },
  // Loja Sazonal — só ficam disponíveis durante o mês certo do ano, e
  // voltam a ficar bloqueadas depois. Sem precisar de nada no servidor:
  // o mês atual do calendário decide sozinho o que está "na estação".
  { id:'invernoeterno',  name:'Manto de Inverno ❄️',    particles:'gelo',      cat:'elementais', seasonal:true, activeMonths:[11,0,1] },
  { id:'chamasverao',    name:'Chamas de Verão 🔥',     particles:'vulcanica', cat:'elementais', seasonal:true, activeMonths:[5,6,7] },
  { id:'florprimavera',  name:'Flor da Primavera 🌸',   particles:'espectral', cat:'misticas',   seasonal:true, activeMonths:[2,3,4] },
  { id:'colheitaoutono', name:'Colheita de Outono 🍂',  particles:'dourada',   cat:'lendarias',  seasonal:true, activeMonths:[8,9,10] },
];

export const AVATAR_FRAME_RING_CUSTOM = { id:'ring_custom', name:'Anel Personalizado', icon:'🎨', cost:0, minLevel:1, cat:'basicas', customColor:true };
export const AVATAR_FRAME_CUSTOM_IMAGE = { id:'custom_image', name:'Minha Decoração (imagem/GIF)', icon:'🖼️', cost:0, minLevel:1, cat:'basicas', customImage:true };

// As mais de 100 molduras antigas (variações de 8 modelos genéricos só
// trocando cor/emoji) foram removidas — ficaram as 28 molduras clássicas
// desenhadas à mão (CSS único por moldura) + 6 molduras novas com
// partículas reais via tsParticles (a mesma tecnologia usada nos banners).
export const AVATAR_FRAMES = [...AVATAR_FRAMES_SPECIAL, AVATAR_FRAME_RING_CUSTOM, ...AVATAR_FRAMES_PREMIUM]
  .map(f => ({ cost: 0, minLevel: 1, ...f }));

export const FRAME_CATEGORIES = [
  { id:'todas',      name:'Todas' },
  { id:'basicas',    name:'Básicas' },
  { id:'natureza',   name:'Natureza' },
  { id:'clima',      name:'Clima' },
  { id:'elementais', name:'Elementais' },
  { id:'misticas',   name:'Místicas' },
  { id:'criaturas',  name:'Criaturas' },
  { id:'especiais',  name:'Especiais' },
  { id:'lendarias',  name:'Lendárias' },
  { id:'lottie',     name:'✨ Lottie' },
];

export const DRAGON_FRAME_SVG = `
<svg viewBox="-30 -30 260 260" class="dragon-frame-svg" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="dragonGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#ffb15e"/>
      <stop offset="50%" stop-color="#e8432b"/>
      <stop offset="100%" stop-color="#7a1010"/>
    </linearGradient>
    <radialGradient id="dragonFireGrad" cx="50%" cy="30%" r="70%">
      <stop offset="0%" stop-color="#fff45c"/>
      <stop offset="45%" stop-color="#ff8a1a"/>
      <stop offset="100%" stop-color="rgba(255,60,0,0)"/>
    </radialGradient>
  </defs>
  <g class="dragon-orbit">
    <!-- corpo enrolado com escamas -->
    <circle cx="100" cy="100" r="76" fill="none" stroke="url(#dragonGrad)" stroke-width="11" stroke-linecap="round" stroke-dasharray="400 78" transform="rotate(-70 100 100)"/>
    <circle cx="100" cy="100" r="76" fill="none" stroke="rgba(0,0,0,0.35)" stroke-width="11" stroke-dasharray="3 10" stroke-linecap="round" transform="rotate(-70 100 100)"/>
    <!-- espinhos ao longo do dorso -->
    <g fill="#ffcf8a">
      <polygon points="100,8 94,20 106,20" transform="rotate(10 100 100)"/>
      <polygon points="100,8 94,20 106,20" transform="rotate(45 100 100)"/>
      <polygon points="100,8 94,20 106,20" transform="rotate(80 100 100)"/>
      <polygon points="100,8 94,20 106,20" transform="rotate(115 100 100)"/>
      <polygon points="100,8 94,20 106,20" transform="rotate(150 100 100)"/>
      <polygon points="100,8 94,20 106,20" transform="rotate(185 100 100)"/>
      <polygon points="100,8 94,20 106,20" transform="rotate(-30 100 100)"/>
    </g>
    <!-- asa esquerda -->
    <g transform="translate(30,62) rotate(-10)">
      <g class="dragon-wing-flap">
        <path d="M0,0 C-25,-10 -45,5 -55,-15 C-40,10 -35,25 -50,30 C-30,25 -15,30 0,45 C5,25 5,10 0,0 Z" fill="url(#dragonGrad)" opacity="0.94"/>
      </g>
    </g>
    <!-- asa direita -->
    <g transform="translate(170,62) scale(-1,1) rotate(-10)">
      <g class="dragon-wing-flap dragon-wing-flap-r">
        <path d="M0,0 C-25,-10 -45,5 -55,-15 C-40,10 -35,25 -50,30 C-30,25 -15,30 0,45 C5,25 5,10 0,0 Z" fill="url(#dragonGrad)" opacity="0.94"/>
      </g>
    </g>
    <!-- cabeça -->
    <g class="dragon-head" transform="translate(100,6)">
      <polygon points="-16,14 0,-12 16,14 0,6" fill="url(#dragonGrad)"/>
      <polygon points="-10,-8 -5,-20 0,-8" fill="#ffcf8a"/>
      <polygon points="10,-8 5,-20 0,-8" fill="#ffcf8a"/>
      <circle class="dragon-eye" cx="-5" cy="3" r="2" fill="#fff45c"/>
      <circle class="dragon-eye" cx="5" cy="3" r="2" fill="#fff45c"/>
      <g class="dragon-jaw-hinge" transform="translate(0,11)">
        <path d="M-10,0 Q0,10 10,0 Q0,4 -10,0 Z" fill="#c23a1a"/>
      </g>
      <ellipse class="dragon-fire" cx="0" cy="24" rx="9" ry="15" fill="url(#dragonFireGrad)"/>
    </g>
  </g>
</svg>`;

export const BANNER_DRAGON_SVG = `
<svg viewBox="0 0 120 60" class="banner-dragon-flyby" xmlns="http://www.w3.org/2000/svg">
  <ellipse cx="58" cy="30" rx="26" ry="9" fill="#2b2b30"/>
  <polygon points="82,30 108,18 96,30 108,42" fill="#2b2b30"/>
  <polygon points="34,30 8,14 22,30 8,46" fill="#2b2b30"/>
  <g class="wing-flap">
    <path d="M50,22 Q28,-6 2,10 Q28,14 40,28 Z" fill="#1c1c1f"/>
  </g>
</svg>`;

export const BANNER_ANIMS = [
  { id:'none',       name:'Estático' },
  { id:'brilho',     name:'Brilho Suave' },
  { id:'particulas', name:'Partículas' },
  { id:'gradiente',  name:'Gradiente Vivo' },
  { id:'aurora',     name:'Aurora' },
  { id:'chuva',      name:'Chuva' },
  { id:'neve',       name:'Neve' },
  { id:'raios',      name:'Raios' },
  { id:'nebulosa',   name:'Nebulosa' },
  { id:'dragao',     name:'Dragão Sobrevoando' },
  { id:'luasangrenta',    name:'Lua Sangrenta' },
  { id:'brasassubindo',   name:'Brasas Subindo' },
  { id:'neblina',         name:'Névoa Deslizante' },
  { id:'constelacao',     name:'Constelação' },
  { id:'relampagoroxo',   name:'Relâmpago Arcano' },
  { id:'vagalumes',       name:'Vaga-lumes ✦ novo' },
];

export const LINK_PLATFORMS = [
  { id:'instagram', name:'Instagram', icon:'📸', base:'https://instagram.com/',  placeholder:'seu_usuario' },
  { id:'github',    name:'GitHub',    icon:'💻', base:'https://github.com/',     placeholder:'seu_usuario' },
  { id:'youtube',   name:'YouTube',   icon:'▶️', base:'https://youtube.com/@',   placeholder:'seucanal' },
  { id:'twitch',    name:'Twitch',    icon:'🟣', base:'https://twitch.tv/',      placeholder:'seu_usuario' },
  { id:'tiktok',    name:'TikTok',    icon:'🎵', base:'https://tiktok.com/@',    placeholder:'seu_usuario' },
  { id:'discord',   name:'Discord',   icon:'🎮', base:'',                        placeholder:'usuario ou link de convite' },
  { id:'site',      name:'Site / Outro', icon:'🌐', base:'',                     placeholder:'https://seusite.com' },
];

export const EVENTS_DATA = [
  { id:'ev1', name:'Festival de Crydan',   icon:'🎊', desc:'2x XP durante 24h',       active:true,  bonus:'2x XP' },
  { id:'ev2', name:'Feira de Comércio',    icon:'🛒', desc:'20% de desconto na loja',  active:false, bonus:'-20% Loja' },
  { id:'ev3', name:'Invasão de Goblins',   icon:'👺', desc:'Derrote goblins por bônus', active:true,  bonus:'+50% Drop' },
  { id:'ev4', name:'Lua Sangrenta',        icon:'🌕', desc:'Monstros mais fortes = mais XP', active:false, bonus:'3x Boss XP' },
];

// ══════════════════════════════════════════
//   ÍCONES SVG (substituem emoji na navegação)
// ══════════════════════════════════════════
export const ICONS = {
  inicio: '<path d="M3.5 11 12 4l8.5 7"/><path d="M6 9.5V19a1 1 0 0 0 1 1h3v-5.5h4V20h3a1 1 0 0 0 1-1V9.5"/>',
  perfil: '<circle cx="12" cy="8.2" r="3.4"/><path d="M5 20c0-4 3.1-7 7-7s7 3 7 7"/>',
  meupersonagem: '<path d="M4 5.2A1.2 1.2 0 0 1 5.2 4H12v16H5.2A1.2 1.2 0 0 1 4 18.8z"/><path d="M20 5.2A1.2 1.2 0 0 0 18.8 4H12v16h6.8a1.2 1.2 0 0 0 1.2-1.2z"/>',
  inventario: '<path d="M8 8V6.5a4 4 0 0 1 8 0V8"/><rect x="5" y="8" width="14" height="12" rx="2"/><path d="M9.5 12.5h5"/>',
  galeria: '<rect x="3.5" y="4.5" width="17" height="15" rx="2"/><circle cx="9" cy="10" r="1.6"/><path d="M4.5 17.5 9 13l3.5 3.5 3-3 4 4"/>',
  conquistas: '<path d="M7 4h10v4.5a5 5 0 0 1-10 0z"/><path d="M7 5H4.5A2.5 2.5 0 0 0 7 9.5"/><path d="M17 5h2.5A2.5 2.5 0 0 1 17 9.5"/><path d="M12 13v3"/><path d="M9.3 20h5.4l-.6-3H9.9z"/>',
  batalha: '<path d="M19.5 4.5 9 15l-1.5 4-3-3 4-1.5L19.5 4.5z"/><path d="M16.5 4.5h3v3"/><path d="M4.5 19.5 7 17"/>',
  missoes: '<path d="M6 3.5h9.5A2.5 2.5 0 0 1 18 6v14.5H8A2.5 2.5 0 0 1 5.5 18V4.5A1 1 0 0 1 6 3.5z"/><path d="M8.5 8h6"/><path d="M8.5 11.5h6"/><path d="M8.5 15h4"/>',
  guildas: '<path d="M12 3.5 19 6v5.5c0 4.3-3 7.7-7 9-4-1.3-7-4.7-7-9V6z"/>',
  boss: '<path d="M12 4a6.5 6.5 0 0 0-6.5 6.5c0 2.2 1 3.6 2 4.8V17h2v-1.6c.6.2 1.2.3 1.9.3v1.3h1.2v-1.3c.7 0 1.3-.1 1.9-.3V17h2v-1.7c1-1.2 2-2.6 2-4.8A6.5 6.5 0 0 0 12 4z"/><circle cx="9.5" cy="10" r="1"/><circle cx="14.5" cy="10" r="1"/>',
  mapa: '<path d="M9 4.5 4.5 6v13L9 17.5l6 2 4.5-1.5v-13L15 6.5 9 4.5z"/><path d="M9 4.5v13"/><path d="M15 6.5v13"/>',
  coleta: '<path d="M4 12c4-6 12-8 16-6-2 4-6 9-12 10z"/><path d="M9 15l-5 5"/>',
  banco: '<path d="M4 10 12 4l8 6"/><path d="M5 10v9M9 10v9M15 10v9M19 10v9"/><path d="M4 19h16"/>',
  mercado: '<circle cx="9.5" cy="19" r="1.3"/><circle cx="17" cy="19" r="1.3"/><path d="M4 4.5h2l1.8 10.4a1.5 1.5 0 0 0 1.5 1.3h8.4a1.5 1.5 0 0 0 1.5-1.2L21 8.5H7"/>',
  casas: '<path d="M4 11 12 4.5 20 11"/><path d="M6 10v9.5h12V10"/><path d="M10 19.5v-5h4v5"/>',
  empresas: '<rect x="5" y="3.5" width="8" height="17"/><rect x="13" y="9" width="6" height="11.5"/><path d="M7.5 7h1M10.5 7h1M7.5 10.5h1M10.5 10.5h1M7.5 14h1M10.5 14h1"/>',
  empregos: '<rect x="3.5" y="8" width="17" height="11" rx="1.5"/><path d="M8.5 8V6a2 2 0 0 1 2-2h3a2 2 0 0 1 2 2v2"/><path d="M3.5 13h17"/>',
  conversas: '<path d="M4 6.2A1.7 1.7 0 0 1 5.7 4.5h12.6A1.7 1.7 0 0 1 20 6.2v8.6a1.7 1.7 0 0 1-1.7 1.7H9.2L5 20v-3.5H5.7A1.7 1.7 0 0 1 4 14.8z"/>',
  amigos: '<circle cx="8.5" cy="9" r="2.6"/><circle cx="16" cy="9.5" r="2.2"/><path d="M3.5 19c0-3 2.2-5.2 5-5.2s5 2.2 5 5.2"/><path d="M14.3 14.2c1.9.4 3.7 2.1 3.7 4.8"/>',
  publicacoes: '<rect x="4" y="4.5" width="16" height="15" rx="1.5"/><path d="M7.5 8.5h9M7.5 12h9M7.5 15.5h5.5"/>',
  casamento: '<circle cx="8.5" cy="14" r="4"/><circle cx="15.5" cy="14" r="4"/><path d="M12 5l-1.6 3.2h3.2z"/>',
  ranking: '<path d="M5 20V11"/><path d="M12 20V6"/><path d="M19 20v-7"/><path d="M3.5 20h17"/>',
  eventos: '<path d="M12 3.5 13.6 8.3 18.7 8.3 14.5 11.2 16.1 16 12 13.1 7.9 16 9.5 11.2 5.3 8.3 10.4 8.3z"/>',
  musicas: '<path d="M9 17V5.5l10-2v11"/><circle cx="7" cy="18" r="2.2"/><circle cx="17" cy="15.5" r="2.2"/>',
  jogos: '<rect x="3" y="8.5" width="18" height="9" rx="4"/><path d="M7.5 11v4M5.5 13h4"/><circle cx="15.3" cy="11.5" r="1"/><circle cx="17.8" cy="14" r="1"/>',
  iacompanheira: '<rect x="5" y="8" width="14" height="10" rx="2.5"/><circle cx="9.5" cy="13" r="1.3"/><circle cx="14.5" cy="13" r="1.3"/><path d="M12 8V5"/><circle cx="12" cy="4" r="1"/>',
  feedback: '<rect x="3.5" y="5.5" width="17" height="13" rx="1.5"/><path d="M4 6.5l8 6.5 8-6.5"/>',
  config: '<circle cx="12" cy="12" r="3"/><path d="M12 3.5v2.3M12 18.2v2.3M20.5 12h-2.3M5.8 12H3.5M17.8 6.2l-1.6 1.6M7.8 16.2l-1.6 1.6M17.8 17.8l-1.6-1.6M7.8 7.8 6.2 6.2"/>',
  ferramentas: '<path d="M14.7 6.3a3.5 3.5 0 0 0-4.9 4.2L4.5 15.8l1.7 1.7 5.3-5.3a3.5 3.5 0 0 0 4.2-4.9l-2 2-1.7-1.7z"/>',
  logs: '<rect x="4.5" y="3.5" width="15" height="17" rx="1.5"/><path d="M8 8h8M8 12h8M8 16h5"/>',
  bell: '<path d="M6 10.5a6 6 0 0 1 12 0c0 4 1.3 5.3 1.8 5.8a.6.6 0 0 1-.4 1H4.6a.6.6 0 0 1-.4-1c.5-.5 1.8-1.8 1.8-5.8z"/><path d="M9.5 18.5a2.5 2.5 0 0 0 5 0"/>',
  moedas: '<ellipse cx="9" cy="7" rx="5.5" ry="2.3"/><path d="M3.5 7v4c0 1.3 2.5 2.3 5.5 2.3s5.5-1 5.5-2.3V7"/><path d="M3.5 11v4c0 1.3 2.5 2.3 5.5 2.3s5.5-1 5.5-2.3v-4"/><circle cx="16.5" cy="16" r="4"/><path d="M16.5 14v4M15 16h3"/>',
  pipoca: '<path d="M8 9 6.8 20h10.4L16 9z"/><path d="M9.5 9c-1.5-1-1.5-3.3.2-4 1.3-.5 1.8.6 1.8 1.4 0-1.4 1-2.7 2.3-2.1 1.5.7 1.2 2.7 0 3.7"/><path d="M10 12v6M12 12v6M14 12v6"/>',
};
