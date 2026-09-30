(function(){
// Moteur : assemble un modèle (groupes articulés + pièces par étape), gère les poses,
// les rendus statiques (étapes, vignettes) et la visionneuse interactive.
const { OrbitControls } = THREE;
const { makePiece, updateShock } = LEGO;
const { COL } = LEGO;

/*
 def = {
   zoff,                              // décalage vertical (plaques) du repère grille
   groups: { id: {parent, zoff, matrix:(pose)=>Matrix4, visible:(pose)=>bool, main:bool} },
   steps: [{title, text, tip, az, el, pose, show:[groupIds], mult, pieces:[...]}],
   context: [...pieces toujours visibles, hors inventaire],
   state: (pose)=>({axle:{zm,ym}, groundY}),
   defaultPose, controls: [{key,label,type:'toggle'|'range'}]
 }
*/
const HIGHLIGHT = 0xff6a13;

function allPieces(def){
  const out = [];
  (def.context||[]).forEach(p => out.push({...p, step:0, noBom:true}));
  def.steps.forEach((s,i) => s.pieces.forEach(p => out.push({...p, step:i+1, mult:s.mult||1})));
  return out;
}

function makeScene(){
  const sc = new THREE.Scene();
  sc.add(new THREE.HemisphereLight(0xffffff, 0x777777, 1.9));
  const d1 = new THREE.DirectionalLight(0xffffff, 1.7); d1.position.set(-80,140,-110); sc.add(d1);
  const d2 = new THREE.DirectionalLight(0xffffff, .6); d2.position.set(100,60,120); sc.add(d2);
  return sc;
}

// construit la hiérarchie dans une scène ; renvoie un « rig » pilotable
function buildRig(def, scene){
  const root = new THREE.Group(); scene.add(root);
  const gobj = {root};
  const gdef = def.groups || {};
  const ids = Object.keys(gdef);
  ids.forEach(id => { const o = new THREE.Group(); o.matrixAutoUpdate = false; gobj[id] = o; });
  ids.forEach(id => (gobj[gdef[id].parent] || root).add(gobj[id]));
  const pieces = allPieces(def).map(p => {
    const gid = p.g || 'root';
    const zoff = (gdef[gid] && gdef[gid].zoff !== undefined) ? gdef[gid].zoff : def.zoff;
    const o = makePiece(p, zoff); o.userData.gid = gid;
    gobj[gid].add(o); return o;
  });
  const mainGroups = ['root', ...ids.filter(id => gdef[id].main !== false)];
  const rig = {
    root, gobj, pieces, pose: {...def.defaultPose},
    applyPose(pose){
      this.pose = pose;
      ids.forEach(id => {
        const d = gdef[id], o = gobj[id];
        if(d.matrix) o.matrix.copy(d.matrix(pose)); else o.matrix.identity();
        o.visible = d.visible ? d.visible(pose) : true;
      });
      const st = def.state ? def.state(pose) : {};
      const sb = st.shock || st.axle;
      pieces.forEach(o => { if(o.userData.p.t==='shock' && sb) updateShock(o, sb.zm, sb.ym); });
      root.updateMatrixWorld(true);
      return st;
    },
    setStep(s, {highlight=true, show=mainGroups} = {}){
      pieces.forEach(o => {
        const p = o.userData.p;
        o.visible = p.step <= s && show.includes(o.userData.gid);
        o.traverse(c => { if(c.userData.edge) c.material.color.setHex(highlight && p.step===s && s>0 ? (COL[p.c].hl || HIGHLIGHT) : c.userData.base); });
      });
    },
    mainGroups,
  };
  rig.applyPose(rig.pose);
  return rig;
}

const reallyVisible = o => { for(let x=o; x; x=x.parent) if(!x.visible) return false; return true; };

function fit(cam, objs, az, el, margin=1.08){
  const box = new THREE.Box3();
  objs.forEach(o => { if(reallyVisible(o)){ o.updateMatrixWorld(true); box.expandByObject(o); } });
  if(box.isEmpty()) box.set(new THREE.Vector3(-50,-50,-50), new THREE.Vector3(50,50,50));
  const sph = box.getBoundingSphere(new THREE.Sphere());
  const fovV = THREE.MathUtils.degToRad(cam.fov/2);
  const fovH = Math.atan(Math.tan(fovV)*cam.aspect);
  const d = sph.radius / Math.sin(Math.min(fovV,fovH)) * margin;
  const a = THREE.MathUtils.degToRad(az), e = THREE.MathUtils.degToRad(el);
  cam.position.set(sph.center.x + d*Math.sin(a)*Math.cos(e), sph.center.y + d*Math.sin(e), sph.center.z - d*Math.cos(a)*Math.cos(e));
  cam.near = d/20; cam.far = d*4; cam.lookAt(sph.center); cam.updateProjectionMatrix();
  return sph.center;
}

/* ---------- rendus statiques ---------- */
let OFF = null;
function off(){ if(!OFF){ OFF = new THREE.WebGLRenderer({antialias:true, alpha:true, preserveDrawingBuffer:true}); OFF.setPixelRatio(2); } return OFF; }

function snapshot(scene, objs, az, el, w, h, margin){
  const r = off(); r.setSize(w,h);
  const cam = new THREE.PerspectiveCamera(28, w/h, 1, 5000);
  fit(cam, objs, az, el, margin);
  r.render(scene, cam);
  return r.domElement.toDataURL('image/png');
}

const keyOf = p => `${p.name}|${p.c}`;

// vignette de chaque pièce distincte (clé nom+couleur)
function renderThumbs(def){
  const thumbs = {};
  const sc = makeScene();
  for(const p of allPieces(def)){
    if(p.noBom) continue;
    const k = keyOf(p); if(thumbs[k]) continue;
    const q = {...p}; if(q.t==='rplate') delete q.dir;
    const o = makePiece(q, 0); sc.add(o);
    const flat = q.t==='liftarm' || q.t==='axle' || q.t==='pin';
    thumbs[k] = snapshot(sc, [o], flat ? -70 : -35, flat ? 20 : 32, 160, 120, 1.02);
    sc.remove(o);
  }
  return thumbs;
}

// image de chaque étape
function renderSteps(def){
  const sc = makeScene();
  const rig = buildRig(def, sc);
  return def.steps.map((s,i) => {
    rig.applyPose({...def.defaultPose, ...(s.pose||{})});
    rig.setStep(i+1, {show: s.show || rig.mainGroups});
    return snapshot(sc, rig.pieces, s.az ?? -60, s.el ?? 28, 900, 640, 1.08);
  });
}

// inventaire : [{key,name,c,n}]
function bom(def){
  const m = new Map();
  for(const p of allPieces(def)){ if(p.noBom) continue; const k = keyOf(p); m.set(k, (m.get(k)||0) + (p.mult||1)); }
  return [...m.entries()].map(([k,n]) => { const [name,c] = k.split('|'); return {key:k,name,c,n}; });
}

/* ---------- visionneuse ---------- */
class Viewer {
  constructor(el){
    this.el = el;
    this.r = new THREE.WebGLRenderer({antialias:true, alpha:true});
    this.r.setPixelRatio(Math.min(devicePixelRatio,2));
    el.prepend(this.r.domElement);
    this.cam = new THREE.PerspectiveCamera(30, 1, 1, 5000);
    this.ctl = new OrbitControls(this.cam, this.r.domElement);
    this.ctl.enableDamping = true;
    addEventListener('resize', () => this.size());
    const loop = () => { this.tick(); requestAnimationFrame(loop); };
    requestAnimationFrame(loop);
  }
  size(){ const w = this.el.clientWidth, h = this.el.clientHeight; this.r.setSize(w,h,false); this.cam.aspect = w/h; this.cam.updateProjectionMatrix(); }
  setModel(def, {az=-62, el=18, keepCamera=false} = {}){
    this.def = def;
    this.sc = makeScene();
    this.rig = buildRig(def, this.sc);
    this.ground = new THREE.Mesh(new THREE.CircleGeometry(150,64), new THREE.MeshBasicMaterial({color:0xdcd8ce}));
    this.ground.rotation.x = -Math.PI/2; this.sc.add(this.ground);
    this.cur = {...def.defaultPose}; this.target = {...def.defaultPose};
    this.step = def.steps.length;
    this.size();
    this.setStep(this.step);
    if(!keepCamera){ const c = fit(this.cam, this.rig.pieces, az, el, 1.0); this.ctl.target.copy(c); }
    this.ctl.update();
  }
  setStep(s){ this.step = s; this.rig.setStep(s, {highlight: s < this.def.steps.length}); }
  setPose(k, v){ this.target[k] = v; }
  tick(){
    if(!this.rig) return;
    let moved = false;
    for(const k in this.target){
      const a = this.cur[k], b = this.target[k];
      if(typeof b === 'number' && Math.abs(a-b) > 1e-3){ this.cur[k] = a + (b-a)*.12; moved = true; }
      else this.cur[k] = b;
    }
    const st = this.rig.applyPose(this.cur);
    const c = this.def.center || [0,0];
    this.ground.position.set(c[0], (st.groundY ?? 0) - .2, c[1]);
    this.ctl.update();
    this.r.render(this.sc, this.cam);
  }
}

Object.assign(LEGO, {HIGHLIGHT, allPieces, makeScene, buildRig, fit, snapshot, keyOf, renderThumbs, renderSteps, bom, Viewer});
})();
