import { state } from '../state.js';
import { ACCESS_KEY } from '../config.js';

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
  const myT=state.TRANSPORTS.filter(t=>t.equipa===state.profile.equipa&&t.escalao===state.profile.escalao);
  if(!myT.length){el.innerHTML=`<div class="empty"><div class="empty-icon">🚌</div><div class="empty-txt">Nenhum transporte para ${state.profile.equipa}</div></div>`;return;}
  const partidas=myT.filter(t=>t.tipo==='partida');
  const regressos=myT.filter(t=>t.tipo==='regresso');
  let h=`<div class="sec-head"><div class="sec-title">Transportes — 09 Julho</div></div>`;
  if(partidas.length){h+=`<div style="margin-bottom:8px"><span style="font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:.8px;padding:4px 12px;border-radius:99px;background:var(--blue-l);color:var(--blue-d);border:1px solid rgba(26,91,166,.2)">🏟 Partidas</span></div>`;partidas.forEach(t=>h+=transportCardHTML(t));}
  if(regressos.length){h+=`<div style="margin-bottom:8px;margin-top:12px"><span style="font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:.8px;padding:4px 12px;border-radius:99px;background:var(--green-l,#e6f5ee);color:var(--green);border:1px solid rgba(26,122,69,.2)">🏠 Regressos</span></div>`;regressos.forEach(t=>h+=transportCardHTML(t));}
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
  const myFood = state.ALIMENTOS.filter(r => r['Competição'] === state.profile.escalao && r['Equipa'] === state.profile.equipa);
  if (!myFood.length) {
    el.innerHTML=`<div class="empty"><div class="empty-icon">🍽</div><div class="empty-txt">Sem informação de alimentação para ${state.profile.equipa}.</div></div>`;
    return;
  }
  const byDate = {};
  myFood.forEach(r => { const d = r['Data'] || 'S/d'; if (!byDate[d]) byDate[d]=[]; byDate[d].push(r); });
  let h = '';
  Object.entries(byDate).forEach(([data, refs]) => {
    h += `<div class="sec-head"><div class="sec-title">📅 ${data}</div></div><div class="card"><div>`;
    refs.forEach(r => {
      h += `<div class="game-item">
        <div class="game-time"><div class="game-time-dia">${r['Refeição'] || ''}</div></div>
        <div class="game-teams"><div class="game-teams-row"><span class="game-team-name">📍 ${r['Local'] || ''}</span></div></div>
      </div>`;
    });
    h += `</div></div>`;
  });
  el.innerHTML = h;
}

// ── WINDOW REGISTRATIONS ──
window.unlockTransport = unlockTransport;
