// ===== Configuración =====
// Fuente: referencias/Cotizador.xlsx. Para actualizar precios o coberturas, cambiá solo estas tablas:
// las tarjetas de planes y el cotizador se calculan desde acá.

// Precio base mensual por mascota (ARS) y descuento con tarjeta de crédito (0.5 = 50 %).
const PLANES = {
  esmeralda: { nombre: 'Esmeralda', base: 50000,  credito: 0.50, color: '#2f9e57' },
  zafiro:    { nombre: 'Zafiro',    base: 75000,  credito: 0.35, color: '#2a6fd6' },
  rubi:      { nombre: 'Rubí',      base: 112500, credito: 0.30, color: '#c2185b' },
  diamante:  { nombre: 'Diamante',  base: 169000, credito: 0.24, color: '#5f6b80' },
};
const ORDEN_PLANES = ['esmeralda', 'zafiro', 'rubi', 'diamante']; // de menor a mayor cobertura

// Botones de servicios del cotizador y qué planes los incluyen (solapa "Hoja2" del Excel).
const SERVICIOS = [
  { id: 'consultas',     nombre: 'Consultas y controles',       planes: ['esmeralda', 'zafiro', 'rubi', 'diamante'] },
  { id: 'vacunas',       nombre: 'Vacunas de calendario',       planes: ['esmeralda', 'zafiro', 'rubi', 'diamante'] },
  { id: 'castracion',    nombre: 'Castración',                  planes: ['zafiro', 'rubi', 'diamante'] },
  { id: 'imagenes',      nombre: 'Diagnóstico por imágenes',    planes: ['zafiro', 'rubi', 'diamante'] },
  { id: 'laboratorio',   nombre: 'Análisis de laboratorio',     planes: ['zafiro', 'rubi', 'diamante'] },
  { id: 'domicilio',     nombre: 'Consultas a domicilio',       planes: ['rubi', 'diamante'] },
  { id: 'especialistas', nombre: 'Consultas con especialistas', planes: ['rubi', 'diamante'] },
  { id: 'guardia',       nombre: 'Atención en guardia',         planes: ['rubi', 'diamante'] },
  { id: 'dental',        nombre: 'Limpieza dental',             planes: ['rubi', 'diamante'] },
  { id: 'cirugia',       nombre: 'Cirugía e internación',       planes: ['diamante'] },
  { id: 'bano',          nombre: 'Baño y corte',                planes: ['esmeralda', 'zafiro', 'rubi', 'diamante'] },
];

// Descuento por grupo familiar: la 2.ª mascota tiene 10 %, la 3.ª 20 %, la 4.ª 30 %... hasta 70 % (8.ª mascota).
const DESCUENTO_POR_MASCOTA = 0.10;
const MAX_MASCOTAS = 8;

const WHATSAPP = '5491126719012';

const pesos = n => '$' + Math.round(n).toLocaleString('es-AR');
const pct = x => Math.round(x * 100) + ' %';
const precioPlan = (p, conCredito) => p.base * (conCredito ? 1 - p.credito : 1);
const descuentoGrupo = posicion => Math.min(posicion - 1, MAX_MASCOTAS - 1) * DESCUENTO_POR_MASCOTA; // posicion empieza en 1
const waLink = texto => `https://wa.me/${WHATSAPP}?text=${encodeURIComponent(texto)}`;

