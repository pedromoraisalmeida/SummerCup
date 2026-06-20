import { loadAllData } from './data.js';
import { state } from './state.js';
import { initApp } from './shell.js';
import './onboarding.js';

// Add loading indicator to onboarding
const obFirst = document.querySelector('#onboarding .ob-logo');
if (obFirst) {
  const ld = document.createElement('div');
  ld.id = 'ob-loading';
  ld.style.cssText = 'text-align:center;padding:1rem;color:rgba(255,255,255,.5);font-size:13px;display:none';
  ld.innerHTML = '⏳ A carregar dados...';
  obFirst.insertAdjacentElement('afterend', ld);
}

function isProfileComplete(p) {
  if (!p || !p.funcao) return false;
  if (['jogador','treinador','dirigente'].includes(p.funcao)) return !!(p.escalao && p.equipa);
  if (p.funcao === 'arbitro') return !!p.arbCode;
  if (p.funcao === 'pavilhao') return !!(p.campo && p.pavCode);
  return false;
}

loadAllData().then(() => {
  if (isProfileComplete(state.profile)) {
    document.getElementById('onboarding').style.display = 'none';
    initApp();
  } else {
    // Profile incomplete or missing — reset and show onboarding
    if (state.profile && !isProfileComplete(state.profile)) {
      localStorage.removeItem('summercup_profile_andre');
      state.profile = null;
    }
    // If user already navigated to step 2, refresh escalões now that TEAMS is loaded
    const s2 = document.getElementById('ob-step2');
    if (s2 && s2.classList.contains('active')) {
      import('./onboarding.js').then(({ setupStep2 }) => setupStep2());
    }
  }
});
