/* ============================================================
   PORTFOLIO — main.js
   Hector Luis A. Tinagsa
   ============================================================ */

/* ============================================================
   EMAILJS CONFIGURATION
   ---------------------------------------------------------------
   To receive contact form messages in Gmail (hectortins821@gmail.com):
   1. Go to https://www.emailjs.com/ — sign up FREE
   2. Click "Add Service" → choose Gmail → connect hectortins821@gmail.com
      → Copy the "Service ID" (e.g. "service_xxxxxxx")
   3. Click "Email Templates" → Create Template → set:
        To:      hectortins821@gmail.com
        Subject: New Portfolio Message from {{from_name}}
        Body:    Name: {{from_name}}
                 Email: {{reply_to}}
                 Message: {{message}}
      → Save → Copy the "Template ID" (e.g. "template_xxxxxxx")
   4. Go to "Account" → Copy your "Public Key"
   5. Paste all three values below:
   ============================================================ */
const EMAILJS_PUBLIC_KEY  = 'YOUR_PUBLIC_KEY';      // ← paste here
const EMAILJS_SERVICE_ID  = 'YOUR_SERVICE_ID';      // ← paste here
const EMAILJS_TEMPLATE_ID = 'YOUR_TEMPLATE_ID';     // ← paste here

const EMAILJS_CONFIGURED = (
  EMAILJS_PUBLIC_KEY  !== 'YOUR_PUBLIC_KEY' &&
  EMAILJS_SERVICE_ID  !== 'YOUR_SERVICE_ID' &&
  EMAILJS_TEMPLATE_ID !== 'YOUR_TEMPLATE_ID'
);

// Init EmailJS only if configured
if (EMAILJS_CONFIGURED && typeof emailjs !== 'undefined') {
  emailjs.init(EMAILJS_PUBLIC_KEY);
}


/* === CUSTOM CURSOR === */
const cursor      = document.getElementById('cursor');
const cursorTrail = document.getElementById('cursorTrail');
let mouseX = 0, mouseY = 0, trailX = 0, trailY = 0;

document.addEventListener('mousemove', e => {
  mouseX = e.clientX;
  mouseY = e.clientY;
  if (cursor) { cursor.style.left = mouseX + 'px'; cursor.style.top = mouseY + 'px'; }
});

(function animateTrail() {
  trailX += (mouseX - trailX) * 0.12;
  trailY += (mouseY - trailY) * 0.12;
  if (cursorTrail) {
    cursorTrail.style.left = trailX + 'px';
    cursorTrail.style.top  = trailY + 'px';
  }
  requestAnimationFrame(animateTrail);
})();


/* === NAVBAR SCROLL EFFECT === */
const navbar = document.getElementById('navbar');
window.addEventListener('scroll', () => {
  navbar.classList.toggle('scrolled', window.scrollY > 40);
}, { passive: true });


/* === HAMBURGER / MOBILE MENU === */
const hamburgerBtn = document.getElementById('hamburgerBtn');
const mobileMenu   = document.getElementById('mobileMenu');
const mobileLinks  = document.querySelectorAll('.mobile-link');

function toggleMenu(open) {
  hamburgerBtn.classList.toggle('active', open);
  mobileMenu.classList.toggle('open', open);
  hamburgerBtn.setAttribute('aria-expanded', String(open));
  document.body.style.overflow = open ? 'hidden' : '';
}

if (hamburgerBtn) {
  hamburgerBtn.addEventListener('click', () => {
    toggleMenu(!mobileMenu.classList.contains('open'));
  });
}

mobileLinks.forEach(link => {
  link.addEventListener('click', () => toggleMenu(false));
});

if (mobileMenu) {
  mobileMenu.addEventListener('click', e => {
    if (e.target === mobileMenu) toggleMenu(false);
  });
}


/* === TYPED TEXT EFFECT === */
const typedEl = document.getElementById('typedText');
const phrases = [
  'Full Stack Developer',
  'React & Laravel Expert',
  'CodeIgniter / PHP Dev',
  'API Architect',
  'CRM & SaaS Builder',
  'System Architect',
];
let phraseIdx = 0, charIdx = 0, isDeleting = false;

