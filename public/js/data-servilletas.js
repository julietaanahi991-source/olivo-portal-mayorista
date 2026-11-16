// OLIVO — Línea «Servilletas» (pedido de Olivo, 16 nov 2026).
// Va en un archivo aparte porque data.js se regenera desde el lienzo y borraría estos cambios.
// Se carga después de data.js y antes de app.js.
// Solo se usan datos impresos en los envases de Joker; lo que no aparece queda «por confirmar».
(function () {
  const CAT = {
    id: 'servilletas', slug: 'servilletas', name: 'Servilletas', shortName: 'Servilletas',
    badge: 'Joker · Variedad de colores', featured: false,
    description: 'Servilletas de doble hoja para restaurantes, cafeterías y hoteles, ordenadas por medida: 37,5 x 33 cm (caja 1.800 unidades) y 40 x 40 cm (caja 1.200 unidades), en blanco, natural y colores.',
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
    // ?v=N: versión de la foto (evita que el navegador muestre la anterior)
    format: formato, image: 'images/products/servilletas/OLV-SER-' + n + '.jpg?v=2',
    unit: '', description: '', specs: {}
  });
  // Olivo (16 nov): sin «Pack» ni «1/6 / 1/8»; 37,5 x 33 cm = caja 1.800 unidades, 40 x 40 cm = caja 1.200 unidades.
  const F_37 = 'Caja 1.800 unidades · 37,5 x 33 cm';
  const F_40 = 'Caja 1.200 unidades · 40 x 40 cm';
  const s37 = (n, color) => nuevo(n, `Servilleta Joker Premium 37,5 x 33 cm ${color} (Caja 1.800 unidades)`, 'serv-37x33', F_37);
  // 40 x 40 «Punta a Punta»: envases nuevos entregados por Olivo (16 nov). La foto lleva ?v=3.
  const s40 = (n, color) => {
    const p = nuevo(n, `Servilleta Joker Punta a Punta 40 x 40 cm ${color} (Caja 1.200 unidades)`, 'serv-40x40', F_40);
    p.image = p.image.replace('?v=2', '?v=3');
    return p;
  };
  const SERVILLETAS = [
    // 37,5 x 33 cm
    s37('001', 'Blanca'), s37('002', 'Color Natural'), s37('003', 'Negra'), s37('004', 'Roja'),
    // 40 x 40 cm (orden: blanca, negra y luego colores)
    s40('005', 'Blanca'), s40('012', 'Negra'), s40('007', 'Roja'), s40('008', 'Burdeo'), s40('013', 'Rosa'),
    s40('006', 'Amarillo Suave'), s40('009', 'Verde'), s40('010', 'Azul')
    // OLV-SER-011 (azul marino) eliminado: repetido (Olivo, 16 nov). No reutilizar el SKU.
  ];

  // Repetidas con las 40 x 40 «Punta a Punta» (Olivo, 16 nov): se quitan del catálogo.
  const ELIMINAR = ['OLV-ASE-011', 'OLV-ASE-012'];
  for (let k = INITIAL_PRODUCTS.length - 1; k >= 0; k--) {
    if (ELIMINAR.includes(INITIAL_PRODUCTS[k].sku)) INITIAL_PRODUCTS.splice(k, 1);
  }

  // Servilletas que ya estaban en Limpieza: pasan a esta línea (conservan su SKU y su foto).
  const MOVER = {
    'OLV-ASE-034': 'serv-40x40',
    'OLV-ASE-031': 'serv-otras', 'OLV-ASE-032': 'serv-otras', 'OLV-ASE-033': 'serv-otras'
  };
  // Nombres sin «Pack» (Olivo, 16 nov)
  const CORREGIR = {
    'OLV-ASE-031': { name: 'Servilleta de Mesa Económica Okey 31 x 30 (Caja 2.000 unidades)' },
    'OLV-ASE-032': { name: 'Servilleta Cocktail Slogo 24 x 23 (Caja 2.400 unidades)' }
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
