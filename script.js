// Menú móvil
const toggle = document.querySelector('.nav-toggle');
const nav = document.getElementById('nav');

toggle.addEventListener('click', () => {
  const open = toggle.getAttribute('aria-expanded') === 'true';
  toggle.setAttribute('aria-expanded', String(!open));
  nav.classList.toggle('open', !open);
});

nav.querySelectorAll('a').forEach(link => {
  link.addEventListener('click', () => {
    toggle.setAttribute('aria-expanded', 'false');
    nav.classList.remove('open');
  });
});

// Borde del header al hacer scroll
const header = document.querySelector('.site-header');
window.addEventListener('scroll', () => {
  header.classList.toggle('scrolled', window.scrollY > 8);
}, { passive: true });

// Precios según perro / gato
const petButtons = document.querySelectorAll('.pet-switch button');
const amounts = document.querySelectorAll('.price .amount');

petButtons.forEach(btn => {
  btn.addEventListener('click', () => {
    const pet = btn.dataset.pet;
    petButtons.forEach(b => b.setAttribute('aria-selected', String(b === btn)));
    amounts.forEach(el => {
      el.style.opacity = 0;
      setTimeout(() => {
        el.textContent = el.dataset[pet];
        el.style.opacity = 1;
      }, 150);
    });
    document.getElementById('especie').value = pet === 'gato' ? 'Gato' : 'Perro';
  });
});

// Elegir un plan precarga el formulario
document.querySelectorAll('[data-plan]').forEach(link => {
  link.addEventListener('click', () => {
    document.getElementById('plan').value = link.dataset.plan;
  });
});

// Formulario de contacto
// TODO: conectar a un backend o servicio de formularios (Formspree, Google Forms, CRM, etc.)
const form = document.getElementById('lead-form');
const msg = form.querySelector('.form-msg');

form.addEventListener('submit', e => {
  e.preventDefault();
  let valid = true;

  form.querySelectorAll('[required]').forEach(input => {
    const ok = input.value.trim() !== '' && input.checkValidity();
    input.classList.toggle('invalid', !ok);
    if (!ok) valid = false;
  });

  if (!valid) {
    msg.textContent = 'Revisá los campos marcados, por favor.';
    msg.className = 'form-msg error';
    return;
  }

  const name = form.nombre.value.trim().split(' ')[0];
  const pet = form.mascota.value.trim();
  msg.textContent = `¡Gracias, ${name}! Te vamos a contactar pronto${pet ? ' para asociar a ' + pet : ''}.`;
  msg.className = 'form-msg ok';
  form.reset();
});

// Animación de aparición al hacer scroll
const revealTargets = document.querySelectorAll('.section-head, .steps li, .feature, .plan, .quote, .faq details, .form');
revealTargets.forEach(el => el.classList.add('reveal'));

const observer = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
      observer.unobserve(entry.target);
    }
  });
}, { threshold: 0.12 });

revealTargets.forEach(el => observer.observe(el));

document.getElementById('year').textContent = new Date().getFullYear();
