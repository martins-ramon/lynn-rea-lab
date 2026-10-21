(() => {
  'use strict';

  const boot = () => {
    const deck = document.getElementById('deck');
    if (!deck) return;

    const slides = Array.from(deck.querySelectorAll('section.slide'));
    if (!slides.length) return;

    const byId = (id) => document.getElementById(id);
    const previous = byId('prev');
    const next = byId('next');
    const counter = byId('counter');
    const progress = byId('progress');
    const dots = byId('dots');
    const slideIndex = byId('slide-index');
    const indexDialog = byId('index-dialog');
    const notesDialog = byId('notes-dialog');
    const notesTitle = byId('notes-title');
    const notesBody = byId('notes-body');
    const fullscreenButton = byId('fullscreen-button');
    const status = byId('status');
    const viewport = byId('viewport');
    const frame = byId('deck-frame');
    const dotButtons = [];
    const indexButtons = [];
    let current = -1;
    let resizeTimer;
    let announcementTimer;
    let touchStart = null;
    let printing = false;
    let printScroll = null;

    const clamp = (value) => Math.min(slides.length - 1, Math.max(0, value));
    const titleOf = (slide, position) => slide.dataset.title || `Slide ${position + 1}`;
    const readHash = () => {
      const match = window.location.hash.match(/^#slide-(-?\d+)$/i);
      return match ? clamp(Number(match[1]) - 1) : 0;
    };

    const announce = (message) => {
      if (!status) return;
      window.clearTimeout(announcementTimer);
      status.textContent = '';
      announcementTimer = window.setTimeout(() => {
        status.textContent = message;
      }, 30);
    };

    const fillNotes = () => {
      if (notesTitle) notesTitle.textContent = `${current + 1}. ${titleOf(slides[current], current)}`;
      if (!notesBody) return;
      notesBody.replaceChildren();
      const template = slides[current].querySelector('template.notes');
      if (template) {
        notesBody.append(template.content.cloneNode(true));
      } else {
        const message = document.createElement('p');
        message.textContent = 'Este slide não possui notas adicionais.';
        notesBody.append(message);
      }
    };

    const updateHash = (position, replace = false) => {
      const hash = `#slide-${position + 1}`;
      if (window.location.hash === hash) return;
      const method = replace ? 'replaceState' : 'pushState';
      try {
        window.history[method](window.history.state, '', hash);
      } catch (_) {
        window.location.hash = hash;
      }
    };

    const showSlide = (position, { writeHash = true, replaceHash = false } = {}) => {
      const target = clamp(position);
      const changed = current !== target;
      current = target;

      slides.forEach((slide, index) => {
        const active = index === current;
        slide.hidden = !active;
        slide.inert = !active;
        slide.classList.toggle('active', active);
        slide.setAttribute('aria-hidden', String(!active));
      });
      if (previous) previous.disabled = current === 0;
      if (next) next.disabled = current === slides.length - 1;
      if (counter) {
        counter.textContent = `${String(current + 1).padStart(2, '0')} / ${String(slides.length).padStart(2, '0')}`;
        counter.setAttribute('aria-label', `Slide ${current + 1} de ${slides.length}`);
      }
      if (progress) {
        progress.style.width = `${((current + 1) / slides.length) * 100}%`;
        const progressBar = progress.closest('[role="progressbar"]');
        if (progressBar) {
          progressBar.setAttribute('aria-valuemin', '1');
          progressBar.setAttribute('aria-valuemax', String(slides.length));
          progressBar.setAttribute('aria-valuenow', String(current + 1));
          progressBar.setAttribute('aria-valuetext', `Slide ${current + 1} de ${slides.length}`);
        }
      }
      [...dotButtons, ...indexButtons].forEach((button) => {
        const active = Number(button.dataset.slide) === current;
        button.classList.toggle('active', active);
        if (active) button.setAttribute('aria-current', 'step');
        else button.removeAttribute('aria-current');
      });
      if (notesDialog?.open) fillNotes();
      if (writeHash) updateHash(current, replaceHash);
      if (changed) {
        if (document.body.classList.contains('compact')) {
          window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
          if (viewport) viewport.scrollTop = 0;
        }
        announce(`Slide ${current + 1} de ${slides.length}: ${titleOf(slides[current], current)}`);
      }
    };

    const closeDialog = (dialog) => {
      if (dialog?.open) dialog.close();
    };

    const openDialog = (dialog) => {
      if (!dialog || dialog.open) return;
      if (dialog === notesDialog) fillNotes();
      document.querySelectorAll('dialog[open]').forEach((other) => {
        if (other !== dialog) closeDialog(other);
      });
      dialog.showModal();
    };

    slides.forEach((slide, position) => {
      if (dots) {
        const button = document.createElement('button');
        button.type = 'button';
        button.className = 'dot';
        button.dataset.slide = String(position);
        button.setAttribute('aria-label', `Slide ${position + 1}: ${titleOf(slide, position)}`);
        button.setAttribute('aria-controls', slide.id);
        button.title = `${position + 1}. ${titleOf(slide, position)}`;
        button.addEventListener('click', () => showSlide(position));
        dots.append(button);
        dotButtons.push(button);
      }
      if (slideIndex) {
        const button = document.createElement('button');
        const number = document.createElement('span');
        const label = document.createElement('span');
        button.type = 'button';
        button.className = 'index-item';
        button.dataset.slide = String(position);
        button.setAttribute('aria-controls', slide.id);
        number.className = 'index-number';
        number.textContent = String(position + 1).padStart(2, '0');
        label.className = 'index-label';
        label.textContent = titleOf(slide, position);
        button.append(number, label);
        button.addEventListener('click', () => {
          showSlide(position);
          closeDialog(indexDialog);
        });
        slideIndex.append(button);
        indexButtons.push(button);
      }
    });

    const scaleDeck = () => {
      if (printing || !viewport || !frame) return;
      const compact = window.innerWidth < 900 || window.innerHeight < 540;
      document.body.classList.toggle('compact', compact);
      const managedProperties = ['position', 'width', 'height', 'left', 'top', 'transform', 'transform-origin'];
      if (compact) {
        managedProperties.forEach((property) => frame.style.removeProperty(property));
        return;
      }
      const bounds = viewport.getBoundingClientRect();
      if (bounds.width <= 0 || bounds.height <= 0) return;
      const scale = Math.min(bounds.width / 1600, bounds.height / 900);
      frame.style.position = 'absolute';
      frame.style.width = '1600px';
      frame.style.height = '900px';
      frame.style.left = `${Math.max(0, (bounds.width - 1600 * scale) / 2)}px`;
      frame.style.top = `${Math.max(0, (bounds.height - 900 * scale) / 2)}px`;
      frame.style.transformOrigin = 'top left';
      frame.style.transform = `scale(${scale})`;
    };

    const updateFullscreen = () => {
      if (!fullscreenButton) return;
      const active = Boolean(document.fullscreenElement);
      fullscreenButton.setAttribute('aria-pressed', String(active));
      fullscreenButton.setAttribute('aria-label', active ? 'Sair da tela cheia' : 'Entrar em tela cheia');
      fullscreenButton.title = active ? 'Sair da tela cheia (F)' : 'Tela cheia (F)';
    };

    const toggleFullscreen = async () => {
      try {
        if (document.fullscreenElement) await document.exitFullscreen();
        else if (document.documentElement.requestFullscreen) await document.documentElement.requestFullscreen();
        else {
          announce('A tela cheia não está disponível neste navegador.');
          return;
        }
        announce(document.fullscreenElement ? 'Modo de tela cheia ativado.' : 'Modo de tela cheia encerrado.');
      } catch (_) {
        announce('Não foi possível alternar a tela cheia neste navegador.');
      }
    };

    previous?.addEventListener('click', () => showSlide(current - 1));
    next?.addEventListener('click', () => showSlide(current + 1));
    byId('index-button')?.addEventListener('click', () => openDialog(indexDialog));
    byId('notes-button')?.addEventListener('click', () => openDialog(notesDialog));
    byId('print-button')?.addEventListener('click', () => window.print());
    fullscreenButton?.addEventListener('click', toggleFullscreen);
    document.querySelectorAll('.close-dialog[data-dialog]').forEach((button) => {
      button.addEventListener('click', () => closeDialog(byId(button.dataset.dialog)));
    });

    document.addEventListener('keydown', (event) => {
      if (event.defaultPrevented || event.altKey || event.ctrlKey || event.metaKey) return;
      if (document.querySelector('dialog[open]')) return;
      if (event.target instanceof Element) {
        if (event.target.closest('a, input, textarea, select, [contenteditable]:not([contenteditable="false"])')) return;
        const focusedButton = event.target.closest('button');
        if (focusedButton) {
          const navigationKey = ['ArrowLeft', 'ArrowRight', 'PageUp', 'PageDown', 'Home', 'End'].includes(event.key);
          // Toolbar buttons retain native Space/Enter activation while arrow
          // navigation remains available immediately after a control click.
          if (!navigationKey || !focusedButton.closest('.toolbar')) return;
        }
      }

      let handled = true;
      switch (event.key) {
        case 'ArrowRight':
        case 'PageDown':
        case ' ':
        case 'Spacebar':
          showSlide(current + 1);
          break;
        case 'ArrowLeft':
        case 'PageUp':
          showSlide(current - 1);
          break;
        case 'Home':
          showSlide(0);
          break;
        case 'End':
          showSlide(slides.length - 1);
          break;
        case 'n':
        case 'N':
          openDialog(notesDialog);
          break;
        case 'i':
        case 'I':
          openDialog(indexDialog);
          break;
        case 'f':
        case 'F':
          void toggleFullscreen();
          break;
        default:
          handled = false;
      }
      if (handled) event.preventDefault();
    });

    deck.addEventListener('touchstart', (event) => {
      if (event.touches.length !== 1 || document.querySelector('dialog[open]')) {
        touchStart = null;
        return;
      }
      if (event.target instanceof Element && event.target.closest('button, a, input, textarea, select, [data-no-swipe]')) {
        touchStart = null;
        return;
      }
      const touch = event.touches[0];
      touchStart = { x: touch.clientX, y: touch.clientY, time: Date.now(), vertical: false };
    }, { passive: true });

    deck.addEventListener('touchmove', (event) => {
      if (!touchStart || event.touches.length !== 1) {
        touchStart = null;
        return;
      }
      const touch = event.touches[0];
      const horizontal = Math.abs(touch.clientX - touchStart.x);
      const vertical = Math.abs(touch.clientY - touchStart.y);
      if (vertical > 18 && vertical > horizontal) touchStart.vertical = true;
    }, { passive: true });

    deck.addEventListener('touchend', (event) => {
      if (!touchStart) return;
      const start = touchStart;
      touchStart = null;
      if (start.vertical || event.changedTouches.length !== 1) return;
      const touch = event.changedTouches[0];
      const horizontal = touch.clientX - start.x;
      const vertical = touch.clientY - start.y;
      if (Date.now() - start.time > 800 || Math.abs(horizontal) < 70 || Math.abs(horizontal) < Math.abs(vertical) * 2) return;
      showSlide(current + (horizontal < 0 ? 1 : -1));
    }, { passive: true });
    deck.addEventListener('touchcancel', () => { touchStart = null; }, { passive: true });

    window.addEventListener('beforeprint', () => {
      if (printing) return;
      printScroll = { x: window.scrollX, y: window.scrollY, viewport: viewport?.scrollTop || 0 };
      printing = true;
      window.clearTimeout(resizeTimer);
      document.body.classList.remove('compact');
    });
    window.addEventListener('afterprint', () => {
      printing = false;
      scaleDeck();
      if (printScroll) {
        window.scrollTo({ left: printScroll.x, top: printScroll.y, behavior: 'instant' });
        if (viewport) viewport.scrollTop = printScroll.viewport;
        printScroll = null;
      }
    });

    window.addEventListener('hashchange', () => showSlide(readHash(), { replaceHash: true }));
    window.addEventListener('resize', () => {
      window.clearTimeout(resizeTimer);
      resizeTimer = window.setTimeout(scaleDeck, 70);
    }, { passive: true });
    document.addEventListener('fullscreenchange', () => {
      updateFullscreen();
      window.requestAnimationFrame(scaleDeck);
    });

    // The CSS keeps every slide readable until JavaScript is ready.
    document.documentElement.classList.add('js');
    scaleDeck();
    showSlide(readHash(), { replaceHash: true });
    updateFullscreen();
    window.requestAnimationFrame(scaleDeck);
    if (document.fonts?.ready) document.fonts.ready.then(scaleDeck);
  };

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot, { once: true });
  else boot();
})();
