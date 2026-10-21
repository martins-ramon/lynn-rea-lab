(() => {
  'use strict';
  const app = document.getElementById('sim-app');
  if (!app) return;
  const home = app.parentElement;
  const dialog = document.getElementById('sim-dialog');
  const expanded = document.getElementById('sim-expanded');
  const tabs = [...app.querySelectorAll('[data-sim-step]')];
  const panels = [...app.querySelectorAll('.sim-panel')];
  const review = document.getElementById('sim-review');
  const status = document.getElementById('sim-review-status');
  let step = 1;
  let printStep = null;
  const show = value => {
    step = Math.max(1, Math.min(3, Number(value)));
    tabs.forEach((tab, i) => {
      tab.setAttribute('aria-selected', String(i + 1 === step));
      tab.tabIndex = i + 1 === step ? 0 : -1;
    });
    panels.forEach((panel, i) => { panel.hidden = i + 1 !== step; });
  };
  tabs.forEach(tab => {
    tab.addEventListener('click', () => show(tab.dataset.simStep));
    tab.addEventListener('keydown', event => {
      if (!['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) return;
      event.preventDefault(); event.stopPropagation();
      const next = event.key === 'Home' ? 1 : event.key === 'End' ? 3 : ((step - 1 + (event.key === 'ArrowRight' ? 1 : 2)) % 3) + 1;
      show(next); tabs[next - 1].focus();
    });
  });
  app.querySelectorAll('[data-sim-next]').forEach(button => button.addEventListener('click', () => {
    show(button.dataset.simNext); tabs[step - 1].focus();
  }));
  review.addEventListener('click', () => {
    status.textContent = 'Envio simulado. Revisão de produto/QA e teste no Engine pendentes.';
    review.textContent = 'Aguardando revisão'; review.disabled = true;
  });
  document.getElementById('sim-restart').addEventListener('click', () => {
    show(1); review.disabled = false;
    review.innerHTML = 'Simular envio à revisão <span>→</span>';
    status.textContent = 'Pacote candidato; homologação operacional pendente.';
  });
  document.getElementById('sim-expand').addEventListener('click', () => {
    expanded.append(app); app.classList.add('expanded'); dialog.showModal();
  });
  dialog.addEventListener('close', () => { home.append(app); app.classList.remove('expanded'); sizeScreen(); });
  const sizeScreen = () => { home.style.setProperty('--sim-scale', String(home.clientWidth / 778)); };
  new ResizeObserver(sizeScreen).observe(home);
  window.addEventListener('beforeprint', () => { if (dialog.open) dialog.close(); printStep = step; show(3); });
  window.addEventListener('afterprint', () => { if (printStep !== null) show(printStep); printStep = null; });
  show(2); sizeScreen();
})();
