// Géométrie 3D de chaque type de pièce.
(function(){
const { S, P, HOLE, COL } = LEGO;

const matCache = {};
function mat(c){
  if(!matCache[c]){
    const k = COL[c];
    matCache[c] = new THREE.MeshLambertMaterial({color:k.hex, transparent:!!k.opacity, opacity:k.opacity||1,
      polygonOffset:true, polygonOffsetFactor:1, polygonOffsetUnits:1});
  }
  return matCache[c];
}
const DARK = new THREE.MeshBasicMaterial({color:0x111111, side:THREE.DoubleSide});
const STUD = new THREE.CylinderGeometry(2.4,2.4,1.7,20);
const STUD_X = STUD.clone().rotateZ(Math.PI/2);
const STUD_Z = STUD.clone().rotateX(Math.PI/2);
const DIR_ANGLE = {'+y':0, '-y':Math.PI, '+x':Math.PI/2, '-x':-Math.PI/2};

// profil (u = sens de la pente, v = hauteur) extrudé sur 16 mm, centré, puis orienté selon dir
function profileGeo(pts, depth, dir){
  const sh = new THREE.Shape(pts.map(([u,v]) => new THREE.Vector2(u,v)));
  const geo = new THREE.ExtrudeGeometry(sh, {depth, bevelEnabled:false, curveSegments:12});
  geo.rotateY(-Math.PI/2);           // u -> Z, extrusion -> -X
  geo.translate(depth/2, 0, 0);
  geo.rotateY(DIR_ANGLE[dir] || 0);
  return geo;
}

function makePiece(p, zoff=0){
  const g = new THREE.Group(); g.userData.p = p;
  const m = mat(p.c), edgeCol = COL[p.c].edge;
  const add = (geo, x,y,z, o={}) => {
    const mesh = new THREE.Mesh(geo, o.mat || m); mesh.position.set(x,y,z);
    (o.parent || g).add(mesh);
    if(!o.noEdge){
      const e = new THREE.LineSegments(new THREE.EdgesGeometry(geo, 25), new THREE.LineBasicMaterial({color:edgeCol}));
      e.position.set(x,y,z); e.userData.edge = true; e.userData.base = edgeCol; (o.parent || g).add(e);
    }
    return mesh;
  };
  const studs = (x0,z0,w,l,yTop) => { for(let i=0;i<w;i++) for(let j=0;j<l;j++) add(STUD, x0+(i+.5)*S, yTop+.85, z0+(j+.5)*S); };
  const X = p.x*S, Z = p.y*S, Yb = (p.z+zoff)*P;

  switch(p.t){
    case 'box': case 'technic': case 'technicplate': case 'headlight': case 'sidestud': case 'barplate': case 'clipplate': {
      const geo = new THREE.BoxGeometry(p.w*S-.3, p.h*P-.1, p.l*S-.3);
      add(geo, X+p.w*S/2, Yb+p.h*P/2, Z+p.l*S/2);
      if(p.studs !== false) studs(X,Z,p.w,p.l,Yb+p.h*P);
      if(p.t==='technic'){
        const hole = new THREE.CircleGeometry(2.5,24);
        for(let j=1;j<p.l;j++) for(const side of [0,1]){
          const h = new THREE.Mesh(hole, DARK);
          h.rotation.y = side ? Math.PI/2 : -Math.PI/2;
          h.position.set(side ? X+p.w*S+.03 : X-.03, Yb+HOLE, Z+j*S); g.add(h);
        }
      }
      if(p.t==='technicplate'){
        const hole = new THREE.CircleGeometry(2.5,20);
        for(let i=1;i<p.w;i++){ const h = new THREE.Mesh(hole, DARK); h.rotation.x = -Math.PI/2; h.position.set(X+i*S, Yb+P+.03, Z+S); g.add(h); }
      }
      if(p.t==='sidestud'){
        const s = p.dir==='-x' ? -1 : 1, face = s<0 ? X : X+S;
        for(let j=0;j<p.l;j++) add(STUD_X, face + s*.85, Yb+4.8, Z+(j+.5)*S);
      }
      if(p.t==='headlight'){
        const s = p.dir==='-y' ? -1 : 1;
        add(STUD_Z, X+4, Yb+5.4, (s<0 ? Z : Z+S) + s*.85, {noEdge:true});
      }
      if(p.t==='barplate'){
        const s = p.dir==='-x' ? -1 : 1, face = s<0 ? X : X+S;
        const bar = new THREE.CylinderGeometry(1.6,1.6,p.l*S-3,12); bar.rotateX(Math.PI/2);
        add(bar, face + s*3, Yb+1.6, Z+p.l*S/2);
        const end = new THREE.BoxGeometry(3.2,2.4,1.6);
        add(end, face + s*1.6, Yb+1.6, Z+1.2); add(end, face + s*1.6, Yb+1.6, Z+p.l*S-1.2);
      }
      if(p.t==='clipplate'){
        const s = p.dir==='-x' ? -1 : 1, face = s<0 ? X : X+S;
        const clip = new THREE.BoxGeometry(3.2,3.4,3.4);
        for(let j=0;j<p.l;j++) add(clip, face + s*1.6, Yb+1.6, Z+(j+.5)*S);
      }
      break;
    }
    case 'slope': {
      // profil : rangée haute (1 tenon, 9,6 mm) puis pente jusqu'à 1 plaque au bord bas, descente vers +u
      const pts = [[-8,0],[-8,9.5],[-0.5,9.5],[8,1.2],[8,0]];
      const along = p.dir==='+y' || p.dir==='-y';
      add(profileGeo(pts, p.n*S-.3, p.dir), X + p.w*S/2, Yb, Z + p.l*S/2);
      if(p.dir==='+y') studs(X, Z, p.w, 1, Yb+p.h*P);
      if(p.dir==='-y') studs(X, Z+S, p.w, 1, Yb+p.h*P);
      if(p.dir==='+x') studs(X, Z, 1, p.l, Yb+p.h*P);
      if(p.dir==='-x') studs(X+S, Z, 1, p.l, Yb+p.h*P);
      break;
    }
    case 'curvelong': {
      const L = p.n*S/2, pts = [[-L,0],[-L,6.3]];
      for(let i=0;i<=16;i++){ const u = -L+2 + (2*L-2)*i/16; pts.push([u, 1 + 5.3*Math.cos(i/16*Math.PI/2)]); }
      pts.push([L,0]);
      add(profileGeo(pts, S-.3, p.dir), X + p.w*S/2, Yb, Z + p.l*S/2);
      break;
    }
    case 'bracket': {
      add(new THREE.BoxGeometry(S-.3, P-.1, 2*S-.3), X+4, Yb+P/2, Z+S);
      studs(X, Z, 1, 2, Yb+P);
      const top = Yb+P, s = p.dir==='-x' ? -1 : 1, face = s<0 ? X : X+S;
      add(new THREE.BoxGeometry(P-.1, 2*S-.1, 2*S-.3), face - s*P/2, top - S, Z+S);
      for(const dy of [4,12]) for(const dz of [4,12]) add(STUD_X, face + s*.85, top - dy, Z + dz);
      break;
    }
    case 'curve': {
      const pts = [[-8,0],[-8,6.3]];
      for(let i=0;i<=12;i++){ const u = -6 + 14*i/12; pts.push([u, 1 + 5.3*Math.cos(i/12*Math.PI/2)]); }
      pts.push([8,0]);
      add(profileGeo(pts, 15.7, p.dir), X+8, Yb, Z+8);
      break;
    }
    case 'invslope': {
      const pts = [[-8,9.6],[8,9.6],[8,0],[0,0],[-8,8]].map(([u,v])=>[-u,v]); // pente vers -u, sens '+y'
      add(profileGeo(pts, 15.7, p.dir), X+8, Yb, Z+8);
      studs(X,Z,2,2,Yb+9.6);
      break;
    }
    case 'round': {
      add(new THREE.CylinderGeometry(3.9,3.9,9.5,28), X+4, Yb+4.8, Z+4);
      studs(X,Z,1,1,Yb+9.6);
      break;
    }
    case 'round2': {
      const hh = p.h*P - .1;
      add(new THREE.CylinderGeometry(7.9,7.9,hh,40), X+8, Yb+hh/2, Z+8);
      studs(X,Z,2,2,Yb+p.h*P);
      const cross = new THREE.BoxGeometry(4.8,.2,1.8);
      const c1 = new THREE.Mesh(cross, DARK); c1.position.set(X+8, Yb+p.h*P+.05, Z+8); g.add(c1);
      const c2 = c1.clone(); c2.rotation.y = Math.PI/2; g.add(c2);
      break;
    }
    case 'rplate': {
      if(!p.dir){
        add(new THREE.CylinderGeometry(3.9,3.9,3.1,28), X+4, Yb+1.6, Z+4);
        studs(X,Z,1,1,Yb+3.2);
      } else {
        const s = p.dir==='-y' ? -1 : 1, face = s<0 ? Z : Z+S;
        const geo = new THREE.CylinderGeometry(3.9,3.9,3.1,28); geo.rotateX(Math.PI/2);
        add(geo, X+4, Yb+5.4, face + s*1.6);
        add(STUD_Z, X+4, Yb+5.4, face + s*(3.2+.85));
      }
      break;
    }
    case 'liftarm': {
      const L = (p.n-1)*S, r = 3.6;
      const sh = new THREE.Shape();
      sh.moveTo(0,-r); sh.lineTo(L,-r); sh.absarc(L,0,r,-Math.PI/2,Math.PI/2,false);
      sh.lineTo(0,r); sh.absarc(0,0,r,Math.PI/2,Math.PI*1.5,false);
      for(let i=0;i<p.n;i++){ const h = new THREE.Path(); h.absarc(i*S,0,2.4,0,Math.PI*2,true); sh.holes.push(h); }
      const geo = new THREE.ExtrudeGeometry(sh,{depth:7.2,bevelEnabled:false,curveSegments:10});
      geo.rotateY(-Math.PI/2);
      const zStart = p.dir > 0 ? p.z0 : p.z0 - L;
      add(geo, p.x*S + 7.6, p.ym, zStart);
      break;
    }
    case 'pin': {
      const len = p.xb - p.xa;
      const geo = new THREE.CylinderGeometry(2.35,2.35,len,16); geo.rotateZ(Math.PI/2);
      add(geo, (p.xa+p.xb)/2, p.ym, p.zm);
      const col = new THREE.CylinderGeometry(3,3,1.4,16); col.rotateZ(Math.PI/2);
      add(col, (p.xa+p.xb)/2, p.ym, p.zm);
      break;
    }
    case 'axle': {
      const len = p.n*S - .4, cx = p.xa + p.n*S/2;
      add(new THREE.BoxGeometry(len,4.6,1.8), cx, p.ym, p.zm);
      add(new THREE.BoxGeometry(len,1.8,4.6), cx, p.ym, p.zm);
      break;
    }
    case 'axleV': {
      const len = p.n*S - .4, cy = p.ya + p.n*S/2;
      add(new THREE.BoxGeometry(4.6,len,1.8), p.xm, cy, p.zm);
      add(new THREE.BoxGeometry(1.8,len,4.6), p.xm, cy, p.zm);
      break;
    }
    case 'perpconn': {
      add(new THREE.BoxGeometry(7.6,15.6,7.6), p.xm, p.yb+8, p.zm);
      const hole = new THREE.CircleGeometry(2.5,20);
      for(const s of [-1,1]){ const h = new THREE.Mesh(hole, DARK); h.rotation.y = s*Math.PI/2; h.position.set(p.xm + s*3.85, p.yb+12, p.zm); g.add(h); }
      break;
    }
    case 'bush': {
      const geo = new THREE.CylinderGeometry(3.7,3.7,p.half?3.6:7.4,20); geo.rotateZ(Math.PI/2);
      add(geo, p.xm, p.ym, p.zm);
      break;
    }
    case 'wheel': {
      const {xm:cx, ym:cy, zm:cz, r, w} = p;
      const tire = new THREE.CylinderGeometry(p.road ? r : r-2.2, p.road ? r : r-2.2, w, 72); tire.rotateZ(Math.PI/2);
      add(tire, cx,cy,cz);
      if(p.road){   // pneu route : jante claire à rayons
        const rim = new THREE.CylinderGeometry(r*.66,r*.66,w+.6,48); rim.rotateZ(Math.PI/2);
        add(rim, cx,cy,cz, {mat:mat(p.hub||'ltgrey')});
        const spoke = new THREE.BoxGeometry(w+1,r*1.2,2.2);
        for(let i=0;i<5;i++){ const k = new THREE.Mesh(spoke, mat('dkgrey')); k.position.set(cx,cy,cz); k.rotation.x = i*Math.PI/5; g.add(k); }
        const ctr = new THREE.CylinderGeometry(9,9,w+1.6,24); ctr.rotateZ(Math.PI/2);
        add(ctr, cx,cy,cz, {mat:mat('dkgrey')});
        break;
      }
      const knob = new THREE.BoxGeometry(w*.42,2.6,5);
      const N = Math.round(r*.75);
      for(let i=0;i<N;i++){
        const a = i/N*Math.PI*2;
        for(const off of (i%2 ? [-w*.27, w*.27] : [0])){
          const k = new THREE.Mesh(knob, m);
          k.position.set(cx+off, cy+Math.cos(a)*(r-1.3), cz+Math.sin(a)*(r-1.3));
          k.rotation.x = -a; g.add(k);
        }
      }
      const hub = new THREE.CylinderGeometry(r*.62,r*.62,w+.6,40); hub.rotateZ(Math.PI/2);
      add(hub, cx,cy,cz, {mat:mat('dkgrey')});
      const ctr = new THREE.CylinderGeometry(6,6,w+1.4,20); ctr.rotateZ(Math.PI/2);
      add(ctr, cx,cy,cz);
      break;
    }
    case 'shock': {
      // construit vers le bas (-Y local) depuis l'œil du haut ; orienté par updateShock
      const sh = new THREE.Group(); sh.position.set(p.x*S+4, p.top.ym, p.top.zm); g.add(sh);
      const eye = new THREE.CylinderGeometry(3.9,3.9,7.4,20); eye.rotateZ(Math.PI/2);
      add(eye, 0,0,0, {parent:sh});
      add(new THREE.CylinderGeometry(4.2,4.2,20,20), 0,-13,0, {parent:sh});          // corps gris
      const bot = new THREE.Group(); sh.add(bot);
      add(eye, 0,0,0, {parent:bot, mat:mat('black')});
      add(new THREE.CylinderGeometry(1.6,1.6,30,10), 0,15,0, {parent:bot, mat:mat('black'), noEdge:true}); // tige
      const pts = []; const turns = 7;
      for(let i=0;i<=turns*24;i++){ const a = i/24*Math.PI*2; pts.push(new THREE.Vector3(3.6*Math.cos(a), i/(turns*24), 3.6*Math.sin(a))); }
      const spring = new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), turns*24, .7, 6), mat('black'));
      bot.add(spring);
      g.userData.shock = {sh, bot, spring};
      updateShock(g, p.top.zm, p.top.ym - 44);
      break;
    }
  }
  return g;
}

// oriente l'amortisseur entre son œil du haut (fixe) et le point bas (Z,Y) dans le même repère
function updateShock(g, zb, yb){
  const {sh, bot, spring} = g.userData.shock;
  const dz = zb - sh.position.z, dy = yb - sh.position.y;
  const L = Math.hypot(dz, dy);
  sh.rotation.x = Math.atan2(-dz, -dy);
  bot.position.set(0, -L, 0);
  const sl = Math.max(L - 27, 2);           // ressort entre l'œil du bas et le corps
  spring.position.set(0, 4, 0); spring.scale.set(1, sl-4, 1);
}

Object.assign(LEGO, {mat, makePiece, updateShock});
})();
