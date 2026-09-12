/**
 * Mayank CHS Redevelopment Portal - Main Public Interface
 */

document.addEventListener('DOMContentLoaded', () => {
  initMainApp();
});

function initMainApp() {
  setupMobileNav();
  applyPageContent();
  populateSocietyDetails();
  renderPublicCommitteeMembers();
  renderSinglePointContact();
  setupBackToTop();
  setupScrollSpy();
  setupHeroMediaSizing();
}

/**
 * On wide screens the hero render is exactly as tall as the copy beside it
 * (see .hero-image-frame in styles.css). CSS cannot say "as tall as my sibling"
 * without cropping the image, so the copy's height is published as a custom
 * property. It is re-measured whenever the copy resizes - web fonts loading,
 * admin-edited text, viewport changes. The copy column has a fixed width at
 * those breakpoints, so its height never depends on the image: no resize loop.
 */
function setupHeroMediaSizing() {
  const hero = document.querySelector('.hero-section');
  const copy = hero && hero.querySelector('.hero-content');
  if (!copy || !('ResizeObserver' in window)) return;

  const publish = () => {
    const h = Math.round(copy.getBoundingClientRect().height);
    hero.style.setProperty('--hero-copy-h', `${h}px`);
  };

  new ResizeObserver(publish).observe(copy);
  publish();
}

/**
 * Generic content + visibility engine.
 * Any element with [data-content="a.b.c"] gets its text (or placeholder,
 * for inputs) set from that dot-path in Store.getPageContent().
 * Any element with [data-visible="a.b.c"] is shown/hidden based on that
 * boolean - this is what lets the Admin Panel switch whole sections on/off.
 */
function applyPageContent() {
  if (!window.MayankStore) return;
  const content = window.MayankStore.getPageContent();

  document.querySelectorAll('[data-content]').forEach(el => {
    const path = el.getAttribute('data-content');
    const val = window.MayankStore.getByPath(content, path);
    if (val === undefined || val === null) return;
    if (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA') {
      el.setAttribute('placeholder', val);
    } else {
      el.textContent = val;
    }
  });

  // [data-list="a.b.c"]: one item per line, rendered as <li>s. Built with
  // textContent, so text entered in the Admin Panel can never inject markup.
  document.querySelectorAll('[data-list]').forEach(el => {
    const path = el.getAttribute('data-list');
    const val = window.MayankStore.getByPath(content, path);
    if (val === undefined || val === null) return;
    const items = (Array.isArray(val) ? val : String(val).split('\n'))
      .map(item => String(item).trim())
      .filter(Boolean);
    el.replaceChildren(...items.map(text => {
      const li = document.createElement('li');
      li.textContent = text;
      return li;
    }));
  });

  document.querySelectorAll('[data-visible]').forEach(el => {
    const path = el.getAttribute('data-visible');
    const val = window.MayankStore.getByPath(content, path);
    el.hidden = (val === false);
  });
}

function setupMobileNav() {
  const toggleBtn = document.querySelector('.mobile-toggle');
  const navMenu = document.querySelector('.nav-menu');

  if (toggleBtn && navMenu) {
    const setOpen = (open) => {
      navMenu.classList.toggle('open', open);
      toggleBtn.setAttribute('aria-expanded', String(open));
    };

    toggleBtn.addEventListener('click', () => {
      setOpen(!navMenu.classList.contains('open'));
    });

    // Close when clicking nav link
    navMenu.querySelectorAll('.nav-link').forEach(link => {
      link.addEventListener('click', () => setOpen(false));
    });

    // Close on Escape, and return focus to the toggle.
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && navMenu.classList.contains('open')) {
        setOpen(false);
        toggleBtn.focus();
      }
    });
  }
}

