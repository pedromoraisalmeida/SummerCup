import { state } from '../state.js';
import { gameItemHTML, teamLogoIcon, isAprovado } from '../utils.js';

export function wireFilterBarScroll(bar) {
  const check = () => bar.classList.toggle('scrolled-end', bar.scrollLeft+bar.clientWidth>=bar.scrollWidth-4);
  bar.addEventListener('scroll', check, {passive:true});
  new ResizeObserver(check).observe(bar);
}

export function buildFilterEscalao() {
  const esc=[...new Set(state.currentGames.map(g=>g.escalao))].sort();
  let h='';
  if (state.profile.escalao) h=`<div class="filter-pill active" onclick="setEscalao('${state.profile.escalao}',this)">${state.profile.escalao} ★</div>`;
  esc.forEach(e=>{if(e!==state.profile.escalao)h+=`<div class="filter-pill ${!state.profile.escalao?'active':''}" onclick="setEscalao('${e}',this)">${e}</div>`;});
  const bar=document.getElementById('filter-escalao');
  bar.innerHTML=h;
  wireFilterBarScroll(bar);
  if(!state.profile.escalao) state.activeEscalao=esc[0];
}

export function buildFilterDia() {
  const dias = [...new Set(state.currentGames.map(g => g.dia))].sort();
  let h = `<div class="filter-pill active" onclick="setDia('todos',this)">Todos os dias</div>`;
  dias.forEach(d => h += `<div class="filter-pill" onclick="setDia('${d}',this)">${d.replace(/^0/, '').replace('/jul.', ' Jul.')}</div>`);
  const bar=document.getElementById('filter-dia');
  bar.innerHTML = h;
  wireFilterBarScroll(bar);
}

export function setEscalao(e, el) {
  state.activeEscalao=e;
  document.querySelectorAll('#filter-escalao .filter-pill').forEach(p=>p.classList.remove('active'));
  el.classList.add('active');
  renderJogos();
}

export function setDia(d, el) {
  state.activeDia=d;
  document.querySelectorAll('#filter-dia .filter-pill').forEach(p=>p.classList.remove('active'));
  el.classList.add('active');
  renderJogos();
}

export function renderJogos() {
  let f=state.currentGames.filter(g=>g.escalao===state.activeEscalao);
  if(state.activeDia!=='todos')f=f.filter(g=>g.dia===state.activeDia);
  f.sort((a,b)=>a.id-b.id);
  if(!f.length){document.getElementById('jogos-list').innerHTML=`<div class="empty"><div class="empty-icon">📅</div><div class="empty-txt">Nenhum jogo</div></div>`;return;}
  let h=`<div class="card"><div>`;
  f.forEach(g=>h+=gameItemHTML(g,true));
  h+=`</div></div>`;
  document.getElementById('jogos-list').innerHTML=h;
}

export function buildClassFilters() {
  const esc=[...new Set(state.currentGames.map(g=>g.escalao))].sort();
  if(!state.classEscalao) state.classEscalao=esc[0];
  let h='';
  esc.forEach(e=>h+=`<div class="filter-pill ${e===state.classEscalao?'active':''}" onclick="setClassEscalao('${e}',this)">${e}${e===state.profile.escalao?' ★':''}</div>`);
  const bar=document.getElementById('filter-class-escalao');
  bar.innerHTML=h;
  wireFilterBarScroll(bar);
  const active=bar.querySelector('.filter-pill.active');
  if(active) active.scrollIntoView({inline:'center',block:'nearest'});
  buildClassSeries();
}

export function buildClassSeries() {
  const s=[...new Set(state.currentGames.filter(g=>g.escalao===state.classEscalao).map(g=>g.serie))].filter(x=>/^[A-Za-z]$/.test(x)).sort();
  if(!state.classSerie||!s.includes(state.classSerie)) state.classSerie=s[0]||'';
  let h='';
  s.forEach(x=>h+=`<div class="filter-pill ${x===state.classSerie?'active':''}" onclick="setClassSerie('${x}',this)">Série ${x}${x===state.profile.serie&&state.classEscalao===state.profile.escalao?' ★':''}</div>`);
  const bar=document.getElementById('filter-class-serie');
  bar.innerHTML=h;
  wireFilterBarScroll(bar);
  const active=bar.querySelector('.filter-pill.active');
  if(active) active.scrollIntoView({inline:'center',block:'nearest'});
}

