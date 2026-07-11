import { state } from '../state.js';
import { gameItemHTML, teamLogoIcon, isAprovado, dayNum } from '../utils.js';

export function wireFilterBarScroll(bar) {
  const check = () => bar.classList.toggle('scrolled-end', bar.scrollLeft+bar.clientWidth>=bar.scrollWidth-4);
  bar.addEventListener('scroll', check, {passive:true});
  new ResizeObserver(check).observe(bar);
}

// scrollIntoView() não funciona em elementos dentro de uma página escondida
// (display:none) — os filtros da página Jogos são construídos no arranque
// da app, antes de a página estar visível. Chamar isto de novo quando a
// página "jogos" se torna visível corrige isso (mesmo mecanismo usado em
// scrollClassFiltersIntoView() para a página Class.).
export function scrollJogosFiltersIntoView() {
  ['filter-escalao', 'filter-dia'].forEach(id => {
    const bar = document.getElementById(id);
    const active = bar && bar.querySelector('.filter-pill.active');
    if (active) active.scrollIntoView({ inline: 'center', block: 'nearest' });
  });
}

export function buildFilterEscalao() {
  const esc=[...new Set(state.currentGames.map(g=>g.escalao))].sort();
  let h=`<div class="filter-pill ${state.activeEscalao==='todos'?'active':''}" onclick="setEscalao('todos',this)">Todos os jogos</div>`;
  if (state.profile.escalao) h+=`<div class="filter-pill ${state.activeEscalao===state.profile.escalao?'active':''}" onclick="setEscalao('${state.profile.escalao}',this)">${state.profile.escalao} ★</div>`;
  esc.forEach(e=>{if(e!==state.profile.escalao)h+=`<div class="filter-pill ${state.activeEscalao===e?'active':''}" onclick="setEscalao('${e}',this)">${e}</div>`;});
  const bar=document.getElementById('filter-escalao');
  bar.innerHTML=h;
  wireFilterBarScroll(bar);
}

export function buildFilterDia() {
  // .filter(Boolean): um jogo sem "Dia" preenchido na sheet (célula vazia ou
  // cabeçalho da coluna corrompido) não pode gerar um pill vazio/quebrado —
  // é simplesmente ignorado no seletor de dias, em vez de rebentar o ecrã
  // inteiro no .replace() mais abaixo.
  const dias = [...new Set(state.currentGames.map(g => g.dia).filter(Boolean))].sort();
  // Por defeito, seleciona o dia de hoje se coincidir com um dia do
  // torneio; caso contrário, o último dia disponível (mais recente/tardio).
  // Só na primeira construção do filtro — não força se o utilizador já
  // tiver escolhido outro.
  if (state.activeDia === 'todos') {
    const todayDia = dias.find(d => dayNum(d) === new Date().getDate());
    state.activeDia = todayDia || dias[dias.length - 1] || 'todos';
  }
  let h = `<div class="filter-pill ${state.activeDia==='todos'?'active':''}" onclick="setDia('todos',this)">Todos os dias</div>`;
  dias.forEach(d => h += `<div class="filter-pill ${state.activeDia===d?'active':''}" onclick="setDia('${d}',this)">${d.replace(/^0/, '').replace('/jul.', ' Jul.')}</div>`);
  const bar=document.getElementById('filter-dia');
  bar.innerHTML = h;
  wireFilterBarScroll(bar);
  const active=bar.querySelector('.filter-pill.active');
  if(active) active.scrollIntoView({inline:'center',block:'nearest'});
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
  let f=state.activeEscalao==='todos'?[...state.currentGames]:state.currentGames.filter(g=>g.escalao===state.activeEscalao);
  if(state.activeDia!=='todos')f=f.filter(g=>g.dia===state.activeDia);
  f.sort((a,b)=>a.id-b.id);
  if(!f.length){document.getElementById('jogos-list').innerHTML=`<div class="empty"><div class="empty-icon">📅</div><div class="empty-txt">Nenhum jogo</div></div>`;return;}
  let h=`<div class="card"><div>`;
  f.forEach(g=>h+=gameItemHTML(g,true));
  h+=`</div></div>`;
  document.getElementById('jogos-list').innerHTML=h;
}

