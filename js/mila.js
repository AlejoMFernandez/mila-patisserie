// MILA · comer & ser feliz — demo de Alejo Martín Fernández
import { initKit } from '../kit/kit.js';
import { opcionesRetiro } from '../kit/core/encargos.js';
import { precioLinea, precioDesde, pctSena } from '../kit/core/variantes.js';
import { DIAS, ahoraEn, franjas as franjasHorario, diaNum, fechaDeNum, diaSemana } from '../kit/core/turnos.js';

window.__mila = true;
const html = document.documentElement;
const $ = (s, c = document) => c.querySelector(s);
const $$ = (s, c = document) => Array.from(c.querySelectorAll(s));
const esc = (v) => String(v ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
const esDesk = () => matchMedia('(min-width: 1100px)').matches;
const sleep = (ms) => new Promise(r => setTimeout(r, ms));
const WA = '5491162527888';
const wa = (txt) => `https://wa.me/${WA}?text=${encodeURIComponent(txt)}`;
const DCORTO = ['dom', 'lun', 'mar', 'mié', 'jue', 'vie', 'sáb'];
const fechaCorta = (f) => { const [y, m, d] = f.split('-').map(Number); return `${DCORTO[new Date(Date.UTC(y, m - 1, d)).getUTCDay()]} ${d}/${m}`; };
const ENCARGO = ['tortas', 'tartas', 'cheesecakes'];
const hs = (s) => String(s).replace(/^0/, '').replace(/:00$/, '');

// =============== INTRO ===============
async function intro() {
  const el = $('#intro');
  if (!html.classList.contains('con-intro') || !el) { html.classList.add('listo'); return; }
  const k = matchMedia('(min-width: 768px)').matches ? 1 : 0.78;
  const heroImg = $('.arco--b img');
  const imgOk = heroImg && !heroImg.complete ? new Promise(r => { heroImg.onload = heroImg.onerror = r; }) : Promise.resolve();
  await Promise.race([Promise.all([document.fonts?.ready, imgOk]), sleep(2600)]);
  el.classList.add('play');
  await sleep(1620 * k);
  // la vidriera se abre: un arco crece desde el centro (clip-path con un agujero en forma de arco)
  html.classList.add('listo');
  const dur = 620 * k, t0 = performance.now();
  const W = innerWidth, H = innerHeight, cx = W / 2, cy = H * 0.56, max = Math.hypot(W, H);
  await new Promise(res => {
    const paso = (t) => {
      const p = Math.min(1, (t - t0) / dur), e = 1 - Math.pow(1 - p, 3), R = Math.max(1, e * max);
      el.style.clipPath = `path(evenodd, "M0 0H${W}V${H}H0Z M${cx - R} ${H + 2}V${cy}A${R} ${R} 0 0 1 ${cx + R} ${cy}V${H + 2}Z")`;
      if (p < 1) requestAnimationFrame(paso); else res();
    };
    requestAnimationFrame(paso);
  });
  el.remove();
  html.classList.remove('con-intro');
}

// =============== BARRA + MENÚ ===============
function barra() {
  const b = $('#barra');
  const pinta = () => { b.classList.toggle('con-fondo', scrollY > 20); html.classList.toggle('en-hero', scrollY < innerHeight * 0.55); };
  addEventListener('scroll', pinta, { passive: true }); pinta();
  const menu = $('#menu'), btn = $('[data-menu]');
  let y = 0;
  const abrir = (on) => {
    menu.hidden = !on; btn.setAttribute('aria-expanded', on); html.classList.toggle('menu-abierto', on);
    btn.setAttribute('aria-label', on ? 'Cerrar el menú' : 'Abrir el menú');
    btn.innerHTML = on ? '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18"/></svg>' : '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 8h16M4 16h16"/></svg>';
    if (on) { y = scrollY; document.body.style.cssText = `position:fixed;top:-${y}px;left:0;right:0`; }
    else { document.body.style.cssText = ''; scrollTo({ top: y, behavior: 'instant' }); }
  };
  btn.addEventListener('click', () => abrir(menu.hidden));
  menu.addEventListener('click', (e) => { const a = e.target.closest('[data-cerrar-menu]'); if (!a) return; e.preventDefault(); abrir(false); const d = $(a.getAttribute('href')); setTimeout(() => d?.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth' }), 30); });
  addEventListener('keydown', (e) => { if (e.key === 'Escape' && !menu.hidden) abrir(false); });
  matchMedia('(min-width: 1100px)').addEventListener('change', (m) => { if (m.matches && !menu.hidden) abrir(false); });
}

// =============== REVEAL + ARRASTRE ===============
function reveal() {
  const io = new IntersectionObserver((es) => es.forEach(e => { if (e.isIntersecting) { e.target.classList.add('visto'); io.unobserve(e.target); } }), { threshold: 0.18, rootMargin: '0px 0px -6% 0px' });
  $$('.rv').forEach((el) => {
    const hermanos = el.parentElement ? $$(':scope > .rv', el.parentElement) : [];
    el.style.setProperty('--d', `${Math.min(hermanos.indexOf(el), 5) * 85}ms`);
    io.observe(el);
  });
}
// carruseles: arrastre fluido con el mouse (con inercia); el dedo usa el scroll nativo
function arrastre(el) {
  let x0 = 0, s0 = 0, v = 0, last = 0, lastX = 0, mov = false, raf = 0, activo = false;
  el.addEventListener('pointerdown', (e) => {
    if (e.pointerType !== 'mouse' || e.button !== 0 || el.scrollWidth <= el.clientWidth + 2) return;
    if (e.target.closest('.stk, input, select, textarea')) return;
    activo = true; mov = false; x0 = lastX = e.clientX; s0 = el.scrollLeft; v = 0; last = performance.now();
    cancelAnimationFrame(raf); el.style.scrollSnapType = 'none'; el.style.cursor = 'grabbing';
  });
  addEventListener('pointermove', (e) => {
    if (!activo) return;
    const dx = e.clientX - x0; if (Math.abs(dx) > 4) mov = true;
    el.scrollLeft = s0 - dx;
    const t = performance.now(); v = (e.clientX - lastX) / Math.max(1, t - last); lastX = e.clientX; last = t;
  });
  addEventListener('pointerup', () => {
    if (!activo) return; activo = false; el.style.cursor = '';
    let vel = -v * 16;
    const glide = () => { el.scrollLeft += vel; vel *= 0.94; if (Math.abs(vel) > 0.5) raf = requestAnimationFrame(glide); else el.style.scrollSnapType = ''; };
    raf = requestAnimationFrame(glide);
  });
  el.addEventListener('click', (e) => { if (mov) { e.preventDefault(); e.stopPropagation(); mov = false; } }, true);
  el.addEventListener('dragstart', (e) => e.preventDefault());
}

// =============== HORARIOS / ABIERTO AHORA ===============
const NOMBRES = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
const hhmm = (s) => { const [h, m] = s.split(':').map(Number); return m ? `${h}:${String(m).padStart(2, '0')}` : String(h); };
function estado(config) {
  const tz = config.zonaHoraria;
  const now = ahoraEn(tz);
  const hoyFr = franjasHorario(config.horarios, now.fecha);
  const abierta = hoyFr.find(([a, b]) => now.min >= a && now.min < b);
  if (abierta) return { abierto: true, txt: `Abierto ahora · hasta las ${Math.floor(abierta[1] / 60)}` };
  const prox = hoyFr.find(([a]) => a > now.min);
  if (prox) return { abierto: false, txt: `Cerrado · abre hoy a las ${Math.floor(prox[0] / 60)}` };
  for (let i = 1; i <= 7; i++) {
    const f = fechaDeNum(now.dia + i), fr = franjasHorario(config.horarios, f);
    if (fr.length) return { abierto: false, txt: `${hoyFr.length ? 'Cerrado' : 'Hoy descansamos'} · ${i === 1 ? 'mañana' : `el ${NOMBRES[diaSemana(f)].toLowerCase()}`} a las ${Math.floor(fr[0][0] / 60)}` };
  }
  return { abierto: false, txt: 'Cerrado' };
}
function horarios(config) {
  const e = estado(config);
  $$('[data-estado]').forEach(el => {
    el.classList.toggle('abierto', e.abierto);
    el.textContent = el.closest('.hero') ? `${e.txt} · Melincué 3142` : `${e.txt}. Las tortas se encargan online las 24 h.`;
  });
  const hoy = diaSemana(ahoraEn(config.zonaHoraria).fecha);
  const orden = [1, 2, 3, 4, 5, 6, 0];
  $('[data-horarios]').innerHTML = orden.map(d => {
    const fr = config.horarios[DIAS[d]] || [];
    return `<li class="${d === hoy ? 'hoy' : ''}"><span>${NOMBRES[d]}${d === hoy ? ' · hoy' : ''}</span><span>${fr.length ? fr.map(([a, b]) => `${hhmm(a)} a ${hhmm(b)} h`).join(' y ') : 'Cerrado'}</span></li>`;
  }).join('');
}

// =============== ENCARGOS: catálogo + la caja ===============
function encargos(kit) {
  const { config, store, money } = kit;
  const grid = $('[data-tortas]'), caja = $('[data-caja]'), fondo = $('[data-caja-fondo]');
  const st = { filtro: 'todas', pag: 0, sel: null, variante: null, mac: false, fecha: kit.carrito.retiro.fecha || '', franja: kit.carrito.retiro.franja || '' };
  let tortas = [], categorias = [], productos = [];
  // días y franjas con las mismas reglas que el checkout del kit (horarios, anticipación de la sección, días cerrados)
  const opciones = () => opcionesRetiro({ horarios: config.horarios, encargo: config.pedidos?.encargo, tz: config.zonaHoraria, productos, categorias, lineas: st.sel ? [{ id: st.sel, cant: 1 }] : [] });
  const porPag = () => esDesk() ? 8 : matchMedia('(min-width: 768px)').matches ? 6 : 4;
  const lista = () => tortas.filter(p => st.filtro === 'todas' ? true : st.filtro === 'helada' ? (p.etiquetas || []).includes('helada') : p.categoria === st.filtro);

  function pintarGrid(animar = true) {
    const L = lista(), n = porPag(), pags = Math.max(1, Math.ceil(L.length / n));
    st.pag = Math.min(st.pag, pags - 1);
    grid.innerHTML = L.slice(st.pag * n, st.pag * n + n).map((p, i) => {
      const vs = (p.variantes || []).filter(v => v.precio != null);
      const corto = !matchMedia('(min-width: 768px)').matches;
      const precio = !vs.length ? 'Consultar' : corto ? (vs.length > 1 ? `desde ${money(precioDesde(p))}` : `${vs[0].nombre} · ${money(vs[0].precio)}`)
        : vs.map(v => `${v.nombre} ${money(v.precio)}`).join(' · ');
      return `<button type="button" class="torta${p.id === st.sel ? ' is-on' : ''}" data-torta="${esc(p.id)}" style="--i:${animar ? i : 0}" ${p.disponible === false ? 'disabled' : ''} aria-pressed="${p.id === st.sel}">
        <span class="torta__foto"><img src="${esc(kit.asset(p.foto))}" alt="" width="485" height="388" loading="lazy" decoding="async"></span>
        ${(p.etiquetas || []).includes('helada') ? '<span class="torta__tag">helada</span>' : ''}
        <span class="torta__n">${esc(p.nombre)}</span><span class="torta__p">${p.disponible === false ? 'No disponible por ahora' : precio}</span></button>`;
    }).join('');
    $('[data-pag-n]').textContent = `${st.pag + 1} / ${pags}`;
    $('[data-pager]').hidden = pags < 2;
    $$('[data-pag]').forEach(b => { const d = Number(b.dataset.pag); b.disabled = (d < 0 && st.pag === 0) || (d > 0 && st.pag >= pags - 1); });
    const d = Math.min(...tortas.map(precioDesde).filter(Number.isFinite));
    if (Number.isFinite(d)) $('[data-desde]').textContent = money(d);
  }

  function torta() { return tortas.find(p => p.id === st.sel); }
  function elegir(id, abrir) {
    if (st.sel !== id) { st.sel = id; st.variante = null; st.mac = false; }
    const p = torta(); if (!p) return;
    if ((p.variantes || []).length === 1) st.variante = p.variantes[0].id;
    pintarCaja(true);
    $$('.torta', grid).forEach(b => { const on = b.dataset.torta === id; b.classList.toggle('is-on', on); b.setAttribute('aria-pressed', on); });
    if (abrir && !esDesk()) abrirCaja(true);
  }

  let yLock = 0;
  function abrirCaja(on) {
    if (esDesk()) return;
    caja.classList.toggle('is-abierta', on); fondo.hidden = !on; html.classList.toggle('caja-abierta', on);
    if (on) { yLock = scrollY; document.body.style.cssText = `position:fixed;top:-${yLock}px;left:0;right:0`; setTimeout(() => $('[data-caja-cerrar]').focus({ preventScroll: true }), 300); }
    else if (document.body.style.position === 'fixed') { document.body.style.cssText = ''; scrollTo({ top: yLock, behavior: 'instant' }); }
  }
  fondo.addEventListener('click', () => abrirCaja(false));
  $('[data-caja-cerrar]').addEventListener('click', () => abrirCaja(false));
  addEventListener('keydown', (e) => { if (e.key === 'Escape' && caja.classList.contains('is-abierta')) abrirCaja(false); });
  matchMedia('(min-width: 1100px)').addEventListener('change', (m) => { if (m.matches) abrirCaja(false); pintarGrid(false); });

  function calc() {
    const p = torta(); if (!p || !st.variante) return null;
    const pl = precioLinea(p, { variante: st.variante, extras: st.mac ? ['macarons'] : [] });
    if (pl.precio == null) return null;
    const sena = Math.round(pl.precio * pctSena(p, categorias));
    return { total: pl.precio, sena, resto: pl.precio - sena, detalle: pl.detalle };
  }

  function pintarCaja(cae) {
    const p = torta();
    if (!p) return;
    $('[data-c-nombre]').textContent = p.nombre;
    $('[data-t-nombre]').textContent = p.nombre;
    $('[data-c-desc]').textContent = p.descripcion || '';
    const foto = $('[data-c-foto]');
    if (foto.getAttribute('src') !== kit.asset(p.foto)) foto.src = kit.asset(p.foto);
    if (cae) { const pl = $('[data-plato]'); pl.classList.remove('cae'); void pl.offsetWidth; pl.classList.add('cae'); }
    // tamaños
    const vs = (p.variantes || []).filter(v => v.precio != null);
    $('[data-c-tamanos]').innerHTML = vs.map(v => `<button type="button" class="tam" role="radio" aria-checked="${st.variante === v.id}" data-tam="${esc(v.id)}">${esc(v.nombre)} · ${money(v.precio)}</button>`).join('');
    $('[data-plato]').classList.toggle('t24', st.variante === '24' || (vs.length === 1));
    // macarons (si la torta los acepta)
    const mac = (p.adicionales || []).find(a => a.id === 'macarons');
    const extra = $('[data-c-extra]');
    extra.hidden = !mac;
    $('[data-c-mac]').checked = !!(mac && st.mac);
    if (mac) {
      const precios = mac.precios || {};
      $('[data-c-mac-precio]').textContent = st.variante && precios[st.variante] != null ? `+${money(precios[st.variante])}` : Object.values(precios).map(money).join(' / ');
    }
    $('.caja__vis').classList.toggle('con-mac', !!(mac && st.mac));
    // calendario y franjas
    pintarCal(); pintarFranjas();
    // cartelito
    $('[data-t-tam]').textContent = st.variante ? `${vs.find(v => v.id === st.variante)?.nombre || ''}${st.mac ? ' + macarons' : ''}` : 'elegí el tamaño';
    $('[data-t-fecha]').textContent = st.fecha ? `${fechaCorta(st.fecha)}${st.franja ? ` · ${franjaTxt()}` : ''}` : 'y la datita';
    const c = calc();
    $('[data-c-total]').textContent = c ? money(c.total) : '—';
    $('[data-c-sena]').textContent = c ? money(c.sena) : '—';
    $('[data-c-resto]').textContent = c ? money(c.resto) : '—';
    $('[data-paso="1"]').classList.toggle('hecho', !!st.variante);
    $('[data-paso="2"]').classList.toggle('hecho', !!(st.fecha && st.franja));
    $('[data-paso="3"]').classList.toggle('hecho', false);
    const msg = $('[data-c-msg]'); if (msg.dataset.fijo !== '1') msg.textContent = '';
  }

  function pintarCal() {
    const op = opciones();
    const dias = op.dias;
    if (!dias.length) { $('[data-cal]').innerHTML = ''; return; }
    const estado = (d) => d.abierto ? 'ok' : d.franjas.length ? 'pronto' : 'cerrado';
    if (st.fecha && !dias.some(d => d.fecha === st.fecha && d.abierto)) { st.fecha = ''; st.franja = ''; }
    const lunesOffset = (dias[0].dow + 6) % 7;
    const filas = Math.min(4, Math.ceil((lunesOffset + dias.length) / 7));
    const prim = dias.find(d => d.abierto)?.fecha;
    const dd = Math.round((op.horas || 0) / 24);
    $('[data-c-primero]').textContent = prim ? `Desde el ${fechaCorta(prim)}${dd ? ` (necesitamos ${dd} días)` : ''}` : '';
    const meses = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'];
    const vis = dias.slice(0, filas * 7 - lunesOffset);
    const m1 = Number(vis[0].fecha.slice(5, 7)), m2 = Number(vis[vis.length - 1].fecha.slice(5, 7));
    let h = `<span class="cal__mes">${meses[m1 - 1]}${m2 !== m1 ? ` · ${meses[m2 - 1]}` : ''}</span>` + ['L', 'M', 'M', 'J', 'V', 'S', 'D'].map(d => `<span class="cal__dow" aria-hidden="true">${d}</span>`).join('');
    for (let i = 0; i < lunesOffset; i++) h += '<span class="cal__d cal__d--pasado" aria-hidden="true"></span>';
    vis.forEach(d => {
      const n = Number(d.fecha.slice(8, 10)), on = st.fecha === d.fecha, e = estado(d);
      const tit = e === 'cerrado' ? 'Cerrado' : e === 'pronto' ? `Necesitamos ${dd || 'unos'} días para prepararla` : `Retirar el ${fechaCorta(d.fecha)}`;
      h += `<button type="button" class="cal__d cal__d--${e}" data-dia="${d.fecha}" ${e === 'ok' ? '' : 'disabled'} aria-pressed="${on}" aria-label="${esc(tit)}" title="${esc(tit)}">${n}</button>`;
    });
    $('[data-cal]').innerHTML = h;
  }
  function pintarFranjas() {
    const op = opciones();
    const dia = op.dias.find(d => d.fecha === st.fecha) || op.dias.find(d => d.abierto);
    const fr = dia ? dia.franjas : [];
    if (st.franja && !fr.some(f => f.id === st.franja && f.disponible)) st.franja = '';
    $('[data-c-franjas]').innerHTML = fr.map(f => `<button type="button" class="franja" role="radio" data-franja="${esc(f.id)}" aria-checked="${st.franja === f.id}" ${st.fecha && f.disponible ? '' : 'disabled'} title="${esc(f.nombre)}">${hs(f.desde)} a ${hs(f.hasta)} h</button>`).join('');
  }
  const franjaTxt = () => { const d = opciones().dias.find(x => x.fecha === st.fecha); const f = d?.franjas.find(x => x.id === st.franja); return f ? `${hs(f.desde)} a ${hs(f.hasta)} h` : ''; };

  caja.addEventListener('click', (e) => {
    const t = e.target.closest('[data-tam]'); if (t) { st.variante = t.dataset.tam; pintarCaja(); escribe(); return; }
    const d = e.target.closest('[data-dia]'); if (d && !d.disabled) { st.fecha = d.dataset.dia; pintarCaja(); escribe(); return; }
    const f = e.target.closest('[data-franja]'); if (f && !f.disabled) { st.franja = f.dataset.franja; pintarCaja(); escribe(); return; }
    if (e.target.closest('[data-c-sumar]')) sumar(e.target.closest('[data-c-sumar]'));
  });
  $('[data-c-mac]').addEventListener('change', (e) => { st.mac = e.target.checked; pintarCaja(); escribe(); });
  function escribe() { const c = $('.cartelito'); c.classList.remove('escribe'); void c.offsetWidth; c.classList.add('escribe'); }

  function error(txt) { const m = $('[data-c-msg]'); m.textContent = txt; m.classList.remove('shake'); void m.offsetWidth; m.classList.add('shake'); }
  function sumar(btn) {
    const p = torta(); if (!p) return error('Elegí una torta del catálogo.');
    if (!st.variante) return error('Elegí el tamaño.');
    if (!st.fecha) return error('Elegí la datita de retiro.');
    if (!st.franja) return error('Elegí el horario de retiro.');
    kit.carrito.setRetiro({ fecha: st.fecha, franja: st.franja });
    kit.carrito.agregar(p.id, 1, { variante: st.variante, extras: st.mac ? ['macarons'] : [], origen: btn });
    $('[data-paso="3"]').classList.add('hecho');
    mmm(btn);
    setTimeout(() => { abrirCaja(false); setTimeout(() => kit.carrito.abrir(), esDesk() ? 0 : 380); }, 650);
  }

  grid.addEventListener('click', (e) => { const b = e.target.closest('[data-torta]'); if (b) elegir(b.dataset.torta, true); });
  $('[data-filtros]').addEventListener('click', (e) => {
    const b = e.target.closest('[data-filtro]'); if (!b) return;
    st.filtro = b.dataset.filtro; st.pag = 0;
    $$('[data-filtro]').forEach(x => { const on = x === b; x.classList.toggle('is-on', on); x.setAttribute('aria-pressed', on); });
    pintarGrid();
  });
  $('[data-pager]').addEventListener('click', (e) => {
    const b = e.target.closest('[data-pag]'); if (!b || b.disabled) return;
    st.pag += Number(b.dataset.pag); pintarGrid();
    const top = $('#encargos .enc').getBoundingClientRect().top;
    if (top < 0) scrollBy({ top: top - 90, behavior: reduce ? 'auto' : 'smooth' });
  });
  addEventListener('resize', (() => { let w = innerWidth, t; return () => { clearTimeout(t); t = setTimeout(() => { if (Math.abs(innerWidth - w) > 40) { w = innerWidth; pintarGrid(false); } }, 200); }; })());

  async function cargar() {
    [productos, categorias] = await Promise.all([store.getProductos(), store.getCategorias()]);
    tortas = productos.filter(p => ENCARGO.includes(p.categoria));
    pintarGrid(false);
    if (!st.sel) { st.sel = (tortas.find(p => p.id === 't-marquise-pistacho') || tortas[0])?.id; }
    pintarCaja();
    $$('.torta', grid).forEach(b => b.classList.toggle('is-on', b.dataset.torta === st.sel));
  }
  store.onChange(cargar);
  return cargar();
}

// "mmm" que salta al sumar algo
function mmm(desde) {
  if (reduce || !desde) return;
  const r = desde.getBoundingClientRect();
  const s = document.createElement('span');
  s.className = 'sticker'; s.textContent = 'mmm'; s.setAttribute('aria-hidden', 'true');
  Object.assign(s.style, { position: 'fixed', left: `${r.left + r.width / 2 - 34}px`, top: `${r.top - 10}px`, zIndex: 9500, pointerEvents: 'none', transition: 'transform .7s cubic-bezier(.34,1.56,.64,1), opacity .7s', transform: 'scale(.3) rotate(-14deg)', opacity: '0' });
  document.body.appendChild(s);
  requestAnimationFrame(() => { s.style.transform = 'translateY(-46px) scale(1) rotate(-8deg)'; s.style.opacity = '1'; });
  setTimeout(() => { s.style.opacity = '0'; s.style.transform = 'translateY(-80px) scale(.9) rotate(-4deg)'; }, 620);
  setTimeout(() => s.remove(), 1400);
}

// =============== EN EL LOCAL HOY (carta del kit como vidriera) ===============
const FOTO_CAT = {
  especiales: 'img/fotos/026-720.webp', alfajores: 'img/fotos/042-720.webp', cuadrados: 'img/fotos/034-720.webp', cookies: 'img/fotos/047-720.webp',
  crumbl: 'img/fotos/037-720.webp', porciones: 'img/fotos/061-720.webp', 'porciones-cc': 'img/tortas/cc-new-york.webp', 'porciones-tartas': 'img/tortas/banoffee.webp',
  salado: 'img/fotos/035-720.webp', 'sin-tacc': 'img/macaron.webp',
};
function local(kit) {
  const cont = $('#carta-local');
  const foto = $('[data-local-foto]');
  const activa = () => $('.kit-tab.is-on', cont);
  function ponerFoto() {
    const t = activa(); if (!t) return;
    const src = FOTO_CAT[t.dataset.cat] || 'img/fotos/017-720.webp';
    if (foto.getAttribute('src') === src) return;
    foto.classList.add('cambiando');
    setTimeout(() => { foto.src = src; foto.style.objectFit = src.includes('macaron') ? 'contain' : 'cover'; foto.style.background = src.includes('macaron') ? 'var(--chicle)' : ''; foto.style.padding = src.includes('macaron') ? '22%' : ''; foto.classList.remove('cambiando'); }, 220);
  }
  function decorar() {
    $$('.kit-carta__panel', cont).forEach(panel => {
      if ($('.panel__head', panel)) return;
      const id = panel.getAttribute('aria-labelledby'); const tab = id && document.getElementById(id);
      const items = $$('.kit-item', panel);
      panel.insertAdjacentHTML('afterbegin', `<div class="panel__head"><h3 class="panel__t">${esc(tab?.textContent || '')}</h3><span class="panel__n">${items.length} ${items.length === 1 ? 'opción' : 'opciones'}</span></div>`);
      const largo = items.some(it => ($('.it__d', it)?.textContent || '').length > 95);
      panel.classList.toggle('dos-col', items.length >= 4 && !largo);
    });
    ponerFoto();
  }
  document.addEventListener('kit:carta', (e) => { if (e.detail.el === cont) decorar(); });
  if ($('.kit-carta__panel', cont)) decorar();
  cont.addEventListener('click', (e) => { if (e.target.closest('.kit-tab')) setTimeout(() => { ponerFoto(); centrarTab(); }, 0); });
  function centrarTab() { const t = activa(); const bar = t?.parentElement; if (t && bar && bar.scrollWidth > bar.clientWidth) bar.scrollTo({ left: t.offsetLeft - bar.clientWidth / 2 + t.clientWidth / 2, behavior: reduce ? 'auto' : 'smooth' }); }
  $('[data-local-pager]').addEventListener('click', (e) => {
    const b = e.target.closest('[data-local-mover]'); if (!b) return;
    const tabs = $$('.kit-tab', cont), i = tabs.indexOf(activa());
    const n = tabs[(i + Number(b.dataset.localMover) + tabs.length) % tabs.length]; if (!n) return;
    n.click();
    const top = cont.getBoundingClientRect().top;
    if (top < 0 || top > innerHeight * 0.6) scrollBy({ top: top - (esDesk() ? 110 : 70), behavior: reduce ? 'auto' : 'smooth' });
  });
}
const plantillaLocal = (p, ctx) => `
  <h4 class="it__n">${esc(p.nombre)}</h4>
  ${p.disponible === false ? '<span class="it__off">Se terminó</span>' : `<span class="it__p">${ctx.money(p.precio) ?? 'Consultar'}</span>`}
  ${p.descripcion ? `<p class="it__d">${esc(p.descripcion)}</p>` : ''}`;

// =============== TIENDA ===============
const ICONOS = {
  cafe: '<path d="M18 12h12l4 8v28a4 4 0 0 1-4 4H18a4 4 0 0 1-4-4V20Z"/><path d="M14 20h20M20 32c2-3 6-3 8 0"/>',
  remera: '<path d="M18 10l-10 6 4 9 5-2v27h22V23l5 2 4-9-10-6c-1 4-5 6-10 6s-9-2-10-6Z"/>',
  tote: '<path d="M10 20h28v28H10Z"/><path d="M17 20v-4a7 7 0 0 1 14 0v4"/><path d="M16 32h16M16 38h10"/>',
  gorra: '<path d="M8 32a16 16 0 0 1 32 0Z"/><path d="M8 32h34c3 0 4 3 2 4l-6 2H8Z"/><path d="M24 16v-3"/>',
  taza: '<path d="M10 16h24v20a8 8 0 0 1-8 8h-8a8 8 0 0 1-8-8Z"/><path d="M34 21h4a5 5 0 0 1 0 10h-4"/><path d="M18 8c-2 2 2 4 0 6M26 8c-2 2 2 4 0 6"/>',
  panuelo: '<path d="M8 12h32L24 44Z"/><path d="M14 18h20M18 26h12"/>',
};
const GRUPOS = [
  { key: 'cafe', ids: ['cafe-kenya-molido', 'cafe-kenya-grano'], ops: ['Molido', 'En grano'], nombre: 'Café Kenya 250 g', icono: 'cafe', tono: 'salvia' },
  { key: 'remera', ids: ['remera-rosa', 'remera-verde', 'remera-crudo'], colores: ['#E694A5', '#7B9A74', '#EFE4D0'], ops: ['Rosa', 'Verde', 'Cruda'], nombre: 'Remera MILA', icono: 'remera', tono: 'rosa' },
  { key: 'tote', ids: ['tote'], icono: 'tote', tono: 'salvia' },
  { key: 'gorra', ids: ['gorra'], icono: 'gorra', tono: 'rosa' },
  { key: 'tazas', ids: ['tazas'], icono: 'taza', tono: 'salvia' },
  { key: 'panuelos', ids: ['panuelos'], icono: 'panuelo', tono: 'rosa' },
];
function tienda(kit) {
  const cont = $('[data-tienda]');
  const elegido = {};
  let prods = [];
  function pintar() {
    cont.innerHTML = GRUPOS.map(g => {
      const items = g.ids.map(id => prods.find(p => p.id === id)).filter(Boolean);
      if (!items.length) return '';
      const sel = items.find(p => p.id === elegido[g.key]) || items[0];
      const ops = g.ids.length > 1 ? `<div class="prod__ops" role="group" aria-label="Opciones">${items.map((p, i) => g.colores
        ? `<button type="button" class="sw" style="background:${g.colores[g.ids.indexOf(p.id)]}" data-op="${g.key}" data-id="${p.id}" aria-pressed="${p.id === sel.id}" aria-label="${esc(g.ops[g.ids.indexOf(p.id)])}"></button>`
        : `<button type="button" class="op" data-op="${g.key}" data-id="${p.id}" aria-pressed="${p.id === sel.id}">${esc(g.ops[g.ids.indexOf(p.id)])}</button>`).join('')}</div>` : '<div class="prod__ops"></div>';
      return `<article class="prod rv visto">
        <div class="prod__ph prod__ph--${g.tono}"><svg viewBox="0 0 48 56" aria-hidden="true">${ICONOS[g.icono]}</svg><span>Foto pendiente</span></div>
        <h3 class="prod__n">${esc(g.nombre || sel.nombre)}</h3>
        ${sel.descripcion ? `<p class="prod__d">${esc(sel.descripcion)}</p>` : ''}
        ${ops}
        <div class="prod__pie"><span class="prod__p">${sel.disponible === false ? 'Sin stock' : kit.money(sel.precio)}</span>${sel.disponible === false ? '' : `<div data-kit-qty="${esc(sel.id)}"></div>`}</div>
      </article>`;
    }).join('');
    kit.carrito.sync(cont);
    const st = prods.find(p => p.id === 'stickers');
    if (st) { $('[data-plancha-precio]').textContent = kit.money(st.precio); kit.carrito.sync($('[data-plancha]')); }
  }
  cont.addEventListener('click', (e) => { const o = e.target.closest('[data-op]'); if (!o) return; elegido[o.dataset.op] = o.dataset.id; pintar(); });
  async function cargar() { prods = await kit.store.getProductos(); pintar(); }
  kit.store.onChange(cargar);
  return cargar();
}

// =============== PLANCHA DE STICKERS (despegar y soltar en la cajita) ===============
function stickers(kit) {
  const destinos = () => [...$$('.cajita-btn'), ...$$('.kit-fab:not([hidden])'), $('.plancha__pie')].filter(Boolean);
  const sobre = (x, y) => destinos().find(d => { const r = d.getBoundingClientRect(); return r.width && x >= r.left - 20 && x <= r.right + 20 && y >= r.top - 20 && y <= r.bottom + 20; });
  function volarA(stk, destino) {
    const a = stk.getBoundingClientRect(), b = (destino || $('.cajita-btn')).getBoundingClientRect();
    const actual = new DOMMatrix(getComputedStyle(stk).transform);
    stk.classList.add('vuela');
    stk.style.transform = `translate(${actual.m41 + b.left + b.width / 2 - (a.left + a.width / 2)}px, ${actual.m42 + b.top + b.height / 2 - (a.top + a.height / 2)}px)`;
    kit.carrito.agregar('stickers', 1, {});
    mmm(destino || $('.cajita-btn'));
    setTimeout(() => { stk.classList.remove('vuela', 'levantado'); stk.style.transform = ''; stk.animate([{ scale: 0 }, { scale: 1 }], { duration: 420, easing: 'cubic-bezier(.34,1.56,.64,1)' }); }, 700);
  }
  $$('.stk').forEach(stk => {
    let x0, y0, drag = false, id = null;
    stk.addEventListener('pointerdown', (e) => { if (e.button) return; id = e.pointerId; x0 = e.clientX; y0 = e.clientY; drag = false; stk.setPointerCapture(id); stk.classList.add('levantado'); });
    stk.addEventListener('pointermove', (e) => {
      if (e.pointerId !== id) return;
      const dx = e.clientX - x0, dy = e.clientY - y0;
      if (!drag && Math.hypot(dx, dy) > 6) drag = true;
      if (drag) stk.style.transform = `translate(${dx}px, ${dy}px)`;
    });
    const fin = (e) => {
      if (e.pointerId !== id) return; id = null;
      if (!drag) { stk.classList.remove('levantado'); return; }      // un toque/clic se resuelve en "click"
      const d = sobre(e.clientX, e.clientY);
      if (d) volarA(stk, d);
      else { stk.classList.add('vuelve'); stk.classList.remove('levantado'); stk.style.transform = ''; setTimeout(() => stk.classList.remove('vuelve'), 380); }
      setTimeout(() => { drag = false; }, 0);
    };
    stk.addEventListener('pointerup', fin); stk.addEventListener('pointercancel', fin);
    stk.addEventListener('click', (e) => { if (drag) return; e.preventDefault(); stk.classList.add('levantado'); requestAnimationFrame(() => volarA(stk, $$('.cajita-btn')[0])); });
  });
}

// =============== CAJITA (contador en la barra) ===============
function contador(kit) {
  const n = $('[data-cajita-n]'), btn = $('.cajita-btn');
  const pinta = (bump) => {
    const c = kit.carrito.calc(); const t = c.items.reduce((s, i) => s + i.cant, 0);
    n.textContent = t; btn.setAttribute('aria-label', `Abrir tu cajita (${t})`);
    if (bump) { btn.classList.remove('bump'); void btn.offsetWidth; btn.classList.add('bump'); }
  };
  document.addEventListener('kit:carrito', (e) => pinta(e.detail?.delta > 0));
  kit.carrito.listo.then(() => pinta(false));
}

// =============== ARRANQUE ===============
function balaustrada() {
  const g = $('[data-balaustres]'); if (!g) return;
  let h = ''; for (let x = 24; x < 1200; x += 40) h += `<path d="M${x - 5} 6h10v5c7 5 8 14 2 21c6 6 5 13-2 17v5h-10v-5c-7-4-8-11-2-17c-6-7-5-16 2-21z"/>`;
  g.innerHTML = h;
}
function links() {
  $$('[data-wa]').forEach(a => { a.href = wa('Hola MILA! Te escribo desde la web.'); });
  $$('[data-wa-boxes]').forEach(a => { a.href = wa('Hola MILA! ¿Me avisan cuando salgan los boxes de la próxima fecha especial?'); });
}

barra(); links(); balaustrada();
$$('[data-arrastre], .prods, .chips, .vidriera').forEach(arrastre);
const arranque = intro();
let kit;
try {
  kit = await initKit({
    config: 'cliente.json',
    carrito: { label: 'Tu cajita' },
    cartas: { 'carta-local': { template: plantillaLocal, pedir: false } },
    badgeTexto: 'Probá el panel de Cami',
  });
  horarios(kit.config);
  setInterval(() => horarios(kit.config), 60_000);
  local(kit);
  await Promise.all([encargos(kit), tienda(kit)]);
  stickers(kit);
  contador(kit);
} catch (err) {
  console.error('[mila]', err);
}
reveal();
await arranque;
