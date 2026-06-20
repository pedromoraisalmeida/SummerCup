import { state } from '../state.js';

export function renderHomeArbitro() {
  const esc=[...new Set(state.currentGames.map(g=>g.escalao))].sort();
  let html=`<div class="stats-row">
    <div class="stat-chip"><div class="stat-chip-num">${state.currentGames.length}</div><div class="stat-chip-label">Total</div></div>
    <div class="stat-chip"><div class="stat-chip-num">${state.currentGames.filter(g=>g.dia==='09/jul.').length}</div><div class="stat-chip-label">9 Jul.</div></div>
    <div class="stat-chip"><div class="stat-chip-num">${state.currentGames.filter(g=>g.dia==='10/jul.').length}</div><div class="stat-chip-label">10 Jul.</div></div>
  </div>
  <div class="sec-head"><div class="sec-title">Escalões</div></div>`;
  esc.forEach(e => {
    const c=state.currentGames.filter(g=>g.escalao===e).length;
    html+=`<div class="card" style="margin-bottom:8px"><div style="padding:12px 14px;display:flex;justify-content:space-between;align-items:center"><span style="font-size:14px;font-weight:600">${e}</span><span style="font-size:12px;color:var(--txt3)">${c} jogos</span></div></div>`;
  });
  document.getElementById('home-content').innerHTML=html;
}