// Jogos de uma fase, conforme o valor de state.classFase ('1', '2' ou
// 'final'): fase 1/2 vêm marcados em g.fase (1 ou 2, ver data.js); "final"
// são os cruzamentos (Série no formato "N.º/M.º" ou "Final").
export function gamesOfClassFase(escalao) {
  const fase=state.classFase||defaultClassFase();
  return state.currentGames.filter(g=>g.escalao===escalao&&(fase==='final'?g.fase==='final':g.fase===Number(fase)));
}

// Por defeito, a página abre na fase onde a equipa preferida do utilizador
// está mesmo a jogar: se já tiver jogos na Fase Final, abre aí; senão, se
// ainda só estiver nas séries da 2.ª fase, abre na 2.ª Fase. Sem
// equipa/escalão associado ao perfil (ex. árbitro, pavilhão), usa "Fase
// Final" como aparência genérica.
function defaultClassFase() {
  const eq=state.profile.equipa, esc=state.profile.escalao;
  if(eq&&esc){
    if(state.currentGames.some(g=>g.escalao===esc&&g.fase==='final'&&(g.eA===eq||g.eB===eq))) return 'final';
    if(state.currentGames.some(g=>g.escalao===esc&&g.fase===2&&(g.eA===eq||g.eB===eq))) return '2';
  }
  return 'final';
}

const FASE_LABELS={1:'1.ª Fase',2:'2.ª Fase',final:'Fase Final',classfinal:'Classificação Final'};

export function buildFilterClassFase() {
  if(!state.classFase) state.classFase=defaultClassFase();
  let h='';
  ['1','2','final','classfinal'].forEach(f=>h+=`<div class="filter-pill ${state.classFase===f?'active':''}" onclick="setClassFase('${f}',this)">${FASE_LABELS[f]}</div>`);
  const bar=document.getElementById('filter-class-fase');
  bar.innerHTML=h;
  wireFilterBarScroll(bar);
  const active=bar.querySelector('.filter-pill.active');
  if(active) active.scrollIntoView({inline:'center',block:'nearest'});
}

export function setClassFase(f, el) {
  state.classFase=f; state.classEscalao=''; state.classSerie=''; state.classFinalSub='todos';
  document.querySelectorAll('#filter-class-fase .filter-pill').forEach(p=>p.classList.remove('active'));
  el.classList.add('active');
  el.scrollIntoView({inline:'nearest',block:'nearest'});
  buildClassFilters();
}

export function buildClassFilters() {
  if(!state.classFase) state.classFase=defaultClassFase();
  // "Classificação Final" não depende de jogos de nenhuma fase em concreto
  // (combina eliminatórias da Fase Final com séries da 2.ª fase sem
  // eliminatória) — por isso mostra sempre todos os escalões existentes.
  const esc=state.classFase==='classfinal'
    ? [...new Set(state.currentGames.map(g=>g.escalao))].sort()
    : [...new Set(state.currentGames.filter(g=>state.classFase==='final'?g.fase==='final':g.fase===Number(state.classFase)).map(g=>g.escalao))].sort();
  if(!state.classEscalao||!esc.includes(state.classEscalao)) state.classEscalao=(state.profile.escalao&&esc.includes(state.profile.escalao))?state.profile.escalao:(esc[0]||'');
  let h='';
  esc.forEach(e=>h+=`<div class="filter-pill ${e===state.classEscalao?'active':''}" onclick="setClassEscalao('${e}',this)">${e}${e===state.profile.escalao?' ★':''}</div>`);
  const bar=document.getElementById('filter-class-escalao');
  bar.innerHTML=h;
  wireFilterBarScroll(bar);
  const active=bar.querySelector('.filter-pill.active');
  if(active) active.scrollIntoView({inline:'center',block:'nearest'});
  buildClassSeries();
}

// A equipa do utilizador pode estar em séries com a mesma letra em fases
// diferentes (ex. "J" na 1.ª fase e "K" na 2.ª) — por isso a estrela não
// pode depender de um único "profile.serie" fixo, tem de verificar, para a
// fase atualmente selecionada, se a equipa joga mesmo nessa série.
function isMySerie(escalao, serie) {
  if(!state.profile.equipa) return false;
  const fase=state.classFase==='final'?'final':Number(state.classFase);
  return state.currentGames.some(g=>g.escalao===escalao&&g.serie===serie&&g.fase===fase&&(g.eA===state.profile.equipa||g.eB===state.profile.equipa));
}

