/* ============================================================
   Zrnko — JavaScript
   ============================================================ */

/* ---- Inicializace AOS (animace při scrollování) ---- */
AOS.init({
  duration: 700,       // délka animace v ms
  easing:   'ease-out-quart',
  once:     true,      // spustí se jen jednou
  offset:   60,        // offset od spodního okraje viewportu
});


/* ============================================================
   NAVIGACE — sticky stav + hamburger menu
   ============================================================ */
const navbar    = document.getElementById('navbar');
const navToggle = document.getElementById('navToggle');
const navLinks  = document.getElementById('navLinks');

// Přidej třídu .scrolled po odscrollování
function handleNavScroll() {
  navbar.classList.toggle('scrolled', window.scrollY > 40);
}

window.addEventListener('scroll', handleNavScroll, { passive: true });
handleNavScroll(); // spusť hned pro případ, že stránka začíná scrollovaná

// Hamburger: přepíná .open na tlačítku i listu
navToggle.addEventListener('click', () => {
  const isOpen = navLinks.classList.toggle('open');
  navToggle.classList.toggle('open', isOpen);
  // zabraň scrollování pozadí při otevřeném menu
  document.body.style.overflow = isOpen ? 'hidden' : '';
});

// Zavři mobilní menu po kliknutí na odkaz
navLinks.querySelectorAll('.nav-link').forEach(link => {
  link.addEventListener('click', () => {
    navLinks.classList.remove('open');
    navToggle.classList.remove('open');
    document.body.style.overflow = '';
  });
});

// Zavři mobilní menu kliknutím mimo
document.addEventListener('click', e => {
  if (!navbar.contains(e.target)) {
    navLinks.classList.remove('open');
    navToggle.classList.remove('open');
    document.body.style.overflow = '';
  }
});

// Zvýrazni aktivní sekci v navbaru při scrollu
const sections = document.querySelectorAll('section[id]');
const navLinkEls = document.querySelectorAll('.nav-link');

function highlightActiveSection() {
  const scrollY = window.scrollY + 100;
  sections.forEach(section => {
    const top    = section.offsetTop;
    const height = section.offsetHeight;
    const id     = section.getAttribute('id');
    if (scrollY >= top && scrollY < top + height) {
      navLinkEls.forEach(a => {
        a.classList.toggle('active-link', a.getAttribute('href') === `#${id}`);
      });
    }
  });
}

window.addEventListener('scroll', highlightActiveSection, { passive: true });


/* ============================================================
   MENU — přepínání karet (Nápoje / Dezerty)
   ============================================================ */
const tabBtns = document.querySelectorAll('.tab-btn');

tabBtns.forEach(btn => {
  btn.addEventListener('click', () => {
    // Deaktivuj všechny tabs
    tabBtns.forEach(b => b.classList.remove('active'));
    btn.classList.add('active');

    // Skryj všechny mřížky
    document.querySelectorAll('.menu-grid').forEach(grid => grid.classList.add('hidden'));

    // Zobraz správnou mřížku a znovu spusť AOS pro nově zobrazené karty
    const target = document.getElementById(`tab-${btn.dataset.tab}`);
    target.classList.remove('hidden');
    AOS.refresh();
  });
});


/* ============================================================
   GALERIE — lightbox
   ============================================================ */
const galleryItems = Array.from(document.querySelectorAll('.gallery-item'));
const lightbox     = document.getElementById('lightbox');
const lightboxImg  = document.getElementById('lightboxImg');
const lightboxClose = document.getElementById('lightboxClose');
const lightboxPrev = document.getElementById('lightboxPrev');
const lightboxNext = document.getElementById('lightboxNext');

let currentIndex = 0; // index aktuálně zobrazené fotky

// Otevři lightbox
function openLightbox(index) {
  currentIndex = index;
  lightboxImg.src = galleryItems[index].dataset.src;
  lightboxImg.alt = galleryItems[index].querySelector('img').alt;
  lightbox.classList.add('active');
  document.body.style.overflow = 'hidden';
}

// Zavři lightbox
function closeLightbox() {
  lightbox.classList.remove('active');
  document.body.style.overflow = '';
  // Vyčisti src po dokončení animace
  setTimeout(() => { lightboxImg.src = ''; }, 300);
}

