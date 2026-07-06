// ── FIREBASE CONFIG ──
export const firebaseConfig = {
  apiKey: "AIzaSyCKMlF4K6r7wcTJSNPClrH3_ZIKEdmOQfs",
  authDomain: "lvcsummercup.firebaseapp.com",
  databaseURL: "https://lvcsummercup-default-rtdb.europe-west1.firebasedatabase.app",
  projectId: "lvcsummercup",
  storageBucket: "lvcsummercup.firebasestorage.app",
  messagingSenderId: "922372921328",
  appId: "1:922372921328:web:b941897ef1d1f6a66eaf35"
};

// ── SHEET URLS ──
export const SHEET_JOGOS_1 = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vToHTnWoxtNbq9n9ADKkIknIL_LHggjewHM9d0rZ3eAMkBRuQjGwSFnRiDgXd5_SJodIHuZmlFAOmX3/pub?gid=1352651038&single=true&output=csv';
export const SHEET_JOGOS_2 = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vToHTnWoxtNbq9n9ADKkIknIL_LHggjewHM9d0rZ3eAMkBRuQjGwSFnRiDgXd5_SJodIHuZmlFAOmX3/pub?gid=797586335&single=true&output=csv';
export const SHEET_EQUIPAS = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vQe1DHZKEttW1Ou63N8nbT78uXj8etpoX5n8szjmtn-piG6llFqDAug83CV251JJamb_cP4g9ZP50Nq/pub?gid=474694585&single=true&output=csv';
export const SHEET_ALIM_BASE = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vQ6Sx1XqkMAbYhjjKk5npwrXSW18z6WHGwBHjnzs9oISgFwGD5ok3YCiZPKeUfxLQOuMKvdFg5Y-06r/pub';
export const SHEET_ALIM_GIDS = [1380743925, 1964067470, 2052038196, 768459128, 471658987];
export const SHEET_TRANS_BASE = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vSzG_9SUgTjC6k4FjydWbiTx8qtzLfUzg9-xQKK0v9oEGJu8o3OfR7ohapQVCwtCoMxTlGsj2cXO6H2/pub';
export const SHEET_TRANS_GIDS = [654509863, 1952763025, 899121424, 206391779, 1178552434];

export const CAMPO_CODES = {
  "AL1": "PAV-AL1", "AL2": "PAV-AL2", "AL3": "PAV-AL3",
  "AS1": "PAV-AS1", "AS2": "PAV-AS2", "AS3": "PAV-AS3",
  "AV1": "PAV-AV1", "AV2": "PAV-AV2", "AV3": "PAV-AV3",
  "CP1": "PAV-CP1", "CP2": "PAV-CP2", "CP3": "PAV-CP3",
  "G1": "PAV-G1",  "G2": "PAV-G2",  "G3": "PAV-G3",
  "L4": "PAV-L4",  "L5": "PAV-L5",  "L6": "PAV-L6",  "L7": "PAV-L7",  "L8": "PAV-L8",
  "LE1": "PAV-LE1","LE2": "PAV-LE2","LE3": "PAV-LE3",
  "MC4": "PAV-MC4","MC5": "PAV-MC5","MC6": "PAV-MC6",
  "PL1": "PAV-PL1","PL2": "PAV-PL2","PL3": "PAV-PL3",
  "PO1": "PAV-PO1","PO2": "PAV-PO2","PO3": "PAV-PO3",
  "S1": "PAV-S1",  "S2": "PAV-S2",  "S3": "PAV-S3",
  "ST1": "PAV-ST1","ST2": "PAV-ST2","ST3": "PAV-ST3",
  "UC1": "PAV-UC1","UC2": "PAV-UC2","UC3": "PAV-UC3","UC4": "PAV-UC4",
  "UC5": "PAV-UC5","UC6": "PAV-UC6","UC7": "PAV-UC7"
};

// ── PAVILHÕES ──
const PAVILHOES_CAMPOS = {
  "Pavilhão Municipal n.º 2 da Lousã": ["L4", "L5", "L6"],
  "Pavilhão da STATUS": ["L7"],
  "Pavilhão da Escola Básica n.º 1 da Lousã": ["L8"],
  "Pavilhão do Bairro dos Carvalhos": ["LE1", "LE2", "LE3"],
  "Pavilhão Gimnodesportivo de Serpins": ["S1", "S2", "S3"],
  "Pavilhão da Casa do Povo de Miranda do Corvo": ["MC4", "MC5", "MC6"],
  "Complexo Desportivo Municipal de Vila Nova de Poiares": ["PO1", "PO2", "PO3"],
  "Pavilhão Gimnodesportivo de Góis": ["G1", "G2", "G3"],
  "Pavilhão Multiusos de Penela": ["PL1", "PL2", "PL3"],
  "Estádio Universitário de Coimbra": ["UC1", "UC2", "UC3", "UC4", "UC5", "UC6", "UC7"],
  "Pavilhão Gimnodesportivo de Ansião": ["AS1", "AS2", "AS3"],
  "Pavilhão Escola Básica n.º 1 Avelar": ["AV1", "AV2", "AV3"],
  "Pavilhão Gimnodesportivo de Santiago da Guarda": ["ST1", "ST2", "ST3"],
  "Pavilhão Desportivo de Alvaiázere": ["AL1", "AL2", "AL3"],
  "Pavilhão Municipal de Castanheira de Pera": ["CP1", "CP2", "CP3"],
};

export const CAMPO_PAVILHAO = Object.fromEntries(
  Object.entries(PAVILHOES_CAMPOS).flatMap(([pav, campos]) => campos.map(c => [c, pav]))
);

export const ACCESS_KEY = "SummerCup2026";

// ── CÓDIGO DE CLUBE (Treinador) ──
// Validado via Apps Script contra uma Google Sheet privada (não publicada),
// que nunca é enviada para o browser — só o resultado da consulta a um
// código específico. O código do clube não fica guardado em lado nenhum
// deste repositório.
export const TREINADOR_CODE_ENDPOINT = "https://script.google.com/macros/s/AKfycbyJMn9futj6vI-4fj7_6YfPp9eH2tczsXfxCe_ojRw8PxW-vq4gz5nehw4p5CQW9kjjwA/exec";
