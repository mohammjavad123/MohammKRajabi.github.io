/* ================================================
   Mohammad Rajabi — Personal Site JS
   ================================================ */

// -- Particles --
function initParticles(isDark) {
  if (typeof particlesJS === 'undefined') return;
  const color = isDark ? '#00aaff' : '#0077cc';
  particlesJS('particles-js', {
    particles: {
      number: { value: 90, density: { enable: true, value_area: 900 } },
      color: { value: color },
      shape: { type: 'circle' },
      opacity: {
        value: 0.55, random: true,
        anim: { enable: true, speed: 0.8, opacity_min: 0.1, sync: false },
      },
      size: { value: 2.5, random: true },
      line_linked: {
        enable: true,
        distance: 140,
        color: color,
        opacity: 0.2,
        width: 1,
      },
      move: {
        enable: true,
        speed: 1.4,
        direction: 'none',
        random: true,
        straight: false,
        out_mode: 'out',
        bounce: false,
        attract: { enable: true, rotateX: 800, rotateY: 1400 },
      },
    },
    interactivity: {
      detect_on: 'window',
      events: {
        onhover: { enable: true, mode: 'grab' },
        onclick: { enable: true, mode: 'push' },
        resize: true,
      },
      modes: {
        grab: {
          distance: 240,
          line_linked: { opacity: 0.7 },
        },
        push: { particles_nb: 5 },
        bubble: { distance: 200, size: 6, duration: 0.2, opacity: 1, speed: 3 },
        repulse: { distance: 200, duration: 0.4 },
      },
    },
    retina_detect: true,
  });
}

// -- Typed role --
const roles = ['AI Engineer', 'RAG Architect', 'LLM Engineer', 'Agent Builder'];
let roleIdx = 0, charIdx = 0, deleting = false;
const typedEl = document.getElementById('typed-role');

function typeRole() {
  if (!typedEl) return;
  const cur = roles[roleIdx];
  if (!deleting) {
    typedEl.textContent = cur.slice(0, charIdx + 1);
    charIdx++;
    if (charIdx === cur.length) {
      deleting = true;
      setTimeout(typeRole, 1800);
      return;
    }
  } else {
    typedEl.textContent = cur.slice(0, charIdx - 1);
    charIdx--;
    if (charIdx === 0) {
      deleting = false;
      roleIdx = (roleIdx + 1) % roles.length;
    }
  }
  setTimeout(typeRole, deleting ? 55 : 85);
}

// -- Theme toggle --
function applyTheme(isDark) {
  document.body.classList.toggle('dark-mode', isDark);
  document.body.classList.toggle('light-mode', !isDark);
  const icon = document.querySelector('#theme-toggle i');
  if (icon) {
    icon.className = isDark ? 'fas fa-moon' : 'fas fa-sun';
    icon.style.animation = 'rotateIcon 0.4s ease';
    icon.addEventListener('animationend', () => { icon.style.animation = ''; }, { once: true });
  }
  if (window.pJSDom && window.pJSDom.length) {
    window.pJSDom[0].pJS.fn.vendors.destroypJS();
    window.pJSDom = [];
  }
  initParticles(isDark);
  localStorage.setItem('theme', isDark ? 'dark' : 'light');
}

// -- Scroll reveal (exclude proj-card — handled separately) --
function setupReveal() {
  const targets = document.querySelectorAll(
    '.section-title, .glass-card:not(.proj-card), .skill-block, ' +
    '.tl-item, .contact-card, .hstat, .hero-greeting, .hero-inner h1, ' +
    '.hero-role, .hero-bio, .hero-cta, .hero-stats, .section-label, ' +
    '.github-card, .github-streak, .contrib-wrap'
  );
  targets.forEach((el, i) => {
    el.classList.add('reveal');
    el.style.transitionDelay = (i % 5) * 0.06 + 's';
  });

  // proj-cards get their own simpler reveal
  document.querySelectorAll('.proj-card').forEach((el, i) => {
    el.style.opacity = '0';
    el.style.transform = 'translateY(20px)';
    el.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
    el.style.transitionDelay = (i % 4) * 0.08 + 's';
  });

  const obs = new IntersectionObserver(
    (entries) => entries.forEach((e) => {
      if (e.isIntersecting) {
        if (e.target.classList.contains('proj-card')) {
          e.target.style.opacity = '1';
          e.target.style.transform = 'translateY(0)';
        } else {
          e.target.classList.add('visible');
        }
        obs.unobserve(e.target);
      }
    }),
    { threshold: 0.08, rootMargin: '0px 0px -20px 0px' }
  );

  targets.forEach((el) => obs.observe(el));
  document.querySelectorAll('.proj-card').forEach((el) => obs.observe(el));
}

