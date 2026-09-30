// Plan Powerpads : 2 paires (grand pad tibia + petit pad mollet) pour la Sherman S V2.
(function(){
const { inGroup } = LEGO;
const { shermanV2 } = LEGO;
const { bigPadLayers, smallPadLayers, mountedPads } = LEGO;

function powerpads(opts = {}){
  const c = opts.padColor || 'red';
  const base = shermanV2({wheel:'82', padColor:c});
  const big = bigPadLayers(c), small = smallPadLayers(c);
  const onlyBig = ['bigBuild'], onlySmall = ['smallBuild'];

  const steps = [
    {title:'Grand pad (tibia) — la base', show:onlyBig, mult:2, az:-30, el:50,
     text:`Une <b>plaque 4x6</b> + une <b>plaque 1x4</b> au bout : ce bout sera le haut du pad. La rangée à l'autre bout est le bas, c'est elle qui se clipse sur les tenons latéraux de la roue.`,
     pieces: inGroup(big[0], 'bigBuild')},
    {title:'Grand pad — renfort', show:onlyBig, mult:2, az:-30, el:50,
     text:`Une deuxième <b>plaque 4x6</b> décalée d'une rangée, et une <b>plaque 1x4</b> au début : elles croisent le joint du dessous, le pad devient rigide.`,
     pieces: inGroup(big[1], 'bigBuild')},
    {title:'Grand pad — la face', show:onlyBig, mult:2, az:-30, el:50,
     text:`Quatre <b>tuiles 1x4</b> dans le sens de la longueur : les deux du milieu en <b>beige</b> (la bande antidérapante). Une tuile 1x4 en travers, puis deux <b>pentes incurvées 2x2</b> en haut pour la lèvre arrondie qui tient le tibia.`,
     tip:`Fais ce pad en 2 exemplaires identiques : le même va à gauche et à droite.`,
     pieces: inGroup(big[2], 'bigBuild')},
    {title:'Petit pad (mollet) — la base', show:onlySmall, mult:2, az:-30, el:50,
     text:`Deux <b>plaques 4x4</b> empilées.`,
     pieces: inGroup([...small[0], ...small[1]], 'smallBuild')},
    {title:'Petit pad — la face', show:onlySmall, mult:2, az:-30, el:50,
     text:`Quatre <b>tuiles 1x2</b> (les deux du milieu en beige) et deux <b>pentes incurvées 2x2</b> en haut.`,
     tip:`Là aussi, 2 exemplaires identiques.`,
     pieces: inGroup(small[2], 'smallBuild')},
    {title:'Montage sur la roue', az:-62, el:16,
     text:`Clipse chaque pad par sa rangée du bas sur la <b>brique 1x4 à tenons latéraux</b> du flanc : le <b>grand pad sur la colonne avant</b> (tibia), le <b>petit sur la colonne arrière</b> (mollet), des deux côtés. Les pads dépassent au-dessus de la coque comme les vrais.`,
     tip:`Les pads laissent voir la fente de l'amortisseur, et les pédales repliées passent en dessous.`,
     pieces: mountedPads(c).map(p => ({...p, noBom:true}))},
  ];

  // la Sherman V2 sert de décor (hors inventaire)
  const context = base.steps.flatMap(s => s.pieces);
  return {
    ...base,
    groups: { ...base.groups,
      bigBuild:   {zoff:0, main:false},
      smallBuild: {zoff:0, main:false},
    },
    steps, context,
    defaultPose: {...base.defaultPose, pads:1},
    controls: base.controls.filter(k => k.key !== 'pads'),
  };
}

Object.assign(LEGO, {powerpads});
})();
