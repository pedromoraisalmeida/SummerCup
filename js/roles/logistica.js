import { state } from '../state.js';
import { ACCESS_KEY } from '../config.js';
import { dayNum, sameText } from '../utils.js';
import { wireFilterBarScroll } from './shared.js';

export function renderAlojamento() {
  const el=document.getElementById('log-alojamento');
  if(!el)return;
  const aloj=(state.profile.equipa&&state.profile.escalao)?state.EQUIPA_ALOJAMENTO[state.profile.escalao+'||'+state.profile.equipa]:null;
  el.innerHTML=aloj?`<div class="aloj-card"><span class="aloj-icon">🏠</span><div><div class="aloj-label">Alojamento</div><div class="aloj-val">${aloj}</div></div></div>`:'';
}

export function buildFilterLogDia() {
  const days=[...new Set([
    ...state.TRANSPORTS.map(t=>dayNum(t.dia)),
    ...state.ALIMENTOS.map(r=>dayNum(r['Data'])),
  ].filter(n=>n!==null))].sort((a,b)=>a-b);
  if(state.activeLogDia===null||!days.includes(state.activeLogDia)) {
    // Por defeito, o dia de hoje, se coincidir com um dia do torneio;
    // caso contrário, o último dia disponível (mais recente/tardio).
    const today=new Date().getDate();
    state.activeLogDia=days.includes(today)?today:(days[days.length-1]??null);
  }
  let h='';
  days.forEach(d=>h+=`<div class="filter-pill ${state.activeLogDia===d?'active':''}" onclick="setLogDia(${d},this)">${String(d).padStart(2,'0')} Jul.</div>`);
  const bar=document.getElementById('filter-log-dia');
  bar.innerHTML=h;
  wireFilterBarScroll(bar);
  const active=bar.querySelector('.filter-pill.active');
  if(active) active.scrollIntoView({inline:'center',block:'nearest'});
}

export function setLogDia(d, el) {
  state.activeLogDia=d;
  document.querySelectorAll('#filter-log-dia .filter-pill').forEach(p=>p.classList.remove('active'));
  el.classList.add('active');
  renderTransport();
  renderFood();
}

export function renderTransport() {
  const el=document.getElementById('transport-content');
  if(!state.profile.transportAccess&&state.profile.funcao!=='pavilhao') {
    el.innerHTML=`<div class="transport-locked" style="padding:2rem 1rem;text-align:center">
      <div style="font-size:36px;margin-bottom:.75rem">🔒</div>
      <div style="font-size:15px;font-weight:600;color:var(--txt);margin-bottom:.4rem">Acesso restrito</div>
      <div style="font-size:13px;color:var(--txt2);margin-bottom:1.25rem;line-height:1.5">Disponível para treinadores e dirigentes com código.</div>
      <input class="transport-key-input" id="tk-input" type="password" placeholder="Código de acesso">
      <div class="transport-key-err" id="tk-err">Código incorreto.</div>
      <button class="transport-key-btn" onclick="unlockTransport()">Desbloquear</button>
    </div>`;
    return;
  }
  if(!state.profile.equipa){el.innerHTML=`<div class="empty"><div class="empty-icon">🚌</div><div class="empty-txt">Sem equipa selecionada</div></div>`;return;}
  const myT=state.TRANSPORTS.filter(t=>sameText(t.equipa,state.profile.equipa)&&sameText(t.escalao,state.profile.escalao)&&dayNum(t.dia)===state.activeLogDia);
  // Sem linha da equipa/escalão para o dia selecionado (quer porque não
  // existe de todo na sheet, quer porque só tem linhas noutros dias):
  // considera-se deslocação a pé nesse dia — não é uma falha de dados, é
  // o pavilhão ficar junto ao alojamento.
  if(!myT.length){el.innerHTML=transportCardHTML({ape:true});return;}
  const partidas=myT.filter(t=>t.tipo==='partida');
  const regressos=myT.filter(t=>t.tipo==='regresso');
  const festas=myT.filter(t=>t.tipo==='festas');
  let h='';
  // Se a única linha do dia for uma "Festa" (09/07 ou 11/07, depois das
  // 18h — ver FESTAS_DESTINO_POR_DIA em data.js), mostra a pé (não há
  // partida/regresso "a sério" nesse dia) mas mantém também o trajeto da
  // festa em baixo.
  if(myT.length===1&&festas.length===1)h+=transportCardHTML({ape:true});
  if(partidas.length){h+=`<div style="margin-bottom:8px"><span style="font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:.8px;padding:4px 12px;border-radius:99px;background:var(--blue-l);color:var(--blue-d);border:1px solid rgba(26,91,166,.2)">🏟 Partidas</span></div>`;partidas.forEach(t=>h+=transportCardHTML(t));}
  if(regressos.length){h+=`<div style="margin-bottom:8px;margin-top:12px"><span style="font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:.8px;padding:4px 12px;border-radius:99px;background:var(--green-l,#e6f5ee);color:var(--green);border:1px solid rgba(26,122,69,.2)">🏠 Regressos</span></div>`;regressos.forEach(t=>h+=transportCardHTML(t));}
  if(festas.length){h+=`<div style="margin-bottom:8px;margin-top:12px"><span style="font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:.8px;padding:4px 12px;border-radius:99px;background:var(--yellow-l,#fdf6d8);color:var(--yellow-d);border:1px solid rgba(245,216,0,.3)">🎉 Festas</span></div>`;festas.forEach(t=>h+=transportCardHTML(t));}
  el.innerHTML=h;
}

