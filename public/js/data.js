// OLIVO SIGNATURE — Base de Datos Maestra de Productos, Categorías y Colecciones
// Portal B2B Distribuidora Olivo, Chile — Despacho Exclusivo V Región

const INITIAL_CATEGORIES = [
  {
    id: "alimentos",
    slug: "alimentos-y-abarrotes",
    name: "Alimentos y abarrotes",
    shortName: "Alimentos",
    badge: "Despensa B2B",
    description: "Aceites de alto rendimiento, arroces seleccionados, harinas, pastas y abarrotes a escala industrial para gastronomía.",
    image: "images/cat-alimentos.jpg",
    subcategories: [
      { id: "aceites", name: "Aceites y fritura profunda" },
      { id: "arroces", name: "Arroces y granos especiales" },
      { id: "pastas-harinas", name: "Pastas, harinas y masas" },
      { id: "salsas-conservas", name: "Salsas, conservas y condimentos" },
      { id: "azucar-sal", name: "Azúcar, sal y especias" }
    ]
  },
  {
    id: "sushi",
    slug: "sushi-y-gastronomia-oriental",
    name: "Sushi y gastronomía oriental",
    shortName: "Sushi",
    badge: "Línea Estrella",
    featured: true,
    description: "Insumos indispensables para locales de sushi y dark kitchens: arroz grano corto Shirakiku, algas nori, panko, quesos crema y salsas orientales.",
    image: "images/cat-sushi.jpg",
    subcategories: [
      { id: "arroz-sushi", name: "Arroz grano corto" },
      { id: "algas-nori", name: "Algas nori y coberturas" },
      { id: "salsas-orientales", name: "Salsas de soya, teriyaki y unagi" },
      { id: "insumos-crujientes", name: "Panko, tempura y rebozados" },
      { id: "condimentos-orientales", name: "Wasabi, jengibre y sésamo" },
      { id: "herramientas-sushi", name: "Esterillas makisu y herramientas" }
    ]
  },
  {
    id: "congelados",
    slug: "congelados",
    name: "Congelados",
    shortName: "Congelados",
    badge: "Cadena de Frío Garantizada",
    description: "Mariscos seleccionados, camarón ecuatoriano, papas prefritas corte bastón, carnes seleccionadas y pulpas de fruta 100% natural Río Alto.",
    image: "images/cat-congelados.jpg",
    subcategories: [
      { id: "mariscos-camarones", name: "Camarones y mariscos" },
      { id: "papas-prefritas", name: "Papas prefritas bastón" },
      { id: "carnes-cortes", name: "Carnes y cortes al vacío" },
      { id: "pulpas-fruta", name: "Pulpas de fruta natural Río Alto" }
    ]
  },
  {
    id: "lacteos",
    slug: "lacteos-y-refrigerados",
    name: "Lácteos y refrigerados",
    shortName: "Lácteos",
    badge: "UHT & Gastronomía",
    description: "Quesos crema en formato gastronómico de alto corte, quesos mozzarella, parmesano en horma, mantequillas y cremas de leche.",
    image: "images/cat-lacteos.jpg",
    subcategories: [
      { id: "quesos-crema", name: "Quesos crema gastronómicos" },
      { id: "quesos-maduros", name: "Mozzarella, parmesano y maduros" },
      { id: "cremas-leche", name: "Cremas de leche UHT y leches" },
      { id: "mantequillas", name: "Mantequillas profesionales" }
    ]
  },
  {
    id: "limpieza",
    slug: "limpieza-y-aseo",
    name: "Limpieza y aseo",
    shortName: "Limpieza",
    badge: "Certificación SEREMI",
    featured: true,
    description: "Detergentes concentrados, desengrasantes de cocina pesada, sanitizantes, cloro industrial, guantes certificados y bolsas de alto micronaje.",
    image: "images/cat-limpieza.jpg",
    subcategories: [
      { id: "quimicos-limpieza", name: "Lavalozas, desengrasantes y cloro" },
      { id: "bolsas-aseo", name: "Bolsas de aseo alta densidad" },
      { id: "guantes-seguridad", name: "Guantes de nitrilo, látex y vinilo" },
      { id: "papeleria-servilletas", name: "Papel jumbo, toalla nova y servilletas" },
      { id: "accesorios-aseo", name: "Paños microfibra y esponjas industriales" }
    ]
  },
  {
    id: "insumos",
    slug: "insumos-para-restaurantes",
    name: "Insumos para restaurantes",
    shortName: "Insumos",
    badge: "Food Service & Packaging",
    description: "Films de embalaje PVC profesional, rollos térmicos de boleta/comanda, envases para sushi, bowls kraft y bolsas de reparto.",
    image: "images/cat-insumos.jpg",
    subcategories: [
      { id: "films-alusa", name: "Alusa film PVC y embalaje" },
      { id: "rollos-termicos", name: "Rollos térmicos POS y comandas" },
      { id: "envases-delivery", name: "Envases sushi, bowls y vasos" }
    ]
  }
];

