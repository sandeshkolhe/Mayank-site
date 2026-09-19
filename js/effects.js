/**
 * Mayank CHS - Design 2 "Ivory & Champagne": motion layer.
 *
 * Loaded after js/main.js (and js/documents.js on the documents page). All
 * three listen for DOMContentLoaded and run in load order, so by the time this
 * runs every piece of content - including admin-edited text, committee cards
 * and document tiles - is already in the DOM.
 *
 * Everything degrades: reduced-motion users get the final state immediately,
 * touch devices skip the magnetic buttons, and without JavaScript nothing is
 * hidden (all pre-animation states are scoped to html.js).
 */
(function () {
  'use strict';

  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const finePointer = window.matchMedia('(pointer: fine)').matches;
  const wide = window.matchMedia('(min-width: 1024px)');

  document.addEventListener('DOMContentLoaded', () => {
    splitTitles();
    setupReveal();
    setupHeader();
    setupTimeline();
    setupParallax();
    setupSpotlight();
    if (finePointer && !reduce) setupMagnetic();
    finishLoading();
  });

  /* Intro: show the loader briefly, but never hold the page hostage to slow
     assets - it always clears within 2.5s. */
  function finishLoading() {
    const done = () => {
      document.body.classList.add('is-loaded');
      requestAnimationFrame(() => document.body.classList.add('is-ready'));
    };
    if (reduce || !document.querySelector('.loader')) {
      done();
      return;
    }
    const minimum = new Promise(resolve => setTimeout(resolve, 1200));
    const loaded = new Promise(resolve => {
      if (document.readyState === 'complete') resolve();
      else window.addEventListener('load', resolve, { once: true });
    });
    const cap = new Promise(resolve => setTimeout(resolve, 2500));
    Promise.race([Promise.all([minimum, loaded]), cap]).then(done);
  }

  function setupHeader() {
    const header = document.getElementById('siteHeader');
    const bar = document.getElementById('scrollProgress');
    let queued = false;

    const update = () => {
      queued = false;
      const y = window.scrollY;
      if (header) header.classList.toggle('is-solid', y > 40);
      if (bar) {
        const max = document.documentElement.scrollHeight - window.innerHeight;
        bar.style.transform = `scaleX(${max > 0 ? Math.min(1, y / max) : 0})`;
      }
    };

    window.addEventListener('scroll', () => {
      if (!queued) {
        queued = true;
        requestAnimationFrame(update);
      }
    }, { passive: true });
    update();
  }

  /* Wrap each word of .split headings so they can rise in one by one. Runs
     after main.js has applied admin text, so edits are split correctly. */
  function splitTitles() {
    if (reduce) return;
    document.querySelectorAll('.split').forEach(el => {
      const words = el.textContent.trim().split(/\s+/).filter(Boolean);
      el.textContent = '';
      words.forEach((word, i) => {
        const outer = document.createElement('span');
        outer.className = 'w';
        const inner = document.createElement('span');
        inner.textContent = word;
        inner.style.setProperty('--i', i);
        outer.appendChild(inner);
        el.appendChild(outer);
        if (i < words.length - 1) el.appendChild(document.createTextNode(' '));
      });
    });
  }

  function setupReveal() {
    // Rendered cards get staggered reveals without touching the shared renderers.
    ['.member-card', '.feature', '.document-card', '.office-row'].forEach(selector => {
      document.querySelectorAll(selector).forEach((el, i) => {
        if (el.hasAttribute('data-reveal')) return;
        el.setAttribute('data-reveal', '');
        el.style.setProperty('--d', `${(i % 6) * 70}ms`);
      });
    });

    const targets = document.querySelectorAll('[data-reveal], .split');
    if (reduce || !('IntersectionObserver' in window)) {
      targets.forEach(el => el.classList.add('is-in'));
      return;
    }

    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('is-in');
        observer.unobserve(entry.target);
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });

    targets.forEach(el => observer.observe(el));
  }

  /* The accent rail of the milestone timeline fills as the section scrolls by. */
  function setupTimeline() {
    const timeline = document.getElementById('timeline');
    const fill = document.getElementById('timelineFill');
    if (!timeline || !fill) return;

    if (reduce) {
      fill.style.setProperty('--fill', '1');
      return;
    }

    let queued = false;
    const update = () => {
      queued = false;
      const rect = timeline.getBoundingClientRect();
      const progress = (window.innerHeight * 0.7 - rect.top) / rect.height;
      fill.style.setProperty('--fill', Math.min(1, Math.max(0, progress)).toFixed(3));
    };
    const request = () => {
      if (!queued) {
        queued = true;
        requestAnimationFrame(update);
      }
    };
    window.addEventListener('scroll', request, { passive: true });
    window.addEventListener('resize', request);
    update();
  }

  /* Gentle drift of the hero render. Wide screens only - on a stacked mobile
     layout it would slide over the copy below it. */
  function setupParallax() {
    if (reduce) return;
    const elements = Array.from(document.querySelectorAll('[data-parallax]'));
    if (!elements.length) return;

    let queued = false;
    const update = () => {
      queued = false;
      const y = wide.matches ? window.scrollY : 0;
      elements.forEach(el => {
        const k = parseFloat(el.dataset.parallax) || 0;
        el.style.transform = y ? `translate3d(0, ${(y * k).toFixed(1)}px, 0)` : '';
      });
    };
    window.addEventListener('scroll', () => {
      if (!queued) {
        queued = true;
        requestAnimationFrame(update);
      }
    }, { passive: true });
    wide.addEventListener('change', update);
  }

  /* Soft accent light that follows the pointer across cards. */
  function setupSpotlight() {
    document.addEventListener('pointermove', event => {
      const card = event.target.closest && event.target.closest('.member-card, .document-card, .tl-card');
      if (!card) return;
      const rect = card.getBoundingClientRect();
      card.style.setProperty('--mx', `${event.clientX - rect.left}px`);
      card.style.setProperty('--my', `${event.clientY - rect.top}px`);
    }, { passive: true });
  }

  function setupMagnetic() {
    document.querySelectorAll('.magnetic').forEach(el => {
      el.addEventListener('pointermove', event => {
        const rect = el.getBoundingClientRect();
        const dx = event.clientX - (rect.left + rect.width / 2);
        const dy = event.clientY - (rect.top + rect.height / 2);
        el.style.transform = `translate(${(dx * 0.22).toFixed(1)}px, ${(dy * 0.32).toFixed(1)}px)`;
      });
      el.addEventListener('pointerleave', () => {
        el.style.transform = '';
      });
    });
  }
})();
