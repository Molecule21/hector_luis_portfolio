/* ============================================================
   PORTFOLIO — projects.js
   Project Archive Page Script
   ============================================================ */

/* --- SHARED: Cursor & Navbar --- */
const cursor      = document.getElementById('cursor');
const cursorTrail = document.getElementById('cursorTrail');
let mouseX = 0, mouseY = 0, trailX = 0, trailY = 0;

document.addEventListener('mousemove', e => {
  mouseX = e.clientX; mouseY = e.clientY;
  if (cursor) { cursor.style.left = mouseX + 'px'; cursor.style.top = mouseY + 'px'; }
});
(function animateTrail() {
  trailX += (mouseX - trailX) * 0.12;
  trailY += (mouseY - trailY) * 0.12;
  if (cursorTrail) { cursorTrail.style.left = trailX + 'px'; cursorTrail.style.top = trailY + 'px'; }
  requestAnimationFrame(animateTrail);
})();

/* Hamburger */
const hamburgerBtn = document.getElementById('hamburgerBtn');
const mobileMenu   = document.getElementById('mobileMenu');
if (hamburgerBtn && mobileMenu) {
  hamburgerBtn.addEventListener('click', () => {
    const open = !mobileMenu.classList.contains('open');
    hamburgerBtn.classList.toggle('active', open);
    mobileMenu.classList.toggle('open', open);
    hamburgerBtn.setAttribute('aria-expanded', String(open));
  });
}

/* ============================================================
   FILTER SYSTEM
   ============================================================ */
const filterBtns  = document.querySelectorAll('.filter-btn');
const archiveCards = document.querySelectorAll('.archive-card');
const emptyState  = document.getElementById('emptyState');

filterBtns.forEach(btn => {
  btn.addEventListener('click', () => {
    filterBtns.forEach(b => b.classList.remove('active'));
    btn.classList.add('active');

    const filter = btn.dataset.filter;
    let visible = 0;

    archiveCards.forEach(card => {
      const match = filter === 'all' || card.dataset.category === filter;
      card.classList.toggle('hidden', !match);
      if (match) visible++;
    });

    if (emptyState) {
      emptyState.style.display = visible === 0 ? 'flex' : 'none';
    }
  });
});

/* ============================================================
   ADD PROJECT MODAL
   ============================================================ */
const modal         = document.getElementById('addProjectModal');
const addFab        = document.getElementById('addProjectFab');
const closeBtn      = document.getElementById('modalCloseBtn');
const cancelBtn     = document.getElementById('modalCancelBtn');
const addForm       = document.getElementById('addProjectForm');
const modalNote     = document.getElementById('modalFormNote');

function openModal() {
  modal.classList.add('open');
  document.body.style.overflow = 'hidden';
  // Focus first input
  setTimeout(() => document.getElementById('projectTitle')?.focus(), 100);
}
function closeModal() {
  modal.classList.remove('open');
  document.body.style.overflow = '';
  addForm.reset();
  resetImagePreview();
  if (modalNote) { modalNote.textContent = ''; modalNote.className = 'form-note'; }
}

addFab?.addEventListener('click', openModal);
closeBtn?.addEventListener('click', closeModal);
cancelBtn?.addEventListener('click', closeModal);
modal?.addEventListener('click', e => { if (e.target === modal) closeModal(); });

// ESC key close
document.addEventListener('keydown', e => {
  if (e.key === 'Escape' && modal?.classList.contains('open')) closeModal();
});

/* --- IMAGE UPLOAD / PREVIEW --- */
const uploadZone    = document.getElementById('imgUploadZone');
const fileInput     = document.getElementById('projectImageInput');
const imgPreview    = document.getElementById('imgPreview');
const imgPreviewSrc = document.getElementById('imgPreviewSrc');
const imgRemoveBtn  = document.getElementById('imgRemoveBtn');
let uploadedImageDataUrl = null;

function showPreview(file) {
  if (!file || !file.type.startsWith('image/')) return;
  if (file.size > 5 * 1024 * 1024) {
    if (modalNote) { modalNote.textContent = '⚠ Image must be under 5MB.'; modalNote.className = 'form-note error'; }
    return;
  }
  const reader = new FileReader();
  reader.onload = e => {
    uploadedImageDataUrl = e.target.result;
    imgPreviewSrc.src = uploadedImageDataUrl;
    uploadZone.style.display = 'none';
    imgPreview.style.display = 'block';
  };
  reader.readAsDataURL(file);
}

