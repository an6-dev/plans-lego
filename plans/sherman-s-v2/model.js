// Leaperkim Sherman S — V2 : suspension, trolley, pédales pliantes, attaches powerpads.
(function(){
const { S, P, HOLE, brick, plate, tile, technicBrick, sideStud, barPlate, clipPlate, rplate, light,
         liftarm, pin, axle, bush, wheel, shock, mirror, withMirror, inGroup } = LEGO;
const { padGroups, mountedPads } = LEGO;

const W = 7;              // largeur : flanc 1 | bras 1 | roue 3 | bras 1 | flanc 1
const ZOFF = 10;          // la couche z=0 (charnières des pédales) est 10 plaques au-dessus de la couche « sol » du repère
const Yz = z => (z + ZOFF) * P;
const AXLE_Y = Yz(1) + HOLE;        // 41 mm : trou Technic de la 1re couche
const AXLE_Z = 5 * S;                      // milieu de la longueur
const PIV_Z = 1 * S, ARM = AXLE_Z - PIV_Z; // pivot des bras à l'avant, bras de 32 mm
const TRAVEL = 6;                          // débattement (mm)
const SHOCK_TOP = {zm: AXLE_Z, ym: Yz(14) + HOLE};   // 82,6 mm
const TROL_Z = 8 * S, TROL_Y = Yz(20) + HOLE;        // pivot du trolley
const PED_Y = Yz(0) + 1.6, PED_X = -4;               // axe des pédales (barre)
const WHEEL_X = W * S / 2;

const WHEELS = {
  '82': {d:81.6, w:15, label:'≈ 81.6 mm — pneu moto Technic (2902 sur jante 2903)'},
  '75': {d:75,   w:18, label:'≈ 75 mm'},
  '69': {d:68.8, w:18, label:'≈ 69 mm'},
  '62': {d:62.4, w:20, label:'≈ 62 mm'},
};
const standPlates = r => Math.round((r - 9) / P);

const rotAbout = (axis, angle, px, py, pz) => new THREE.Matrix4()
  .makeTranslation(px,py,pz)
  .multiply(new THREE.Matrix4().makeRotationAxis(axis, angle))
  .multiply(new THREE.Matrix4().makeTranslation(-px,-py,-pz));
const X_AXIS = new THREE.Vector3(1,0,0), Z_AXIS = new THREE.Vector3(0,0,1);
const swingAngle = pose => -Math.asin((pose.susp||0) * TRAVEL / ARM);

function shermanV2(opts = {}){
  const wh = WHEELS[opts.wheel || '82'];
  const r = wh.d / 2;
  const padColor = opts.padColor || 'red';

  /* ---- pièces du flanc gauche (le droit est le miroir) ---- */
  const wallLow = [
    barPlate(0,2,0,'-x'), barPlate(0,6,0,'-x'),
    technicBrick(0,0,1,2), brick(0,2,1,1,2), brick(0,6,1,1,4),
    brick(0,0,4,1,4), brick(0,6,4,1,4),
    brick(0,0,7,1,4), brick(0,6,7,1,4),
  ];
  const wallHigh = [
    sideStud(0,0,10,4,'-x'), sideStud(0,6,10,4,'-x'),
    brick(0,0,13,1,4), brick(0,6,13,1,4),
    brick(0,0,16,1,4), brick(0,6,16,1,4),
  ];

  // demi-bagues pour centrer la roue entre les bras (zone roue : 24 mm)
  const gap = 12 - wh.w/2, nb = Math.max(0, Math.floor(gap/4));
  const bushes = [];
  for(let i=0;i<nb;i++){ bushes.push(bush(16 + 2 + 4*i, AXLE_Z, AXLE_Y, true), bush(W*S - 16 - 2 - 4*i, AXLE_Z, AXLE_Y, true)); }

  // support : plaque 4x6 + briques/plaques 2x4 jusqu'à la hauteur des pédales
  const n = standPlates(r), nbr = Math.floor((n-1)/3), npl = (n-1) % 3;
  const standL = [plate(-4,2,-n,4,6,'tan')];
  let z = -n + 1;
  for(let i=0;i<nbr;i++){ standL.push(brick(-3,3,z,2,4,'tan')); z += 3; }
  for(let i=0;i<npl;i++){ standL.push(plate(-3,3,z,2,4,'tan')); z += 1; }

  const pedalL = [ clipPlate(-2,2,0,'+x'), clipPlate(-2,6,0,'+x'), plate(-3,2,0,1,6), plate(-3,2,1,2,6) ];

  const steps = [
    {title:'Flanc gauche — le bas', az:-58, el:30,
     text:`Le flanc fait <b>1 tenon d'épaisseur</b> : deux colonnes (avant et arrière) séparées par une fente de 2 tenons, où ira l'amortisseur.
       Pose les 2 <b>plaques avec barre</b> (barre vers l'extérieur) : ce sont les charnières des pédales. Colonne avant : <b>brique Technic 1x2</b> tout devant (pivot du bras de suspension) + <b>1x2</b>, puis des <b>1x4</b>. Colonne arrière : que des <b>1x4</b>.`,
     tip:`Garde exactement 2 tenons de vide entre les deux colonnes : c'est la fente de l'amortisseur.`,
     pieces: wallLow},
    {title:'Flanc gauche — le haut et les attaches powerpads', az:-58, el:30,
     text:`Une <b>brique 1x4 à tenons latéraux</b> sur chaque colonne, tenons vers l'extérieur : c'est là que se clipsent les powerpads (plan séparé). Puis encore deux rangées de <b>1x4</b>.`,
     pieces: wallHigh},
    {title:'Flanc droit — le même en miroir', az:58, el:30,
     text:`Refais les étapes 1 et 2 en miroir : barres et tenons latéraux vers l'extérieur (vers la droite). Place les deux flancs à <b>5 tenons d'écart</b> (entre leurs faces intérieures).`,
     pieces: [...wallLow, ...wallHigh].map(p => mirror(p, W))},
    {title:'Le garde-boue et les supports d\'amortisseur', az:-40, el:-28,
     text:`Assemble la <b>plaque 6x10</b> + la <b>plaque 1x10</b>. Retourne-les et accroche <b>dessous</b>, sur la 2ᵉ rangée depuis chaque bord : 2 <b>plaques 1x6</b> puis une <b>brique Technic 1x6</b>. Remets à l'endroit et pose le tout sur les 4 colonnes.`,
     tip:`La brique Technic 1x6 pend juste à côté de la fente : son trou du milieu tient le haut de l'amortisseur. L'image est vue de dessous.`,
     pieces: [ plate(0,0,19,6,10,'dkgrey'), plate(6,0,19,1,10,'dkgrey'),
               ...withMirror([ plate(1,2,18,1,6), plate(1,2,17,1,6), technicBrick(1,2,14,6) ], W) ]},
    {title:'Les bras de suspension', az:-22, el:14,
     text:`Glisse une <b>poutre Technic 1x5</b> à l'intérieur de chaque flanc, contre la paroi. Fixe-la <b>depuis l'extérieur</b> avec un <b>connecteur lisse gris</b> dans le trou Technic tout en bas à l'avant. Le bras doit pivoter librement.`,
     tip:`Connecteur <b>lisse</b> (gris clair, 3673) et pas à friction : sinon la suspension ne bouge pas.`,
     pieces: inGroup(withMirror([ liftarm(1,5,PIV_Z,AXLE_Y,1), pin(0,16,PIV_Z,AXLE_Y) ], W), 'swing')},
    {title:'Les amortisseurs', az:-62, el:16,
     text:`Pose un <b>amortisseur</b> dans chaque fente, partie grise en haut. Fixe l'œil du haut avec un <b>connecteur lisse</b>, enfoncé depuis l'extérieur jusque dans la brique Technic 1x6 qui pend sous le toit. L'œil du bas se place devant le dernier trou du bras.`,
     pieces: withMirror([ shock(0, SHOCK_TOP), pin(0,16,SHOCK_TOP.zm,SHOCK_TOP.ym) ], W)},
    {title:'La roue', az:-30, el:12,
     text:`Présente la roue entre les bras. Enfile l'<b>axe 7</b> depuis l'extérieur à travers : œil de l'amortisseur gauche → bras → ${nb?'demi-bague → ':''}roue → ${nb?'demi-bague → ':''}bras → œil de l'amortisseur droit. L'axe affleure les deux flancs.`,
     tip:`Appuie sur le toit : la coque descend, la roue remonte dans la fente. Si ton amortisseur est plus long ou plus court et que les bras ne sont pas à l'horizontale au repos, ajoute ou retire une plaque 1x6 au-dessus des briques Technic de l'étape 4.`,
     pieces: inGroup([ wheel(WHEEL_X, AXLE_Z, AXLE_Y, r, wh.w), axle(7,0,AXLE_Z,AXLE_Y), ...bushes ], 'swing')},
    {title:'Phares, feu arrière et pivots du trolley', az:-42, el:34,
     text:`Sur le toit : bords en <b>2x6</b> + <b>1x2</b>, et à l'arrière de la 2ᵉ rangée une <b>brique Technic 1x2</b> de chaque côté (pivot du trolley). Rangée avant : <b>phare</b> · <b>1x1</b> · <b>phare</b> avec <b>plaques rondes transparentes</b>. Pareil à l'arrière en <b>rouge transparent</b>. Le centre reste creux : c'est le logement du trolley.`,
     pieces: [ ...withMirror([ brick(0,0,20,2,6), brick(0,6,20,2,1), brick(0,7,20,1,2), technicBrick(1,7,20,2), brick(0,9,20,2,1) ], W),
               light(2,0,20,'-y'), brick(3,0,20,1,1), light(4,0,20,'-y'), rplate(2,0,20,'trclear','-y'), rplate(4,0,20,'trclear','-y'),
               light(2,9,20,'+y'), brick(3,9,20,1,1), light(4,9,20,'+y'), rplate(2,9,20,'trred','+y'), rplate(4,9,20,'trred','+y') ]},
    {title:'Le trolley (s\'ouvre et se ferme)', az:-62, el:22, pose:{trolley:1},
     text:`Deux <b>poutres 1x7</b> reliées devant par un <b>axe 3</b> avec une <b>bague</b> au milieu (la poignée). Fixe l'arrière de chaque poutre sur les briques Technic avec un <b>connecteur à friction noir</b>. Fermé, le trolley se range à plat dans le creux du dessus. Ouvert, il se lève pour pousser la roue en marchant.`,
     tip:`Connecteurs <b>à friction</b> (noirs, 2780) : le trolley reste dans la position où tu le lâches.`,
     pieces: inGroup([ liftarm(2,7,TROL_Z,TROL_Y,-1), liftarm(4,7,TROL_Z,TROL_Y,-1),
                       pin(8,24,TROL_Z,TROL_Y,true), pin(32,48,TROL_Z,TROL_Y,true),
                       axle(3,16,2*S,TROL_Y), bush(WHEEL_X,2*S,TROL_Y) ], 'trolley')},
    {title:'Finitions du dessus', az:-50, el:40,
     text:`Des <b>tuiles gris foncé</b> 1x6 + 1x4 sur les deux rangées de chaque bord, pour un dessus lisse.`,
     pieces: withMirror([ tile(0,0,23,1,6,'dkgrey'), tile(0,6,23,1,4,'dkgrey'), tile(1,0,23,1,6,'dkgrey'), tile(1,6,23,1,4,'dkgrey') ], W)},
    {title:'Les pédales pliantes', az:-55, el:24, pose:{pedals:.5},
     text:`Chaque pédale : une <b>plaque 1x6</b> + 2 <b>plaques 1x2 à clips</b> (clips vers le flanc) à plat, reliées par une <b>plaque 2x6</b> par-dessus. Clipse la pédale sur les deux barres du bas du flanc. Elle se replie contre le flanc comme la vraie.`,
     tip:`Les clips doivent serrer la barre juste assez pour que la pédale tienne dépliée.`,
     pieces: [ ...inGroup(pedalL, 'pedalL'), ...inGroup(pedalL.map(p => mirror(p, W)), 'pedalR') ]},
    {title:'Le support de présentation', az:-64, el:14,
     text:`Comme le support en bois des photos : sous chaque pédale, une <b>plaque 4x6 beige</b> et une pile de ${nbr} brique${nbr>1?'s':''} 2x4${npl?` + ${npl} plaque${npl>1?'s':''} 2x4`:''} (${n} plaques de haut au total pour ta roue). Le pneu touche la table au milieu.`,
     tip:`Enlève le support pour jouer avec la suspension et replier les pédales.`,
     pieces: [ ...inGroup(standL, 'stand'), ...inGroup(standL.map(p => mirror(p, W)), 'stand') ]},
  ];

  const groups = {
    swing:  {matrix: pose => rotAbout(X_AXIS, swingAngle(pose), 0, AXLE_Y, PIV_Z)},
    trolley:{matrix: pose => rotAbout(X_AXIS, (pose.trolley||0) * THREE.MathUtils.degToRad(105), 0, TROL_Y, TROL_Z)},
    pedalL: {matrix: pose => rotAbout(Z_AXIS, -(pose.pedals||0) * Math.PI/2, PED_X, PED_Y, 0)},
    pedalR: {matrix: pose => rotAbout(Z_AXIS,  (pose.pedals||0) * Math.PI/2, W*S - PED_X, PED_Y, 0)},
    stand:  {visible: pose => pose.stand > .5 && (pose.pedals||0) < .02 && (pose.susp||0) < .02},
    ...padGroups(pose => (pose.pads||0) > .5),
  };

  return {
    zoff: ZOFF, W, groups, steps,
    context: mountedPads(padColor),
    center: [WHEEL_X, AXLE_Z],
    defaultPose: {trolley:0, pedals:0, susp:0, stand:1, pads:0},
    controls: [
      {key:'trolley', label:'Trolley ouvert', type:'toggle'},
      {key:'pedals', label:'Pédales repliées', type:'toggle'},
      {key:'susp', label:'Suspension', type:'range'},
      {key:'pads', label:'Powerpads', type:'toggle'},
      {key:'stand', label:'Support', type:'toggle'},
    ],
    state: pose => {
      const a = swingAngle(pose);
      const axle = {zm: PIV_Z + ARM*Math.cos(a), ym: AXLE_Y - ARM*Math.sin(a)};
      return {axle, groundY: axle.ym - r};
    },
    info: {r, wheel: wh, standPlates: n, bushes: nb},
  };
}

Object.assign(LEGO, {W, ZOFF, AXLE_Y, WHEELS, standPlates, shermanV2});
})();
