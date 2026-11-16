// OLIVO — Línea «Servilletas» (pedido de Olivo, 16 nov 2026).
// Va en un archivo aparte porque data.js se regenera desde el lienzo y borraría estos cambios.
// Se carga después de data.js y antes de app.js.
// Solo se usan datos impresos en los envases de Joker; lo que no aparece queda «por confirmar».
(function () {
  const CAT = {
    id: 'servilletas', slug: 'servilletas', name: 'Servilletas', shortName: 'Servilletas',
    badge: 'Joker · Variedad de colores', featured: false,
    description: 'Servilletas de doble hoja para restaurantes, cafeterías y hoteles, ordenadas por medida: 37,5 x 33 cm (pack 1/6) y 40 x 40 cm, en blanco, natural y colores.',
    image: 'images/cat-servilletas.jpg',
    subcategories: [
      { id: 'serv-37x33', name: 'Servilletas 37,5 x 33 cm' },
      { id: 'serv-40x40', name: 'Servilletas 40 x 40 cm' },
      { id: 'serv-otras', name: 'Otras medidas (cóctel, mesa y lunch)' }
    ]
  };
  const SUB = {};
  CAT.subcategories.forEach((s) => { SUB[s.id] = s.name; });

  const nuevo = (n, nombre, sub, formato) => ({
    id: 'OLV-SER-' + n, sku: 'OLV-SER-' + n, name: nombre, brand: 'Joker',
    categoryId: CAT.id, categoryName: CAT.name, subcategoryId: sub, subcategoryName: SUB[sub],
    format: formato, image: 'images/products/servilletas/OLV-SER-' + n + '.jpg',
    unit: '', description: '', specs: {}
  });
  const F_1_6 = 'Pack 1/6 · 1.800 unidades · 37,5 x 33 cm';
  const SERVILLETAS = [
    // 37,5 x 33 cm (pack 1/6)
    nuevo('001', 'Servilleta Joker Premium 37,5 x 33 cm Blanca (Pack 1/6)', 'serv-37x33', F_1_6),
    nuevo('002', 'Servilleta Joker Premium 37,5 x 33 cm Color Natural (Pack 1/6)', 'serv-37x33', F_1_6),
    nuevo('003', 'Servilleta Joker Premium 37,5 x 33 cm Negra (Pack 1/6)', 'serv-37x33', F_1_6),
    nuevo('004', 'Servilleta Joker Premium 37,5 x 33 cm Roja (Pack 1/6)', 'serv-37x33', F_1_6),
    // 40 x 40 cm
    nuevo('005', 'Servilleta Joker Premium 40 x 40 cm Blanca (Pack 200)', 'serv-40x40', 'Pack 200 · 40 x 40 cm · doble hoja'),
    nuevo('006', 'Servilleta Joker Premium 40 x 40 cm Amarilla (500S)', 'serv-40x40', 'Pack 500S · 40 x 40 cm · doble hoja'),
    nuevo('007', 'Servilleta Joker Premium 40 x 40 cm Roja', 'serv-40x40', 'Pack 40 x 40 cm · doble hoja'),
    nuevo('008', 'Servilleta Joker 40 x 40 cm Burdeo (1/8)', 'serv-40x40', 'Doblada 1/8 · 1.200 unidades · 40 x 40 cm'),
    nuevo('009', 'Servilleta Joker 40 x 40 cm Verde (1/8)', 'serv-40x40', 'Doblada 1/8 · 1.200 unidades · 40 x 40 cm'),
    nuevo('010', 'Servilleta Joker Premium 40 x 40 cm Azul Rey', 'serv-40x40', 'Pack 40 x 40 cm · doble hoja'),
    nuevo('011', 'Servilleta Joker 40 x 40 cm Azul Marino (1/8)', 'serv-40x40', 'Doblada 1/8 · 1.200 unidades · 40 x 40 cm'),
    nuevo('012', 'Servilleta Joker Premium 40 x 40 cm Negra', 'serv-40x40', 'Pack 40 x 40 cm · doble hoja')
  ];

  // Servilletas que ya estaban en Limpieza: pasan a esta línea (conservan su SKU y su foto).
  const MOVER = {
    'OLV-ASE-011': 'serv-40x40', 'OLV-ASE-012': 'serv-40x40', 'OLV-ASE-034': 'serv-40x40',
    'OLV-ASE-031': 'serv-otras', 'OLV-ASE-032': 'serv-otras', 'OLV-ASE-033': 'serv-otras'
  };
  // Fotos y nombres corregidos con los envases que entregó Olivo (16 nov): las fotos antiguas
  // mostraban otro color o solo el logo.
  const CORREGIR = {
    'OLV-ASE-011': { name: 'Servilleta Joker Premium 40 x 40 cm Blanca (Caja 1.200 unidades)', format: 'Caja 1.200 unidades dobladas en 1/4 · doble hoja', image: 'images/products/servilletas/OLV-ASE-011.jpg' },
    'OLV-ASE-012': { name: 'Servilleta Joker Gourmet 40 x 40 cm Negra (Caja 1.200 unidades)', format: 'Caja 1.200 unidades dobladas en 1/4', image: 'images/products/servilletas/OLV-ASE-012.jpg' }
  };
  INITIAL_PRODUCTS.forEach((p) => {
    const sub = MOVER[p.sku];
    if (!sub) return;
    p.categoryId = CAT.id; p.categoryName = CAT.name;
    p.subcategoryId = sub; p.subcategoryName = SUB[sub];
    if (CORREGIR[p.sku]) Object.assign(p, CORREGIR[p.sku]);
  });
  const limpieza = INITIAL_CATEGORIES.find((c) => c.id === 'limpieza');
  if (limpieza) {
    const s = limpieza.subcategories.find((x) => x.id === 'papeleria-servilletas');
    if (s) s.name = 'Papel jumbo y papel toalla';
    INITIAL_PRODUCTS.forEach((p) => { if (p.subcategoryId === 'papeleria-servilletas') p.subcategoryName = s ? s.name : p.subcategoryName; });
  }

  // Orden dentro de la línea: primero por medida (menú lateral), luego Joker nuevas antes que las anteriores.
  const orden = { 'serv-37x33': 0, 'serv-40x40': 1, 'serv-otras': 2 };
  const movidas = INITIAL_PRODUCTS.filter((p) => p.categoryId === CAT.id);
  const resto = INITIAL_PRODUCTS.filter((p) => p.categoryId !== CAT.id);
  const linea = SERVILLETAS.concat(movidas).sort((a, b) => orden[a.subcategoryId] - orden[b.subcategoryId]);
  INITIAL_PRODUCTS.length = 0;
  resto.concat(linea).forEach((p) => INITIAL_PRODUCTS.push(p));

  // La línea va junto a Limpieza e Insumos.
  const i = INITIAL_CATEGORIES.findIndex((c) => c.id === 'insumos');
  INITIAL_CATEGORIES.splice(i < 0 ? INITIAL_CATEGORIES.length : i + 1, 0, CAT);
})();