// ===== Gemas de los planes =====
// Gema facetada en SVG: cada faceta es un tono del color del plan, con un reflejo que la recorre de vez en cuando.
const tono = (hex, k) => { // k > 0 aclara hacia blanco, k < 0 oscurece hacia negro
  const n = parseInt(hex.slice(1), 16);
  const rgb = [n >> 16, (n >> 8) & 255, n & 255].map(v => Math.round(k >= 0 ? v + (255 - v) * k : v * (1 + k)));
  return '#' + rgb.map(v => v.toString(16).padStart(2, '0')).join('');
};
let gemaN = 0;
function gemaSVG(color) {
  const id = 'gema' + (++gemaN);
  const faceta = (puntos, k) => `<path d="M${puntos}Z" fill="${tono(color, k)}"/>`;
  return `<span class="gem-wrap" style="--d:${(gemaN % 4) * -1.7}s"><svg class="gem" viewBox="0 0 48 44" aria-hidden="true">
    <defs>
      <clipPath id="${id}c"><path d="M15 5h18l12 11-21 25L3 16Z"/></clipPath>
      <linearGradient id="${id}s" x1="0" x2="1"><stop offset="0" stop-color="#fff" stop-opacity="0"/><stop offset=".5" stop-color="#fff" stop-opacity=".9"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></linearGradient>
    </defs>
    ${faceta('3 16 15 5 13 16', .28)}
    ${faceta('15 5 24 16 13 16', .5)}
    ${faceta('15 5 33 5 24 16', .68)}
    ${faceta('33 5 35 16 24 16', .38)}
    ${faceta('33 5 45 16 35 16', .12)}
    ${faceta('3 16 13 16 24 41', -.1)}
    ${faceta('13 16 24 16 24 41', .16)}
    ${faceta('24 16 35 16 24 41', -.28)}
    ${faceta('35 16 45 16 24 41', -.46)}
    <path d="M3 16h42" stroke="#fff" stroke-opacity=".6" stroke-width=".8"/>
    <path d="M15 5h18l12 11-21 25L3 16Z" fill="none" stroke="${tono(color, -.4)}" stroke-opacity=".45" stroke-width=".8" stroke-linejoin="round"/>
    <g clip-path="url(#${id}c)"><rect class="gem-shine" x="-22" y="-6" width="12" height="56" fill="url(#${id}s)"/></g>
    <path class="gem-spark" d="M18 8.5l.9 2.2 2.2.9-2.2.9-.9 2.2-.9-2.2-2.2-.9 2.2-.9Z" fill="#fff"/>
  </svg></span>`;
}

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
  card.querySelector('svg.gem').outerHTML = gemaSVG(p.color);
  card.querySelector('.price-list').textContent = pesos(p.base);
  card.querySelector('.amount').textContent = pesos(precioPlan(p, true));
  card.querySelector('.price-note').innerHTML = `<b>${pct(p.credito)} off</b> con tarjeta de crédito`;
});

// ===== Cotizador =====
const qForm = document.getElementById('quote-form');
const qPlans = document.getElementById('q-plans');
const qPerros = document.getElementById('q-perros');
const qGatos = document.getElementById('q-gatos');
let nombreMascota = ''; // llega desde la credencial de demostración de la portada

document.getElementById('q-servicios').innerHTML = SERVICIOS.map(s => `
  <label class="chip"><input type="checkbox" name="q-servicio" value="${s.id}"><span>${s.nombre}</span></label>`).join('');

qPlans.innerHTML = ORDEN_PLANES.map((id, i) => {
  const p = PLANES[id];
  return `
  <label class="q-plan" style="--gem:${p.color}" data-plan="${id}">
    <input type="radio" name="q-plan" value="${id}" ${i === 0 ? 'checked' : ''}>
    <span class="q-plan-body">
      <span class="q-plan-tag">Recomendado</span>
      ${gemaSVG(p.color)}
      <span class="q-plan-text">
        <span class="q-plan-name">${p.nombre}</span>
        <span class="q-plan-price"></span>
        <span class="q-plan-fit"></span>
      </span>
    </span>
  </label>`;
}).join('');

const leerCantidad = input => Math.min(MAX_MASCOTAS, Math.max(0, parseInt(input.value, 10) || 0));
const serviciosElegidos = () =>
  [...qForm.querySelectorAll('[name="q-servicio"]:checked')].map(c => SERVICIOS.find(s => s.id === c.value));
const faltantes = (planId, servicios) => servicios.filter(s => !s.planes.includes(planId));

// Plan más económico que cubre todos los servicios elegidos (siempre existe: Diamante cubre todo).
function planRecomendado(servicios) {
  return ORDEN_PLANES.find(id => faltantes(id, servicios).length === 0);
}

// Al elegir servicios, el cotizador pasa al plan recomendado; si el usuario cambia de plan a mano, se respeta.
let planElegidoAMano = false;

