// ===== Configuración =====
// Precios mensuales por mascota (ARS) y % de descuento publicado con tarjeta de crédito.
// Para actualizarlos, cambiá solo esta tabla: las tarjetas de planes y el cotizador se calculan desde acá.
const PLANES = {
  esmeralda: { nombre: 'Esmeralda', lista: 50000,  credito: 25000,  off: 50, color: '#2f9e57' },
  zafiro:    { nombre: 'Zafiro',    lista: 75000,  credito: 49000,  off: 35, color: '#2a6fd6' },
  rubi:      { nombre: 'Rubí',      lista: 112500, credito: 79000,  off: 30, color: '#c2185b' },
  diamante:  { nombre: 'Diamante',  lista: 169000, credito: 129000, off: 20, color: '#5f6b80' },
};
const WHATSAPP = '5491126719012';

const pesos = n => '$' + n.toLocaleString('es-AR');
const descuento = p => p.off;
const waLink = texto => `https://wa.me/${WHATSAPP}?text=${encodeURIComponent(texto)}`;

// ===== Menú móvil =====
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

// Sombra del header al hacer scroll
const header = document.querySelector('.site-header');
window.addEventListener('scroll', () => {
  header.classList.toggle('scrolled', window.scrollY > 8);
}, { passive: true });

// ===== Precios en las tarjetas de planes =====
document.querySelectorAll('.plan[data-plan]').forEach(card => {
  const p = PLANES[card.dataset.plan];
  card.style.setProperty('--gem', p.color);
  card.querySelector('.price-list').textContent = pesos(p.lista);
  card.querySelector('.amount').textContent = pesos(p.credito);
  card.querySelector('.price-note').innerHTML = `<b>${descuento(p)} % off</b> con tarjeta de crédito`;
});

// ===== Cotizador =====
const qForm = document.getElementById('quote-form');
const qPlans = document.getElementById('q-plans');
const qCantidad = document.getElementById('q-cantidad');

qPlans.innerHTML = Object.entries(PLANES).map(([id, p], i) => `
  <label class="q-plan" style="--gem:${p.color}">
    <input type="radio" name="q-plan" value="${id}" ${i === 1 ? 'checked' : ''}>
    <span class="q-plan-body">
      <svg class="gem" viewBox="0 0 40 40" aria-hidden="true"><path d="M8 14 14 7h12l6 7-12 19Z"/><path d="M8 14h24L20 33Z" fill-opacity=".6"/></svg>
      <span class="q-plan-name">${p.nombre}</span>
      <span class="q-plan-price">${pesos(p.credito)}</span>
    </span>
  </label>`).join('');

function cotizar() {
  const id = qForm.querySelector('[name="q-plan"]:checked').value;
  const plan = PLANES[id];
  const credito = qForm.querySelector('[name="q-pago"]:checked').value === 'credito';
  const cantidad = Math.min(10, Math.max(1, parseInt(qCantidad.value, 10) || 1));
  const especie = qForm.querySelector('[name="q-especie"]:checked').value;
  const edad = document.getElementById('q-edad').value;

  const unitario = credito ? plan.credito : plan.lista;
  const total = unitario * cantidad;
  const ahorro = (plan.lista - plan.credito) * cantidad;

  document.getElementById('qr-total').textContent = pesos(total);
  document.getElementById('qr-plan').textContent = plan.nombre;
  document.getElementById('qr-unit').textContent = pesos(unitario);
  document.getElementById('qr-qty').textContent = cantidad;
  document.getElementById('qr-saving').textContent = credito
    ? `${pesos(ahorro)} (${descuento(plan)} % off)`
    : `Con tarjeta de crédito ahorrás ${pesos(ahorro)}`;
  document.querySelector('.qr-saving').classList.toggle('muted', !credito);

  const mensaje = [
    'Hola Gema, quiero afiliar a mi mascota. Hice esta cotización en la web:',
    `• Plan: ${plan.nombre}`,
    `• Mascotas: ${cantidad} (${especie}, ${edad.toLowerCase()})`,
    `• Pago: ${credito ? 'tarjeta de crédito' : 'otro medio de pago'}`,
    `• Cuota estimada: ${pesos(total)}/mes`,
  ].join('\n');
  document.getElementById('qr-whatsapp').href = waLink(mensaje);
}

qForm.addEventListener('change', cotizar);
qForm.addEventListener('input', cotizar);
qForm.addEventListener('submit', e => e.preventDefault());

qForm.querySelectorAll('[data-step]').forEach(btn => {
  btn.addEventListener('click', () => {
    const v = (parseInt(qCantidad.value, 10) || 1) + Number(btn.dataset.step);
    qCantidad.value = Math.min(10, Math.max(1, v));
    cotizar();
  });
});

// "Cotizar" desde una tarjeta preselecciona ese plan
document.querySelectorAll('[data-cotizar]').forEach(link => {
  link.addEventListener('click', () => {
    const radio = qForm.querySelector(`[name="q-plan"][value="${link.dataset.cotizar}"]`);
    radio.checked = true;
    cotizar();
  });
});

cotizar();

// ===== Formulario de contacto: continúa en WhatsApp =====
const form = document.getElementById('lead-form');
const msg = form.querySelector('.form-msg');

form.addEventListener('submit', e => {
  e.preventDefault();
  const nombre = form.nombre.value.trim();
  form.nombre.classList.toggle('invalid', !nombre);
  if (!nombre) {
    msg.textContent = 'Escribí tu nombre para continuar.';
    msg.className = 'form-msg error';
    form.nombre.focus();
    return;
  }

  const mascota = form.mascota.value.trim();
  const consulta = form.consulta.value.trim();
  const texto = [
    `Hola Gema, soy ${nombre}.`,
    `Tengo ${form.especie.value === 'Gato' ? 'un gato' : 'un perro'}${mascota ? ' que se llama ' + mascota : ''}.`,
    form.plan.value === 'Todavía no sé'
      ? 'Quiero que me asesoren para elegir un plan.'
      : `Me interesa el plan ${form.plan.value}.`,
    consulta ? `Consulta: ${consulta}` : '',
  ].filter(Boolean).join(' ');

  window.open(waLink(texto), '_blank', 'noopener');
  msg.textContent = 'Abrimos WhatsApp con tu mensaje listo. Si no se abrió, escribinos al +54 9 11 2671-9012.';
  msg.className = 'form-msg ok';
});

// ===== Animación de aparición al hacer scroll =====
const revealTargets = document.querySelectorAll('.section-head, .steps li, .plan, .quote-tool, .app-copy, .phone, .cartilla, .faq details, .form');
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