// Encontra, de entre uma lista de séries candidatas, aquela em que a equipa
// do utilizador joga na fase atual — usado para pré-selecionar a série da
// equipa preferida sempre que se muda de fase.
function findMySerie(escalao, seriesList) {
  if(!state.profile.equipa) return null;
  const fase=state.classFase==='final'?'final':Number(state.classFase);
  const g=state.currentGames.find(g=>g.escalao===escalao&&seriesList.includes(g.serie)&&g.fase===fase&&(g.eA===state.profile.equipa||g.eB===state.profile.equipa));
  return g?g.serie:null;
}

// Ordem das eliminatórias da Fase Final: "Final" primeiro, depois por ordem
// crescente do primeiro número (3º/4º antes de 5º/6º, etc.).
function bracketOrder(label) {
  if(/^final$/i.test(label)) return -1;
  const m=label.match(/^(\d+)/);
  return m?parseInt(m[1]):9999;
}

// Intervalo de colocações de uma eliminatória (ex. "5º/8º" → [5,8]; "Final"
// → [1,2]). null se o formato não for reconhecido.
function bracketRange(label) {
  if(/^final$/i.test(label)) return [1,2];
  const m=label.match(/^(\d+)º\/(\d+)º$/);
  return m ? [parseInt(m[1]), parseInt(m[2])] : null;
}

function finalBracketLabels(escalao) {
  return [...new Set(state.currentGames.filter(g=>g.escalao===escalao&&g.fase==='final').map(g=>g.serie))];
}

// Eliminatórias "filhas" de um grupo (ex. "5º/8º" → ["5º/6º","7º/8º"]) —
// aquelas cujo intervalo está contido no intervalo de "label".
function bracketChildren(labels, label) {
  const a=bracketRange(label);
  if(!a) return [];
  return labels.filter(o=>{
    if(o===label) return false;
    const b=bracketRange(o);
    return b && a[0]<=b[0] && b[1]<=a[1];
  });
}

// Só aparecem no seletor de topo as eliminatórias que não estão contidas
// noutra eliminatória existente (ex. "5º/6º" e "7º/8º" ficam escondidas
// atrás de "5º/8º"; só aparece "5º/8º").
function bracketTopLevel(labels) {
  return labels.filter(l=>{
    const b=bracketRange(l);
    if(!b) return true;
    return !labels.some(o=>{
      if(o===l) return false;
      const a=bracketRange(o);
      return a && a[0]<=b[0] && b[1]<=a[1];
    });
  });
}

export function buildClassSeries() {
  const bar=document.getElementById('filter-class-serie');

  if(state.classFase==='classfinal') {
    bar.style.display='none';
    bar.innerHTML='';
    document.getElementById('filter-class-melhores').style.display='none';
    renderClass();
    return;
  }
  bar.style.display='flex';
  const games=gamesOfClassFase(state.classEscalao);

  if(state.classFase==='final') {
    const labels=finalBracketLabels(state.classEscalao);
    const top=bracketTopLevel(labels).sort((a,b)=>bracketOrder(a)-bracketOrder(b));
    if(!top.includes(state.classSerie)) {
      // Tenta pré-selecionar a eliminatória (ou, se estiver agrupada, o
      // grupo-mãe + a sub-eliminatória) onde a equipa preferida joga. Dá
      // sempre prioridade a um jogo numa sub-eliminatória (mais específico)
      // sobre o jogo da eliminatória-mãe (ex. "5º/8º") — senão, como o jogo
      // da mãe costuma ter um ID mais baixo (é jogado primeiro), acabava a
      // ganhar mesmo quando a equipa já tem sub-eliminatória atribuída.
      const childLabels=labels.filter(l=>!top.includes(l));
      const myChildLabel=findMySerie(state.classEscalao,childLabels);
      let parent, sub;
      if(myChildLabel){
        parent=top.find(t=>bracketChildren(labels,t).includes(myChildLabel));
        sub=myChildLabel;
      } else {
        parent=findMySerie(state.classEscalao,top);
        sub='todos';
      }
      if(parent){ state.classSerie=parent; state.classFinalSub=sub; }
      else state.classSerie=top[0]||'';
    }
    let h='';
    top.forEach(x=>h+=`<div class="filter-pill ${x===state.classSerie?'active':''}" onclick="setClassSerieFinal('${x}',this)">${x}${isMySerie(state.classEscalao,x)?' ★':''}</div>`);
    bar.innerHTML=h;
    wireFilterBarScroll(bar);
    const active=bar.querySelector('.filter-pill.active');
    if(active) active.scrollIntoView({inline:'center',block:'nearest'});
    buildClassFinalSub();
    return;
  }

  const s=[...new Set(games.map(g=>g.serie))].filter(x=>/^[A-Za-z]$/.test(x)).sort();
  if(!state.classSerie||(state.classSerie!=='melhores'&&!s.includes(state.classSerie))) state.classSerie=findMySerie(state.classEscalao,s)||s[0]||'';
  let h=state.classFase==='1'?`<div class="filter-pill ${state.classSerie==='melhores'?'active':''}" onclick="setClassMelhores(this)">MELHORES</div>`:'';
  s.forEach(x=>h+=`<div class="filter-pill ${x===state.classSerie?'active':''}" onclick="setClassSerie('${x}',this)">Série ${x}${isMySerie(state.classEscalao,x)?' ★':''}</div>`);
  bar.innerHTML=h;
  wireFilterBarScroll(bar);
  const active=bar.querySelector('.filter-pill.active');
  if(active) active.scrollIntoView({inline:'center',block:'nearest'});
  if(state.classFase==='1'&&state.classSerie==='melhores') buildMelhoresTiers(); else document.getElementById('filter-class-melhores').style.display='none';
  renderClass();
}

