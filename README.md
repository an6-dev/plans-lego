# Plans LEGO

Notices de montage LEGO en 3D : site web statique qui tourne en local, sans internet.

En ligne : https://an6-dev.github.io/plans-lego/

## Ouvrir

Double-clique sur `index.html`. Pas de serveur, pas d'internet, pas d'installation.

Tout le JavaScript est en scripts classiques (`<script src>`) qui partagent un objet global `LEGO`.
Pas de modules `import`/`export` : le navigateur les bloque quand la page est ouverte depuis un fichier.

## Organisation

```
index.html                  sommaire de tous les plans
lib/
  vendor/                   three.js r160 (rendu 3D) en version script classique (window.THREE)
  css/plan.css              style commun des plans
  lego/core.js              couleurs, références, constructeurs de pièces (brique, plaque, Technic…)
  lego/geometry.js          forme 3D de chaque type de pièce
  lego/engine.js            groupes articulés, poses, rendus des étapes, visionneuse
  lego/page.js              génère une page de plan complète à partir d'une config
  lego/voxel.js             « calques » (une grille de lettres par couche) -> briques, pour les formes sculptées
plans/
  sherman-s-v1/             V1 (page autonome, conservée telle quelle)
  sherman-s-v2/             model.js (le modèle) + index.html (la page)
  sherman-s-powerpads/      pads.js (les pads, réutilisés par la V2) + model.js + index.html
  kingsong-s18/             model.js + index.html
  masque-sunraku/           model.js (calques de la tête) + index.html
Sherman S/, Kingsong S18/, Masque Sunraku - …/  photos de référence
```

## Faire un nouveau plan

1. Copie `plans/sherman-s-v2/` dans un nouveau dossier.
2. Dans `model.js`, décris les étapes avec les constructeurs de `lib/lego/core.js`
   (`brick(x,y,z,largeur,longueur,couleur)`, `plate(...)`, `technicBrick(...)`, `liftarm(...)`…).
   Les pièces mobiles vont dans des groupes qui ont une fonction `matrix(pose)`.
   Termine le fichier par `Object.assign(LEGO, {monModele})`.
3. Dans `index.html`, garde la liste des `<script src>` (bibliothèque puis ton model.js) et adapte le titre, les photos et les options.
4. Ajoute une carte dans `index.html` à la racine.
