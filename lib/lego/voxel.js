// Transforme des « calques » (une grille de caractères par couche de briques) en vraies briques.
// Chaque caractère = une couleur (via palette), '.' = vide. Rangées = y (avant -> arrière), colonnes = x.
// Remplissage glouton avec les plus grandes briques possibles, en croisant les joints de la couche du dessous
// et en s'assurant que chaque brique touche la couche du dessous ou du dessus.
(function(){
const { brick } = LEGO;

const SIZES = [[2,8],[2,6],[2,4],[2,3],[2,2],[1,8],[1,6],[1,4],[1,3],[1,2],[1,1]];

// layers : [{k (index de couche), rows:[...]}] ; palette : {char: couleur} ; hauteur d'une couche = 1 brique
function tileLayers(layers, palette, {x0=0, y0=0} = {}){
  const cell = (L, x, y) => { const r = L && L.rows[y]; return r && r[x] && r[x] !== '.' ? r[x] : null; };
  const byK = Object.fromEntries(layers.map(L => [L.k, L]));
  const out = []; const warnings = [];
  let below = null;   // carte cellule -> id de brique de la couche du dessous
  [...layers].sort((a,b) => a.k-b.k).forEach(L => {
    const H = L.rows.length, Wd = Math.max(...L.rows.map(r => r.length));
    const covered = Array.from({length:H}, () => Array(Wd).fill(false));
    const map = {};
    const under = byK[L.k-1], over = byK[L.k+1];
    let id = 0;
    for(let y=0;y<H;y++) for(let x=0;x<Wd;x++){
      const ch = cell(L,x,y); if(!ch || covered[y][x]) continue;
      let best = null;
      // une case libre de même couleur sans voisine libre -> finira en 1x1 : on l'évite
      const free = (cx,cy) => cell(L,cx,cy) === ch && !covered[cy][cx];
      for(const [a,b] of SIZES) for(const [w,l] of (a===b ? [[a,b]] : [[a,b],[b,a]]))
      for(let ox=x-w+1; ox<=x; ox++) for(let oy=y-l+1; oy<=y; oy++){
        if(ox < 0 || oy < 0 || ox+w > Wd || oy+l > H) continue;
        let ok = true, supp = 0; const ids = new Set();
        for(let j=0;j<l && ok;j++) for(let i=0;i<w && ok;i++){
          if(!free(ox+i,oy+j)) ok = false;
          else {
            if(cell(under,ox+i,oy+j) || cell(over,ox+i,oy+j)) supp++;
            const bid = below && below[`${ox+i},${oy+j}`]; if(bid !== undefined) ids.add(bid);
          }
        }
        if(!ok) continue;
        const inside = (cx,cy) => cx>=ox && cx<ox+w && cy>=oy && cy<oy+l;
        let orphans = 0;
        for(let j=-1;j<=l;j++) for(let i=-1;i<=w;i++){
          const cx = ox+i, cy = oy+j;
          if(inside(cx,cy) || cy<0 || cy>=H || cx<0 || cx>=Wd || !free(cx,cy)) continue;
          const nb = [[1,0],[-1,0],[0,1],[0,-1]].some(([dx,dy]) => { const nx=cx+dx, ny=cy+dy;
            return ny>=0 && ny<H && nx>=0 && nx<Wd && !inside(nx,ny) && free(nx,ny); });
          if(!nb) orphans++;
        }
        const score = w*l*4 + ids.size*3 - orphans*10 - (Math.max(w,l) > 6 ? 3 : 0) + (supp ? 0 : -1000);
        if(!best || score > best.score) best = {w,l,ox,oy,score,supp};
      }
      for(let j=0;j<best.l;j++) for(let i=0;i<best.w;i++){ covered[best.oy+j][best.ox+i] = true; map[`${best.ox+i},${best.oy+j}`] = id; }
      if(!best.supp) warnings.push(`couche ${L.k} : brique ${best.w}x${best.l} en (${best.ox},${best.oy}) sans appui`);
      out.push({...brick(x0+best.ox, y0+best.oy, L.k*3, best.w, best.l, palette[ch]), layer:L.k});
      id++;
    }
    below = map;
  });
  if(warnings.length) console.warn(warnings.join('\n'));
  return out;
}

Object.assign(LEGO, {tileLayers});
})();
