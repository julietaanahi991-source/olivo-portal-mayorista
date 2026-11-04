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
    slideInterval: null
  };

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

  function formatDate(isoString) {
    try {
      const d = new Date(isoString);
      return d.toLocaleDateString('es-CL', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
    } catch(e) {
      return isoString;
    }
  }

  function showToast(message, type = 'success') {
    const container = document.getElementById('toastContainer');
    if (!container) return;
    
    const toast = document.createElement('div');
    toast.className = `flex items-center gap-3 px-4 py-3 rounded-lg shadow-xl text-white text-sm font-medium transition-all transform duration-300 translate-y-4 opacity-0 ${
      type === 'success' ? 'bg-[#163F32] border border-[#C6A16C]' : 'bg-red-800'
    }`;
    toast.innerHTML = `
      <i data-lucide="${type === 'success' ? 'check-circle' : 'alert-circle'}" class="w-5 h-5 text-[#C6A16C]"></i>
      <span>${message}</span>
    `;
    container.appendChild(toast);
    if (window.lucide) window.lucide.createIcons();

    setTimeout(() => {
      toast.classList.remove('translate-y-4', 'opacity-0');
      toast.classList.add('translate-y-0', 'opacity-100');
    }, 10);

    setTimeout(() => {
      toast.classList.add('opacity-0', 'translate-y-2');
      setTimeout(() => toast.remove(), 300);
    }, 3500);
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
    showToast(`Agregado a cotización: ${quantity}x ${product.name}`);
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
    const badges = document.querySelectorAll('.cart-count-badge');
    badges.forEach(b => {
      b.textContent = count;
      b.style.display = count > 0 ? 'flex' : 'none';
    });

    renderCartDrawer();
    if (state.currentView === 'checkout') {
      renderCheckoutView();
    }
  }

  // =========================================================================
  // CONTROLADOR DE BANNERS AUTOMÁTICOS (HERO CAROUSEL)
  // =========================================================================
  function initHeroSlider() {
    stopHeroSlider();
    state.currentSlide = 0;
    state.slideInterval = setInterval(() => {
      nextHeroSlide();
    }, 6000);
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
    if (viewName === 'checkout' && state.currentView !== 'checkout') state.checkoutStep = 1;
    state.currentView = viewName;
    window.scrollTo({ top: 0, behavior: 'smooth' });

    // Actualizar nav active states
    document.querySelectorAll('.nav-link').forEach(link => {
      if (link.dataset.view === viewName) {
        link.classList.add('text-[#163F32]', 'font-bold', 'border-b-2', 'border-[#C6A16C]');
        link.classList.remove('text-[#566760]');
      } else {
        link.classList.remove('text-[#163F32]', 'font-bold', 'border-b-2', 'border-[#C6A16C]');
        link.classList.add('text-[#566760]');
      }
    });

    const mainContainer = document.getElementById('appContent');
    if (!mainContainer) return;

    if (viewName === 'landing') {
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
      } else if (viewName === 'checkout') {
        renderCheckoutView(mainContainer);
      } else if (viewName === 'confirmation') {
        renderConfirmationView(mainContainer);
      }
    }

    if (window.lucide) window.lucide.createIcons();
  }

  function scrollToContact() {
    if (state.currentView !== 'landing') {
      setView('landing');
      setTimeout(() => {
        const el = document.getElementById('contacto-section');
        if (el) el.scrollIntoView({ behavior: 'smooth' });
      }, 150);
    } else {
      const el = document.getElementById('contacto-section');
      if (el) el.scrollIntoView({ behavior: 'smooth' });
    }
  }

  // =========================================================================
  // VISTA 1: PORTADA v2 (propuesta UX aprobada en Claude Design)
  // =========================================================================
  const ICON_CHECK = '<svg aria-hidden="true" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#C6A16C" stroke-width="2.4"><path d="M20 6 9 17l-5-5"></path></svg>';
  const ICON_ARROW = '<svg class="cat-arrow" aria-hidden="true" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><path d="M5 12h14M12 5l7 7-7 7"></path></svg>';
  const ICON_PIN = '<svg aria-hidden="true" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#C6A16C" stroke-width="2"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>';
  const ICON_DOC = '<svg aria-hidden="true" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><path d="M14 3H6a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z"></path><path d="M14 3v6h6M8 13h8M8 17h5"></path></svg>';
  const COMUNAS = ['Viña del Mar', 'Valparaíso', 'Concón', 'Quilpué', 'Villa Alemana', 'Limache', 'Quillota'];
  const WHATSAPP = 'https://wa.me/56963041374';

  const BIZ = [
    { id: 'restaurante', label: 'Restaurante', recs: [
      { tag: 'Despensa', cat: 'alimentos', name: 'Alimentos y abarrotes', items: 'Aceite para freír en bidón, arroz, harinas y salsa de tomate en pouch.' },
      { tag: 'Cadena de frío', cat: 'congelados', name: 'Congelados', items: 'Papas prefritas en 3 cortes y camarón ecuatoriano P&D.' },
      { tag: 'Higiene SEREMI', cat: 'limpieza', name: 'Limpieza y aseo', items: 'Desengrasante pesado, lavalozas concentrado y guantes de nitrilo.' }] },
    { id: 'sushi', label: 'Local de sushi', recs: [
      { tag: 'Línea estrella', cat: 'sushi', name: 'Sushi y gastronomía oriental', items: 'Arroz Shirakiku 9 kg, nori Platinum Gold, quesos crema y panko.' },
      { tag: 'Cadena de frío', cat: 'congelados', name: 'Congelados', items: 'Camarón P&D 36/40 para tempura y ebi furai.' },
      { tag: 'Delivery', cat: 'insumos', name: 'Insumos para restaurantes', items: 'Sushi box negro antivaho y film alusa para esterillas.' }] },
    { id: 'pizzeria', label: 'Pizzería', recs: [
      { tag: 'Formato gastronómico', cat: 'lacteos', name: 'Lácteos y refrigerados', items: 'Mozzarella en barra de 3,5 kg y parmesano en horma.' },
      { tag: 'Despensa', cat: 'alimentos', name: 'Alimentos y abarrotes', items: 'Harina Mont Blanc, salsa pizza lista para usar y aceite de oliva.' },
      { tag: 'Mesón', cat: 'insumos', name: 'Insumos para restaurantes', items: 'Rollos térmicos 80x80 para POS y comandas.' }] },
    { id: 'cafeteria', label: 'Cafetería', recs: [
      { tag: 'Formato gastronómico', cat: 'lacteos', name: 'Lácteos y refrigerados', items: 'Crema UHT, leche entera en caja y mantequilla en barra.' },
      { tag: 'Cadena de frío', cat: 'congelados', name: 'Congelados', items: 'Pulpas de fruta Río Alto: maracuyá, mango, frambuesa y frutilla.' },
      { tag: 'Para llevar', cat: 'insumos', name: 'Insumos para restaurantes', items: 'Bowls kraft con tapa y servilletas dobladas.' }] },
    { id: 'minimarket', label: 'Minimarket', recs: [
      { tag: 'Despensa', cat: 'alimentos', name: 'Alimentos y abarrotes', items: 'Arroz, azúcar, sal y pastas en fardo para reventa.' },
      { tag: 'Rotación alta', cat: 'limpieza', name: 'Limpieza y aseo', items: 'Cloro, papel higiénico jumbo y bolsas de aseo.' },
      { tag: 'Refrigerados', cat: 'lacteos', name: 'Lácteos y refrigerados', items: 'Leche UHT en caja de 12 y mantequilla.' }] }
  ];

  const CAT_CARDS = [
    { id: 'sushi', tag: 'Alta demanda', name: 'Sushi y gastronomía oriental', desc: 'Arroz grano corto, nori, panko, quesos crema.', img: 'images/cat-sushi.jpg' },
    { id: 'alimentos', tag: 'Línea despensa', name: 'Alimentos y abarrotes', desc: 'Aceites, harinas, arroces y pastas.', img: 'images/cat-alimentos.jpg' },
    { id: 'congelados', tag: 'Cadena de frío -18 °C', name: 'Congelados', desc: 'Camarones, papas bastón, pulpas Río Alto.', img: 'images/cat-congelados.jpg' },
    { id: 'lacteos', tag: 'Formato gastronómico', name: 'Lácteos y refrigerados', desc: 'Mozzarella, cremas UHT, quesos maduros.', img: 'images/cat-lacteos.jpg' },
    { id: 'limpieza', tag: 'Higiene SEREMI', name: 'Limpieza y aseo', desc: 'Lavalozas, cloro, desengrasantes, papel.', img: 'images/cat-limpieza.jpg' },
    { id: 'insumos', tag: 'Packaging y cocina', name: 'Insumos para restaurantes', desc: 'Film PVC, rollos térmicos, sushi box, bowls.', img: 'images/cat-insumos.jpg' }
  ];

  function renderBizRecs() {
    const biz = BIZ.find(b => b.id === state.biz) || BIZ[0];
    return biz.recs.map(r => `
      <button type="button" onclick="window.OlivoApp.setView('catalog', { category: '${r.cat}' })" class="lift text-left flex flex-col gap-2.5 p-6 bg-white border border-[#E5ECE8] rounded-2xl shadow-sm">
        <span class="self-start text-[10px] font-extrabold tracking-[0.12em] uppercase px-2.5 py-1 rounded-full bg-[#F7F1E6] text-[#8A6A3A]" style="font-family: var(--font-heading)">${r.tag}</span>
        <strong class="text-lg text-[#163F32] leading-snug" style="font-family: var(--font-heading)">${r.name}</strong>
        <span class="text-[15px] text-[#566760] flex-grow">${r.items}</span>
        <span class="inline-flex items-center gap-1.5 text-sm font-bold text-[#163F32]" style="font-family: var(--font-heading)">Ver productos <span class="text-[#C6A16C]">${ICON_ARROW}</span></span>
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
    const catCard = (c) => `
      <button type="button" onclick="window.OlivoApp.setView('catalog', { category: '${c.id}' })" class="category-card reveal text-left block h-[340px]">
        <img src="${c.img}" alt="" class="absolute inset-0 w-full h-full object-cover" style="object-position: center 20%" />
        <div class="absolute inset-0" style="background: linear-gradient(0deg, rgba(13,38,30,0.92) 0%, rgba(13,38,30,0.4) 45%, rgba(13,38,30,0) 70%)"></div>
        <div class="absolute inset-x-0 bottom-0 p-[22px] flex flex-col gap-1.5">
          <span class="self-start text-[10px] font-extrabold tracking-[0.12em] uppercase px-2.5 py-1 rounded-md bg-white/90 text-[#163F32]" style="font-family: var(--font-heading)">${c.tag}</span>
          <span class="font-serif font-bold text-[22px] leading-tight text-white">${c.name}</span>
          <span class="text-sm text-[#E3ECE7]">${c.desc}</span>
          <span class="inline-flex items-center gap-1.5 text-sm font-bold text-[#E2C79A]" style="font-family: var(--font-heading)">Ver productos ${ICON_ARROW}</span>
        </div>
      </button>`;

    container.innerHTML = `
      <!-- HERO: 2 banners con cruce suave -->
      <section class="hero-slider-container text-white relative select-none" aria-roledescription="carrusel" aria-label="Destacados" onmouseenter="window.OlivoApp.stopHeroSlider()" onmouseleave="window.OlivoApp.initHeroSlider()">
        <div class="hero-slide active">
          <img src="images/hero-cocina.jpg" alt="Cocina profesional preparando insumos" class="hero-slide-bg" />
          <div class="hero-overlay"></div>
          <div class="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full z-20">
            <div class="hero-copy max-w-[640px] flex flex-col gap-[22px]">
              <span class="self-start inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/10 border border-white/25 text-white text-[11px] font-extrabold uppercase tracking-[0.14em]" style="font-family: var(--font-heading)">${ICON_PIN} Proveedor HORECA · V Región</span>
              <h1 class="font-serif font-bold text-white text-[38px] sm:text-5xl lg:text-[60px] leading-[1.08] tracking-tight">Todo lo que tu negocio necesita, <em class="font-normal text-[#E2C79A]">en un solo lugar.</em></h1>
              <p class="text-base sm:text-lg text-[#EEF3F0] leading-relaxed max-w-[540px]">Abastecimiento integral para restaurantes, cocinas, locales de sushi y minimarkets. Insumos certificados con entrega directa en tu local.</p>
              <div class="flex flex-wrap gap-3">
                <button onclick="window.OlivoApp.setView('checkout')" class="btn-gold h-[52px] px-6 text-[15px] font-extrabold" style="font-family: var(--font-heading)">${ICON_DOC} Solicitar cotización</button>
                <button onclick="window.OlivoApp.scrollToCategories()" class="btn-glass h-[52px] px-[22px] text-[15px]" style="font-family: var(--font-heading)">Explorar catálogo <svg aria-hidden="true" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><path d="M12 5v14M19 12l-7 7-7-7"></path></svg></button>
              </div>
              <div class="flex flex-wrap gap-x-[22px] gap-y-2 text-sm text-[#EEF3F0]">
                <span class="inline-flex items-center gap-2">${ICON_CHECK}Sin registro ni login</span>
                <span class="inline-flex items-center gap-2">${ICON_CHECK}Cotización formal por correo</span>
                <span class="inline-flex items-center gap-2">${ICON_CHECK}Ejecutivo asignado</span>
              </div>
            </div>
          </div>
        </div>

        <div class="hero-slide">
          <img src="images/hero-sushi.jpg" alt="Rolls de sushi frescos" class="hero-slide-bg" />
          <div class="hero-overlay"></div>
          <div class="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full z-20">
            <div class="hero-copy max-w-[640px] flex flex-col gap-[22px]">
              <span class="self-start px-3.5 py-1.5 rounded-full bg-white/10 border border-white/25 text-white text-[11px] font-extrabold uppercase tracking-[0.14em]" style="font-family: var(--font-heading)">Línea estrella · Sushi</span>
              <h2 class="font-serif font-bold text-white text-[38px] sm:text-5xl lg:text-[60px] leading-[1.08] tracking-tight">Insumos de Alta Gama para <em class="font-normal text-[#E2C79A]">Sushi &amp; Asian Food.</em></h2>
              <p class="text-base sm:text-lg text-[#EEF3F0] leading-relaxed max-w-[540px]">Arroz grano corto, algas nori, quesos crema, panko y salsas orientales en formatos para producción diaria.</p>
              <div class="flex flex-wrap gap-3">
                <button onclick="window.OlivoApp.setView('catalog', { category: 'sushi' })" class="btn-gold h-[52px] px-6 text-[15px] font-extrabold" style="font-family: var(--font-heading)">Ver insumos de sushi ${ICON_ARROW}</button>
                <button onclick="window.OlivoApp.setView('checkout')" class="btn-glass h-[52px] px-[22px] text-[15px]" style="font-family: var(--font-heading)">Solicitar cotización</button>
              </div>
            </div>
          </div>
        </div>

        <div class="absolute left-0 right-0 bottom-24 z-30 px-4 sm:px-6 lg:px-8">
          <div class="max-w-7xl mx-auto flex items-center gap-2.5">
            <button onclick="window.OlivoApp.setHeroSlide(0)" class="hero-dot slider-dot active" aria-label="Ver destacado 1"></button>
            <button onclick="window.OlivoApp.setHeroSlide(1)" class="hero-dot slider-dot" aria-label="Ver destacado 2"></button>
          </div>
        </div>
      </section>

      <!-- CÓMO COTIZAR: 3 pasos pegados al hero -->
      <section id="como-cotizar" aria-labelledby="comoTitulo" class="relative z-30 px-4 sm:px-6 lg:px-8 -mt-16">
        <div class="max-w-7xl mx-auto bg-white border border-[#E5ECE8] rounded-2xl px-6 sm:px-8 py-7 flex flex-wrap items-center gap-x-8 gap-y-5" style="box-shadow: var(--shadow-xl)">
          <div class="flex-[1_1_200px]">
            <span class="eyebrow">Cómo cotizar</span>
            <h2 id="comoTitulo" class="font-serif text-2xl leading-tight text-[#163F32] mt-1 mb-0">Tres pasos, sin crear cuenta</h2>
          </div>
          <ol class="flex-[999_1_640px] m-0 p-0 list-none grid grid-cols-1 md:grid-cols-3 gap-4">
            ${[['Arma tu lista', 'Elige productos y cantidades del catálogo.'], ['Envía tu solicitud', 'Datos de tu local y comuna de despacho.'], ['Recibe tu cotización', 'Tu ejecutivo te responde por correo con precios y condiciones.']].map((s, i) => `
              <li class="flex gap-3.5 items-start">
                <span class="flex-none w-10 h-10 rounded-xl bg-[#163F32] text-[#C6A16C] flex items-center justify-center font-serif font-bold text-lg">${i + 1}</span>
                <span><strong class="block text-[15px] text-[#163F32]" style="font-family: var(--font-heading)">${s[0]}</strong><span class="text-sm text-[#566760]">${s[1]}</span></span>
              </li>`).join('')}
          </ol>
        </div>
      </section>

      <!-- ATAJO POR TIPO DE NEGOCIO -->
      <section aria-labelledby="negocioTitulo" class="px-4 sm:px-6 lg:px-8 pt-16 sm:pt-24 pb-16 sm:pb-[88px]">
        <div class="reveal max-w-7xl mx-auto flex flex-col gap-7">
          <div class="flex flex-col gap-2 max-w-[720px]">
            <span class="eyebrow">Atajo por tipo de negocio</span>
            <h2 id="negocioTitulo" class="font-serif text-[30px] sm:text-[38px] leading-tight text-[#163F32] m-0">¿Qué tipo de local tienes?</h2>
            <p class="m-0 text-[#566760] text-[17px]">Te mostramos primero las líneas que más usa un negocio como el tuyo.</p>
          </div>
          <div role="group" aria-label="Tipo de negocio" class="flex flex-wrap gap-2.5">
            ${BIZ.map(b => `<button type="button" class="biz-chip" data-biz="${b.id}" aria-pressed="${b.id === state.biz}" onclick="window.OlivoApp.setBiz('${b.id}')">${b.label}</button>`).join('')}
          </div>
          <div id="bizRecs" aria-live="polite" class="grid grid-cols-1 md:grid-cols-3 gap-5" style="transition: opacity 0.15s">${renderBizRecs()}</div>
        </div>
      </section>

      <!-- CATÁLOGO: 7 LÍNEAS EN GRILLA DE 4 COLUMNAS -->
      <section id="explora-section" aria-labelledby="exploraTitulo" class="px-4 sm:px-6 lg:px-8 py-16 sm:py-24 bg-[#F6F2E9]">
        <div class="max-w-7xl mx-auto flex flex-col gap-8">
          <div class="reveal flex flex-col gap-2 max-w-[680px]">
            <span class="eyebrow">Catálogo mayorista</span>
            <h2 id="exploraTitulo" class="font-serif text-[30px] sm:text-[38px] leading-tight text-[#163F32] m-0">Explora todo para tu negocio</h2>
            <p class="m-0 text-[#566760] text-[17px]">Siete líneas de abastecimiento con formatos gastronómicos y precios bajo cotización.</p>
          </div>
          <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            <button type="button" onclick="window.OlivoApp.scrollToContact()" class="category-card reveal text-left block h-[340px] sm:col-span-2">
              <div class="absolute inset-0" style="background: radial-gradient(circle at 75% 25%, #2B5E4C 0%, #163F32 45%, #0D261E 100%)"></div>
              <div class="absolute inset-0" style="background: linear-gradient(0deg, rgba(13,38,30,0.92) 0%, rgba(13,38,30,0.45) 45%, rgba(13,38,30,0) 75%)"></div>
              <div class="absolute inset-x-0 bottom-0 p-7 flex flex-col gap-2">
                <span class="self-start text-[10px] font-extrabold tracking-[0.12em] uppercase px-2.5 py-1 rounded-md bg-[#C6A16C] text-[#0D261E]" style="font-family: var(--font-heading)">Nueva línea · Próximamente</span>
                <span class="font-serif font-bold text-[30px] leading-tight text-white">Proteínas</span>
                <span class="text-[15px] text-[#E3ECE7]">Vacuno al vacío, cerdo, pollo y aves, elaborados. Pide cortes a tu ejecutivo.</span>
                <span class="inline-flex items-center gap-1.5 text-sm font-bold text-[#E2C79A]" style="font-family: var(--font-heading)">Consultar ${ICON_ARROW}</span>
              </div>
            </button>
            ${CAT_CARDS.map(catCard).join('')}
          </div>
        </div>
      </section>

      <!-- COBERTURA DE DESPACHO -->
      <section aria-labelledby="despachoTitulo" class="px-4 sm:px-6 lg:px-8 py-16 sm:py-[88px] bg-[#163F32] text-white">
        <div class="reveal max-w-7xl mx-auto flex flex-wrap items-center gap-10">
          <div class="flex-[999_1_560px] flex flex-col gap-3.5">
            <span class="eyebrow" style="color: #C6A16C">Cobertura de despacho</span>
            <h2 id="despachoTitulo" class="font-serif text-[30px] sm:text-[38px] leading-tight text-white m-0">Llegamos a tu local en toda la V Región</h2>
            <p class="m-0 text-[#D7E8DD] text-[17px] max-w-[600px]">Despacho directo en siete comunas. Revisa si tu comuna está en la ruta antes de armar tu lista.</p>
            <ul class="mt-2 p-0 list-none flex flex-wrap gap-2.5">
              ${COMUNAS.map(c => `<li class="inline-flex items-center gap-2 px-3.5 py-2 rounded-full bg-white/[0.08] border border-[#C6A16C]/45 font-semibold text-sm" style="font-family: var(--font-heading)">${ICON_PIN}${c}</li>`).join('')}
            </ul>
          </div>
          <div class="flex-[1_1_340px] bg-[#0D261E] border border-[#C6A16C]/35 rounded-2xl p-7 flex flex-col gap-4">
            <strong class="text-[17px]" style="font-family: var(--font-heading)">Condiciones comerciales</strong>
            <div class="flex gap-3 items-start text-[#D7E8DD] text-[15px]"><svg aria-hidden="true" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#C6A16C" stroke-width="2" class="flex-none mt-0.5"><path d="M3 6h11v10H3zM14 9h4l3 3v4h-7"></path><circle cx="7" cy="18" r="2"></circle><circle cx="17" cy="18" r="2"></circle></svg><span>Despachos de lunes a sábado, de 9:00 a 15:00 hrs.</span></div>
            <div class="flex gap-3 items-start text-[#D7E8DD] text-[15px]"><svg aria-hidden="true" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#C6A16C" stroke-width="2" class="flex-none mt-0.5"><circle cx="12" cy="12" r="9"></circle><path d="M12 7v5l3 2"></path></svg><span>Congelados con cadena de frío hasta tu local.</span></div>
            <div class="flex gap-3 items-start text-[#D7E8DD] text-[15px]"><svg aria-hidden="true" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#C6A16C" stroke-width="2" class="flex-none mt-0.5"><path d="M14 3H6a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z"></path><path d="M14 3v6h6"></path></svg><span>Precios netos por volumen en cotización formal, sin registro.</span></div>
          </div>
        </div>
      </section>

      <!-- GUÍAS (pillar pages, contenido por venir) -->
      <section aria-labelledby="guiasTitulo" class="px-4 sm:px-6 lg:px-8 py-16 sm:py-24 bg-white">
        <div class="max-w-7xl mx-auto flex flex-col gap-8">
          <div class="reveal flex flex-col gap-2 max-w-[680px]">
            <span class="eyebrow">Guías para tu cocina</span>
            <h2 id="guiasTitulo" class="font-serif text-[30px] sm:text-[38px] leading-tight text-[#163F32] m-0">Compra mejor, cocina mejor</h2>
            <p class="m-0 text-[#566760] text-[17px]">Contenido práctico para dueños y jefes de cocina de la V Región.</p>
          </div>
          <div class="grid grid-cols-1 md:grid-cols-3 gap-5">
            ${[['Insumos para sushi: guía para locales', 'Arroz, nori, quesos crema, salsas y packaging de delivery.'], ['Abastecimiento para restaurantes', 'Cómo planificar compras, formatos y rotación de bodega.'], ['Higiene y limpieza en cocinas', 'Químicos, guantes y protocolos para la fiscalización SEREMI.']].map(g => `
              <article class="reveal flex flex-col gap-3.5 p-7 rounded-2xl border border-[#E5ECE8] bg-[#FAF8F3]">
                <span class="flex justify-between items-center"><span class="text-[10px] font-extrabold tracking-[0.12em] uppercase text-[#163F32] bg-[#EBF2EE] px-2.5 py-1 rounded-full" style="font-family: var(--font-heading)">Guía completa</span><span class="text-xs text-[#66756E]">Próximamente</span></span>
                <strong class="font-serif text-[22px] leading-snug text-[#163F32]">${g[0]}</strong>
                <span class="text-[15px] text-[#566760]">${g[1]}</span>
              </article>`).join('')}
          </div>
        </div>
      </section>

      <!-- LLAMADO FINAL / CONTACTO -->
      <section id="contacto-section" aria-labelledby="ctaTitulo" class="px-4 sm:px-6 lg:px-8 py-16 sm:py-20 bg-[#F6F2E9]">
        <div class="reveal max-w-7xl mx-auto rounded-3xl bg-white border border-[#E5ECE8] p-8 sm:p-11 flex flex-wrap items-center justify-between gap-7" style="box-shadow: var(--shadow-lg)">
          <div class="flex-[1_1_420px] flex flex-col gap-2">
            <span class="eyebrow">Atención 1 a 1</span>
            <h2 id="ctaTitulo" class="font-serif text-[30px] sm:text-[34px] leading-tight text-[#163F32] m-0">¿Ya tienes tu lista de compras?</h2>
            <p class="m-0 text-[#566760] text-[17px]">Envíala tal cual y tu ejecutivo arma la cotización por ti.</p>
          </div>
          <div class="flex flex-wrap gap-3">
            <button onclick="window.OlivoApp.setView('checkout')" class="btn-gold h-[52px] px-6 text-[15px] font-extrabold" style="font-family: var(--font-heading)">Solicitar cotización</button>
            <a href="${WHATSAPP}" target="_blank" rel="noopener" data-evento="whatsapp" class="inline-flex items-center gap-2.5 h-[52px] px-[22px] rounded-[10px] bg-white border border-[#163F32] text-[#163F32] font-bold text-[15px] no-underline transition hover:-translate-y-px" style="font-family: var(--font-heading)">
              <svg aria-hidden="true" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 11.5a8.4 8.4 0 0 1-12.3 7.4L3 21l2.1-5.6A8.4 8.4 0 1 1 21 11.5z"></path></svg>
              WhatsApp +56 9 6304 1374
            </a>
          </div>
        </div>
      </section>
    `;
    initReveal();
  }

  function scrollToSteps() {
    const go = () => { const el = document.getElementById('como-cotizar'); if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' }); };
    if (state.currentView !== 'landing') { setView('landing'); setTimeout(go, 150); } else { go(); }
  }

  function scrollToCategories() {
    const el = document.getElementById('explora-section');
    if (el) el.scrollIntoView({ behavior: 'smooth' });
    else setView('catalog');
  }

  // =========================================================================
  // VISTA 2: CATÁLOGO B2B Y SUBDIVISIONES (SIN PRECIOS)
  // =========================================================================
  function renderCatalogView(container) {
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

    const q = (state.filter.search || '').toLowerCase();
    let filtered = enCategoria.filter(p => {
      if (state.filter.subcategoryId !== 'all' && p.subcategoryId !== state.filter.subcategoryId) return false;
      if (!q) return true;
      return (p.name + ' ' + p.sku + ' ' + p.brand + ' ' + p.description).toLowerCase().includes(q);
    });
    if (state.filter.sortBy === 'name') filtered.sort((a, b) => a.name.localeCompare(b.name));
    else if (state.filter.sortBy === 'brand') filtered.sort((a, b) => a.brand.localeCompare(b.brand));

    const enLista = (id) => state.cart.find(i => i.productId === id);
    const totalLista = state.cart.length;
    const subBtn = (id, name, count) => {
      const on = state.filter.subcategoryId === id;
      return `
        <button type="button" onclick="window.OlivoApp.setFilterSubcategory('${id}')" aria-pressed="${on}"
          class="w-full flex justify-between items-center gap-2.5 min-h-[44px] px-3 py-2 rounded-[10px] text-left text-sm leading-snug transition ${on ? 'bg-white text-[#163F32] font-bold' : 'text-[#1A2822] font-medium hover:bg-[#F3F8F5]'}"
          style="font-family: var(--font-heading);${on ? ' box-shadow: inset 3px 0 0 #C6A16C, 0 1px 3px rgba(18,42,33,.08);' : ''}">
          <span>${name}</span>
          <span class="text-[13px] font-bold tabular-nums ${on ? 'text-[#8A6A3A]' : 'text-[#66756E]'}">${count}</span>
        </button>`;
    };

    container.innerHTML = `
      <div class="px-4 sm:px-6 lg:px-8 pt-8 pb-24">
        <div class="max-w-7xl mx-auto flex flex-col gap-7">

          <div class="reveal is-visible flex flex-col gap-3">
            <nav aria-label="Ruta de navegación" class="flex flex-wrap gap-2 text-[13px] text-[#66756E]">
              <button type="button" onclick="window.OlivoApp.setView('landing')" class="hover:text-[#163F32] transition">Inicio</button><span aria-hidden="true">/</span>
              <button type="button" onclick="window.OlivoApp.setFilterSubcategory('all')" class="text-[#1A2822] font-medium hover:text-[#163F32] transition">${cat.name}</button>
              ${activeSub ? `<span aria-hidden="true">/</span><span class="text-[#1A2822] font-medium">${activeSub.name}</span>` : ''}
            </nav>
            <div class="flex flex-col gap-2 max-w-3xl">
              ${cat.badge ? `<span class="self-start text-[10px] font-extrabold tracking-[0.12em] uppercase px-2.5 py-1 rounded-full bg-[#F7F1E6] text-[#8A6A3A]" style="font-family: var(--font-heading)">${cat.badge}</span>` : ''}
              <h1 class="font-serif font-bold text-[32px] sm:text-[44px] leading-[1.1] text-[#163F32] m-0">${cat.name}</h1>
              <p class="m-0 text-[#566760] text-[17px]">${cat.description}</p>
            </div>
          </div>

          <div class="flex flex-wrap gap-7 items-start">

            <aside aria-label="Subcategorías" class="flex-[1_1_240px] flex flex-col gap-4">
              <div class="bg-white border border-[#E5ECE8] rounded-2xl pt-[18px] px-3 pb-3 shadow-sm">
                <h2 class="mx-2.5 mb-2.5 text-xs font-extrabold tracking-[0.14em] uppercase text-[#566760]" style="font-family: var(--font-heading)">Subcategorías</h2>
                <div class="flex flex-col gap-0.5">
                  ${subBtn('all', 'Todas', enCategoria.length)}
                  ${subs.map(s => subBtn(s.id, s.name, s.count)).join('')}
                </div>
              </div>
              <div class="bg-[#163F32] rounded-2xl p-[22px] text-white flex flex-col gap-1.5">
                <strong class="text-base" style="font-family: var(--font-heading)">¿No encuentras un insumo?</strong>
                <span class="text-sm text-[#D7E8DD]">Pídelo a tu ejecutivo y lo sumamos a tu cotización.</span>
                <a href="tel:+56963041374" class="mt-1.5 font-extrabold text-base text-[#C6A16C] no-underline" style="font-family: var(--font-heading)">+56 9 6304 1374</a>
              </div>
            </aside>

            <section aria-label="Productos" class="flex-[999_1_560px] min-w-0 flex flex-col gap-[18px]">
              <div class="flex flex-wrap gap-3 items-center justify-between bg-white border border-[#E5ECE8] rounded-2xl px-3.5 py-3">
                <label class="relative flex items-center flex-[1_1_260px]">
                  <span class="sr-only">Filtrar en esta categoría por nombre, marca o SKU</span>
                  <i data-lucide="search" class="w-4 h-4 text-[#82928B] absolute left-3.5 pointer-events-none"></i>
                  <input id="catalogSearch" type="search" value="${state.filter.search || ''}" oninput="window.OlivoApp.handleSearchInput(this.value)" placeholder="Filtrar por nombre, marca o SKU" class="w-full h-11 pl-10 pr-3.5 rounded-[10px] border border-[#E5ECE8] bg-[#FAF8F3] text-sm outline-none focus:border-[#C6A16C]" />
                </label>
                <div class="flex gap-3 items-center flex-wrap">
                  <span aria-live="polite" class="text-sm text-[#566760]">${filtered.length} ${filtered.length === 1 ? 'producto' : 'productos'}</span>
                  <label class="flex gap-2 items-center text-[13px] text-[#66756E]">
                    Ordenar
                    <select onchange="window.OlivoApp.setSortBy(this.value)" class="h-11 px-3 rounded-[10px] border border-[#E5ECE8] bg-white text-sm text-[#1A2822]">
                      <option value="featured" ${state.filter.sortBy === 'featured' ? 'selected' : ''}>Destacados</option>
                      <option value="name" ${state.filter.sortBy === 'name' ? 'selected' : ''}>Nombre (A-Z)</option>
                      <option value="brand" ${state.filter.sortBy === 'brand' ? 'selected' : ''}>Marca</option>
                    </select>
                  </label>
                </div>
              </div>

              ${filtered.length === 0 ? `
                <div class="bg-white border border-dashed border-[#D3DED8] rounded-2xl p-10 text-center flex flex-col gap-2 items-center">
                  <strong class="text-[17px] text-[#163F32]" style="font-family: var(--font-heading)">No encontramos ese insumo en esta categoría</strong>
                  <span class="text-[15px] text-[#566760]">Escríbele a tu ejecutivo: lo buscamos y lo sumamos a tu cotización.</span>
                  <button type="button" onclick="window.OlivoApp.resetFilters()" class="mt-2 text-sm font-bold text-[#163F32] underline">Ver todos los productos de la línea</button>
                </div>
              ` : `
                <div class="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
                  ${filtered.map(p => {
                    const item = enLista(p.id);
                    return `
                    <article class="card-premium flex flex-col group">
                      <div class="relative aspect-square bg-white overflow-hidden cursor-pointer" onclick="window.OlivoApp.openProductModal('${p.id}')">
                        <img src="${p.image}" alt="${p.name}" class="w-full h-full ${imgFit(p.image)} group-hover:scale-105 transition duration-500" loading="lazy" />
                        <span class="absolute top-3 left-3 text-[11px] font-bold px-2 py-1 rounded-md bg-white/95 text-[#163F32] shadow-sm" style="font-family: var(--font-heading)">${p.brand}</span>
                        <span class="absolute top-3 right-3 text-[11px] font-mono px-2 py-1 rounded-md bg-white/95 text-[#566760] shadow-sm">${p.sku}</span>
                      </div>
                      <div class="p-[18px] flex flex-col gap-2.5 flex-grow">
                        <span class="text-[11px] font-extrabold tracking-[0.08em] uppercase text-[#8A6A3A]" style="font-family: var(--font-heading)">${p.subcategoryName}</span>
                        <h3 onclick="window.OlivoApp.openProductModal('${p.id}')" class="m-0 text-[15px] font-bold leading-snug text-[#163F32] min-h-[40px] cursor-pointer hover:text-[#215645]" style="font-family: var(--font-heading)">${p.name}</h3>
                        <div class="bg-[#FAF8F3] border border-[#EEF2EF] rounded-[10px] px-3 py-2 text-[13px] leading-snug"><span class="text-[#66756E]">Presentación: </span><span class="text-[#1A2822]">${p.format}</span></div>
                        <div class="flex justify-between items-center gap-2">
                          <span class="text-[11px] font-extrabold tracking-[0.06em] uppercase px-2.5 py-1 rounded-full bg-[#F7F1E6] text-[#7A5C30]" style="font-family: var(--font-heading)">Bajo cotización</span>
                          <button type="button" onclick="window.OlivoApp.openProductModal('${p.id}')" class="text-[13px] font-medium text-[#163F32] underline">Ver ficha técnica</button>
                        </div>
                        <div class="flex gap-2 mt-auto pt-1">
                          <div role="group" aria-label="Cantidad" class="flex items-center border border-[#E5ECE8] rounded-[10px] overflow-hidden flex-none">
                            <button type="button" onclick="window.OlivoApp.stepProductCardQty('${p.id}', -1)" aria-label="Restar una unidad" class="w-10 h-11 bg-white text-[#163F32] text-lg font-bold hover:bg-[#EBF2EE] transition">−</button>
                            <input id="qty-input-${p.id}" type="number" min="1" value="1" aria-label="Cantidad" class="w-9 text-center bg-transparent text-[15px] font-extrabold text-[#1A2822] outline-none tabular-nums" style="font-family: var(--font-heading)" />
                            <button type="button" onclick="window.OlivoApp.stepProductCardQty('${p.id}', 1)" aria-label="Sumar una unidad" class="w-10 h-11 bg-white text-[#163F32] text-lg font-bold hover:bg-[#EBF2EE] transition">+</button>
                          </div>
                          <button type="button" onclick="window.OlivoApp.addProductToQuoteFromCard('${p.id}')"
                            class="flex-auto h-11 rounded-[10px] px-3 text-[13.5px] font-bold transition hover:-translate-y-px ${item ? 'bg-[#EBF2EE] text-[#163F32] border border-[#C9DCD1]' : 'bg-[#163F32] text-white border border-[#163F32] shadow-md hover:bg-[#215645]'}"
                            style="font-family: var(--font-heading)">${item ? 'En tu lista · ' + item.quantity : 'Agregar a cotización'}</button>
                        </div>
                      </div>
                    </article>`;
                  }).join('')}
                </div>
              `}

              ${totalLista > 0 ? `
                <div class="sticky bottom-4 z-10 flex flex-wrap gap-3 items-center justify-between bg-[#0D261E] text-white rounded-2xl pl-5 pr-4 py-3.5" style="box-shadow: 0 24px 56px -8px rgba(18,42,33,0.35); animation: olivoFadeUp .45s cubic-bezier(.16,1,.3,1) both">
                  <span class="flex gap-2.5 items-center text-[15px]"><i data-lucide="file-text" class="w-5 h-5 text-[#C6A16C]"></i><strong>${totalLista} ${totalLista === 1 ? 'producto en tu lista' : 'productos en tu lista'}</strong></span>
                  <button type="button" onclick="window.OlivoApp.setView('checkout')" class="btn-gold h-11 px-[18px] text-sm font-extrabold" style="font-family: var(--font-heading)">Revisar y enviar <i data-lucide="arrow-right" class="w-4 h-4"></i></button>
                </div>
              ` : ''}
            </section>
          </div>
        </div>
      </div>
    `;
  }

  // =========================================================================
  // VISTA 3: SOLICITUD DE COTIZACIÓN EN 2 PASOS (lista → datos del local)
  // =========================================================================
  const CAMPOS = [
    { name: 'clientName', label: 'Nombre de contacto', type: 'text', auto: 'name', req: true, err: 'Escribe tu nombre.', grupo: 'contacto' },
    { name: 'phone', label: 'Teléfono móvil', type: 'tel', auto: 'tel', req: true, err: 'Necesitamos un teléfono para coordinar.', ph: '+56 9 …', grupo: 'contacto' },
    { name: 'email', label: 'Correo electrónico', type: 'email', auto: 'email', req: true, err: 'Revisa el correo: ahí llega tu cotización.', full: true, grupo: 'contacto' },
    { name: 'companyName', label: 'Razón social o nombre del local', type: 'text', auto: 'organization', req: true, err: 'Indica el nombre de tu local.', grupo: 'negocio' },
    { name: 'rut', label: 'RUT de empresa', type: 'text', req: true, err: 'Revisa el RUT y su dígito verificador, por ejemplo 76.123.456-0.', ph: '76.123.456-0', grupo: 'negocio' }
  ];
  const TIPOS_NEGOCIO = ['Restaurante', 'Local de sushi', 'Pizzería', 'Cafetería', 'Minimarket', 'Casino o catering', 'Otro'];

  function productoActual(item) {
    return state.products.find(p => p.id === item.productId) || item;
  }

  function saveCheckoutField(el) {
    state.checkoutForm = state.checkoutForm || {};
    state.checkoutForm[el.name] = el.value;
    if (state.checkoutErrors && state.checkoutErrors[el.name]) {
      delete state.checkoutErrors[el.name];
      el.removeAttribute('aria-invalid');
      el.classList.remove('!border-[#A33A2E]');
      const msg = document.getElementById('err-' + el.name);
      if (msg) msg.remove();
    }
  }

  function goCheckoutStep(n) {
    state.checkoutStep = n;
    window.scrollTo({ top: 0, behavior: 'smooth' });
    renderCheckoutView();
  }

  function stepper(paso) {
    const labels = ['Tu lista', 'Datos del local', 'Confirmación'];
    return `
      <ol aria-label="Progreso de la solicitud" class="m-0 p-0 list-none flex flex-wrap items-center gap-2.5">
        ${labels.map((l, i) => {
          const n = i + 1, hecho = n < paso, actual = n === paso;
          return `
          <li class="flex items-center gap-2.5" ${actual ? 'aria-current="step"' : ''}>
            <span class="w-8 h-8 rounded-full flex items-center justify-center text-sm font-extrabold transition ${actual ? 'bg-[#163F32] text-[#C6A16C]' : hecho ? 'bg-[#C6A16C] text-[#0D261E]' : 'bg-white text-[#66756E] border border-[#D3DED8]'}" style="font-family: var(--font-heading)">${hecho ? '✓' : n}</span>
            <span class="text-sm ${actual ? 'font-extrabold text-[#163F32]' : hecho ? 'font-semibold text-[#163F32]' : 'font-semibold text-[#66756E]'}" style="font-family: var(--font-heading)">${l}</span>
            ${n < 3 ? `<span aria-hidden="true" class="w-12 h-0.5 rounded mx-1.5 ${hecho ? 'bg-[#C6A16C]' : 'bg-[#D3DED8]'}"></span>` : ''}
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
        <span class="text-xs font-extrabold tracking-[0.08em] uppercase text-[#566760]" style="font-family: var(--font-heading)">${c.label}</span>
        <input name="${c.name}" type="${c.type}" ${c.auto ? `autocomplete="${c.auto}"` : ''} ${c.ph ? `placeholder="${c.ph}"` : ''} value="${(f[c.name] || '').replace(/"/g, '&quot;')}" oninput="window.OlivoApp.saveCheckoutField(this)" ${e[c.name] ? 'aria-invalid="true"' : ''}
          class="h-12 px-3.5 rounded-[10px] border ${e[c.name] ? '!border-[#A33A2E]' : 'border-[#E5ECE8]'} bg-[#FAF8F3] text-[15px] outline-none focus:border-[#C6A16C] focus:ring-[3px] focus:ring-[#C6A16C]/20 transition" />
        ${e[c.name] ? `<span id="err-${c.name}" class="text-[13px] text-[#A33A2E]">${c.err}</span>` : ''}
      </label>`;

    let cuerpo;
    if (state.cart.length === 0) {
      cuerpo = `
        <div class="bg-white border border-[#E5ECE8] rounded-2xl p-10 text-center flex flex-col gap-3 items-center max-w-2xl">
          <strong class="text-xl text-[#163F32]" style="font-family: var(--font-heading)">Tu lista está vacía</strong>
          <p class="m-0 text-[#566760]">Explora el catálogo, elige productos y cantidades, y vuelve aquí para enviar tu solicitud.</p>
          <button onclick="window.OlivoApp.setView('landing'); setTimeout(window.OlivoApp.scrollToCategories, 200)" class="btn-olive h-11 px-5 text-sm">Explorar catálogo</button>
        </div>`;
    } else if (paso === 1) {
      cuerpo = `
        <div class="flex flex-wrap gap-7 items-start" style="animation: olivoFadeUp .55s cubic-bezier(.16,1,.3,1) both">
          <section aria-labelledby="t1" class="flex-[999_1_560px] min-w-0 bg-white border border-[#E5ECE8] rounded-2xl overflow-hidden">
            <div class="px-6 pt-6 pb-4 flex flex-wrap justify-between gap-2 items-end">
              <div>
                <span class="eyebrow">Paso 1 de 2</span>
                <h1 id="t1" class="font-serif text-[30px] sm:text-[34px] leading-tight text-[#163F32] mt-0.5 mb-0">Revisa tu lista</h1>
              </div>
              <span class="text-sm text-[#566760]">${nProd}</span>
            </div>
            <ul class="m-0 p-0 list-none">
              ${state.cart.map(item => {
                const p = productoActual(item);
                return `
                <li class="flex flex-wrap gap-3.5 items-center px-6 py-4 border-t border-[#EEF2EF] hover:bg-[#FAF8F3] transition">
                  <img src="${p.image}" alt="" class="w-16 h-16 rounded-[10px] ${imgFit(p.image)} flex-none border border-[#E5ECE8]" />
                  <span class="flex-[1_1_260px] flex flex-col gap-0.5 min-w-0">
                    <strong class="text-[15px] text-[#163F32] leading-snug" style="font-family: var(--font-heading)">${item.name}</strong>
                    <span class="text-[13px] text-[#566760]">${item.format} · <span class="font-mono text-[#66756E]">${item.sku}</span></span>
                  </span>
                  <span role="group" aria-label="Cantidad" class="flex items-center border border-[#E5ECE8] rounded-[10px] overflow-hidden">
                    <button type="button" onclick="window.OlivoApp.updateCartItemQty('${item.productId}', -1)" aria-label="Restar una unidad" class="w-10 h-11 bg-white text-[#163F32] text-lg font-bold hover:bg-[#EBF2EE] transition">−</button>
                    <input type="number" min="1" value="${item.quantity}" aria-label="Cantidad" onchange="window.OlivoApp.setCartItemQty('${item.productId}', this.value)" class="w-11 text-center bg-transparent font-extrabold tabular-nums outline-none" style="font-family: var(--font-heading)" />
                    <button type="button" onclick="window.OlivoApp.updateCartItemQty('${item.productId}', 1)" aria-label="Sumar una unidad" class="w-10 h-11 bg-white text-[#163F32] text-lg font-bold hover:bg-[#EBF2EE] transition">+</button>
                  </span>
                  <button type="button" onclick="window.OlivoApp.removeCartItem('${item.productId}')" aria-label="Quitar de la lista" class="w-11 h-11 rounded-[10px] text-[#A33A2E] hover:bg-[#FBEDEB] flex items-center justify-center transition"><i data-lucide="trash-2" class="w-[18px] h-[18px]"></i></button>
                </li>`;
              }).join('')}
            </ul>
            <div class="px-6 py-4 border-t border-[#EEF2EF] flex justify-between items-center">
              <button type="button" onclick="window.OlivoApp.setView('catalog')" class="text-sm font-bold text-[#163F32] inline-flex items-center gap-1.5 min-h-[44px]" style="font-family: var(--font-heading)"><i data-lucide="arrow-left" class="w-4 h-4"></i>Agregar más productos</button>
              <button type="button" onclick="window.OlivoApp.clearCart()" class="text-sm text-[#A33A2E] hover:underline min-h-[44px]">Vaciar lista</button>
            </div>
          </section>
          <aside class="flex-[1_1_320px] bg-white border border-[#E5ECE8] rounded-2xl p-6 flex flex-col gap-3.5" style="box-shadow: var(--shadow-md)">
            <strong class="text-[17px] text-[#163F32]" style="font-family: var(--font-heading)">Resumen</strong>
            <div class="flex justify-between text-[15px]"><span class="text-[#566760]">Productos distintos</span><strong class="tabular-nums">${state.cart.length}</strong></div>
            <div class="flex justify-between text-[15px]"><span class="text-[#566760]">Unidades totales</span><strong class="tabular-nums">${unidades}</strong></div>
            <div class="flex justify-between items-center text-[15px] pt-3 border-t border-[#EEF2EF]"><span class="text-[#566760]">Precio</span><span class="text-[11px] font-extrabold tracking-[0.06em] uppercase px-2.5 py-1 rounded-full bg-[#F7F1E6] text-[#7A5C30]" style="font-family: var(--font-heading)">Bajo cotización</span></div>
            <button type="button" onclick="window.OlivoApp.goCheckoutStep(2)" class="btn-gold h-[52px] text-[15px] font-extrabold w-full" style="font-family: var(--font-heading)">Continuar con mis datos</button>
            <span class="text-[13px] text-[#66756E] text-center">Sin registro. Toma menos de 2 minutos.</span>
          </aside>
        </div>`;
    } else {
      cuerpo = `
        <div class="flex flex-wrap gap-7 items-start" style="animation: olivoFadeUp .55s cubic-bezier(.16,1,.3,1) both">
          <form novalidate onsubmit="event.preventDefault(); window.OlivoApp.submitQuotation(this);" aria-labelledby="t2" class="flex-[999_1_560px] min-w-0 bg-white border border-[#E5ECE8] rounded-2xl p-7 flex flex-col gap-5">
            <div>
              <span class="eyebrow">Paso 2 de 2</span>
              <h1 id="t2" class="font-serif text-[30px] sm:text-[34px] leading-tight text-[#163F32] mt-0.5 mb-1">Datos de tu local</h1>
              <p class="m-0 text-[#566760] text-[15px]">Los usamos solo para enviarte la cotización y coordinar el despacho.</p>
            </div>
            <fieldset class="border-0 p-0 m-0 grid grid-cols-1 sm:grid-cols-2 gap-x-[18px] gap-y-4">
              <legend class="font-extrabold text-[15px] text-[#163F32] mb-3" style="font-family: var(--font-heading)">Contacto</legend>
              ${CAMPOS.filter(c => c.grupo === 'contacto').map(campo).join('')}
            </fieldset>
            <fieldset class="border-0 p-0 m-0 grid grid-cols-1 sm:grid-cols-2 gap-x-[18px] gap-y-4">
              <legend class="font-extrabold text-[15px] text-[#163F32] mb-3" style="font-family: var(--font-heading)">Tu negocio</legend>
              ${CAMPOS.filter(c => c.grupo === 'negocio').map(campo).join('')}
              <label class="flex flex-col gap-1.5">
                <span class="text-xs font-extrabold tracking-[0.08em] uppercase text-[#566760]" style="font-family: var(--font-heading)">Comuna de entrega</span>
                <select name="comuna" onchange="window.OlivoApp.saveCheckoutField(this)" ${e.comuna ? 'aria-invalid="true"' : ''} class="h-12 px-3.5 rounded-[10px] border ${e.comuna ? '!border-[#A33A2E]' : 'border-[#E5ECE8]'} bg-[#FAF8F3] text-[15px] outline-none focus:border-[#C6A16C]">
                  <option value="">Elige tu comuna</option>
                  ${COMUNAS.map(c => `<option ${f.comuna === c ? 'selected' : ''}>${c}</option>`).join('')}
                </select>
                ${e.comuna ? '<span id="err-comuna" class="text-[13px] text-[#A33A2E]">Elige una comuna de la V Región.</span>' : ''}
              </label>
              <label class="flex flex-col gap-1.5">
                <span class="text-xs font-extrabold tracking-[0.08em] uppercase text-[#566760]" style="font-family: var(--font-heading)">Tipo de establecimiento</span>
                <select name="businessType" onchange="window.OlivoApp.saveCheckoutField(this)" class="h-12 px-3.5 rounded-[10px] border border-[#E5ECE8] bg-[#FAF8F3] text-[15px] outline-none focus:border-[#C6A16C]">
                  ${TIPOS_NEGOCIO.map(t => `<option ${(f.businessType || (BIZ.find(b => b.id === state.biz) || {}).label) === t ? 'selected' : ''}>${t}</option>`).join('')}
                </select>
              </label>
              <label class="flex flex-col gap-1.5 sm:col-span-2">
                <span class="text-xs font-extrabold tracking-[0.08em] uppercase text-[#566760]" style="font-family: var(--font-heading)">Comentarios de despacho <span class="normal-case tracking-normal font-semibold text-[#66756E]">(opcional)</span></span>
                <textarea name="notes" rows="3" oninput="window.OlivoApp.saveCheckoutField(this)" placeholder="Horario de recepción, acceso para camión, productos que no encontraste…" class="px-3.5 py-3 rounded-[10px] border border-[#E5ECE8] bg-[#FAF8F3] text-[15px] outline-none focus:border-[#C6A16C] resize-y">${f.notes || ''}</textarea>
              </label>
            </fieldset>
            <!-- Trampa anti-spam: oculto para personas; si se completa, el servidor descarta el envío -->
            <div aria-hidden="true" style="position:absolute; left:-9999px; width:1px; height:1px; overflow:hidden">
              <label>No completar este campo <input type="text" name="website" tabindex="-1" autocomplete="off" /></label>
            </div>
            <div class="flex flex-wrap gap-3 justify-between items-center pt-1">
              <button type="button" onclick="window.OlivoApp.goCheckoutStep(1)" class="min-h-[44px] text-sm font-bold text-[#163F32]" style="font-family: var(--font-heading)">← Volver a mi lista</button>
              <button type="submit" class="btn-gold h-[52px] px-6 text-[15px] font-extrabold" style="font-family: var(--font-heading)"><i data-lucide="send" class="w-[18px] h-[18px]"></i>Enviar solicitud de cotización formal</button>
            </div>
          </form>
          <aside class="flex-[1_1_320px] bg-[#163F32] text-white rounded-2xl p-6 flex flex-col gap-3">
            <strong class="text-[17px]" style="font-family: var(--font-heading)">Tu lista · ${nProd}</strong>
            <ul class="m-0 p-0 list-none flex flex-col gap-2 text-sm text-[#D7E8DD]">
              ${state.cart.map(i => `<li class="flex justify-between gap-3"><span>${i.name}</span><strong class="text-[#C6A16C] tabular-nums">×${i.quantity}</strong></li>`).join('')}
            </ul>
            <span class="text-[13px] text-[#A9BDB2] pt-2 border-t border-[#D7E8DD]/15">Un ejecutivo revisa tu lista y te responde con precios netos y condiciones de despacho.</span>
            <span class="flex gap-2 items-center text-[13px] text-[#D7E8DD]"><i data-lucide="truck" class="w-4 h-4 text-[#C6A16C]"></i>Despachos de lunes a sábado, de 9:00 a 15:00 hrs.</span>
          </aside>
        </div>`;
    }

    container.innerHTML = `
      <div class="px-4 sm:px-6 lg:px-8 pt-10 pb-24">
        <div class="max-w-[1180px] mx-auto flex flex-col gap-7">
          ${stepper(state.cart.length === 0 ? 1 : paso)}
          ${cuerpo}
        </div>
      </div>`;
    if (window.lucide) window.lucide.createIcons();
    const primerError = container.querySelector('[aria-invalid="true"]');
    if (primerError) primerError.focus();
  }

  // =========================================================================
  // VISTA 4: CONFIRMACIÓN
  // =========================================================================
  function renderConfirmationView(container) {
    if (!container) container = document.getElementById('appContent');
    if (!container) return;
    const quote = state.lastSubmittedQuote;
    if (!quote) { setView('catalog'); return; }

    container.innerHTML = `
      <div class="px-4 sm:px-6 lg:px-8 pt-10 pb-24">
        <div class="max-w-[1180px] mx-auto flex flex-col gap-7">
          ${stepper(3)}
          <section aria-live="polite" class="max-w-[760px] w-full mx-auto bg-white border border-[#E5ECE8] rounded-3xl px-6 sm:px-10 py-12 text-center flex flex-col gap-4 items-center" style="box-shadow: var(--shadow-lg); animation: olivoFadeUp .55s cubic-bezier(.16,1,.3,1) both">
            <span class="confirm-pop w-[72px] h-[72px] rounded-full bg-[#163F32] text-[#C6A16C] flex items-center justify-center">
              <svg aria-hidden="true" width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4"><path class="confirm-draw" d="M20 6 9 17l-5-5"></path></svg>
            </span>
            <span class="font-mono text-sm px-3 py-1 rounded-full bg-[#F7F1E6] text-[#7A5C30]">${quote.id}</span>
            <h1 class="font-serif text-[30px] sm:text-[34px] leading-tight text-[#163F32] m-0">¡Tu solicitud fue recibida!</h1>
            <p class="m-0 text-[#566760] text-[17px] max-w-[560px]">Un ejecutivo de Distribuidora Olivo revisará los productos seleccionados y enviará una cotización personalizada a tu correo electrónico.</p>
            <ol class="mt-2 p-0 list-none flex flex-col gap-2.5 text-left w-full max-w-[460px]">
              ${[`Te llega una copia de tu lista a <strong>${quote.email}</strong>`, 'Tu ejecutivo te contacta con precios y condiciones', `Confirmas y despachamos en <strong>${quote.comuna}</strong>`].map((t, i) => `
                <li class="flex gap-3 items-center"><span class="flex-none w-7 h-7 rounded-lg bg-[#EBF2EE] text-[#163F32] font-extrabold flex items-center justify-center text-[13px]">${i + 1}</span><span>${t}</span></li>`).join('')}
            </ol>
            <div class="flex flex-wrap gap-3 justify-center pt-2">
              <button onclick="window.OlivoApp.setView('landing')" class="btn-olive h-12 px-5 text-sm">Volver al inicio</button>
              <button onclick="window.OlivoApp.openSimulatedEmailModal('${quote.id}')" class="btn-outline-olive h-12 px-5 text-sm"><i data-lucide="mail-check" class="w-4 h-4"></i>Ver correo de confirmación</button>
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
      <div class="modal-backdrop fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto" onclick="if(event.target === this) window.OlivoApp.closeModal('productDetailModal')">
        <div class="bg-white rounded-3xl max-w-3xl w-full border border-[#E5ECE8] shadow-2xl overflow-hidden relative animate-in fade-in zoom-in-95 duration-200">
          
          <button onclick="window.OlivoApp.closeModal('productDetailModal')" class="absolute top-4 right-4 z-10 w-9 h-9 rounded-full bg-white/90 text-[#163F32] flex items-center justify-center shadow-md hover:bg-white transition">
            ✕
          </button>

          <div class="grid grid-cols-1 md:grid-cols-2">
            <div class="relative bg-[#FAF8F3] min-h-[300px]">
              <img src="${p.image}" alt="${p.name}" class="w-full h-full ${imgFit(p.image)}" />
              <div class="absolute bottom-4 left-4 right-4 p-3 rounded-xl bg-white/90 backdrop-blur-md border border-[#E5ECE8] text-xs">
                <span class="text-[#82928B] block text-[10px] uppercase font-bold">Código SKU Distribuidora:</span>
                <span class="font-mono font-bold text-[#163F32] text-sm">${p.sku}</span>
              </div>
            </div>

            <div class="p-6 sm:p-8 flex flex-col justify-between space-y-4">
              <div>
                <div class="flex items-center gap-2 mb-2">
                  <span class="badge-gold text-[10px]">${p.brand}</span>
                  <span class="badge-olive text-[10px]">${p.categoryName}</span>
                </div>

                <h3 class="text-xl font-serif font-bold text-[#163F32] leading-tight">${p.name}</h3>
                
                <p class="text-xs text-[#566760] leading-relaxed mt-2.5">${p.description}</p>

                <div class="mt-4 pt-4 border-t border-[#E5ECE8] space-y-2 text-xs">
                  <div class="flex justify-between py-1 border-b border-[#FAF8F3]">
                    <span class="text-[#82928B]">Formato de entrega:</span>
                    <strong class="text-[#163F32] text-right">${p.format}</strong>
                  </div>
                  <div class="flex justify-between py-1 border-b border-[#FAF8F3]">
                    <span class="text-[#82928B]">Unidad comercial:</span>
                    <strong class="text-[#163F32]">${p.unit}</strong>
                  </div>
                  ${p.specs ? Object.entries(p.specs).map(([k, v]) => `
                    <div class="flex justify-between py-1 border-b border-[#FAF8F3]">
                      <span class="text-[#82928B]">${k}:</span>
                      <strong class="text-[#163F32] text-right truncate ml-2">${v}</strong>
                    </div>
                  `).join('') : ''}
                </div>
              </div>

              <div class="pt-4 border-t border-[#E5ECE8] space-y-3">
                <div class="p-2.5 rounded-lg bg-[#FAF8F3] border border-[#C6A16C]/40 text-[11px] text-[#566760] flex items-center gap-2">
                  <i data-lucide="shield-alert" class="w-4 h-4 text-[#C6A16C] flex-shrink-0"></i>
                  <span>Sin precios públicos. Tu ejecutivo cotizará este producto según volumen requerido para la V Región.</span>
                </div>

                <div class="flex items-center gap-3">
                  <div class="flex items-center border border-[#E5ECE8] rounded-xl bg-[#FAF8F3] p-1.5">
                    <button onclick="window.OlivoApp.stepModalQty(-1)" class="w-8 h-8 flex items-center justify-center text-[#566760] hover:text-[#163F32] font-bold">
                      -
                    </button>
                    <input id="modalQtyInput" type="number" min="1" value="1" class="w-12 text-center bg-transparent text-sm font-bold text-[#163F32] outline-none" />
                    <button onclick="window.OlivoApp.stepModalQty(1)" class="w-8 h-8 flex items-center justify-center text-[#566760] hover:text-[#163F32] font-bold">
                      +
                    </button>
                  </div>

                  <button onclick="window.OlivoApp.addCurrentModalProductToQuote()" class="flex-grow btn-gold py-3 text-xs justify-center shadow-md">
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
    modal.classList.remove('hidden');
    if (window.lucide) window.lucide.createIcons();
  }

  // 2. MODAL SIMULADOR DE CORREO AUTOMÁTICO ENVIADO AL CLIENTE
  function openSimulatedEmailModal(quoteId) {
    const q = state.lastSubmittedQuote;
    if (!q) return;

    const modal = document.getElementById('emailViewerModal');
    if (!modal) return;

    modal.innerHTML = `
      <div class="modal-backdrop fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto" onclick="if(event.target === this) window.OlivoApp.closeModal('emailViewerModal')">
        <div class="bg-white rounded-3xl max-w-2xl w-full border border-[#E5ECE8] shadow-2xl overflow-hidden relative animate-in fade-in duration-200">
          
          <div class="bg-[#163F32] text-white p-4 sm:px-6 flex items-center justify-between">
            <div class="flex items-center gap-2 text-xs">
              <i data-lucide="mail" class="w-4 h-4 text-[#C6A16C]"></i>
              <span class="font-bold text-[#C6A16C] uppercase tracking-wider">Simulador de Correo Transaccional B2B</span>
            </div>
            <button onclick="window.OlivoApp.closeModal('emailViewerModal')" class="text-white/80 hover:text-white text-sm font-bold">✕</button>
          </div>

          <div class="bg-[#FAF8F3] p-4 sm:px-6 border-b border-[#E5ECE8] text-xs space-y-1.5 font-mono">
            <div><span class="text-[#82928B]">De:</span> <strong class="text-[#163F32]">Distribuidora Olivo &lt;ventas@olivocorp.cl&gt;</strong></div>
            <div><span class="text-[#82928B]">Para:</span> <strong class="text-[#163F32]">${q.clientName} &lt;${q.email}&gt;</strong></div>
            <div><span class="text-[#82928B]">Asunto:</span> <strong class="text-[#163F32]">Confirmación de Solicitud de Cotización N° ${q.id} — Distribuidora Olivo</strong></div>
          </div>

          <div class="p-6 sm:p-8 space-y-6 max-h-[70vh] overflow-y-auto">
            
            <div class="flex items-center justify-between border-b border-[#C6A16C]/40 pb-4">
              <div>
                <div class="text-xl font-serif font-black tracking-wider text-[#163F32]">OLIVO</div>
                <div class="text-[10px] text-[#C6A16C] uppercase font-bold tracking-widest">Distribuidora de Alimentos y Productos</div>
              </div>
              <span class="text-xs font-mono text-[#82928B]">${formatDate(q.date)}</span>
            </div>

            <div class="space-y-3 text-sm text-[#1A2822]">
              <p>Estimado/a <strong>${q.clientName}</strong> (${q.companyName}),</p>
              
              <div class="p-4 rounded-xl bg-[#EBF2EE] border border-[#163F32]/10 text-xs text-[#163F32] leading-relaxed">
                <strong>«¡Tu solicitud fue recibida! Un ejecutivo de Distribuidora Olivo revisará los productos seleccionados y enviará una cotización personalizada a tu correo electrónico».</strong>
              </div>

              <p class="text-xs text-[#566760] leading-relaxed">
                Hemos registrado tu solicitud bajo el código de seguimiento <strong>${q.id}</strong> para despacho en <strong>${q.comuna}</strong>. Nuestro ejecutivo comercial te enviará la propuesta formal con precios netos e IVA.
              </p>
            </div>

            <div>
              <h4 class="text-xs font-bold uppercase text-[#163F32] mb-2">Detalle de Insumos Solicitados:</h4>
              <table class="w-full text-left text-xs border border-[#E5ECE8] rounded-xl overflow-hidden">
                <thead class="bg-[#FAF8F3] text-[#163F32] uppercase text-[10px] font-bold border-b border-[#E5ECE8]">
                  <tr>
                    <th class="py-2.5 px-3">SKU</th>
                    <th class="py-2.5 px-3">Producto</th>
                    <th class="py-2.5 px-3">Presentación</th>
                    <th class="py-2.5 px-3 text-center">Cant.</th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-[#E5ECE8]">
                  ${q.items.map(item => `
                    <tr>
                      <td class="py-2.5 px-3 font-mono font-semibold text-[#82928B]">${item.sku}</td>
                      <td class="py-2.5 px-3 font-semibold text-[#163F32]">${item.name}</td>
                      <td class="py-2.5 px-3 text-[#566760]">${item.format}</td>
                      <td class="py-2.5 px-3 text-center font-bold text-[#163F32]">${item.quantity}</td>
                    </tr>
                  `).join('')}
                </tbody>
              </table>
            </div>

            <div class="p-4 rounded-xl bg-[#FAF8F3] border border-[#E5ECE8] text-xs space-y-1">
              <span class="text-[#82928B] block">Atención Comercial V Región:</span>
              <strong class="text-[#163F32] block text-sm">Equipo comercial Distribuidora Olivo</strong>
              <span class="text-[#566760] block">WhatsApp Comercial: +56 9 6304 1374 | ventas@olivocorp.cl</span>
            </div>

            <div class="text-[11px] text-[#82928B] border-t border-[#E5ECE8] pt-4 text-center">
              Distribuidora Olivo • Viña del Mar, Valparaíso, Chile • www.distribuidoraolivo.cl
            </div>

          </div>

          <div class="bg-[#FAF8F3] p-4 px-6 border-t border-[#E5ECE8] flex items-center justify-between text-xs">
            <span class="text-[#82928B]">Simulación de notificación transaccional</span>
            <button onclick="window.OlivoApp.closeModal('emailViewerModal')" class="btn-olive py-1.5 px-4 text-xs">
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
      <div class="drawer-root fixed inset-0 z-50 flex justify-end" data-open="${state.isCartDrawerOpen}">
        <div onclick="window.OlivoApp.toggleCartDrawer(false)" class="absolute inset-0 bg-black/50 backdrop-blur-sm"></div>

        <div class="relative w-full max-w-md bg-white h-full shadow-2xl flex flex-col justify-between z-10 transform transition-transform duration-300 ${state.isCartDrawerOpen ? 'translate-x-0' : 'translate-x-full'}">
          
          <div class="p-5 border-b border-[#E5ECE8] flex items-center justify-between bg-[#FAF8F3]">
            <div class="flex items-center gap-2.5">
              <i data-lucide="shopping-bag" class="w-5 h-5 text-[#C6A16C]"></i>
              <div>
                <h3 class="font-serif font-bold text-[#163F32] text-base">Tu Lista de Cotización</h3>
                <span class="text-xs text-[#82928B]">${count} productos seleccionados</span>
              </div>
            </div>
            <button onclick="window.OlivoApp.toggleCartDrawer(false)" class="w-8 h-8 rounded-full hover:bg-white flex items-center justify-center text-[#566760] font-bold">
              ✕
            </button>
          </div>

          <div class="p-5 overflow-y-auto flex-grow divide-y divide-[#E5ECE8]">
            ${state.cart.length === 0 ? `
              <div class="py-16 text-center space-y-3">
                <div class="w-16 h-16 rounded-full bg-[#FAF8F3] text-[#82928B] flex items-center justify-center mx-auto">
                  <i data-lucide="package" class="w-8 h-8"></i>
                </div>
                <h4 class="font-bold text-[#163F32] text-sm">No hay productos en tu cotización</h4>
                <p class="text-xs text-[#566760] max-w-xs mx-auto">Explora el catálogo y agrega los insumos que requiera tu negocio.</p>
                <button onclick="window.OlivoApp.toggleCartDrawer(false); window.OlivoApp.setView('catalog')" class="btn-gold text-xs py-2 px-4 mt-2">
                  Explorar Catálogo
                </button>
              </div>
            ` : state.cart.map(item => `
              <div class="py-3.5 flex items-start justify-between gap-3">
                <img src="${item.image}" alt="${item.name}" class="w-12 h-12 rounded-lg ${imgFit(item.image)} border border-[#E5ECE8] flex-shrink-0" />
                <div class="flex-grow">
                  <span class="text-[10px] font-mono font-semibold text-[#82928B]">${item.sku}</span>
                  <h5 class="text-xs font-bold text-[#163F32] leading-tight line-clamp-1">${item.name}</h5>
                  <div class="text-[11px] text-[#566760] mt-0.5">${item.format}</div>
                  
                  <div class="flex items-center gap-2 mt-2">
                    <div class="flex items-center border border-[#E5ECE8] rounded bg-[#FAF8F3] px-1 py-0.5 text-xs">
                      <button onclick="window.OlivoApp.updateCartItemQty('${item.productId}', -1)" class="w-5 text-[#566760] hover:text-[#163F32] font-bold">-</button>
                      <span class="w-7 text-center font-bold text-[#163F32]">${item.quantity}</span>
                      <button onclick="window.OlivoApp.updateCartItemQty('${item.productId}', 1)" class="w-5 text-[#566760] hover:text-[#163F32] font-bold">+</button>
                    </div>
                    <span class="text-[10px] text-[#C6A16C] font-semibold">Bajo Cotización</span>
                  </div>
                </div>

                <button onclick="window.OlivoApp.removeCartItem('${item.productId}')" class="text-[#82928B] hover:text-red-600 transition p-1">
                  ✕
                </button>
              </div>
            `).join('')}
          </div>

          ${state.cart.length > 0 ? `
            <div class="p-5 border-t border-[#E5ECE8] bg-[#FAF8F3] space-y-3">
              <div class="p-2.5 rounded-lg bg-white border border-[#C6A16C]/30 text-[11px] text-[#566760]">
                <strong>Despacho V Región:</strong> Precios valorizados según volumen y comuna.
              </div>
              <button onclick="window.OlivoApp.toggleCartDrawer(false); window.OlivoApp.setView('checkout')" class="w-full btn-gold py-3 text-xs font-bold justify-center shadow-lg">
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
    state.isCartDrawerOpen = open !== undefined ? open : !state.isCartDrawerOpen;
    renderCartDrawer();
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
      const claves = ['gclid', 'utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content'];
      const nuevo = {};
      claves.forEach(k => { if (p.get(k)) nuevo[k] = p.get(k).slice(0, 200); });
      if (Object.keys(nuevo).length) sessionStorage.setItem('olivo_tracking', JSON.stringify(nuevo));
    } catch (e) {}
  }
  function leerCampania() {
    try { return JSON.parse(sessionStorage.getItem('olivo_tracking') || '{}'); } catch (e) { return {}; }
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
    if (!rutValido(v('rut'))) errores.rut = true;
    if (!v('comuna')) errores.comuna = true;
    state.checkoutForm = Object.fromEntries(formData.entries());
    if (Object.keys(errores).length) {
      state.checkoutErrors = errores;
      renderCheckoutView();
      return;
    }
    state.checkoutErrors = {};

    const payload = {
      clientName: v('clientName'), phone: v('phone'), email: v('email'), companyName: v('companyName'),
      rut: v('rut'), comuna: v('comuna'), businessType: v('businessType'), notes: v('notes'),
      website: v('website'),
      tracking: leerCampania(),
      items: state.cart.map(i => ({ sku: i.sku, name: i.name, brand: i.brand, format: i.format, quantity: i.quantity }))
    };

    const boton = form.querySelector('button[type="submit"]');
    const textoBoton = boton ? boton.innerHTML : '';
    state.enviandoCotizacion = true;
    if (boton) { boton.disabled = true; boton.innerHTML = 'Enviando solicitud…'; }
    const restaurar = () => { state.enviandoCotizacion = false; if (boton) { boton.disabled = false; boton.innerHTML = textoBoton; } };

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
        renderCheckoutView();
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
        showToast('No pudimos enviar tu solicitud. Inténtalo de nuevo o llámanos al +56 9 6304 1374.', 'error');
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
    setView('confirmation');
  }

  function handleQuickContactSubmit(form) {
    showToast("¡Mensaje recibido! Un ejecutivo comercial de Olivo se comunicará con tu negocio.");
    form.reset();
  }

  function closeModal(modalId) {
    const el = document.getElementById(modalId);
    if (el) el.classList.add('hidden');
  }

  function stepProductCardQty(productId, delta) {
    const input = document.getElementById(`qty-input-${productId}`);
    if (input) {
      const val = Math.max(1, (parseInt(input.value) || 1) + delta);
      input.value = val;
    }
  }

  function addProductToQuoteFromCard(productId) {
    const input = document.getElementById(`qty-input-${productId}`);
    const qty = input ? Math.max(1, parseInt(input.value) || 1) : 1;
    addToCart(productId, qty);
    if (state.currentView === 'catalog') rerenderCatalog();
    else if (input) input.value = 1;
  }

  // Vuelve a dibujar la categoría sin perder el foco del buscador ni la posición de la página.
  function rerenderCatalog(mantenerFocoBusqueda = false) {
    const main = document.getElementById('appContent');
    if (!main) return;
    const y = window.scrollY;
    const prev = document.getElementById('catalogSearch');
    const cursor = prev && document.activeElement === prev ? prev.selectionStart : null;
    renderCatalogView(main);
    if (window.lucide) window.lucide.createIcons();
    window.scrollTo(0, y);
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
    setView('catalog');
  }

  function setFilterSubcategory(subId) {
    state.filter.subcategoryId = subId;
    const mainContainer = document.getElementById('appContent');
    if (mainContainer && state.currentView === 'catalog') {
      rerenderCatalog();
    } else {
      setView('catalog');
    }
  }

  function handleSearchInput(query) {
    state.filter.search = query;
    if (state.currentView !== 'catalog') {
      setView('catalog');
    } else {
      rerenderCatalog(true);
    }
  }

  function setSortBy(sortBy) {
    state.filter.sortBy = sortBy;
    rerenderCatalog();
  }

  // Limpia búsqueda y subcategoría, pero se queda en la misma línea.
  function resetFilters() {
    state.filter.search = '';
    state.filter.subcategoryId = 'all';
    rerenderCatalog();
  }

  // =========================================================================
  // INICIALIZACIÓN
  // =========================================================================
  function init() {
    capturarCampania();
    updateCartUI();
    setView('landing');

    const globalSearchInput = document.getElementById('globalSearchInput');
    if (globalSearchInput) {
      globalSearchInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
          handleSearchInput(globalSearchInput.value);
        }
      });
    }
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
    scrollToContact,
    setHeroSlide,
    nextHeroSlide,
    initHeroSlider,
    stopHeroSlider
  };

  document.addEventListener('DOMContentLoaded', init);

})();
