import {
  SHEET_JOGOS_1, SHEET_JOGOS_2,
  SHEET_TRANS_BASE, SHEET_TRANS_GIDS,
  SHEET_ALIM_BASE, SHEET_ALIM_GIDS,
} from './config.js';
import { state } from './state.js';

// ── CSV PARSER ──
export function parseCSV(text) {
  const rows = text.trim().split('\n');
  if (!rows.length) return [];
  const hdrs = parseLine(rows[0]);
  return rows.slice(1).filter(l => l.trim()).map(line => {
    const vals = parseLine(line);
    const obj = {};
    hdrs.forEach((h, i) => obj[h.trim()] = (vals[i] ?? '').trim());
    return obj;
  });
}

export function parseLine(line) {
  const res = []; let cur = ''; let inQ = false;
  for (let i = 0; i < line.length; i++) {
    const c = line[i];
    if (c === '"') { if (inQ && line[i+1] === '"') { cur += '"'; i++; } else inQ = !inQ; }
    else if (c === ',' && !inQ) { res.push(cur); cur = ''; }
    else cur += c;
  }
  res.push(cur);
  return res;
}

// ── DATA TRANSFORMERS ──
export function rowToGame(r, idx) {
  const num = v => (v !== '' && v !== undefined && v !== null) ? parseInt(v) : null;
  return {
    id: parseInt(r['Jogo']) || idx + 1,
    dia: r['Dia'], hora: r['Horas'],
    escalao: r['Escalão'], serie: r['Série'], campo: r['C'],
    eA: r['Equipa A'], eB: r['Equipa B'],
    rA: num(r['Res. A']), rB: num(r['Res. B']),
    s1A: num(r['1º Set A']), s1B: num(r['1º Set B']),
    s2A: num(r['2º Set A']), s2B: num(r['2º Set B']),
    s3A: num(r['3º Set A']), s3B: num(r['3º Set B']),
    s4A: num(r['4º Set A']), s4B: num(r['4º Set B']),
    s5A: num(r['5º Set A']), s5B: num(r['5º Set B']),
    aprovado: (r['Aprovado'] || r['Approvado'] || '').trim(),
  };
}

export function buildTeamsFromGames(games) {
  const t = {};
  games.forEach(g => {
    if (!t[g.escalao]) t[g.escalao] = {};
    if (!t[g.escalao][g.serie]) t[g.escalao][g.serie] = new Set();
    if (g.eA) t[g.escalao][g.serie].add(g.eA);
    if (g.eB) t[g.escalao][g.serie].add(g.eB);
  });
  Object.keys(t).forEach(e => Object.keys(t[e]).forEach(s => { t[e][s] = [...t[e][s]].sort(); }));
  return t;
}

export function rowsToTransports(rows) {
  const map = new Map();
  rows.forEach(r => {
    if (!r['Equipa'] || !r['Competição']) return;
    const key = r['Competição'] + '||' + r['Equipa'] + '||' + r['Data'];
    if (!map.has(key)) map.set(key, { escalao: r['Competição'], equipa: r['Equipa'], rows: [] });
    map.get(key).rows.push(r);
  });
  const result = [];
  map.forEach(({ escalao, equipa, rows }) => {
    rows.forEach((r, idx) => {
      const tipo = idx === 0 ? 'partida' : 'regresso';
      const orig = r['Origem'] || '';
      const ape = !orig || orig.toLowerCase().includes('a pé');
      const legs = [];
      if (!ape && orig) {
        legs.push({ orig, dest: r['Destino'], hora: r['Hora'] });
        if (r['Origem2']) legs.push({ orig: r['Origem2'], dest: r['Destino2'], hora: r['Hora2'] });
      }
      result.push({ escalao, equipa, tipo, ape, legs, dia: r['Data'] || '' });
    });
  });
  return result;
}

// ── DATA LOADER ──
export async function loadAllData() {
  const loadingEl = document.getElementById('ob-loading');
  if (loadingEl) loadingEl.style.display = 'block';
  try {
    const mkUrl = (base, gid) => `${base}?gid=${gid}&single=true&output=csv`;
    const [r1, r2, ...rest] = await Promise.all([
      fetch(SHEET_JOGOS_1).then(r => r.text()),
      fetch(SHEET_JOGOS_2).then(r => r.text()),
      ...SHEET_TRANS_GIDS.map(gid => fetch(mkUrl(SHEET_TRANS_BASE, gid)).then(r => r.text())),
      ...SHEET_ALIM_GIDS.map(gid => fetch(mkUrl(SHEET_ALIM_BASE, gid)).then(r => r.text())),
    ]);
    const transTexts = rest.slice(0, SHEET_TRANS_GIDS.length);
    const alimTexts  = rest.slice(SHEET_TRANS_GIDS.length);
    const g1 = parseCSV(r1).map((r, i) => rowToGame(r, i));
    const g2 = parseCSV(r2).map((r, i) => rowToGame(r, g1.length + i));
    state.GAMES_BASE = [...g1, ...g2].filter(g => g.eA && g.eB);
    state.TEAMS = buildTeamsFromGames(state.GAMES_BASE);
    state.TRANSPORTS = rowsToTransports(transTexts.flatMap(t => parseCSV(t)));
    state.ALIMENTOS = alimTexts.flatMap(t => parseCSV(t));
  } catch(e) {
    console.error('Erro ao carregar dados:', e);
  }
  state.dataLoaded = true;
  if (loadingEl) loadingEl.style.display = 'none';
}