// -- Active sidebar link --
function setupActiveNav() {
  const sections = document.querySelectorAll('section[id]');
  const links    = document.querySelectorAll('.snav-item');

  const obs = new IntersectionObserver(
    (entries) => entries.forEach((e) => {
      if (e.isIntersecting) {
        links.forEach((l) => l.classList.remove('active'));
        const active = document.querySelector(`.snav-item[href="#${e.target.id}"]`);
        if (active) active.classList.add('active');
      }
    }),
    { threshold: 0.4 }
  );
  sections.forEach((s) => obs.observe(s));
}

// -- Go to top --
function setupGoTop() {
  const btn = document.getElementById('go-top');
  if (!btn) return;
  window.addEventListener('scroll', () => {
    btn.classList.toggle('visible', window.scrollY > 400);
  }, { passive: true });
  btn.addEventListener('click', () => {
    btn.classList.add('fly');
    btn.addEventListener('animationend', () => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
      btn.classList.remove('fly');
    }, { once: true });
  });
}

// -- Magnetic tilt + shimmer on project cards --
function setupMagneticCards() {
  document.querySelectorAll('.proj-card').forEach((card) => {

    // inject shimmer div directly into the card (works with overflow:hidden)
    const shimmer = document.createElement('div');
    shimmer.style.cssText = `
      position: absolute;
      inset: 0;
      pointer-events: none;
      z-index: 10;
      opacity: 0;
      transition: opacity 0.15s ease;
      border-radius: inherit;
    `;
    card.style.position = 'relative';
    card.appendChild(shimmer);

    let raf = null;

    card.addEventListener('mousemove', (e) => {
      if (raf) cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        const rect  = card.getBoundingClientRect();
        const x     = e.clientX - rect.left;
        const y     = e.clientY - rect.top;
        const cx    = rect.width  / 2;
        const cy    = rect.height / 2;
        const normX = (x - cx) / cx;   // -1 to 1
        const normY = (y - cy) / cy;   // -1 to 1

        // tilt
        const tiltX = normY * -8;
        const tiltY = normX *  8;
        card.style.transition = 'box-shadow 0.1s ease, border-color 0.1s ease';
        card.style.transform  = `perspective(700px) rotateX(${tiltX}deg) rotateY(${tiltY}deg) scale(1.025)`;
        card.style.boxShadow  = `0 16px 48px rgba(0,170,255,0.4), 0 0 0 1px rgba(0,170,255,0.3)`;
        card.style.borderColor = 'rgba(0,170,255,0.5)';

        // shimmer — bright radial glow following cursor
        const pctX = ((x / rect.width)  * 100).toFixed(1);
        const pctY = ((y / rect.height) * 100).toFixed(1);
        shimmer.style.background = `radial-gradient(circle at ${pctX}% ${pctY}%, rgba(0,170,255,0.22) 0%, rgba(0,170,255,0.06) 40%, transparent 65%)`;
        shimmer.style.opacity = '1';
      });
    });

    card.addEventListener('mouseleave', () => {
      if (raf) cancelAnimationFrame(raf);
      card.style.transition = 'transform 0.4s ease, box-shadow 0.4s ease, border-color 0.3s ease';
      card.style.transform   = 'perspective(700px) rotateX(0deg) rotateY(0deg) scale(1)';
      card.style.boxShadow   = '';
      card.style.borderColor = '';
      shimmer.style.opacity  = '0';
      setTimeout(() => { card.style.transform = ''; card.style.transition = ''; }, 400);
    });
  });
}

// -- Inject keyframes --
document.head.insertAdjacentHTML('beforeend', `<style>
  @keyframes rotateIcon {
    from { transform: rotate(0deg) scale(1); }
    50%  { transform: rotate(180deg) scale(1.3); }
    to   { transform: rotate(360deg) scale(1); }
  }
</style>`);

// -- Init --
document.addEventListener('DOMContentLoaded', () => {
  const saved  = localStorage.getItem('theme');
  const isDark = saved ? saved === 'dark' : true;
  applyTheme(isDark);

  const themeBtn = document.getElementById('theme-toggle');
  if (themeBtn) {
    themeBtn.addEventListener('click', () => {
      applyTheme(!document.body.classList.contains('dark-mode'));
    });
  }

  setTimeout(typeRole, 700);
  setupReveal();
  setupActiveNav();
  setupGoTop();
  setupMagneticCards();

  // Forward all window mousemove to particles canvas so hover works through page content
  window.addEventListener('mousemove', (e) => {
    const canvas = document.querySelector('#particles-js canvas');
    if (!canvas) return;
    // particles.js reads mouse from its own internal pJS object via window events
    // Just dispatch a mousemove on the canvas to keep its internal coords updated
    canvas.dispatchEvent(new MouseEvent('mousemove', {
      clientX: e.clientX, clientY: e.clientY,
      bubbles: false, cancelable: false,
    }));
  }, { passive: true });
});
