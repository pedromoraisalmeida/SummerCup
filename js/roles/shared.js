import { state } from '../state.js';
import { gameItemHTML, teamLogoIcon } from '../utils.js';

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
  const gms=state.currentGames.filter(g=>g.escalao===state.classEscalao&&g.serie===state.classSerie&&g.rA!==null&&g.rA!==undefined);
  const teams=[...new Set(state.currentGames.filter(g=>g.escalao===state.classEscalao&&g.serie===state.classSerie).flatMap(g=>[g.eA,g.eB]))];
  const st={};
  teams.forEach(t=>st[t]={j:0,v:0,d:0,sf:0,sc:0,pf:0,pa:0,pts:0});
  const setKeysA=['s1A','s2A','s3A','s4A','s5A'], setKeysB=['s1B','s2B','s3B','s4B','s5B'];
  gms.forEach(g=>{
    if(!st[g.eA]||!st[g.eB])return;
    st[g.eA].j++;st[g.eB].j++;
    st[g.eA].sf+=g.rA;st[g.eA].sc+=g.rB;
    st[g.eB].sf+=g.rB;st[g.eB].sc+=g.rA;
    if(g.rA>g.rB){st[g.eA].v++;st[g.eA].pts+=3;st[g.eB].d++;}
    else{st[g.eB].v++;st[g.eB].pts+=3;st[g.eA].d++;}
    setKeysA.forEach((kA,idx)=>{
      const kB=setKeysB[idx];
      if(g[kA]===null||g[kA]===undefined)return;
      st[g.eA].pf+=g[kA];st[g.eA].pa+=g[kB];
      st[g.eB].pf+=g[kB];st[g.eB].pa+=g[kA];
    });
  });
  const ratio=(a,b)=>b===0?(a>0?'∞':'0.00'):(a/b).toFixed(2);
  const sorted=Object.entries(st).sort((a,b)=>{const[,x]=a,[,y]=b;return y.pts!==x.pts?y.pts-x.pts:(y.sf-y.sc)-(x.sf-x.sc);});
  const pc=i=>i===0?'pos-1':i===1?'pos-2':i===2?'pos-3':'';
  const pi=i=>i===0?'🥇':i===1?'🥈':i===2?'🥉':'';
  let h=`<div class="card"><div class="card-header"><div class="card-title">${state.classEscalao} · Série ${state.classSerie}</div></div>
    <table class="class-table"><thead><tr><th>#</th><th>Equipa</th><th>J</th><th>V</th><th>D</th><th class="col-sets">S+</th><th class="col-sets">S-</th><th class="col-sets">Rácio</th><th class="col-sets">P+</th><th class="col-sets">P-</th><th class="col-sets">Rácio</th><th>Pts</th></tr></thead><tbody>`;
  sorted.forEach(([t,s],i)=>{
    const me=t===state.profile.equipa;
    h+=`<tr class="${me?'my-row':''}"><td><span class="pos-num ${pc(i)}">${pi(i)||i+1}</span></td>
      <td style="font-size:12px;font-weight:${me?700:400};max-width:120px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap"><span class="class-team-cell">${teamLogoIcon(t)}<span class="class-team-name">${t}</span></span></td>
      <td>${s.j}</td><td>${s.v}</td><td>${s.d}</td><td class="col-sets">${s.sf}</td><td class="col-sets">${s.sc}</td><td class="col-sets">${ratio(s.sf,s.sc)}</td><td class="col-sets">${s.pf}</td><td class="col-sets">${s.pa}</td><td class="col-sets">${ratio(s.pf,s.pa)}</td><td><span class="pts-num">${s.pts}</span></td></tr>`;
  });
  h+=`</tbody></table></div>`;
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
