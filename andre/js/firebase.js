import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import { getDatabase, ref, set, onValue } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-database.js";
import { firebaseConfig } from './config.js';
import { state } from './state.js';

const fbApp = initializeApp(firebaseConfig);
export const db = getDatabase(fbApp);
export { ref, set };

export function mergeResults() {
  state.currentGames = state.GAMES_BASE.map(g => {
    const fb = state.fbResults[g.id];
    if (!fb) return { ...g };
    return {
      ...g,
      rA: fb.rA, rB: fb.rB,
      s1A: fb.s1A, s1B: fb.s1B,
      s2A: fb.s2A, s2B: fb.s2B,
      s3A: fb.s3A !== undefined ? fb.s3A : null,
      s3B: fb.s3B !== undefined ? fb.s3B : null,
      fromFirebase: true
    };
  });
}

export function updateLiveIndicator() {
  const hasAny = Object.keys(state.fbResults).length > 0;
  document.getElementById('hdr-live').style.display = hasAny ? 'flex' : 'none';
}

export function startFirebaseSync(refreshAllViews) {
  const resultsRef = ref(db, 'results');
  onValue(resultsRef, (snapshot) => {
    state.fbResults = snapshot.val() || {};
    mergeResults();
    refreshAllViews();
    updateLiveIndicator();
  });
}
