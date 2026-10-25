/* ============================================================
   MAD RUST - landing behaviour
   ============================================================ */
(() => {
  'use strict';

  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- year ---------- */
  const yearEl = $('#year');
  if (yearEl) yearEl.textContent = String(new Date().getFullYear());

  /* ---------- toast ---------- */
  let toastTimer;
  const toastEl = $('#toast');
  function toast(message) {
    if (!toastEl) return;
    toastEl.textContent = message;
    toastEl.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toastEl.classList.remove('show'), 2400);
  }

  /* ---------- mobile menu ---------- */
  const burger = $('#burger');
  const menu = $('#mobileMenu');
  const menuClose = $('#menuClose');
  let lastFocus = null;

  function setMenu(open) {
    if (!burger || !menu) return;
    burger.setAttribute('aria-expanded', String(open));
    burger.setAttribute('aria-label', open ? 'Закрыть меню' : 'Открыть меню');
    menu.classList.toggle('open', open);
    menu.setAttribute('aria-hidden', String(!open));
    menu.hidden = !open;
    document.body.classList.toggle('menu-open', open);

    if (open) {
      lastFocus = document.activeElement;
      const first = $('a', menu);
      if (first) setTimeout(() => first.focus(), 30);
    } else if (lastFocus instanceof HTMLElement) {
      lastFocus.focus();
    }
  }

  if (burger && menu) {
    burger.addEventListener('click', () => setMenu(burger.getAttribute('aria-expanded') !== 'true'));
    if (menuClose) menuClose.addEventListener('click', () => setMenu(false));
    $$('a', menu).forEach(link => link.addEventListener('click', () => setMenu(false)));
    window.addEventListener('keydown', event => {
      if (event.key === 'Escape' && menu.classList.contains('open')) setMenu(false);
      if (event.key === 'Tab' && menu.classList.contains('open')) {
        const focusable = $$('a, button', menu).filter(el => !el.hasAttribute('disabled'));
        if (!focusable.length) return;
        const first = focusable[0];
        const last = focusable[focusable.length - 1];
        if (event.shiftKey && document.activeElement === first) {
          event.preventDefault();
          last.focus();
        } else if (!event.shiftKey && document.activeElement === last) {
          event.preventDefault();
          first.focus();
        }
      }
    });
    window.addEventListener('resize', () => {
      if (window.innerWidth > 700) setMenu(false);
    });
  }

  /* ---------- reveal ---------- */
  const revealEls = $$('.reveal');
  if (reduced || !('IntersectionObserver' in window)) {
    revealEls.forEach(el => el.classList.add('in'));
  } else {
    const reveal = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('in');
        reveal.unobserve(entry.target);
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -6% 0px' });
    revealEls.forEach(el => reveal.observe(el));
  }

  /* ---------- wipe countdown ---------- */
  const WIPE_MSK = Date.UTC(2026, 10, 5, 15, 0, 0); // 5 Nov 2026 18:00 MSK (UTC+3)
  const CYCLE = 14 * 24 * 60 * 60 * 1000;
  const MONTHS = ['января', 'февраля', 'марта', 'апреля', 'мая', 'июня',
                  'июля', 'августа', 'сентября', 'октября', 'ноября', 'декабря'];
  const MONTHS_SHORT = ['янв', 'фев', 'мар', 'апр', 'мая', 'июн',
                        'июл', 'авг', 'сен', 'окт', 'ноя', 'дек'];

  function nextWipe(now) {
    let target = WIPE_MSK;
    while (target <= now) target += CYCLE;
    return target;
  }

  function mskParts(ts) {
    const d = new Date(ts + 3 * 60 * 60 * 1000);
    return {
      day: d.getUTCDate(),
      month: d.getUTCMonth(),
      hours: d.getUTCHours(),
      minutes: d.getUTCMinutes(),
    };
  }

  const cdDays = $$('[data-cd="days"]');
  const cdHours = $$('[data-cd="hours"]');
  const cdMinutes = $$('[data-cd="minutes"]');
  const wipeShortEls = $$('[data-bind="wipeShort"]');
  const wipeFullEls = $$('[data-bind="wipeFull"]');

  function updateCountdown() {
    const now = Date.now();
    const target = nextWipe(now);
    const left = Math.max(0, target - now);

    const days = Math.floor(left / 86400000);
    const hours = Math.floor(left / 3600000) % 24;
    const minutes = Math.floor(left / 60000) % 60;

    cdDays.forEach(el => { el.textContent = String(days); });
    cdHours.forEach(el => { el.textContent = String(hours); });
    cdMinutes.forEach(el => { el.textContent = String(minutes); });

    const parts = mskParts(target);
    wipeShortEls.forEach(el => {
      el.textContent = `${parts.day} ${MONTHS_SHORT[parts.month]}`;
    });
    wipeFullEls.forEach(el => {
      el.textContent = `${parts.day} ${MONTHS[parts.month]} · ${pad(parts.hours)}:${pad(parts.minutes)} МСК`;
    });
  }

  updateCountdown();
  setInterval(updateCountdown, 1000);

  /* ---------- hero monument on scroll ---------- */
  const monument = $('.monument');
  let heroTicking = false;

  function updateMonument() {
    if (!monument) return;
    const y = window.scrollY || document.documentElement.scrollTop;
    const limit = Math.max(1, window.innerHeight * 0.9);
    const progress = Math.min(1, Math.max(0, y / limit));
    monument.style.transform = `scale(${(1 - progress * 0.06).toFixed(4)})`;
    heroTicking = false;
  }

  if (monument && !reduced) {
    window.addEventListener('scroll', () => {
      if (heroTicking) return;
      heroTicking = true;
      requestAnimationFrame(updateMonument);
    }, { passive: true });
    updateMonument();
  }

  /* ---------- FAQ: one open at a time ---------- */
  const details = $$('.faq-list details');
  details.forEach(item => {
    item.addEventListener('toggle', () => {
      if (!item.open) return;
      details.forEach(other => {
        if (other !== item) other.open = false;
      });
    });
  });

  /* ---------- download feedback ---------- */
  $$('a[data-download][download]').forEach(link => {
    link.addEventListener('click', () => {
      toast('Загрузка лаунчера началась');
    });
  });

  /* ---------- anchor focus ---------- */
  $$('a[href^="#"]').forEach(link => {
    link.addEventListener('click', () => {
      const id = link.getAttribute('href').slice(1);
      if (!id) return;
      const target = document.getElementById(id);
      if (!target) return;
      target.setAttribute('tabindex', '-1');
      setTimeout(() => target.focus({ preventScroll: true }), 420);
    });
  });
})();