function populateSocietyDetails() {
  if (!window.MayankStore) return;
  const society = window.MayankStore.getSocietyDetails();

  // Replace text in elements with data-society-bind
  document.querySelectorAll('[data-society-name]').forEach(el => el.textContent = society.name);
  document.querySelectorAll('[data-society-short]').forEach(el => el.textContent = society.shortName || 'Mayank CHS');
  document.querySelectorAll('[data-society-reg]').forEach(el => el.textContent = society.regNo);
  document.querySelectorAll('[data-society-regdate]').forEach(el => el.textContent = society.regDate);
  document.querySelectorAll('[data-society-address]').forEach(el => el.textContent = society.address);
  document.querySelectorAll('[data-society-classification]').forEach(el => el.textContent = society.classification);
  document.querySelectorAll('[data-society-plotref]').forEach(el => el.textContent = society.plotRef);
  document.querySelectorAll('[data-society-officenote]').forEach(el => el.textContent = society.officeNote);
  document.querySelectorAll('[data-society-phase]').forEach(el => el.textContent = society.currentPhase);
  document.querySelectorAll('[data-society-units]').forEach(el => el.textContent = society.totalUnits);
  document.querySelectorAll('[data-society-plot]').forEach(el => el.textContent = society.plotArea);
  document.querySelectorAll('[data-society-buildings]').forEach(el => el.textContent = society.buildings);
  document.querySelectorAll('[data-society-about-1]').forEach(el => el.textContent = society.aboutParagraph1);
  document.querySelectorAll('[data-society-about-2]').forEach(el => el.textContent = society.aboutParagraph2);
  document.querySelectorAll('[data-society-about-3]').forEach(el => el.textContent = society.aboutParagraph3);

  const heroDescEl = document.getElementById('heroSocietyDescription');
  if (heroDescEl && society.heroDescription) {
    heroDescEl.textContent = society.heroDescription;
  }

  const heroImgEl = document.querySelector('.hero-image');
  if (heroImgEl && society.heroImage) {
    heroImgEl.src = society.heroImage;
  }

  const herbalImgEl = document.querySelector('.building-card-media img');
  if (herbalImgEl && society.herbalImage) {
    herbalImgEl.src = society.herbalImage;
  }

  populateMapEmbed();
}

function populateMapEmbed() {
  const frame = document.getElementById('societyMapFrame');
  const directionsLink = document.getElementById('societyMapDirections');
  if (!frame && !directionsLink) return;
  if (!window.MayankStore) return;

  const embedUrl = window.MayankStore.getMapEmbedUrl();
  const directionsUrl = window.MayankStore.getMapDirectionsUrl();

  if (frame && embedUrl) frame.src = embedUrl;
  if (directionsLink && directionsUrl) directionsLink.href = directionsUrl;
}

/**
 * Render Managing Committee (MC) and Redevelopment Committee (RDC) on Home Page
 * Enforces rule: ONLY items with status === 'active' are rendered!
 */
function renderPublicCommitteeMembers() {
  const mcContainer = document.getElementById('mcMembersContainer');
  const rdcContainer = document.getElementById('rdcMembersContainer');
  if (!mcContainer && !rdcContainer) return;
  if (!window.MayankStore) return;

  const activeMembers = window.MayankStore.getPublicMembers();
  const mcMembers = activeMembers.filter(m => m.category === 'Managing Committee');
  const rdcMembers = activeMembers.filter(m => m.category === 'Redevelopment Committee');

  if (mcContainer) mcContainer.innerHTML = renderMemberCards(mcMembers, 'No active Managing Committee members are currently published.');
  if (rdcContainer) rdcContainer.innerHTML = renderMemberCards(rdcMembers, 'No active Redevelopment Committee members are currently published.');
}

function renderMemberCards(members, emptyMessage) {
  if (!members || members.length === 0) {
    return `
      <div style="grid-column: 1 / -1; text-align: center; padding: 2.5rem 1.5rem; background: #ffffff; border-radius: var(--radius-lg); border: 1px dashed var(--slate-300);">
        <p style="color: var(--slate-500); font-size: 0.95rem;">${escapeHtml(emptyMessage)}</p>
      </div>
    `;
  }

  return members.map(member => `
    <div class="member-card">
      <div class="member-card-body">
        <div class="member-avatar" aria-hidden="true">${escapeHtml(getInitials(member.name))}</div>
        <div class="member-card-text">
          <h3 class="member-name">${escapeHtml(member.name)}</h3>
          <div class="member-designation">${escapeHtml(member.designation)}</div>
        </div>
        ${member.unitRef ? `
          <div class="member-unit-badge" title="Flat / Unit ${escapeHtml(member.unitRef)}" aria-label="Flat or unit ${escapeHtml(member.unitRef)}">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
              <polyline points="9 22 9 12 15 12 15 22"></polyline>
            </svg>
            ${escapeHtml(member.unitRef)}
          </div>
        ` : ''}
      </div>
    </div>
  `).join('');
}

/**
 * Single Point Contact card. The name and role come from the committee record
 * (whoever is flagged Single Point Contact); phone/email/hours are optional
 * society fields and each is rendered only when it has been filled in.
 */
