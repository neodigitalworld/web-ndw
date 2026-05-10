/* ── NeoDigitalWorld — Main JS ── */
document.addEventListener('DOMContentLoaded', () => {

  // ── Nav scroll effect ──
  const nav = document.getElementById('nav');
  window.addEventListener('scroll', () => {
    nav.classList.toggle('scrolled', window.scrollY > 60);
  }, { passive: true });

  // ── Mobile nav ──
  const toggle = document.querySelector('.nav-toggle');
  const mobileNav = document.querySelector('.nav-mobile');
  const mobileClose = document.querySelector('.nav-mobile-close');

  if (toggle && mobileNav) {
    toggle.addEventListener('click', () => mobileNav.classList.add('open'));
    mobileClose?.addEventListener('click', () => mobileNav.classList.remove('open'));
    mobileNav.querySelectorAll('a').forEach(a =>
      a.addEventListener('click', () => mobileNav.classList.remove('open'))
    );
  }

  // ── GSAP Animations ──
  if (typeof gsap !== 'undefined' && typeof ScrollTrigger !== 'undefined') {
    gsap.registerPlugin(ScrollTrigger);

    // Hero entrance
    const heroTl = gsap.timeline({ defaults: { ease: 'power3.out' } });
    heroTl
      .from('.hero-badge',    { opacity: 0, y: 30, duration: 0.8 })
      .from('.hero-title',    { opacity: 0, y: 50, duration: 1 }, '-=0.4')
      .from('.hero-subtitle', { opacity: 0, y: 30, duration: 0.8 }, '-=0.6')
      .from('.hero-actions',  { opacity: 0, y: 20, duration: 0.7 }, '-=0.5')
      .from('.hero-scroll',   { opacity: 0, duration: 0.6 }, '-=0.3');

    // Generic reveal on scroll
    gsap.utils.toArray('.reveal').forEach(el => {
      gsap.to(el, {
        opacity: 1,
        y: 0,
        duration: 0.9,
        ease: 'power3.out',
        scrollTrigger: {
          trigger: el,
          start: 'top 88%',
          toggleActions: 'play none none none',
        },
      });
    });

    gsap.utils.toArray('.reveal-left').forEach(el => {
      gsap.to(el, {
        opacity: 1,
        x: 0,
        duration: 0.9,
        ease: 'power3.out',
        scrollTrigger: {
          trigger: el,
          start: 'top 88%',
          toggleActions: 'play none none none',
        },
      });
    });

    gsap.utils.toArray('.reveal-right').forEach(el => {
      gsap.to(el, {
        opacity: 1,
        x: 0,
        duration: 0.9,
        ease: 'power3.out',
        scrollTrigger: {
          trigger: el,
          start: 'top 88%',
          toggleActions: 'play none none none',
        },
      });
    });

    gsap.utils.toArray('.reveal-scale').forEach(el => {
      gsap.to(el, {
        opacity: 1,
        scale: 1,
        duration: 0.9,
        ease: 'power3.out',
        scrollTrigger: {
          trigger: el,
          start: 'top 88%',
          toggleActions: 'play none none none',
        },
      });
    });

    // Staggered cards
    gsap.utils.toArray('.stagger-group').forEach(group => {
      const cards = group.querySelectorAll('.stagger-item');
      gsap.from(cards, {
        opacity: 0,
        y: 50,
        duration: 0.7,
        stagger: 0.15,
        ease: 'power3.out',
        scrollTrigger: {
          trigger: group,
          start: 'top 82%',
          toggleActions: 'play none none none',
        },
      });
    });

    // Parallax on hero background
    gsap.to('.hero-bg', {
      yPercent: 30,
      ease: 'none',
      scrollTrigger: {
        trigger: '#hero',
        start: 'top top',
        end: 'bottom top',
        scrub: true,
      },
    });

    // Section title reveal
    gsap.utils.toArray('.section-title').forEach(el => {
      gsap.from(el, {
        opacity: 0,
        y: 30,
        duration: 0.8,
        ease: 'power3.out',
        scrollTrigger: {
          trigger: el,
          start: 'top 85%',
        },
      });
    });

  } else {
    // Fallback without GSAP: just show everything
    document.querySelectorAll('.reveal, .reveal-left, .reveal-right, .reveal-scale')
      .forEach(el => {
        el.style.opacity = '1';
        el.style.transform = 'none';
      });
  }

  // ── Counter animation ──
  const counters = document.querySelectorAll('[data-count]');
  const countObserver = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      const el = entry.target;
      const target = parseFloat(el.dataset.count);
      const suffix = el.dataset.suffix || '';
      const duration = 1800;
      const start = performance.now();
      const isDecimal = target % 1 !== 0;

      const update = now => {
        const elapsed = now - start;
        const progress = Math.min(elapsed / duration, 1);
        const eased = 1 - Math.pow(1 - progress, 3);
        const value = target * eased;
        el.textContent = (isDecimal ? value.toFixed(1) : Math.round(value)) + suffix;
        if (progress < 1) requestAnimationFrame(update);
      };

      requestAnimationFrame(update);
      countObserver.unobserve(el);
    });
  }, { threshold: 0.5 });

  counters.forEach(el => countObserver.observe(el));

  // ── Cookie banner ──
  const banner = document.getElementById('cookie-banner');
  if (banner && !localStorage.getItem('ndw_cookies')) {
    setTimeout(() => banner.classList.add('show'), 1200);
  }

  document.getElementById('cookie-accept')?.addEventListener('click', () => {
    localStorage.setItem('ndw_cookies', 'accepted');
    hideBanner();
  });

  document.getElementById('cookie-reject')?.addEventListener('click', () => {
    localStorage.setItem('ndw_cookies', 'rejected');
    hideBanner();
  });

  function hideBanner() {
    if (banner) {
      banner.style.transition = 'transform 0.4s ease-in';
      banner.style.transform = 'translateY(140%)';
    }
  }

  // ── Contact form — anti-spam + prevent double submit ──
  const form = document.getElementById('contact-form');

  // Registrar el momento en que la página carga (para detectar bots que envían al instante)
  const formTimeField = document.getElementById('_form_time');
  if (formTimeField) formTimeField.value = Date.now();

  form?.addEventListener('submit', e => {
    // Bloquear si el honeypot tiene contenido (lo llenó un bot)
    const honeypot = document.getElementById('website');
    if (honeypot && honeypot.value.trim() !== '') {
      e.preventDefault();
      return;
    }

    // Bloquear si el formulario se envía en menos de 3 segundos (bot)
    const loadTime = parseInt(formTimeField?.value || '0');
    if (loadTime && Date.now() - loadTime < 3000) {
      e.preventDefault();
      return;
    }

    // Prevenir doble envío
    const btn = form.querySelector('.btn-submit');
    if (btn) {
      btn.disabled = true;
      btn.textContent = 'Enviando…';
    }
  });

});
