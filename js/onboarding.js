import { CAMPO_CODES, ACCESS_KEY, TREINADOR_CODE_ENDPOINT } from './config.js';
import { state } from './state.js';

let treinadorClube = null;

export function selectFuncao(f, el) {
  document.querySelectorAll('.ob-card').forEach(c => c.classList.remove('sel'));
  el.classList.add('sel');
  state.profile = { funcao: f };
  document.getElementById('ob-btn1').disabled = !state.dataLoaded;
}

export function goStep(n) {
  document.querySelectorAll('.ob-step').forEach(s => s.classList.remove('active'));
  document.getElementById('ob-step' + n).classList.add('active');
  if (n === 2) setupStep2();
  if (n === 3) setupStep3();
}

export function setupStep2() {
  const f = state.profile.funcao;
  document.getElementById('ob-step2-equipa').style.display = ['jogador','dirigente'].includes(f) ? 'block' : 'none';
  document.getElementById('ob-step2-treinador').style.display = f === 'treinador' ? 'block' : 'none';
  document.getElementById('ob-step2-arbitro').style.display = f === 'arbitro' ? 'block' : 'none';
  document.getElementById('ob-step2-pavilhao').style.display = f === 'pavilhao' ? 'block' : 'none';
  const btn = document.getElementById('ob-btn2');

  if (f === 'treinador') {
    // Repõe sempre o bloco do código de clube no estado inicial (ex. ao
    // voltar a este passo depois de "Voltar" no passo 1), já que o código
    // é validado num pedido de rede e não pode ficar preso a uma seleção
    // anterior de uma outra função.
    document.getElementById('ob-treinador-code').value = '';
    document.getElementById('ob-treinador-code').disabled = false;
    document.getElementById('ob-treinador-validate-btn').style.display = '';
    document.getElementById('ob-treinador-error').classList.remove('show');
    document.getElementById('ob-treinador-equipa').style.display = 'none';
    treinadorClube = null;
    btn.disabled = true;
    return;
  }

  if (f === 'arbitro' || f === 'pavilhao') {
    btn.disabled = true; // enabled by input
  } else {
    if (Object.keys(state.TEAMS).length === 0) {
      document.getElementById('ob-escalao').innerHTML = '<option value="">⏳ A carregar dados…</option>';
      document.getElementById('ob-equipa').innerHTML = '<option value="">—</option>';
      btn.disabled = true;
    } else {
      populateEscalaos();
      btn.disabled = true;
    }
  }
}

export async function validateTreinadorCode() {
  const input = document.getElementById('ob-treinador-code');
  const codigo = input.value.trim();
  const errEl = document.getElementById('ob-treinador-error');
  const btn = document.getElementById('ob-treinador-validate-btn');
  errEl.classList.remove('show');
  if (!codigo) return;

  btn.disabled = true;
  btn.textContent = 'A validar…';
  try {
    const res = await fetch(`${TREINADOR_CODE_ENDPOINT}?codigo=${encodeURIComponent(codigo)}`);
    const data = await res.json();
    if (data.valido) {
      treinadorClube = data.clube;
      state.profile.clube = data.clube;
      document.getElementById('ob-treinador-clube-confirm').innerHTML = `✓ Código válido — <strong>${data.clube}</strong>`;
      document.getElementById('ob-treinador-equipa').style.display = 'block';
      populateEscalaosParaClube(data.clube);
      input.disabled = true;
      btn.style.display = 'none';
    } else {
      errEl.textContent = 'Código inválido. Verifica e tenta novamente.';
      errEl.classList.add('show');
      document.getElementById('ob-treinador-equipa').style.display = 'none';
    }
  } catch (e) {
    errEl.textContent = 'Erro de ligação. Verifica a internet e tenta novamente.';
    errEl.classList.add('show');
  }
  btn.disabled = false;
  btn.textContent = 'Validar código';
}

function populateEscalaosParaClube(clube) {
  const escaloes = Object.keys(state.TEAMS).filter(e =>
    Object.values(state.TEAMS[e]).flat().some(t => state.EQUIPA_CLUBE[t] === clube)
  ).sort();
  const sel = document.getElementById('ob-escalao-tr');
  sel.innerHTML = '<option value="">— Escolhe o escalão —</option>';
  escaloes.forEach(e => addOption(sel, e, e));
  const eq = document.getElementById('ob-equipa-tr');
  eq.innerHTML = '<option value="">— Escolhe a equipa —</option>';
  eq.disabled = true;
}

export function onEscalaoChangeTreinador() {
  const e = document.getElementById('ob-escalao-tr').value;
  const eq = document.getElementById('ob-equipa-tr');
  eq.innerHTML = '<option value="">— Escolhe a equipa —</option>';
  eq.disabled = !e;
  document.getElementById('ob-btn2').disabled = true;
  if (!e) return;
  const teams = [...new Set(Object.values(state.TEAMS[e]).flat())]
    .filter(t => state.EQUIPA_CLUBE[t] === treinadorClube)
    .sort();
  teams.forEach(t => addOption(eq, t, t));
  eq.onchange = () => {
    if (eq.value) { state.profile.escalao = e; state.profile.equipa = eq.value; }
    document.getElementById('ob-btn2').disabled = !eq.value;
  };
}