function renderSinglePointContact() {
  const card = document.getElementById('spcCard');
  if (!card || !window.MayankStore) return;

  const spc = window.MayankStore.getPublicMembers()
    .find(m => /single point contact/i.test(m.designation || ''));

  if (!spc) {
    card.hidden = true;
    return;
  }

  const society = window.MayankStore.getSocietyDetails();
  document.getElementById('spcInitials').textContent = getInitials(spc.name);
  document.getElementById('spcName').textContent = spc.name;
  document.getElementById('spcRole').textContent = spc.designation;

  const icons = {
    phone: '<path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.13.96.36 1.9.68 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.91.32 1.85.55 2.81.68A2 2 0 0 1 22 16.92z"></path>',
    email: '<path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path><polyline points="22,6 12,13 2,6"></polyline>',
    hours: '<circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline>'
  };
  const icon = (k) => `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">${icons[k]}</svg>`;

  const parts = [];
  if (society.contactPhone) {
    parts.push(`<a href="tel:${escapeHtml(society.contactPhone.replace(/[^+\d]/g, ''))}">${icon('phone')}${escapeHtml(society.contactPhone)}</a>`);
  }
  if (society.contactEmail) {
    parts.push(`<a href="mailto:${escapeHtml(society.contactEmail)}">${icon('email')}${escapeHtml(society.contactEmail)}</a>`);
  }
  if (society.contactHours) {
    parts.push(`<span>${icon('hours')}${escapeHtml(society.contactHours)}</span>`);
  }

  document.getElementById('spcLinks').innerHTML = parts.join('');
  card.hidden = false;
}

function setupBackToTop() {
  const btn = document.getElementById('backToTop');
  if (!btn) return;

  const toggle = () => btn.classList.toggle('is-visible', window.scrollY > 600);
  window.addEventListener('scroll', toggle, { passive: true });
  toggle();

  btn.addEventListener('click', () => {
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    window.scrollTo({ top: 0, behavior: reduce ? 'auto' : 'smooth' });
  });
}

/**
 * Highlight the nav item for whichever in-page section is currently in view.
 * Only runs on pages that actually have those sections.
 */
function setupScrollSpy() {
  const links = Array.from(document.querySelectorAll('.nav-menu .nav-link[href^="#"]'));
  if (!links.length || !('IntersectionObserver' in window)) return;

  const sections = links
    .map(link => ({ link, section: document.querySelector(link.getAttribute('href')) }))
    .filter(pair => pair.section);
  if (!sections.length) return;

  const homeLink = document.querySelector('.nav-menu .nav-link[href="index.html"]');

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      const pair = sections.find(p => p.section === entry.target);
      if (!pair) return;
      if (entry.isIntersecting) {
        sections.forEach(p => p.link.classList.remove('active'));
        if (homeLink) homeLink.classList.remove('active');
        pair.link.classList.add('active');
      }
    });

    const anyActive = sections.some(p => p.link.classList.contains('active'));
    if (!anyActive && homeLink) homeLink.classList.add('active');
  }, { rootMargin: '-45% 0px -50% 0px' });

  sections.forEach(p => observer.observe(p.section));
}

function getInitials(name) {
  if (!name) return '?';
  const parts = name.replace(/^(Mr\.|Mrs\.|Smt\.|Shri\.|Dr\.)\s*/i, '').trim().split(/\s+/);
  const letters = parts.map(p => p[0]).filter(Boolean);
  return (letters[0] || '?') + (letters.length > 1 ? letters[letters.length - 1] : '');
}

function escapeHtml(str) {
  if (!str) return '';
  return String(str).replace(/&/g, '&amp;')
                    .replace(/</g, '&lt;')
                    .replace(/>/g, '&gt;')
                    .replace(/"/g, '&quot;')
                    .replace(/'/g, '&#039;');
}

function showToast(msg) {
  let container = document.querySelector('.toast-container');
  if (!container) {
    container = document.createElement('div');
    container.className = 'toast-container';
    document.body.appendChild(container);
  }

  const toast = document.createElement('div');
  toast.className = 'toast-msg';
  toast.textContent = msg;
  container.appendChild(toast);

  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateY(10px)';
    toast.style.transition = 'all 0.3s ease';
    setTimeout(() => toast.remove(), 300);
  }, 3500);
}

window.showToast = showToast;
