import { loadAllData } from './data.js';
import { state } from './state.js';
import { initApp, hydrateChrome, restoreLastPage } from './shell.js';
import { initPullToRefresh } from './pulltorefresh.js';
import './onboarding.js';

initPullToRefresh();

// 100dvh não é fiável em todos os fabricantes Android (ex. barras de navegação
// tradicionais de 3 botões nalguns Xiaomi/MIUI) — medir a altura real do
// viewport e aplicá-la como variável CSS é mais robusto entre dispositivos.
function setAppHeight() {
  document.documentElement.style.setProperty('--app-height', `${window.innerHeight}px`);
}
setAppHeight();
window.addEventListener('resize', setAppHeight);
window.addEventListener('orientationchange', setAppHeight);

// Service worker: garante que a app (e a PWA instalada) vão sempre buscar a
// versão mais recente à rede primeiro, e avisa o utilizador (sem recarregar
// à força, para não perder o que estiver a preencher) quando há atualização.
if ('serviceWorker' in navigator) {
  // Se já havia um controller ativo antes deste registo, qualquer troca de
  // controller a partir daqui é uma atualização real — não a primeira
  // instalação da própria SW (essa não deve mostrar o aviso).
  const hadController = !!navigator.serviceWorker.controller;
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('./sw.js', { updateViaCache: 'none' });
  });
  navigator.serviceWorker.addEventListener('controllerchange', () => {
    if (!hadController) return;
    const banner = document.getElementById('update-banner');
    if (banner) banner.classList.add('show');
  });
}

// Add loading indicator to onboarding, right before the step-1 continue button
const obBtn1 = document.getElementById('ob-btn1');
if (obBtn1) {
  const ld = document.createElement('div');
  ld.id = 'ob-loading';
  ld.style.cssText = 'text-align:center;padding:1rem;color:rgba(255,255,255,.5);font-size:13px;display:none';
  ld.innerHTML = '⏳ A carregar dados...';
  obBtn1.insertAdjacentElement('beforebegin', ld);
}

function isProfileComplete(p) {
  if (!p || !p.funcao) return false;
  if (['jogador','treinador','dirigente'].includes(p.funcao)) return !!(p.escalao && p.equipa);
  if (p.funcao === 'arbitro') return !!p.arbCode;
  if (p.funcao === 'pavilhao') return !!(p.campo && p.pavCode);
  return false;
}

// Returning user with a saved profile: hide the onboarding screen right away
// instead of waiting for the data fetch to finish, so it never flashes on screen.
// Show a spinner in its place until the real content is ready.
if (isProfileComplete(state.profile)) {
  document.getElementById('onboarding').style.display = 'none';
  const loadingHTML = '<div class="loading-spinner"></div><div class="loading-text">A atualizar os dados existentes...</div>';
  ['home-content', 'jogos-list', 'class-content', 'transport-content', 'food-content', 'pavilhao-content'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.innerHTML = loadingHTML;
  });
  hydrateChrome();
  restoreLastPage();
}

loadAllData().then(() => {
  if (isProfileComplete(state.profile)) {
    document.getElementById('onboarding').style.display = 'none';
    initApp();
    return;
  }
  // If user is already mid-onboarding (step 2 active), just refresh the
  // dropdowns now that TEAMS is loaded — do NOT touch state.profile, it's
  // legitimately "incomplete" while the user is still filling it in.
  const s2 = document.getElementById('ob-step2');
  if (s2 && s2.classList.contains('active')) {
    import('./onboarding.js').then(({ setupStep2 }) => setupStep2());
    return;
  }
  // Still on step 1: if a função was already picked while data was loading,
  // unlock the "Continuar" button now that data is ready.
  if (state.profile && state.profile.funcao) {
    const btn1 = document.getElementById('ob-btn1');
    if (btn1) btn1.disabled = false;
    return;
  }
  // Otherwise, an incomplete profile here can only be stale data restored
  // from localStorage — safe to clear it.
  if (state.profile && !isProfileComplete(state.profile)) {
    localStorage.removeItem('summercup_profile_andre');
    state.profile = null;
  }
});