// Reutiliza a barra "#filter-class-melhores" (só usada por MELHORES na 1.ª
// fase) como 2.º nível de seleção da Fase Final, para as eliminatórias
// agrupadas (ex. "5º/8º" → "Todos" / "5º/6º" / "7º/8º").
export function buildClassFinalSub() {
  const labels=finalBracketLabels(state.classEscalao);
  const children=bracketChildren(labels, state.classSerie).sort((a,b)=>bracketOrder(a)-bracketOrder(b));
  const bar=document.getElementById('filter-class-melhores');
  if(!children.length) {
    bar.style.display='none';
    bar.innerHTML='';
    renderClass();
    return;
  }
  if(!state.classFinalSub||!['todos',...children].includes(state.classFinalSub)) state.classFinalSub='todos';
  let h=`<div class="filter-pill ${state.classFinalSub==='todos'?'active':''}" onclick="setClassFinalSub('todos',this)">Todos</div>`;
  children.forEach(c=>h+=`<div class="filter-pill ${c===state.classFinalSub?'active':''}" onclick="setClassFinalSub('${c}',this)">${c}${isMySerie(state.classEscalao,c)?' ★':''}</div>`);
  bar.style.display='flex';
  bar.innerHTML=h;
  wireFilterBarScroll(bar);
  const active=bar.querySelector('.filter-pill.active');
  if(active) active.scrollIntoView({inline:'center',block:'nearest'});
  renderClass();
}

export function setClassSerieFinal(label, el) {
  state.classSerie=label;
  state.classFinalSub='todos';
  document.querySelectorAll('#filter-class-serie .filter-pill').forEach(p=>p.classList.remove('active'));
  el.classList.add('active');
  el.scrollIntoView({inline:'nearest',block:'nearest'});
  buildClassFinalSub();
}

export function setClassFinalSub(sub, el) {
  state.classFinalSub=sub;
  document.querySelectorAll('#filter-class-melhores .filter-pill').forEach(p=>p.classList.remove('active'));
  el.classList.add('active');
  el.scrollIntoView({inline:'nearest',block:'nearest'});
  renderClass();
}

// Nomes dos níveis "MELHORES" (1.ºs, 2.ºs, ...) — usa por extenso até ao
// tamanho previsto de uma série; para além disso usa "N.ºs" genérico.
const TIER_LABELS=['PRIMEIROS','SEGUNDOS','TERCEIROS','QUARTOS','QUINTOS','SEXTOS','SÉTIMOS','OITAVOS','NONOS','DÉCIMOS'];
const tierLabel=n=>TIER_LABELS[n-1]||`${n}.ºS`;

