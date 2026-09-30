// Masque de Sunraku (Shangri-La Frontier) : buste d'expo, tête d'oiseau, bec jaune, crête, collerette de plumes.
// Calques : 11 colonnes (x, 0..10, centre = 5) x 14 rangées (y, 0 = pointe du bec, 4 = face, 12 = nuque).
(function(){
const { slope, tileLayers } = LEGO;

const HEAD_COLORS = [
  {value:'azure',    label:'Bleu azur (masque 3D)',        accent:'dkazure'},
  {value:'dkazure',  label:'Azur foncé',                   accent:'dkblue'},
  {value:'sandblue', label:'Bleu sable (couleur de l\'anime)', accent:'dkgrey'},
  {value:'blue',     label:'Bleu',                         accent:'dkblue'},
];

const E = '...........';
// B = tête, D = plumes foncées, Y = bec, W = blanc, R = yeux, K = socle
const LAYERS = [
  {k:0, name:'Le socle', rows:[E,E,E,E,
    '..KKKKKKK..','..KKKKKKK..','..KKKKKKK..','..KKKKKKK..','..KKKKKKK..','..KKKKKKK..','..KKKKKKK..','..KKKKKKK..', E,E]},
  {k:1, name:'Collerette — le bas', rows:[E,E,
    '..B..B..B..','.BBB.B.BBB.','BBBBBBBBBBB','.BBBBBBBBB.','BBBBBBBBBBB','.BBBBBBBBB.',
    'BBBBBBBBBBB','.BBBBBBBBB.','BBBBBBBBBBB','.BBBBBBBBB.','..B.BBB.B..', E]},
  {k:2, name:'Collerette — les plumes', rows:[E,E,E,
    '..D..B..D..','DBBBBBBBBBD','.BBBBBBBBB.','DBBBBBBBBBD','.BBBBBBBBB.',
    'DBBBBBBBBBD','.BBBBBBBBB.','DBBBBBBBBBD','.DBBBBBBBD.','..D.D.D.D..', E]},
  {k:3, name:'Le cou', rows:[
    '.....Y.....',E,E,E,
    '....DDD....','...BBBBB...','..BBBBBBB..','..BBBBBBB..','..BBBBBBB..','..BBBBBBB..','..BBBBBBB..','...BBBBB...', E,E]},
  {k:4, name:'Les joues', rows:[
    '.....Y.....','.....Y.....',E,E,
    '...BBBBB...','..BBBBBBB..','.BBBBBBBBB.','.BBBBBBBBB.','.BBBBBBBBB.','.BBBBBBBBB.','.BBBBBBBBB.','..BBBBBBB..','...BBBBB...', E]},
  {k:5, name:'Sous les yeux', rows:[
    '.....Y.....','....YYY....','....YYY....','....YYY....',
    '...BBBBB...','..BBBBBBB..','.BBBBBBBBB.','.BBBBBBBBB.','.BBBBBBBBB.','.BBBBBBBBB.','.BBBBBBBBB.','..BBBBBBB..','...BBBBB...', E]},
  {k:6, name:'Les yeux', rows:[
    '....YYY....','....YYY....','....YYY....','....YYY....',
    '...RYYYR...','..WBBBBBW..','.BBBBBBBBB.','.BBBBBBBBB.','.BBBBBBBBB.','.BBBBBBBBB.','.BBBBBBBBB.','..BBBBBBB..','...BBBBB...', E]},
  {k:7, name:'Les sourcils', rows:[
    E,E,'....YYY....','....YYY....',
    '...WYYYW...','..BBBBBBB..','.BBBBBBBBB.','.BBBBBBBBB.','.BBBBBBBBB.','.BBBBBBBBB.','.BBBBBBBBB.','..BBBBBBB..','...BBBBB...', E]},
  {k:8, name:'Le front', rows:[
    E,E,E,E,
    '...BWBWB...','..BBBBBBB..','.BBBBBBBBB.','.BBBBBBBBB.','.BBBBBBBBB.','.BBBBBBBBB.','.BBBBBBBBB.','..BBBBBBB..','...BBBBB...', E]},
  {k:9, name:'Le haut de la tête', rows:[
    E,E,E,E,E,
    '...BBBBB...','..BBBBBBB..','..BBBBBBB..','..BBBBBBB..','..BBBBBBB..','..BBBBBBB..','..BBBBBBB..','...BBBBB...', E]},
  {k:10, name:'Le crâne', rows:[
    E,E,E,E,E,E,
    '....BBB....','...BBBBB...','...BBBBB...','...BBBBB...','...BBBBB...','...BBBBB...','....BBB....', E]},
  {k:11, name:'La crête', rows:[
    E,E,E,E,E,E,E,E,
    '....BDB....','....BDB....','....BDB....','....BDB....','.....B.....', E]},
  {k:12, name:'La crête — 2', rows:[
    E,E,E,E,E,E,E,E,E,
    '.....B.....','....BDB....','....BDB....','.....B.....','.....B.....']},
  {k:13, name:'La pointe de la crête', rows:[
    E,E,E,E,E,E,E,E,E,E,E,
    '.....D.....','.....B.....','.....B.....']},
];

// le bec : pièces des couches 3 à 5 devant le visage (rangées 0-3), construites comme un sous-ensemble
const isBeakTip = p => p.layer <= 5 && p.y <= 3;

const TEXT = {
  0:`Un bloc de <b>briques noires</b> de 7x8 tenons : le socle.`,
  1:`La collerette déborde de 2 tenons tout autour du socle, avec des pointes de plumes devant et derrière. Les briques du bord doivent toujours s'appuyer en partie sur le socle.`,
  2:`2ᵉ rang de plumes : les <b>briques foncées</b> sur les bords font des mèches, comme dans l'anime.`,
  3:`Le cou, plus étroit, avec 3 plumes foncées sous le futur bec.`,
  4:`Les joues : la tête s'élargit à 9 tenons.`,
  5:`Même largeur. Ne pose pas encore les pièces jaunes de devant : elles font partie du bec (étape suivante).`,
  6:`La face : le <b>bec</b> (3 tenons de large) sort du visage, un <b>œil rouge</b> de chaque côté sur la face avant, et une touche de <b>blanc</b> sur le côté de chaque œil.`,
  7:`Les <b>sourcils blancs</b> juste au-dessus des yeux, et le dessus du bec, avec une <b>pente 2x3 jaune</b> qui descend vers la pointe.`,
  8:`Le front : les sourcils remontent vers le centre (1 tenon blanc plus haut et plus près du bec), ce qui donne l'air féroce de Sunraku. Une deuxième <b>pente 2x3 jaune</b> finit le haut du bec.`,
  9:`La tête se referme : 7 tenons de large.`,
  10:`Le crâne, et une <b>pente 2x3</b> qui arrondit le front.`,
  11:`La crête commence : 3 tenons de large, avec une mèche foncée au milieu.`,
  12:`La crête monte et part vers l'arrière.`,
  13:`La pointe de la crête, avec une <b>pente</b> au sommet pour la faire partir en arrière comme dans l'anime.`,
};

function sunrakuMask(opts = {}){
  const hc = HEAD_COLORS.find(h => h.value === opts.head) || HEAD_COLORS[0];
  const palette = {B:hc.value, D:hc.accent, Y:'yellow', W:'white', R:'red', K:'black'};
  const bricks = tileLayers(LAYERS, palette);

  // pentes ajoutées à la main (bec, front, pointe de la crête)
  const extras = {
    7:  [ slope(4,0,21,'-y',3,'yellow') ],
    8:  [ slope(4,2,24,'-y',3,'yellow') ],
    10: [ slope(4,6,33,'-y',3,hc.value) ],   // arrondi du front, posé sur le crâne
    13: [ slope(5,12,42,'-y',1,hc.value) ],
  };

  const steps = [];
  LAYERS.forEach(L => {
    const own = bricks.filter(p => p.layer === L.k && !isBeakTip(p));
    steps.push({title: L.name, az: L.k < 3 ? -30 : -35, el: L.k < 6 ? 40 : 30,
      text: TEXT[L.k], pieces: [...own, ...(extras[L.k]||[])]});
    if(L.k === 5){
      steps.push({title:'Le bout du bec', az:-70, el:10,
        text:`Assemble à part la pointe du bec, de bas en haut : <b>1x1</b>, puis <b>1x2</b>, puis les pièces jaunes de la couche 5. Pose-la devant le visage : elle se fixera sous le bec à l'étape suivante.`,
        tip:`Le bec est lourd vers l'avant : tiens-le jusqu'à ce que la couche des yeux le verrouille.`,
        pieces: bricks.filter(isBeakTip)});
    }
  });

  return {
    zoff: 0, groups: {}, steps,
    center: [5.5*8, 7*8],
    defaultPose: {}, controls: [],
    state: () => ({groundY: 0}),
    info: {head: hc},
  };
}

Object.assign(LEGO, {sunrakuMask, HEAD_COLORS, SUNRAKU_LAYERS: LAYERS});
})();
