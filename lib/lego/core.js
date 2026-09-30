window.LEGO = window.LEGO || {};
(function(){
// Constantes LEGO, couleurs, références et constructeurs de pièces.
// Coordonnées « grille » : x = largeur (tenons), y = longueur (tenons, 0 = avant), z = hauteur (plaques).
// Pièces Technic : positions en mm dans le repère du modèle (X = x*S, Z = y*S, Y = hauteur).

const S = 8;     // 1 tenon = 8 mm
const P = 3.2;   // 1 plaque = 3,2 mm (1 brique = 3 plaques)
const HOLE = 5.8; // hauteur du trou Technic au-dessus du bas d'une brique

const COL = {
  black:   {hex:0x2c3035, edge:0x8a9096, name:'Noir'},
  dkgrey:  {hex:0x6c6e68, edge:0x2f302d, name:'Gris foncé'},
  ltgrey:  {hex:0xa0a5a9, edge:0x55595c, name:'Gris clair'},
  white:   {hex:0xf4f4f4, edge:0x9a9a9a, name:'Blanc'},
  red:     {hex:0xc91a09, edge:0x5a0a03, name:'Rouge', hl:0x0a84ff},
  blue:    {hex:0x0055bf, edge:0x00265a, name:'Bleu'},
  azure:   {hex:0x36aebf, edge:0x145a63, name:'Azur'},
  yellow:  {hex:0xf2cd37, edge:0x7a6414, name:'Jaune', hl:0x0a84ff},
  orange:  {hex:0xfe8a18, edge:0x7a3e04, name:'Orange', hl:0x0a84ff},
  green:   {hex:0x237841, edge:0x0d3a1d, name:'Vert'},
  lime:    {hex:0xbbe90b, edge:0x5a7000, name:'Vert citron'},
  gold:    {hex:0xcfa43c, edge:0x6b521a, name:'Or (ou jaune)', hl:0x0a84ff},
  tan:     {hex:0xe4cd9e, edge:0x8c7a52, name:'Beige', hl:0x0a84ff},
  trclear: {hex:0xe8f4fa, edge:0x7d949e, name:'Transparent', opacity:.6},
  trred:   {hex:0xe0301e, edge:0x7a1a10, name:'Rouge transparent', opacity:.7, hl:0x0a84ff},
  dkazure: {hex:0x078bc9, edge:0x033e5c, name:'Azur foncé'},
  dkblue:  {hex:0x0a3463, edge:0x5d7fa8, name:'Bleu foncé'},
  sandblue:{hex:0x6d8aa3, edge:0x2e3d4a, name:'Bleu sable'},
  mdblue:  {hex:0x5a93db, edge:0x24466e, name:'Bleu moyen'},
  purple:  {hex:0x6c3fb0, edge:0x2e1a4d, name:'Violet'},
  sandgreen:{hex:0xa0bcac, edge:0x4e6356, name:'Vert sable'},
  brown:   {hex:0x582a12, edge:0xb07a5a, name:'Marron'},
  trlblue: {hex:0xaee9ef, edge:0x5c9ca3, name:'Bleu clair transparent', opacity:.6},
};
const hexStr = h => '#' + h.toString(16).padStart(6,'0');

// Références LEGO / BrickLink (pour trier et commander)
const REF = {
  'Brique 1x1':'3005','Brique 1x2':'3004','Brique 1x3':'3622','Brique 1x4':'3010','Brique 1x6':'3009','Brique 1x8':'3008',
  'Brique 2x2':'3003','Brique 2x3':'3002','Brique 2x4':'3001','Brique 2x6':'2456','Brique 2x8':'3007',
  'Plaque 1x2':'3023','Plaque 1x4':'3710','Plaque 1x6':'3666','Plaque 1x10':'4477','Plaque 2x6':'3795',
  'Plaque 4x4':'3031','Plaque 4x6':'3032','Plaque 6x10':'3033',
  'Tuile 1x2':'3069','Tuile 1x4':'2431','Tuile 1x6':'6636',
  'Brique Technic 1x2':'3700','Brique Technic 1x4':'3701','Brique Technic 1x6':'3894',
  'Brique 1x4 tenons latéraux':'30414','Plaque 1x2 avec barre':'48336','Plaque 1x2 avec clips':'60470',
  'Pente incurvée 2x2':'15068','Pente 45° 2x1':'3040','Pente 45° 2x2':'3039','Pente 45° 2x3':'3038','Pente 45° 2x4':'3037','Pente inversée 45° 2x2':'3660',
  'Brique ronde 1x1':'3062','Plaque ronde 1x1':'4073','Brique phare 1x1':'4070',
  'Poutre Technic 1x5':'32316','Poutre Technic 1x7':'32524',
  'Connecteur Technic lisse':'3673','Connecteur Technic friction':'2780',
  'Axe Technic 3':'4519','Axe Technic 5':'32073','Axe Technic 7':'44294',
  'Bague Technic':'3713','Demi-bague Technic':'4265c / 32123',
  'Amortisseur 6.5L':'731c / 76537','Roue + pneu':'au choix',
  'Plaque 1x8':'3460','Plaque 6x8':'3036','Plaque 2x4':'3020','Tuile 1x3':'63864',
  "Brique ronde 2x2 trou d'axe":'3941',"Plaque ronde 2x2 trou d'axe":'4032',
  'Poutre Technic 1x9':'40490','Poutre Technic 1x11':'32525','Axe Technic 4':'3705','Axe Technic 8':'3707',
  'Connecteur perpendiculaire axe/trou':'6536','Équerre 1x2 - 2x2':'44728','Pente courbe 1x4':'61678 / 11153','Pente courbe 1x2':'11477','Plaque 2x3':'3021','Tuile 2x4':'87079',
  'Pente 1x2 biseautée gauche':'29120 (à vérifier)','Pente 1x2 biseautée droite':'29119 (à vérifier)','Tuile 1x1':'3070','Plaque 2x2':'3022','Tuile 2x2':'3068',
  'Plaque Technic 2x4 à trous':'3709','Plaque Technic 2x6 à trous':'32001','Plaque Technic 2x8 à trous':'3738',
};

const dn = (w,l) => `${Math.min(w,l)}x${Math.max(w,l)}`;

/* ---- pièces « grille » ---- */
const brick  = (x,y,z,w,l,c='black') => ({t:'box',x,y,z,w,l,h:3,c,studs:true,name:`Brique ${dn(w,l)}`});
const plate  = (x,y,z,w,l,c='black') => ({t:'box',x,y,z,w,l,h:1,c,studs:true,name:`Plaque ${dn(w,l)}`});
const tile   = (x,y,z,w,l,c='black') => ({t:'box',x,y,z,w,l,h:1,c,studs:false,name:`Tuile ${dn(w,l)}`});
// brique Technic couchée dans l'axe y, trous traversants selon x
const technicBrick = (x,y,z,l,c='black') => ({t:'technic',x,y,z,w:1,l,h:3,c,studs:true,name:`Brique Technic 1x${l}`});
// brique 1xl avec tenons sur un côté (dir '-x' ou '+x')
const sideStud = (x,y,z,l,dir,c='black') => ({t:'sidestud',x,y,z,w:1,l,h:3,dir,c,studs:true,name:`Brique 1x${l} tenons latéraux`});
const barPlate  = (x,y,z,dir,c='black') => ({t:'barplate',x,y,z,w:1,l:2,h:1,dir,c,studs:true,name:'Plaque 1x2 avec barre'});
const clipPlate = (x,y,z,dir,c='black') => ({t:'clipplate',x,y,z,w:1,l:2,h:1,dir,c,studs:true,name:'Plaque 1x2 avec clips'});
// pente incurvée 2x2 (2 plaques de haut), dir = sens de la descente
const curve  = (x,y,z,dir,c='black') => ({t:'curve',x,y,z,w:2,l:2,h:2,dir,c,name:'Pente incurvée 2x2'});
// pente 45° : 2 tenons dans le sens de la descente (dir), n tenons de large ; tenons sur la rangée haute
const slope = (x,y,z,dir,n=1,c='black') => { const alongY = dir==='+y' || dir==='-y';
  return {t:'slope',x,y,z,w: alongY ? n : 2, l: alongY ? 2 : n, h:3,dir,n,c,name:`Pente 45° 2x${n}`}; };
// pente 1x2 biseautée (pointe), side = 'gauche' | 'droite' ; rendue comme une pente 2x1
const wedge = (x,y,z,dir,side,c='black') => ({...slope(x,y,z,dir,1,c), name:`Pente 1x2 biseautée ${side}`});
// pente courbe 1xn (2 plaques de haut), dir = sens de la descente
const curveLong = (x,y,z,dir,n=4,c='black') => { const alongY = dir==='+y' || dir==='-y';
  return {t:'curvelong',x,y,z,w: alongY ? 1 : n, l: alongY ? n : 1, h:2,dir,n,c,name:`Pente courbe 1x${n}`}; };
// équerre 1x2 - 2x2 : plaque 1x2 (le long de y) + plaque 2x2 qui pend sous le bord, tenons tournés vers dir ('-x' | '+x')
const bracket = (x,y,z,dir,c='black') => ({t:'bracket',x,y,z,w:1,l:2,h:1,dir,c,name:'Équerre 1x2 - 2x2'});
const round1 = (x,y,z,c='red') => ({t:'round',x,y,z,w:1,l:1,h:3,c,name:'Brique ronde 1x1'});
const rplate = (x,y,z,c,dir) => ({t:'rplate',x,y,z,w:1,l:1,h:1,c,dir,name:'Plaque ronde 1x1'});
const light  = (x,y,z,dir,c='black') => ({t:'headlight',x,y,z,w:1,l:1,h:3,dir,c,name:'Brique phare 1x1'});

// rond 2x2 avec trou d'axe au centre (brique h=3 ou plaque h=1)
const round2 = (x,y,z,h,c='black') => ({t:'round2',x,y,z,w:2,l:2,h,c,
  name: h===3 ? "Brique ronde 2x2 trou d'axe" : "Plaque ronde 2x2 trou d'axe"});

// plaque Technic 2xN à trous, couchée selon x (w=N, l=2) : trous verticaux entre les tenons, sur l'axe central
const technicPlate = (x,y,z,n,c='black') => ({t:'technicplate',x,y,z,w:n,l:2,h:1,c,studs:true,name:`Plaque Technic 2x${n} à trous`});

/* ---- pièces Technic (mm) ---- */
// poutre (liftarm) dans la colonne x, trous selon X ; premier trou en Z=z0, les suivants vers dir (+1/-1)
const liftarm = (x,n,z0,ym,dir=1,c='black') => ({t:'liftarm',x,n,z0,ym,dir,c,name:`Poutre Technic 1x${n}`});
const pin  = (xa,xb,zm,ym,friction=false) => ({t:'pin',xa,xb,zm,ym,c:friction?'black':'ltgrey',
  name: friction ? 'Connecteur Technic friction' : 'Connecteur Technic lisse'});
const axle = (n,xa,zm,ym,c='dkgrey') => ({t:'axle',n,xa,zm,ym,c,name:`Axe Technic ${n}`});
// axe vertical : centre (xm,zm), bas à ya
const axleV = (n,xm,zm,ya,c='dkgrey') => ({t:'axleV',n,xm,zm,ya,c,name:`Axe Technic ${n}`});
// connecteur perpendiculaire : trou d'axe vertical en bas (centre yb+4), trou de connecteur selon X en haut (yb+12)
const perpConn = (xm,zm,yb,c='black') => ({t:'perpconn',xm,zm,yb,c,name:'Connecteur perpendiculaire axe/trou'});
const bush = (xm,zm,ym,half=false,c='ltgrey') => ({t:'bush',xm,zm,ym,half,c,name: half ? 'Demi-bague Technic' : 'Bague Technic'});
const wheel = (xm,zm,ym,r,w,o={}) => ({t:'wheel',xm,zm,ym,r,w,...o,c:'black',name:'Roue + pneu'});
// amortisseur : colonne x, œil du haut fixe {zm,ym} ; le bas suit l'état « axle » du modèle
const shock = (x,top) => ({t:'shock',x,top,c:'ltgrey',name:'Amortisseur 6.5L'});

/* ---- miroir gauche/droite (largeur W tenons) ---- */
const flipDir = d => d==='-x' ? '+x' : d==='+x' ? '-x' : d;
function mirror(p, W){
  const q = {...p};
  switch(p.t){
    case 'liftarm': case 'shock': q.x = W - p.x - 1; break;
    case 'pin': q.xa = W*S - p.xb; q.xb = W*S - p.xa; break;
    case 'axle': q.xa = W*S - (p.xa + p.n*S); break;
    case 'bush': case 'wheel': case 'axleV': case 'perpconn': q.xm = W*S - p.xm; break;
    default: q.x = W - (p.x + p.w);
  }
  if(q.dir) q.dir = flipDir(q.dir);
  return q;
}
const withMirror = (arr, W) => [...arr, ...arr.map(p => mirror(p, W))];
const inGroup = (arr, g) => arr.map(p => ({...p, g}));

Object.assign(LEGO, {S, P, HOLE, COL, hexStr, REF, brick, plate, tile, technicBrick, sideStud, barPlate, clipPlate, curve, slope, wedge, curveLong, bracket, round1, rplate, light, round2, technicPlate, liftarm, pin, axle, axleV, perpConn, bush, wheel, shock, mirror, withMirror, inGroup});
})();
