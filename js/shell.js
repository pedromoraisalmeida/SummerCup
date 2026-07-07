import { state } from './state.js';
import { clubLogoSlug } from './utils.js';
import { mergeResults, startFirebaseSync } from './firebase.js';

// Só usa o que já está guardado em state.profile (localStorage) — nada disto
// depende dos dados do Sheets, por isso pode (e deve) correr logo no arranque,
// antes até do fetch às sheets começar, para nunca "piscar" o botão de perfil
// ou o Logística com o estado por defeito enquanto os dados carregam.
export function hydrateChrome() {
  const fn = { jogador:'🏃', treinador:'📋', dirigente:'🏅', arbitro:'🟡', pavilhao:'🏟' };
  const icon = `<span>${fn[state.profile.funcao]||''}</span>`;
  let hdrContent;
  if (state.profile.equipa && state.profile.escalao) {
    const slug = clubLogoSlug(state.profile.equipa);
    const logo = slug ? `<img class="hdr-club-logo" src="./logos/${slug}.png" alt="" onerror="this.remove()">` : '';
    hdrContent = `${icon}${logo ? ` <span class="hdr-dot">·</span> ` : ''}<span class="hdr-logo-escalao">${logo}<span class="hdr-escalao">(${state.profile.escalao})</span></span>`;
  } else {
    const label = state.profile.funcao === 'pavilhao' ? `Campo ${state.profile.campo}` :
                  state.profile.funcao === 'arbitro' ? state.profile.arbCode || 'Árbitro' : '';
    // Nome/código temporariamente escondido: reativar removendo style="display:none" do span
    hdrContent = `${icon}<span style="display:none"> ${label}</span>`;
  }
  document.getElementById('hdr-profile-btn').innerHTML = hdrContent;

  // Adjust nav for pavilhao
  if (state.profile.funcao === 'pavilhao') {
    document.getElementById('nav-logistica').innerHTML = '<span class="nav-icon">🏟</span>Pavilhão';
    document.getElementById('nav-logistica').onclick = () => showPage('pavilhao', document.getElementById('nav-logistica'));
  }

  // Logística temporariamente escondida para o perfil Jogador (Público): reativar removendo esta condição
  if (state.profile.funcao === 'jogador') {
    document.getElementById('nav-logistica').style.display = 'none';
  }
}

export function initApp() {
  mergeResults();
  state.activeEscalao = state.profile.escalao || Object.keys(state.TEAMS).sort()[0];
  state.classEscalao = state.profile.escalao || Object.keys(state.TEAMS).sort()[0];
  if (state.profile.escalao && state.profile.equipa) {
    for (const [s, teams] of Object.entries(state.TEAMS[state.profile.escalao] || {})) {
      if (teams.includes(state.profile.equipa)) { state.profile.serie = s; break; }
    }
    state.classSerie = state.profile.serie || '';
  }
  hydrateChrome();

  Promise.all([
    import('./roles/shared.js'),
    import('./roles/jogador.js'),
    import('./roles/arbitro.js'),
    import('./roles/pavilhao.js'),
    import('./roles/logistica.js'),
  ]).then(([shared, jogador, arbitro, pavilhao, logistica]) => {
    shared.buildFilterEscalao();
    shared.buildFilterDia();
    shared.buildClassFilters();
    jogador.renderHome();
    shared.renderJogos();
    shared.renderClass();
    logistica.buildFilterLogDia();
    logistica.renderTransport();
    logistica.renderFood();
    pavilhao.renderPavilhao();
    restoreLastPage();
    startFirebaseSync(refreshAllViews);
  });
}

function refreshAllViews() {
  if (!state.profile) return;
  const activePage = document.querySelector('.page.active');
  if (!activePage) return;
  const id = activePage.id.replace('page-', '');

  import('./roles/shared.js').then(shared => {
    import('./roles/jogador.js').then(jogador => {
      import('./roles/pavilhao.js').then(pavilhao => {
        if (id === 'home') jogador.renderHome();
        else if (id === 'jogos') shared.renderJogos();
        else if (id === 'class') shared.renderClass();
        else if (id === 'pavilhao') pavilhao.renderPavilhao();
      });
    });
  });
}