export function onPavCodeChange() {
  const val = document.getElementById('ob-pav-code').value.trim().toUpperCase();
  const valid = Object.values(CAMPO_CODES).includes(val);
  document.getElementById('ob-btn2').disabled = !valid;
  if (val.length > 3) document.getElementById('ob-pav-error').classList.toggle('show', !valid);
}

function addOption(select, value, label) {
  const opt = document.createElement('option');
  opt.value = value;
  opt.textContent = label;
  select.appendChild(opt);
}

function populateEscalaos() {
  const sel = document.getElementById('ob-escalao');
  sel.innerHTML = '<option value="">— Escolhe o escalão —</option>';
  Object.keys(state.TEAMS).sort().forEach(e => addOption(sel, e, e));
  const eq = document.getElementById('ob-equipa');
  eq.innerHTML = '<option value="">— Escolhe a equipa —</option>';
  eq.disabled = true;
}

export function onEscalaoChange() {
  const e = document.getElementById('ob-escalao').value;
  const eq = document.getElementById('ob-equipa');
  eq.innerHTML = '<option value="">— Escolhe a equipa —</option>';
  eq.disabled = !e;
  document.getElementById('ob-btn2').disabled = true;
  if (!e) return;
  const teams = [...new Set(Object.values(state.TEAMS[e]).flat())].sort();
  teams.forEach(t => addOption(eq, t, t));
  eq.onchange = () => {
    if (eq.value) { state.profile.escalao = e; state.profile.equipa = eq.value; }
    document.getElementById('ob-btn2').disabled = !eq.value;
  };
}

function setupStep3() {
  // O Treinador já validou o código de clube no passo 2 — não volta a
  // pedir-se aqui. O Dirigente (perfil ainda escondido) mantém o código
  // partilhado antigo até se decidir o mesmo esquema de código por clube.
  const needsKey = state.profile.funcao === 'dirigente';
  document.getElementById('ob-step3-key').style.display = needsKey ? 'block' : 'none';
  document.getElementById('ob-step3-confirm').style.display = needsKey ? 'none' : 'block';
  if (!needsKey) {
    const msgs = {
      jogador: `🏐 A ver jogos de <strong>${state.profile.equipa}</strong> (${state.profile.escalao})`,
      treinador: `📋 A gerir <strong>${state.profile.equipa}</strong> (${state.profile.escalao}) — acesso a transportes e alimentação.`,
      arbitro: '🟡 Acesso ao calendário e escala de arbitragem.',
      pavilhao: `🏟 Pavilhão <strong>${state.profile.campo}</strong> — registo de resultados ativo.`
    };
    document.getElementById('ob-confirm-text').innerHTML = msgs[state.profile.funcao] || '';
  }
  document.getElementById('ob-btn3').disabled = false;
}

export function handleStep3() {
  const f = state.profile.funcao;
  if (f === 'dirigente') {
    const val = document.getElementById('ob-key').value.trim();
    if (val !== ACCESS_KEY) {
      const inp = document.getElementById('ob-key');
      inp.classList.add('error');
      document.getElementById('ob-key-error').classList.add('show');
      setTimeout(() => inp.classList.remove('error'), 400);
      return;
    }
    state.profile.transportAccess = true;
  }
  if (f === 'treinador') {
    state.profile.transportAccess = true;
  }
  if (f === 'arbitro') {
    state.profile.arbCode = document.getElementById('ob-arb-code').value.trim().toUpperCase();
  }
  if (f === 'pavilhao') {
    const code = document.getElementById('ob-pav-code').value.trim().toUpperCase();
    state.profile.campo = Object.keys(CAMPO_CODES).find(k => CAMPO_CODES[k] === code);
    state.profile.pavCode = code;
  }
  localStorage.setItem('summercup_profile_andre', JSON.stringify(state.profile));
  document.getElementById('onboarding').style.display = 'none';
  // Dynamic import to avoid circular dependency
  import('./shell.js').then(({ initApp }) => initApp());
}

export function resetProfile() { localStorage.removeItem('summercup_profile_andre'); location.reload(); }

// ── WINDOW REGISTRATIONS ──
window.selectFuncao = selectFuncao;
window.goStep = goStep;
window.onPavCodeChange = onPavCodeChange;
window.onEscalaoChange = onEscalaoChange;
window.validateTreinadorCode = validateTreinadorCode;
window.onEscalaoChangeTreinador = onEscalaoChangeTreinador;
window.handleStep3 = handleStep3;
window.resetProfile = resetProfile;