function resetImagePreview() {
  uploadedImageDataUrl = null;
  if (imgPreviewSrc) imgPreviewSrc.src = '';
  if (imgPreview)    imgPreview.style.display = 'none';
  if (uploadZone)    uploadZone.style.display  = '';
  if (fileInput)     fileInput.value = '';
}

uploadZone?.addEventListener('click', () => fileInput?.click());
uploadZone?.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') fileInput?.click(); });
fileInput?.addEventListener('change', () => showPreview(fileInput.files?.[0]));
imgRemoveBtn?.addEventListener('click', resetImagePreview);

// Drag & drop
uploadZone?.addEventListener('dragover', e => { e.preventDefault(); uploadZone.classList.add('drag-over'); });
uploadZone?.addEventListener('dragleave', () => uploadZone.classList.remove('drag-over'));
uploadZone?.addEventListener('drop', e => {
  e.preventDefault();
  uploadZone.classList.remove('drag-over');
  showPreview(e.dataTransfer.files?.[0]);
});

/* ============================================================
   FORM SUBMIT — Dynamically Add Card to Archive
   ============================================================ */
const archiveGrid = document.getElementById('archiveGrid');

/* Category label map */
const categoryLabels = {
  web:        'Web App',
  healthcare: 'Healthcare',
  crm:        'CRM',
  mobile:     'Mobile',
  api:        'API / Backend',
};

/* Category fallback SVG icons */
const categoryIcons = {
  web:        `<rect x="2" y="3" width="20" height="14" rx="2"/><path d="M8 21h8M12 17v4"/>`,
  healthcare: `<path d="M22 12h-4l-3 9L9 3l-3 9H2"/>`,
  crm:        `<rect x="3" y="3" width="18" height="18" rx="2"/><path d="M3 9h18M9 21V9"/>`,
  mobile:     `<rect x="5" y="2" width="14" height="20" rx="2"/><line x1="12" y1="18" x2="12.01" y2="18"/>`,
  api:        `<polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/>`,
};

function buildCardHTML(data, id) {
  const { title, category, description, tech, liveUrl, codeUrl, imageDataUrl } = data;
  const catLabel = categoryLabels[category] || category;
  const icon     = categoryIcons[category] || categoryIcons.web;

  const techTags = tech
    ? tech.split(',').map(t => t.trim()).filter(Boolean)
        .map(t => `<span class="archive-tag">${escHtml(t)}</span>`).join('')
    : '';

  const imgContent = imageDataUrl
    ? `<img src="${imageDataUrl}" alt="${escHtml(title)} screenshot" class="archive-img" loading="lazy" />`
    : `<div class="archive-img-fallback">
        <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true">${icon}</svg>
        <span>${escHtml(catLabel)}</span>
       </div>`;

  const liveLink = liveUrl
    ? `<a href="${escHtml(liveUrl)}" class="archive-link" target="_blank" rel="noopener noreferrer" aria-label="Live demo">
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>
        Live Demo
       </a>` : '';

  const codeLink = codeUrl
    ? `<a href="${escHtml(codeUrl)}" class="archive-link" target="_blank" rel="noopener noreferrer" aria-label="Source code">
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/></svg>
        Code
       </a>` : '';

  return `
    <article class="archive-card" role="listitem" data-category="${escHtml(category)}" id="${escHtml(id)}">
      <div class="archive-img-wrap">
        ${imgContent}
        <span class="archive-cat-badge">${escHtml(catLabel)}</span>
      </div>
      <div class="archive-body">
        <h3>${escHtml(title)}</h3>
        <p>${escHtml(description)}</p>
        <div class="archive-tags">${techTags}</div>
        <div class="archive-links">${liveLink}${codeLink}</div>
      </div>
    </article>`;
}

function escHtml(str) {
  if (!str) return '';
  const d = document.createElement('div');
  d.textContent = str;
  return d.innerHTML;
}

let cardCount = 100;

