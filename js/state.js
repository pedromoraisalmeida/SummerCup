// ── SHARED MUTABLE STATE ──
export const state = {
  GAMES_BASE: [],
  TEAMS: {},
  EQUIPA_CLUBE: {},
  TRANSPORTS: [],
  ALIMENTOS: [],
  fbResults: {},
  currentGames: [],
  profile: JSON.parse(localStorage.getItem('summercup_profile_andre') || 'null'),
  activeEscalao: '',
  activeDia: 'todos',
  activeLogDia: null,
  classEscalao: '',
  classSerie: '',
  currentResultGame: null,
  currentSets: [],
  dataLoaded: false,
};
