import { state } from '../state.js';
import { hasResult, setsStr, gameItemHTML, showToast } from '../utils.js';
import { db, ref, set } from '../firebase.js';

export function renderHomePavilhao() {
  const myGames=state.currentGames.filter(g=>g.campo===state.profile.campo).sort((a,b)=>a.id-b.id);
  const done=myGames.filter(g=>hasResult(g));
  let html=`<div class="stats-row">
    <div class="stat-chip"><div class="stat-chip-num">${myGames.length}</div><div class="stat-chip-label">Jogos</div></div>
    <div class="stat-chip"><div class="stat-chip-num">${done.length}</div><div class="stat-chip-label">Registados</div></div>
    <div class="stat-chip"><div class="stat-chip-num">${myGames.length-done.length}</div><div class="stat-chip-label">Pendentes</div></div>
  </div>
  <div class="sec-head"><div class="sec-title">Campo ${state.profile.campo} — Próximos jogos</div></div>`;
  const pending=myGames.filter(g=>!hasResult(g));
  if (pending.length) {
    html+=`<div class="card"><div>`;
    pending.slice(0,5).forEach(g=>html+=gameItemHTML(g,false));
    html+=`</div></div>`;
  }
  html+=`<div class="sec-head" style="margin-top:4px"><div class="sec-title">Ir para registo de resultados</div></div>
  <div class="card" style="padding:14px;cursor:pointer;background:var(--navy);border-color:rgba(245,216,0,.2)" onclick="showPage('pavilhao',document.getElementById('nav-logistica'))">
    <div style="color:var(--yellow);font-weight:700;font-size:15px;display:flex;align-items:center;gap:8px">🏟 Abrir painel de resultados <span style="margin-left:auto">→</span></div>
    <div style="color:rgba(255,255,255,.5);font-size:12px;margin-top:4px">Registar resultados dos jogos do campo ${state.profile.campo}</div>
  </div>`;
  document.getElementById('home-content').innerHTML=html;
}

export function renderPavilhao() {
  if(state.profile.funcao!=='pavilhao'){
    document.getElementById('pavilhao-content').innerHTML=`<div class="empty"><div class="empty-icon">🔒</div><div class="empty-txt">Área reservada a responsáveis de pavilhão.</div></div>`;
    return;
  }
  const myGames=state.currentGames.filter(g=>g.campo===state.profile.campo).sort((a,b)=>{
    const dA=a.dia==='09/jul.'?0:1, dB=b.dia==='09/jul.'?0:1;
    if(dA!==dB)return dA-dB;
    return a.hora.localeCompare(b.hora);
  });
  if(!myGames.length){document.getElementById('pavilhao-content').innerHTML=`<div class="empty"><div class="empty-icon">📋</div><div class="empty-txt">Nenhum jogo atribuído ao campo ${state.profile.campo}.</div></div>`;return;}
  let h=`<div class="sec-head"><div class="sec-title">Campo ${state.profile.campo} — ${myGames.length} jogos</div></div>`;
  myGames.forEach(g=>{
    const done=hasResult(g);
    h+=`<div class="pav-game-item ${done?'has-result':''}" onclick="openResultModal(${g.id})">
      <div class="pav-game-teams">${g.eA} <span style="color:var(--txt3);font-weight:400">vs</span> ${g.eB}</div>
      <div class="pav-game-meta">
        <span>📅 ${g.dia}</span><span>🕐 ${g.hora}</span><span>⚡ ${g.escalao}</span>
      </div>
      ${done?`<div class="pav-game-score">${g.rA} – ${g.rB} <span style="font-size:13px;font-weight:400;color:var(--txt2)">${setsStr(g).join(' ')}</span></div>`:`<div class="pav-game-pending">Toca para registar resultado</div>`}
    </div>`;
  });
  document.getElementById('pavilhao-content').innerHTML=h;
}