export function buildMelhoresTiers() {
  const gamesFase1=state.currentGames.filter(g=>g.escalao===state.classEscalao&&g.fase===1);
  const series=[...new Set(gamesFase1.map(g=>g.serie))].filter(x=>/^[A-Za-z]$/.test(x));
  const maxTier=Math.max(0,...series.map(s=>new Set(gamesFase1.filter(g=>g.serie===s).flatMap(g=>[g.eA,g.eB])).size));
  if(!state.classMelhorTier||state.classMelhorTier>maxTier) state.classMelhorTier=1;
  let h='';
  for(let n=1;n<=maxTier;n++) h+=`<div class="filter-pill ${state.classMelhorTier===n?'active':''}" onclick="setClassMelhorTier(${n},this)">${tierLabel(n)}</div>`;
  const bar=document.getElementById('filter-class-melhores');
  bar.style.display=maxTier?'flex':'none';
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
  ['filter-class-fase', 'filter-class-escalao', 'filter-class-serie', 'filter-class-melhores'].forEach(id => {
    const bar = document.getElementById(id);
    const active = bar && bar.querySelector('.filter-pill.active');
    if (active) active.scrollIntoView({ inline: 'center', block: 'nearest' });
  });
}

export function setClassEscalao(e, el) {
  state.classEscalao=e; state.classSerie='';
  document.querySelectorAll('#filter-class-escalao .filter-pill').forEach(p=>p.classList.remove('active'));
  el.classList.add('active');
  el.scrollIntoView({inline:'nearest',block:'nearest'});
  document.getElementById('filter-class-melhores').style.display='none';
  buildClassSeries();
}

export function setClassSerie(s, el) {
  state.classSerie=s;
  document.querySelectorAll('#filter-class-serie .filter-pill').forEach(p=>p.classList.remove('active'));
  el.classList.add('active');
  el.scrollIntoView({inline:'nearest',block:'nearest'});
  document.getElementById('filter-class-melhores').style.display='none';
  renderClass();
}

export function setClassMelhores(el) {
  state.classSerie='melhores';
  state.classMelhorTier=1; // sempre "PRIMEIROS" ao (re)selecionar MELHORES
  document.querySelectorAll('#filter-class-serie .filter-pill').forEach(p=>p.classList.remove('active'));
  el.classList.add('active');
  el.scrollIntoView({inline:'nearest',block:'nearest'});
  buildMelhoresTiers();
  renderClass();
}

export function setClassMelhorTier(n, el) {
  state.classMelhorTier=n;
  document.querySelectorAll('#filter-class-melhores .filter-pill').forEach(p=>p.classList.remove('active'));
  el.classList.add('active');
  el.scrollIntoView({inline:'nearest',block:'nearest'});
  renderClass();
}

export const ratio=(a,b,dec=2)=>b===0?(a>0?'∞':(0).toFixed(dec)):(a/b).toFixed(dec);
const q=(f,c)=>c===0?(f>0?Infinity:0):f/c;

// Calcula a tabela classificativa de um escalão+série a partir dos jogos
// que passem em gameFilter (ex. só 1.ª fase) — reutilizado tanto pela
// classificação normal (todos os jogos) como pelos "MELHORES" (só 1.ª fase).
// Devolve um array ordenado de [equipa, estatisticas].
export function computeSerieStandings(escalao, serie, gameFilter) {
  const gms=state.currentGames.filter(g=>g.escalao===escalao&&g.serie===serie&&g.rA!==null&&g.rA!==undefined&&isAprovado(g)&&gameFilter(g));
  // A lista de equipas também respeita gameFilter (não só gms): garante que
  // séries com a mesma letra em fases diferentes (ex. "J" na 1.ª e na 2.ª
  // fase) não se misturam, mas mantém equipas que ainda não jogaram (0 J).
  const teams=[...new Set(state.currentGames.filter(g=>g.escalao===escalao&&g.serie===serie&&gameFilter(g)).flatMap(g=>[g.eA,g.eB]))];
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

  // Desempate (regulamento FPV): 1) pontos de classificação; 2) quociente
  // sets ganhos/perdidos; 3) quociente pontos ganhos/perdidos nos sets;
  // 4) confronto direto entre as equipas empatadas.
  return Object.entries(st).sort((a,b)=>{
    const[t1,x]=a,[t2,y]=b;
    if(y.pts!==x.pts) return y.pts-x.pts;
    const qsx=q(x.sf,x.sc), qsy=q(y.sf,y.sc);
    if(qsy!==qsx) return qsy-qsx;
    const qpx=q(x.pf,x.pa), qpy=q(y.pf,y.pa);
    if(qpy!==qpx) return qpy-qpx;
    return h2hPts(t2,t1);
  });
}

