import { state } from './state.js';

export function shortTeam(n) { if (!n) return ''; return n.length > 16 ? n.split(' ')[0] : n; }

export function abbr(n) {
  if (!n) return '??';
  const c = n.replace(/"[^"]*"/g,'').trim();
  const w = c.split(/\s+/).filter(x => x.length>1 && !/^(VC|FC|CA|CD|GC|CV|AV|GD|AA|SC)$/i.test(x));
  if (!w.length) return n.substring(0,2).toUpperCase();
  if (w.length===1) return w[0].substring(0,3).toUpperCase();
  return (w[0][0]+w[1][0]).toUpperCase();
}

export function clubLogoSlug(n) {
  if (!n) return '';
  return n.replace(/\s*"[^"]*"\s*$/, '').trim()
    .normalize('NFD').replace(new RegExp('[̀-ͯ]', 'g'), '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export function teamAvatarHTML(n, side) {
  const slug = clubLogoSlug(n);
  const span = slug ? `<span style="display:none">${abbr(n)}</span>` : `<span>${abbr(n)}</span>`;
  const img = slug ? `<img src="./logos/${slug}.png" alt="" onerror="this.previousElementSibling.style.display='';this.remove()">` : '';
  return `<div class="match-team-abbr ${side}">${span}${img}</div>`;
}

export function myTeamGames() {
  if (!state.profile.equipa) return [];
  return state.currentGames.filter(g =>
    (g.eA===state.profile.equipa || g.eB===state.profile.equipa) &&
    g.escalao===state.profile.escalao
  );
}

export function isWin(g, t) {
  if (g.rA===null||g.rA===undefined) return null;
  return g.eA===t ? g.rA>g.rB : g.eB===t ? g.rB>g.rA : null;
}

export function setsStr(g) {
  const s=[];
  if (g.s1A!==null&&g.s1A!==undefined) s.push(`${g.s1A}-${g.s1B}`);
  if (g.s2A!==null&&g.s2A!==undefined) s.push(`${g.s2A}-${g.s2B}`);
  if (g.s3A!==null&&g.s3A!==undefined&&(g.rA+g.rB)>1) s.push(`${g.s3A}-${g.s3B}`);
  if (g.s4A!==null&&g.s4A!==undefined) s.push(`${g.s4A}-${g.s4B}`);
  if (g.s5A!==null&&g.s5A!==undefined) s.push(`${g.s5A}-${g.s5B}`);
  return s;
}

export function hasResult(g) { return g.rA!==null && g.rA!==undefined; }

export function isAprovado(g) { return /^(ok|sim)$/i.test(g.aprovado||''); }

export function showToast(msg) {
  const t = document.getElementById('toast');
  t.textContent = msg; t.classList.add('show');
  setTimeout(() => t.classList.remove('show'), 2500);
}

export function gameItemHTML(g, hi) {
  const done=hasResult(g);
  const my=state.profile.equipa;
  const isA=g.eA===my,isB=g.eB===my;
  const w=done&&isA?g.rA>g.rB:done&&isB?g.rB>g.rA:null;
  const sets=setsStr(g);
  const sA=done?`<span class="game-score ${isA?(w?'win':'loss'):''}">${g.rA}</span>`:'';
  const sB=done?`<span class="game-score ${isB?(w?'win':'loss'):''}">${g.rB}</span>`:'';
  const src=g.fromFirebase?'🔴 ':'';
  const aprovado=isAprovado(g);
  const badge=!done?''
    :aprovado?`<span class="game-badge badge-done">${src}Oficial</span>`
    :`<span class="game-badge badge-provisorio">${src}Provisório</span>`;
  const scoreContent=done?`${sA}${sB}`:`<span class="game-badge badge-pending">–</span>`;
  return `<div class="game-item">
    <div class="game-time"><div class="game-time-dia">${g.dia.replace('/jul.','jul')}</div><div class="game-time-hora">${g.hora}</div><div class="game-time-id">Jogo ${g.id}</div></div>
    <div class="game-teams">
      <div class="game-teams-row"><span class="game-team-name ${hi&&isA?'my-team':''}">${g.eA}</span></div>
      <div class="game-teams-row"><span class="game-team-name ${hi&&isB?'my-team':''}">${g.eB}</span></div>
      ${done&&sets.length?`<div class="sets-row">${sets.map(s=>`<span class="set-chip">${s}</span>`).join('')}</div>`:''}
      <div class="game-campo">📍 ${g.campo}</div>
      <div class="game-escalao">🏐 ${g.escalao} · Série ${g.serie}</div>
    </div>
    ${badge}<div class="game-scores">${scoreContent}</div>
  </div>`;
}
