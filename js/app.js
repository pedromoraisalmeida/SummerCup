import { loadAllData } from './data.js';
import { state } from './state.js';
import { initApp } from './shell.js';
import './onboarding.js';

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
  const homeContent = document.getElementById('home-content');
  if (homeContent) homeContent.innerHTML = '<div class="loading-spinner"></div><div class="loading-text">A atualizar os dados existentes...</div>';
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