function typeLoop() {
  if (!typedEl) return;
  const current = phrases[phraseIdx];

  typedEl.textContent = isDeleting
    ? current.slice(0, charIdx--)
    : current.slice(0, charIdx++);

  let delay = isDeleting ? 45 : 90;

  if (!isDeleting && charIdx > current.length) {
    delay = 1800;
    isDeleting = true;
  } else if (isDeleting && charIdx < 0) {
    isDeleting = false;
    charIdx = 0;
    phraseIdx = (phraseIdx + 1) % phrases.length;
    delay = 300;
  }
  setTimeout(typeLoop, delay);
}
typeLoop();


/* === INTERSECTION OBSERVER — SCROLL REVEAL === */
const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      const el  = entry.target;
      const idx = Array.from(el.parentElement.children).indexOf(el);
      if (el.classList.contains('timeline-item') || el.classList.contains('project-card')) {
        el.style.transitionDelay = (idx * 0.08) + 's';
      }
      el.classList.add('visible');
    }
  });
}, { threshold: 0.12 });

document.querySelectorAll('.timeline-item, .project-card, .reveal')
  .forEach(el => revealObserver.observe(el));


/* === ACTIVE NAV LINK ON SCROLL === */
const sections = document.querySelectorAll('section[id]');
const navLinks  = document.querySelectorAll('.nav-link');

const sectionObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      navLinks.forEach(l => l.classList.remove('active'));
      const active = document.querySelector(`.nav-link[href="#${entry.target.id}"]`);
      if (active) active.classList.add('active');
    }
  });
}, { rootMargin: '-40% 0px -55% 0px' });

sections.forEach(s => sectionObserver.observe(s));

// Active nav style
const activeStyle = document.createElement('style');
activeStyle.textContent = `.nav-link.active { color: var(--clr-accent) !important; }`;
document.head.appendChild(activeStyle);


/* === CONTACT FORM — EmailJS / Fallback === */
const contactForm = document.getElementById('contactForm');
const formNote    = document.getElementById('formNote');

if (contactForm) {
  contactForm.addEventListener('submit', async e => {
    e.preventDefault();

    const btn   = document.getElementById('contactSubmitBtn');
    const name  = document.getElementById('contactName')?.value.trim();
    const email = document.getElementById('contactEmailInput')?.value.trim();
    const msg   = document.getElementById('contactMessage')?.value.trim();

    // Validate
    if (!name || !email || !msg) {
      showNote('Please fill in all fields.', true);
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      showNote('Please enter a valid email address.', true);
      return;
    }

    // Sending state
    btn.disabled = true;
    btn.querySelector('span').textContent = 'Sending…';
    showNote('', false);

    if (EMAILJS_CONFIGURED && typeof emailjs !== 'undefined') {
      // ── EmailJS path (sends directly to hectortins821@gmail.com) ──
      try {
        await emailjs.send(EMAILJS_SERVICE_ID, EMAILJS_TEMPLATE_ID, {
          from_name: name,
          reply_to:  email,
          message:   msg,
        });
        showNote('✓ Message sent! I\'ll get back to you soon.', false);
        contactForm.reset();
      } catch (err) {
        console.error('EmailJS error:', err);
        showNote('⚠ Something went wrong. Please email me directly at hectortins821@gmail.com', true);
      }
    } else {
      // ── Fallback: open Gmail compose in new tab ──
      const subject = encodeURIComponent(`Portfolio Inquiry from ${name}`);
      const body    = encodeURIComponent(`Name: ${name}\nEmail: ${email}\n\n${msg}`);
      window.open(`https://mail.google.com/mail/?view=cm&to=hectortins821@gmail.com&su=${subject}&body=${body}`, '_blank');
      showNote('✓ Opening Gmail… Complete sending in the new tab.', false);
      contactForm.reset();
    }

    btn.disabled = false;
    btn.querySelector('span').textContent = 'Send Message';
  });
}

function showNote(msg, isError) {
  if (!formNote) return;
  formNote.textContent = msg;
  formNote.className = 'form-note mono' + (isError ? ' error' : '');
}


/* === FOOTER YEAR === */
const footerYear = document.getElementById('footerYear');
if (footerYear) footerYear.textContent = new Date().getFullYear();


/* === PARALLAX HERO GLOW === */
document.addEventListener('mousemove', e => {
  const x = (e.clientX / window.innerWidth  - 0.5) * 30;
  const y = (e.clientY / window.innerHeight - 0.5) * 30;
  document.querySelectorAll('.bg-glow').forEach((el, i) => {
    const f = (i + 1) * 0.5;
    el.style.transform = `translate(${x * f}px, ${y * f}px)`;
  });
}, { passive: true });