function cotizar({ desdeServicios = false } = {}) {
  let perros = leerCantidad(qPerros);
  let gatos = leerCantidad(qGatos);
  if (perros + gatos > MAX_MASCOTAS) {
    // No superar el máximo del esquema de descuentos: se recorta el campo que se acaba de tocar.
    if (document.activeElement === qGatos || qGatos.dataset.ultimo === '1') gatos = MAX_MASCOTAS - perros;
    else perros = MAX_MASCOTAS - gatos;
  }
  qPerros.value = perros;
  qGatos.value = gatos;
  const total = perros + gatos;

  const servicios = serviciosElegidos();
  const recomendado = planRecomendado(servicios);
  if (desdeServicios && servicios.length && !planElegidoAMano) {
    qForm.querySelector(`[name="q-plan"][value="${recomendado}"]`).checked = true;
  }

  const credito = qForm.querySelector('[name="q-pago"]:checked').value === 'credito';
  const planId = qForm.querySelector('[name="q-plan"]:checked').value;
  const plan = PLANES[planId];

  // Tarjetas del paso "Plan": precio, ajuste a los servicios y recomendado
  qPlans.querySelectorAll('.q-plan').forEach(label => {
    const id = label.dataset.plan;
    const falta = faltantes(id, servicios);
    label.querySelector('.q-plan-price').textContent = pesos(precioPlan(PLANES[id], credito)) + '/mes';
    const fit = label.querySelector('.q-plan-fit');
    fit.textContent = servicios.length && falta.length ? `Le ${falta.length === 1 ? 'falta 1 servicio' : `faltan ${falta.length} servicios`}` : '';
    label.classList.toggle('is-recommended', servicios.length > 0 && id === recomendado);
  });

  const faltan = faltantes(planId, servicios);
  const aviso = document.getElementById('q-missing');
  aviso.hidden = !faltan.length;
  if (faltan.length) {
    aviso.innerHTML = `El plan ${plan.nombre} no incluye: <strong>${faltan.map(s => s.nombre.toLowerCase()).join(', ')}</strong>. ` +
      `Para cubrir todo te conviene el plan <button type="button" class="link-btn" data-elegir="${recomendado}">${PLANES[recomendado].nombre}</button>.`;
  }

  // Detalle por mascota con el descuento por grupo familiar
  const unitario = precioPlan(plan, credito);
  const lineas = [];
  let suma = 0;
  for (let i = 1; i <= total; i++) {
    const d = descuentoGrupo(i);
    const precio = Math.round(unitario * (1 - d));
    suma += precio;
    lineas.push({ etiqueta: `Mascota ${i}`, descuento: d, precio });
  }
  const sinDescuentos = plan.base * total;
  const ahorro = sinDescuentos - suma;

  document.getElementById('qr-total').textContent = pesos(suma);
  document.getElementById('qr-plan').textContent = plan.nombre;
  document.getElementById('qr-for').hidden = !nombreMascota;
  document.getElementById('qr-for-name').textContent = nombreMascota;
  document.getElementById('qr-lines').innerHTML = total
    ? lineas.map(l => `<li><span>${l.etiqueta}${l.descuento ? ` <em>−${pct(l.descuento)} grupo</em>` : ''}</span><b>${pesos(l.precio)}</b></li>`).join('')
    : '<li class="qr-empty">Sumá al menos un perro o un gato.</li>';
  document.getElementById('qr-saving').textContent = ahorro > 0 ? pesos(ahorro) : '—';
  document.getElementById('q-group-hint').textContent = total > 1
    ? `Descuento por grupo familiar aplicado a ${total - 1} ${total - 1 === 1 ? 'mascota' : 'mascotas'}.`
    : 'Grupo familiar: desde la 2.ª mascota, cada una suma 10 % más de descuento.';

  const waBtn = document.getElementById('qr-whatsapp');
  waBtn.classList.toggle('is-disabled', total === 0);
  const detalleMascotas = [perros && `${perros} ${perros === 1 ? 'perro' : 'perros'}`, gatos && `${gatos} ${gatos === 1 ? 'gato' : 'gatos'}`]
    .filter(Boolean).join(' y ');
  const mensaje = [
    'Hola Gema, quiero afiliar a mis mascotas. Hice esta cotización en la web:',
    nombreMascota ? `• Nombre: ${nombreMascota}` : '',
    `• Mascotas: ${detalleMascotas || '—'}`,
    servicios.length ? `• Servicios que busco: ${servicios.map(s => s.nombre.toLowerCase()).join(', ')}` : '',
    `• Plan: ${plan.nombre}`,
    `• Pago: ${credito ? 'tarjeta de crédito' : 'otros medios de pago'}`,
    `• Cuota estimada: ${pesos(suma)}/mes`,
  ].filter(Boolean).join('\n');
  waBtn.href = waLink(mensaje);
}

qForm.addEventListener('change', e => {
  if (e.target.name === 'q-plan') planElegidoAMano = true;
  if (e.target.name === 'q-servicio') planElegidoAMano = false;
  cotizar({ desdeServicios: e.target.name === 'q-servicio' });
});
qForm.addEventListener('input', e => {
  if (e.target === qPerros || e.target === qGatos) {
    qGatos.dataset.ultimo = e.target === qGatos ? '1' : '0';
    cotizar();
  }
});
qForm.addEventListener('submit', e => e.preventDefault());

qForm.addEventListener('click', e => {
  const step = e.target.closest('[data-step]');
  if (step) {
    const input = document.getElementById(step.dataset.target);
    const otro = input === qPerros ? qGatos : qPerros;
    const max = MAX_MASCOTAS - leerCantidad(otro);
    input.value = Math.min(max, Math.max(0, leerCantidad(input) + Number(step.dataset.step)));
    qGatos.dataset.ultimo = input === qGatos ? '1' : '0';
    cotizar();
  }
  const elegir = e.target.closest('[data-elegir]');
  if (elegir) {
    qForm.querySelector(`[name="q-plan"][value="${elegir.dataset.elegir}"]`).checked = true;
    planElegidoAMano = false;
    cotizar();
  }
});