addForm?.addEventListener('submit', e => {
  e.preventDefault();

  const title       = document.getElementById('projectTitle')?.value.trim();
  const category    = document.getElementById('projectCategory')?.value;
  const description = document.getElementById('projectDesc')?.value.trim();
  const tech        = document.getElementById('projectTech')?.value.trim();
  const liveUrl     = document.getElementById('projectLiveUrl')?.value.trim();
  const codeUrl     = document.getElementById('projectCodeUrl')?.value.trim();

  // Validation
  if (!title || !category || !description) {
    if (modalNote) {
      modalNote.textContent = '⚠ Please fill in all required fields.';
      modalNote.className = 'form-note error';
    }
    return;
  }

  const submitBtn = document.getElementById('addProjectSubmitBtn');
  if (submitBtn) { submitBtn.disabled = true; submitBtn.textContent = 'Adding…'; }

  setTimeout(() => {
    cardCount++;
    const newId = `archiveCard${cardCount}`;
    const cardHTML = buildCardHTML({
      title, category, description, tech, liveUrl, codeUrl,
      imageDataUrl: uploadedImageDataUrl,
    }, newId);

    // Insert before empty state
    const empty = document.getElementById('emptyState');
    if (empty) {
      empty.insertAdjacentHTML('beforebegin', cardHTML);
    } else {
      archiveGrid?.insertAdjacentHTML('beforeend', cardHTML);
    }

    // Check if current filter would hide the new card
    const activeFilter = document.querySelector('.filter-btn.active')?.dataset.filter;
    if (activeFilter && activeFilter !== 'all' && activeFilter !== category) {
      // Switch to 'all' filter so user can see the new card
      document.querySelector('[data-filter="all"]')?.click();
    }

    // Animate in
    const newCard = document.getElementById(newId);
    if (newCard) {
      newCard.style.opacity = '0';
      newCard.style.transform = 'translateY(24px)';
      requestAnimationFrame(() => {
        newCard.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
        newCard.style.opacity = '1';
        newCard.style.transform = 'translateY(0)';
      });
    }

    // Persist to localStorage
    saveProjects();

    if (submitBtn) { submitBtn.disabled = false; submitBtn.textContent = 'Add Project'; }
    closeModal();
  }, 400);
});

/* ============================================================
   PERSISTENCE — localStorage
   ============================================================ */
const STORAGE_KEY = 'hlt_portfolio_projects';

function saveProjects() {
  const cards = document.querySelectorAll('.archive-card[id^="archiveCard1"]');
  const data  = Array.from(cards)
    .filter(c => parseInt(c.id.replace('archiveCard','')) >= 100)
    .map(card => ({
      id:       card.id,
      category: card.dataset.category,
      title:    card.querySelector('h3')?.textContent || '',
      desc:     card.querySelector('p')?.textContent  || '',
      tags:     Array.from(card.querySelectorAll('.archive-tag')).map(t => t.textContent),
      liveUrl:  card.querySelector('.archive-link[aria-label="Live demo"]')?.href || '',
      codeUrl:  card.querySelector('.archive-link[aria-label="Source code"]')?.href || '',
      imgSrc:   card.querySelector('.archive-img')?.src || '',
    }));
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

function loadProjects() {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
    saved.forEach(p => {
      const cardHTML = buildCardHTML({
        title: p.title,
        category: p.category,
        description: p.desc,
        tech: (p.tags || []).join(', '),
        liveUrl: p.liveUrl,
        codeUrl: p.codeUrl,
        imageDataUrl: p.imgSrc,
      }, p.id || `archiveCard${++cardCount}`);
      const empty = document.getElementById('emptyState');
      if (empty) empty.insertAdjacentHTML('beforebegin', cardHTML);
      else archiveGrid?.insertAdjacentHTML('beforeend', cardHTML);
    });
  } catch (_) {}
}

// Load on page ready
loadProjects();

/* ============================================================
   STAGGER animation for initial cards
   ============================================================ */
document.querySelectorAll('.archive-card').forEach((card, i) => {
  card.style.opacity    = '0';
  card.style.transform  = 'translateY(20px)';
  card.style.transition = `opacity 0.5s ${i * 0.06}s ease, transform 0.5s ${i * 0.06}s ease`;
  setTimeout(() => {
    card.style.opacity   = '1';
    card.style.transform = 'translateY(0)';
  }, 80 + i * 60);
});
