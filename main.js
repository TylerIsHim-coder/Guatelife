/* ============================================================
   GuateLife — vanilla JS interactions & motion
   ============================================================ */
(function () {
  'use strict';

  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- Scroll-reveal (IntersectionObserver) ---------- */
  const revealEls = document.querySelectorAll('[data-reveal], [data-stagger]');

  if (reduceMotion) {
    revealEls.forEach((el) => el.classList.add('in-view'));
  } else {
    // Apply explicit per-element delays
    document.querySelectorAll('[data-reveal][data-delay]').forEach((el) => {
      el.style.setProperty('--reveal-delay', `${el.dataset.delay}ms`);
    });
    // Stagger children
    document.querySelectorAll('[data-stagger]').forEach((group) => {
      Array.from(group.children).forEach((child, i) => {
        child.style.transitionDelay = `${i * 90}ms`;
      });
    });

    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('in-view');
            io.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.15, rootMargin: '0px 0px -8% 0px' }
    );
    revealEls.forEach((el) => io.observe(el));
  }

  /* ---------- Count-up stats ---------- */
  const counters = document.querySelectorAll('.count');
  const formatNum = (n) => n.toLocaleString('en-US');

  const runCount = (el) => {
    const target = parseInt(el.dataset.target, 10) || 0;
    const suffix = el.dataset.suffix || '';
    if (reduceMotion) {
      el.textContent = formatNum(target) + suffix;
      return;
    }
    const duration = 1600;
    const start = performance.now();
    const tick = (now) => {
      const p = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - p, 3); // easeOutCubic
      el.textContent = formatNum(Math.round(target * eased)) + suffix;
      if (p < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  };

  if (counters.length) {
    const countIO = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            runCount(entry.target);
            countIO.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.5 }
    );
    counters.forEach((c) => countIO.observe(c));
  }

  /* ---------- Scroll-driven: progress bar, nav state, parallax ---------- */
  const progress = document.getElementById('progress');
  const nav = document.getElementById('nav');
  const heroMedia = document.getElementById('heroMedia');
  const hero = document.getElementById('top');
  let ticking = false;

  const onScroll = () => {
    const y = window.scrollY;
    const docH = document.documentElement.scrollHeight - window.innerHeight;

    // Progress bar
    if (progress) progress.style.width = `${docH > 0 ? (y / docH) * 100 : 0}%`;

    // Nav: solidify after a little scroll; switch to light theme past hero
    if (nav) {
      nav.classList.toggle('scrolled', y > 24);
      const heroH = hero ? hero.offsetHeight : window.innerHeight;
      nav.classList.toggle('on-light', y > heroH - 90);
    }

    // Subtle hero parallax
    if (heroMedia && !reduceMotion && y < window.innerHeight) {
      heroMedia.style.transform = `translate3d(0, ${y * 0.18}px, 0)`;
    }

    ticking = false;
  };

  window.addEventListener(
    'scroll',
    () => {
      if (!ticking) {
        requestAnimationFrame(onScroll);
        ticking = true;
      }
    },
    { passive: true }
  );
  onScroll();

  /* ---------- Mobile menu ---------- */
  const toggle = document.getElementById('navToggle');
  const menu = document.getElementById('mobileMenu');
  if (toggle && menu) {
    const setOpen = (open) => {
      menu.classList.toggle('open', open);
      toggle.setAttribute('aria-expanded', String(open));
    };
    toggle.addEventListener('click', () => setOpen(!menu.classList.contains('open')));
    menu.querySelectorAll('a').forEach((a) => a.addEventListener('click', () => setOpen(false)));
  }

  /* ---------- Hero video: enable only once available ---------- */
  // The build swaps assets/hero.mp4 in; this gracefully upgrades when present.
  const video = document.getElementById('heroVideo');
  const heroImg = document.getElementById('heroImg');
  if (video && !reduceMotion) {
    const src = video.getAttribute('data-src');
    if (src) {
      video.src = src;
      video.addEventListener(
        'canplay',
        () => {
          video.classList.remove('hidden');
          if (heroImg) heroImg.style.opacity = '0';
        },
        { once: true }
      );
    }
  }
})();