// "Cotizar" desde una tarjeta preselecciona ese plan
document.querySelectorAll('[data-cotizar]').forEach(link => {
  link.addEventListener('click', () => {
    qForm.querySelector(`[name="q-plan"][value="${link.dataset.cotizar}"]`).checked = true;
    planElegidoAMano = true;
    cotizar();
  });
});

cotizar();

// ===== Portada: credencial de demostración =====
// Nada se envía ni se guarda: el nombre solo viaja al cotizador y al mensaje de WhatsApp.
const demoForm = document.getElementById('demo-form');
const demoNombre = document.getElementById('demo-nombre');
const credName = document.getElementById('cred-name');
const especieDemo = () => demoForm.querySelector('[name="demo-especie"]:checked').value;
const nombreDemo = () => demoNombre.value.trim() || 'Milo';

function actualizarDemo() {
  const nombre = nombreDemo();
  const gato = especieDemo() === 'gato';
  if (credName.textContent !== nombre) {
    credName.textContent = nombre;
    credName.classList.remove('pop');
    void credName.offsetWidth; // reinicia la animación
    credName.classList.add('pop');
  }
  document.getElementById('cred-especie').textContent = gato ? 'Gato' : 'Perro';
  document.querySelector('.pet-perro').toggleAttribute('hidden', gato); // los SVG no tienen la propiedad .hidden
  document.querySelector('.pet-gato').toggleAttribute('hidden', !gato);
  document.querySelectorAll('.pet-ref').forEach(el => { el.textContent = nombre; });
  document.getElementById('demo-cta').textContent = `Conocé los planes para ${nombre}`;
}
demoForm.addEventListener('input', actualizarDemo);
demoForm.addEventListener('change', actualizarDemo);

demoForm.addEventListener('submit', e => {
  e.preventDefault();
  const gato = especieDemo() === 'gato';
  nombreMascota = demoNombre.value.trim();
  qPerros.value = gato ? 0 : 1;
  qGatos.value = gato ? 1 : 0;
  cotizar();
  const lead = document.getElementById('lead-form');
  if (nombreMascota) lead.mascota.value = nombreMascota;
  lead.especie.value = gato ? 'Gato' : 'Perro';
  document.getElementById('cotizador').scrollIntoView({ behavior: 'smooth' });
});

// ===== Detalle de planes: solapas =====
const tabs = document.querySelectorAll('.detail-tabs [role="tab"]');
function mostrarSolapa(tab) {
  tabs.forEach(t => {
    const activa = t === tab;
    t.setAttribute('aria-selected', String(activa));
    t.tabIndex = activa ? 0 : -1;
    document.getElementById(t.getAttribute('aria-controls')).hidden = !activa;
  });
}
tabs.forEach((tab, i) => {
  tab.addEventListener('click', () => mostrarSolapa(tab));
  tab.addEventListener('keydown', e => {
    const dir = e.key === 'ArrowRight' ? 1 : e.key === 'ArrowLeft' ? -1 : 0;
    if (!dir) return;
    const next = tabs[(i + dir + tabs.length) % tabs.length];
    next.focus();
    mostrarSolapa(next);
  });
});
mostrarSolapa(tabs[0]);

// ===== Dibujo decorativo del QR de la placa =====
// Patrón fijo con forma de QR (no se puede escanear): tres marcas de esquina y módulos pseudoaleatorios.
(function dibujarQR() {
  const svgs = ['qr-art', 'cred-qr'].map(id => document.getElementById(id)).filter(Boolean);
  const n = 25;
  const esMarca = (x, y) => (x < 7 && y < 7) || (x >= n - 7 && y < 7) || (x < 7 && y >= n - 7);
  let semilla = 7;
  const azar = () => (semilla = (semilla * 9301 + 49297) % 233280) / 233280;
  let d = '';
  for (let y = 0; y < n; y++) {
    for (let x = 0; x < n; x++) {
      if (!esMarca(x, y) && azar() < 0.48) d += `M${x} ${y}h1v1h-1z`;
    }
  }
  const marca = (x, y) => `M${x} ${y}h7v7h-7zM${x + 1} ${y + 1}v5h5v-5zM${x + 2} ${y + 2}h3v3h-3z`;
  d += marca(0, 0) + marca(n - 7, 0) + marca(0, n - 7);
  svgs.forEach(svg => { svg.innerHTML = `<path d="${d}" fill-rule="evenodd"/>`; });
})();

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
const revealTargets = document.querySelectorAll('.section-head, .steps li, .plan, .quote-tool, .detail-panel, .app-copy, .phone, .lost-card, .qr-copy, .qr-visual, .cartilla, .faq details, .form');
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