export function unlockTransport() {
  const val=document.getElementById('tk-input').value.trim();
  const inp=document.getElementById('tk-input');
  if(val!==ACCESS_KEY){inp.classList.add('error');document.getElementById('tk-err').classList.add('show');setTimeout(()=>inp.classList.remove('error'),400);return;}
  state.profile.transportAccess=true;
  localStorage.setItem('summercup_profile_andre',JSON.stringify(state.profile));
  renderTransport();
}

export function transportCardHTML(t) {
  if(t.ape)return`<div class="transport-card"><div class="transport-ape"><span class="transport-ape-icon">🚶</span><div><div style="font-size:14px;font-weight:600;color:var(--txt)">Deslocação a pé</div><div style="font-size:12px;color:var(--txt3);margin-top:2px">O pavilhão fica junto ao alojamento</div></div></div></div>`;
  let legs='';
  t.legs.forEach((leg,i)=>{
    legs+=`<div class="leg"><div class="leg-line"><div class="leg-dot"></div><div class="leg-connector"></div><div class="leg-dot end"></div></div>
    <div class="leg-body"><div class="leg-stop"><span class="leg-place">📍 ${leg.orig}</span><span class="leg-hora">${leg.hora}</span></div>
    <div class="leg-arrow">↓</div><div class="leg-stop"><span class="leg-place">🏁 ${leg.dest}</span></div></div></div>
    ${i<t.legs.length-1?`<div style="padding:6px 14px;font-size:11px;color:var(--yellow-d);background:rgba(245,216,0,.06);border-bottom:1px solid var(--border)">⟳ Transbordo</div>`:''}`;
  });
  return`<div class="transport-card">${legs}</div>`;
}

export function renderFood() {
  const el = document.getElementById('food-content');
  if (!state.profile.equipa || !state.profile.escalao) {
    el.innerHTML=`<div class="empty"><div class="empty-icon">🍽</div><div class="empty-txt">Seleciona equipa no onboarding.</div></div>`;
    return;
  }
  const myFood = state.ALIMENTOS.filter(r => sameText(r['Competição'],state.profile.escalao) && sameText(r['Equipa'],state.profile.equipa) && dayNum(r['Data'])===state.activeLogDia);
  if (!myFood.length) {
    el.innerHTML=`<div class="empty"><div class="empty-icon">🍽</div><div class="empty-txt">Sem informação de alimentação para ${state.profile.equipa}.</div></div>`;
    return;
  }
  // O seletor de dias já filtra myFood a um único dia — não é preciso
  // repetir a data entre o seletor e os retângulos de refeição.
  let h = `<div class="card"><div>`;
  myFood.forEach(r => {
    h += `<div class="game-item">
      <div class="game-time"><div class="game-time-dia">${r['Refeição'] || ''}</div></div>
      <div class="game-teams"><div class="game-teams-row"><span class="game-team-name">📍 ${r['Local'] || ''}</span></div></div>
    </div>`;
  });
  h += `</div></div>`;
  el.innerHTML = h;
}

// ── WINDOW REGISTRATIONS ──
window.unlockTransport = unlockTransport;
window.setLogDia = setLogDia;
