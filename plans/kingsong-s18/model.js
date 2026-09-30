// Kingsong S18 : suspension à amortisseur central arrière, trolley coulissant, pads intégrés à la coque.
(function(){
const { S, P, HOLE, brick, plate, tile, technicBrick, technicPlate, barPlate, clipPlate, rplate, light, round2,
        liftarm, pin, axle, axleV, perpConn, bush, wheel, shock, mirror, withMirror, inGroup } = LEGO;

const W = 7;                 // flanc 1 | bras 1 | roue 3 | bras 1 | flanc 1
const ZOFF = 10;
const Yz = z => (z + ZOFF) * P;
const AXLE_Y = Yz(1) + HOLE;           // 41 mm
const PIV_Z = 1*S, AXLE_Z = 5*S, CROSS_Z = 11*S;   // pivot avant, axe de roue, traverse derrière la roue
const ARM_A = AXLE_Z - PIV_Z, ARM_C = CROSS_Z - PIV_Z;   // 32 et 80 mm
const CROSS_TRAVEL = 8;                 // débattement de la traverse (l'axe de roue bouge 2,5x moins)
const SHOCK_TOP = {zm: CROSS_Z, ym: Yz(14) + HOLE};     // 82,6 mm
const TROL_Z = 9*S, TROL_X = [2*S, 5*S], TROL_UP = 32;  // axes du trolley, course 32 mm
const CONN_Y = Yz(23) + 1.7;            // les connecteurs posent sur les briques rondes
const PED_Y = Yz(0) + 1.6, PED_X = -4;
const MID_X = W*S/2;

const WHEELS_S18 = {
  '82': {d:81.6, w:15, label:'≈ 81.6 mm — pneu moto Technic (2902 sur jante 2903)'},
  '75': {d:75,   w:18, label:'≈ 75 mm'},
  '69': {d:68.8, w:18, label:'≈ 69 mm'},
  '62': {d:62.4, w:20, label:'≈ 62 mm'},
};
const standPlatesS18 = r => Math.round((r - 9) / P);

const rotAbout = (axis, angle, px, py, pz) => new THREE.Matrix4()
  .makeTranslation(px,py,pz).multiply(new THREE.Matrix4().makeRotationAxis(axis, angle))
  .multiply(new THREE.Matrix4().makeTranslation(-px,-py,-pz));
const X_AXIS = new THREE.Vector3(1,0,0), Z_AXIS = new THREE.Vector3(0,0,1);
const swingAngle = pose => -Math.asin((pose.susp||0) * CROSS_TRAVEL / ARM_C);

function kingsongS18(opts = {}){
  const wh = WHEELS_S18[opts.wheel || '82'];
  const r = wh.d / 2;

  /* ---- flanc gauche (x=0) avec le pad intégré (colonne x=-1) ---- */
  const wallLow = [
    barPlate(0,2,0,'-x'), barPlate(0,6,0,'-x'),
    technicBrick(0,0,1,2), brick(0,2,1,1,2), brick(0,4,1,1,8),
    brick(0,0,4,1,6), brick(0,6,4,1,6),
    brick(0,0,7,1,4), brick(0,4,7,1,8),
  ];
  const wallHigh = [
    brick(0,0,10,1,4), brick(-1,4,10,2,6), brick(0,10,10,1,2),
    brick(0,1,13,1,3), brick(-1,4,13,2,6), brick(0,10,13,1,2),
    brick(0,0,16,1,4), brick(-1,4,16,2,6), brick(0,10,16,1,2),
  ];

  const gap = 12 - wh.w/2, nb = Math.max(0, Math.floor(gap/4));
  const bushes = [];
  for(let i=0;i<nb;i++) bushes.push(bush(16+2+4*i, AXLE_Z, AXLE_Y, true), bush(W*S-16-2-4*i, AXLE_Z, AXLE_Y, true));

  const n = standPlatesS18(r), nbr = Math.floor((n-1)/3), npl = (n-1) % 3;
  const standL = [plate(-4,2,-n,4,6,'tan')];
  let z = -n + 1;
  for(let i=0;i<nbr;i++){ standL.push(brick(-3,3,z,2,4,'tan')); z += 3; }
  for(let i=0;i<npl;i++){ standL.push(plate(-3,3,z,2,4,'tan')); z += 1; }

  const pedalL = [ clipPlate(-2,2,0,'+x'), clipPlate(-2,6,0,'+x'), plate(-3,2,0,1,6), plate(-3,2,1,2,6) ];

  const steps = [
    {title:'Flanc gauche — le bas', az:-60, el:28,
     text:`Flanc d'<b>1 tenon d'épaisseur</b>, 12 tenons de long. Tout en bas, les 2 <b>plaques avec barre</b> (barre vers l'extérieur) pour les pédales. Couche 1 : <b>brique Technic 1x2</b> tout devant (pivot de la suspension), <b>1x2</b>, <b>1x8</b>. Puis <b>1x6 + 1x6</b> et <b>1x4 + 1x8</b> pour croiser les joints.`,
     pieces: wallLow},
    {title:'Flanc gauche — le pad intégré', az:-60, el:28,
     text:`Sur la S18, les powerpads font partie de la coque : le haut du flanc est plus épais. Trois <b>briques 2x6</b> empilées débordent d'1 tenon vers l'extérieur. Devant : <b>1x4</b>, <b>1x3</b> (décalée d'un tenon, la façade viendra devant), <b>1x4</b>. Derrière : trois <b>1x2</b>.`,
     tip:`Laisse libre la case tout devant de la 2ᵉ rangée (1x3 décalée) : la façade s'y posera à l'étape 4.`,
     pieces: wallHigh},
    {title:'Flanc droit — le même en miroir', az:58, el:28,
     text:`Refais les étapes 1 et 2 en miroir (barres et pad vers la droite). Place les deux flancs à <b>5 tenons d'écart</b> entre leurs faces intérieures.`,
     pieces: [...wallLow, ...wallHigh].map(p => mirror(p, W))},
    {title:'Façade avant et bande de phares', az:-25, el:22,
     text:`Relie les deux flancs par l'avant, au-dessus de la roue : une <b>1x4</b> et une <b>1x3</b> posées en travers. Dessus, 5 <b>briques phare</b> tenons vers l'avant avec 5 <b>plaques rondes transparentes</b> : la bande de LED de la S18.`,
     pieces: [ brick(0,0,13,4,1), brick(4,0,13,3,1),
               ...[1,2,3,4,5].flatMap(x => [light(x,0,16,'-y'), rplate(x,0,16,'trclear','-y')]) ]},
    {title:'Le toit et le support d\'amortisseur', az:-150, el:-22,
     text:`Toit en 6 plaques : <b>6x8</b> + <b>1x8</b> devant, une <b>plaque Technic 2x6 à trous</b> + <b>1x2</b> au milieu (les trous guideront le trolley), <b>2x6</b> + <b>1x2</b> derrière. Deux <b>tuiles 1x6</b> sur le haut des pads. Sous le toit, à l'arrière, accroche de chaque côté du centre : 2 <b>plaques 1x2</b> puis une <b>brique Technic 1x2</b>. Elles tiendront le haut de l'amortisseur.`,
     tip:`Vue de dessous et de l'arrière. Les deux briques Technic pendent à 1 tenon d'écart, pile au milieu : l'amortisseur se glisse entre elles.`,
     pieces: [ plate(0,0,19,6,8), plate(6,0,19,1,8), technicPlate(0,8,19,6), plate(6,8,19,1,2), plate(0,10,19,6,2), plate(6,10,19,1,2),
               tile(-1,4,19,1,6), tile(7,4,19,1,6),
               ...withMirror([ plate(2,10,18,1,2), plate(2,10,17,1,2), technicBrick(2,10,14,2) ], W) ]},
    {title:'Les bras de suspension', az:-20, el:12,
     text:`Deux <b>poutres Technic 1x11 beiges</b> (les bras dorés de la vraie), à l'intérieur des flancs. Fixe chacune par son 1er trou avec un <b>connecteur lisse gris</b>, enfoncé depuis l'extérieur dans la brique Technic avant du flanc. Elles dépassent derrière la roue.`,
     tip:`Connecteurs <b>lisses</b> (3673) : les bras doivent pivoter sans forcer.`,
     pieces: inGroup(withMirror([ liftarm(1,11,PIV_Z,AXLE_Y,1,'tan'), pin(0,16,PIV_Z,AXLE_Y) ], W), 'swing')},
    {title:'La roue', az:-28, el:10,
     text:`Présente la roue entre les bras et enfile un <b>axe 5</b> dans le <b>5ᵉ trou</b> des deux bras${nb ? ', avec une demi-bague de chaque côté du moyeu' : ''}.`,
     pieces: inGroup([ wheel(MID_X, AXLE_Z, AXLE_Y, r, wh.w, {road:true}), axle(5,S,AXLE_Z,AXLE_Y), ...bushes ], 'swing')},
    {title:'La traverse et l\'amortisseur central', az:-160, el:12,
     text:`Derrière la roue, enfile un <b>axe 5</b> dans le <b>dernier trou</b> des bras : bras → <b>bague</b> → œil du bas de l'<b>amortisseur</b> → <b>bague</b> → bras. Redresse l'amortisseur et fixe son œil du haut avec un <b>axe 3</b> qui traverse les deux briques Technic sous le toit.`,
     tip:`Vue de l'arrière : comme sur la vraie S18, l'amortisseur est au centre, derrière la roue, entre les bras dorés. Si les bras ne sont pas à l'horizontale au repos, ajoute ou retire une plaque 1x2 au-dessus des briques Technic du toit.`,
     pieces: [ ...inGroup([ axle(5,S,CROSS_Z,AXLE_Y,'dkgrey'), bush(20,CROSS_Z,AXLE_Y), bush(36,CROSS_Z,AXLE_Y) ], 'swing'),
               shock(3, SHOCK_TOP), axle(3,2*S,SHOCK_TOP.zm,SHOCK_TOP.ym) ]},
    {title:'Le dessus et les guides du trolley', az:-40, el:38,
     text:`Devant, trois rangées de briques <b>en travers</b> (2x4 + 2x3, en alternant le côté). Au milieu, deux <b>briques rondes 2x2 à trou d'axe</b> posées pile sur les trous de la plaque Technic : ce sont les guides du trolley. Autour, des briques <b>1x6</b> dans la longueur et deux <b>2x2</b>. Derrière, deux <b>1x2</b> et 4 <b>briques phare</b> tenons vers l'arrière avec des <b>plaques rondes rouges transparentes</b> (feu arrière).`,
     pieces: [ brick(0,0,20,4,2), brick(4,0,20,3,2), brick(0,2,20,3,2), brick(3,2,20,4,2), brick(0,4,20,4,2), brick(4,4,20,3,2),
               brick(0,6,20,1,6), brick(3,6,20,1,6), brick(6,6,20,1,6), brick(1,6,20,2,2), brick(4,6,20,2,2),
               round2(1,8,20,3), round2(4,8,20,3), brick(1,10,20,2,1), brick(4,10,20,2,1),
               ...[1,2,4,5].flatMap(x => [light(x,11,20,'+y'), rplate(x,11,20,'trred','+y')]) ]},
    {title:'Finitions du dessus', az:-40, el:45,
     text:`Des <b>tuiles</b> pour un dessus lisse comme la coque de la S18 : 7 <b>tuiles 1x6</b> devant, 3 dans la longueur au milieu, 2 <b>tuiles 2x2</b> et 4 <b>tuiles 1x2</b>. Ne couvre pas les briques rondes.`,
     pieces: [ ...[0,1,2,3,4,5,6].map(x => tile(x,0,23,1,6)), tile(0,6,23,1,6), tile(3,6,23,1,6), tile(6,6,23,1,6),
               tile(1,6,23,2,2), tile(4,6,23,2,2), tile(1,10,23,2,1), tile(4,10,23,2,1), tile(1,11,23,2,1), tile(4,11,23,2,1) ]},
    {title:'Le trolley coulissant', az:-55, el:18, pose:{trolley:1},
     text:`Deux <b>axes 7</b> verticaux, glissés par le haut dans les briques rondes (ils traversent aussi la plaque Technic). En haut de chacun, un <b>connecteur perpendiculaire</b>. La poignée : un <b>axe 4</b> à travers les deux connecteurs, avec 2 <b>bagues</b> au milieu. Tire la poignée vers le haut pour sortir le trolley, pousse pour le rentrer.`,
     tip:`Le trou en croix des briques rondes freine l'axe : le trolley reste à la hauteur où tu le lâches.`,
     pieces: inGroup([ ...TROL_X.flatMap(x => [axleV(7, x, TROL_Z, CONN_Y + 8 - 56), perpConn(x, TROL_Z, CONN_Y)]),
                       axle(4, 1.5*S, TROL_Z, CONN_Y + 12), bush(24, TROL_Z, CONN_Y + 12), bush(32, TROL_Z, CONN_Y + 12) ], 'trolley')},
    {title:'Les pédales pliantes', az:-55, el:24, pose:{pedals:.5},
     text:`Pour chaque pédale : une <b>plaque 1x6</b> + 2 <b>plaques 1x2 à clips</b> (clips vers le flanc), reliées par une <b>plaque 2x6</b>. Clipse-la sur les barres du bas du flanc : elle se replie contre la roue.`,
     pieces: [ ...inGroup(pedalL, 'pedalL'), ...inGroup(pedalL.map(p => mirror(p, W)), 'pedalR') ]},
    {title:'Support de présentation (facultatif)', az:-64, el:14,
     text:`Pour l'exposer debout sans béquille : sous chaque pédale, une <b>plaque 4x6 beige</b> et une pile de ${nbr} brique${nbr>1?'s':''} 2x4${npl?` + ${npl} plaque${npl>1?'s':''} 2x4`:''} (${n} plaques de haut au total pour ta roue).`,
     pieces: [ ...inGroup(standL, 'stand'), ...inGroup(standL.map(p => mirror(p, W)), 'stand') ]},
  ];

  const groups = {
    swing:   {matrix: pose => rotAbout(X_AXIS, swingAngle(pose), 0, AXLE_Y, PIV_Z)},
    trolley: {matrix: pose => new THREE.Matrix4().makeTranslation(0, (pose.trolley||0) * TROL_UP, 0)},
    pedalL:  {matrix: pose => rotAbout(Z_AXIS, -(pose.pedals||0) * Math.PI/2, PED_X, PED_Y, 0)},
    pedalR:  {matrix: pose => rotAbout(Z_AXIS,  (pose.pedals||0) * Math.PI/2, W*S - PED_X, PED_Y, 0)},
    stand:   {visible: pose => pose.stand > .5 && (pose.pedals||0) < .02 && (pose.susp||0) < .02},
  };

  return {
    zoff: ZOFF, W, groups, steps,
    center: [MID_X, AXLE_Z],
    defaultPose: {trolley:0, pedals:0, susp:0, stand:1},
    controls: [
      {key:'trolley', label:'Trolley sorti', type:'toggle'},
      {key:'pedals', label:'Pédales repliées', type:'toggle'},
      {key:'susp', label:'Suspension', type:'range'},
      {key:'stand', label:'Support', type:'toggle'},
    ],
    state: pose => {
      const a = swingAngle(pose), c = Math.cos(a), s = Math.sin(a);
      const axle = {zm: PIV_Z + ARM_A*c, ym: AXLE_Y - ARM_A*s};
      const cross = {zm: PIV_Z + ARM_C*c, ym: AXLE_Y - ARM_C*s};
      return {axle, shock: cross, groundY: axle.ym - r};
    },
    info: {r, wheel: wh, standPlates: n, bushes: nb},
  };
}

Object.assign(LEGO, {kingsongS18, WHEELS_S18, standPlatesS18});
})();
