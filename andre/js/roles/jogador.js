import { state } from '../state.js';
import { myTeamGames, hasResult, isWin, abbr, setsStr, gameItemHTML } from '../utils.js';
import { renderHomeArbitro } from './arbitro.js';
import { renderHomePavilhao } from './pavilhao.js';

export function renderHome() {
  if (state.profile.funcao === 'pavilhao') { renderHomePavilhao(); return; }
  if (state.profile.funcao === 'arbitro') { renderHomeArbitro(); return; }
  const my = myTeamGames().sort((a,b) => a.id-b.id);
  const done = my.filter(g => hasResult(g));
  const wins = done.filter(g => isWin(g,state.profile.equipa)).length;
  let html = `<div class="stats-row">
    <div class="stat-chip"><div class="stat-chip-num">${my.length}</div><div class="stat-chip-label">Jogos</div></div>
    <div class="stat-chip"><div class="stat-chip-num">${wins}</div><div class="stat-chip-label">Vitórias</div></div>
    <div class="stat-chip"><div class="stat-chip-num">${done.length-wins}</div><div class="stat-chip-label">Derrotas</div></div>
  </div>`;
  if (done.length>0) {
    const last=done[done.length-1]; const w=isWin(last,state.profile.equipa);
    const opp=last.eA===state.profile.equipa?last.eB:last.eA;
    const sA=last.eA===state.profile.equipa?last.rA:last.rB;
    const sB=last.eA===state.profile.equipa?last.rB:last.rA;
    html+=`<div class="sec-head"><div class="sec-title">Último resultado</div></div>
    <div class="hero-card">
      <div class="hero-badge ${w?'':'loss'}">${w?'✓ Vitória':'✗ Derrota'}</div>
      <div class="match-row">
        <div class="match-team"><div class="match-team-abbr home">${abbr(state.profile.equipa)}</div><div class="match-team-name">${state.profile.equipa}</div></div>
        <div class="match-score"><div class="match-score-num">${sA}–${sB}</div><div class="match-score-sets">${setsStr(last).join('  ')}</div></div>
        <div class="match-team"><div class="match-team-abbr away">${abbr(opp)}</div><div class="match-team-name">${opp}</div></div>
      </div>
      <div class="match-meta"><div class="match-meta-item">📅 ${last.dia}</div><div class="match-meta-item">🕐 ${last.hora}</div><div class="match-meta-item">📍 ${last.campo}</div></div>
    </div>`;
  }
  const upcoming=my.filter(g=>!hasResult(g));
  if (upcoming.length>0) {
    const next=upcoming[0]; const opp=next.eA===state.profile.equipa?next.eB:next.eA;
    html+=`<div class="sec-head"><div class="sec-title">Próximo jogo</div></div>
    <div class="hero-card blue-bg">
      <div class="hero-badge">A seguir</div>
      <div class="match-row">
        <div class="match-team"><div class="match-team-abbr home">${abbr(state.profile.equipa)}</div><div class="match-team-name">${state.profile.equipa}</div></div>
        <div class="match-score"><div class="match-score-num" style="font-size:20px;letter-spacing:0">vs</div><div class="match-score-sets">${next.escalao} · Série ${next.serie}</div></div>
        <div class="match-team"><div class="match-team-abbr away">${abbr(opp)}</div><div class="match-team-name">${opp}</div></div>
      </div>
      <div class="match-meta"><div class="match-meta-item">📅 ${next.dia}</div><div class="match-meta-item">🕐 ${next.hora}</div><div class="match-meta-item">📍 ${next.campo}</div></div>
    </div>`;
  }
  if (my.length>0) {
    html+=`<div class="sec-head"><div class="sec-title">Todos os meus jogos</div></div>
    <div class="card"><div class="card-header"><div class="card-title">${state.profile.equipa}</div><div class="card-badge">${state.profile.escalao}${state.profile.serie?' · Série '+state.profile.serie:''}</div></div><div>`;
    my.forEach(g => html+=gameItemHTML(g,true));
    html+=`</div></div>`;
  }
  if (!my.length) html+=`<div class="empty"><div class="empty-icon">🔍</div><div class="empty-txt">Nenhum jogo encontrado para ${state.profile.equipa}</div></div>`;
  document.getElementById('home-content').innerHTML=html;
}