// Cabeçalho em forma de fração (numerador em cima, denominador em baixo,
// separados por um traço) — usado nas colunas de rácio/média das tabelas.
function fracTh(num, den, cls = 'col-sets') {
  return `<th class="${cls}"><span class="th-frac"><span class="th-frac-num">${num}</span><span class="th-frac-den">${den}</span></span></th>`;
}

// hideVD: usado só pelos "Melhores" — em portrait, esconde V/D/Pts (que na
// classificação normal ficam sempre visíveis) para dar lugar às 3 médias.
function classTableHeadHTML(extraCols, includeFC, hideVD) {
  const fcCol = includeFC===false ? '' : '<th>FC</th>';
  const vdCls = hideVD ? ' class="col-sets"' : '';
  return `<tr><th>#</th><th>Equipa</th><th>J</th><th${vdCls}>V</th><th${vdCls}>D</th><th class="col-sets">S+</th><th class="col-sets">S-</th>${fracTh('S+','S-')}<th class="col-sets">P+</th><th class="col-sets">P-</th>${fracTh('P+','P-')}${fcCol}<th${vdCls}>Pts</th>${extraCols||''}</tr>`;
}
const pc=i=>i===0?'pos-1':i===1?'pos-2':i===2?'pos-3':'';
const pi=i=>i===0?'🥇':i===1?'🥈':i===2?'🥉':'';

export function renderClass() {
  if(!state.classEscalao){document.getElementById('class-content').innerHTML=`<div class="empty"><div class="empty-icon">🏆</div><div class="empty-txt">Seleciona um escalão</div></div>`;return;}
  if(state.classFase==='classfinal'){renderClassificacaoFinal();return;}
  if(!state.classSerie){document.getElementById('class-content').innerHTML=`<div class="empty"><div class="empty-icon">🏆</div><div class="empty-txt">Seleciona escalão e série</div></div>`;return;}
  if(state.classFase==='final'){renderFinalBracket();return;}
  if(state.classSerie==='melhores'){renderMelhores();return;}

  const faseFilter=g=>g.fase===Number(state.classFase);
  const sorted=computeSerieStandings(state.classEscalao,state.classSerie,faseFilter);
  let h=`<div class="card"><div class="card-header"><div class="card-title">${state.classEscalao} · Série ${state.classSerie}</div></div>
    <table class="class-table"><thead>${classTableHeadHTML()}</thead><tbody>`;
  sorted.forEach(([t,s],i)=>{
    const me=t===state.profile.equipa;
    h+=`<tr class="${me?'my-row':''}"><td><span class="pos-num ${pc(i)}">${pi(i)||i+1}</span></td>
      <td style="font-size:12px;font-weight:${me?700:400};max-width:120px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap"><span class="class-team-cell">${teamLogoIcon(t)}<span class="class-team-name">${t}</span></span></td>
      <td>${s.j}</td><td>${s.v}</td><td>${s.d}</td><td class="col-sets">${s.sf}</td><td class="col-sets">${s.sc}</td><td class="col-sets">${ratio(s.sf,s.sc)}</td><td class="col-sets">${s.pf}</td><td class="col-sets">${s.pa}</td><td class="col-sets">${ratio(s.pf,s.pa,3)}</td><td>${s.fc}</td><td><span class="pts-num">${s.pts}</span></td></tr>`;
  });
  h+=`</tbody></table><div class="class-note">Apenas os jogos com resultados oficiais são contabilizados</div></div>`;
  const sg=state.currentGames.filter(g=>g.escalao===state.classEscalao&&g.serie===state.classSerie&&faseFilter(g)).sort((a,b)=>a.id-b.id);
  h+=`<div class="sec-head" style="margin-top:12px"><div class="sec-title">Jogos da série ${state.classSerie}</div></div><div class="card"><div>`;
  sg.forEach(g=>h+=gameItemHTML(g,true));
  h+=`</div></div>`;
  document.getElementById('class-content').innerHTML=h;
}

