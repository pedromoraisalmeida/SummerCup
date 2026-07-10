import {
  SHEET_JOGOS_1, SHEET_JOGOS_2,
  SHEET_EQUIPAS,
  SHEET_TRANS_BASE, SHEET_TRANS_GIDS,
  SHEET_ALIM_BASE, SHEET_ALIM_GIDS,
} from './config.js';
import { state } from './state.js';
import { dayNum } from './utils.js';

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

// Nos cruzamentos da Fase Final, enquanto a equipa apurada ainda não é
// conhecida, a sheet usa códigos-placeholder em vez do nome da equipa —
// "V123"/"D123" (vencedor/derrotado do jogo 123) ou "1ºSQ" (1.º classificado
// da série Q). Não são equipas reais e não devem aparecer nos dropdowns nem
// contar para classificações.
export const isPlaceholderCode = (name) => /^[VD]\d+$/.test(name) || /^\d+ºS[A-Z]+$/.test(name);

export function buildTeamsFromGames(games) {
  const t = {};
  games.forEach(g => {
    if (!t[g.escalao]) t[g.escalao] = {};
    if (!t[g.escalao][g.serie]) t[g.escalao][g.serie] = new Set();
    if (g.eA && !isPlaceholderCode(g.eA)) t[g.escalao][g.serie].add(g.eA);
    if (g.eB && !isPlaceholderCode(g.eB)) t[g.escalao][g.serie].add(g.eB);
  });
  Object.keys(t).forEach(e => Object.keys(t[e]).forEach(s => { t[e][s] = [...t[e][s]].sort(); }));
  return t;
}

export function rowsToEquipaClube(rows) {
  const map = {};
  rows.forEach(r => {
    if (r['Equipa'] && r['Clube']) map[r['Equipa']] = r['Clube'];
  });
  return map;
}

// Indexado por escalão+equipa (não só equipa): a mesma equipa pode
// aparecer em mais do que um escalão, e nada garante que fique sempre no
// mesmo alojamento em ambos.
export function rowsToEquipaAlojamento(rows) {
  const map = {};
  rows.forEach(r => {
    if (r['Equipa'] && r['Alojamento'] && r['Competição']) {
      map[r['Competição'] + '||' + r['Equipa']] = r['Alojamento'];
    }
  });
  return map;
}

// Minutos desde a meia-noite, a partir de "HH:MM" — usado só para comparar
// com as 18:00 na regra das "Festas". Devolve null se não for parseável.
function horaParaMinutos(hora) {
  const m = String(hora || '').match(/^(\d{1,2}):(\d{2})/);
  return m ? parseInt(m[1]) * 60 + parseInt(m[2]) : null;
}