// Navigace: předchozí / následující
function showPrev() {
  currentIndex = (currentIndex - 1 + galleryItems.length) % galleryItems.length;
  lightboxImg.src = galleryItems[currentIndex].dataset.src;
}

function showNext() {
  currentIndex = (currentIndex + 1) % galleryItems.length;
  lightboxImg.src = galleryItems[currentIndex].dataset.src;
}

// Přiřazení event listenerů na obrázky v galerii
galleryItems.forEach((item, i) => {
  item.addEventListener('click', () => openLightbox(i));
});

lightboxClose.addEventListener('click', closeLightbox);
lightboxPrev.addEventListener('click', showPrev);
lightboxNext.addEventListener('click', showNext);

// Klik na pozadí lightboxu ho zavře
lightbox.addEventListener('click', e => {
  if (e.target === lightbox) closeLightbox();
});

// Klávesové zkratky
document.addEventListener('keydown', e => {
  if (!lightbox.classList.contains('active')) return;
  if (e.key === 'Escape')     closeLightbox();
  if (e.key === 'ArrowLeft')  showPrev();
  if (e.key === 'ArrowRight') showNext();
});

// Swipe podpora pro mobilní zařízení
let touchStartX = 0;
lightbox.addEventListener('touchstart', e => {
  touchStartX = e.changedTouches[0].clientX;
}, { passive: true });
lightbox.addEventListener('touchend', e => {
  const diff = touchStartX - e.changedTouches[0].clientX;
  if (Math.abs(diff) > 50) diff > 0 ? showNext() : showPrev();
}, { passive: true });


/* ============================================================
   KONTAKTNÍ FORMULÁŘ — validace
   ============================================================ */
const contactForm   = document.getElementById('contactForm');
const formSuccess   = document.getElementById('formSuccess');

// Pomocná funkce: nastaví nebo smaže chybu na poli
function setError(fieldId, errorId, message) {
  const field = document.getElementById(fieldId);
  const error = document.getElementById(errorId);
  const group = field.closest('.form-group');

  if (message) {
    error.textContent = message;
    group.classList.add('error');
  } else {
    error.textContent = '';
    group.classList.remove('error');
  }
}

// Validuje e-mail pomocí jednoduché regex
function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

// Validace při odeslání
contactForm.addEventListener('submit', e => {
  e.preventDefault();
  let valid = true;

  const name    = document.getElementById('name').value.trim();
  const email   = document.getElementById('email').value.trim();
  const message = document.getElementById('message').value.trim();

  // Jméno
  if (name.length < 2) {
    setError('name', 'nameError', 'Prosím zadejte celé jméno (min. 2 znaky).');
    valid = false;
  } else {
    setError('name', 'nameError', '');
  }

  // E-mail
  if (!email) {
    setError('email', 'emailError', 'E-mail je povinný.');
    valid = false;
  } else if (!isValidEmail(email)) {
    setError('email', 'emailError', 'Zadejte platnou e-mailovou adresu.');
    valid = false;
  } else {
    setError('email', 'emailError', '');
  }

  // Zpráva
  if (message.length < 10) {
    setError('message', 'messageError', 'Zpráva musí mít alespoň 10 znaků.');
    valid = false;
  } else {
    setError('message', 'messageError', '');
  }

  // Úspěšné odeslání (simulace — bez backendu)
  if (valid) {
    contactForm.reset();
    formSuccess.classList.remove('hidden');
    setTimeout(() => formSuccess.classList.add('hidden'), 5000);
  }
});

// Odstraň chybu při psaní
['name', 'email', 'message'].forEach(id => {
  document.getElementById(id).addEventListener('input', () => {
    setError(id, `${id}Error`, '');
  });
});


/* ============================================================
   PLYNULÉ SCROLLOVÁNÍ pro kotevní odkazy
   (záložní pro prohlížeče bez nativní podpory)
   ============================================================ */
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', function (e) {
    const target = document.querySelector(this.getAttribute('href'));
    if (!target) return;
    e.preventDefault();
    const top = target.getBoundingClientRect().top + window.scrollY - (parseInt(getComputedStyle(document.documentElement).getPropertyValue('--nav-h')) || 72);
    window.scrollTo({ top, behavior: 'smooth' });
  });
});