export function renderFinalBracket() {
  const escalao=state.classEscalao, label=state.classSerie;
  const labels=finalBracketLabels(escalao);
  const children=bracketChildren(labels, label);
  let activeLabels, title;
  if(children.length && state.classFinalSub && state.classFinalSub!=='todos') {
    activeLabels=[state.classFinalSub];
    title=state.classFinalSub;
  } else if(children.length) {
    activeLabels=[label, ...children];
    title=`${label} · Todos`;
  } else {
    activeLabels=[label];
    title=label;
  }
  const games=state.currentGames.filter(g=>g.escalao===escalao&&g.fase==='final'&&activeLabels.includes(g.serie)).sort((a,b)=>a.id-b.id);
  let h=`<div class="sec-head"><div class="sec-title">${escalao} · Fase Final — ${title}</div></div><div class="card"><div>`;
  if(!games.length){
    h+=`<div class="empty"><div class="empty-icon">🏆</div><div class="empty-txt">Sem jogos</div></div>`;
  }
  games.forEach(g=>h+=gameItemHTML(g,true));
  h+=`</div></div>`;
  document.getElementById('class-content').innerHTML=h;
}

// Posições que não são decididas por nenhuma eliminatória da Fase Final —
// a série (2.ª fase) indicada define diretamente esse intervalo de
// colocações, pela ordem da sua classificação final. Não há nenhuma coluna
// na sheet que diga isto — foi confirmado manualmente por escalão.
const CLASSIFICACAO_FINAL_SERIE_RANGE = {
  'U14 F': { 'Q': [33, 38] },
  'U15 F': { 'M': [17, 22], 'N': [23, 28], 'O': [29, 33] },
  'U16 F': { 'Q': [37, 41] },
};

// Equipas sem colocação calculável (ex. desistência antes da 2.ª fase) —
// também confirmado manualmente.
const CLASSIFICACAO_FINAL_EXTRA = {
  'U19 F': [{ equipa: 'Voliday "E"', pos: 51 }],
};

export function renderClassificacaoFinal() {
  const escalao=state.classEscalao;
  const entries=[];

  // 1) Eliminatórias-folha da Fase Final (intervalos de largura 2, ou
  // "Final") — cada uma decide 2 posições. Sem resultado oficial ainda,
  // mostra "Vxxx"/"Dxxx" (vencedor/derrotado do jogo xxx) em vez do nome.
  const finalGames=state.currentGames.filter(g=>g.escalao===escalao&&g.fase==='final');
  finalGames.forEach(g=>{
    const r=bracketRange(g.serie);
    if(!r||r[1]-r[0]!==1) return;
    const [low,high]=r;
    const decided=g.rA!==null&&g.rA!==undefined&&isAprovado(g);
    if(decided){
      const winnerIsA=g.rA>g.rB;
      entries.push({pos:low, team:winnerIsA?g.eA:g.eB, decided:true});
      entries.push({pos:high, team:winnerIsA?g.eB:g.eA, decided:true});
    } else {
      entries.push({pos:low, team:`V${g.id}`, decided:false});
      entries.push({pos:high, team:`D${g.id}`, decided:false});
    }
  });

  // 2) Séries da 2.ª fase sem eliminatória própria — posição vem da
  // classificação final dessa série, mas só depois de a série estar
  // COMPLETA (round-robin todo jogado: cada equipa com nº de jogos = nº de
  // equipas da série - 1). Antes disso, mesmo que a classificação parcial já
  // dê uma ordem, ainda pode mudar — mostra o código "NºSX" (posição na
  // série + letra da série), a mesma convenção que a sheet já usava.
  const serieRanges=CLASSIFICACAO_FINAL_SERIE_RANGE[escalao]||{};
  Object.entries(serieRanges).forEach(([serie,[low,high]])=>{
    const standings=computeSerieStandings(escalao,serie,g=>g.fase===2);
    const n=standings.length;
    const fechada=n>0&&standings.every(([,s])=>s.j===n-1);
    for(let pos=low;pos<=high;pos++){
      const idx=pos-low;
      if(fechada&&standings[idx]) entries.push({pos, team:standings[idx][0], decided:true});
      else entries.push({pos, team:`${idx+1}ºS${serie}`, decided:false});
    }
  });

  // 3) Casos avulsos (ex. desistências).
  (CLASSIFICACAO_FINAL_EXTRA[escalao]||[]).forEach(({equipa,pos})=>entries.push({pos, team:equipa, decided:true}));

  entries.sort((a,b)=>a.pos-b.pos);

  let h=`<div class="card"><div class="card-header"><div class="card-title">${escalao} · Classificação Final</div></div><div>`;
  if(!entries.length){
    h+=`<div class="empty"><div class="empty-icon">🏆</div><div class="empty-txt">Sem dados</div></div>`;
  }
  entries.forEach(({pos,team,decided})=>{
    const me=decided&&team===state.profile.equipa;
    const i=pos-1;
    const teamCell=decided
      ? `<span class="class-team-cell">${teamLogoIcon(team)}<span class="class-team-name">${team}</span></span>`
      : `<span class="class-team-pending">${team}</span>`;
    h+=`<div class="class-final-row ${me?'my-row':''}"><span class="pos-num ${pc(i)}">${pi(i)||pos}</span>${teamCell}</div>`;
  });
  h+=`</div></div>`;
  document.getElementById('class-content').innerHTML=h;
}

