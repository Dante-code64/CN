// src/games/data.js
// Dados dos mini-jogos (jogo da velha, termo, forca, quiz, memória, etc).
// Igual o src/rpg/data.js: são só fichas de regra/conteúdo fixo, sem
// nenhuma função "viva" misturada — por isso são seguras de mover.

export const GAMES_LIST = [
  { id:'velha',    name:'Jogo da Velha',        icon:'❌', desc:'Contra a IA ou 2 jogadores' },
  { id:'termo',    name:'Termo',                icon:'🟩', desc:'Adivinhe a palavra de 5 letras' },
  { id:'forca',    name:'Forca',                icon:'🪢', desc:'Adivinhe letra por letra' },
  { id:'quiz',     name:'Quiz Crydan',          icon:'❓', desc:'Teste seus conhecimentos' },
  { id:'conecta4', name:'Conecta 4',            icon:'🔴', desc:'Contra a IA ou 2 jogadores' },
  { id:'memoria',  name:'Jogo da Memória',      icon:'🃏', desc:'Encontre todos os pares' },
  { id:'ppt',      name:'Pedra, Papel, Tesoura',icon:'✂️', desc:'Contra a IA' },
  { id:'numero',   name:'Adivinhe o Número',    icon:'🔢', desc:'Descubra o número secreto' },
  { id:'2048',     name:'2048',                 icon:'🎯', desc:'Junte os blocos (use as setas)' },
  { id:'simon',    name:'Sequência Genius',     icon:'🎵', desc:'Repita a sequência de cores' },
  { id:'xadrez',   name:'Xadrez',               icon:'♟️', desc:'2 jogadores (regras simplificadas)' },
  { id:'damas',    name:'Damas',                icon:'⚫', desc:'2 jogadores' },
  { id:'dados',    name:'Rolar Dados',           icon:'🎲', desc:'Dados 3D — role de 1 a 4 dados' },
];

export const BOT_DIFFICULTIES = {
  facil:      { label: '🙂 Fácil',      randomChance: 0.75 },
  medio:      { label: '😐 Médio',      randomChance: 0.40 },
  dificil:    { label: '😈 Difícil',    randomChance: 0.12 },
  impossivel: { label: '💀 Impossível', randomChance: 0 },
};

export const TERMO_WORDS = ['PEDRA','TERRA','CAMPO','NORTE','LIVRO','PORTA','CARTA','FESTA','NOITE','PRATO','FILME','MOEDA','TIGRE','DUQUE','BRAVO','CALDO','FRUTA','VERDE','PONTE','FONTE','TORRE','REINO','MAGIA','PLACA','TRAVE','PRAIA','CHUVA','NUVEM','BOLSA','CALOR'];

export const FORCA_WORDS = ['DRAGAO','ESPADA','CASTELO','GUERREIRO','POCAO','TESOURO','FLORESTA','CAVALEIRO','MAGIA','ESCUDO','TAVERNA','ARMADURA','FEITICO','MASMORRA'];

export const HANGMAN_STAGES = ['🙂','😕','😟','😨','😰','💀','☠️'];

export const QUIZ_QUESTIONS = [
  { q:'Qual é o maior planeta do sistema solar?', options:['Terra','Júpiter','Marte','Vênus'], a:1 },
  { q:'Quantos lados tem um hexágono?', options:['5','6','7','8'], a:1 },
  { q:'Qual é o oceano mais profundo?', options:['Atlântico','Índico','Pacífico','Ártico'], a:2 },
  { q:'Quem pintou a Mona Lisa?', options:['Van Gogh','Picasso','Da Vinci','Monet'], a:2 },
  { q:'Qual é o metal líquido à temperatura ambiente?', options:['Ferro','Mercúrio','Chumbo','Ouro'], a:1 },
  { q:'Quantos ossos tem o corpo humano adulto?', options:['186','206','226','246'], a:1 },
  { q:'Qual é a capital da Austrália?', options:['Sydney','Melbourne','Canberra','Perth'], a:2 },
  { q:'Qual desses animais é um mamífero?', options:['Tubarão','Golfinho','Polvo','Estrela-do-mar'], a:1 },
  { q:'Em que ano começou a Segunda Guerra Mundial?', options:['1935','1939','1941','1945'], a:1 },
  { q:'Qual é o rio mais longo do mundo?', options:['Nilo','Amazonas','Yangtzé','Mississippi'], a:1 },
  { q:'Quantas cordas tem um violão comum?', options:['4','5','6','7'], a:2 },
  { q:'Qual gás as plantas absorvem no ar?', options:['Oxigênio','Nitrogênio','Gás Carbônico','Hidrogênio'], a:2 },
  { q:'Qual é o menor país do mundo?', options:['Mônaco','Vaticano','San Marino','Liechtenstein'], a:1 },
  { q:'Quantos minutos tem um dia?', options:['1240','1380','1440','1500'], a:2 },
  { q:'Qual desses é um número primo?', options:['9','15','17','21'], a:2 },
];

export const MEMORY_EMOJIS = ['🐉','⚔️','🛡️','🏰','🔮','💰','🗝️','⭐'];

export const SIMON_COLORS = [{c:'#e74c3c',name:'vermelho'},{c:'#27ae60',name:'verde'},{c:'#3498db',name:'azul'},{c:'#f1c40f',name:'amarelo'}];

