// Powerpads (grand = tibia, petit = mollet) : pièces en repère local + montage sur la Sherman S V2.
// Repère local d'un pad : x = hauteur (vers le haut une fois monté), y = avant/arrière, z = couches (vers l'extérieur).
(function(){
const { plate, tile, curve } = LEGO;

const PAD_COLORS = [
  {value:'red', label:'Rouge (comme les Grizzla)'}, {value:'blue', label:'Bleu'}, {value:'azure', label:'Azur'},
  {value:'yellow', label:'Jaune'}, {value:'orange', label:'Orange'}, {value:'green', label:'Vert'},
  {value:'lime', label:'Vert citron'}, {value:'white', label:'Blanc'}, {value:'black', label:'Noir'},
];

const bigPadLayers = c => [
  [ plate(0,0,0,6,4,c), plate(6,0,0,1,4,c) ],
  [ plate(1,0,1,6,4,c), plate(0,0,1,1,4,c) ],
  [ tile(0,0,2,4,1,c), tile(0,1,2,4,1,'tan'), tile(0,2,2,4,1,'tan'), tile(0,3,2,4,1,c),
    tile(4,0,2,1,4,c), curve(5,0,2,'+x',c), curve(5,2,2,'+x',c) ],
];
const smallPadLayers = c => [
  [ plate(0,0,0,4,4,c) ],
  [ plate(0,0,1,4,4,c) ],
  [ tile(0,0,2,2,1,c), tile(0,1,2,2,1,'tan'), tile(0,2,2,2,1,'tan'), tile(0,3,2,2,1,c),
    curve(2,0,2,'+x',c), curve(2,2,2,'+x',c) ],
];

// Les tenons latéraux de la V2 (brique 1x4 tenons latéraux, couche z=10) : centre des tenons à Y = 68,8 mm.
// La rangée x=0 du pad se clipse dessus -> le bas du pad est à 68,8 - 4 = 64,8 mm.
const PAD_Y0 = 64.8, WIDTH = 7 * 8;
const left  = zc => new THREE.Matrix4().set(0,-1,0,0,       1,0,0,PAD_Y0, 0,0, 1,zc, 0,0,0,1);
const right = zc => new THREE.Matrix4().set(0, 1,0,WIDTH,   1,0,0,PAD_Y0, 0,0,-1,zc, 0,0,0,1);

// groupes de montage (grand pad sur la colonne avant, petit sur la colonne arrière)
function padGroups(visible){
  return {
    padBigL:   {zoff:0, matrix:() => left(0),    visible},
    padSmallL: {zoff:0, matrix:() => left(48),   visible},
    padBigR:   {zoff:0, matrix:() => right(32),  visible},
    padSmallR: {zoff:0, matrix:() => right(80),  visible},
  };
}
function mountedPads(c){
  const big = bigPadLayers(c).flat(), small = smallPadLayers(c).flat();
  return [
    ...big.map(p => ({...p, g:'padBigL'})), ...big.map(p => ({...p, g:'padBigR'})),
    ...small.map(p => ({...p, g:'padSmallL'})), ...small.map(p => ({...p, g:'padSmallR'})),
  ];
}

Object.assign(LEGO, {PAD_COLORS, bigPadLayers, smallPadLayers, padGroups, mountedPads});
})();