// Dia do mês (ver dayNum) → destino final que marca um percurso como
// "Festas" nesse dia, em vez de "regresso" normal.
const FESTAS_DESTINO_POR_DIA = { 9: 'Lousã - EB1', 11: 'Lousã - Par. Exposições' };

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
      let tipo = idx === 0 ? 'partida' : 'regresso';
      // As duas colunas (Origem/Destino/Hora e Origem2/Destino2/Hora2)
      // interessam sempre, não só quando há transbordo:
      // - as duas preenchidas → transbordo (1.ª coluna = origem do
      //   percurso, 2.ª coluna = etapa do transbordo, por esta ordem);
      // - só a 2.ª preenchida → é o percurso principal (sem transbordo),
      //   não uma deslocação a pé;
      // - só a 1.ª preenchida → percurso simples, como já acontecia.
      const orig1 = r['Origem'] || '';
      const orig2 = r['Origem2'] || '';
      let legs = [];
      let ape = false;
      if (orig1 && orig2) {
        legs = [
          { orig: orig1, dest: r['Destino'], hora: r['Hora'] },
          { orig: orig2, dest: r['Destino2'], hora: r['Hora2'] },
        ];
      } else if (orig2) {
        legs = [{ orig: orig2, dest: r['Destino2'], hora: r['Hora2'] }];
      } else if (orig1) {
        legs = [{ orig: orig1, dest: r['Destino'], hora: r['Hora'] }];
      } else {
        ape = true;
      }

      // Exceção dos dias de "Festas": percursos que comecem às 18:00 ou
      // depois e tenham como destino final o local da festa desse dia são
      // "Festas", não regressos (nem partidas, se por acaso calhar de ser a
      // 1.ª linha do dia). O destino-alvo muda consoante o dia.
      const destinoFesta = FESTAS_DESTINO_POR_DIA[dayNum(r['Data'])];
      if (!ape && destinoFesta) {
        const inicio = horaParaMinutos(legs[0].hora);
        const destinoFinal = (legs[legs.length - 1].dest || '').trim();
        if (inicio !== null && inicio >= 18 * 60 && destinoFinal === destinoFesta) {
          tipo = 'festas';
        }
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
    // As Sheets do Google, quando publicadas na web, ficam em cache do lado
    // do Google e podem demorar a refletir edições recentes de forma
    // inconsistente entre pedidos (por vezes mostra a versão nova, por
    // vezes volta a mostrar uma mais antiga). O parâmetro "_" muda a cada
    // carregamento, o que faz o Google (e a cache HTTP do próprio browser,
    // desligada aqui com cache:'no-store') tratar o pedido como novo em vez
    // de devolver uma resposta previamente guardada.
    const bust = `_=${Date.now()}`;
    const withBust = (url) => url + (url.includes('?') ? '&' : '?') + bust;
    const fetchFresh = (url) => fetch(withBust(url), { cache: 'no-store' });
    const mkUrl = (base, gid) => `${base}?gid=${gid}&single=true&output=csv`;
    const [r1, r2, rEquipas, ...rest] = await Promise.all([
      fetchFresh(SHEET_JOGOS_1).then(r => r.text()),
      fetchFresh(SHEET_JOGOS_2).then(r => r.text()),
      fetchFresh(SHEET_EQUIPAS).then(r => r.text()),
      ...SHEET_TRANS_GIDS.map(gid => fetchFresh(mkUrl(SHEET_TRANS_BASE, gid)).then(r => r.text())),
      ...SHEET_ALIM_GIDS.map(gid => fetchFresh(mkUrl(SHEET_ALIM_BASE, gid)).then(r => r.text())),
    ]);
    const transTexts = rest.slice(0, SHEET_TRANS_GIDS.length);
    const alimTexts  = rest.slice(SHEET_TRANS_GIDS.length);
    // Fase 1 = folha "Fase1" (dias 08/07 e 09/07). Na folha "Fase2" há dois
    // tipos de jogo, distinguidos pela coluna "Série": uma letra (A, B, C...)
    // é 2.ª fase (mesmo formato de série da 1.ª fase, mas independente); um
    // formato "N.º/M.º" (ou "Final") é a Fase Final (cruzamentos eliminatórios).
    const g1 = parseCSV(r1).map((r, i) => ({ ...rowToGame(r, i), fase: 1 }));
    const g2 = parseCSV(r2).map((r, i) => {
      const g = rowToGame(r, g1.length + i);
      g.fase = /^[A-Za-z]$/.test(g.serie) ? 2 : 'final';
      return g;
    });
    state.GAMES_BASE = [...g1, ...g2].filter(g => g.eA && g.eB);
    state.TEAMS = buildTeamsFromGames(state.GAMES_BASE);
    const equipasRows = parseCSV(rEquipas);
    state.EQUIPA_CLUBE = rowsToEquipaClube(equipasRows);
    state.EQUIPA_ALOJAMENTO = rowsToEquipaAlojamento(equipasRows);
    state.TRANSPORTS = rowsToTransports(transTexts.flatMap(t => parseCSV(t)));
    state.ALIMENTOS = alimTexts.flatMap(t => parseCSV(t));
  } catch(e) {
    console.error('Erro ao carregar dados:', e);
    const banner = document.getElementById('offline-banner');
    if (banner) banner.classList.add('show');
  }
  state.dataLoaded = true;
  if (loadingEl) loadingEl.style.display = 'none';
}