export function openResultModal(gameId) {
  const g=state.currentGames.find(x=>x.id===gameId);
  if(!g)return;
  state.currentResultGame=g;
  const done=hasResult(g);
  document.getElementById('rm-title').textContent=done?'Editar resultado':'Registar resultado';
  document.getElementById('rm-teams').textContent=`Jogo ${g.id} · ${g.eA} vs ${g.eB}`;

  if(done) {
    state.currentSets=[];
    if(g.s1A!==null&&g.s1A!==undefined) state.currentSets.push({a:g.s1A,b:g.s1B});
    if(g.s2A!==null&&g.s2A!==undefined) state.currentSets.push({a:g.s2A,b:g.s2B});
    if(g.s3A!==null&&g.s3A!==undefined&&(g.rA+g.rB)>1) state.currentSets.push({a:g.s3A,b:g.s3B});
    if(!state.currentSets.length) state.currentSets=[{a:'',b:''},{a:'',b:''}];
  } else {
    state.currentSets=[{a:'',b:''},{a:'',b:''}];
  }
  renderSetInputs();
  document.getElementById('result-modal').classList.add('open');
}

export function renderSetInputs() {
  const g=state.currentResultGame;
  let h='';
  state.currentSets.forEach((s,i)=>{
    h+=`<div class="set-entry">
      <div class="set-entry-label">${i+1}º Set</div>
      <div class="set-scores">
        <input class="set-score-input" type="number" min="0" max="99" value="${s.a}" placeholder="0" oninput="updateSet(${i},'a',this.value)" inputmode="numeric">
        <div class="set-vs">–</div>
        <input class="set-score-input" type="number" min="0" max="99" value="${s.b}" placeholder="0" oninput="updateSet(${i},'b',this.value)" inputmode="numeric">
      </div>
      <div style="text-align:center;font-size:11px;color:var(--txt3);margin-top:4px">${g.eA} · ${g.eB}</div>
    </div>`;
  });
  if(state.currentSets.length<3) h+=`<button class="set-add-btn" onclick="addSet()">+ Adicionar 3º set</button>`;
  document.getElementById('rm-sets').innerHTML=h;
  updateResultSummary();
}

export function updateSet(i, side, val) {
  state.currentSets[i][side]=val===''?'':parseInt(val)||0;
  updateResultSummary();
}

export function addSet() {
  state.currentSets.push({a:'',b:''});
  renderSetInputs();
}

export function updateResultSummary() {
  const validSets=state.currentSets.filter(s=>s.a!==''&&s.b!=='');
  if(!validSets.length){document.getElementById('rm-summary').style.display='none';return;}
  let wA=0,wB=0;
  validSets.forEach(s=>{if(s.a>s.b)wA++;else if(s.b>s.a)wB++;});
  const g=state.currentResultGame;
  document.getElementById('rm-summary').style.display='block';
  document.getElementById('rm-summary').textContent=`${g.eA}  ${wA} – ${wB}  ${g.eB}`;
}

export async function submitResult() {
  const g=state.currentResultGame;
  const validSets=state.currentSets.filter(s=>s.a!==''&&s.b!=='');
  if(validSets.length<2){showToast('Introduz pelo menos 2 sets');return;}
  let wA=0,wB=0;
  validSets.forEach(s=>{if(Number(s.a)>Number(s.b))wA++;else if(Number(s.b)>Number(s.a))wB++;});
  const result={
    rA:wA, rB:wB,
    s1A:Number(validSets[0].a), s1B:Number(validSets[0].b),
    s2A:Number(validSets[1].a), s2B:Number(validSets[1].b),
    updatedAt: Date.now(),
    campo: state.profile.campo
  };
  if(validSets[2]){result.s3A=Number(validSets[2].a);result.s3B=Number(validSets[2].b);}
  try {
    await set(ref(db,`results/${g.id}`), result);
    closeResultModal(null);
    showToast('✓ Resultado guardado');
  } catch(e) {
    showToast('Erro ao guardar. Verifica a ligação.');
    console.error(e);
  }
}

export function closeResultModal(e) {
  if(!e||e.target===document.getElementById('result-modal'))
    document.getElementById('result-modal').classList.remove('open');
}

// ── WINDOW REGISTRATIONS ──
window.openResultModal = openResultModal;
window.updateSet = updateSet;
window.addSet = addSet;
window.submitResult = submitResult;
window.closeResultModal = closeResultModal;
