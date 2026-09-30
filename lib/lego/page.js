(function(){
// Génère une page de plan complète à partir d'une config.
const { COL, REF, hexStr } = LEGO;
const { renderThumbs, renderSteps, bom, Viewer, keyOf } = LEGO;

const $ = (sel, el=document) => el.querySelector(sel);
const esc = s => String(s).replace(/[&<>"]/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const sw = c => `<span class="sw" style="background:${hexStr(COL[c].hex)}"></span>`;

/*
 cfg = {
   title, titleAccent, subtitle, back:'../../index.html',
   photos:[{src,alt}], stats:(def)=>[[val,label]],
   options:[{key,label,choices:[{value,label}],default,help}],
   factory:(opts)=>def,
   sections:[{title, html:(opts,def)=>string}],   // après « Tes choix »
   notes: html (sous l'inventaire), intro: html, footer: html
 }
*/
function mountPlan(cfg){
  const opts = Object.fromEntries((cfg.options||[]).map(o => [o.key, o.default]));
  const num = () => '<span class="n"></span>';

  document.title = cfg.title.replace(/<[^>]+>/g,'');
  document.body.innerHTML = `
  <header><div class="wrap">
    <div class="topbar noprint"><a href="${cfg.back||'../../index.html'}">← Tous les plans</a>
      <button class="printbtn" onclick="window.print()">Imprimer / PDF</button></div>
    <h1>${cfg.title}</h1>
    <p>${cfg.subtitle||''}</p>
    <div class="stats" id="stats"></div>
  </div></header>
  <main class="wrap">
    <h2>Le modèle</h2>
    <p class="lead">${cfg.intro || 'Tourne-le à la souris, le curseur montre chaque étape du montage.'}</p>
    <div id="viewer"><div class="hint">glisser pour tourner · molette pour zoomer</div></div>
    <div class="vbar noprint">
      <button id="prev" aria-label="Étape précédente">◀</button>
      <input type="range" id="slider" min="1" value="1" aria-label="Étape">
      <button id="next" aria-label="Étape suivante">▶</button>
      <span id="vlabel"></span>
    </div>
    <div class="vctl noprint" id="vctl"></div>
    ${cfg.photos?.length ? `<h2>Photos de référence</h2><div class="photos">${cfg.photos.map(p=>`<figure><img src="${p.src}" alt="${esc(p.alt||'')}" loading="lazy">${p.alt?`<figcaption>${esc(p.alt)}</figcaption>`:''}</figure>`).join('')}</div>` : ''}
    ${cfg.options?.length ? `<h2>${num()}Tes choix</h2><div class="card options" id="options"></div>` : ''}
    <div id="sections"></div>
    <h2>${num()}Inventaire</h2>
    <p class="lead">Les couleurs sont des suggestions. Les références (n° LEGO / BrickLink) sont là pour t'aider à trier.</p>
    <div class="bom" id="bom"><span class="loading">Génération des images…</span></div>
    ${cfg.notes ? `<div class="card" style="margin-top:14px">${cfg.notes}</div>` : ''}
    <h2>${num()}Montage</h2>
    <p class="lead">${cfg.stepsIntro || 'Les pièces à ajouter à chaque étape sont entourées d\'<b class="hl">orange</b>.'}</p>
    <div id="steps"><span class="loading">Génération des étapes…</span></div>
    <footer>${cfg.footer || 'Plan pour un MOC personnel. LEGO® est une marque du groupe LEGO, qui ne sponsorise pas ce plan.'}</footer>
  </main>`;

  // options
  if(cfg.options?.length){
    $('#options').innerHTML = cfg.options.map(o => `
      <label class="opt"><span>${o.label}</span>
        <select data-key="${o.key}">${o.choices.map(c => `<option value="${c.value}" ${c.value==o.default?'selected':''}>${esc(c.label)}</option>`).join('')}</select>
      </label>${o.help ? `<p class="help">${o.help}</p>` : ''}`).join('');
    $('#options').addEventListener('change', e => {
      const key = e.target.dataset.key; if(!key) return;
      opts[key] = e.target.value; rebuild(true);
    });
  }

  const viewer = new Viewer($('#viewer'));
  const slider = $('#slider'), label = $('#vlabel');
  let def;

  function renderSections(){
    $('#sections').innerHTML = (cfg.sections||[]).map(s => `<h2>${num()}${s.title}</h2>${s.html(opts, def)}`).join('');
    document.querySelectorAll('main h2 .n').forEach((x,i) => x.textContent = i+1);
  }

  function showStep(s){
    slider.value = s; viewer.setStep(s);
    label.textContent = s === def.steps.length ? 'Modèle terminé' : `Étape ${s} — ${def.steps[s-1].title}`;
  }
  slider.oninput = () => showStep(+slider.value);
  $('#prev').onclick = () => showStep(Math.max(1, +slider.value-1));
  $('#next').onclick = () => showStep(Math.min(def.steps.length, +slider.value+1));

  function renderControls(){
    const ctl = def.controls || [];
    $('#vctl').innerHTML = ctl.map(c => c.type === 'range'
      ? `<label class="ctl"><span>${c.label}</span><input type="range" min="0" max="1" step="0.01" value="${def.defaultPose[c.key]??0}" data-key="${c.key}"></label>`
      : `<label class="ctl tog"><input type="checkbox" data-key="${c.key}" ${def.defaultPose[c.key]?'checked':''}><span>${c.label}</span></label>`).join('');
    $('#vctl').querySelectorAll('input').forEach(inp => inp.oninput = () =>
      viewer.setPose(inp.dataset.key, inp.type === 'checkbox' ? (inp.checked ? 1 : 0) : +inp.value));
  }

  function rebuild(keepCamera=false){
    def = cfg.factory({...opts});
    $('#bom').innerHTML = '<span class="loading">Génération des images…</span>';
    $('#steps').innerHTML = '<span class="loading">Génération des étapes…</span>';
    renderSections();
    viewer.setModel(def, {keepCamera, ...(cfg.view||{})});
    slider.max = def.steps.length; showStep(def.steps.length);
    renderControls();
    const total = bom(def).reduce((a,b) => a+b.n, 0);
    $('#stats').innerHTML = [[total,'pièces'],[def.steps.length,'étapes'], ...(cfg.stats ? cfg.stats(opts, def) : [])]
      .map(([b,s]) => `<div class="stat"><b>${b}</b><small>${s}</small></div>`).join('');
    setTimeout(() => {
      const thumbs = renderThumbs(def);
      const colorOrder = Object.keys(COL);
      const items = bom(def).sort((a,b) => colorOrder.indexOf(a.c)-colorOrder.indexOf(b.c) || a.name.localeCompare(b.name,'fr',{numeric:true}));
      $('#bom').innerHTML = items.map(it => `<div class="part"><img src="${thumbs[it.key]}" alt=""><div class="q">×${it.n}</div>
        <div class="nm">${it.name}</div><div class="rf">${sw(it.c)}${COL[it.c].name} · ${REF[it.name]||''}</div></div>`).join('');
      setTimeout(() => {
        const imgs = renderSteps(def);
        $('#steps').innerHTML = def.steps.map((s,i) => {
          const counts = new Map();
          s.pieces.filter(p => !p.noBom).forEach(p => { const k = keyOf(p); counts.set(k,(counts.get(k)||0)+1); });
          const call = [...counts.entries()].map(([k,c]) => { const [name,col] = k.split('|');
            return `<div class="it"><img src="${thumbs[k]}" alt=""><b>${c}×</b>${name}<br>${sw(col)}${COL[col].name}</div>`; }).join('');
          return `<div class="step card">
            <div class="img"><span class="num">${i+1}</span>${s.mult>1?`<span class="mult">à faire ×${s.mult}</span>`:''}<img src="${imgs[i]}" alt="Étape ${i+1}"></div>
            <div><h3>${s.title}</h3>${call?`<div class="callout">${call}</div>`:''}<p>${s.text}</p>${s.tip?`<div class="tip">${s.tip}</div>`:''}</div>
          </div>`;
        }).join('');
      }, 30);
    }, 30);
  }
  rebuild();
}

Object.assign(LEGO, {mountPlan});
})();
