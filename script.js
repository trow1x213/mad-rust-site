/* ============================================================
   MAD RUST — landing behaviour
   ============================================================ */
(() => {
  'use strict';

  const $  = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- current year ---------- */
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

  /* ---------- nav / scroll progress ---------- */
  const nav = $('#nav');
  const progress = $('#scrollProgress');

  function onScroll() {
    const y = window.scrollY || document.documentElement.scrollTop;
    if (nav) nav.classList.toggle('scrolled', y > 24);

    if (progress) {
      const max = document.documentElement.scrollHeight - window.innerHeight;
      const pct = max > 0 ? Math.min(100, (y / max) * 100) : 0;
      progress.style.width = pct + '%';
    }
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* ---------- mobile menu ---------- */
  const burger = $('#burger');
  const menu = $('#mobileMenu');

  function setMenu(open) {
    if (!burger || !menu) return;
    burger.setAttribute('aria-expanded', String(open));
    burger.setAttribute('aria-label', open ? 'Закрыть меню' : 'Открыть меню');
    menu.classList.toggle('open', open);
    document.body.classList.toggle('menu-open', open);
  }

  if (burger && menu) {
    burger.addEventListener('click', () => {
      setMenu(burger.getAttribute('aria-expanded') !== 'true');
    });
    $$('a', menu).forEach(link => link.addEventListener('click', () => setMenu(false)));
    window.addEventListener('keydown', e => {
      if (e.key === 'Escape') setMenu(false);
    });
    window.addEventListener('resize', () => {
      if (window.innerWidth > 900) setMenu(false);
    });
  }

  /* ---------- active nav link ---------- */
  const navLinks = $$('.nav-links a');
  const sections = ['about', 'features', 'server', 'gallery', 'faq']
    .map(id => document.getElementById(id))
    .filter(Boolean);

  if (navLinks.length && sections.length && 'IntersectionObserver' in window) {
    const setActive = id => {
      navLinks.forEach(link => {
        link.classList.toggle('active', link.getAttribute('href') === '#' + id);
      });
    };
    const spy = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) setActive(entry.target.id);
      });
    }, { rootMargin: '-38% 0px -56% 0px', threshold: 0 });
    sections.forEach(section => spy.observe(section));
  }

  /* ---------- reveal on scroll ---------- */
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

  /* ---------- animated counters ---------- */
  const nfInt = new Intl.NumberFormat('ru-RU');
  const nfDec = new Intl.NumberFormat('ru-RU', { minimumFractionDigits: 1, maximumFractionDigits: 1 });

  function animateCount(el) {
    const raw = parseFloat(el.getAttribute('data-count'));
    if (!Number.isFinite(raw)) return;
    const decimals = parseInt(el.getAttribute('data-decimals') || '0', 10);
    const duration = 1500;
    const start = performance.now();

    function frame(now) {
      const t = Math.min(1, (now - start) / duration);
      const eased = 1 - Math.pow(1 - t, 3);
      const value = raw * eased;
      el.textContent = decimals
        ? nfDec.format(value)
        : nfInt.format(Math.round(value));
      if (t < 1) requestAnimationFrame(frame);
      else el.textContent = decimals ? nfDec.format(raw) : nfInt.format(raw);
    }
    requestAnimationFrame(frame);
  }

  const counters = $$('[data-count]');
  if (reduced || !('IntersectionObserver' in window)) {
    counters.forEach(el => {
      const raw = parseFloat(el.getAttribute('data-count'));
      const decimals = parseInt(el.getAttribute('data-decimals') || '0', 10);
      el.textContent = Number.isFinite(raw)
        ? (decimals ? nfDec.format(raw) : nfInt.format(raw))
        : el.textContent;
    });
  } else {
    const counterObs = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        animateCount(entry.target);
        counterObs.unobserve(entry.target);
      });
    }, { threshold: 0.5 });
    counters.forEach(el => counterObs.observe(el));
  }

  /* ---------- hero particles ---------- */
  const particles = $('#particles');
  if (particles && !reduced) {
    const frag = document.createDocumentFragment();
    const count = window.innerWidth < 640 ? 14 : 26;
    for (let i = 0; i < count; i++) {
      const dot = document.createElement('span');
      const size = (1.4 + Math.random() * 2.1).toFixed(1);
      dot.style.left = (Math.random() * 100).toFixed(2) + '%';
      dot.style.width = size + 'px';
      dot.style.height = size + 'px';
      dot.style.animationDuration = (15 + Math.random() * 17).toFixed(1) + 's';
      dot.style.animationDelay = (-Math.random() * 30).toFixed(1) + 's';
      dot.style.opacity = (0.25 + Math.random() * 0.5).toFixed(2);
      frag.appendChild(dot);
    }
    particles.appendChild(frag);
  }

  /* ---------- live numbers ---------- */
  const players = { value: 184, min: 171, max: 197 };
  const ping = { value: 24, min: 21, max: 28 };

  function writeBinds() {
    $$('[data-bind="players"]').forEach(el => { el.textContent = String(players.value); });
    $$('[data-bind="slots"]').forEach(el => { el.textContent = '200'; });
    $$('[data-bind="ping"]').forEach(el => { el.textContent = String(ping.value); });
  }

  if (!reduced) {
    setInterval(() => {
      const dp = Math.random() < 0.5 ? -1 : 1;
      players.value = Math.max(players.min, Math.min(players.max, players.value + dp * (1 + Math.floor(Math.random() * 3))));
      writeBinds();
    }, 9000);

    setInterval(() => {
      ping.value = Math.max(ping.min, Math.min(ping.max, ping.value + (Math.random() < 0.5 ? -1 : 1)));
      writeBinds();
    }, 6000);
  }
  writeBinds();

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
    const d = new Date(ts + 3 * 60 * 60 * 1000); // shift to MSK, read as UTC
    return {
      day: d.getUTCDate(),
      month: d.getUTCMonth(),
      hours: d.getUTCHours(),
      minutes: d.getUTCMinutes(),
    };
  }

  const cd = {
    days: $('[data-cd="days"]'),
    hours: $('[data-cd="hours"]'),
    minutes: $('[data-cd="minutes"]'),
    seconds: $('[data-cd="seconds"]'),
  };
  const wipeBar = $('#wipeProgress');
  const wipeDateShorts = $$('[data-bind="wipeShort"]');
  const wipeDateFulls = $$('[data-bind="wipeFull"]');
  let wipeTarget = 0;

  function pad(n) { return String(n).padStart(2, '0'); }

  function updateCountdown() {
    const now = Date.now();
    wipeTarget = nextWipe(now);
    const left = Math.max(0, wipeTarget - now);

    const days = Math.floor(left / 86400000);
    const hours = Math.floor(left / 3600000) % 24;
    const minutes = Math.floor(left / 60000) % 60;
    const seconds = Math.floor(left / 1000) % 60;

    if (cd.days) cd.days.textContent = pad(days);
    if (cd.hours) cd.hours.textContent = pad(hours);
    if (cd.minutes) cd.minutes.textContent = pad(minutes);
    if (cd.seconds) cd.seconds.textContent = pad(seconds);

    const parts = mskParts(wipeTarget);
    wipeDateShorts.forEach(el => {
      el.textContent = `${parts.day} ${MONTHS_SHORT[parts.month]}`;
    });
    wipeDateFulls.forEach(el => {
      el.textContent = `${parts.day} ${MONTHS[parts.month]} · ${pad(parts.hours)}:${pad(parts.minutes)} МСК`;
    });

    if (wipeBar) {
      const elapsed = CYCLE - left;
      const pct = Math.max(0, Math.min(100, (elapsed / CYCLE) * 100));
      wipeBar.style.width = pct.toFixed(2) + '%';
    }
  }
  updateCountdown();
  setInterval(updateCountdown, 1000);

  /* ---------- copy server address ---------- */
  const copyBtn = $('#copyIp');
  const serverIp = $('#serverIp');

  function fallbackCopy(text) {
    const area = document.createElement('textarea');
    area.value = text;
    area.setAttribute('readonly', '');
    area.style.position = 'fixed';
    area.style.opacity = '0';
    document.body.appendChild(area);
    area.select();
    let ok = false;
    try { ok = document.execCommand('copy'); } catch (_) { ok = false; }
    document.body.removeChild(area);
    return ok;
  }

  if (copyBtn && serverIp) {
    copyBtn.addEventListener('click', async () => {
      const text = serverIp.textContent.trim();
      let ok = false;
      try {
        await navigator.clipboard.writeText(text);
        ok = true;
      } catch (_) {
        ok = fallbackCopy(text);
      }

      copyBtn.classList.toggle('copied', ok);
      toast(ok ? 'Адрес сервера скопирован' : 'Не удалось скопировать — выделите адрес вручную');

      const svg = copyBtn.querySelector('svg');
      const original = svg ? svg.innerHTML : '';
      if (ok && svg) {
        svg.innerHTML = '<path d="M20 6 9 17l-5-5" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>';
      }
      setTimeout(() => {
        copyBtn.classList.remove('copied');
        if (svg) svg.innerHTML = original;
      }, 1800);
    });
  }

  /* ---------- faq accordion ---------- */
  const faqItems = $$('.faq-item');
  faqItems.forEach(item => {
    const button = $('.faq-q', item);
    if (!button) return;
    button.addEventListener('click', () => {
      const willOpen = !item.classList.contains('open');
      faqItems.forEach(other => {
        other.classList.remove('open');
        const otherBtn = $('.faq-q', other);
        if (otherBtn) otherBtn.setAttribute('aria-expanded', 'false');
      });
      if (willOpen) {
        item.classList.add('open');
        button.setAttribute('aria-expanded', 'true');
      }
    });
  });

  /* ---------- download link ---------- */
  const downloadBtn = $('a[data-download][href$=".exe"]');
  if (downloadBtn) {
    downloadBtn.addEventListener('click', () => {
      toast('Загрузка лаунчера началась');
    });
  }

  /* ---------- disabled socials (Telegram / VK) ---------- */
  const soonNote = $('#soonNote');
  const setSoonNote = on => {
    if (soonNote) soonNote.classList.toggle('on', on);
  };
  $$('a.soon').forEach(link => {
    link.addEventListener('mouseenter', () => setSoonNote(true));
    link.addEventListener('mouseleave', () => setSoonNote(false));
    link.addEventListener('focus', () => setSoonNote(true));
    link.addEventListener('blur', () => setSoonNote(false));
    link.addEventListener('click', event => {
      event.preventDefault();
      setSoonNote(true);
    });
  });

  /* ---------- smooth anchor focus (a11y) ---------- */
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