const INITIAL_PRODUCTS = [
  // ==========================================
  // ALIMENTOS Y ABARROTES
  // ==========================================
  {
    id: "prod-001",
    sku: "OLV-ALM-001",
    name: "Aceite para Freír Don Maravilla 5 LT",
    brand: "Don Maravilla",
    categoryId: "alimentos",
    categoryName: "Alimentos y Abarrotes",
    subcategoryId: "aceites",
    subcategoryName: "Aceites y Fritura Profunda",
    collections: ["top-sellers", "horeca-esencial"],
    format: "Bidón 5 Litros (Caja 4 unidades)",
    unit: "Bidón / Caja",
    minOrder: 1,
    description: "Aceite formulado especialmente para frituras profundas de alto rendimiento y resistencia térmica. No transfiere sabores ni olores no deseados. Ideal para restaurantes, locales de sushi y empanadas.",
    specs: {
      "Contenido": "5 Litros por bidón",
      "Empaque máster": "Caja de 4 bidones (20L total)",
      "Punto de humo": "220°C alto rendimiento",
      "Origen": "Nacional (Chile)"
    },
    image: "images/products/alimentos/OLV-ALM-001.jpg",
    inStock: true
  },
  {
    id: "prod-002",
    sku: "OLV-ALM-002",
    name: "Aceite para Freír MaxiFrits Maravilla 10 LT",
    brand: "MaxiFrits",
    categoryId: "alimentos",
    categoryName: "Alimentos y Abarrotes",
    subcategoryId: "aceites",
    subcategoryName: "Aceites y Fritura Profunda",
    collections: ["horeca-esencial", "gran-volumen"],
    format: "Bidón industrial 10 Litros",
    unit: "Bidón",
    minOrder: 1,
    description: "Formulación profesional de máxima durabilidad para freidoras continuas industriales. Mayor vida útil entre cambios de aceite, reduciendo costos operativos por servicio.",
    specs: {
      "Contenido": "10 Litros",
      "Formato": "Bidón resistente con manilla",
      "Aplicación": "Freidoras industriales B2B",
      "Estabilidad": "Ultra resistente a la oxidación"
    },
    image: "images/products/alimentos/OLV-ALM-002.jpg",
    inStock: true
  },
  {
    id: "prod-003",
    sku: "OLV-ALM-003",
    name: "Aceite Vegetal Coliseo 900 ML (Caja 15 unidades)",
    brand: "Coliseo",
    categoryId: "alimentos",
    categoryName: "Alimentos y Abarrotes",
    subcategoryId: "aceites",
    subcategoryName: "Aceites y Fritura Profunda",
    collections: ["almacenes-minimarkets"],
    format: "Caja máster de 15 botellas x 900 ml",
    unit: "Caja 15 Botellas",
    minOrder: 1,
    description: "Aceite vegetal multiuso 100% puro, ideal para cocción diaria, salteados y ensaladas. Excelente rotación para minimarkets, casinos y cocinas institucionales.",
    specs: {
      "Presentación": "Botellas PET 900 ml",
      "Contenido por caja": "15 unidades (13.5L totales)",
      "Uso recomendado": "Salteados, sofritos y preparaciones calientes"
    },
    image: "images/products/alimentos/OLV-ALM-003.jpg",
    inStock: true
  },
  {
    id: "prod-004",
    sku: "OLV-ALM-004",
    name: "Aceite Oliva Extra Virgen Sabattini 5 LT",
    brand: "Sabattini",
    categoryId: "alimentos",
    categoryName: "Alimentos y Abarrotes",
    subcategoryId: "aceites",
    subcategoryName: "Aceites y Fritura Profunda",
    collections: ["gourmet-premium", "top-sellers"],
    format: "Bidón 5 Litros (Caja 4 unidades)",
    unit: "Bidón / Caja",
    minOrder: 1,
    description: "Aceite de oliva extra virgen de primera presión en frío. Acidez inferior al 0.3%, aroma afrutado mediterráneo con notas de hierba fresca. Perfecto para restaurantes gourmet y pastas finas.",
    specs: {
      "Contenido": "5 Litros",
      "Acidez": "< 0.3%",
      "Extracción": "Primera prensada en frío",
      "Calidad": "Extra Virgen Gourmet"
    },
    image: "images/products/alimentos/OLV-ALM-004.jpg",
    inStock: true
  },
  {
    id: "prod-005",
    sku: "OLV-ALM-005",
    name: "Arroz Grano Corto Arborio Roma 1 KG",
    brand: "Roma",
    categoryId: "alimentos",
    categoryName: "Alimentos y Abarrotes",
    subcategoryId: "arroces",
    subcategoryName: "Arroces y Granos Especiales",
    collections: ["gourmet-premium"],
    format: "Caja / Paquete 1 Kg al vacío",
    unit: "Paquete 1 Kg",
    minOrder: 5,
    description: "Arroz variedad Arborio seleccionado de grano grueso y alto contenido de amilosa. Desarrolla la cremosidad exacta requerida para risottos y preparaciones de alta cocina italiana.",
    specs: {
      "Variedad": "Arborio Italiano",
      "Formato": "1 Kilogramo al vacío",
      "Rendimiento": "Excelente absorción de caldos"
    },
    image: "images/products/alimentos/OLV-ALM-005.jpg",
    inStock: true
  },
  {
    id: "prod-006",
    sku: "OLV-ALM-006",
    name: "Arroz Grano Largo Coliseo G2 1 KG (Display 10 KG)",
    brand: "Coliseo",
    categoryId: "alimentos",
    categoryName: "Alimentos y Abarrotes",
    subcategoryId: "arroces",
    subcategoryName: "Arroces y Granos Especiales",
    collections: ["horeca-esencial"],
    format: "Bolsa 1 Kg (Fardo display de 10 paquetes)",
    unit: "Display 10 Kg",
    minOrder: 1,
    description: "Arroz Grano Largo Grado 2 de grano parejo y cocción suelta garantizada. El insumo más confiable para guarniciones en casinos, rotiserías y restaurantes.",
    specs: {
      "Grado": "Grado 2 seleccionado",
      "Presentación": "Fardo 10 unidades x 1 Kg",
      "Punto de cocción": "Grano blanco, firme y suelto"
    },
    image: "images/products/alimentos/OLV-ALM-006.jpg",
    inStock: true
  },
  {
    id: "prod-007",
    sku: "OLV-ALM-007",
    name: "Harina de Trigo Mont Blanc Con Polvos 1 KG (Fardo 10 KG)",
    brand: "Mont Blanc",
    categoryId: "alimentos",
    categoryName: "Alimentos y Abarrotes",
    subcategoryId: "pastas-harinas",
    subcategoryName: "Pastas, Harinas y Masas",
    collections: ["panaderia-pizzeria"],
    format: "Fardo 10 paquetes x 1 Kg",
    unit: "Fardo 10 Kg",
    minOrder: 1,
    description: "Harina refinada extra blanca con agentes leudantes dosificados de fábrica de manera homogénea. Formulada para bizcochuelos, masas dulces, empanadas y repostería uniforme.",
    specs: {
      "Tipo": "Con agentes leudantes equilibrados",
      "Empaque": "10 paquetes de 1 Kg",
      "Humedad": "Máx 14.5%"
    },
    image: "images/products/alimentos/OLV-ALM-007.jpg",
    inStock: true
  },
  {
    id: "prod-008",
    sku: "OLV-ALM-008",
    name: "Harina de Trigo Mont Blanc Sin Polvos 1 KG (Fardo 10 KG)",
    brand: "Mont Blanc",
    categoryId: "alimentos",
    categoryName: "Alimentos y Abarrotes",
    subcategoryId: "pastas-harinas",
    subcategoryName: "Pastas, Harinas y Masas",
    collections: ["panaderia-pizzeria", "horeca-esencial"],
    format: "Fardo 10 paquetes x 1 Kg",
    unit: "Fardo 10 Kg",
    minOrder: 1,
    description: "Harina de trigo pura sin leudantes, de excelente fuerza de gluten para panificación artesanal, masas de pizza, pastas frescas y tempuras crujientes.",
    specs: {
      "Tipo": "Sin polvos de hornear",
      "Empaque": "Fardo de 10 paquetes x 1 Kg",
      "Gluten": "Óptimo para elasticidad y estructura"
    },
    image: "images/products/alimentos/OLV-ALM-008.jpg",
    inStock: true
  },
  {
    id: "prod-009",
    sku: "OLV-ALM-009",
    name: "Spaghetti Tradicional Don Giuseppe 400 GR (Caja 20 unidades)",
    brand: "Don Giuseppe",
    categoryId: "alimentos",
    categoryName: "Alimentos y Abarrotes",
    subcategoryId: "pastas-harinas",
    subcategoryName: "Pastas, Harinas y Masas",
    collections: ["horeca-esencial"],
    format: "Caja máster de 20 paquetes x 400g",
    unit: "Caja 20 Unidades",
    minOrder: 1,
    description: "Pasta elaborada con sémola de trigo candeal seleccionado. Mantiene el punto al dente sin ablandarse ni apelmazarse en el mantenimiento de buffet y servicios de alto tráfico.",
    specs: {
      "Variedad": "Spaghetti N°5",
      "Sémola": "100% Trigo candeal durüm",
      "Contenido por caja": "20 paquetes de 400 gramos (8 Kg)"
    },
    image: "images/products/alimentos/OLV-ALM-009.jpg",
    inStock: true
  },
  {
    id: "prod-010",
    sku: "OLV-ALM-010",
    name: "Fideos Espiral Don Giuseppe 400 GR (Caja 20 unidades)",
    brand: "Don Giuseppe",
    categoryId: "alimentos",
    categoryName: "Alimentos y Abarrotes",
    subcategoryId: "pastas-harinas",
    subcategoryName: "Pastas, Harinas y Masas",
    collections: ["horeca-esencial"],
    format: "Caja máster de 20 paquetes x 400g",
    unit: "Caja 20 Unidades",
    minOrder: 1,
    description: "Fideos formato espiral que retienen con gran adherencia salsas cremosas y pestos. Excelente presentación visual en platos y ensaladas frías.",
    specs: {
      "Corte": "Espiral (Fusilli)",
      "Empaque": "Caja 20 paquetes (8 Kg netos)"
    },
    image: "images/products/alimentos/OLV-ALM-010.jpg",
    inStock: true
  },
  {
    id: "prod-011",
    sku: "OLV-ALM-011",
    name: "Salsa de Tomate Italiana San Remo 1 KG (Caja 10 unidades)",
    brand: "San Remo",
    categoryId: "alimentos",
    categoryName: "Alimentos y Abarrotes",
    subcategoryId: "salsas-conservas",
    subcategoryName: "Salsas, Conservas y Condimentos",
    collections: ["horeca-esencial", "panaderia-pizzeria"],
    format: "Caja máster de 10 bolsas pouch x 1 Kg",
    unit: "Caja 10 Bolsas (10 Kg)",
    minOrder: 1,
    description: "Salsa de tomates maduros seleccionados con orégano y especias mediterráneas en formato pouch fácil de abrir y almacenar. Ahorra tiempo en cocina con balance perfecto de acidez.",
    specs: {
      "Formato": "Bolsas pouch ergonómicas 1 Kg",
      "Total por caja": "10 Kilogramos",
      "Conservación": "Temperatura ambiente hasta abrir"
    },
    image: "images/products/alimentos/OLV-ALM-011.jpg",
    inStock: true
  },
  {
    id: "prod-012",
    sku: "OLV-ALM-012",
    name: "Salsa Pizza Lista para Usar RTU 1 KG (Caja 10 unidades)",
    brand: "San Remo Pro",
    categoryId: "alimentos",
    categoryName: "Alimentos y Abarrotes",
    subcategoryId: "salsas-conservas",
    subcategoryName: "Salsas, Conservas y Condimentos",
    collections: ["panaderia-pizzeria"],
    format: "Caja máster de 10 bolsas pouch x 1 Kg",
    unit: "Caja 10 Bolsas (10 Kg)",
    minOrder: 1,
    description: "Salsa lista para pizza (Ready To Use), especiada con albahaca y ajo natural, con consistencia espesa para no humedecer la masa de pizza durante el horneado a alta temperatura.",
    specs: {
      "Densidad": "Alta concentración brix para pizza",
      "Condimento": "Orégano, albahaca y sal balanceada",
      "Formato": "Caja 10 Kg (10 pouches de 1 Kg)"
    },
    image: "images/products/alimentos/OLV-ALM-012.jpg",
    inStock: true
  },
  {
    id: "prod-013",
    sku: "OLV-ALM-013",
    name: "Azúcar Blanca Refinada Coliseo 1 KG (Fardo 10 KG)",
    brand: "Coliseo",
    categoryId: "alimentos",
    categoryName: "Alimentos y Abarrotes",
    subcategoryId: "azucar-sal",
    subcategoryName: "Azúcar, Sal y Especias",
    collections: ["horeca-esencial"],
    format: "Fardo 10 paquetes x 1 Kg",
    unit: "Fardo 10 Kg",
    minOrder: 1,
    description: "Azúcar blanca refinada de alta pureza y cristalización fina. Esencial para pastelería, salsas agridulces, almíbares de sushi (shari) y cafetería.",
    specs: {
      "Pureza": "Grado 1 refinada blanca",
      "Empaque": "10 paquetes x 1 Kg"
    },
    image: "images/products/alimentos/OLV-ALM-013.jpg",
    inStock: true
  },
  {
    id: "prod-014",
    sku: "OLV-ALM-014",
    name: "Sal Fina Yodada Smart Price 1 KG (Fardo 20 KG)",
    brand: "Smart Price",
    categoryId: "alimentos",
    categoryName: "Alimentos y Abarrotes",
    subcategoryId: "azucar-sal",
    subcategoryName: "Azúcar, Sal y Especias",
    collections: ["horeca-esencial"],
    format: "Fardo 20 paquetes x 1 Kg",
    unit: "Fardo 20 Kg",
    minOrder: 1,
    description: "Sal fina seca yodada de fluidez controlada. Rápida disolución en caldos, marinadas y curado de carnes o pescados.",
    specs: {
      "Granulometría": "Fina y homogénea con antihumectante",
      "Formato": "Fardo 20 Kg (20 x 1 Kg)"
    },
    image: "images/products/alimentos/OLV-ALM-014.jpg",
    inStock: true
  },

  // ==========================================
  // SUSHI Y GASTRONOMÍA ORIENTAL
  // ==========================================
  {
    id: "prod-015",
    sku: "OLV-SSH-001",
    name: "Arroz Grano Corto Shirakiku 9 KG (Especial Sushi)",
    brand: "Shirakiku",
    categoryId: "sushi",
    categoryName: "Sushi y Gastronomía Oriental",
    subcategoryId: "arroz-sushi",
    subcategoryName: "Arroz Grano Corto",
    collections: ["sushi-specials", "top-sellers", "horeca-esencial"],
    format: "Saco industrial 9 Kilogramos",
    unit: "Saco 9 Kg",
    minOrder: 1,
    description: "El arroz de sushi preferido por los itamae y sushimen en Chile. Grano corto japonés Koshihikari-style con la cantidad exacta de almidón para armar rolls firmes, brillantes y de textura inigualable.",
    specs: {
      "Variedad": "Grano corto premium tipo Calrose/Japónica",
      "Formato": "Saco reforzado de 9 Kg",
      "Rendimiento shari": "Aprox 20 a 22 Kg de arroz aderezado cocido",
      "Importación": "Grado Superior gastronómico"
    },
    image: "images/products/sushi/OLV-SSH-001.jpg",
    inStock: true
  },
  {
    id: "prod-016",
    sku: "OLV-SSH-002",
    name: "Alga Nori Tostada Platinum Gold (Pack 50 Hojas)",
    brand: "Japofood Pro",
    categoryId: "sushi",
    categoryName: "Sushi y Gastronomía Oriental",
    subcategoryId: "algas-nori",
    subcategoryName: "Algas Nori y Coberturas",
    collections: ["sushi-specials", "top-sellers"],
    format: "Pack sellado hermético con 50 hojas enteras (21x19 cm)",
    unit: "Pack 50 Hojas",
    minOrder: 2,
    description: "Algas nori de grado Platinum, color verde oscuro intenso, aroma marino limpio y textura crocante que no se rompe al enrollar makis ni temakis. Resistente a la humedad del arroz.",
    specs: {
      "Calidad": "Platinum Gold 100% Yaki Nori",
      "Dimensiones": "21 x 19 cm por hoja",
      "Rendimiento": "100 medios rolls (hosomakis/uramaki)",
      "Empaque": "Bolsa metalizada con cierre zip y desecante"
    },
    image: "https://images.unsplash.com/photo-1617093727343-374698b1b08d?auto=format&fit=crop&w=700&q=80",
    inStock: true
  },
  {
    id: "prod-017",
    sku: "OLV-SSH-003",
    name: "Queso Crema Milkaut Gastronómico Balde 3.6 KG",
    brand: "Milkaut",
    categoryId: "sushi",
    categoryName: "Sushi y Gastronomía Oriental",
    subcategoryId: "insumos-crujientes",
    subcategoryName: "Panko, Tempura y Rebozados",
    collections: ["sushi-specials", "top-sellers", "lacteos-top"],
    format: "Balde sellado 3.6 Kilogramos",
    unit: "Balde 3.6 Kg",
    minOrder: 1,
    description: "El queso crema emblemático de la sushitería en Chile. Estructura compacta y cremosa que permite manguear con facilidad, cortar sin desarmarse y mantener firmeza dentro de los rolls tibios o fritos.",
    specs: {
      "Contenido": "3.6 Kg neto",
      "Textura": "Firme y altamente moldeable",
      "Comportamiento térmico": "Excelente resistencia en hot rolls fritos",
      "Conservación": "Refrigerado 2°C a 6°C"
    },
    image: "images/products/sushi/OLV-SSH-003.jpg",
    inStock: true
  },
  {
    id: "prod-018",
    sku: "OLV-SSH-004",
    name: "Queso Crema Reny Picot Barra 1.36 KG (Caja 10 barras)",
    brand: "Reny Picot",
    categoryId: "sushi",
    categoryName: "Sushi y Gastronomía Oriental",
    subcategoryId: "insumos-crujientes",
    subcategoryName: "Panko, Tempura y Rebozados",
    collections: ["sushi-specials", "lacteos-top"],
    format: "Barra sellada 1.36 Kg (Caja máster de 10 barras = 13.6 Kg)",
    unit: "Barra 1.36 Kg / Caja",
    minOrder: 1,
    description: "Barra tradicional de queso crema de sabor suave y consistencia densa. Se corta con hilo o cuchillo en tiras parejas para el corazón del roll con cero desperdicio.",
    specs: {
      "Presentación": "Barra rectangular 1.36 Kilogramos",
      "Caja máster": "10 barras individuales",
      "Rendimiento": "Corte preciso en bastones para rolls"
    },
    image: "images/products/sushi/OLV-SSH-004.jpg",
    inStock: true
  },
  {
    id: "prod-019",
    sku: "OLV-SSH-005",
    name: "Queso Crema Zanafoods Barra 1.36 KG",
    brand: "Zanafoods",
    categoryId: "sushi",
    categoryName: "Sushi y Gastronomía Oriental",
    subcategoryId: "insumos-crujientes",
    subcategoryName: "Panko, Tempura y Rebozados",
    collections: ["sushi-specials"],
    format: "Barra sellada al vacío 1.36 Kilogramos",
    unit: "Barra 1.36 Kg",
    minOrder: 1,
    description: "Opción de alto rendimiento y excelente relación costo-calidad para restaurantes de sushi con alta demanda diaria.",
    specs: {
      "Contenido": "1.36 Kg",
      "Formato": "Barra gastronómica"
    },
    image: "images/products/sushi/OLV-SSH-005.jpg",
    inStock: true
  },
  {
    id: "prod-020",
    sku: "OLV-SSH-006",
    name: "Panko Japonés Extra Crujiente 1 KG (Caja 10 KG)",
    brand: "Tokyo Panko Pro",
    categoryId: "sushi",
    categoryName: "Sushi y Gastronomía Oriental",
    subcategoryId: "insumos-crujientes",
    subcategoryName: "Panko, Tempura y Rebozados",
    collections: ["sushi-specials", "top-sellers"],
    format: "Bolsa 1 Kg (Caja 10 unidades)",
    unit: "Bolsa 1 Kg / Caja 10 Kg",
    minOrder: 2,
    description: "Escamas de miga de pan deshidratada en hojuelas aireadas. Absorbe 40% menos aceite que el pan rallado común, dejando rolls fritos, ebi furai y gyozas con un dorado ligero y crujiente prolongado.",
    specs: {
      "Hojuela": "Formato aguja / copo grande",
      "Absorción grasa": "Baja absorción, máximo crunch",
      "Presentación": "Bolsa 1 Kg al vacío"
    },
    image: "https://images.unsplash.com/photo-1541544741938-0af808871cc0?auto=format&fit=crop&w=700&q=80",
    inStock: true
  },
  {
    id: "prod-021",
    sku: "OLV-SSH-007",
    name: "Salsa de Soya Tradicional Japofood Bidón 5 LT",
    brand: "Japofood",
    categoryId: "sushi",
    categoryName: "Sushi y Gastronomía Oriental",
    subcategoryId: "salsas-orientales",
    subcategoryName: "Salsas de Soya, Teriyaki y Unagi",
    collections: ["sushi-specials", "horeca-esencial"],
    format: "Bidón 5 Litros industrial",
    unit: "Bidón 5L",
    minOrder: 1,
    description: "Salsa de soya naturalmente fermentada de perfil umami balanceado y color ámbar brillante. Ideal para fraccionar en potes individuales de delivery o emplear en woks.",
    specs: {
      "Contenido": "5 Litros",
      "Fermentación": "Método natural tradicional",
      "Formato": "Bidón apilable con vertedor"
    },
    image: "https://images.unsplash.com/photo-1582878826629-29b7ad1cdc43?auto=format&fit=crop&w=700&q=80",
    inStock: true
  },
  {
    id: "prod-022",
    sku: "OLV-SSH-008",
    name: "Salsa Teriyaki Glaze Espesa Japofood 1.8 LT",
    brand: "Japofood",
    categoryId: "sushi",
    categoryName: "Sushi y Gastronomía Oriental",
    subcategoryId: "salsas-orientales",
    subcategoryName: "Salsas de Soya, Teriyaki y Unagi",
    collections: ["sushi-specials"],
    format: "Botella plástica profesional 1.8 Litros (Caja 6 unidades)",
    unit: "Botella 1.8L",
    minOrder: 1,
    description: "Glaseado teriyaki de consistencia espesa, brillo espejo y notas dulces de jengibre y mirin. Se mantiene perfecta sobre los rolls al decorar sin escurrirse.",
    specs: {
      "Presentación": "1.8 Litros",
      "Viscosidad": "Glaze espeso para decoración",
      "Sabor": "Equilibrio dulce-salado profundo"
    },
    image: "https://images.unsplash.com/photo-1582878826629-29b7ad1cdc43?auto=format&fit=crop&w=700&q=80",
    inStock: true
  },
  {
    id: "prod-023",
    sku: "OLV-SSH-009",
    name: "Salsa Anguila Unagi Tare Premium 1.8 LT",
    brand: "Japofood",
    categoryId: "sushi",
    categoryName: "Sushi y Gastronomía Oriental",
    subcategoryId: "salsas-orientales",
    subcategoryName: "Salsas de Soya, Teriyaki y Unagi",
    collections: ["sushi-specials", "gourmet-premium"],
    format: "Botella 1.8 Litros",
    unit: "Botella 1.8L",
    minOrder: 1,
    description: "Reducción artesanal tradicional para unagi y rolls flameados. Aporta un acabado ahumado agridulce y cuerpo caramelizado sublime.",
    specs: {
      "Contenido": "1.8 Litros",
      "Uso": "Rolls especiales, flameados y mariscos grillados"
    },
    image: "https://images.unsplash.com/photo-1582878826629-29b7ad1cdc43?auto=format&fit=crop&w=700&q=80",
    inStock: true
  },
  {
    id: "prod-024",
    sku: "OLV-SSH-010",
    name: "Wasabi en Polvo Grado A Lata 1 KG",
    brand: "Wasabi Fuji",
    categoryId: "sushi",
    categoryName: "Sushi y Gastronomía Oriental",
    subcategoryId: "condimentos-orientales",
    subcategoryName: "Condimentos Orientales",
    collections: ["sushi-specials"],
    format: "Lata metálica hermética 1 Kg",
    unit: "Lata 1 Kg",
    minOrder: 1,
    description: "Polvo de wasabi de rápida hidratación. Rinde más de 3.5 kg de pasta de picor nasal intenso, verde vivo y excelente plasticidad para modelar figuras de servicio.",
    specs: {
      "Rendimiento": "1 Kg de polvo + 2.5L de agua = 3.5 Kg de pasta",
      "Color": "Verde esmeralda natural",
      "Envase": "Lata sellada con tapa plástica reutilizable"
    },
    image: "https://images.unsplash.com/photo-1617093727343-374698b1b08d?auto=format&fit=crop&w=700&q=80",
    inStock: true
  },
  {
    id: "prod-025",
    sku: "OLV-SSH-011",
    name: "Jengibre Encurtido Gari Blanco Balde 1.5 KG",
    brand: "Gari Master",
    categoryId: "sushi",
    categoryName: "Sushi y Gastronomía Oriental",
    subcategoryId: "condimentos-orientales",
    subcategoryName: "Condimentos Orientales",
    collections: ["sushi-specials"],
    format: "Balde plástico con salmuera 1.5 Kg",
    unit: "Balde 1.5 Kg",
    minOrder: 1,
    description: "Láminas finas de raíz de jengibre joven encurtido en vinagre dulce de arroz. Limpia el paladar entre diferentes piezas de sushi con frescura cítrica.",
    specs: {
      "Corte": "Láminas ultra delgadas sin fibras duras",
      "Color": "Blanco marfil natural (sin colorantes artificiales)",
      "Peso drenado": "1.0 Kg neto"
    },
    image: "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=700&q=80",
    inStock: true
  },
  {
    id: "prod-026",
    sku: "OLV-SSH-012",
    name: "Sésamo Tostado Bicolor Blanco y Negro 1 KG",
    brand: "Japofood",
    categoryId: "sushi",
    categoryName: "Sushi y Gastronomía Oriental",
    subcategoryId: "condimentos-orientales",
    subcategoryName: "Condimentos Orientales",
    collections: ["sushi-specials"],
    format: "Bolsa sellada 1 Kg",
    unit: "Bolsa 1 Kg",
    minOrder: 1,
    description: "Semillas seleccionadas de sésamo blanco y negro en proporción 50/50, tostadas uniformemente para otorgar un toque crocante y aroma a nuez sobre uramakis y ensaladas sunomono.",
    specs: {
      "Composición": "50% sésamo blanco tostado + 50% sésamo negro tostado",
      "Contenido": "1 Kg"
    },
    image: "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=700&q=80",
    inStock: true
  },
  {
    id: "prod-027",
    sku: "OLV-SSH-013",
    name: "Esterilla Makisu de Bambú Reforzada (Pack 5 unidades)",
    brand: "Chef Tools Pro",
    categoryId: "sushi",
    categoryName: "Sushi y Gastronomía Oriental",
    subcategoryId: "herramientas-sushi",
    subcategoryName: "Esterillas Makisu y Cuchillería",
    collections: ["sushi-specials", "equipamiento-b2b"],
    format: "Pack de 5 esterillas de bambú natural",
    unit: "Pack 5 Unidades",
    minOrder: 1,
    description: "Esterillas tradicionales tejidas con hilo de algodón de alta resistencia. Varillas de bambú pulidas sin astillas para un armado perfecto de rolls redondos o cuadrados.",
    specs: {
      "Medidas": "24 x 24 cm",
      "Material": "Bambú verde tratado apto alimentos",
      "Cantidad": "5 piezas por set"
    },
    image: "https://images.unsplash.com/photo-1579871494447-9811cf80d66c?auto=format&fit=crop&w=700&q=80",
    inStock: true
  },

  // ==========================================
  // CONGELADOS
  // ==========================================
  {
    id: "prod-028",
    sku: "OLV-CON-001",
    name: "Camarón Ecuatoriano P&D 36/40 (Pelado y Desvenado) 1 KG",
    brand: "Pacífico Sur",
    categoryId: "congelados",
    categoryName: "Congelados y Frutas IQF",
    subcategoryId: "mariscos-camarones",
    subcategoryName: "Camarones y Mariscos",
    collections: ["top-sellers", "sushi-specials", "horeca-esencial"],
    format: "Bolsa IQF 1 Kg (Caja máster de 10 Kg)",
    unit: "Bolsa 1 Kg / Caja 10 Kg",
    minOrder: 1,
    description: "Camarón ecuatoriano de cultivo seleccionado, calibre 36/40 piezas por libra. Congelado individualmente IQF con glaseado técnico del 10%. Pelado y desvenado listo para tempura, salteados y sushi ebi furai.",
    specs: {
      "Calibre": "36/40 piezas / libra (aprox 75 a 85 camarones/kg)",
      "Proceso": "P&D (Peeled and Deveined) IQF",
      "Glaseado": "10% protector",
      "Caja máster": "10 bolsas de 1 Kilogramo"
    },
    image: "images/products/congelados/OLV-CON-001.jpg",
    inStock: true
  },
  {
    id: "prod-029",
    sku: "OLV-CON-002",
    name: "Camarón Ecuatoriano Con Cáscara 36/40 1 KG (Caja 10 KG)",
    brand: "Pacífico Sur",
    categoryId: "congelados",
    categoryName: "Congelados y Frutas IQF",
    subcategoryId: "mariscos-camarones",
    subcategoryName: "Camarones y Mariscos",
    collections: ["horeca-esencial"],
    format: "Bolsa 1 Kg (Caja máster de 10 Kg)",
    unit: "Bolsa 1 Kg / Caja 10 Kg",
    minOrder: 1,
    description: "Camarón entero con cola y caparazón para cocción al vapor o parrilla, conservando todos los jugos naturales del marisco.",
    specs: {
      "Calibre": "36/40 con cáscara",
      "Presentación": "Bolsa 1 Kg al vacío"
    },
    image: "images/products/congelados/OLV-CON-002.jpg",
    inStock: true
  },
  {
    id: "prod-030",
    sku: "OLV-CON-003",
    name: "Camarón Chino Calibre 36/40 Bolsa 1 KG",
    brand: "Importado Oriental",
    categoryId: "congelados",
    categoryName: "Congelados y Frutas IQF",
    subcategoryId: "mariscos-camarones",
    subcategoryName: "Camarones y Mariscos",
    collections: ["sushi-specials"],
    format: "Bolsa 1 Kg congelado rápido",
    unit: "Bolsa 1 Kg",
    minOrder: 1,
    description: "Excelente alternativa comercial para preparaciones cocidas, empanadas de mariscos y rellenos de sushi.",
    specs: {
      "Calibre": "36/40 piezas/libra",
      "Formato": "Bolsa 1 Kg"
    },
    image: "images/products/congelados/OLV-CON-003.jpg",
    inStock: true
  },
  {
    id: "prod-031",
    sku: "OLV-CON-004",
    name: "Papas Prefritas Corte Bastón 10 MM Cresswell (Caja 12 KG)",
    brand: "Cresswell",
    categoryId: "congelados",
    categoryName: "Congelados y Frutas IQF",
    subcategoryId: "papas-prefritas",
    subcategoryName: "Papas Prefritas Bastón",
    collections: ["top-sellers", "horeca-esencial"],
    format: "Caja máster de 6 bolsas x 2 Kg (12 Kg totales)",
    unit: "Caja 12 Kg (6x2kg)",
    minOrder: 1,
    description: "Papas prefritas congeladas de corte tradicional 10x10 mm. Excelente relación exterior dorado crocante e interior cremoso puré. No se ablandan en delivery.",
    specs: {
      "Corte": "10 x 10 mm bastón estándar",
      "Empaque": "6 bolsas de 2 Kilogramos (12 Kg)",
      "Tiempo de fritura": "3 a 4 minutos a 175°C",
      "Origen": "Bélgica / Holanda Premium"
    },
    image: "images/products/congelados/OLV-CON-004.jpg",
    inStock: true
  },
  {
    id: "prod-032",
    sku: "OLV-CON-005",
    name: "Papas Prefritas Corte Fino 7 MM Cresswell (Caja 12 KG)",
    brand: "Cresswell",
    categoryId: "congelados",
    categoryName: "Congelados y Frutas IQF",
    subcategoryId: "papas-prefritas",
    subcategoryName: "Papas Prefritas Bastón",
    collections: ["horeca-esencial"],
    format: "Caja máster de 6 bolsas x 2 Kg (12 Kg totales)",
    unit: "Caja 12 Kg (6x2kg)",
    minOrder: 1,
    description: "Corte fino estilo Fast Food de 7x7 mm. Fritura ultrarrápida en menos de 2.5 minutos con crocancia prolongada. Ideal para hamburgueserías y delivery.",
    specs: {
      "Corte": "7 x 7 mm fino / shoestring",
      "Empaque": "6 bolsas de 2 Kg (12 Kg netos)",
      "Tiempo de cocción": "2 a 2.5 minutos"
    },
    image: "images/products/congelados/OLV-CON-005.jpg",
    inStock: true
  },
  {
    id: "prod-033",
    sku: "OLV-CON-006",
    name: "Papas Prefritas Corte Grueso 12 MM Cresswell (Caja 12 KG)",
    brand: "Cresswell",
    categoryId: "congelados",
    categoryName: "Congelados y Frutas IQF",
    subcategoryId: "papas-prefritas",
    subcategoryName: "Papas Prefritas Bastón",
    collections: ["horeca-esencial"],
    format: "Caja máster de 6 bolsas x 2 Kg (12 Kg totales)",
    unit: "Caja 12 Kg (6x2kg)",
    minOrder: 1,
    description: "Corte rústico grueso de 12x12 mm con gran presencia en plato. Ideal para parrillas, lomos a lo pobre y chorrillanas.",
    specs: {
      "Corte": "12 x 12 mm corte grueso",
      "Empaque": "6 x 2 Kg (12 Kg)"
    },
    image: "images/products/congelados/OLV-CON-006.jpg",
    inStock: true
  },
  {
    id: "prod-034",
    sku: "OLV-CON-007",
    name: "Corte de Vacuno Asado Carnicero / Vacío Importado",
    brand: "Frigorífico Pampa",
    categoryId: "congelados",
    categoryName: "Congelados y Frutas IQF",
    subcategoryId: "carnes-cortes",
    subcategoryName: "Carnes y Cortes al Vacío",
    collections: ["carnicerias-restaurantes"],
    format: "Piezas al vacío de 2.5 a 4 Kg aprox (Venta por Kilo)",
    unit: "Kilo (Pieza al vacío)",
    minOrder: 5,
    description: "Corte de vacuno seleccionado importado de textura tierna y veteado de grasa justa. Especial para parrilladas, cocciones lentas al horno y empanadas.",
    specs: {
      "Origen": "Paraguay / Argentina seleccionado",
      "Presentación": "Envasado al vacío termoencogible",
      "Unidad de venta": "Kilos brutos por pesaje de pieza"
    },
    image: "https://images.unsplash.com/photo-1607623814075-e51df1bdc82f?auto=format&fit=crop&w=700&q=80",
    inStock: true
  },
  {
    id: "prod-035",
    sku: "OLV-CON-008",
    name: "Pulpa de Maracuyá Natural Con Pepa Río Alto 1 KG",
    brand: "Río Alto",
    categoryId: "congelados",
    categoryName: "Congelados y Frutas IQF",
    subcategoryId: "pulpas-fruta",
    subcategoryName: "Pulpas de Fruta Natural Río Alto",
    collections: ["cocteleria-sushi", "top-sellers"],
    format: "Bolsa congelada 1 Kilogramo (Caja 10 unidades)",
    unit: "Bolsa 1 Kg / Caja 10 Kg",
    minOrder: 2,
    description: "Pulpa de maracuyá 100% natural con semilla crujiente. Vital para salsas acevichadas de sushi, reducciones para rolls, postres y coctelería premium (Maracuyá Sour, Caipirinhas).",
    specs: {
      "Ingrediente": "100% Maracuyá natural con pepa",
      "Sin azúcar añadida": "100% fruta pura sin conservantes",
      "Formato": "Bolsa 1 Kg congelada a -18°C"
    },
    image: "images/products/congelados/OLV-CON-008.jpg",
    inStock: true
  },
  {
    id: "prod-036",
    sku: "OLV-CON-009",
    name: "Pulpa de Maracuyá Natural Sin Pepa Río Alto 1 KG",
    brand: "Río Alto",
    categoryId: "congelados",
    categoryName: "Congelados y Frutas IQF",
    subcategoryId: "pulpas-fruta",
    subcategoryName: "Pulpas de Fruta Natural Río Alto",
    collections: ["cocteleria-sushi"],
    format: "Bolsa congelada 1 Kilogramo (Caja 10 unidades)",
    unit: "Bolsa 1 Kg / Caja 10 Kg",
    minOrder: 2,
    description: "Pulpa de maracuyá colada y pasteurizada sin semillas. Ahorra mano de obra en bar y cocina dulce garantizando textura sedosa en mousses y salsas coladas.",
    specs: {
      "Contenido": "1 Kg neto colado",
      "Brix": "Natural de fruta madura"
    },
    image: "images/products/congelados/OLV-CON-009.jpg",
    inStock: true
  },
  {
    id: "prod-037",
    sku: "OLV-CON-010",
    name: "Pulpa de Mango Natural Río Alto 1 KG",
    brand: "Río Alto",
    categoryId: "congelados",
    categoryName: "Congelados y Frutas IQF",
    subcategoryId: "pulpas-fruta",
    subcategoryName: "Pulpas de Fruta Natural Río Alto",
    collections: ["cocteleria-sushi", "top-sellers"],
    format: "Bolsa 1 Kilogramo congelada",
    unit: "Bolsa 1 Kg",
    minOrder: 2,
    description: "Mango maduro tropical seleccionado. Esencial para salsas de mango-chutney, rolls nikkei, smoothies y jugos naturales.",
    specs: {
      "Contenido": "1 Kilogramo",
      "Variedad": "Mango Tommy/Kent dulce"
    },
    image: "images/products/congelados/OLV-CON-010.jpg",
    inStock: true
  },
  {
    id: "prod-038",
    sku: "OLV-CON-011",
    name: "Pulpa de Frambuesa Natural Río Alto 1 KG",
    brand: "Río Alto",
    categoryId: "congelados",
    categoryName: "Congelados y Frutas IQF",
    subcategoryId: "pulpas-fruta",
    subcategoryName: "Pulpas de Fruta Natural Río Alto",
    collections: ["reposteria-cocteleria"],
    format: "Bolsa 1 Kilogramo congelada",
    unit: "Bolsa 1 Kg",
    minOrder: 2,
    description: "Frambuesas del sur de Chile seleccionadas y trituradas al vacío. Acidez y color rubí brillante para coulis, cheesecakes y tragos.",
    specs: {
      "Origen": "Sur de Chile IQF",
      "Contenido": "1 Kilogramo"
    },
    image: "images/products/congelados/OLV-CON-011.jpg",
    inStock: true
  },
  {
    id: "prod-039",
    sku: "OLV-CON-012",
    name: "Pulpa de Frutilla Natural Río Alto 1 KG",
    brand: "Río Alto",
    categoryId: "congelados",
    categoryName: "Congelados y Frutas IQF",
    subcategoryId: "pulpas-fruta",
    subcategoryName: "Pulpas de Fruta Natural Río Alto",
    collections: ["reposteria-cocteleria"],
    format: "Bolsa 1 Kilogramo congelada",
    unit: "Bolsa 1 Kg",
    minOrder: 2,
    description: "Frutilla fresca aromática congelada de inmediato tras cosecha. Versatilidad total para batidos, postres y sushis dulces.",
    specs: {
      "Contenido": "1 Kilogramo"
    },
    image: "images/products/congelados/OLV-CON-012.jpg",
    inStock: true
  },

  // ==========================================
  // LÁCTEOS Y REFRIGERADOS
  // ==========================================
  {
    id: "prod-040",
    sku: "OLV-LAC-001",
    name: "Crema de Leche Gastronómica Colún 1 L (Caja 12 unidades)",
    brand: "Colún",
    categoryId: "lacteos",
    categoryName: "Lácteos y Refrigerados",
    subcategoryId: "cremas-leche",
    subcategoryName: "Cremas de Leche UHT y Leches",
    collections: ["top-sellers", "horeca-esencial"],
    format: "Caja máster de 12 botellas Tetra Pak x 1 Litro",
    unit: "Caja 12 Litros",
    minOrder: 1,
    description: "Crema natural con 35% de materia grasa de la cooperativa lechera del sur de Chile. Monta con volumen consistente y resiste la reducción al calor sin cortarse ni separar suero.",
    specs: {
      "Materia Grasa": "35% MG natural",
      "Empaque": "12 unidades de 1 Litro (12L)",
      "Origen": "La Unión, Región de Los Ríos, Chile",
      "Uso": "Salado y repostería fina"
    },
    image: "images/products/lacteos/OLV-LAC-001.jpg",
    inStock: true
  },
  {
    id: "prod-041",
    sku: "OLV-LAC-002",
    name: "Crema de Leche UHT Surlat 1 L (Caja 12 unidades)",
    brand: "Surlat",
    categoryId: "lacteos",
    categoryName: "Lácteos y Refrigerados",
    subcategoryId: "cremas-leche",
    subcategoryName: "Cremas de Leche UHT y Leches",
    collections: ["horeca-esencial"],
    format: "Caja máster de 12 litros",
    unit: "Caja 12 Litros",
    minOrder: 1,
    description: "Crema de leche UHT de larga vida útil y consistencia pareja para preparaciones calientes y salsas blancas.",
    specs: {
      "Contenido": "12 Litros por caja",
      "Conservación": "UHT ambiente hasta apertura"
    },
    image: "images/products/lacteos/OLV-LAC-002.jpg",
    inStock: true
  },
  {
    id: "prod-042",
    sku: "OLV-LAC-003",
    name: "Leche Entera UHT Tottus 1 L (Caja 12 unidades)",
    brand: "Tottus",
    categoryId: "lacteos",
    categoryName: "Lácteos y Refrigerados",
    subcategoryId: "cremas-leche",
    subcategoryName: "Cremas de Leche UHT y Leches",
    collections: ["horeca-esencial", "almacenes-minimarkets"],
    format: "Caja máster de 12 envases x 1 Litro",
    unit: "Caja 12 Litros",
    minOrder: 1,
    description: "Leche entera UHT 3.1% grasa. Excelente rotación para cafeterías, desayunos institucionales y comercio minorista.",
    specs: {
      "Presentación": "Caja 12 x 1L Tetra Brik",
      "Fortificación": "Vitaminas A y D"
    },
    image: "images/products/lacteos/OLV-LAC-003.jpg",
    inStock: true
  },
  {
    id: "prod-043",
    sku: "OLV-LAC-004",
    name: "Mantequilla Con Sal Colún Barra 250 GR (Caja 40 unidades)",
    brand: "Colún",
    categoryId: "lacteos",
    categoryName: "Lácteos y Refrigerados",
    subcategoryId: "mantequillas",
    subcategoryName: "Mantequillas Profesionales",
    collections: ["horeca-esencial"],
    format: "Caja máster de 40 barras x 250 gramos (10 Kg totales)",
    unit: "Caja 40 Barras (10 Kg)",
    minOrder: 1,
    description: "Mantequilla pura elaborada a base de crema fresca con sal dosificada al 1.5%. Punto de fusión limpio y aroma a campo sureño.",
    specs: {
      "Empaque": "40 barras de 250 gramos",
      "Materia Grasa": "82% MG mínima"
    },
    image: "images/products/lacteos/OLV-LAC-004.jpg",
    inStock: true
  },
  {
    id: "prod-044",
    sku: "OLV-LAC-005",
    name: "Queso Mozzarella Barra Gastronómica Molfino 3.5 KG",
    brand: "Molfino",
    categoryId: "lacteos",
    categoryName: "Lácteos y Refrigerados",
    subcategoryId: "quesos-maduros",
    subcategoryName: "Mozzarella, Parmesano y Maduros",
    collections: ["panaderia-pizzeria", "top-sellers"],
    format: "Pieza al vacío de 3.5 Kilogramos (Caja de 4 barras = 14 Kg)",
    unit: "Pieza 3.5 Kg / Caja",
    minOrder: 1,
    description: "Mozzarella de hilado uniforme y alto rendimiento de fundido sin generar charcos de aceite. Dorado parejo con excelente elasticidad al estirar sobre pizzas y lasagnas.",
    specs: {
      "Peso pieza": "3.5 Kg aprox",
      "Hilado": "Óptimo para rallado en hebras y gratinado",
      "Humedad": "Humedad intermedia baja (Low moisture)"
    },
    image: "images/products/lacteos/OLV-LAC-005.jpg",
    inStock: true
  },
  {
    id: "prod-045",
    sku: "OLV-LAC-006",
    name: "Queso Parmesano Maduro Horma Entera 7-8 KG",
    brand: "Valle Verde",
    categoryId: "lacteos",
    categoryName: "Lácteos y Refrigerados",
    subcategoryId: "quesos-maduros",
    subcategoryName: "Mozzarella, Parmesano y Maduros",
    collections: ["gourmet-premium"],
    format: "Horma entera cilíndrica de 7.5 Kg aprox",
    unit: "Horma Entera (~7.5 Kg)",
    minOrder: 1,
    description: "Horma entera de queso madurado por más de 12 meses. Textura granulosa con cristales de tirosina crujientes y profundo sabor aromático umami. Ideal para rallar fresco en mesa.",
    specs: {
      "Maduración": "12 meses mínimos en cava",
      "Peso promedio": "7 a 8 Kilogramos",
      "Corteza": "Corteza natural marcada"
    },
    image: "images/products/lacteos/OLV-LAC-006.jpg",
    inStock: true
  },

  // ==========================================
  // LIMPIEZA Y ASEO INSTITUCIONAL
  // ==========================================
  {
    id: "prod-046",
    sku: "OLV-ASE-001",
    name: "Lavaloza Concentrado Industrial Ecol L-2000 Bidón 5 LT",
    brand: "Ecol Químicos",
    categoryId: "limpieza",
    categoryName: "Limpieza y Aseo Institucional",
    subcategoryId: "quimicos-limpieza",
    subcategoryName: "Lavalozas, Desengrasantes y Cloro",
    collections: ["limpieza-pro", "top-sellers", "horeca-esencial"],
    format: "Bidón industrial 5 Litros (Caja 4 bidones)",
    unit: "Bidón 5L / Caja 20L",
    minOrder: 1,
    description: "Detergente lavavajillas líquido de alta concentración y biodegradabilidad. Disuelve al instante aceites pesados y grasas quemadas. Espuma activa controlada y neutra para las manos del operador.",
    specs: {
      "Concentración": "Activo al 25% materia activa",
      "pH": "7.0 a 7.5 neutro con dermoprotector",
      "Rendimiento": "Dilución hasta 1:50 en agua",
      "Certificación": "Registro ISP / SEREMI de Salud"
    },
    image: "images/products/limpieza/OLV-ASE-001.jpg",
    inStock: true
  },
  {
    id: "prod-047",
    sku: "OLV-ASE-002",
    name: "Desengrasante Pesado Industrial Ecol D-2000 Bidón 5 LT",
    brand: "Ecol Químicos",
    categoryId: "limpieza",
    categoryName: "Limpieza y Aseo Institucional",
    subcategoryId: "quimicos-limpieza",
    subcategoryName: "Lavalozas, Desengrasantes y Cloro",
    collections: ["limpieza-pro", "horeca-esencial"],
    format: "Bidón industrial 5 Litros",
    unit: "Bidón 5L",
    minOrder: 1,
    description: "Fórmula cáustica potenciada para campanas de extracción, ductos, planchas gastronómicas y pisos de cocina industrial con acumulación carbonizada.",
    specs: {
      "Acción": "Desincrustante alcalino profundo",
      "Aplicación": "Campanas, hornos, freidoras y filtros de acero",
      "Formato": "Bidón 5 Litros con precinto de seguridad"
    },
    image: "images/products/limpieza/OLV-ASE-002.jpg",
    inStock: true
  },
  {
    id: "prod-048",
    sku: "OLV-ASE-003",
    name: "Cloro Líquido Industrial 5% Bidón OK 5 LT",
    brand: "OK Químicos",
    categoryId: "limpieza",
    categoryName: "Limpieza y Aseo Institucional",
    subcategoryId: "quimicos-limpieza",
    subcategoryName: "Lavalozas, Desengrasantes y Cloro",
    collections: ["limpieza-pro", "horeca-esencial"],
    format: "Bidón opaco 5 Litros",
    unit: "Bidón 5L",
    minOrder: 1,
    description: "Hipoclorito de sodio al 5% estabilizado para sanitización de superficies de contacto alimentario, pisos de packing y desinfección sanitaria general.",
    specs: {
      "Concentración": "50 gramos Cloro activo / Litro",
      "Uso": "Sanitización hospitalaria y gastronómica"
    },
    image: "images/products/limpieza/OLV-ASE-003.jpg",
    inStock: true
  },
  {
    id: "prod-049",
    sku: "OLV-ASE-004",
    name: "Limpiador Desinfectante de Pisos Don Tito Lavanda 5 LT",
    brand: "Don Tito",
    categoryId: "limpieza",
    categoryName: "Limpieza y Aseo Institucional",
    subcategoryId: "quimicos-limpieza",
    subcategoryName: "Lavalozas, Desengrasantes y Cloro",
    collections: ["limpieza-pro"],
    format: "Bidón 5 Litros",
    unit: "Bidón 5L",
    minOrder: 1,
    description: "Limpiador perfumado con amonio cuaternario para salones de atención al público, baños y oficinas. Aroma de alta fijación residual sin dejar vetas opacas.",
    specs: {
      "Fragancia": "Lavanda Silvestre / Floral",
      "Activo germicida": "Amonio cuaternario de 5ta generación"
    },
    image: "https://images.unsplash.com/photo-1584820927498-cfe5211fd8bf?auto=format&fit=crop&w=700&q=80",
    inStock: true
  },
  {
    id: "prod-050",
    sku: "OLV-ASE-005",
    name: "Bolsas de Aseo Alta Densidad 80x110 Rollo 10 Unidades",
    brand: "Aseo Plus",
    categoryId: "limpieza",
    categoryName: "Limpieza y Aseo Institucional",
    subcategoryId: "bolsas-aseo",
    subcategoryName: "Bolsas de Aseo Alta Densidad",
    collections: ["limpieza-pro", "top-sellers", "horeca-esencial"],
    format: "Rollo de 10 bolsas (Caja máster de 20 rollos)",
    unit: "Rollo 10 Unidades / Caja",
    minOrder: 3,
    description: "Bolsas de basura extra gruesas con fondo sellado estrella anti-goteo. Resistentes a punzadas de huesos, latas y residuos húmedos de cocina.",
    specs: {
      "Medidas": "80 cm ancho x 110 cm largo",
      "Capacidad": "120 a 140 Litros (Contenedor estándar)",
      "Espesor": "Micronaje industrial reforzado negro"
    },
    image: "images/products/limpieza/OLV-ASE-005.jpg",
    inStock: true
  },
  {
    id: "prod-051",
    sku: "OLV-ASE-006",
    name: "Bolsas de Aseo Extra Grandes 110x130 Pack 10 Unidades",
    brand: "Aseo Plus",
    categoryId: "limpieza",
    categoryName: "Limpieza y Aseo Institucional",
    subcategoryId: "bolsas-aseo",
    subcategoryName: "Bolsas de Aseo Alta Densidad",
    collections: ["limpieza-pro"],
    format: "Pack de 10 bolsas gigantes",
    unit: "Pack 10 Unidades",
    minOrder: 2,
    description: "Diseñadas para tambores de 200 litros y contenedores rodantes municipales. Gran resistencia al desgarro.",
    specs: {
      "Medidas": "110 cm x 130 cm",
      "Capacidad": "200 Litros"
    },
    image: "images/products/limpieza/OLV-ASE-006.jpg",
    inStock: true
  },
  {
    id: "prod-052",
    sku: "OLV-ASE-007",
    name: "Guante Nitrilo Negro Sin Polvo Caja 100 Unidades",
    brand: "Safeguard Pro",
    categoryId: "limpieza",
    categoryName: "Limpieza y Aseo Institucional",
    subcategoryId: "guantes-seguridad",
    subcategoryName: "Guantes de Nitrilo, Látex y Vinilo",
    collections: ["limpieza-pro", "sushi-specials", "top-sellers"],
    format: "Caja dispensadora de 100 guantes (Tallas S, M, L)",
    unit: "Caja 100 Guantes",
    minOrder: 1,
    description: "Guantes de nitrilo color negro mate con textura microrugosa en las puntas de los dedos. Apto para manipulación de alimentos, desposte de salmón y armado de sushi frente al cliente con máxima estética y destreza.",
    specs: {
      "Material": "100% Nitrilo sintético sin látex ni polvo",
      "Tallas": "S, M, L disponibles",
      "Resistencia": "Superior a grasas, aceites y punciones",
      "Uso": "Sushi, cocina abierta, tatuajes y aseo fino"
    },
    image: "images/products/limpieza/OLV-ASE-007.jpg",
    inStock: true
  },
  {
    id: "prod-053",
    sku: "OLV-ASE-008",
    name: "Guante Látex Descartable Ambidextro Caja 100 Unidades",
    brand: "Safeguard Pro",
    categoryId: "limpieza",
    categoryName: "Limpieza y Aseo Institucional",
    subcategoryId: "guantes-seguridad",
    subcategoryName: "Guantes de Nitrilo, Látex y Vinilo",
    collections: ["limpieza-pro"],
    format: "Caja dispensadora de 100 unidades (Tallas S, M, L)",
    unit: "Caja 100 Guantes",
    minOrder: 1,
    description: "Guantes elásticos de látex natural de ajuste ergonómico perfecto para labores de limpieza, desinfección y manipulación ligera.",
    specs: {
      "Material": "Látex natural elástico",
      "Tallas": "S, M, L"
    },
    image: "images/products/limpieza/OLV-ASE-008.jpg",
    inStock: true
  },
  {
    id: "prod-054",
    sku: "OLV-ASE-009",
    name: "Papel Toalla Nova Económica Industrial Pack 2x250 Metros",
    brand: "Nova Pro",
    categoryId: "limpieza",
    categoryName: "Limpieza y Aseo Institucional",
    subcategoryId: "papeleria-servilletas",
    subcategoryName: "Papel Jumbo, Toalla Nova y Servilletas",
    collections: ["limpieza-pro", "top-sellers", "horeca-esencial"],
    format: "Pack de 2 bobinas continuas de 250 metros c/u (500m totales)",
    unit: "Pack 2 Bobinas (500 Metros)",
    minOrder: 1,
    description: "Bobinas de toalla de papel absorbente de celulosa pura con precorte suave. No se deshace en húmedo al secar superficies o manos.",
    specs: {
      "Metraje total": "500 Metros por pack",
      "Hoja": "Doble hoja gofrada extra absorbente",
      "Compatibilidad": "Dispensadores estándar autocorte de toalla"
    },
    image: "images/products/limpieza/OLV-ASE-009.jpg",
    inStock: true
  },
  {
    id: "prod-055",
    sku: "OLV-ASE-010",
    name: "Papel Higiénico Institucional Jumbo 1x6 Rollos x 300 Metros",
    brand: "OK Eco Pro",
    categoryId: "limpieza",
    categoryName: "Limpieza y Aseo Institucional",
    subcategoryId: "papeleria-servilletas",
    subcategoryName: "Papel Jumbo, Toalla Nova y Servilletas",
    collections: ["limpieza-pro"],
    format: "Fardo termoencogible de 6 rollos x 300 metros (1800m totales)",
    unit: "Fardo 6 Rollos (1800m)",
    minOrder: 1,
    description: "Papel higiénico institucional de alta capacidad para baños públicos de restaurantes, mall y empresas con alto flujo de visitas.",
    specs: {
      "Contenido": "6 rollos gigantes de 300 metros c/u",
      "Hoja": "Hoja simple resistente y suave"
    },
    image: "images/products/limpieza/OLV-ASE-010.jpg",
    inStock: true
  },
  {
    id: "prod-056",
    sku: "OLV-ASE-011",
    name: "Servilleta Blanca Doblada Joker 40x40 (Caja 1200 unidades)",
    brand: "Joker",
    categoryId: "limpieza",
    categoryName: "Limpieza y Aseo Institucional",
    subcategoryId: "papeleria-servilletas",
    subcategoryName: "Papel Jumbo, Toalla Nova y Servilletas",
    collections: ["limpieza-pro", "horeca-esencial"],
    format: "Caja máster de 1200 unidades dobladas en 1/4",
    unit: "Caja 1200 Unidades",
    minOrder: 1,
    description: "Servilleta gourmet blanca de gran tamaño y gramaje tupido. Otorga categoría y presencia impecable a mesas de restaurantes y salones.",
    specs: {
      "Medidas abiertas": "40 cm x 40 cm",
      "Plegado": "1/4 doblado formal",
      "Textura": "Tipo tela suave al tacto"
    },
    image: "images/products/limpieza/OLV-ASE-011.jpg",
    inStock: true
  },
  {
    id: "prod-057",
    sku: "OLV-ASE-012",
    name: "Servilleta Negra Doblada Gourmet Joker 40x40 (Caja 1200 unidades)",
    brand: "Joker",
    categoryId: "limpieza",
    categoryName: "Limpieza y Aseo Institucional",
    subcategoryId: "papeleria-servilletas",
    subcategoryName: "Papel Jumbo, Toalla Nova y Servilletas",
    collections: ["limpieza-pro", "sushi-specials", "gourmet-premium"],
    format: "Caja máster de 1200 unidades",
    unit: "Caja 1200 Unidades",
    minOrder: 1,
    description: "Servilleta negra mate de lujo. El estándar indiscutido para locales de sushi, bares de coctelería y eventos exclusivos. No destiñe.",
    specs: {
      "Medidas": "40 x 40 cm",
      "Color": "Negro profundo de alta fijación",
      "Gramaje": "Extra absorbente"
    },
    image: "images/products/limpieza/OLV-ASE-012.jpg",
    inStock: true
  },
  {
    id: "prod-058",
    sku: "OLV-ASE-013",
    name: "Paños Microfibra Absorbente Teddy 38x38 CM (Pack 10 unidades)",
    brand: "Teddy Pro",
    categoryId: "limpieza",
    categoryName: "Limpieza y Aseo Institucional",
    subcategoryId: "accesorios-aseo",
    subcategoryName: "Paños Microfibra y Esponjas Industriales",
    collections: ["limpieza-pro"],
    format: "Pack de 10 paños amarillos 38x38 cm",
    unit: "Pack 10 Unidades",
    minOrder: 2,
    description: "Microfibra de alta densidad que atrapa polvo y grasa sin rayar acrílicos, vidrios ni acero inoxidable. Lavable a máquina más de 200 veces.",
    specs: {
      "Medidas": "38 x 38 cm",
      "Color": "Amarillo institucional para codificación HACCP"
    },
    image: "images/products/limpieza/OLV-ASE-013.jpg",
    inStock: true
  },

  // ==========================================
  // INSUMOS Y PACKAGING GASTRONÓMICO
  // ==========================================
  {
    id: "prod-059",
    sku: "OLV-INS-001",
    name: "Rollo Alusa Film PVC Adherente 300 Metros Japofood (Caja 6 unidades)",
    brand: "Japofood",
    categoryId: "insumos",
    categoryName: "Insumos y Packaging Gastronómico",
    subcategoryId: "films-alusa",
    subcategoryName: "Alusa Film PVC y Embalaje",
    collections: ["sushi-specials", "top-sellers", "horeca-esencial"],
    format: "Caja de 6 cajas individuales con sierra cortadora x 300 metros",
    unit: "Caja 6 Rollos (1800m)",
    minOrder: 1,
    description: "Film plástico PVC de adherencia estática superior. Esencial en la mesada de sushi para forrar esterillas makisu y sellar bandejas de pescados conservando frescura absoluta sin condensación.",
    specs: {
      "Ancho": "30 cm ancho estándar",
      "Largo por rollo": "300 metros continuos con dispensador",
      "Total caja": "6 rollos (1800 metros totales)",
      "Adherencia": "Memory-grip anti-rasgadura"
    },
    image: "https://images.unsplash.com/photo-1584744982491-665216d95f8b?auto=format&fit=crop&w=700&q=80",
    inStock: true
  },
  {
    id: "prod-060",
    sku: "OLV-INS-002",
    name: "Rollo Alusa Film PVC Profesional 45 CM x 1400 Metros",
    brand: "PlastiPack",
    categoryId: "insumos",
    categoryName: "Insumos y Packaging Gastronómico",
    subcategoryId: "films-alusa",
    subcategoryName: "Alusa Film PVC y Embalaje",
    collections: ["horeca-esencial", "gran-volumen"],
    format: "Bobina industrial gigante de 1400 metros continuos",
    unit: "Bobina 1400 Metros",
    minOrder: 1,
    description: "Bobina industrial para máquinas envolvedoras manuales o empacadoras de bandejas de supermercado y plantas de alimentos.",
    specs: {
      "Ancho": "45 centímetros de cobertura amplia",
      "Metraje": "1400 metros de extensión",
      "Espesor": "Calibre profesional 9 micras"
    },
    image: "https://images.unsplash.com/photo-1584744982491-665216d95f8b?auto=format&fit=crop&w=700&q=80",
    inStock: true
  },
  {
    id: "prod-061",
    sku: "OLV-INS-003",
    name: "Rollo Térmico 80x80 para Impresoras POS y Boletas (Caja 50 unidades)",
    brand: "PaperTech B2B",
    categoryId: "insumos",
    categoryName: "Insumos y Packaging Gastronómico",
    subcategoryId: "rollos-termicos",
    subcategoryName: "Rollos Térmicos POS y Comandas",
    collections: ["horeca-esencial", "top-sellers"],
    format: "Caja máster de 50 rollos térmicos libres de BPA",
    unit: "Caja 50 Rollos",
    minOrder: 1,
    description: "Papel térmico de alta sensibilidad y contraste nítido para impresoras térmicas de cocina (Epson, Bixolon, Star) y terminales Transbank/POS. Señal roja de fin de rollo incorporada.",
    specs: {
      "Medida": "80 mm de ancho x 80 mm de diámetro",
      "Calidad": "Libre de bisfenol A (BPA Free)",
      "Empaque": "50 unidades en 10 packs de 5 rollos al vacío"
    },
    image: "https://images.unsplash.com/photo-1584820927498-cfe5211fd8bf?auto=format&fit=crop&w=700&q=80",
    inStock: true
  },
  {
    id: "prod-062",
    sku: "OLV-INS-004",
    name: "Envase Sushi Box Premium Negro Tapa Antivaho (Pack 50 unidades)",
    brand: "EcoPack Sushi",
    categoryId: "insumos",
    categoryName: "Insumos y Packaging Gastronómico",
    subcategoryId: "envases-delivery",
    subcategoryName: "Envases Sushi, Bowls y Vasos",
    collections: ["sushi-specials", "top-sellers"],
    format: "Pack de 50 bandejas base negra + 50 tapas cristalinas con clip",
    unit: "Pack 50 Sets",
    minOrder: 1,
    description: "Bandeja elegante de base negra brillante y tapa transparente ultra clara con tratamiento anti-fog que no se empaña con rolls calientes. El estándar para delivery de 20 a 30 cortes.",
    specs: {
      "Capacidad": "20 a 30 piezas de sushi",
      "Material": "Base PET reciclable + Tapa antivaho",
      "Cierre": "Hermético anti-derrames"
    },
    image: "https://images.unsplash.com/photo-1579871494447-9811cf80d66c?auto=format&fit=crop&w=700&q=80",
    inStock: true
  },
  {
    id: "prod-063",
    sku: "OLV-INS-005",
    name: "Bowl Kraft Ecológico 1000 CC Con Tapa PET (Pack 50 unidades)",
    brand: "EcoKraft",
    categoryId: "insumos",
    categoryName: "Insumos y Packaging Gastronómico",
    subcategoryId: "envases-delivery",
    subcategoryName: "Envases Sushi, Bowls y Vasos",
    collections: ["sushi-specials", "gourmet-premium"],
    format: "Pack de 50 bowls kraft marrón + 50 tapas transparentes",
    unit: "Pack 50 Sets",
    minOrder: 1,
    description: "Bowl redondo de cartón kraft con laminado interno anti-grasa. Especial para poke bowls, ensaladas gourmet, pastas y preparaciones calientes.",
    specs: {
      "Volumen": "1000 cc (1 Litro)",
      "Resistencia": "Soporta salsas líquidas calientes y frías",
      "Sostenibilidad": "Cartón biodegradable con certificación FSC"
    },
    image: "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=700&q=80",
    inStock: true
  }
];

// Colecciones comerciales transversales
const COLLECTIONS = [
  { id: "sushi-specials", name: "Especial Sushi Bar", tag: "Especial Sushi", icon: "fish" },
  { id: "limpieza-pro", name: "Línea Limpieza & Aseo", tag: "Aseo Institucional", icon: "sparkles" },
  { id: "top-sellers", name: "Más Cotizados Horeca", tag: "Top B2B", icon: "flame" },
  { id: "horeca-esencial", name: "Básicos de Cocina & Casino", tag: "Cocina Pro", icon: "utensils" },
  { id: "panaderia-pizzeria", name: "Pizzería, Pastas & Masas", tag: "Pizzería & Pastas", icon: "wheat" },
  { id: "cocteleria-sushi", name: "Bar & Pulpas de Fruta", tag: "Bar & Pulpas", icon: "glass-water" }
];

// Exportación si se usa en Node.js o navegador
if (typeof module !== "undefined" && module.exports) {
  module.exports = { INITIAL_CATEGORIES, INITIAL_PRODUCTS, COLLECTIONS };
}
