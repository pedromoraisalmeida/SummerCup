// ── SHARED MUTABLE STATE ──
export const state = {
  GAMES_BASE: [],
  TEAMS: {},
  TRANSPORTS: [],
  ALIMENTOS: [],
  fbResults: {},
  currentGames: [],
  profile: JSON.parse(localStorage.getItem('summercup_profile_andre') || 'null'),
  activeEscalao: '',
  activeDia: 'todos',
  activeLogDia: 'todos',
  classEscalao: '',
  classSerie: '',
  currentResultGame: null,
  currentSets: [],
  dataLoaded: false,
};