// scrollIntoView() não funciona em elementos dentro de uma página escondida
// (display:none) — quando os filtros são construídos numa página que não
// está ativa no momento (ex. refresh feito noutra página), o pill ativo
// fica correto mas não centrado. Chamar isto de novo quando a página
// "class" se torna visível corrige isso.
export function scrollClassFiltersIntoView() {
  ['filter-class-escalao', 'filter-class-serie'].forEach(id => {
    const bar = document.getElementById(id);
    const active = bar && bar.querySelector('.filter-pill.active');
    if (active) active.scrollIntoView({ inline: 'center', block: 'nearest' });
  });
}

export function setClassEscalao(e, el) {
  state.classEscalao=e; state.classSerie='';
  document.querySelectorAll('#filter-class-escalao .filter-pill').forEach(p=>p.classList.remove('active'));
  el.classList.add('active');
  el.scrollIntoView({inline:'center',block:'nearest'});
  buildClassSeries(); renderClass();
}

export function setClassSerie(s, el) {
  state.classSerie=s;
  document.querySelectorAll('#filter-class-serie .filter-pill').forEach(p=>p.classList.remove('active'));
  el.classList.add('active');
  el.scrollIntoView({inline:'center',block:'nearest'});
  renderClass();
}

export function renderClass() {
  if(!state.classEscalao||!state.classSerie){document.getElementById('class-content').innerHTML=`<div class="empty"><div class="empty-icon">🏆</div><div class="empty-txt">Seleciona escalão e série</div></div>`;return;}
  const gms=state.currentGames.filter(g=>g.escalao===state.classEscalao&&g.serie===state.classSerie&&g.rA!==null&&g.rA!==undefined&&isAprovado(g));
  const teams=[...new Set(state.currentGames.filter(g=>g.escalao===state.classEscalao&&g.serie===state.classSerie).flatMap(g=>[g.eA,g.eB]))];
  const st={};
  teams.forEach(t=>st[t]={j:0,v:0,d:0,sf:0,sc:0,pf:0,pa:0,fc:0,pts:0});
  const setKeysA=['s1A','s2A','s3A','s4A','s5A'], setKeysB=['s1B','s2B','s3B','s4B','s5B'];
  const h2h=[]; // confronto direto: pontos ganhos por cada equipa nos jogos entre si
  gms.forEach(g=>{
    if(!st[g.eA]||!st[g.eB])return;
    st[g.eA].j++;st[g.eB].j++;
    st[g.eA].sf+=g.rA;st[g.eA].sc+=g.rB;
    st[g.eB].sf+=g.rB;st[g.eB].sc+=g.rA;

    // Falta de comparência: sem coluna própria na Sheet, é detetada pelo
    // padrão de pontos dos sets que a organização usa para a registar —
    // 0 pontos ganhos e 65 (0-3, sets tipo 25-0/25-0/15-0) ou 50 (0-2,
    // sets tipo 25-0/25-0) pontos sofridos.
    let pfA=0, pfB=0;
    setKeysA.forEach((kA,idx)=>{
      const kB=setKeysB[idx];
      if(g[kA]===null||g[kA]===undefined)return;
      pfA+=g[kA];pfB+=g[kB];
    });
    st[g.eA].pf+=pfA;st[g.eA].pa+=pfB;
    st[g.eB].pf+=pfB;st[g.eB].pa+=pfA;
    const fcA=pfA===0&&(pfB===65||pfB===50);
    const fcB=pfB===0&&(pfA===65||pfA===50);
    if(fcA)st[g.eA].fc++;
    if(fcB)st[g.eB].fc++;

    // Vitória=2, Derrota=1, Falta de comparência=0 (regulamento FPV do torneio).
    let ptsA, ptsB;
    if(g.rA>g.rB){st[g.eA].v++;ptsA=2;st[g.eB].d++;ptsB=fcB?0:1;}
    else{st[g.eB].v++;ptsB=2;st[g.eA].d++;ptsA=fcA?0:1;}
    st[g.eA].pts+=ptsA;st[g.eB].pts+=ptsB;
    h2h.push({a:g.eA,b:g.eB,ptsA,ptsB});
  });

  // Confronto direto entre duas equipas: soma dos pontos de classificação
  // ganhos só nos jogos que disputaram entre si (3.º critério de desempate).
  function h2hPts(t1,t2){
    let p1=0,p2=0;
    h2h.forEach(m=>{
      if(m.a===t1&&m.b===t2){p1+=m.ptsA;p2+=m.ptsB;}
      else if(m.a===t2&&m.b===t1){p1+=m.ptsB;p2+=m.ptsA;}
    });
    return p1-p2;
  }

  const ratio=(a,b)=>b===0?(a>0?'∞':'0.00'):(a/b).toFixed(2);
  // Desempate (regulamento FPV): 1) pontos de classificação; 2) quociente
  // sets ganhos/perdidos; 3) quociente pontos ganhos/perdidos nos sets;
  // 4) confronto direto entre as equipas empatadas.
  const q=(f,c)=>c===0?(f>0?Infinity:0):f/c;
  const sorted=Object.entries(st).sort((a,b)=>{
    const[t1,x]=a,[t2,y]=b;
    if(y.pts!==x.pts) return y.pts-x.pts;
    const qsx=q(x.sf,x.sc), qsy=q(y.sf,y.sc);
    if(qsy!==qsx) return qsy-qsx;
    const qpx=q(x.pf,x.pa), qpy=q(y.pf,y.pa);
    if(qpy!==qpx) return qpy-qpx;
    return h2hPts(t2,t1);
  });
  const pc=i=>i===0?'pos-1':i===1?'pos-2':i===2?'pos-3':'';
  const pi=i=>i===0?'🥇':i===1?'🥈':i===2?'🥉':'';
  let h=`<div class="card"><div class="card-header"><div class="card-title">${state.classEscalao} · Série ${state.classSerie}</div></div>
    <table class="class-table"><thead><tr><th>#</th><th>Equipa</th><th>J</th><th>V</th><th>D</th><th class="col-sets">S+</th><th class="col-sets">S-</th><th class="col-sets">Rácio</th><th class="col-sets">P+</th><th class="col-sets">P-</th><th class="col-sets">Rácio</th><th>FC</th><th>Pts</th></tr></thead><tbody>`;
  sorted.forEach(([t,s],i)=>{
    const me=t===state.profile.equipa;
    h+=`<tr class="${me?'my-row':''}"><td><span class="pos-num ${pc(i)}">${pi(i)||i+1}</span></td>
      <td style="font-size:12px;font-weight:${me?700:400};max-width:120px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap"><span class="class-team-cell">${teamLogoIcon(t)}<span class="class-team-name">${t}</span></span></td>
      <td>${s.j}</td><td>${s.v}</td><td>${s.d}</td><td class="col-sets">${s.sf}</td><td class="col-sets">${s.sc}</td><td class="col-sets">${ratio(s.sf,s.sc)}</td><td class="col-sets">${s.pf}</td><td class="col-sets">${s.pa}</td><td class="col-sets">${ratio(s.pf,s.pa)}</td><td>${s.fc}</td><td><span class="pts-num">${s.pts}</span></td></tr>`;
  });
  h+=`</tbody></table><div class="class-note">Apenas os jogos com resultados oficiais são contabilizados</div></div>`;
  const sg=state.currentGames.filter(g=>g.escalao===state.classEscalao&&g.serie===state.classSerie).sort((a,b)=>a.id-b.id);
  h+=`<div class="sec-head" style="margin-top:12px"><div class="sec-title">Jogos da série ${state.classSerie}</div></div><div class="card"><div>`;
  sg.forEach(g=>h+=gameItemHTML(g,true));
  h+=`</div></div>`;
  document.getElementById('class-content').innerHTML=h;
}

// ── WINDOW REGISTRATIONS ──
window.setEscalao = setEscalao;
window.setDia = setDia;
window.setClassEscalao = setClassEscalao;
window.setClassSerie = setClassSerie;
