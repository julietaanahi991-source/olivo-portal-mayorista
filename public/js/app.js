// OLIVO SIGNATURE — APLICACIÓN PRINCIPAL REACTIVA FULL-STACK
// Portal B2B Distribuidora Olivo Chile — Región de Valparaíso (V Región)

(function() {
  'use strict';

  // =========================================================================
  // ESTADO GLOBAL DE LA APLICACIÓN
  // =========================================================================
  const state = {
    currentView: 'landing', // 'landing', 'catalog', 'checkout', 'confirmation'
    products: [...INITIAL_PRODUCTS],
    categories: [...INITIAL_CATEGORIES],
    cart: [],
    filter: {
      search: '',
      categoryId: 'all',
      subcategoryId: 'all',
      collectionId: 'all',
      sortBy: 'featured'
    },
    lastSubmittedQuote: null,
    selectedProductModal: null,
    isCartDrawerOpen: false,
    currentSlide: 0,
    slideInterval: null,
    heroPausado: false,
    catalogY: 0,          // posición del catálogo para volver al mismo lugar
    filtrosAbiertos: false
  };

  // Preferencia de movimiento reducido: sin animaciones de scroll ni carrusel automático
  const REDUCE = !!(window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches);
  function iconos() { if (window.lucide) window.lucide.createIcons(); }

  // Cargar carrito previo de localStorage si existe
  try {
    const savedCart = localStorage.getItem('olivo_cart');
    if (savedCart) state.cart = JSON.parse(savedCart);
    // Limpia el historial de cotizaciones que guardaba la versión con backoffice
    localStorage.removeItem('olivo_quotes');
  } catch(e) {
    console.warn("Storage sync fallback:", e);
  }

  function saveState() {
    try {
      localStorage.setItem('olivo_cart', JSON.stringify(state.cart));
    } catch(e) {}
  }

  // =========================================================================
  // UTILIDADES Y HELPERS
  // =========================================================================
  // Las fotos propias (cuadradas, fondo blanco) se muestran completas; las de referencia rellenan el recuadro.
  function imgFit(src) {
    return /^images\/products\//.test(src || '') ? 'object-contain bg-white' : 'object-cover';
  }

  function escapeHtml(s) {
    return String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  }

  // Texto sin tildes ni mayúsculas, para buscar «camaron» y encontrar «Camarón»
  function norm(s) {
    return String(s || '').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');
  }
  function textoProducto(p) {
    return norm(`${p.name} ${p.brand} ${p.sku} ${p.format}`);
  }

  // Foto del producto o, si aún no llega, un recuadro «Foto pendiente»
  function fotoProducto(p, cls, chica = false) {
    if (p && p.image) return `<img src="${p.image}" alt="${chica ? '' : escapeHtml(p.name)}" class="${cls} ${imgFit(p.image)}" loading="lazy" decoding="async" width="400" height="400" />`;
    return `<span class="${cls} flex flex-col items-center justify-center gap-2 text-[#A9B8B0]" style="background: linear-gradient(160deg, #F2F5F3 0%, #E9F5EC 100%)" ${chica ? 'aria-hidden="true"' : ''}>
      <svg aria-hidden="true" width="${chica ? 24 : 56}" height="${chica ? 24 : 56}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.2"><path d="M21 8 12 3 3 8v8l9 5 9-5z"></path><path d="m3 8 9 5 9-5M12 13v8"></path></svg>
      ${chica ? '' : '<span class="text-[11px] text-[#626D76]">Foto pendiente</span>'}</span>`;
  }

  // Formato pendiente de confirmar por Olivo: se dice tal cual, sin inventar
  function formatoTexto(p) {
    return p.format ? escapeHtml(p.format) : '<span class="text-[#626D76]">Por confirmar con tu asesor comercial</span>';
  }

  // La lista guardada de una versión anterior puede traer ids viejos (prod-001): se pasan al SKU
  state.cart = state.cart.map(i => {
    const p = state.products.find(x => x.id === i.productId || x.sku === i.sku);
    return p ? Object.assign({}, i, { productId: p.id, sku: p.sku, name: p.name, brand: p.brand, format: p.format, image: p.image }) : null;
  }).filter(Boolean);

  function formatDate(isoString) {
    try {
      const d = new Date(isoString);
      return d.toLocaleDateString('es-CL', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
    } catch(e) {
      return isoString;
    }
  }

  // Aviso breve. Uno a la vez (no se apilan ni empujan a otros); en celular aparece arriba, bajo el encabezado.
  function showToast(message, type = 'success') {
    const container = document.getElementById('toastContainer');
    if (!container) return;
    container.querySelectorAll('[data-toast]').forEach(t => t.remove());
    const error = type === 'error';
    const toast = document.createElement('div');
    toast.setAttribute('data-toast', '');
    toast.className = `flex items-center gap-2.5 px-4 py-2.5 rounded-xl shadow-xl text-white text-[13.5px] font-semibold leading-snug transition duration-200 opacity-0 translate-y-1 ${error ? 'bg-[#8E1B1B]' : 'bg-[#17472C] border border-[#CF1427]/60'}`;
    toast.innerHTML = `<svg aria-hidden="true" class="flex-none" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#7BD192" stroke-width="2.4"><circle cx="12" cy="12" r="10"></circle>${error ? '<path d="M12 7v6M12 16.5v.5"></path>' : '<path d="m8 12.5 2.7 2.7L16 9.5"></path>'}</svg><span class="min-w-0">${message}</span>`;
    container.appendChild(toast);
    requestAnimationFrame(() => toast.classList.remove('opacity-0', 'translate-y-1'));
    setTimeout(() => {
      toast.classList.add('opacity-0');
      setTimeout(() => toast.remove(), 250);
    }, error ? 5000 : 2400);
  }

  // =========================================================================
  // GESTIÓN DEL CARRITO DE COTIZACIÓN
  // =========================================================================
  function addToCart(productId, quantity = 1, notes = '') {
    const product = state.products.find(p => p.id === productId);
    if (!product) return;

    const existingIndex = state.cart.findIndex(item => item.productId === productId);
    if (existingIndex > -1) {
      state.cart[existingIndex].quantity += quantity;
      if (notes) state.cart[existingIndex].notes = notes;
    } else {
      state.cart.push({
        productId: product.id,
        sku: product.sku,
        name: product.name,
        brand: product.brand,
        format: product.format,
        unit: product.unit,
        image: product.image,
        categoryName: product.categoryName,
        quantity: Math.max(1, quantity),
        notes: notes
      });
    }

    saveState();
    updateCartUI();
    showToast(`Agregado a tu lista: ${quantity} × ${product.name}`);
  }

  function updateCartItemQty(productId, delta) {
    const item = state.cart.find(i => i.productId === productId);
    if (!item) return;
    item.quantity = Math.max(1, item.quantity + delta);
    saveState();
    updateCartUI();
  }

  function setCartItemQty(productId, qty) {
    const item = state.cart.find(i => i.productId === productId);
    if (!item) return;
    item.quantity = Math.max(1, parseInt(qty) || 1);
    saveState();
    updateCartUI();
  }

  function removeCartItem(productId) {
    state.cart = state.cart.filter(i => i.productId !== productId);
    saveState();
    updateCartUI();
    showToast("Producto eliminado de la cotización", "info");
  }

  function clearCart() {
    state.cart = [];
    saveState();
    updateCartUI();
  }

  function updateCartUI() {
    const count = state.cart.reduce((sum, item) => sum + item.quantity, 0);
    document.querySelectorAll('.cart-count-badge').forEach(b => {
      b.textContent = count;
      b.hidden = count === 0;
    });
    const btnLista = document.getElementById('headerListButton');
    if (btnLista) btnLista.setAttribute('aria-label', state.cart.length ? `Ver mi lista de cotización (${state.cart.length} ${state.cart.length === 1 ? 'producto' : 'productos'})` : 'Ver mi lista de cotización');

    renderCartDrawer();
    actualizarBarraCotizacion();
    if (state.currentView === 'catalog') {
      pintarBotonesAgregar();
      actualizarBarraCatalogo();
    } else if (state.currentView === 'checkout') {
      actualizarCheckout();
    }
  }

  // Barra inferior (celular): «Revisar cotización» en portada y catálogo; «Continuar con mis datos» en el paso 1
  function actualizarBarraCotizacion() {
    const bar = document.getElementById('quoteBar');
    if (!bar) return;
    const n = state.cart.length;
    const unidades = state.cart.reduce((s, i) => s + i.quantity, 0);
    const v = state.currentView;
    let visible = false, texto = 'Revisar cotización', sub = 'en tu lista de cotización', accion = () => setView('checkout');
    if (n > 0 && (v === 'landing' || v === 'catalog')) visible = true;
    if (n > 0 && v === 'checkout' && (state.checkoutStep || 1) === 1) {
      visible = true; texto = 'Continuar con mis datos'; accion = () => goCheckoutStep(2);
      sub = `${unidades} ${unidades === 1 ? 'unidad' : 'unidades'} · bajo cotización`;
    }
    const count = document.getElementById('quoteBarCount');
    const subEl = document.getElementById('quoteBarSub');
    const btn = document.getElementById('quoteBarButton');
    if (count) count.textContent = `${n} ${n === 1 ? 'producto' : 'productos'}`;
    if (subEl) subEl.textContent = sub;
    if (btn) { btn.textContent = texto; btn.onclick = accion; btn.tabIndex = visible ? 0 : -1; }
    bar.dataset.visible = String(visible);
    bar.setAttribute('aria-hidden', String(!visible));
    document.body.classList.toggle('con-barra', visible);
  }

  // =========================================================================
  // CONTROLADOR DE BANNERS AUTOMÁTICOS (HERO CAROUSEL)
  // =========================================================================
  // Avanza solo cada 6 s, salvo que la persona lo pause o tenga activado «reducir movimiento» (WCAG 2.2.2)
  function initHeroSlider() {
    stopHeroSlider();
    if (REDUCE || state.heroPausado) return;
    state.slideInterval = setInterval(() => {
      nextHeroSlide();
    }, 6000);
  }

  function toggleHeroPausa() {
    state.heroPausado = !state.heroPausado;
    if (state.heroPausado) stopHeroSlider(); else initHeroSlider();
    const b = document.getElementById('heroPausa');
    if (b) {
      b.setAttribute('aria-label', state.heroPausado ? 'Reanudar el carrusel' : 'Pausar el carrusel');
      b.innerHTML = state.heroPausado ? ICON_PLAY : ICON_PAUSE;
    }
  }

  function stopHeroSlider() {
    if (state.slideInterval) {
      clearInterval(state.slideInterval);
      state.slideInterval = null;
    }
  }

  function setHeroSlide(index) {
    state.currentSlide = index;
    const slides = document.querySelectorAll('.hero-slide');
    const dots = document.querySelectorAll('.slider-dot');
    
    slides.forEach((slide, idx) => {
      if (idx === index) {
        slide.classList.add('active');
      } else {
        slide.classList.remove('active');
      }
    });

    // Banner de fondo claro: los puntos del carrusel pasan a verde para que se vean
    const cont = document.querySelector('.hero-slider-container');
    if (cont) cont.dataset.tono = slides[index]?.dataset.tono || 'oscuro';

    dots.forEach((dot, idx) => {
      if (idx === index) {
        dot.classList.add('active');
      } else {
        dot.classList.remove('active');
      }
    });
  }

  function nextHeroSlide() {
    const nextIdx = (state.currentSlide + 1) % 2;
    setHeroSlide(nextIdx);
  }

  // =========================================================================
  // ENRUTAMIENTO Y VISTAS
  // =========================================================================
  function setView(viewName, params = {}) {
    const anterior = state.currentView;
    const mainEl = document.getElementById('appContent');
    const primeraVez = mainEl && mainEl.classList.contains('app-loading');
    // Al salir del catálogo se guarda la posición para volver al mismo producto
    if (anterior === 'catalog' && viewName !== 'catalog' && !primeraVez) state.catalogY = window.scrollY;
    if (viewName === 'checkout' && anterior !== 'checkout') state.checkoutStep = 1;
    if (state.filtrosAbiertos) cerrarFiltros(false);
    document.body.classList.remove('teclado');   // el campo enfocado desaparece con la vista anterior
    state.currentView = viewName;
    if (anterior === 'confirmation' && viewName !== 'confirmation' && window.location.hash === '#gracias') {
      try { history.replaceState(null, '', window.location.pathname + window.location.search); } catch (e) {}
    }
    let destinoY = 0;

    // Actualizar nav active states
    document.querySelectorAll('.nav-link').forEach(link => {
      if (link.dataset.view === viewName) {
        link.classList.add('text-[#17472C]', 'font-bold', 'border-b-2', 'border-[#CF1427]');
        link.classList.remove('text-[#56616A]');
      } else {
        link.classList.remove('text-[#17472C]', 'font-bold', 'border-b-2', 'border-[#CF1427]');
        link.classList.add('text-[#56616A]');
      }
    });

    const mainContainer = document.getElementById('appContent');
    if (!mainContainer) return;

    if (viewName === 'landing') {
      state.currentSlide = 0;
      renderLandingView(mainContainer);
      initHeroSlider();
    } else {
      stopHeroSlider();
      if (viewName === 'catalog') {
        if (params.category && params.category !== state.filter.categoryId) {
          state.filter.categoryId = params.category;
          state.filter.subcategoryId = params.subcategory || 'all';
        } else if (params.category) {
          state.filter.categoryId = params.category;
          if (params.subcategory) state.filter.subcategoryId = params.subcategory;
        } else if (!state.filter.categoryId || state.filter.categoryId === 'all') {
          state.filter.categoryId = state.categories[0]?.id || 'alimentos';
          state.filter.subcategoryId = 'all';
        }
        if (params.collection) state.filter.collectionId = params.collection;
        if (params.search !== undefined) state.filter.search = params.search;
        renderCatalogView(mainContainer);
        // Volver desde la solicitud o la lista: misma posición. Cambiar de línea o buscar: arriba.
        if (anterior !== 'catalog' && !params.category && params.search === undefined) destinoY = state.catalogY || 0;
        state.catalogY = 0;
      } else if (viewName === 'checkout') {
        renderCheckoutView(mainContainer);
      } else if (viewName === 'confirmation') {
        renderConfirmationView(mainContainer);
      }
    }

    mainContainer.classList.remove('app-loading');
    iconos();
    actualizarBarraCotizacion();
    // Sin animación: el contenido nuevo aparece ya en su lugar (antes se animaba el scroll sobre la vista nueva)
    window.scrollTo(0, destinoY);
    if (!primeraVez && anterior !== viewName) mainContainer.focus({ preventScroll: true });
  }

  // Lleva a una sección de la portada. Desde otra vista el salto es inmediato; en la misma portada, suave
  // (salvo «reducir movimiento»).
  function irASeccion(id, block = 'start') {
    const mismaVista = state.currentView === 'landing';
    if (!mismaVista) setView('landing');
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: mismaVista && !REDUCE ? 'smooth' : 'auto', block });
  }

  function scrollToContact() { irASeccion('contacto-section'); }

  // =========================================================================
  // VISTA 1: PORTADA v2 (propuesta UX aprobada en Claude Design)
  // =========================================================================
  const ICON_ARROW = '<svg class="cat-arrow" aria-hidden="true" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><path d="M5 12h14M12 5l7 7-7 7"></path></svg>';
  const ICON_PIN = '<svg aria-hidden="true" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#7BD192" stroke-width="2"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>';
  const ICON_PAUSE = '<svg aria-hidden="true" width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><rect x="6" y="5" width="4" height="14" rx="1"></rect><rect x="14" y="5" width="4" height="14" rx="1"></rect></svg>';
  const ICON_PLAY = '<svg aria-hidden="true" width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M7 5v14l12-7z"></path></svg>';
  // Líneas que la portada ya presenta como «Nueva línea»: se destacan también en el acceso rápido
  const LINEAS_NUEVAS = ['proteinas', 'servilletas'];
  // Foto de categoría en WebP (480/800 px y más para las tarjetas anchas) con JPG de respaldo
  function fotoCategoria(id, pos, sizes, extra = '') {
    return `<picture><source type="image/webp" srcset="images/cat-${id}-480.webp 480w, images/cat-${id}-800.webp 800w${extra}" sizes="${sizes}"><img src="images/cat-${id}.jpg" alt="" class="absolute inset-0 w-full h-full object-cover" style="object-position: ${pos}" loading="lazy" decoding="async" /></picture>`;
  }
  const ICON_DOC = '<svg aria-hidden="true" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><path d="M14 3H6a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z"></path><path d="M14 3v6h6M8 13h8M8 17h5"></path></svg>';
  // Logística Olivo SpA 2026: días de despacho por sector (L, M, Mi, J, V, S). Misma lista que valida api/cotizar.php.
  const DIAS_RUTA = [['L', 'Lunes'], ['M', 'Martes'], ['Mi', 'Miércoles'], ['J', 'Jueves'], ['V', 'Viernes'], ['S', 'Sábado']];
  const RUTAS = [
    ['Viña del Mar',  [1, 1, 1, 1, 1, 1]],
    ['Reñaca',        [1, 1, 1, 1, 1, 1]],
    ['Concón',        [1, 1, 1, 1, 1, 1]],
    ['Valparaíso',    [0, 1, 0, 0, 1, 0]],
    ['Curauma',       [0, 1, 0, 0, 1, 0]],
    ['Quilpué',       [0, 0, 1, 0, 0, 0]],
    ['Villa Alemana', [0, 0, 1, 0, 0, 0]],
    ['Limache',       [0, 0, 0, 1, 0, 0]],
    ['Quillota',      [0, 0, 0, 1, 0, 0]],
    ['Calera',        [0, 0, 0, 1, 0, 0]],
    ['Quintero',      [0, 0, 1, 0, 0, 0]],
    ['Papudo',        [0, 0, 1, 0, 0, 0]],
    ['Maitencillo',   [0, 0, 1, 0, 1, 0]]
  ];
  const RUTA_HORARIO = 'Lunes a viernes de 8:00 a 18:00 hrs. · Sábado de 8:00 a 14:00 hrs.';
  const COMUNAS = RUTAS.map(r => r[0]);
  // WhatsApp oficial de Olivo (+56 9 7723 6128). Los botones generales abren con un saludo que identifica al portal.
  const WA_NUMERO = '56977236128';
  const WHATSAPP = 'https://wa.me/' + WA_NUMERO;
  const WA_SALUDO = 'Hola Olivo, vengo del portal mayorista y quiero solicitar una cotización.';
  // En celular, wa.me abre la app directo. En computador, wa.me muestra una página intermedia
  // («Abrir aplicación / Continuar en WhatsApp Web»): ahí se va directo a WhatsApp Web con el mensaje listo.
  const ES_MOVIL = /Android|iPhone|iPad|iPod|Mobile|Windows Phone/i.test(navigator.userAgent)
    || (navigator.maxTouchPoints > 1 && /Macintosh/.test(navigator.userAgent));
  function waUrl(texto) {
    const t = encodeURIComponent(texto || '');
    return ES_MOVIL ? `${WHATSAPP}?text=${t}` : `https://web.whatsapp.com/send?phone=${WA_NUMERO}&text=${t}`;
  }

  const BIZ = [
    { id: 'restaurante', label: 'Restaurante', recs: [
      { tag: 'Despensa', cat: 'alimentos', name: 'Alimentos y abarrotes', items: 'Aceite para freír en bidón, arroz, harinas y salsa de tomate en pouch.' },
      { tag: 'Cadena de frío', cat: 'congelados', name: 'Congelados', items: 'Papas prefritas en 3 cortes y camarón ecuatoriano P&D.' },
      { tag: 'Higiene SEREMI', cat: 'limpieza', name: 'Limpieza y aseo', items: 'Desengrasante pesado, lavalozas concentrado y guantes de nitrilo.' }] },
    // Atajo por tipo de negocio: Restaurante, Cafetería, Sushi y Hotel (pedido de Olivo, 16 nov)
    { id: 'cafeteria', label: 'Cafetería', recs: [
      { tag: 'Formato gastronómico', cat: 'lacteos', name: 'Lácteos y refrigerados', items: 'Crema UHT, leche entera en caja y mantequilla en barra.' },
      { tag: 'Cadena de frío', cat: 'congelados', name: 'Congelados', items: 'Pulpas de fruta Río Alto: maracuyá, mango, frambuesa y frutilla.' },
      { tag: 'Para llevar', cat: 'insumos', name: 'Insumos para restaurantes', items: 'Bowls kraft con tapa, vasos y bombillas de papel.' }] },
    { id: 'sushi', label: 'Local de sushi', recs: [
      { tag: 'Línea estrella', cat: 'sushi', name: 'Sushi y gastronomía oriental', items: 'Arroz Shirakiku 9 kg, panko, quesos crema y salsa de soya Kikko.' },
      { tag: 'Cadena de frío', cat: 'congelados', name: 'Congelados', items: 'Camarón P&D 36/40 para tempura y ebi furai.' },
      { tag: 'Delivery', cat: 'insumos', name: 'Insumos para restaurantes', items: 'Sushi box negro antivaho y film alusa para esterillas.' }] },
    // Hotel (pedido de Olivo, 16 nov)
    { id: 'hotel', label: 'Hotel', recs: [
      { tag: 'Desayuno', cat: 'lacteos', name: 'Lácteos y refrigerados', items: 'Leche entera en caja, crema UHT, mantequilla y quesos.' },
      { tag: 'Presentación', cat: 'servilletas', name: 'Servilletas', items: 'Servilletas Joker 40 x 40 y 37,5 x 33 en blanco, natural y colores.' },
      { tag: 'Higiene SEREMI', cat: 'limpieza', name: 'Limpieza y aseo', items: 'Papel higiénico jumbo, papel toalla, cloro y bolsas de alta densidad.' }] }
  ];

  const CAT_CARDS = [
    { id: 'sushi', tag: 'Alta demanda', name: 'Sushi y gastronomía oriental', desc: 'Arroz grano corto, nori, panko, quesos crema.', img: 'images/cat-sushi.jpg' },
    { id: 'alimentos', tag: 'Línea despensa', name: 'Alimentos y abarrotes', desc: 'Aceites, harinas, arroces y pastas.', img: 'images/cat-alimentos.jpg' },
    { id: 'congelados', tag: 'Cadena de frío -18 °C', name: 'Congelados', desc: 'Camarones, papas bastón, pulpas Río Alto.', img: 'images/cat-congelados.jpg' },
    { id: 'lacteos', tag: 'Formato gastronómico', name: 'Lácteos y refrigerados', desc: 'Mozzarella, cremas UHT, quesos maduros.', img: 'images/cat-lacteos.jpg' },
    { id: 'limpieza', tag: 'Higiene SEREMI', name: 'Limpieza y aseo', desc: 'Lavalozas, cloro, desengrasantes, papel.', img: 'images/cat-limpieza.jpg' },
    { id: 'insumos', tag: 'Packaging y cocina', name: 'Insumos para restaurantes', desc: 'Film PVC, rollos térmicos, sushi box, bowls.', img: 'images/cat-insumos.jpg' }
  ];

  // «Ocho líneas» / «las 8 líneas»: sale del número real de categorías
  function lineasTexto(conPalabra) {
    const n = state.categories.length;
    const palabras = ['Cero', 'Una', 'Dos', 'Tres', 'Cuatro', 'Cinco', 'Seis', 'Siete', 'Ocho', 'Nueve', 'Diez'];
    return conPalabra && palabras[n] ? `${palabras[n]} líneas` : `${n} líneas`;
  }

  function renderBizRecs() {
    const biz = BIZ.find(b => b.id === state.biz) || BIZ[0];
    return biz.recs.map(r => `
      <button type="button" onclick="window.OlivoApp.setFilterCategory('${r.cat}')" class="lift text-left flex flex-col gap-2.5 p-6 bg-white border border-[#E4E9E7] rounded-2xl shadow-sm max-md:flex-none max-md:w-[78%] max-md:max-w-[320px] max-md:snap-start max-md:p-4 max-md:gap-2">
        <span class="self-start text-[10px] font-extrabold tracking-[0.12em] uppercase px-2.5 py-1 rounded-full bg-[#FBEEF0] text-[#B0121F]" style="font-family: var(--font-heading)">${r.tag}</span>
        <strong class="text-lg text-[#17472C] leading-snug max-sm:text-base" style="font-family: var(--font-heading)">${r.name}</strong>
        <span class="text-[15px] text-[#56616A] flex-grow max-sm:text-sm">${r.items}</span>
        <span class="inline-flex items-center gap-1.5 text-sm font-bold text-[#17472C]" style="font-family: var(--font-heading)">Ver productos <span class="text-[#CF1427]">${ICON_ARROW}</span></span>
      </button>`).join('');
  }

  function setBiz(id) {
    state.biz = id;
    document.querySelectorAll('.biz-chip').forEach(b => b.setAttribute('aria-pressed', String(b.dataset.biz === id)));
    const box = document.getElementById('bizRecs');
    if (box) {
      box.style.opacity = '0';
      setTimeout(() => { box.innerHTML = renderBizRecs(); box.style.opacity = '1'; }, 150);
    }
  }

  // Aparición suave de secciones al hacer scroll
  function initReveal() {
    const els = document.querySelectorAll('#appContent .reveal');
    if (!('IntersectionObserver' in window)) { els.forEach(e => e.classList.add('is-visible')); return; }
    const io = new IntersectionObserver((entries) => {
      entries.forEach(en => { if (en.isIntersecting) { en.target.classList.add('is-visible'); io.unobserve(en.target); } });
    }, { threshold: 0.12 });
    els.forEach(e => io.observe(e));
  }

  function renderLandingView(container) {
    if (!state.biz) state.biz = 'restaurante';
    // La foto del primer banner ya viene pintada en index.html: se reutiliza el mismo elemento (no se descarga ni pinta otra vez)
    const fotoPrevia = container.querySelector('#heroPrevio picture');
    const catCard = (c) => `
      <button type="button" onclick="window.OlivoApp.setFilterCategory('${c.id}')" class="category-card reveal text-left block h-[340px] max-sm:h-[172px]">
        ${fotoCategoria(c.id, 'center 20%', '(max-width: 1023px) 50vw, 25vw')}
        <div class="absolute inset-0" style="background: linear-gradient(0deg, rgba(15, 31, 22,0.92) 0%, rgba(15, 31, 22,0.4) 45%, rgba(15, 31, 22,0) 70%)"></div>
        <div class="absolute inset-x-0 bottom-0 p-[22px] flex flex-col gap-1.5 max-sm:p-3 max-sm:gap-1">
          <span class="self-start text-[10px] font-extrabold tracking-[0.12em] uppercase px-2.5 py-1 rounded-md bg-white/90 text-[#17472C] max-sm:hidden" style="font-family: var(--font-heading)">${c.tag}</span>
          <span class="font-serif font-bold text-[22px] leading-tight text-white max-sm:text-[15px]">${c.name}</span>
          <span class="text-sm text-[#E2E8E5] max-sm:hidden">${c.desc}</span>
          <span class="inline-flex items-center gap-1.5 text-sm font-bold text-[#7BD192] max-sm:text-[12.5px]" style="font-family: var(--font-heading)">Ver productos ${ICON_ARROW}</span>
        </div>
      </button>`;

    container.innerHTML = `
      <!-- HERO: 2 banners con cruce suave -->
      <section class="hero-slider-container text-white relative select-none" aria-roledescription="carrusel" aria-label="Destacados" onmouseenter="window.OlivoApp.stopHeroSlider()" onmouseleave="window.OlivoApp.initHeroSlider()">
        <div class="hero-slide active">
          <picture>
            <source media="(max-width: 639.98px)" type="image/webp" srcset="images/hero-cocina-m.webp">
            <source type="image/webp" srcset="images/hero-cocina-1280.webp 1280w, images/hero-cocina-1920.webp 1920w" sizes="100vw">
            <img src="images/hero-cocina.jpg" alt="Cocina profesional preparando insumos" class="hero-slide-bg" width="1920" height="800" fetchpriority="high" />
          </picture>
          <div class="hero-overlay"></div>
          <div class="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full z-20">
            <div class="hero-copy max-w-[640px] flex flex-col gap-4 sm:gap-[22px]">
              <span class="self-start inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/10 border border-white/25 text-white text-[11px] font-extrabold uppercase tracking-[0.14em]" style="font-family: var(--font-heading)">${ICON_PIN} Proveedor HORECA · V Región</span>
              <h1 class="font-serif font-bold text-white text-[29px] min-[400px]:text-[33px] sm:text-5xl lg:text-[60px] leading-[1.08] tracking-tight">Todo lo que tu negocio necesita, <em class="not-italic font-extrabold text-[#7BD192]">en un solo proveedor.</em></h1>
              <p class="text-base sm:text-lg text-[#EEF3F0] leading-relaxed max-w-[540px]">Abastecimiento integral para restaurantes, cafeterías y hoteles.</p>
              <div class="flex flex-wrap gap-3 max-sm:gap-2.5">
                <button type="button" onclick="window.OlivoApp.setView('checkout')" class="btn-gold h-[52px] px-6 text-[15px] font-extrabold max-sm:h-12 max-sm:px-3 max-sm:flex-1 max-sm:text-[14px] max-sm:whitespace-nowrap max-sm:[&>svg]:hidden" style="font-family: var(--font-heading)">${ICON_DOC} Solicitar cotización</button>
                <button type="button" onclick="window.OlivoApp.scrollToCategories()" class="btn-glass h-[52px] px-[22px] text-[15px] max-sm:h-12 max-sm:px-3 max-sm:flex-1 max-sm:justify-center max-sm:text-[14px] max-sm:whitespace-nowrap max-sm:[&>svg]:hidden" style="font-family: var(--font-heading)">Explorar catálogo <svg aria-hidden="true" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><path d="M12 5v14M19 12l-7 7-7-7"></path></svg></button>
              </div>
            </div>
          </div>
        </div>

        <!-- Banner 2: Servilletas Joker (reemplaza al de sushi, pedido de Olivo 16 nov). Fondo claro: data-tono="claro". -->
        <div class="hero-slide hero-slide-claro" data-tono="claro">
          <picture>
            <source type="image/webp" srcset="images/hero-servilletas.webp">
            <img src="images/hero-servilletas.jpg" alt="Servilletas Joker en azul, blanco, amarillo, negro, rojo, rosa, verde y burdeo" class="hero-servilletas-img hidden md:block" width="940" height="870" loading="lazy" decoding="async" />
          </picture>
          <div class="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full z-20">
            <div class="hero-copy max-w-[560px] md:max-w-[45%] xl:max-w-[560px] flex flex-col gap-3.5 sm:gap-5 pb-10 sm:pb-0">
              <span class="self-start inline-flex items-center gap-3 text-[#17472C] text-[12px] font-extrabold uppercase tracking-[0.22em]" style="font-family: var(--font-heading)">Servilletas Joker <span class="hidden sm:inline-block w-14 h-[2px] bg-[#17472C]"></span></span>
              <h2 class="font-serif font-bold text-[#17472C] text-[28px] min-[400px]:text-[32px] sm:text-5xl xl:text-[56px] leading-[1.08] tracking-tight">Las servilletas que tu restaurante <em class="not-italic font-extrabold text-[#CF1427]">necesita.</em></h2>
              <p class="text-base sm:text-lg text-[#3E4A44] leading-relaxed max-w-[460px]">Resistencia, presentación y versatilidad en cada detalle.</p>
              <ul class="m-0 p-0 list-none hidden sm:flex flex-wrap gap-x-6 gap-y-3 text-[14px] text-[#17472C] font-semibold" style="font-family: var(--font-heading)">
                <li class="inline-flex items-center gap-2"><i data-lucide="layers" class="w-5 h-5"></i>Variedad de colores</li>
                <li class="inline-flex items-center gap-2"><i data-lucide="award" class="w-5 h-5"></i>Calidad garantizada</li>
                <li class="inline-flex items-center gap-2"><i data-lucide="package" class="w-5 h-5"></i>Formatos para tu negocio</li>
              </ul>
              <div class="md:hidden flex gap-1.5" aria-hidden="true">
                ${['#1446B8', '#FFFFFF', '#F5D21A', '#161616', '#D9101E', '#E8238C', '#17663A', '#7A1430'].map(c => `<span class="w-7 h-10 rounded-md shadow-sm border border-black/10" style="background:${c}"></span>`).join('')}
              </div>
              <div class="flex flex-wrap gap-3">
                <button type="button" onclick="window.OlivoApp.setFilterCategory('servilletas')" class="btn-gold h-[52px] px-6 text-[15px] font-extrabold max-sm:h-12" style="font-family: var(--font-heading)">Cotiza con nosotros ${ICON_ARROW}</button>
              </div>
            </div>
          </div>
        </div>

        <div class="absolute left-0 right-0 bottom-[78px] max-sm:bottom-6 z-30 px-4 sm:px-6 lg:px-8">
          <div class="max-w-7xl mx-auto flex items-center -ml-3">
            <button type="button" onclick="window.OlivoApp.setHeroSlide(0)" class="hero-dot-btn" aria-label="Ver destacado 1"><span class="hero-dot slider-dot active"></span></button>
            <button type="button" onclick="window.OlivoApp.setHeroSlide(1)" class="hero-dot-btn" aria-label="Ver destacado 2"><span class="hero-dot slider-dot"></span></button>
            <button type="button" id="heroPausa" onclick="window.OlivoApp.toggleHeroPausa()" class="hero-dot-btn hero-pausa" aria-label="${state.heroPausado ? 'Reanudar el carrusel' : 'Pausar el carrusel'}"${REDUCE ? ' hidden' : ''}>${state.heroPausado ? ICON_PLAY : ICON_PAUSE}</button>
          </div>
        </div>
      </section>

      <!-- CÓMO COTIZAR: 3 pasos pegados al hero -->
      <section id="como-cotizar" aria-labelledby="comoTitulo" class="relative z-30 px-4 sm:px-6 lg:px-8 -mt-16 max-sm:-mt-5">
        <div class="max-w-7xl mx-auto bg-white border border-[#E4E9E7] rounded-2xl px-6 sm:px-8 py-7 flex flex-wrap items-center gap-x-8 gap-y-5 max-sm:px-4 max-sm:py-4 max-sm:gap-y-3" style="box-shadow: var(--shadow-xl)">
          <div class="flex-[1_1_200px]">
            <span class="eyebrow">Cómo cotizar</span>
            <h2 id="comoTitulo" class="font-serif font-bold text-2xl leading-tight text-[#131A16] mt-1 mb-0 max-sm:text-lg">Tres pasos, sin crear cuenta</h2>
          </div>
          <ol class="flex-[999_1_640px] m-0 p-0 list-none grid grid-cols-1 md:grid-cols-3 gap-4 max-sm:gap-2.5">
            ${[['Arma tu lista', 'Elige productos y cantidades del catálogo.'], ['Envía tu solicitud', 'Datos de tu local y comuna de despacho.'], ['Recibe tu cotización', 'Tu asesor comercial te responde por correo con precios y condiciones.']].map((s, i) => `
              <li class="flex gap-3.5 items-start max-sm:gap-3">
                <span class="flex-none w-10 h-10 rounded-xl bg-[#17472C] text-[#7BD192] flex items-center justify-center font-serif font-bold text-lg max-sm:w-8 max-sm:h-8 max-sm:text-base max-sm:rounded-lg">${i + 1}</span>
                <span class="leading-snug"><strong class="block text-[15px] text-[#17472C] max-sm:text-[14px]" style="font-family: var(--font-heading)">${s[0]}</strong><span class="text-sm text-[#56616A] max-sm:text-[13px]">${s[1]}</span></span>
              </li>`).join('')}
          </ol>
        </div>
      </section>

      <!-- ACCESO RÁPIDO AL CATÁLOGO (solo celular): todas las líneas a un toque, con las nuevas destacadas -->
      <nav aria-label="Acceso rápido al catálogo" class="md:hidden px-4 sm:px-6 pt-7">
        <div class="flex items-center justify-between gap-3 mb-2">
          <span class="eyebrow">Ir directo a una línea</span>
          <button type="button" onclick="window.OlivoApp.scrollToCategories()" class="text-[13px] font-bold text-[#17472C] underline underline-offset-2 py-3 -my-3" style="font-family: var(--font-heading)">Ver todas</button>
        </div>
        <div class="scroll-x flex gap-2 -mx-4 px-4 sm:-mx-6 sm:px-6">
          ${state.categories.map(c => `<button type="button" class="chip" onclick="window.OlivoApp.setFilterCategory('${c.id}')">${escapeHtml(c.shortName || c.name)}${LINEAS_NUEVAS.includes(c.id) ? '<span class="chip-new">Nueva</span>' : ''}</button>`).join('')}
        </div>
      </nav>

      <!-- ATAJO POR TIPO DE NEGOCIO -->
      <section aria-labelledby="negocioTitulo" class="px-4 sm:px-6 lg:px-8 pt-10 sm:pt-24 pb-10 sm:pb-[88px]">
        <div class="reveal max-w-7xl mx-auto flex flex-col gap-5 sm:gap-7">
          <div class="flex flex-col gap-2 max-w-[720px]">
            <span class="eyebrow">Atajo por tipo de negocio</span>
            <h2 id="negocioTitulo" class="font-serif text-[24px] sm:text-[38px] leading-tight text-[#131A16] m-0">¿Qué tipo de local tienes?</h2>
            <p class="m-0 text-[#56616A] text-[15px] sm:text-[17px]">Te mostramos primero las líneas que más usa un negocio como el tuyo.</p>
          </div>
          <div role="group" aria-label="Tipo de negocio" class="scroll-x flex flex-nowrap sm:flex-wrap gap-2.5 -mx-4 px-4 sm:mx-0 sm:px-0">
            ${BIZ.map(b => `<button type="button" class="biz-chip" data-biz="${b.id}" aria-pressed="${b.id === state.biz}" onclick="window.OlivoApp.setBiz('${b.id}')">${b.label}</button>`).join('')}
          </div>
          <div id="bizRecs" aria-live="polite" class="scroll-x flex snap-x snap-mandatory gap-3 -mx-4 px-4 scroll-pl-4 sm:-mx-6 sm:px-6 md:grid md:grid-cols-3 md:gap-5 md:mx-0 md:px-0" style="transition: opacity 0.15s">${renderBizRecs()}</div>
        </div>
      </section>

      <!-- CATÁLOGO: 7 LÍNEAS EN GRILLA DE 4 COLUMNAS -->
      <section id="explora-section" aria-labelledby="exploraTitulo" class="px-4 sm:px-6 lg:px-8 py-10 sm:py-24 bg-[#F2F5F3]">
        <div class="max-w-7xl mx-auto flex flex-col gap-5 sm:gap-8">
          <div class="reveal flex flex-col gap-2 max-w-[680px]">
            <span class="eyebrow">Catálogo mayorista</span>
            <h2 id="exploraTitulo" class="font-serif text-[24px] sm:text-[38px] leading-tight text-[#131A16] m-0">Explora todo para tu negocio</h2>
            <p class="m-0 text-[#56616A] text-[15px] sm:text-[17px]">${lineasTexto(true)} de abastecimiento con formatos gastronómicos y precios bajo cotización.</p>
          </div>
          <div class="grid grid-cols-2 lg:grid-cols-4 gap-5 max-sm:gap-2.5">
            <button type="button" onclick="window.OlivoApp.setFilterCategory('proteinas')" class="category-card reveal text-left block h-[340px] col-span-2 max-sm:h-[180px]">
              ${fotoCategoria('proteinas', 'center 45%', '(max-width: 1023px) 100vw, 50vw', ', images/cat-proteinas-1200.webp 1200w')}
              <div class="absolute inset-0" style="background: linear-gradient(0deg, rgba(15, 31, 22,0.92) 0%, rgba(15, 31, 22,0.45) 45%, rgba(15, 31, 22,0) 75%)"></div>
              <div class="absolute inset-x-0 bottom-0 p-7 flex flex-col gap-2 max-sm:p-4 max-sm:gap-1">
                <span class="self-start text-[10px] font-extrabold tracking-[0.12em] uppercase px-2.5 py-1 rounded-md bg-[#CF1427] text-white" style="font-family: var(--font-heading)">Nueva línea · Cortes seleccionados</span>
                <span class="font-serif font-bold text-[30px] leading-tight text-white max-sm:text-[21px]">Proteínas</span>
                <span class="text-[15px] text-[#E2E8E5] max-sm:text-[13px]">Vacuno al vacío, cerdo, pollo y aves, elaborados.</span>
                <span class="inline-flex items-center gap-1.5 text-sm font-bold text-[#7BD192]" style="font-family: var(--font-heading)">Ver productos ${ICON_ARROW}</span>
              </div>
            </button>
            ${CAT_CARDS.map(catCard).join('')}
            <!-- Servilletas: tarjeta a todo el ancho (pedido de Olivo, 16 nov) -->
            <button type="button" onclick="window.OlivoApp.setFilterCategory('servilletas')" class="category-card reveal text-left block h-[340px] col-span-2 lg:col-span-4 max-sm:h-[180px]">
              ${fotoCategoria('servilletas', 'center 35%', '100vw', ', images/cat-servilletas-1400.webp 1400w')}
              <div class="absolute inset-0" style="background: linear-gradient(0deg, rgba(15, 31, 22,0.92) 0%, rgba(15, 31, 22,0.45) 40%, rgba(15, 31, 22,0) 70%)"></div>
              <div class="absolute inset-x-0 bottom-0 p-7 flex flex-col gap-2 max-sm:p-4 max-sm:gap-1">
                <span class="self-start text-[10px] font-extrabold tracking-[0.12em] uppercase px-2.5 py-1 rounded-md bg-[#CF1427] text-white" style="font-family: var(--font-heading)">Nueva línea · Joker</span>
                <span class="font-serif font-bold text-[30px] leading-tight text-white max-sm:text-[21px]">Servilletas</span>
                <span class="text-[15px] text-[#E2E8E5] max-sm:text-[13px]">37,5 x 33 cm y 40 x 40 cm, en blanco, natural y colores.</span>
                <span class="inline-flex items-center gap-1.5 text-sm font-bold text-[#7BD192]" style="font-family: var(--font-heading)">Ver productos ${ICON_ARROW}</span>
              </div>
            </button>
          </div>
        </div>
      </section>

      <!-- COBERTURA DE DESPACHO -->
      <section id="despacho-section" aria-labelledby="despachoTitulo" class="px-4 sm:px-6 lg:px-8 py-10 sm:py-[88px] bg-[#17472C] text-white">
        <div class="reveal max-w-7xl mx-auto flex flex-wrap items-start gap-6 sm:gap-10">
          <div class="flex-[999_1_480px] flex flex-col gap-3.5">
            <span class="eyebrow" style="color: #7BD192">Cobertura de despacho</span>
            <h2 id="despachoTitulo" class="font-serif text-[24px] sm:text-[38px] leading-tight text-white m-0">Llegamos a tu local en toda la V Región</h2>
            <p class="m-0 text-[#D6E6DB] text-[15px] sm:text-[17px] max-w-[600px]">Despacho directo en ${COMUNAS.length} sectores. Revisa qué días pasa nuestra ruta por tu sector antes de armar tu lista.</p>
            <ul class="mt-2 p-0 list-none flex flex-wrap gap-2.5 max-sm:hidden">
              ${COMUNAS.map(c => `<li class="inline-flex items-center gap-2 px-3.5 py-2 rounded-full bg-white/[0.08] border border-[#7BD192]/45 font-semibold text-sm" style="font-family: var(--font-heading)">${ICON_PIN}${c}</li>`).join('')}
            </ul>
          </div>
          <div class="flex-[1_1_300px] bg-[#0F1F16] border border-[#7BD192]/35 rounded-2xl p-4 sm:p-7 flex flex-col gap-4">
            <div class="flex flex-col gap-1">
              <strong class="text-[17px]" style="font-family: var(--font-heading)">Horarios de ruta</strong>
              <span class="text-[14px] text-[#D6E6DB]">${RUTA_HORARIO}</span>
            </div>
            <table class="w-full text-[14px] border-collapse">
              <caption class="sr-only">Días de despacho por sector</caption>
              <thead>
                <tr class="text-[#7BD192] text-[12px] font-extrabold" style="font-family: var(--font-heading)">
                  <th scope="col" class="text-left font-extrabold pb-2">Sector</th>
                  ${DIAS_RUTA.map(d => `<th scope="col" class="w-8 text-center pb-2"><abbr title="${d[1]}" class="no-underline">${d[0]}</abbr></th>`).join('')}
                </tr>
              </thead>
              <tbody>
                ${RUTAS.map(([sector, dias]) => `
                  <tr class="border-t border-white/10">
                    <th scope="row" class="text-left font-semibold text-white py-1.5 pr-2">${sector}</th>
                    ${dias.map((si, i) => `<td class="text-center py-1.5">${si
                      ? `<span class="inline-flex w-5 h-5 rounded-full bg-[#7BD192] text-[#0F1F16] items-center justify-center"><svg aria-hidden="true" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3.2"><path d="M20 6 9 17l-5-5"></path></svg></span><span class="sr-only">Despacho el ${DIAS_RUTA[i][1].toLowerCase()}</span>`
                      : '<span aria-hidden="true" class="text-white/20">·</span>'}</td>`).join('')}
                  </tr>`).join('')}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      <!-- (Sección «Guías para tu cocina» quitada a pedido de Olivo, 16 nov) -->

      <!-- LLAMADO FINAL / CONTACTO -->
      <section id="contacto-section" aria-labelledby="ctaTitulo" class="px-4 sm:px-6 lg:px-8 py-10 sm:py-20 bg-[#F2F5F3]">
        <div class="reveal max-w-7xl mx-auto rounded-3xl bg-white border border-[#E4E9E7] p-5 sm:p-11 flex flex-wrap items-center justify-between gap-5 sm:gap-7 max-sm:rounded-2xl" style="box-shadow: var(--shadow-lg)">
          <div class="flex-[1_1_280px] flex flex-col gap-2">
            <span class="eyebrow">Atención 1 a 1</span>
            <h2 id="ctaTitulo" class="font-serif text-[24px] sm:text-[34px] leading-tight text-[#131A16] m-0">¿Ya tienes tu lista de compras?</h2>
            <p class="m-0 text-[#56616A] text-[15px] sm:text-[17px]">Envíala tal cual y tu asesor comercial arma la cotización por ti.</p>
          </div>
          <div class="flex flex-wrap gap-3 max-sm:w-full">
            <button type="button" onclick="window.OlivoApp.setView('checkout')" class="btn-gold h-[52px] px-6 text-[15px] font-extrabold max-sm:flex-1" style="font-family: var(--font-heading)">Solicitar cotización</button>
            <a href="${waUrl(WA_SALUDO)}" target="_blank" rel="noopener" data-evento="whatsapp" class="inline-flex items-center gap-2.5 h-[52px] px-[22px] rounded-[10px] bg-white border border-[#17472C] text-[#17472C] font-bold text-[15px] no-underline transition [@media(hover:hover)]:hover:-translate-y-px max-sm:flex-1 max-sm:justify-center" style="font-family: var(--font-heading)">
              <svg aria-hidden="true" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 11.5a8.4 8.4 0 0 1-12.3 7.4L3 21l2.1-5.6A8.4 8.4 0 1 1 21 11.5z"></path></svg>
              WhatsApp +56 9 7723 6128
            </a>
          </div>
        </div>
      </section>
    `;
    if (fotoPrevia) {
      const nueva = container.querySelector('.hero-slide picture');
      if (nueva) nueva.replaceWith(fotoPrevia);
    }
    initReveal();
  }

  // Lleva a la tabla de días de despacho por sector (portada)
  function scrollToRuta() { irASeccion('despacho-section'); }

  function scrollToSteps() { irASeccion('como-cotizar', 'center'); }

  function scrollToCategories() {
    if (document.getElementById('explora-section')) irASeccion('explora-section');
    else setView('catalog');
  }

  // =========================================================================
  // VISTA 2: CATÁLOGO B2B Y SUBDIVISIONES (SIN PRECIOS)
  // =========================================================================
  // Datos de la vista (línea, subcategorías, búsqueda y orden). Se usan para dibujar todo o solo los resultados.
  function datosCatalogo() {
    if (!state.filter.categoryId || state.filter.categoryId === 'all') {
      state.filter.categoryId = state.categories[0]?.id || 'alimentos';
      state.filter.subcategoryId = 'all';
    }

    const cat = state.categories.find(c => c.id === state.filter.categoryId) || state.categories[0];
    const enCategoria = state.products.filter(p => p.categoryId === cat.id);
    // Solo subcategorías con productos (así no aparecen secciones vacías)
    const subs = cat.subcategories
      .map(s => ({ ...s, count: enCategoria.filter(p => p.subcategoryId === s.id).length }))
      .filter(s => s.count > 0);
    const activeSub = subs.find(s => s.id === state.filter.subcategoryId);
    if (!activeSub) state.filter.subcategoryId = 'all';

    // Búsqueda del encabezado: recorre todas las líneas. Filtro interno: solo esta línea.
    const palabras = norm(state.filter.search).split(/\s+/).filter(Boolean);
    const global = state.filter.scope === 'global' && palabras.length > 0;
    let filtered;
    if (global) {
      const directo = (p) => palabras.every(w => textoProducto(p).includes(w));
      const amplio = state.products.filter(p => palabras.every(w => (textoProducto(p) + ' ' + norm(p.subcategoryName + ' ' + p.categoryName)).includes(w)));
      filtered = amplio.filter(directo).concat(amplio.filter(p => !directo(p)));
    } else {
      filtered = enCategoria.filter(p => {
        if (state.filter.subcategoryId !== 'all' && p.subcategoryId !== state.filter.subcategoryId) return false;
        return palabras.every(w => textoProducto(p).includes(w));
      });
    }
    // Orden por defecto: agrupado por subcategoría, en el mismo orden del menú lateral
    // (aceites con aceites, arroces con arroces…). En la búsqueda global manda la relevancia.
    if (state.filter.sortBy === 'featured' && !global) {
      const pos = {}; cat.subcategories.forEach((s, i) => { pos[s.id] = i; });
      filtered.sort((a, b) => (pos[a.subcategoryId] ?? 99) - (pos[b.subcategoryId] ?? 99));
    }
    if (state.filter.sortBy === 'name') filtered.sort((a, b) => a.name.localeCompare(b.name));
    else if (state.filter.sortBy === 'brand') filtered.sort((a, b) => (a.brand || 'zzz').localeCompare(b.brand || 'zzz'));
    const titulo = global ? 'Resultados de búsqueda' : cat.name;
    const bajada = global
      ? `${filtered.length} ${filtered.length === 1 ? 'producto' : 'productos'} para «${escapeHtml(state.filter.search.trim())}» en las ${lineasTexto(false)}.`
      : cat.description;
    return { cat, enCategoria, subs, activeSub: subs.find(s => s.id === state.filter.subcategoryId), global, filtered, titulo, bajada };
  }

  const nProductos = (n) => `${n} ${n === 1 ? 'producto' : 'productos'}`;
  const ICON_FILTROS = '<svg aria-hidden="true" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><path d="M4 6h10M18 6h2M4 12h4M12 12h8M4 18h12M20 18h0"></path><circle cx="16" cy="6" r="2"></circle><circle cx="10" cy="12" r="2"></circle><circle cx="18" cy="18" r="2"></circle></svg>';
  const ICON_X = '<svg aria-hidden="true" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><path d="M18 6 6 18M6 6l12 12"></path></svg>';
  const ICON_CHECK = '<svg aria-hidden="true" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#CF1427" stroke-width="2.6"><path d="M20 6 9 17l-5-5"></path></svg>';

  // Botón «Agregar»: mismo alto y ancho en todos sus estados para que la tarjeta no se mueva
  function clasesAgregar(enLista) {
    return 'add-btn flex-auto h-11 rounded-[10px] px-3 text-[13.5px] font-bold transition [@media(hover:hover)]:hover:-translate-y-px max-sm:w-full max-sm:flex-none max-sm:px-2 max-sm:text-[13px] '
      + (enLista ? 'bg-[#F2F8F3] text-[#17472C] border border-[#CBD9D0]' : 'bg-[#17472C] text-white border border-[#17472C] shadow-md hover:bg-[#1F6A3E]');
  }
  function htmlAgregar(item) {
    return item ? `En tu lista · ${item.quantity}` : '<span class="sm:hidden">Agregar</span><span class="max-sm:hidden">Agregar a cotización</span>';
  }
  // Repinta solo los botones de las tarjetas (sin redibujar el catálogo)
  function pintarBotonesAgregar(soloId) {
    document.querySelectorAll(soloId ? `[data-add="${soloId}"]` : '[data-add]').forEach(btn => {
      if (btn.dataset.estado === 'agregado') return;
      const item = state.cart.find(i => i.productId === btn.dataset.add);
      btn.className = clasesAgregar(!!item);
      btn.innerHTML = htmlAgregar(item);
    });
  }

  function htmlTarjeta(p, global) {
    const item = state.cart.find(i => i.productId === p.id);
    return `
      <article class="card-premium pcard flex flex-col group" data-pid="${p.id}">
        <button type="button" class="pcard-img relative block w-full aspect-square bg-white overflow-hidden cursor-pointer p-0 border-0" onclick="window.OlivoApp.openProductModal('${p.id}')" aria-label="Ver ficha de ${escapeHtml(p.name)}">
          ${fotoProducto(p, 'w-full h-full group-hover:scale-105 transition duration-500')}
          ${p.brand ? `<span class="absolute top-3 left-3 max-w-[calc(100%-24px)] truncate text-[11px] font-bold px-2 py-1 rounded-md bg-white/95 text-[#17472C] shadow-sm max-sm:top-1.5 max-sm:left-1.5 max-sm:max-w-[calc(100%-12px)] max-sm:text-[10px] max-sm:px-1.5 max-sm:py-0.5" style="font-family: var(--font-heading)">${p.brand}</span>` : ''}
          <span class="absolute top-3 right-3 text-[11px] font-mono px-2 py-1 rounded-md bg-white/95 text-[#56616A] shadow-sm max-sm:hidden">${p.sku}</span>
        </button>
        <div class="p-[18px] flex flex-col gap-2.5 flex-grow min-w-0 max-sm:p-2.5 max-sm:gap-1.5">
          <span class="text-[11px] font-extrabold tracking-[0.08em] uppercase text-[#B0121F] max-sm:text-[10px] max-sm:tracking-[0.04em] max-sm:truncate" style="font-family: var(--font-heading)">${global ? p.categoryName + ' · ' : ''}${p.subcategoryName}</span>
          <h3 class="m-0 text-[15px] font-bold leading-snug text-[#17472C] min-h-[40px] max-sm:text-[13.5px] max-sm:min-h-0" style="font-family: var(--font-heading)"><button type="button" onclick="window.OlivoApp.openProductModal('${p.id}')" class="text-left bg-transparent border-0 p-0 cursor-pointer hover:text-[#1F6A3E] max-sm:line-clamp-3" style="font: inherit; color: inherit">${p.name}</button></h3>
          <div class="bg-[#F8FAF9] border border-[#EEF2EF] rounded-[10px] px-3 py-2 text-[13px] leading-snug max-sm:p-0 max-sm:bg-transparent max-sm:border-0 max-sm:text-[12px] max-sm:line-clamp-2"><span class="text-[#626D76] max-sm:hidden">Presentación: </span><span class="text-[#1A1F1C] max-sm:text-[#56616A]">${formatoTexto(p)}</span></div>
          <div class="flex justify-between items-center gap-2 max-sm:mt-auto">
            <span class="text-[11px] font-extrabold tracking-[0.06em] uppercase px-2.5 py-1 rounded-full bg-[#FBEEF0] text-[#B0121F] max-sm:text-[9.5px] max-sm:px-2 max-sm:py-0.5" style="font-family: var(--font-heading)">Bajo cotización</span>
            <button type="button" onclick="window.OlivoApp.openProductModal('${p.id}')" class="text-[13px] font-medium text-[#17472C] underline py-3 -my-3 max-sm:hidden">Ver ficha técnica</button>
          </div>
          <div class="flex gap-2 mt-auto pt-1 max-sm:flex-col max-sm:gap-1.5 max-sm:mt-0">
            <div role="group" aria-label="Cantidad" class="flex items-center border border-[#E4E9E7] rounded-[10px] overflow-hidden flex-none max-sm:w-full">
              <button type="button" onclick="window.OlivoApp.stepProductCardQty('${p.id}', -1)" aria-label="Restar una unidad" class="w-10 h-11 bg-white text-[#17472C] text-lg font-bold hover:bg-[#F2F8F3] transition max-sm:flex-1 max-sm:w-auto">−</button>
              <input id="qty-input-${p.id}" type="number" inputmode="numeric" min="1" value="1" aria-label="Cantidad" class="w-9 text-center bg-transparent text-base font-extrabold text-[#1A1F1C] outline-none tabular-nums max-sm:flex-1 max-sm:w-0 max-sm:min-w-0" style="font-family: var(--font-heading)" />
              <button type="button" onclick="window.OlivoApp.stepProductCardQty('${p.id}', 1)" aria-label="Sumar una unidad" class="w-10 h-11 bg-white text-[#17472C] text-lg font-bold hover:bg-[#F2F8F3] transition max-sm:flex-1 max-sm:w-auto">+</button>
            </div>
            <button type="button" data-add="${p.id}" onclick="window.OlivoApp.addProductToQuoteFromCard('${p.id}')" class="${clasesAgregar(!!item)}" style="font-family: var(--font-heading)">${htmlAgregar(item)}</button>
          </div>
        </div>
      </article>`;
  }

  const NO_ENCUENTRAS = (extra = '') => `
    <div class="bg-[#17472C] rounded-2xl p-[22px] text-white flex flex-col gap-1.5 ${extra}">
      <strong class="text-base" style="font-family: var(--font-heading)">¿No encuentras un insumo?</strong>
      <span class="text-sm text-[#D6E6DB]">Pídelo a tu asesor comercial y lo sumamos a tu cotización.</span>
      <a href="tel:+56977236128" class="mt-1.5 self-start font-extrabold text-base text-[#7BD192] no-underline py-2.5 -my-2.5" style="font-family: var(--font-heading)">+56 9 7723 6128</a>
    </div>`;

  function htmlResultados(d) {
    if (d.filtered.length === 0) return `
      <div class="bg-white border border-dashed border-[#CBD9D0] rounded-2xl p-10 max-sm:p-6 text-center flex flex-col gap-2 items-center">
        <strong class="text-[17px] text-[#17472C]" style="font-family: var(--font-heading)">${d.global ? `No encontramos «${escapeHtml(state.filter.search.trim())}» en el catálogo` : 'No encontramos ese insumo en esta categoría'}</strong>
        <span class="text-[15px] text-[#56616A]">Escríbele a tu asesor comercial: lo buscamos y lo sumamos a tu cotización.</span>
        <div class="flex flex-wrap gap-3 justify-center mt-2">
          <button type="button" onclick="window.OlivoApp.resetFilters()" class="h-11 px-4 rounded-[10px] border border-[#CBD9D0] bg-white text-sm font-bold text-[#17472C] hover:bg-[#F2F8F3] transition" style="font-family: var(--font-heading)">Ver todos los productos de ${d.cat.shortName || d.cat.name}</button>
          <a href="${waUrl('Hola Olivo, vengo del portal mayorista y busco este insumo para cotizar: ' + (state.filter.search || '').trim())}" target="_blank" rel="noopener" class="h-11 px-4 rounded-[10px] bg-[#17472C] text-white text-sm font-bold inline-flex items-center gap-2 no-underline hover:bg-[#1F6A3E] transition" style="font-family: var(--font-heading)"><i data-lucide="message-circle" class="w-4 h-4"></i>Pedirlo por WhatsApp</a>
        </div>
      </div>`;
    // En celular y tablet el recuadro «¿No encuentras un insumo?» va al final de los resultados, no antes
    return `
      <div class="pgrid grid grid-cols-2 xl:grid-cols-3 gap-5 max-sm:gap-2.5">
        ${d.filtered.map(p => htmlTarjeta(p, d.global)).join('')}
      </div>
      ${NO_ENCUENTRAS('lg:hidden mt-1')}`;
  }

  function htmlMigas(d) {
    const link = 'py-3 -my-3 hover:text-[#17472C] transition';
    return `<button type="button" onclick="window.OlivoApp.setView('landing')" class="${link}">Inicio</button><span aria-hidden="true">/</span>
      ${d.global
        ? `<span class="text-[#1A1F1C] font-medium">Búsqueda</span>`
        : `<button type="button" onclick="window.OlivoApp.setFilterSubcategory('all')" class="${link} text-[#1A1F1C] font-medium">${d.cat.name}</button>
      ${d.activeSub ? `<span aria-hidden="true">/</span><span class="text-[#1A1F1C] font-medium">${d.activeSub.name}</span>` : ''}`}`;
  }

  // Subcategorías en la columna lateral (computador)
  function htmlSubLista(d) {
    const subBtn = (id, name, count) => {
      const on = !d.global && state.filter.subcategoryId === id;
      return `
        <button type="button" onclick="window.OlivoApp.setFilterSubcategory('${id}')" aria-pressed="${on}"
          class="w-full flex justify-between items-center gap-2.5 min-h-[44px] px-3 py-2 rounded-[10px] text-left text-sm leading-snug transition ${on ? 'bg-white text-[#17472C] font-bold' : 'text-[#1A1F1C] font-medium hover:bg-[#F2F8F3]'}"
          style="font-family: var(--font-heading);${on ? ' box-shadow: inset 3px 0 0 #CF1427, 0 1px 3px rgba(16, 28, 22,.08);' : ''}">
          <span>${name}</span>
          <span class="text-[13px] font-bold tabular-nums ${on ? 'text-[#B0121F]' : 'text-[#626D76]'}">${count}</span>
        </button>`;
    };
    return subBtn('all', 'Todas', d.enCategoria.length) + d.subs.map(s => subBtn(s.id, s.name, s.count)).join('');
  }

  // Subcategorías como chips horizontales (celular y tablet)
  function htmlChips(d) {
    const chip = (id, name, count) => `<button type="button" class="chip" data-sub="${id}" aria-pressed="${state.filter.subcategoryId === id}" onclick="window.OlivoApp.setFilterSubcategory('${id}')">${name}<span class="chip-count">${count}</span></button>`;
    return chip('all', 'Todas', d.enCategoria.length) + d.subs.map(s => chip(s.id, s.name, s.count)).join('');
  }

  function filtrosActivos() {
    return (state.filter.subcategoryId !== 'all' ? 1 : 0) + (state.filter.sortBy !== 'featured' ? 1 : 0);
  }

  // Lleva el chip activo a la vista dentro de su fila (solo desplazamiento horizontal, nunca de la página)
  function centrarChipActivo() {
    const fila = document.getElementById('catChips');
    const on = fila && fila.querySelector('[aria-pressed="true"]');
    if (!on) return;
    const izq = on.offsetLeft, der = izq + on.offsetWidth;
    if (izq < fila.scrollLeft + 8 || der > fila.scrollLeft + fila.clientWidth - 8) fila.scrollLeft = Math.max(0, izq - 16);
  }

  function htmlBarraCatalogo() {
    const n = state.cart.length;
    if (!n) return '';
    return `
      <div class="flex flex-wrap gap-3 items-center justify-between bg-[#0F1F16] text-white rounded-2xl pl-5 pr-4 py-3.5" style="box-shadow: 0 24px 56px -8px rgba(16, 28, 22,0.35); animation: olivoFadeUp .45s cubic-bezier(.16,1,.3,1) both">
        <span class="flex gap-2.5 items-center text-[15px]"><i data-lucide="file-text" class="w-5 h-5 text-[#CF1427]"></i><strong data-lb-count>${n} ${n === 1 ? 'producto en tu lista' : 'productos en tu lista'}</strong></span>
        <button type="button" onclick="window.OlivoApp.setView('checkout')" class="btn-gold h-11 px-[18px] text-sm font-extrabold" style="font-family: var(--font-heading)">Revisar y enviar <i data-lucide="arrow-right" class="w-4 h-4"></i></button>
      </div>`;
  }
  // Barra «N productos en tu lista» del catálogo (tablet y computador). Solo cambia el número si ya está visible.
  function actualizarBarraCatalogo() {
    const box = document.getElementById('catListBar');
    if (!box) return;
    const n = state.cart.length;
    const cuenta = box.querySelector('[data-lb-count]');
    if (n && cuenta) { cuenta.textContent = `${n} ${n === 1 ? 'producto en tu lista' : 'productos en tu lista'}`; return; }
    box.innerHTML = htmlBarraCatalogo();
    iconos();
  }

  function renderCatalogView(container) {
    const d = datosCatalogo();
    container.dataset.global = String(d.global);

    container.innerHTML = `
      <div class="px-4 sm:px-6 lg:px-8 pt-8 pb-24 max-sm:pt-4 max-sm:pb-10">
        <div class="max-w-7xl mx-auto flex flex-col gap-7 max-lg:gap-4">

          <div class="reveal is-visible flex flex-col gap-3 max-sm:gap-2">
            <nav id="catMigas" aria-label="Ruta de navegación" class="flex flex-wrap gap-2 text-[13px] text-[#626D76]">${htmlMigas(d)}</nav>
            <div class="flex flex-wrap gap-4 items-end justify-between max-sm:gap-3">
              <div class="flex flex-col gap-2 max-w-3xl max-sm:gap-1.5">
                <span class="self-start text-[10px] font-extrabold tracking-[0.12em] uppercase px-2.5 py-1 rounded-full bg-[#FBEEF0] text-[#B0121F]" style="font-family: var(--font-heading)">${d.global ? 'Todo el catálogo' : d.cat.badge}</span>
                <h1 class="font-serif font-bold text-[32px] sm:text-[44px] leading-[1.1] text-[#131A16] m-0 max-sm:text-[24px]">${d.titulo}</h1>
                <p class="m-0 text-[#56616A] text-[17px] max-sm:text-[14.5px] max-sm:leading-snug max-sm:line-clamp-2">${d.bajada}</p>
                ${d.global ? `<button type="button" onclick="window.OlivoApp.resetFilters()" class="self-start mt-1 inline-flex items-center gap-1.5 min-h-[44px] text-sm font-bold text-[#17472C] underline underline-offset-4"><i data-lucide="x" class="w-4 h-4"></i>Borrar búsqueda y volver a ${d.cat.name}</button>` : ''}
              </div>
              <label class="flex flex-col gap-1.5 text-[11px] font-extrabold tracking-[0.12em] uppercase text-[#56616A] max-sm:w-full" style="font-family: var(--font-heading)">
                Categorías
                <select onchange="window.OlivoApp.setFilterCategory(this.value)" class="h-11 min-w-[260px] px-3 rounded-[10px] border border-[#CBD9D0] bg-white text-[15px] font-medium normal-case tracking-normal text-[#17472C] max-sm:min-w-0 max-sm:w-full max-sm:text-base" style="font-family: var(--font-body)">
                  ${state.categories.map(c => `<option value="${c.id}" ${c.id === d.cat.id ? 'selected' : ''}>${c.name}</option>`).join('')}
                </select>
              </label>
            </div>
          </div>

          <!-- Celular y tablet: subcategorías en una fila deslizable, fija bajo el encabezado, y botón de filtros -->
          <div id="catToolbar" class="cat-toolbar lg:hidden -mx-4 sm:-mx-6 px-4 sm:px-6 py-2 flex items-center gap-2 border-y border-[#E4E9E7] ${d.global ? 'hidden' : ''}">
            <nav id="catChips" aria-label="Subcategorías" class="scroll-x relative flex gap-2 flex-1 min-w-0">${htmlChips(d)}</nav>
            <button type="button" id="btnFiltros" onclick="window.OlivoApp.abrirFiltros()" aria-haspopup="dialog" class="flex-none h-11 px-3 rounded-[10px] border border-[#CBD9D0] bg-white inline-flex items-center gap-1.5 text-sm font-bold text-[#17472C]" style="font-family: var(--font-heading)">${ICON_FILTROS}<span class="max-[359px]:sr-only">Filtros</span><span id="catFiltrosN" class="filter-dot" ${filtrosActivos() ? '' : 'hidden'}>${filtrosActivos()}</span></button>
          </div>

          <div class="flex flex-wrap gap-7 items-start">

            <aside aria-label="Subcategorías" class="flex-[1_1_240px] flex flex-col gap-4 max-lg:hidden">
              <div class="bg-white border border-[#E4E9E7] rounded-2xl pt-[18px] px-3 pb-3 shadow-sm">
                <h2 class="mx-2.5 mb-2.5 text-xs font-extrabold tracking-[0.14em] uppercase text-[#56616A]" style="font-family: var(--font-heading)">Subcategorías</h2>
                <div id="catSubLista" class="flex flex-col gap-0.5">${htmlSubLista(d)}</div>
              </div>
              ${NO_ENCUENTRAS()}
            </aside>

            <section aria-label="Productos" class="flex-[999_1_560px] min-w-0 flex flex-col gap-[18px] max-sm:gap-3">
              <div class="flex flex-wrap gap-3 items-center justify-between bg-white border border-[#E4E9E7] rounded-2xl px-3.5 py-3 max-sm:px-3 max-sm:py-2.5 max-sm:gap-2">
                <label class="relative flex items-center flex-[1_1_260px]">
                  <span class="sr-only">Filtrar en esta categoría por nombre, marca o SKU</span>
                  <i data-lucide="search" class="w-4 h-4 text-[#626D76] absolute left-3.5 pointer-events-none"></i>
                  <input id="catalogSearch" type="search" enterkeyhint="search" autocomplete="off" value="${d.global ? '' : escapeHtml(state.filter.search || '')}" oninput="window.OlivoApp.handleSearchInput(this.value, 'cat')" placeholder="Filtrar en ${d.cat.shortName || d.cat.name} por nombre, marca o SKU" class="w-full h-11 pl-10 pr-3.5 rounded-[10px] border border-[#E4E9E7] bg-[#F8FAF9] text-base outline-none focus:border-[#1F6A3E] text-ellipsis" />
                </label>
                <div class="flex gap-3 items-center flex-wrap">
                  <span id="catCount" aria-live="polite" class="text-sm text-[#56616A]">${nProductos(d.filtered.length)}</span>
                  <label class="flex gap-2 items-center text-[13px] text-[#626D76] ${d.global ? '' : 'max-lg:hidden'}">
                    Ordenar
                    <select id="catSort" onchange="window.OlivoApp.setSortBy(this.value)" class="h-11 px-3 rounded-[10px] border border-[#E4E9E7] bg-white text-base sm:text-sm text-[#1A1F1C]">
                      <option value="featured" ${state.filter.sortBy === 'featured' ? 'selected' : ''}>Por tipo de producto</option>
                      <option value="name" ${state.filter.sortBy === 'name' ? 'selected' : ''}>Nombre (A-Z)</option>
                      <option value="brand" ${state.filter.sortBy === 'brand' ? 'selected' : ''}>Marca</option>
                    </select>
                  </label>
                </div>
              </div>

              <div id="catResultados" class="flex flex-col gap-[18px] max-sm:gap-3">${htmlResultados(d)}</div>

              <!-- Tablet y computador: barra de la lista dentro del catálogo. En celular la reemplaza la barra inferior. -->
              <div id="catListBar" class="sticky bottom-4 z-10 max-md:hidden">${htmlBarraCatalogo()}</div>
            </section>
          </div>
        </div>
      </div>
    `;
    requestAnimationFrame(centrarChipActivo);
  }

  // Actualiza solo resultados, contador, migas y subcategorías: el buscador conserva el foco (y el teclado
  // del celular no se cierra) y la fila de chips no vuelve al inicio.
  function refrescarCatalogo(op = {}) {
    const main = document.getElementById('appContent');
    const res = document.getElementById('catResultados');
    const d = datosCatalogo();
    if (!main || !res || d.global || main.dataset.global === 'true') {
      rerenderCatalog();
    } else {
      res.innerHTML = htmlResultados(d);
      const set = (id, html) => { const el = document.getElementById(id); if (el) el.innerHTML = html; };
      set('catMigas', htmlMigas(d));
      set('catSubLista', htmlSubLista(d));
      const fila = document.getElementById('catChips');
      if (fila) { const x = fila.scrollLeft; fila.innerHTML = htmlChips(d); fila.scrollLeft = x; }
      const cuenta = document.getElementById('catCount');
      if (cuenta) cuenta.textContent = nProductos(d.filtered.length);
      const nf = document.getElementById('catFiltrosN');
      if (nf) { nf.textContent = filtrosActivos(); nf.hidden = !filtrosActivos(); }
      const orden = document.getElementById('catSort');
      if (orden) orden.value = state.filter.sortBy;
      if (res.querySelector('[data-lucide]')) iconos();
    }
    if (state.filtrosAbiertos) pintarFiltros(d);
    // Si la persona estaba más abajo, el inicio de los resultados queda justo bajo la barra fija (sin animación)
    if (op.alInicio) {
      const r = document.getElementById('catResultados');
      const barra = document.getElementById('catToolbar');
      if (r) {
        const alto = (document.getElementById('siteHeader')?.offsetHeight || 0) + (barra && barra.offsetParent ? barra.offsetHeight : 0) + 12;
        const top = r.getBoundingClientRect().top + window.scrollY - alto;
        if (window.scrollY > top) window.scrollTo(0, Math.max(0, top));
      }
    }
    centrarChipActivo();
  }

  // ---------- Panel inferior de filtros (celular y tablet) ----------
  function htmlFiltros(d, abierto) {
    const ordenes = [['featured', 'Por tipo de producto'], ['name', 'Nombre (A-Z)'], ['brand', 'Marca']];
    const opcSub = (id, name, count) => `<button type="button" class="sheet-option" aria-pressed="${state.filter.subcategoryId === id}" onclick="window.OlivoApp.setFilterSubcategory('${id}')"><span>${name}</span><span class="text-[13px] font-bold tabular-nums text-[#626D76]">${count}</span></button>`;
    return `
      <div class="sheet-root" data-open="${abierto}">
        <div class="sheet-backdrop" onclick="window.OlivoApp.cerrarFiltros()"></div>
        <div class="sheet-panel" role="dialog" aria-modal="true" aria-labelledby="sheetTitulo">
          <span aria-hidden="true" class="mx-auto mt-2 w-10 h-1 rounded-full bg-[#CBD9D0]"></span>
          <div class="flex items-center justify-between gap-3 pl-4 pr-2 pt-1 pb-1">
            <h2 id="sheetTitulo" tabindex="-1" class="m-0 text-[17px] font-extrabold text-[#17472C] outline-none" style="font-family: var(--font-heading)">Filtrar y ordenar</h2>
            <button type="button" onclick="window.OlivoApp.cerrarFiltros()" aria-label="Cerrar filtros" class="w-11 h-11 rounded-full flex items-center justify-center text-[#56616A] hover:bg-[#F2F8F3]">${ICON_X}</button>
          </div>
          <div class="sheet-body" id="sheetBody">
            ${d.global ? '' : `
            <h3 class="eyebrow m-0 mt-1 mb-1.5">Subcategoría · ${escapeHtml(d.cat.shortName || d.cat.name)}</h3>
            <div role="group" aria-label="Subcategoría" class="flex flex-col gap-0.5">
              ${opcSub('all', 'Todas', d.enCategoria.length)}${d.subs.map(s => opcSub(s.id, s.name, s.count)).join('')}
            </div>`}
            <h3 class="eyebrow m-0 mt-4 mb-1.5">Ordenar por</h3>
            <div role="radiogroup" aria-label="Ordenar por" class="flex flex-col gap-0.5">
              ${ordenes.map(o => `<button type="button" role="radio" aria-checked="${state.filter.sortBy === o[0]}" class="sheet-option" onclick="window.OlivoApp.setSortBy('${o[0]}')"><span>${o[1]}</span>${state.filter.sortBy === o[0] ? ICON_CHECK : ''}</button>`).join('')}
            </div>
          </div>
          <div class="sheet-foot">
            <button type="button" onclick="window.OlivoApp.limpiarFiltros()" class="h-12 px-4 rounded-[10px] border border-[#CBD9D0] bg-white text-sm font-bold text-[#17472C]" style="font-family: var(--font-heading)">Limpiar</button>
            <button type="button" onclick="window.OlivoApp.cerrarFiltros()" class="btn-olive flex-1 h-12 text-[15px] font-extrabold" style="font-family: var(--font-heading)">Ver ${nProductos(d.filtered.length)}</button>
          </div>
        </div>
      </div>`;
  }
  function pintarFiltros(d) {
    const cont = document.getElementById('filterSheet');
    if (!cont) return;
    const body = document.getElementById('sheetBody');
    const y = body ? body.scrollTop : 0;
    cont.innerHTML = htmlFiltros(d || datosCatalogo(), true);
    const nuevo = document.getElementById('sheetBody');
    if (nuevo) nuevo.scrollTop = y;
  }
  function abrirFiltros() {
    const cont = document.getElementById('filterSheet');
    if (!cont) return;
    state.focoAntesFiltros = document.activeElement;
    state.filtrosAbiertos = true;
    cont.innerHTML = htmlFiltros(datosCatalogo(), false);
    document.documentElement.classList.add('sin-scroll');
    requestAnimationFrame(() => requestAnimationFrame(() => {
      const root = cont.querySelector('.sheet-root');
      if (root) root.dataset.open = 'true';
      const t = document.getElementById('sheetTitulo');
      if (t) t.focus({ preventScroll: true });
    }));
  }
  function cerrarFiltros(devolverFoco = true) {
    const cont = document.getElementById('filterSheet');
    state.filtrosAbiertos = false;
    document.documentElement.classList.remove('sin-scroll');
    const root = cont && cont.querySelector('.sheet-root');
    if (root) root.dataset.open = 'false';
    setTimeout(() => { if (!state.filtrosAbiertos && cont) cont.innerHTML = ''; }, 300);
    if (devolverFoco && state.focoAntesFiltros && document.contains(state.focoAntesFiltros)) state.focoAntesFiltros.focus({ preventScroll: true });
  }
  function limpiarFiltros() {
    state.filter.subcategoryId = 'all';
    state.filter.sortBy = 'featured';
    refrescarCatalogo({ alInicio: true });
  }

  // =========================================================================
  // VISTA 3: SOLICITUD DE COTIZACIÓN EN 2 PASOS (lista → datos del local)
  // =========================================================================
  const CAMPOS = [
    { name: 'clientName', label: 'Nombre de contacto', type: 'text', auto: 'name', im: 'text', cap: 'words', req: true, err: 'Escribe tu nombre.', grupo: 'contacto' },
    { name: 'phone', label: 'Teléfono móvil', type: 'tel', auto: 'tel', im: 'tel', req: true, err: 'Escribe un teléfono válido, por ejemplo +56 9 1234 5678.', ph: '+56 9 …', grupo: 'contacto' },
    { name: 'email', label: 'Correo electrónico', type: 'email', auto: 'email', im: 'email', cap: 'off', req: true, err: 'Revisa el correo: ahí llega tu cotización.', full: true, grupo: 'contacto' },
    { name: 'companyName', label: 'Nombre del local', type: 'text', auto: 'organization', im: 'text', cap: 'words', req: true, err: 'Indica el nombre de tu local.', grupo: 'negocio' }
  ];
  // Mismas reglas que el servidor (api/cotizar.php). RUT no se pide: lo quitó el cliente el 24 nov.
  const VALIDAR = {
    clientName: v => !!v,
    phone: v => /^[0-9+\s().-]{8,30}$/.test(v),
    email: v => /^\S+@\S+\.\S+$/.test(v),
    companyName: v => !!v,
    comuna: v => !!v
  };
  const MENSAJE_ERROR = Object.assign({ comuna: 'Elige una comuna de la V Región.' }, Object.fromEntries(CAMPOS.map(c => [c.name, c.err])));

  // Marca o limpia el error de un campo en el lugar, sin redibujar el formulario (no hay saltos ni se pierde el foco)
  function marcarCampo(el, invalido) {
    if (!el || !el.name) return;
    const id = 'err-' + el.name;
    let msg = document.getElementById(id);
    if (invalido) {
      el.setAttribute('aria-invalid', 'true');
      el.setAttribute('aria-describedby', id);
      el.classList.add('!border-[#A33A2E]');
      if (!msg) {
        msg = document.createElement('span');
        msg.id = id;
        msg.className = 'text-[13px] text-[#A33A2E]';
        msg.textContent = MENSAJE_ERROR[el.name] || 'Revisa este campo.';
        el.insertAdjacentElement('afterend', msg);
      }
    } else {
      el.removeAttribute('aria-invalid');
      el.removeAttribute('aria-describedby');
      el.classList.remove('!border-[#A33A2E]');
      if (msg) msg.remove();
    }
  }
  function marcarErrores(form, errores) {
    let primero = null;
    Object.keys(VALIDAR).forEach(k => {
      const el = form.elements[k];
      marcarCampo(el, !!errores[k]);
      if (errores[k] && el && !primero) primero = el;
    });
    // Lleva al primer campo con error una sola vez, sin animación y centrado (no queda bajo el encabezado)
    if (primero) {
      primero.focus({ preventScroll: true });
      const r = primero.getBoundingClientRect();
      if (r.top < (document.getElementById('siteHeader')?.offsetHeight || 0) + 8 || r.bottom > window.innerHeight - 8) primero.scrollIntoView({ block: 'center' });
    }
  }
  // Al salir de un campo con algo escrito se valida de inmediato (no se marca un campo vacío solo por pasar por él)
  function validarCampo(el) {
    const regla = VALIDAR[el.name];
    if (!regla) return;
    const v = (el.value || '').trim();
    if (v || el.getAttribute('aria-invalid')) marcarCampo(el, !regla(v));
  }
  const TIPOS_NEGOCIO = ['Restaurante', 'Cafetería', 'Hotel', 'Local de sushi', 'Pizzería', 'Minimarket', 'Casino o catering', 'Otro'];

  function productoActual(item) {
    return state.products.find(p => p.id === item.productId) || item;
  }

  function saveCheckoutField(el) {
    state.checkoutForm = state.checkoutForm || {};
    state.checkoutForm[el.name] = el.value;
    // Si tenía error y ya es válido, el aviso se quita mientras escribe
    if (el.getAttribute('aria-invalid') && VALIDAR[el.name] && VALIDAR[el.name]((el.value || '').trim())) {
      if (state.checkoutErrors) delete state.checkoutErrors[el.name];
      marcarCampo(el, false);
    }
  }

  function goCheckoutStep(n) {
    state.checkoutStep = n;
    renderCheckoutView();
    iconos();
    actualizarBarraCotizacion();
    window.scrollTo(0, 0);   // primero se dibuja el paso, luego se va arriba sin animación
  }

  // Cambios de cantidad en la solicitud: se actualizan los números en su lugar (sin redibujar ni mover la página)
  function actualizarCheckout() {
    const paso = state.cart.length === 0 ? 1 : (state.checkoutStep || 1);
    const lista = document.getElementById('checkoutLista');
    const unidades = state.cart.reduce((s, i) => s + i.quantity, 0);
    if (paso === 1 && lista && state.cart.length && lista.children.length === state.cart.length) {
      state.cart.forEach(it => {
        const inp = lista.querySelector(`[data-qty="${it.productId}"]`);
        if (inp && document.activeElement !== inp) inp.value = it.quantity;
      });
      const set = (k, v) => document.querySelectorAll(`[data-res="${k}"]`).forEach(e => { e.textContent = v; });
      set('productos', state.cart.length);
      set('unidades', unidades);
      set('nprod', nProductos(state.cart.length));
      return;
    }
    const resumen = document.getElementById('resumenPaso2');
    if (paso === 2 && resumen && state.cart.length) {
      resumen.innerHTML = htmlResumenPaso2();
      const t = document.getElementById('tituloResumen2');
      if (t) t.textContent = `Tu lista · ${nProductos(state.cart.length)}`;
      return;
    }
    // Se quitó un producto o la lista quedó vacía: se redibuja manteniendo la posición
    const y = window.scrollY;
    renderCheckoutView();
    iconos();
    window.scrollTo(0, Math.min(y, document.documentElement.scrollHeight - window.innerHeight));
  }
  function htmlResumenPaso2() {
    return state.cart.map(i => `<li class="flex justify-between gap-3"><span>${i.name}</span><strong class="text-[#7BD192] tabular-nums">×${i.quantity}</strong></li>`).join('');
  }

  function stepper(paso) {
    const labels = ['Tu lista', 'Datos del local', 'Confirmación'];
    return `
      <ol aria-label="Progreso de la solicitud" class="m-0 p-0 list-none flex flex-wrap items-center gap-2.5 max-sm:flex-nowrap max-sm:gap-1.5">
        ${labels.map((l, i) => {
          const n = i + 1, hecho = n < paso, actual = n === paso;
          return `
          <li class="flex items-center gap-2.5 max-sm:gap-1.5 ${actual ? 'max-sm:flex-1 max-sm:min-w-0' : ''}" ${actual ? 'aria-current="step"' : ''}>
            <span class="w-8 h-8 rounded-full flex flex-none items-center justify-center text-sm font-extrabold transition max-sm:w-7 max-sm:h-7 max-sm:text-[13px] ${actual ? 'bg-[#17472C] text-white' : hecho ? 'bg-[#CF1427] text-white' : 'bg-white text-[#626D76] border border-[#CBD9D0]'}" style="font-family: var(--font-heading)">${hecho ? '✓' : n}</span>
            <span class="text-sm ${actual ? 'font-extrabold text-[#17472C] max-sm:truncate' : hecho ? 'font-semibold text-[#17472C] max-sm:sr-only' : 'font-semibold text-[#626D76] max-sm:sr-only'}" style="font-family: var(--font-heading)">${l}</span>
            ${n < 3 ? `<span aria-hidden="true" class="w-12 h-0.5 rounded mx-1.5 flex-none max-sm:w-4 max-sm:mx-0.5 ${hecho ? 'bg-[#CF1427]' : 'bg-[#CBD9D0]'}"></span>` : ''}
          </li>`;
        }).join('')}
      </ol>`;
  }

  function renderCheckoutView(container) {
    if (!container) container = document.getElementById('appContent');
    if (!container) return;
    const paso = state.cart.length === 0 ? 1 : (state.checkoutStep || 1);
    const unidades = state.cart.reduce((s, i) => s + i.quantity, 0);
    const nProd = state.cart.length + (state.cart.length === 1 ? ' producto' : ' productos');
    const f = state.checkoutForm || {};
    const e = state.checkoutErrors || {};
    const campo = (c) => `
      <label class="flex flex-col gap-1.5 ${c.full ? 'sm:col-span-2' : ''}">
        <span class="text-xs font-extrabold tracking-[0.08em] uppercase text-[#56616A]" style="font-family: var(--font-heading)">${c.label}</span>
        <input name="${c.name}" type="${c.type}" ${c.auto ? `autocomplete="${c.auto}"` : ''} ${c.im ? `inputmode="${c.im}"` : ''} ${c.cap ? `autocapitalize="${c.cap}"` : ''} ${c.type === 'email' ? 'spellcheck="false"' : ''} enterkeyhint="next" ${c.ph ? `placeholder="${c.ph}"` : ''} value="${(f[c.name] || '').replace(/"/g, '&quot;')}" oninput="window.OlivoApp.saveCheckoutField(this)" onblur="window.OlivoApp.validarCampo(this)" ${e[c.name] ? `aria-invalid="true" aria-describedby="err-${c.name}"` : ''} required
          class="h-12 px-3.5 rounded-[10px] border ${e[c.name] ? '!border-[#A33A2E]' : 'border-[#E4E9E7]'} bg-[#F8FAF9] text-base outline-none focus:border-[#1F6A3E] focus:ring-[3px] focus:ring-[#1F6A3E]/20 transition" />
        ${e[c.name] ? `<span id="err-${c.name}" class="text-[13px] text-[#A33A2E]">${c.err}</span>` : ''}
      </label>`;

    let cuerpo;
    if (state.cart.length === 0) {
      cuerpo = `
        <div class="bg-white border border-[#E4E9E7] rounded-2xl p-10 max-sm:p-6 text-center flex flex-col gap-3 items-center max-w-2xl">
          <strong class="text-xl text-[#17472C]" style="font-family: var(--font-heading)">Tu lista está vacía</strong>
          <p class="m-0 text-[#56616A]">Explora el catálogo, elige productos y cantidades, y vuelve aquí para enviar tu solicitud.</p>
          <button type="button" onclick="window.OlivoApp.irASeccion('explora-section')" class="btn-olive h-11 px-5 text-sm">Explorar catálogo</button>
        </div>`;
    } else if (paso === 1) {
      cuerpo = `
        <div class="flex flex-wrap gap-7 items-start" style="animation: olivoFade .3s ease both">
          <section aria-labelledby="t1" class="flex-[999_1_560px] min-w-0 bg-white border border-[#E4E9E7] rounded-2xl overflow-hidden">
            <div class="px-6 pt-6 pb-4 flex flex-wrap justify-between gap-2 items-end max-sm:px-4 max-sm:pt-4 max-sm:pb-3">
              <div>
                <span class="eyebrow">Paso 1 de 3</span>
                <h1 id="t1" class="font-serif text-[24px] sm:text-[34px] leading-tight text-[#131A16] mt-0.5 mb-0">Revisa tu lista</h1>
              </div>
              <span class="text-sm text-[#56616A]" data-res="nprod">${nProd}</span>
            </div>
            <ul id="checkoutLista" class="m-0 p-0 list-none">
              ${state.cart.map(item => {
                const p = productoActual(item);
                return `
                <li data-pid="${item.productId}" class="flex flex-wrap gap-3.5 items-center px-6 py-4 border-t border-[#EEF2EF] hover:bg-[#F8FAF9] transition max-sm:grid max-sm:grid-cols-[56px_minmax(0,1fr)_44px] max-sm:gap-x-3 max-sm:gap-y-2 max-sm:px-4 max-sm:py-3 max-sm:items-start">
                  ${fotoProducto(p, 'w-16 h-16 rounded-[10px] flex-none border border-[#E4E9E7] overflow-hidden max-sm:w-14 max-sm:h-14 max-sm:row-span-2', true)}
                  <span class="flex-[1_1_260px] flex flex-col gap-0.5 min-w-0 max-sm:col-start-2 max-sm:row-start-1">
                    <strong class="text-[15px] text-[#17472C] leading-snug" style="font-family: var(--font-heading)">${item.name}</strong>
                    <span class="text-[13px] text-[#56616A]">${formatoTexto(p)} · <span class="font-mono text-[#626D76]">${item.sku}</span></span>
                  </span>
                  <span role="group" aria-label="Cantidad" class="flex items-center border border-[#E4E9E7] rounded-[10px] overflow-hidden max-sm:col-start-2 max-sm:row-start-2 max-sm:justify-self-start">
                    <button type="button" onclick="window.OlivoApp.updateCartItemQty('${item.productId}', -1)" aria-label="Restar una unidad" class="w-11 h-11 bg-white text-[#17472C] text-lg font-bold hover:bg-[#F2F8F3] transition">−</button>
                    <input type="number" inputmode="numeric" min="1" value="${item.quantity}" data-qty="${item.productId}" aria-label="Cantidad de ${escapeHtml(item.name)}" onchange="window.OlivoApp.setCartItemQty('${item.productId}', this.value)" class="w-12 text-center bg-transparent text-base font-extrabold tabular-nums outline-none" style="font-family: var(--font-heading)" />
                    <button type="button" onclick="window.OlivoApp.updateCartItemQty('${item.productId}', 1)" aria-label="Sumar una unidad" class="w-11 h-11 bg-white text-[#17472C] text-lg font-bold hover:bg-[#F2F8F3] transition">+</button>
                  </span>
                  <button type="button" onclick="window.OlivoApp.removeCartItem('${item.productId}')" aria-label="Quitar ${escapeHtml(item.name)} de la lista" class="w-11 h-11 rounded-[10px] text-[#A33A2E] hover:bg-[#FBEDEB] flex items-center justify-center transition max-sm:col-start-3 max-sm:row-start-1 max-sm:-mt-1.5"><i data-lucide="trash-2" class="w-[18px] h-[18px]"></i></button>
                </li>`;
              }).join('')}
            </ul>
            <div class="px-6 py-4 border-t border-[#EEF2EF] flex justify-between items-center max-sm:px-4 max-sm:py-2">
              <button type="button" onclick="window.OlivoApp.setView('catalog')" class="text-sm font-bold text-[#17472C] inline-flex items-center gap-1.5 min-h-[44px]" style="font-family: var(--font-heading)"><i data-lucide="arrow-left" class="w-4 h-4"></i>Agregar más productos</button>
              <button type="button" onclick="window.OlivoApp.clearCart()" class="text-sm text-[#A33A2E] hover:underline min-h-[44px]">Vaciar lista</button>
            </div>
          </section>
          <aside class="flex-[1_1_320px] bg-white border border-[#E4E9E7] rounded-2xl p-6 flex flex-col gap-3.5 max-sm:p-4 max-sm:gap-2.5" style="box-shadow: var(--shadow-md)">
            <strong class="text-[17px] text-[#17472C]" style="font-family: var(--font-heading)">Resumen</strong>
            <div class="flex justify-between text-[15px]"><span class="text-[#56616A]">Productos distintos</span><strong class="tabular-nums" data-res="productos">${state.cart.length}</strong></div>
            <div class="flex justify-between text-[15px]"><span class="text-[#56616A]">Unidades totales</span><strong class="tabular-nums" data-res="unidades">${unidades}</strong></div>
            <div class="flex justify-between items-center text-[15px] pt-3 border-t border-[#EEF2EF]"><span class="text-[#56616A]">Precio</span><span class="text-[11px] font-extrabold tracking-[0.06em] uppercase px-2.5 py-1 rounded-full bg-[#FBEEF0] text-[#B0121F]" style="font-family: var(--font-heading)">Bajo cotización</span></div>
            <!-- En celular este botón vive en la barra inferior fija (siempre a mano, sin duplicarse) -->
            <button type="button" onclick="window.OlivoApp.goCheckoutStep(2)" class="btn-gold h-[52px] text-[15px] font-extrabold w-full max-md:hidden" style="font-family: var(--font-heading)">Continuar con mis datos</button>
            <span class="text-[13px] text-[#626D76] text-center">Sin registro. Toma menos de 2 minutos.</span>
          </aside>
        </div>`;
    } else {
      cuerpo = `
        <div class="flex flex-wrap gap-7 items-start" style="animation: olivoFade .3s ease both">
          <form novalidate onsubmit="event.preventDefault(); window.OlivoApp.submitQuotation(this);" aria-labelledby="t2" class="flex-[999_1_560px] min-w-0 bg-white border border-[#E4E9E7] rounded-2xl p-7 flex flex-col gap-5 max-sm:p-4 max-sm:gap-4">
            <div>
              <span class="eyebrow">Paso 2 de 3</span>
              <h1 id="t2" class="font-serif text-[24px] sm:text-[34px] leading-tight text-[#131A16] mt-0.5 mb-1">Datos de tu local</h1>
              <p class="m-0 text-[#56616A] text-[15px]">Los usamos solo para enviarte la cotización y coordinar el despacho.</p>
            </div>
            <fieldset class="border-0 p-0 m-0 grid grid-cols-1 sm:grid-cols-2 gap-x-[18px] gap-y-4">
              <legend class="font-extrabold text-[15px] text-[#17472C] mb-3" style="font-family: var(--font-heading)">Contacto</legend>
              ${CAMPOS.filter(c => c.grupo === 'contacto').map(campo).join('')}
            </fieldset>
            <fieldset class="border-0 p-0 m-0 grid grid-cols-1 sm:grid-cols-2 gap-x-[18px] gap-y-4">
              <legend class="font-extrabold text-[15px] text-[#17472C] mb-3" style="font-family: var(--font-heading)">Tu negocio</legend>
              ${CAMPOS.filter(c => c.grupo === 'negocio').map(campo).join('')}
              <label class="flex flex-col gap-1.5">
                <span class="text-xs font-extrabold tracking-[0.08em] uppercase text-[#56616A]" style="font-family: var(--font-heading)">Comuna de entrega</span>
                <select name="comuna" autocomplete="address-level2" required onchange="window.OlivoApp.saveCheckoutField(this); window.OlivoApp.validarCampo(this)" ${e.comuna ? 'aria-invalid="true" aria-describedby="err-comuna"' : ''} class="h-12 px-3.5 rounded-[10px] border ${e.comuna ? '!border-[#A33A2E]' : 'border-[#E4E9E7]'} bg-[#F8FAF9] text-base outline-none focus:border-[#1F6A3E]">
                  <option value="">Elige tu comuna</option>
                  ${COMUNAS.map(c => `<option ${f.comuna === c ? 'selected' : ''}>${c}</option>`).join('')}
                </select>
                ${e.comuna ? '<span id="err-comuna" class="text-[13px] text-[#A33A2E]">Elige una comuna de la V Región.</span>' : ''}
              </label>
              <label class="flex flex-col gap-1.5 sm:col-span-2">
                <span class="text-xs font-extrabold tracking-[0.08em] uppercase text-[#56616A]" style="font-family: var(--font-heading)">Comentarios de despacho <span class="normal-case tracking-normal font-semibold text-[#626D76]">(opcional)</span></span>
                <textarea name="notes" rows="3" oninput="window.OlivoApp.saveCheckoutField(this)" placeholder="Horario de recepción, acceso para camión, productos que no encontraste…" class="px-3.5 py-3 rounded-[10px] border border-[#E4E9E7] bg-[#F8FAF9] text-base outline-none focus:border-[#1F6A3E] resize-y">${f.notes || ''}</textarea>
              </label>
            </fieldset>
            <!-- Trampa anti-spam: oculto para personas; si se completa, el servidor descarta el envío -->
            <div aria-hidden="true" style="position:absolute; left:-9999px; width:1px; height:1px; overflow:hidden">
              <label>No completar este campo <input type="text" name="website" tabindex="-1" autocomplete="off" /></label>
            </div>
            <div class="flex flex-wrap gap-3 justify-between items-center pt-1 max-sm:flex-col-reverse max-sm:items-stretch">
              <button type="button" onclick="window.OlivoApp.goCheckoutStep(1)" class="min-h-[44px] text-sm font-bold text-[#17472C]" style="font-family: var(--font-heading)">← Volver a mi lista</button>
              <button type="submit" class="btn-gold h-[52px] px-6 text-[15px] font-extrabold max-sm:px-4 max-sm:text-[14.5px]" style="font-family: var(--font-heading)"><i data-lucide="send" class="w-[18px] h-[18px]"></i>Enviar solicitud de cotización formal</button>
            </div>
          </form>
          <aside class="flex-[1_1_320px] bg-[#17472C] text-white rounded-2xl p-6 flex flex-col gap-3 max-sm:p-4">
            <strong id="tituloResumen2" class="text-[17px]" style="font-family: var(--font-heading)">Tu lista · ${nProd}</strong>
            <ul id="resumenPaso2" class="m-0 p-0 list-none flex flex-col gap-2 text-sm text-[#D6E6DB]">${htmlResumenPaso2()}</ul>
            <span class="text-[14px] text-[#D6E6DB] pt-3 border-t border-[#D6E6DB]/15">Un asesor comercial se pondrá en contacto contigo a la brevedad para enviarte la cotización y responder a tus requerimientos.</span>
          </aside>
        </div>`;
    }

    container.innerHTML = `
      <div class="px-4 sm:px-6 lg:px-8 pt-10 pb-24 max-sm:pt-5 max-sm:pb-10">
        <div class="max-w-[1180px] mx-auto flex flex-col gap-7 max-sm:gap-4">
          ${stepper(state.cart.length === 0 ? 1 : paso)}
          ${cuerpo}
        </div>
      </div>`;
    // (Antes se enfocaba aquí el primer error en cada redibujo, con un salto de scroll. Ahora solo al enviar.)
  }

  // Mensaje de WhatsApp para Olivo con todo lo que el cliente escribió en la solicitud
  // Ordenado en bloques (en el chat de WhatsApp *texto* sale en negrita y cada línea va aparte)
  function mensajeWhatsApp(q) {
    const items = q.items || [];
    // Una línea por producto para que el enlace no sea demasiado largo; el formato va en el correo a ventas
    const max = 30;
    const lineas = items.slice(0, max).map((i, n) => `${n + 1}. ${i.name} — *${i.quantity}* un. (${i.sku})`);
    if (items.length > max) lineas.push(`… y ${items.length - max} productos más (detalle en el correo de ventas).`);
    return [
      '*SOLICITUD DE COTIZACIÓN*',
      `Código: ${q.id}`,
      'Enviada desde el portal mayorista',
      '',
      '*DATOS DEL CLIENTE*',
      `Nombre: ${q.clientName}`,
      `Local: ${q.companyName}`,
      q.businessType ? `Tipo de negocio: ${q.businessType}` : null,
      `Teléfono: ${q.phone}`,
      `Correo: ${q.email}`,
      `Despacho en: ${q.comuna}`,
      '',
      `*PRODUCTOS (${items.length})*`,
      ...lineas,
      q.notes ? '' : null,
      q.notes ? '*COMENTARIOS*' : null,
      q.notes ? q.notes : null
    ].filter(l => l !== null).join('\n');
  }

  // =========================================================================
  // VISTA 4: CONFIRMACIÓN
  // =========================================================================
  function renderConfirmationView(container) {
    if (!container) container = document.getElementById('appContent');
    if (!container) return;
    const quote = state.lastSubmittedQuote;
    if (!quote) { setView('catalog'); return; }
    // «Página de agradecimiento»: la dirección pasa a terminar en #gracias mientras se muestra la confirmación
    try { history.replaceState(null, '', window.location.pathname + window.location.search + '#gracias'); } catch (e) {}

    container.innerHTML = `
      <div class="px-4 sm:px-6 lg:px-8 pt-10 pb-24 max-sm:pt-5 max-sm:pb-10">
        <div class="max-w-[1180px] mx-auto flex flex-col gap-7 max-sm:gap-4">
          ${stepper(3)}
          <section aria-live="polite" class="max-w-[760px] w-full mx-auto bg-white border border-[#E4E9E7] rounded-3xl px-6 sm:px-10 py-12 max-sm:px-4 max-sm:py-8 max-sm:rounded-2xl text-center flex flex-col gap-4 items-center" style="box-shadow: var(--shadow-lg); animation: olivoFadeUp .55s cubic-bezier(.16,1,.3,1) both">
            <span class="confirm-pop w-[72px] h-[72px] rounded-full bg-[#17472C] text-[#7BD192] flex items-center justify-center">
              <svg aria-hidden="true" width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4"><path class="confirm-draw" d="M20 6 9 17l-5-5"></path></svg>
            </span>
            <span class="font-mono text-sm px-3 py-1 rounded-full bg-[#FBEEF0] text-[#B0121F]">${quote.id}</span>
            <h1 class="font-serif text-[26px] sm:text-[34px] leading-tight text-[#131A16] m-0">¡Tu solicitud fue recibida!</h1>
            <p class="m-0 text-[#56616A] text-[17px] max-w-[560px]">Un asesor comercial se pondrá en contacto contigo a la brevedad para enviarte la cotización y responder a tus requerimientos.</p>
            <!-- Pedido del dueño: que la solicitud llegue al WhatsApp de Olivo. Va primero, justo bajo el título. -->
            <div class="w-full max-w-[540px] mt-2 rounded-2xl border border-[#CBD9D0] bg-[#F2F8F3] px-5 py-5 flex flex-col gap-3 items-center">
              <strong class="text-[17px] text-[#17472C]" style="font-family: var(--font-heading)">Envíala ahora por WhatsApp</strong>
              <span class="text-[15px] text-[#56616A]">Tu asesor comercial la recibe al instante, con tus datos y todos los productos. Solo presiona «Enviar» en WhatsApp.</span>
              <a href="${waUrl(mensajeWhatsApp(quote))}" target="_blank" rel="noopener" data-evento="whatsapp-cotizacion" class="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 h-12 px-6 rounded-[10px] bg-[#17472C] text-white font-bold text-[15px] no-underline hover:bg-[#1F6A3E] transition" style="font-family: var(--font-heading)">
                <svg aria-hidden="true" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 11.5a8.4 8.4 0 0 1-12.3 7.4L3 21l2.1-5.6A8.4 8.4 0 1 1 21 11.5z"></path></svg>
                Enviar solicitud por WhatsApp
              </a>
            </div>
            <ol class="mt-2 p-0 list-none flex flex-col gap-2.5 text-left w-full max-w-[460px]">
              ${[`Te llega una copia de tu lista a <strong>${escapeHtml(quote.email)}</strong>`, 'Tu asesor comercial te envía la cotización', `Confirmas y despachamos en <strong>${escapeHtml(quote.comuna)}</strong>`].map((t, i) => `
                <li class="flex gap-3 items-center"><span class="flex-none w-7 h-7 rounded-lg bg-[#F2F8F3] text-[#17472C] font-extrabold flex items-center justify-center text-[13px]">${i + 1}</span><span>${t}</span></li>`).join('')}
            </ol>
            <div class="flex flex-wrap gap-3 justify-center pt-2">
              <button type="button" onclick="window.OlivoApp.setView('landing')" class="btn-olive h-12 px-5 text-sm">Volver al inicio</button>
              <button type="button" onclick="window.OlivoApp.openSimulatedEmailModal('${quote.id}')" class="btn-outline-olive h-12 px-5 text-sm"><i data-lucide="mail-check" class="w-4 h-4"></i>Ver correo de confirmación</button>
            </div>
          </section>
        </div>
      </div>`;
    if (window.lucide) window.lucide.createIcons();
  }

  // =========================================================================
  // MODALES INTERACTIVOS
  // =========================================================================
  
  // 1. MODAL FICHA TÉCNICA DEL PRODUCTO (SIN PRECIO)
  function openProductModal(productId) {
    const p = state.products.find(item => item.id === productId);
    if (!p) return;
    state.selectedProductModal = p;

    const modal = document.getElementById('productDetailModal');
    if (!modal) return;

    modal.innerHTML = `
      <div class="modal-backdrop fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto max-sm:items-end max-sm:p-0" onclick="if(event.target === this) window.OlivoApp.closeModal('productDetailModal')">
        <div role="dialog" aria-modal="true" aria-labelledby="fichaTitulo" class="bg-white rounded-3xl max-w-3xl w-full border border-[#E4E9E7] shadow-2xl overflow-hidden relative animate-in fade-in zoom-in-95 duration-200 max-sm:rounded-b-none max-sm:max-h-[92vh] max-sm:max-h-[92dvh] max-sm:overflow-y-auto max-sm:overscroll-contain">
          
          <button type="button" id="fichaCerrar" onclick="window.OlivoApp.closeModal('productDetailModal')" aria-label="Cerrar ficha" class="absolute top-4 right-4 max-sm:top-2 max-sm:right-2 z-10 w-11 h-11 rounded-full bg-white/95 text-[#17472C] flex items-center justify-center shadow-md hover:bg-white transition">
            <i data-lucide="x" class="w-5 h-5"></i>
          </button>

          <div class="grid grid-cols-1 md:grid-cols-2">
            <div class="relative bg-white min-h-[300px] aspect-square md:aspect-auto flex max-sm:min-h-0 max-sm:aspect-[4/3]">
              ${fotoProducto(p, 'w-full h-full')}
              <div class="absolute bottom-4 left-4 right-4 p-3 rounded-xl bg-white/90 backdrop-blur-md border border-[#E4E9E7] text-xs">
                <span class="text-[#626D76] block text-[10px] uppercase font-bold">Código SKU Distribuidora</span>
                <span class="font-mono font-bold text-[#17472C] text-sm">${p.sku}</span>
              </div>
            </div>

            <div class="p-6 sm:p-8 flex flex-col justify-between gap-4 max-sm:p-4 max-sm:pb-[calc(16px+env(safe-area-inset-bottom))]">
              <div>
                <div class="flex flex-wrap items-center gap-2 mb-2">
                  <span class="badge-gold text-[10px]">${p.brand ? escapeHtml(p.brand) : 'Marca por confirmar'}</span>
                  <span class="badge-olive text-[10px]">${p.categoryName}</span>
                </div>

                <h3 id="fichaTitulo" class="text-xl font-serif font-bold text-[#131A16] leading-tight">${p.name}</h3>

                <p class="text-sm text-[#56616A] leading-relaxed mt-2.5">${p.description ? p.description : 'Ficha completa, vida útil y empaque máster: pídelos a tu asesor comercial junto con la cotización.'}</p>

                <dl class="mt-4 pt-4 border-t border-[#E4E9E7] text-[13px] m-0">
                  ${[['Presentación', formatoTexto(p)], ['Línea', escapeHtml(p.categoryName)], ['Subcategoría', escapeHtml(p.subcategoryName)], p.unit ? ['Unidad comercial', escapeHtml(p.unit)] : null]
                    .concat(Object.entries(p.specs || {}).map(([k, v]) => [escapeHtml(k), escapeHtml(v)]))
                    .filter(Boolean).map(([k, v]) => `
                    <div class="flex justify-between gap-3 py-1.5 border-b border-[#EEF2EF]">
                      <dt class="text-[#626D76]">${k}</dt>
                      <dd class="m-0 font-bold text-[#17472C] text-right">${v}</dd>
                    </div>`).join('')}
                </dl>
              </div>

              <div class="pt-4 border-t border-[#E4E9E7] flex flex-col gap-3">
                <div class="flex items-center gap-3">
                  <div role="group" aria-label="Cantidad" class="flex items-center border border-[#E4E9E7] rounded-[10px] overflow-hidden flex-none">
                    <button type="button" onclick="window.OlivoApp.stepModalQty(-1)" aria-label="Restar una unidad" class="w-10 h-11 bg-white text-[#17472C] text-lg font-bold hover:bg-[#F2F8F3] transition">−</button>
                    <input id="modalQtyInput" type="number" inputmode="numeric" min="1" value="1" aria-label="Cantidad" class="w-11 text-center bg-transparent text-base font-extrabold text-[#1A1F1C] outline-none tabular-nums" />
                    <button type="button" onclick="window.OlivoApp.stepModalQty(1)" aria-label="Sumar una unidad" class="w-10 h-11 bg-white text-[#17472C] text-lg font-bold hover:bg-[#F2F8F3] transition">+</button>
                  </div>

                  <button type="button" onclick="window.OlivoApp.addCurrentModalProductToQuote()" class="flex-grow btn-gold h-11 text-sm justify-center">
                    <i data-lucide="file-plus" class="w-4 h-4"></i>
                    <span>Agregar a cotización</span>
                  </button>
                </div>
              </div>

            </div>
          </div>

        </div>
      </div>
    `;
    state.focoAntesModal = document.activeElement;
    modal.classList.remove('hidden');
    iconos();
    const cerrar = document.getElementById('fichaCerrar');
    if (cerrar) cerrar.focus({ preventScroll: true });
  }

  // 2. MODAL SIMULADOR DE CORREO AUTOMÁTICO ENVIADO AL CLIENTE
  function openSimulatedEmailModal(quoteId) {
    const q = state.lastSubmittedQuote;
    if (!q) return;

    const modal = document.getElementById('emailViewerModal');
    if (!modal) return;

    modal.innerHTML = `
      <div class="modal-backdrop fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto" onclick="if(event.target === this) window.OlivoApp.closeModal('emailViewerModal')">
        <div class="bg-white rounded-3xl max-w-2xl w-full border border-[#E4E9E7] shadow-2xl overflow-hidden relative animate-in fade-in duration-200">
          
          <div class="bg-[#17472C] text-white p-4 sm:px-6 flex items-center justify-between">
            <div class="flex items-center gap-2 text-xs">
              <i data-lucide="mail" class="w-4 h-4 text-[#7BD192]"></i>
              <span class="font-bold text-[#7BD192] uppercase tracking-wider">Vista previa del correo al cliente</span>
            </div>
            <button type="button" onclick="window.OlivoApp.closeModal('emailViewerModal')" aria-label="Cerrar vista previa" class="w-11 h-11 -my-2 -mr-2 rounded-full text-white/80 hover:text-white hover:bg-white/10 flex items-center justify-center"><i data-lucide="x" class="w-5 h-5"></i></button>
          </div>

          <div class="bg-[#F8FAF9] p-4 sm:px-6 border-b border-[#E4E9E7] text-xs space-y-1.5 font-mono">
            <div><span class="text-[#626D76]">De:</span> <strong class="text-[#17472C]">Distribuidora Olivo &lt;ventasolivocorp@gmail.com&gt;</strong></div>
            <div><span class="text-[#626D76]">Para:</span> <strong class="text-[#17472C]">${q.clientName} &lt;${q.email}&gt;</strong></div>
            <div><span class="text-[#626D76]">Asunto:</span> <strong class="text-[#17472C]">Confirmación de Solicitud de Cotización N° ${q.id} — Distribuidora Olivo</strong></div>
          </div>

          <div class="p-6 sm:p-8 space-y-6 max-h-[70vh] overflow-y-auto">
            
            <div class="flex items-center justify-between border-b border-[#CF1427]/40 pb-4">
              <div>
                <div class="text-xl font-black text-[#CF1427]" style="font-family: var(--font-heading); letter-spacing: -0.01em">OLIVO</div>
                <div class="text-[10px] text-[#56616A] uppercase font-bold tracking-widest">Distribuidora de Alimentos y Productos</div>
              </div>
              <span class="text-xs font-mono text-[#626D76]">${formatDate(q.date)}</span>
            </div>

            <div class="space-y-3 text-sm text-[#1A1F1C]">
              <p>Estimado/a <strong>${q.clientName}</strong> (${q.companyName}),</p>
              
              <div class="p-4 rounded-xl bg-[#F2F8F3] border border-[#17472C]/10 text-xs text-[#17472C] leading-relaxed">
                <strong>«¡Tu solicitud fue recibida! Un asesor comercial se pondrá en contacto contigo a la brevedad para enviarte la cotización y responder a tus requerimientos».</strong>
              </div>

              <p class="text-xs text-[#56616A] leading-relaxed">
                Hemos registrado tu solicitud bajo el código de seguimiento <strong>${q.id}</strong> para despacho en <strong>${q.comuna}</strong>. Nuestro asesor comercial te enviará la propuesta formal con precios netos e IVA.
              </p>
            </div>

            <div>
              <h4 class="text-xs font-bold uppercase text-[#17472C] mb-2">Detalle de Insumos Solicitados:</h4>
              <table class="w-full text-left text-xs border border-[#E4E9E7] rounded-xl overflow-hidden">
                <thead class="bg-[#F8FAF9] text-[#17472C] uppercase text-[10px] font-bold border-b border-[#E4E9E7]">
                  <tr>
                    <th class="py-2.5 px-3">SKU</th>
                    <th class="py-2.5 px-3">Producto</th>
                    <th class="py-2.5 px-3">Presentación</th>
                    <th class="py-2.5 px-3 text-center">Cant.</th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-[#E4E9E7]">
                  ${q.items.map(item => `
                    <tr>
                      <td class="py-2.5 px-3 font-mono font-semibold text-[#626D76]">${item.sku}</td>
                      <td class="py-2.5 px-3 font-semibold text-[#17472C]">${item.name}</td>
                      <td class="py-2.5 px-3 text-[#56616A]">${item.format || 'Por confirmar'}</td>
                      <td class="py-2.5 px-3 text-center font-bold text-[#17472C]">${item.quantity}</td>
                    </tr>
                  `).join('')}
                </tbody>
              </table>
            </div>

            <div class="p-4 rounded-xl bg-[#F8FAF9] border border-[#E4E9E7] text-xs space-y-1">
              <span class="text-[#626D76] block">Atención Comercial V Región:</span>
              <strong class="text-[#17472C] block text-sm">Equipo comercial Distribuidora Olivo</strong>
              <span class="text-[#56616A] block">WhatsApp Comercial: +56 9 7723 6128 | ventasolivocorp@gmail.com</span>
            </div>

            <div class="text-[11px] text-[#626D76] border-t border-[#E4E9E7] pt-4 text-center">
              Distribuidora Olivo • Viña del Mar, Valparaíso, Chile • www.distribuidoraolivo.cl
            </div>

          </div>

          <div class="bg-[#F8FAF9] p-4 px-6 border-t border-[#E4E9E7] flex items-center justify-between text-xs">
            <span class="text-[#626D76]">Simulación de notificación transaccional</span>
            <button type="button" onclick="window.OlivoApp.closeModal('emailViewerModal')" class="btn-olive py-1.5 px-4 text-xs">
              Cerrar
            </button>
          </div>

        </div>
      </div>
    `;
    modal.classList.remove('hidden');
    if (window.lucide) window.lucide.createIcons();
  }

  // =========================================================================
  // SLIDE-OVER CART DRAWER
  // =========================================================================
  function renderCartDrawer() {
    const drawer = document.getElementById('cartDrawer');
    if (!drawer) return;

    const count = state.cart.reduce((s, i) => s + i.quantity, 0);

    drawer.innerHTML = `
      <div class="drawer-root fixed inset-0 z-50 flex justify-end" data-open="${state.isCartDrawerOpen}" ${state.isCartDrawerOpen ? 'role="dialog" aria-modal="true" aria-label="Tu lista de cotización"' : 'aria-hidden="true"'}>
        <div onclick="window.OlivoApp.toggleCartDrawer(false)" class="absolute inset-0 bg-black/50 backdrop-blur-sm"></div>

        <div class="relative w-full max-w-md bg-white h-full shadow-2xl flex flex-col justify-between z-10 transform transition-transform duration-300 ${state.isCartDrawerOpen ? 'translate-x-0' : 'translate-x-full'}">
          
          <div class="p-5 border-b border-[#E4E9E7] flex items-center justify-between bg-[#F8FAF9]">
            <div class="flex items-center gap-2.5">
              <i data-lucide="shopping-bag" class="w-5 h-5 text-[#CF1427]"></i>
              <div>
                <h3 class="font-serif font-bold text-[#131A16] text-base m-0">Tu lista de cotización</h3>
                <span class="text-xs text-[#626D76]">${state.cart.length} ${state.cart.length === 1 ? 'producto' : 'productos'} · ${count} ${count === 1 ? 'unidad' : 'unidades'}</span>
              </div>
            </div>
            <button type="button" onclick="window.OlivoApp.toggleCartDrawer(false)" aria-label="Cerrar la lista" class="w-11 h-11 rounded-full hover:bg-white flex items-center justify-center text-[#56616A]">
              <i data-lucide="x" class="w-5 h-5"></i>
            </button>
          </div>

          <div class="p-5 overflow-y-auto flex-grow divide-y divide-[#E4E9E7]">
            ${state.cart.length === 0 ? `
              <div class="py-16 text-center space-y-3">
                <div class="w-16 h-16 rounded-full bg-[#F8FAF9] text-[#626D76] flex items-center justify-center mx-auto">
                  <i data-lucide="package" class="w-8 h-8"></i>
                </div>
                <h4 class="font-bold text-[#17472C] text-sm">No hay productos en tu cotización</h4>
                <p class="text-xs text-[#56616A] max-w-xs mx-auto">Explora el catálogo y agrega los insumos que requiera tu negocio.</p>
                <button type="button" onclick="window.OlivoApp.toggleCartDrawer(false); window.OlivoApp.setView('catalog')" class="btn-gold text-sm min-h-[44px] py-2 px-4 mt-2">
                  Explorar Catálogo
                </button>
              </div>
            ` : state.cart.map(item => `
              <div class="py-3.5 flex items-start justify-between gap-3">
                ${fotoProducto(productoActual(item), 'w-14 h-14 rounded-lg border border-[#E4E9E7] flex-shrink-0 overflow-hidden', true)}
                <div class="flex-grow min-w-0">
                  <span class="text-[10px] font-mono font-semibold text-[#626D76]">${item.sku}</span>
                  <h5 class="text-[13px] font-bold text-[#17472C] leading-tight line-clamp-2 m-0" style="font-family: var(--font-heading)">${item.name}</h5>
                  <div class="text-[12px] text-[#56616A] mt-0.5">${formatoTexto(item)}</div>

                  <div class="flex items-center gap-2 mt-2">
                    <div role="group" aria-label="Cantidad" class="flex items-center border border-[#E4E9E7] rounded-[10px] overflow-hidden text-sm">
                      <button type="button" onclick="window.OlivoApp.updateCartItemQty('${item.productId}', -1)" aria-label="Restar una unidad" class="w-11 h-11 bg-white text-[#17472C] font-bold hover:bg-[#F2F8F3]">−</button>
                      <span class="w-8 text-center font-extrabold text-[#1A1F1C] tabular-nums" aria-live="polite">${item.quantity}</span>
                      <button type="button" onclick="window.OlivoApp.updateCartItemQty('${item.productId}', 1)" aria-label="Sumar una unidad" class="w-11 h-11 bg-white text-[#17472C] font-bold hover:bg-[#F2F8F3]">+</button>
                    </div>
                    <span class="text-[10px] font-extrabold uppercase tracking-[0.06em] px-2 py-0.5 rounded-full bg-[#FBEEF0] text-[#B0121F]">Bajo cotización</span>
                  </div>
                </div>

                <button type="button" onclick="window.OlivoApp.removeCartItem('${item.productId}')" aria-label="Quitar ${escapeHtml(item.name)} de la lista" class="w-11 h-11 rounded-[10px] text-[#A33A2E] hover:bg-[#FBEDEB] flex items-center justify-center transition flex-none">
                  <i data-lucide="trash-2" class="w-4 h-4"></i>
                </button>
              </div>
            `).join('')}
          </div>

          ${state.cart.length > 0 ? `
            <div class="p-5 pb-[calc(20px+env(safe-area-inset-bottom))] border-t border-[#E4E9E7] bg-[#F8FAF9] space-y-3">
              <div class="p-2.5 rounded-lg bg-white border border-[#CF1427]/30 text-[11px] text-[#56616A]">
                <strong>Despacho V Región:</strong> Precios valorizados según volumen y comuna.
              </div>
              <button type="button" onclick="window.OlivoApp.toggleCartDrawer(false); window.OlivoApp.setView('checkout')" class="w-full btn-gold min-h-[48px] py-3 text-sm font-bold justify-center shadow-lg">
                <span>Continuar a Solicitud de Cotización</span>
                <i data-lucide="arrow-right" class="w-4 h-4"></i>
              </button>
            </div>
          ` : ''}

        </div>
      </div>
    `;
    if (window.lucide) window.lucide.createIcons();
  }

  function toggleCartDrawer(open) {
    const antes = state.isCartDrawerOpen;
    state.isCartDrawerOpen = open !== undefined ? open : !state.isCartDrawerOpen;
    if (state.isCartDrawerOpen && !antes) state.focoAntesLista = document.activeElement;
    renderCartDrawer();
    if (state.isCartDrawerOpen && !antes) {
      const b = document.querySelector('#cartDrawer [aria-label="Cerrar la lista"]');
      if (b) b.focus({ preventScroll: true });
    } else if (!state.isCartDrawerOpen && antes && state.focoAntesLista && document.contains(state.focoAntesLista)) {
      state.focoAntesLista.focus({ preventScroll: true });
    }
  }

  // =========================================================================
  // ACCIONES Y HANDLERS
  // =========================================================================
  // RUT chileno: formato + dígito verificador (mismo cálculo que el servidor)
  function rutValido(rut) {
    const limpio = String(rut || '').replace(/[^0-9kK]/g, '').toUpperCase();
    if (limpio.length < 8 || limpio.length > 9) return false;
    const cuerpo = limpio.slice(0, -1), dv = limpio.slice(-1);
    let suma = 0, factor = 2;
    for (let i = cuerpo.length - 1; i >= 0; i--) { suma += Number(cuerpo[i]) * factor; factor = factor === 7 ? 2 : factor + 1; }
    const resto = 11 - (suma % 11);
    const esperado = resto === 11 ? '0' : resto === 10 ? 'K' : String(resto);
    return dv === esperado;
  }

  // Guarda el origen de campaña (Google Ads / UTM) de la visita para adjuntarlo a la cotización
  function capturarCampania() {
    try {
      const p = new URLSearchParams(window.location.search);
      const claves = ['gclid', 'fbclid', 'utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content'];
      const nuevo = {};
      claves.forEach(k => { if (p.get(k)) nuevo[k] = p.get(k).slice(0, 200); });
      if (Object.keys(nuevo).length) sessionStorage.setItem('olivo_tracking', JSON.stringify(nuevo));
    } catch (e) {}
  }
  function leerCampania() {
    let t = {};
    try { t = JSON.parse(sessionStorage.getItem('olivo_tracking') || '{}'); } catch (e) {}
    // Identificadores del Meta Pixel (cookies _fbp y _fbc): el servidor los manda a la API de conversiones
    const cookie = (n) => { const m = document.cookie.match(new RegExp('(?:^|; )' + n + '=([^;]*)')); return m ? decodeURIComponent(m[1]) : ''; };
    const fbp = cookie('_fbp');
    let fbc = cookie('_fbc');
    if (!fbc && t.fbclid) fbc = 'fb.1.' + Date.now() + '.' + t.fbclid;
    if (fbp) t.fbp = fbp;
    if (fbc) t.fbc = fbc;
    t.url = window.location.origin + window.location.pathname;
    return t;
  }

  // ---------- Meta Pixel ----------
  // fbq lo define el código del Pixel en index.html; si un bloqueador lo impide, no pasa nada.
  function pixel(evento, datos, idEvento) {
    try {
      if (typeof window.fbq !== 'function') return;
      if (idEvento) window.fbq('track', evento, datos || {}, { eventID: idEvento });
      else window.fbq('track', evento, datos || {});
    } catch (e) {}
  }

  // URL del microservicio (cPanel). Se puede cambiar con <meta name="olivo-api" content="..."> en index.html.
  const API_COTIZAR = (document.querySelector('meta[name="olivo-api"]') || {}).content || 'api/cotizar.php';
  const ES_LOCAL = /^(localhost|127\.0\.0\.1|\[::1\])$/.test(window.location.hostname);

  async function submitQuotation(form) {
    if (state.cart.length === 0) {
      showToast("Agrega al menos un producto para cotizar", "error");
      return;
    }
    if (state.enviandoCotizacion) return;

    const formData = new FormData(form);
    const v = (k) => (formData.get(k) || '').toString().trim();
    const errores = {};
    if (!v('clientName')) errores.clientName = true;
    if (!/^[0-9+\s().-]{8,30}$/.test(v('phone'))) errores.phone = true;
    if (!/^\S+@\S+\.\S+$/.test(v('email'))) errores.email = true;
    if (!v('companyName')) errores.companyName = true;
    if (!v('comuna')) errores.comuna = true;
    state.checkoutForm = Object.fromEntries(formData.entries());
    if (Object.keys(errores).length) {
      state.checkoutErrors = errores;
      marcarErrores(form, errores);
      return;
    }
    state.checkoutErrors = {};

    const payload = {
      clientName: v('clientName'), phone: v('phone'), email: v('email'), companyName: v('companyName'),
      comuna: v('comuna'), notes: v('notes'),
      website: v('website'),
      tracking: leerCampania(),
      items: state.cart.map(i => ({ sku: i.sku, name: i.name, brand: i.brand, format: i.format, quantity: i.quantity }))
    };

    const boton = form.querySelector('button[type="submit"]');
    const textoBoton = boton ? boton.innerHTML : '';
    state.enviandoCotizacion = true;
    // Evita envíos duplicados: botón desactivado y formulario marcado como ocupado mientras responde el servidor
    if (boton) { boton.disabled = true; boton.innerHTML = 'Enviando solicitud…'; }
    form.setAttribute('aria-busy', 'true');
    const restaurar = () => { state.enviandoCotizacion = false; form.removeAttribute('aria-busy'); if (boton) { boton.disabled = false; boton.innerHTML = textoBoton; } };

    let codigo = null;
    try {
      const res = await fetch(API_COTIZAR, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await res.json().catch(() => null);
      if (res.ok && data && data.ok) {
        codigo = data.codigo;
      } else if (res.status === 422 && data && data.errores) {
        state.checkoutErrors = data.errores;
        restaurar();
        if (data.errores.items) showToast('Tu lista está vacía o tiene productos no válidos', 'error');
        marcarErrores(form, data.errores);
        return;
      } else if (res.status === 429) {
        restaurar();
        showToast('Recibimos varias solicitudes seguidas. Espera unos minutos o escríbenos por WhatsApp.', 'error');
        return;
      } else if (!ES_LOCAL) {
        throw new Error('respuesta ' + res.status);
      }
    } catch (e) {
      if (!ES_LOCAL) {
        restaurar();
        showToast('No pudimos enviar tu solicitud. Inténtalo de nuevo o llámanos al +56 9 7723 6128.', 'error');
        return;
      }
    }

    // En el computador local no hay PHP: se simula el código para poder probar el recorrido.
    if (!codigo) {
      codigo = 'COT-' + new Date().getFullYear() + '-LOCAL' + Math.floor(100 + Math.random() * 900);
      console.warn('[Olivo] Microservicio no disponible en local: código simulado', codigo);
    }

    state.lastSubmittedQuote = {
      id: codigo,
      date: new Date().toISOString(),
      clientName: payload.clientName, companyName: payload.companyName, rut: payload.rut,
      email: payload.email, phone: payload.phone, businessType: payload.businessType,
      comuna: payload.comuna, notes: payload.notes,
      items: payload.items.map(i => ({ ...i }))
    };
    restaurar();
    state.checkoutStep = 1;
    state.checkoutForm = {};
    state.cart = [];
    saveState();
    updateCartUI();
    showToast(`¡Solicitud ${codigo} enviada con éxito!`);
    // Conversión: «Lead» con el código de la cotización como ID (el servidor envía el mismo ID → Meta no lo cuenta doble)
    pixel('Lead', { content_name: 'Solicitud de cotización', content_category: 'Portal mayorista', num_items: payload.items.length }, codigo);
    setView('confirmation');
  }

  function handleQuickContactSubmit(form) {
    showToast("¡Mensaje recibido! Un asesor comercial de Olivo se comunicará con tu negocio.");
    form.reset();
  }

  function closeModal(modalId) {
    const el = document.getElementById(modalId);
    if (el) el.classList.add('hidden');
    const f = state.focoAntesModal;
    if (f && document.contains(f)) f.focus({ preventScroll: true });
    state.focoAntesModal = null;
  }

  function stepProductCardQty(productId, delta) {
    const input = document.getElementById(`qty-input-${productId}`);
    if (input) {
      const val = Math.max(1, (parseInt(input.value) || 1) + delta);
      input.value = val;
    }
  }

  // Agregar desde la tarjeta: solo cambia ese botón («✓ Agregado» y luego «En tu lista · N»),
  // el contador y la barra inferior. Antes se redibujaba todo el catálogo en cada toque.
  function addProductToQuoteFromCard(productId) {
    const input = document.getElementById(`qty-input-${productId}`);
    const qty = input ? Math.max(1, parseInt(input.value) || 1) : 1;
    addToCart(productId, qty);
    if (input) input.value = 1;
    document.querySelectorAll(`[data-add="${productId}"]`).forEach(btn => {
      btn.dataset.estado = 'agregado';
      btn.innerHTML = '✓ Agregado';
      clearTimeout(btn._t);
      btn._t = setTimeout(() => { delete btn.dataset.estado; pintarBotonesAgregar(productId); }, 1400);
    });
  }

  // Vuelve a dibujar la categoría sin perder el foco del buscador ni la posición de la página.
  function rerenderCatalog(mantenerFocoBusqueda = false) {
    const main = document.getElementById('appContent');
    if (!main) return;
    const y = window.scrollY;
    const prev = document.getElementById('catalogSearch');
    const cursor = prev && document.activeElement === prev ? prev.selectionStart : null;
    renderCatalogView(main);
    iconos();
    window.scrollTo(0, y);   // sin scroll-behavior global, la posición se restaura sin animación
    if (mantenerFocoBusqueda || cursor !== null) {
      const s = document.getElementById('catalogSearch');
      if (s) { s.focus(); const pos = cursor ?? s.value.length; s.setSelectionRange(pos, pos); }
    }
  }

  function stepModalQty(delta) {
    const input = document.getElementById('modalQtyInput');
    if (input) {
      input.value = Math.max(1, (parseInt(input.value) || 1) + delta);
    }
  }

  function addCurrentModalProductToQuote() {
    if (!state.selectedProductModal) return;
    const input = document.getElementById('modalQtyInput');
    const qty = input ? Math.max(1, parseInt(input.value) || 1) : 1;
    addToCart(state.selectedProductModal.id, qty);
    closeModal('productDetailModal');
  }

  function setFilterCategory(catId) {
    state.filter.categoryId = catId;
    state.filter.subcategoryId = 'all';
    state.filter.search = '';
    state.filter.scope = 'cat';
    state.catalogY = 0;
    setView('catalog');
  }

  function setFilterSubcategory(subId) {
    state.filter.subcategoryId = subId;
    if (state.filter.scope === 'global') {
      state.filter.search = ''; state.filter.scope = 'cat';
      const g = document.getElementById('globalSearchInput');
      if (g) g.value = '';
    }
    const mainContainer = document.getElementById('appContent');
    if (mainContainer && state.currentView === 'catalog') {
      refrescarCatalogo({ alInicio: true });
    } else {
      state.catalogY = 0;
      setView('catalog');
    }
  }

  // scope 'global' = buscador del encabezado (todas las líneas); 'cat' = filtro dentro de la línea
  function handleSearchInput(query, scope = 'global') {
    state.filter.search = query;
    state.filter.scope = scope;
    if (scope === 'global') state.filter.subcategoryId = 'all';
    if (state.currentView !== 'catalog') {
      state.catalogY = 0;
      setView('catalog');
    } else if (scope === 'cat') {
      refrescarCatalogo();          // no se reemplaza el buscador: el teclado del celular no se cierra
    } else {
      refrescarCatalogo({ alInicio: true });
    }
  }

  function setSortBy(sortBy) {
    state.filter.sortBy = sortBy;
    refrescarCatalogo({ alInicio: true });
  }

  // Limpia búsqueda y subcategoría, pero se queda en la misma línea.
  function resetFilters() {
    state.filter.search = '';
    state.filter.scope = 'cat';
    state.filter.subcategoryId = 'all';
    const g = document.getElementById('globalSearchInput');
    if (g) g.value = '';
    refrescarCatalogo();
  }

  // =========================================================================
  // INICIALIZACIÓN
  // =========================================================================
  function init() {
    capturarCampania();

    // Alto real del encabezado fijo → variable CSS (barra de chips, márgenes al enfocar campos)
    const hdr = document.getElementById('siteHeader');
    if (hdr) {
      const fijarAlto = () => document.documentElement.style.setProperty('--header-h', hdr.offsetHeight + 'px');
      fijarAlto();
      if ('ResizeObserver' in window) new ResizeObserver(fijarAlto).observe(hdr);
    }

    setView('landing');
    updateCartUI();

    // Con el teclado abierto en el celular se oculta la barra inferior (no tapa el campo)
    const esCampoTexto = (el) => el && (el.tagName === 'TEXTAREA' || (el.tagName === 'INPUT' && /^(text|search|email|tel|number|url|password)$/.test(el.type)));
    document.addEventListener('focusin', (e) => { if (esCampoTexto(e.target)) document.body.classList.add('teclado'); });
    document.addEventListener('focusout', (e) => { if (esCampoTexto(e.target)) document.body.classList.remove('teclado'); });

    // Buscador del encabezado: Enter o la lupa llevan a los resultados; dentro del catálogo filtra mientras escribes
    const globalSearchInput = document.getElementById('globalSearchInput');
    const buscar = () => { if (globalSearchInput.value.trim()) handleSearchInput(globalSearchInput.value, 'global'); };
    if (globalSearchInput) {
      globalSearchInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') { e.preventDefault(); buscar(); }
      });
      globalSearchInput.addEventListener('input', () => {
        if (state.currentView !== 'catalog') return;
        if (globalSearchInput.value.trim()) handleSearchInput(globalSearchInput.value, 'global');
        else if (state.filter.scope === 'global') resetFilters();
      });
      const lupa = document.getElementById('globalSearchButton');
      if (lupa) lupa.addEventListener('click', buscar);
    }

    // El enlace de WhatsApp del pie usa la misma regla que el resto (app en celular, WhatsApp Web en computador)
    const pieWhatsapp = document.getElementById('footerWhatsapp');
    if (pieWhatsapp) pieWhatsapp.href = waUrl(WA_SALUDO);

    // Escape cierra la ficha, la vista del correo o la lista
    document.addEventListener('keydown', (e) => {
      if (e.key !== 'Escape') return;
      ['productDetailModal', 'emailViewerModal'].forEach(id => {
        const m = document.getElementById(id);
        if (m && !m.classList.contains('hidden')) closeModal(id);
      });
      if (state.isCartDrawerOpen) toggleCartDrawer(false);
      if (state.filtrosAbiertos) cerrarFiltros();
    });

    // Clics en WhatsApp → evento «Contact» del Meta Pixel (botones con data-evento="whatsapp…")
    document.addEventListener('click', (e) => {
      const a = e.target.closest && e.target.closest('[data-evento^="whatsapp"]');
      if (a) pixel('Contact', { content_name: a.dataset.evento });
    });

    // Placeholder corto en celular (el buscador es más angosto)
    if (globalSearchInput && window.matchMedia && window.matchMedia('(max-width: 639.98px)').matches) globalSearchInput.placeholder = 'Buscar insumos o marcas…';
  }

  // Exponer API global para eventos DOM
  window.OlivoApp = {
    state,
    setView,
    setBiz,
    saveCheckoutField,
    goCheckoutStep,
    addToCart,
    updateCartItemQty,
    setCartItemQty,
    removeCartItem,
    clearCart,
    toggleCartDrawer,
    setFilterCategory,
    setFilterSubcategory,
    handleSearchInput,
    setSortBy,
    resetFilters,
    stepProductCardQty,
    addProductToQuoteFromCard,
    openProductModal,
    stepModalQty,
    addCurrentModalProductToQuote,
    openSimulatedEmailModal,
    submitQuotation,
    handleQuickContactSubmit,
    closeModal,
    scrollToCategories,
    scrollToSteps,
    scrollToRuta,
    scrollToContact,
    setHeroSlide,
    nextHeroSlide,
    initHeroSlider,
    stopHeroSlider,
    toggleHeroPausa,
    irASeccion,
    validarCampo,
    abrirFiltros,
    cerrarFiltros,
    limpiarFiltros
  };

  document.addEventListener('DOMContentLoaded', init);

})();
