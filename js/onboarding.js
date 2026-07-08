import { CAMPO_CODES, ACCESS_KEY, TREINADOR_CODE_ENDPOINT } from './config.js';
import { state } from './state.js';

let treinadorClube = null;
let treinadorTodos = false;

export function togglePwVisibility(id, iconEl) {
  const input = document.getElementById(id);
  if (input.type === 'password') { input.type = 'text'; iconEl.textContent = '🙈'; }
  else { input.type = 'password'; iconEl.textContent = '👁️'; }
}

// Repõe um campo de código escondido (asteriscos) — usado sempre que se
// volta a mostrar o passo, para não ficar visível de um código anterior.
function resetPwField(id) {
  const input = document.getElementById(id);
  if (!input) return;
  input.type = 'password';
  const icon = input.parentElement && input.parentElement.querySelector('.ob-eye-toggle');
  if (icon) icon.textContent = '👁️';
}

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
    document.getElementById('ob-treinador-info').style.display = '';
    document.getElementById('ob-treinador-code-wrap').style.display = '';
    document.getElementById('ob-treinador-validate-btn').style.display = '';
    document.getElementById('ob-treinador-validate-btn').disabled = true;
    document.getElementById('ob-treinador-error').classList.remove('show');
    document.getElementById('ob-treinador-equipa').style.display = 'none';
    resetPwField('ob-treinador-code');
    treinadorClube = null;
    treinadorTodos = false;
    // O "Continuar" só aparece depois de o código ser validado (ver
    // validateTreinadorCode) — antes disso nem faz sentido mostrá-lo.
    btn.style.display = 'none';
    btn.disabled = true;
    return;
  }
  btn.style.display = '';

  if (f === 'arbitro' || f === 'pavilhao') {
    resetPwField(f === 'arbitro' ? 'ob-arb-code' : 'ob-pav-code');
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

export function onTreinadorCodeInput() {
  const val = document.getElementById('ob-treinador-code').value.trim();
  document.getElementById('ob-treinador-validate-btn').disabled = !val;
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
      treinadorTodos = !!data.todos;
      treinadorClube = data.clube;
      state.profile.clube = data.clube;
      const confirmMsg = treinadorTodos
        ? '✓ Código válido — <strong>Organização</strong>'
        : `✓ Código válido — <strong>${data.clube}</strong>`;
      document.getElementById('ob-treinador-clube-confirm').innerHTML = confirmMsg;
      document.getElementById('ob-treinador-equipa').style.display = 'block';
      if (treinadorTodos) populateEscalaosTodosTreinador();
      else populateEscalaosParaClube(data.clube);
      input.disabled = true;
      btn.style.display = 'none';
      document.getElementById('ob-treinador-info').style.display = 'none';
      document.getElementById('ob-treinador-code-wrap').style.display = 'none';
      document.getElementById('ob-btn2').style.display = '';
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

// Código especial da organização: dá acesso a todos os escalões/equipas,
// sem filtrar por clube — os dropdowns mostram tudo, tal como no Jogador.
function populateEscalaosTodosTreinador() {
  const sel = document.getElementById('ob-escalao-tr');
  sel.innerHTML = '<option value="">— Escolhe o escalão —</option>';
  Object.keys(state.TEAMS).sort().forEach(e => addOption(sel, e, e));
  const eq = document.getElementById('ob-equipa-tr');
  eq.innerHTML = '<option value="">— Escolhe a equipa —</option>';
  eq.disabled = true;
}

// Chamado a partir do botão "Mudar Equipa" no painel de perfil — só
// disponível quando o Treinador entrou com o código da Organização
// (state.profile.clube === 'Organização'). Reabre o onboarding já no
// estado "código validado", sem pedir o código outra vez, direto para os
// dropdowns de escalão/equipa (sem filtro de clube). Para mudar de
// perfil por completo, o botão "← Voltar" já existente no passo 2 leva
// ao passo 1 normal.
export function changeEquipaTreinador() {
  treinadorTodos = true;
  treinadorClube = state.profile.clube;
  document.getElementById('profile-panel').classList.remove('open');
  document.getElementById('onboarding').style.display = 'flex';
  document.querySelectorAll('.ob-step').forEach(s => s.classList.remove('active'));
  document.getElementById('ob-step2').classList.add('active');
  document.getElementById('ob-step2-equipa').style.display = 'none';
  document.getElementById('ob-step2-arbitro').style.display = 'none';
  document.getElementById('ob-step2-pavilhao').style.display = 'none';
  document.getElementById('ob-step2-treinador').style.display = 'block';
  document.getElementById('ob-treinador-info').style.display = 'none';
  document.getElementById('ob-treinador-code-wrap').style.display = 'none';
  document.getElementById('ob-treinador-validate-btn').style.display = 'none';
  document.getElementById('ob-treinador-error').classList.remove('show');
  document.getElementById('ob-treinador-clube-confirm').innerHTML = '✓ Código válido — <strong>Organização</strong>';
  document.getElementById('ob-treinador-equipa').style.display = 'block';
  populateEscalaosTodosTreinador();
  const btn = document.getElementById('ob-btn2');
  btn.style.display = '';
  btn.disabled = true;
}

export function onEscalaoChangeTreinador() {
  const e = document.getElementById('ob-escalao-tr').value;
  const eq = document.getElementById('ob-equipa-tr');
  eq.innerHTML = '<option value="">— Escolhe a equipa —</option>';
  eq.disabled = !e;
  document.getElementById('ob-btn2').disabled = true;
  if (!e) return;
  let teams = [...new Set(Object.values(state.TEAMS[e]).flat())];
  if (!treinadorTodos) teams = teams.filter(t => state.EQUIPA_CLUBE[t] === treinadorClube);
  teams.sort();
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
  if (needsKey) resetPwField('ob-key');
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
  // Sempre que se conclui o onboarding — qualquer perfil, qualquer
  // percurso, incluindo o atalho "Mudar Equipa" do Treinador com código
  // da Organização — a app deve abrir no Início, nunca "herdar" a última
  // página de antes de se ter passado pelo onboarding.
  sessionStorage.removeItem('summercup_last_page');
  document.getElementById('onboarding').style.display = 'none';
  // Dynamic import to avoid circular dependency
  import('./shell.js').then(({ initApp }) => initApp());
}

export function resetProfile() {
  localStorage.removeItem('summercup_profile_andre');
  // Impede que o novo perfil "herde" a última página do perfil anterior
  // (ex. Logística, que pode nem estar acessível no novo perfil) — a
  // sessão do separador mantém-se entre o reload, ao contrário do
  // localStorage do perfil que acabou de ser limpo.
  sessionStorage.removeItem('summercup_last_page');
  location.reload();
}

// ── WINDOW REGISTRATIONS ──
window.selectFuncao = selectFuncao;
window.goStep = goStep;
window.onPavCodeChange = onPavCodeChange;
window.onEscalaoChange = onEscalaoChange;
window.validateTreinadorCode = validateTreinadorCode;
window.onTreinadorCodeInput = onTreinadorCodeInput;
window.togglePwVisibility = togglePwVisibility;
window.onEscalaoChangeTreinador = onEscalaoChangeTreinador;
window.changeEquipaTreinador = changeEquipaTreinador;
window.handleStep3 = handleStep3;
window.resetProfile = resetProfile;