export function showPage(id, btn) {
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
  document.getElementById('page-' + id).classList.add('active');
  if (btn) btn.classList.add('active');
  document.getElementById('scroll').scrollTop = 0;
  sessionStorage.setItem('summercup_last_page', id);

  // O pill ativo dos filtros da Classificação só pode ser centrado depois
  // de a página estar mesmo visível (scrollIntoView falha em páginas
  // escondidas) — refaz isso agora que "class" acabou de ficar ativa.
  if (id === 'class') {
    requestAnimationFrame(() => {
      import('./roles/shared.js').then(shared => shared.scrollClassFiltersIntoView());
    });
  }
}

// Repõe a página em que o utilizador estava antes de um refresh (a página
// recarregada começa sempre no Início por defeito no HTML estático). Não
// depende dos dados do Sheets — pode correr logo no arranque, tal como o
// hydrateChrome(), para nunca chegar a mostrar o Início por breve que seja.
export function restoreLastPage() {
  const id = sessionStorage.getItem('summercup_last_page');
  if (!id || id === 'home') return;
  const page = document.getElementById('page-' + id);
  if (!page) return;
  const btn = id === 'pavilhao'
    ? document.getElementById('nav-logistica')
    : document.querySelector(`.nav-btn[onclick*="showPage('${id}'"]`);
  showPage(id, btn);
}

export function showLogTab(id, btn) {
  document.querySelectorAll('.log-tab').forEach(t => t.classList.remove('active'));
  document.querySelectorAll('.log-panel').forEach(p => p.classList.remove('active'));
  btn.classList.add('active');
  document.getElementById('log-' + id).classList.add('active');
}

export function openProfile() {
  const fn={jogador:'Jogador',treinador:'Treinador',dirigente:'Dirigente',arbitro:'Árbitro',pavilhao:'Resp. Pavilhão'};
  const fnIcon={jogador:'🏃',treinador:'📋',dirigente:'🏅',arbitro:'🟡',pavilhao:'🏟'};
  let rows=`<div class="profile-info-row"><span class="profile-info-label">Função</span><span class="profile-info-val">${fnIcon[state.profile.funcao]||''} ${fn[state.profile.funcao]||state.profile.funcao}</span></div>`;
  if(state.profile.equipa){
    const slug=clubLogoSlug(state.profile.equipa);
    const logo=slug?`<img class="profile-club-logo" src="./logos/${slug}.png" alt="" onerror="this.remove()">`:'';
    rows+=`<div class="profile-info-row"><span class="profile-info-label">Equipa</span><span class="profile-info-val">${logo} ${state.profile.equipa}</span></div>`;
  }
  if(state.profile.escalao)rows+=`<div class="profile-info-row"><span class="profile-info-label">Escalão</span><span class="profile-info-val">${state.profile.escalao}</span></div>`;
  if(state.profile.serie)rows+=`<div class="profile-info-row"><span class="profile-info-label">Série</span><span class="profile-info-val">${state.profile.serie}</span></div>`;
  if(state.profile.campo)rows+=`<div class="profile-info-row"><span class="profile-info-label">Campo</span><span class="profile-info-val">${state.profile.campo}</span></div>`;
  if(state.profile.arbCode)rows+=`<div class="profile-info-row"><span class="profile-info-label">Cód. Árbitro</span><span class="profile-info-val">${state.profile.arbCode}</span></div>`;
  // Linha de Transportes temporariamente escondida para o perfil Jogador (Público), já que a Logística está escondida do footer: reativar removendo esta condição
  const transportRowStyle = state.profile.funcao === 'jogador' ? ' style="display:none"' : '';
  rows+=`<div class="profile-info-row"${transportRowStyle}><span class="profile-info-label">Transportes</span><span class="profile-info-val">${state.profile.transportAccess?'✓ Desbloqueado':'Bloqueado'}</span></div>`;
  document.getElementById('profile-info').innerHTML=rows;
  document.getElementById('profile-panel').classList.add('open');
}

export function closeProfile(e) {
  if(!e||e.target===document.getElementById('profile-panel'))
    document.getElementById('profile-panel').classList.remove('open');
}

// ── WINDOW REGISTRATIONS ──
window.showPage = showPage;
window.showLogTab = showLogTab;
window.openProfile = openProfile;
window.closeProfile = closeProfile;