// Jogos da 1.ª fase: dias 08/07 e 09/07 — os "MELHORES" comparam-se sempre
// só com esta fase, mesmo que já haja jogos da 2.ª fase disputados.
const isFase1=g=>{const d=dayNum(g.dia);return d===8||d===9;};

export function renderMelhores() {
  const tier=state.classMelhorTier||1;
  const series=[...new Set(state.currentGames.filter(g=>g.escalao===state.classEscalao&&g.fase===1).map(g=>g.serie))].filter(x=>/^[A-Za-z]$/.test(x)).sort();

  const entries=[];
  series.forEach(serie=>{
    const standings=computeSerieStandings(state.classEscalao,serie,isFase1);
    const entry=standings[tier-1];
    if(!entry) return;
    const [team,s]=entry;
    if(!s.j) return; // sem jogos da 1.ª fase disputados — não entra na comparação
    entries.push({
      team, serie, s,
      mp: s.pts/s.j,
      mrs: q(s.sf,s.sc)/s.j,
      mrp: q(s.pf,s.pa)/s.j,
    });
  });

  entries.sort((a,b)=>{
    if(b.mp!==a.mp) return b.mp-a.mp;
    if(b.mrs!==a.mrs) return b.mrs-a.mrs;
    return b.mrp-a.mrp;
  });

  const fmt=(n,dec=2)=>n===Infinity?'∞':n.toFixed(dec);
  let h=`<div class="card"><div class="card-header"><div class="card-title">${state.classEscalao} · Melhores — ${tierLabel(tier)}</div></div>
    <table class="class-table class-table-melhores"><thead>${classTableHeadHTML(`<th class="col-sets">Série</th>${fracTh('Pts','J','')}${fracTh('S+/S-','J','')}${fracTh('P+/P-','J','')}`,false,true)}</thead><tbody>`;
  if(!entries.length) {
    h+=`<tr><td colspan="16" style="text-align:center;color:var(--txt3);padding:1.5rem 0">Sem dados da 1.ª fase para este nível.</td></tr>`;
  }
  entries.forEach(({team,serie,s,mp,mrs,mrp},i)=>{
    const me=team===state.profile.equipa;
    h+=`<tr class="${me?'my-row':''}"><td><span class="pos-num ${pc(i)}">${pi(i)||i+1}</span></td>
      <td class="class-team-td-scroll" style="font-size:11px;font-weight:${me?700:400};max-width:120px"><span class="class-team-cell">${teamLogoIcon(team)}<span class="class-team-name">${team}</span></span></td>
      <td>${s.j}</td><td class="col-sets">${s.v}</td><td class="col-sets">${s.d}</td><td class="col-sets">${s.sf}</td><td class="col-sets">${s.sc}</td><td class="col-sets">${ratio(s.sf,s.sc)}</td><td class="col-sets">${s.pf}</td><td class="col-sets">${s.pa}</td><td class="col-sets">${ratio(s.pf,s.pa,3)}</td><td class="col-sets"><span class="pts-num">${s.pts}</span></td>
      <td class="col-sets">${serie}</td><td>${fmt(mp)}</td><td>${fmt(mrs)}</td><td>${fmt(mrp,3)}</td></tr>`;
  });
  h+=`</tbody></table><div class="class-note">1.ª fase (08/07 e 09/07) · só jogos com resultados oficiais são contabilizados</div></div>`;
  document.getElementById('class-content').innerHTML=h;
}

// ── WINDOW REGISTRATIONS ──
window.setEscalao = setEscalao;
window.setDia = setDia;
window.setClassFase = setClassFase;
window.setClassEscalao = setClassEscalao;
window.setClassSerie = setClassSerie;
window.setClassSerieFinal = setClassSerieFinal;
window.setClassFinalSub = setClassFinalSub;
window.setClassMelhores = setClassMelhores;
window.setClassMelhorTier = setClassMelhorTier;
