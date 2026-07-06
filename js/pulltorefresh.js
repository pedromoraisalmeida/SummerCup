// Gesto de "puxar para baixo para atualizar", implementado à mão via touch
// events em vez de depender do gesto nativo do browser — porque a app usa um
// layout de coluna fixa (#app{overflow:hidden}) com scroll só dentro de
// #scroll (e o onboarding tem o seu próprio scroll interno), o que impede o
// gesto nativo do Chrome/Safari/etc. de disparar.
// Funciona da mesma forma em qualquer browser (Chrome, Samsung Internet,
// MIUI, Safari) e também na PWA instalada, porque é só JS/CSS, sem depender
// de nenhuma API específica de um browser.
//
// O indicador é partilhado (posição fixa no ecrã, por cima de tudo — inclui
// o onboarding) e liga-se a qualquer contentor com scroll próprio que lhe
// seja passado.
const THRESHOLD = 140;
const RADIUS = 13;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;
const MAX_ANGLE = 300; // deixa sempre uma abertura — nunca fecha o círculo por completo

export function initPullToRefresh() {
  const indicator = document.getElementById('ptr-indicator');
  const arc = document.getElementById('ptr-arc');
  const arrow = document.getElementById('ptr-arrowhead');
  if (!indicator || !arc || !arrow) return;

  arc.style.strokeDasharray = `${CIRCUMFERENCE}`;
  arc.style.strokeDashoffset = `${CIRCUMFERENCE}`;

  let startY = 0;
  let pulling = false;
  let refreshing = false;
  let rawPull = 0;

  const update = (v) => {
    rawPull = v;
    const progress = Math.min(v / THRESHOLD, 1);
    indicator.style.transform = `translateY(${progress * THRESHOLD - THRESHOLD}px)`;

    // Posição/rotação da seta na ponta do arco (ângulo medido a partir do
    // topo, no sentido horário, para acompanhar o desenho do arco). O arco
    // só percorre até MAX_ANGLE, nunca os 360º completos — fica sempre uma
    // abertura, mesmo quando "completo".
    const angleDeg = progress * MAX_ANGLE;
    const arcLength = (MAX_ANGLE / 360) * CIRCUMFERENCE;
    arc.style.strokeDashoffset = `${CIRCUMFERENCE - arcLength * progress}`;
    const angleRad = (angleDeg * Math.PI) / 180;
    const x = 16 + RADIUS * Math.sin(angleRad);
    const y = 16 - RADIUS * Math.cos(angleRad);
    arrow.setAttribute('transform', `translate(${x} ${y}) rotate(${angleDeg})`);

    indicator.classList.toggle('ready', progress >= 1);
  };

  function bindContainer(container) {
    if (!container) return;

    container.addEventListener('touchstart', (e) => {
      if (refreshing || container.scrollTop > 0) { pulling = false; return; }
      startY = e.touches[0].clientY;
      pulling = true;
    }, { passive: true });

    container.addEventListener('touchmove', (e) => {
      if (!pulling || refreshing) return;
      const delta = e.touches[0].clientY - startY;
      if (delta <= 0) return;
      e.preventDefault();
      update(delta * 1);
    }, { passive: false });

    container.addEventListener('touchend', () => {
      if (!pulling || refreshing) { pulling = false; return; }
      pulling = false;

      if (rawPull >= THRESHOLD) {
        refreshing = true;
        indicator.classList.add('refreshing');
        indicator.style.transition = 'transform .15s';
        indicator.style.transform = 'translateY(0px)';
        location.reload();
      } else {
        indicator.style.transition = 'transform .2s';
        arc.style.transition = 'stroke-dashoffset .2s, stroke .15s';
        update(0);
        setTimeout(() => {
          indicator.style.transition = '';
          arc.style.transition = '';
        }, 200);
      }
    });
  }

  bindContainer(document.getElementById('scroll'));
  bindContainer(document.getElementById('onboarding'));
}
