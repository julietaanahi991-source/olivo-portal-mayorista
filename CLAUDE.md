# CLAUDE.md — OLIVO Signature · Portal B2B de Distribuidora Olivo

Portal mayorista de **Distribuidora e Importadora Olivo SpA** (Viña del Mar, Región de Valparaíso, Chile) para restaurantes, locales de sushi, pizzerías y minimarkets del canal HORECA. El cliente arma una lista de productos y pide una **cotización formal**: el portal nunca muestra precios.

El proyecto lo construyó Antigravity (Gemini) y lo continúa Claude Code. Este archivo junta todo lo trabajado hasta el **2 de noviembre de 2026**: reglas de negocio, sistema de diseño, decisiones tomadas, tareas pendientes y la guía para cargar las fotos.

---

## 0. Empezar aquí

```bash
npm start                # servidor en http://localhost:3000 (Node 18+, sin dependencias)
npm run sync-images      # vincula fotos de public/images/products/<cat>/<SKU>.<ext> con data.js
```

**En el equipo de Julieta no hay Node instalado.** Para fotos usar el script de PowerShell (no necesita instalar nada):

```bash
powershell -ExecutionPolicy Bypass -File scripts/procesar-fotos.ps1                     # fotos sueltas en fotos-productos/<cat>/<SKU>*.jpg|png
powershell -ExecutionPolicy Bypass -File scripts/procesar-fotos.ps1 -Recortes <csv>     # recortes desde páginas de catálogo
```
Recorta el fondo, centra en 1000×1000 blanco, guarda `public/images/products/<cat>/<SKU>.jpg`, actualiza `image` en `data.js` y lista los SKU sin foto. Las fotos locales se muestran con `object-contain` (función `imgFit()` en `app.js`).

| Qué | Dónde |
|---|---|
| Código del portal (SPA vanilla) | `public/index.html`, `public/js/app.js`, `public/js/data.js`, `public/css/styles.css` |
| Servidor HTTP nativo | `server.js` |
| Catálogo de productos | `public/js/data.js` (fuente de verdad) y `data/products-manifest.json` |
| Fotos nuevas de portada y categorías | `public/images/hero-*.jpg`, `public/images/cat-*.jpg` |
| Fotos de producto (destino final) | `public/images/products/<categoria>/<SKU>.jpg` |
| Fotos que entrega el equipo de Olivo (sin procesar) | `fotos-productos/<categoria>/` |
| Copia local del lienzo mejorado (Claude Design, 13 pantallas) | `diseno/claude-design-v2/project/` · original en https://claude.ai/artifact/5VgZD9NMShqcs7F2VBwgh5 |
| Respaldos completos del proyecto | `OneDrive\Respaldos Olivo\olivo-2026-respaldo-AAAA-MM-DD-HHMM.zip` |
| Historial de versiones | Git local, rama `main` (desde el 4 nov 2026, sin repositorio remoto). `.gitignore` excluye `olivo-privado/config.php`, `entregables/*.zip` y `romeo-sports-linkbio/` (otro proyecto) |
| Diseño aprobado en Claude Design | `diseno/claude-design/` (ver sección 4) |
| Guía para el equipo sobre cómo entregar fotos | `docs/guia-fotos-productos.md` |
| Catálogos de Canva originales (con precios, solo referencia) | `referencias/catalogos-canva/` |

---

## 1. Reglas de oro (obligatorias)

1. **Cero precios en el portal.** Ningún producto muestra precios, descuentos en dinero ni totales. Todo opera bajo cotización formal. Los catálogos de Canva traen precios y % de descuento: **nunca** usarlos tal cual en el portal.
2. **Despacho exclusivo en la V Región:** Viña del Mar, Valparaíso, Concón, Quilpué, Villa Alemana, Limache y Quillota. Visible en la franja superior y en las condiciones comerciales.
3. **Sin registro ni login** para cotizar.
4. **Logotipo intacto:** isotipo y palabra OLIVO con el distintivo *Signature* (decisión confirmada: se mantiene la identidad que creó Antigravity).
5. **Menú superior simplificado:** solo **Inicio**, **Contacto**, buscador y botón **Solicitar cotización**. Las categorías se entran desde la portada.
6. **Titular del hero exacto:** `Todo lo que tu negocio necesita, en un solo lugar.` (sin comillas decorativas).
7. **Banners con fotos reales y luminosas:** sin velos verdes; solo un degradado negro suave a la izquierda para el texto.
8. **Insumos para restaurantes** usa siempre una foto profesional de packaging gastronómico, nunca residuos. **Actualizado:** la foto oficial ahora es `images/cat-insumos.jpg` (reemplaza a `restaurant-packaging.jpg`).
9. **Subcategorías en el lateral izquierdo** de toda página de categoría (nueva, ver sección 3).

---

## 2. Decisiones tomadas en la sesión con Claude (30 oct – 2 nov 2026)

| Tema | Decisión |
|---|---|
| Identidad visual | Se **mantiene el diseño de Antigravity** (verde oliva, dorado, Playfair Display + Manrope + DM Sans). Se exploró una propuesta con la marca real roja de Olivo (`diseno/propuesta-alternativa-marca-roja.html`) y **se descartó**. |
| Subcategorías | Pasan de pastillas horizontales bajo el título a un **menú lateral izquierdo** en todas las categorías. |
| Quesos crema | Se **quedan en Sushi** (subcategoría `insumos-crujientes`). Se elimina de Lácteos la subcategoría vacía `quesos-crema` ("Quesos crema gastronómicos"). |
| Nombre de la subcategoría de Sushi con quesos crema | **Pendiente.** Hoy se llama "Panko, tempura y rebozados" y contiene los quesos crema; se propuso "Quesos crema, panko y rebozados". |
| Fotos de portada y categorías | Reemplazan a Unsplash. Las entregó el equipo; ya están optimizadas en `public/images/`. |
| Banner de sushi | La foto se **volteó en espejo** para que los rolls queden a la derecha y no los tape el texto. |
| Nueva categoría | **Proteínas** (carnes, pollo, etc.). Pendiente de datos de Olivo (sección 5). |
| Publicación | El portal se publicará como **subdominio** del sitio principal de Olivo (3 nov). **Pendiente:** nombre del subdominio, plataforma del sitio principal, hosting y dónde viven las guías SEO (subdominio o dominio principal). |
| Subdominio | Propuesto: `mayorista.distribuidoraolivo.cl` (por confirmar con Olivo). El sitio principal es WordPress, lo administra una agencia y no aparece en Google; el portal (archivos estáticos) puede ir en el mismo hosting. Las guías SEO van en el subdominio. |
| Perfil de Empresa en Google | Existe: «Distribuidora Olivo», categoría «Distribuidor de comestibles», Bodega G12, Camino Internacional Ruta F, Lote 1.201, Viña del Mar. Teléfono en la ficha: `+56 9 7723 6128` (distinto del `+56 9 6304 1374` del portal). Sin reseñas. **Confirmado por el especialista de Google (3 nov):** la ficha es de Olivo (correo de gerencia), está verificada y vinculada a Google Ads; `+56 9 7723 6128` es el teléfono de la ficha y de las campañas. Conversiones medidas con **Google Tag Manager** (falta el ID GTM-…) y conversiones mejoradas para clientes potenciales activas. El titular del hero es el eslogan que Olivo ya usa en su camión. |
| Datos confirmados por Olivo (3 nov) | **CRM:** YAL CRM, de la empresa Tecnich (tecnich.cl, Las Condes). Maneja clientes, oportunidades → cotizaciones → pedidos, stock y bodega. No tiene API pública documentada: hay que pedirle a Tecnich, con autorización de Olivo, cómo crear oportunidades o cotizaciones desde la web, y si los códigos de producto del CRM coinciden con los SKU `OLV-…` del portal. **Despachos:** lunes a sábado, de 9:00 a 15:00 hrs. **Dirección física:** no publicarla todavía (quitada del footer y del schema). **RUT:** obligatorio en los formularios. |
| Backoffice | **Eliminado** (3 nov). Olivo usa su CRM interno; el portal se enfoca solo en la experiencia del cliente (ver 8.10). |
| Contraste | En textos chicos se oscurecen el dorado (`#C6A16C` → `#8A6A3A`) y el gris sutil (`#82928B` → `#66756E`) para cumplir contraste 4.5:1 sobre blanco. Fondos, bordes y botones dorados no cambian. |

---

## 3. Tareas pendientes para Claude Code (en orden)

> **Hecho el 3 nov — portal v2 en `public/`** (basado en el lienzo https://claude.ai/artifact/5VgZD9NMShqcs7F2VBwgh5): portada nueva (hero con fotos locales, 3 pasos «Cómo cotizar», atajo por tipo de negocio `BIZ`, grilla de 7 categorías con Proteínas «Próximamente», cobertura, guías «Próximamente», llamado con WhatsApp, footer nuevo), categoría con **menú lateral** (3.1, oculta subcategorías sin productos), cotización en 2 pasos con validación por campo y confirmación animada, botones dorados con texto `#0D261E`, aparición al hacer scroll, panel de la lista sin destello (`.drawer-root` en CSS propio). Fotos de categoría y `og:image` ya son locales (3.2). Quedan Unsplash solo en los 16 productos sin foto.

> **Microservicio de cotizaciones para cPanel (4 nov):** `public/api/cotizar.php` (valida, guarda en MySQL, código correlativo COT-AAAA-NNNN, correo a ventas y copia al cliente, reenvío opcional a CRM), `public/api/estado.php` (diagnóstico, borrar en producción), `public/api/_comun.php` y `.htaccess`. Configuración privada en `cpanel/olivo-privado/config.ejemplo.php` (va en `/home/USUARIO/olivo-privado/config.php`, fuera de public_html), tablas en `cpanel/sql/01-crear-tablas.sql`, guía en `cpanel/LEEME-INSTALACION.md`. El formulario hace `POST` a `api/cotizar.php`; en localhost (sin PHP) simula el código `COT-AAAA-LOCALxxx`. RUT validado con dígito verificador en ambos lados. Se guardan `gclid`/UTM de la visita. **El PHP no se pudo ejecutar en el equipo de Julieta (no hay PHP)**: se prueba en cPanel con `estado.php`. Zip armado con `scratchpad` → `entregables/olivo-portal-cpanel-AAAA-MM-DD.zip` (rutas con `/`, no usar `Compress-Archive`).

### 3.1 Menú lateral de subcategorías — `renderCatalogView()` en `public/js/app.js`
Reemplazar la fila de pastillas (`<!-- Subcategorías correspondientes -->`, ~línea 724) por un layout de dos columnas, como en `diseno/claude-design/Main.dc.html` (bloque `CATEGORÍA`):

- Contenedor: `display:flex; flex-wrap:wrap; gap:28px; align-items:flex-start` dentro de `max-w-7xl`.
- **Aside** (`flex: 1 1 240px`): tarjeta blanca, borde `#E5ECE8`, radio 16px, título `SUBCATEGORÍAS` (Manrope 12px, 800, tracking 0.14em, `#566760`).
  - Ítems = botones de ancho completo: nombre a la izquierda y cantidad de productos a la derecha (tabular-nums). Primero "Todas".
  - Activo: fondo `#FFFFFF`, texto `#163F32` en 700, `box-shadow: inset 3px 0 0 #C6A16C, 0 1px 3px rgba(18,42,33,.08)`, cantidad en `#8A6A3A`. Inactivo: transparente, `#1A2822` en 500, hover `#F3F8F5`. `aria-pressed` según estado.
  - Debajo: recuadro `#163F32` con "¿No encuentras un insumo?", "Pídelo a tu ejecutivo y lo sumamos a tu cotización." y `+56 9 6304 1374` en dorado.
- **Contenido** (`flex: 999 1 560px; min-width:0`): barra de búsqueda/orden y grilla de productos actuales sin cambios.
- En celular el aside queda arriba de los productos (lo resuelve el flex-wrap). Sin `position: sticky`.
- Se mantiene el breadcrumb `Inicio / Categoría / Subcategoría`, el título serif y la descripción.

### 3.2 Fotos nuevas en portada y tarjetas
- Hero 1: `images/hero-cocina.jpg`. Hero 2: `images/hero-sushi.jpg`. Ambos con `object-position: 65% center`.
- Tarjetas "Explora todo para tu negocio": `images/cat-{alimentos,sushi,congelados,lacteos,limpieza,insumos}.jpg` con `object-position: center 20%` (producto en la mitad superior; el texto va abajo).
- Actualizar también `image` de cada categoría en `INITIAL_CATEGORIES` (`data.js`) y el `og:image` de `index.html` (usar `images/hero-cocina.jpg`).
- Quitar todas las URLs de `images.unsplash.com` del proyecto.

### 3.3 Datos del catálogo (`data.js` + `data/products-manifest.json`)
- Eliminar la subcategoría `quesos-crema` de `lacteos`.
- Preparar la categoría `proteinas` cuando lleguen los datos (sección 5).

### 3.4 Contraste
Aplicar los dos cambios de color de la tabla de decisiones en textos de 10–12px (subcategoría dorada de la tarjeta, "Bajo cotización", etiquetas "Presentación:", breadcrumb, placeholders informativos).

### 3.5 Fotos de producto
Cuando el equipo deje archivos en `fotos-productos/`: recortar a 1:1, redimensionar a 1000–1200 px, fondo limpio, exportar JPG calidad ~84 o WebP (< 250 KB), guardar como `public/images/products/<categoria>/<SKU>.jpg` y correr `npm run sync-images`. Si llegan catálogos de Canva, recortar solo productos sin precio encima y listar los que haya que reemplazar. Detalle en `docs/guia-fotos-productos.md`.

**Avance (3 nov):** Olivo entregó catálogos «SIN PRECIO» (PNG por categoría). Limpieza procesada: 12 de 13 SKU con foto, desde `fotos-productos/catalogos-mixtos/limpieza-sin-precio/` + `recortes.csv`.
- `OLV-ASE-004` (Don Tito) no está en el catálogo; el catálogo trae «Limpia piso OK». Confirmar con Olivo cuál venden.
- `OLV-ASE-013`: el catálogo dice «Paños amarillo Teddy 38x38 UND»; el portal dice «Pack 10u». Confirmar formato.
- `OLV-ASE-005` y `006` comparten la foto de bolsas (4 formatos).
- El catálogo trae productos que el portal no tiene: guante nitrilo azul, guantes de vinilo (S/M y L), lavalozas y cloro Relux, limpia vidrio Mr Bob, papel higiénico OK Eco 4x500, paños esponja, esponja acanalada, servilletas Joker rosa/verde/crema/roja, servilleta mesa Okey y servilleta cocktail. Faltan sus datos para agregarlos.

**Avance 2 (3 nov):** PDF «Fotos portal» (10 páginas, fotos con ambiente) convertido a PNG con el lector de PDF de Windows y recortado en modo `escena` desde `fotos-productos/catalogos-mixtos/fotos-portal-pdf/recortes.csv` (coordenadas medidas en vistas de 1000 px, correr con `-Escala 3.1`). **47 de 63 SKU con foto.** La foto de la tarjeta ahora es cuadrada (`aspect-square`).
- Sin foto: `OLV-SSH-002, 006–013` (nori, panko, salsas, wasabi, gari, sésamo, makisu), `OLV-INS-001–005`, `OLV-CON-007` (vacuno, pasa a Proteínas) y `OLV-ASE-004`.
- Revisar marca: `OLV-ALM-005` (la foto es arroz Arborio **Scotti**; el portal dice marca «Roma») y `OLV-ALM-012` (la bolsa de salsa pizza no es San Remo).
- El PDF trae productos que el portal no tiene: aceite Los Silos 5 L, aceite Parral 5 L, aceite maravilla Parral caja 12 x 900 ml, fideo corbata Don Giuseppe, spaghetti Don Vittorio, arroz Miraflores, Valle de Oro G2, Flor de Ñiquén y Cristalino, pulpas Río Alto de piña, chirimoya, limón y melón tuna.

### 3.6 Limpieza técnica (sugerida)
- Fijar versiones de CDN: `https://unpkg.com/lucide@latest` → versión exacta; considerar compilar Tailwind en vez del CDN `cdn.tailwindcss.com` para producción.
- Corregir `README.md` (dice "Santiago, Chile"; la empresa está en Viña del Mar).

---

## 4. Diseño aprobado (Claude Design)

- Lienzo navegable: https://claude.ai/artifact/5iqsP3wdetSg52RTJTE67E (privado, cuenta de Julieta).
- Fuentes en `diseno/claude-design/`: `Main.dc.html` (escritorio, interactivo: portada, carrusel, categorías, menú lateral, contacto, footer, barra de modo) y `Movil.dc.html` (importa Main a 390 px).
- Las imágenes ahí apuntan a URLs internas `/_blob/…`. Equivalencias con los archivos locales:

| URL en el diseño | Archivo local |
|---|---|
| `/_blob/42866422c11e7f6b275369b105cac020` | `public/images/hero-cocina.jpg` |
| `/_blob/179d16bed088d9c2224738ae3f6ba956` | `public/images/hero-sushi.jpg` |
| `/_blob/c04ad79d4ffb821e928050d4491f413d` | `public/images/cat-alimentos.jpg` |
| `/_blob/5c5824525a8d064833c304a5bff9ad18` | `public/images/cat-sushi.jpg` |
| `/_blob/80a0717f604083378b0b850d1a362bf1` | `public/images/cat-congelados.jpg` |
| `/_blob/31a105adbf974d1948d7b9366677b10a` | `public/images/cat-lacteos.jpg` |
| `/_blob/207b6d111a0d3d728cf55f6fa69dae1b` | `public/images/cat-limpieza.jpg` |
| `/_blob/7ceb00776afa5b989ea1fcab654486a3` | `public/images/cat-insumos.jpg` |

El diseño es la referencia visual; el código de producción sigue siendo `public/` (Tailwind + JS vanilla). No copiar el formato `.dc.html` al portal.

---

## 5. Nueva categoría: Proteínas (pendiente de datos)

- **id:** `proteinas` · **nombre:** "Proteínas" · **SKU nuevos:** `OLV-PRO-001`, `OLV-PRO-002`…
- **Subcategorías propuestas (por confirmar):** Vacuno (cortes al vacío y por kilo), Cerdo, Pollo y aves, Elaborados (hamburguesas, apanados).
- **Mover** `OLV-CON-007` "Corte de Vacuno Asado Carnicero / Vacío Importado" de Congelados → Proteínas/Vacuno y eliminar la subcategoría `carnes-cortes` de Congelados. Conservar el SKU actual salvo que Olivo pida renumerar.
- **Tarjeta de portada:** foto `public/images/cat-proteinas.jpg` (1200×1200, producto arriba). Etiqueta sugerida: "Cortes seleccionados".
- **Grilla de 7 tarjetas:** con 3 columnas queda una sola en la última fila. Resolverlo (por ejemplo Proteínas como tarjeta destacada a doble ancho al inicio, o 4 + 3).
- **Preguntas abiertas a Olivo:** ¿fresco, refrigerado o congelado? ¿venta por kilo, pieza o caja? ¿etiqueta de la tarjeta?
- La plantilla que debe completar el equipo está en `docs/guia-fotos-productos.md`.

---

## 6. Sistema de diseño (heredado de Antigravity)

### Paleta Cromática Signature

| Nombre Semántico | HEX | Variable CSS | Clase Tailwind / Uso |
|---|---|---|---|
| **Verde Oliva Profundo** | `#163F32` | `--color-olive-deep` | `text-[#163F32]`, `bg-[#163F32]` (Color primario de marca, botones principales, titulares) |
| **Verde Oliva Oscuro / Nocturno** | `#0D261E` | `--color-olive-dark` | `bg-[#0D261E]` (Franja superior de anuncios, footer corporativo, fondos oscuros) |
| **Verde Oliva Claro** | `#215645` | `--color-olive-light` | Hover de botones oliva |
| **Superficie Oliva Suave** | `#EBF2EE` | `--color-olive-surface` | Fondos de pastillas activas, hover de botones secundarios |
| **Dorado Suave / Champán** | `#C6A16C` | `--color-gold` | `text-[#C6A16C]`, `bg-[#C6A16C]` (Acento luxury, bordes destacados, iconos clave) |
| **Dorado Hover** | `#B38E57` | `--color-gold-hover` | Estado hover de botones dorados |
| **Dorado Muy Claro** | `#F7F1E6` | `--color-gold-light` | Fondo de tags dorados, insignias "Signature" y "Bajo Cotización" |
| **Marfil Institucional** | `#F6F2E9` | `--color-ivory` | Fondo de sección "Explora todo para tu negocio" |
| **Marfil Claro / Fondo General** | `#FAF8F3` | `--color-ivory-light` | Fondo general de la página (`body`), inputs de formulario |
| **Blanco Puro** | `#FFFFFF` | `#FFFFFF` | Tarjetas de productos, modales, menú de navegación |
| **Texto Principal** | `#1A2822` | `--color-text-main` | Color base de lectura y nombres de producto |
| **Texto Secundario (Muted)** | `#566760` | `--color-text-muted` | Descripciones, formatos comerciales |
| **Texto Sutil (Subtle / Labels)** | `#82928B` | `--color-text-subtle` | Etiquetas técnicas, placeholders, migas de pan |
| **Borde Neutro** | `#E5ECE8` | `--color-border` | Borde de tarjetas, divisores y campos de formulario |

### Variables de Sombras y Elevaciones

```css
--shadow-sm: 0 1px 3px rgba(18, 42, 33, 0.05);
--shadow-md: 0 4px 20px -2px rgba(18, 42, 33, 0.08);
--shadow-lg: 0 12px 36px -4px rgba(18, 42, 33, 0.12);
--shadow-xl: 0 24px 56px -8px rgba(18, 42, 33, 0.16);
```

### Radios de Borde

```css
--radius-sm: 6px;
--radius-md: 10px;
--radius-lg: 16px;
--radius-xl: 24px;
```

---

## 7. Tipografía

Fuentes cargadas desde Google Fonts en `public/css/styles.css`:

1. **Playfair Display (Serif):** Reservada para titulares editoriales principales de gran impacto y refinamiento.
   - Usos: Título del Hero Banner (`text-4xl sm:text-5xl lg:text-6xl font-serif font-bold text-white`), títulos de sección (`h1`, `h2` en `text-3xl sm:text-4xl font-serif font-bold text-[#163F32]`), y logotipo `OLIVO`.
2. **Manrope (Sans-serif, Heading):** Tipografía geométrica y moderna para títulos secundarios, nombres de tarjetas de producto, botones y badges.
   - Usos: Nombres de producto (`font-bold text-[#163F32] text-sm`), títulos de categorías, botones `.btn-gold` y `.btn-olive`.
3. **DM Sans (Sans-serif, Body):** Tipografía de interfaz extremadamente legible y limpia.
   - Usos: Cuerpo de texto (`font-body text-[#1A2822]`), especificaciones técnicas, tablas de cotización, migas de pan y formularios.

---

## 8. Componentes del portal (estado actual del código)

### 1. Franja Superior de Despachos (`announcement-bar`)
- Fondo: `#0D261E` con pulso dorado animado.
- Mensaje: **Distribuidora Olivo: Despachos exclusivos en la Región de Valparaíso (V Región) — Viña del Mar, Valparaíso, Concón, Quilpué, Villa Alemana, Limache y Quillota.**
- Canales de contacto: Ventas B2B `+56 9 6304 1374` y atención 1 a 1.

### 2. Encabezado Simplificado (`header-glass`)
- Sticky con efecto *glassmorphism* (`backdrop-blur-md`, fondo blanco translúcido `rgba(255,255,255,0.96)`).
- Izquierda: Logotipo oficial de Distribuidora Olivo con isotipo verde/dorado y badge `Signature`.
- Centro: Enlaces limpios **Inicio** y **Contacto** (sin categorías en el menú superior).
- Derecha: Buscador contextual en vivo con icono Lucide, botón **Solicitar cotización** con contador reactivo y botón disparador del drawer de cotización.

### 3. Hero Carousel (2 Banners con transición suave automática)
- Altura: 540px (móvil) / 620px (escritorio).
- **Banner 1 (Restaurante preparando insumos):**
  - Fondo fotográfico natural sin velo verde.
  - Overlay: Degradado negro sutil hacia la izquierda (`linear-gradient(90deg, rgba(0,0,0,0.68) ... transparent)`).
  - Titular: **Todo lo que tu negocio necesita, en un solo lugar.**
  - Subtexto: *Abastecimiento integral para restaurantes, cocinas, locales de sushi y minimarkets. Insumos certificados con entrega directa en tu local.*
  - Botones: "Explorar catálogo" (scroll a categorías) y "Solicitar cotización".
- **Banner 2 (Protagonizado por Sushi):**
  - Fondo fotográfico de sushi fresco con iluminación natural.
  - Titular: **Insumos de Alta Gama para Sushi & Asian Food.**
  - Botones: "Ver insumos de sushi" y "Solicitar cotización".

### 4. Sección «Explora todo para tu negocio» (Portada)
- Contenedor con 6 tarjetas fotográficas de 320px de altura con efecto zoom al hover y degradado inferior:
  1. **Alimentos y abarrotes:** Línea Despensa (Aceites, harinas, arroces, pastas).
  2. **Sushi y gastronomía oriental:** Alta Demanda (Arroz grano corto, algas nori, panko, quesos crema).
  3. **Congelados:** Cadena de Frío -18°C (Camarones, papas bastón, carnes, pulpas Río Alto).
  4. **Lácteos y refrigerados:** Formato Gastronómico (Mozzarella, cremas UHT, quesos maduros).
  5. **Limpieza y aseo:** Higiene SEREMI (Lavalozas, cloro, desengrasantes, bolsas, papel toalla).
  6. **Insumos para restaurantes:** Packaging & Cocina (Fotografía en `images/restaurant-packaging.jpg`, films PVC, rollos térmicos, envases sushi box, bowls kraft).

### 5. Páginas Interiores de Categoría (Navegación Limpia)
- **Ruta de migas de pan (Breadcrumb):** `Inicio / [Categoría] / [Subcategoría opcional]`.
- **Encabezado editorial:** Nombre de la categoría y descripción de la línea de abastecimiento.
- **Barra de Subcategorías Exclusivas** (a reemplazar por el menú lateral, ver 3.1): Muestra únicamente la pastilla *Todas* y las subcategorías correspondientes a esa sección (ejemplo en Lácteos: *Todas*, *Quesos crema gastronómicos*, *Mozzarella, parmesano y maduros*, *Cremas de leche UHT y leches*, *Mantequillas profesionales*). **No se repiten las 6 categorías principales.**
- **Buscador en vivo contextual:** Filtra instantáneamente por nombre, marca o SKU.
- **Selector de ordenación:** Destacados, Nombre (A-Z) o Marca.

### 6. Ficha de Producto Individual (`card-premium`)
- Fotografía con zoom suave al hover y badge de marca superior izquierdo.
- SKU visible en tipografía monoespaciada en la esquina superior derecha.
- Subcategoría en color dorado.
- Nombre comercial del insumo.
- Cuadro de especificación: **Presentación** y **Unidad comercial**.
- Indicador visual: **Bajo Cotización** (en pastilla dorada suave).
- Selector de cantidad interactivo con botones `-` y `+`.
- Botón: **Agregar a cotización**.
- Enlace para abrir modal con ficha técnica detallada.

### 7. Modal de Ficha Técnica Detallada (`productDetailModal`)
- Fotografía ampliada en alta resolución.
- Marca, SKU, categoría y descripción comercial detallada.
- Tabla de especificaciones técnicas (Medidas, rendimiento, vida útil, empaque máster).
- Selector de unidades y botón de agregado inmediato.

### 8. Carrito Lateral (Drawer) y Checkout B2B
- Drawer deslizable con listado de insumos seleccionados, cantidades modificables y eliminación en un clic.
- Vista de checkout:
  - Resumen de productos y cantidades cotizadas.
  - Formulario comercial B2B: Nombre de contacto, Razón Social / Nombre del local, RUT de empresa, Correo electrónico, Teléfono móvil, Comuna de entrega (Región de Valparaíso), Tipo de establecimiento y Comentarios de despacho.
  - Botón: **Enviar solicitud de cotización formal**.

### 9. Pantalla de Confirmación
- Notificación formal:
  > **¡Tu solicitud fue recibida! Un ejecutivo de Distribuidora Olivo revisará los productos seleccionados y enviará una cotización personalizada a tu correo electrónico.**
- Asignación de código correlativo único (ejemplo: `COT-2026-8491`).
- Botón interactivo para previsualizar el correo formal enviado al cliente con los insumos solicitados.

### 10. Backoffice: eliminado (3 nov 2026)
- Olivo gestiona clientes, precios y cotizaciones en su **CRM interno**. El portal es solo la experiencia del cliente.
- Se quitaron la barra «Modo» (Visitante / Ejecutivo), el panel del ejecutivo, el modal para asignar precios, el PDF con montos, las 3 cotizaciones de ejemplo (`INITIAL_QUOTES`) y el costo interno `internalCostNeto` de los 63 productos (se veía en el código del navegador).
- `submitQuotation()` deja la solicitud en `state.lastSubmittedQuote` y tiene un `TODO` para enviarla al CRM cuando Olivo defina el endpoint.
- No volver a agregar precios, costos ni pantallas internas al portal.


---

## 9. Inventario de productos (63 SKU)

A continuación se detalla el inventario completo dividido por las 6 categorías del portal, con sus respectivas subcategorías, formatos y la ruta de imagen destino:

### 1. Alimentos y Abarrotes (`alimentos`) — Carpeta: `public/images/products/alimentos/`

| SKU | Producto | Marca | Formato / Unidad | Subcategoría | Archivo Sugerido |
|---|---|---|---|---|---|
| `OLV-ALM-001` | Aceite para Freír Don Maravilla 5 LT | Don Maravilla | Bidón 5 Litros (Caja 4u) | `aceites` | `images/products/alimentos/OLV-ALM-001.jpg` |
| `OLV-ALM-002` | Aceite para Freír MaxiFrits Maravilla 10 LT | MaxiFrits | Bidón industrial 10 Litros | `aceites` | `images/products/alimentos/OLV-ALM-002.jpg` |
| `OLV-ALM-003` | Aceite Vegetal Coliseo 900 ML (Caja 15u) | Coliseo | Caja 15 botellas x 900 ml | `aceites` | `images/products/alimentos/OLV-ALM-003.jpg` |
| `OLV-ALM-004` | Aceite Oliva Extra Virgen Sabattini 5 LT | Sabattini | Bidón 5 Litros (Caja 4u) | `aceites` | `images/products/alimentos/OLV-ALM-004.jpg` |
| `OLV-ALM-005` | Arroz Grano Corto Arborio Roma 1 KG | Roma | Paquete 1 Kg al vacío | `arroces` | `images/products/alimentos/OLV-ALM-005.jpg` |
| `OLV-ALM-006` | Arroz Grano Largo Coliseo G2 1 KG (Display 10 KG) | Coliseo | Fardo display de 10 paquetes | `arroces` | `images/products/alimentos/OLV-ALM-006.jpg` |
| `OLV-ALM-007` | Harina de Trigo Mont Blanc Con Polvos 1 KG (Fardo 10 KG) | Mont Blanc | Fardo 10 paquetes x 1 Kg | `pastas-harinas` | `images/products/alimentos/OLV-ALM-007.jpg` |
| `OLV-ALM-008` | Harina de Trigo Mont Blanc Sin Polvos 1 KG (Fardo 10 KG) | Mont Blanc | Fardo 10 paquetes x 1 Kg | `pastas-harinas` | `images/products/alimentos/OLV-ALM-008.jpg` |
| `OLV-ALM-009` | Spaghetti Tradicional Don Giuseppe 400 GR (Caja 20u) | Don Giuseppe | Caja 20 paquetes x 400g | `pastas-harinas` | `images/products/alimentos/OLV-ALM-009.jpg` |
| `OLV-ALM-010` | Fideos Espiral Don Giuseppe 400 GR (Caja 20u) | Don Giuseppe | Caja 20 paquetes x 400g | `pastas-harinas` | `images/products/alimentos/OLV-ALM-010.jpg` |
| `OLV-ALM-011` | Salsa de Tomate Italiana San Remo 1 KG (Caja 10u) | San Remo | Caja 10 bolsas pouch x 1 Kg | `salsas-conservas` | `images/products/alimentos/OLV-ALM-011.jpg` |
| `OLV-ALM-012` | Salsa Pizza Lista para Usar RTU 1 KG (Caja 10u) | San Remo Pro | Caja 10 bolsas pouch x 1 Kg | `salsas-conservas` | `images/products/alimentos/OLV-ALM-012.jpg` |
| `OLV-ALM-013` | Azúcar Blanca Refinada Coliseo 1 KG (Fardo 10 KG) | Coliseo | Fardo 10 paquetes x 1 Kg | `azucar-sal` | `images/products/alimentos/OLV-ALM-013.jpg` |
| `OLV-ALM-014` | Sal Fina Yodada Smart Price 1 KG (Fardo 20 KG) | Smart Price | Fardo 20 paquetes x 1 Kg | `azucar-sal` | `images/products/alimentos/OLV-ALM-014.jpg` |

### 2. Sushi y Gastronomía Oriental (`sushi`) — Carpeta: `public/images/products/sushi/`

| SKU | Producto | Marca | Formato / Unidad | Subcategoría | Archivo Sugerido |
|---|---|---|---|---|---|
| `OLV-SSH-001` | Arroz Grano Corto Shirakiku 9 KG (Especial Sushi) | Shirakiku | Saco industrial 9 Kg | `arroz-sushi` | `images/products/sushi/OLV-SSH-001.jpg` |
| `OLV-SSH-002` | Alga Nori Tostada Platinum Gold (Pack 50 Hojas) | Japofood Pro | Pack 50 hojas enteras 21x19 cm | `algas-nori` | `images/products/sushi/OLV-SSH-002.jpg` |
| `OLV-SSH-003` | Queso Crema Milkaut Gastronómico Balde 3.6 KG | Milkaut | Balde sellado 3.6 Kg | `insumos-crujientes` | `images/products/sushi/OLV-SSH-003.jpg` |
| `OLV-SSH-004` | Queso Crema Reny Picot Barra 1.36 KG (Caja 10 barras) | Reny Picot | Barra 1.36 Kg (Caja 13.6 Kg) | `insumos-crujientes` | `images/products/sushi/OLV-SSH-004.jpg` |
| `OLV-SSH-005` | Queso Crema Zanafoods Barra 1.36 KG | Zanafoods | Barra sellada 1.36 Kg | `insumos-crujientes` | `images/products/sushi/OLV-SSH-005.jpg` |
| `OLV-SSH-006` | Panko Japonés Extra Crujiente 1 KG (Caja 10 KG) | Tokyo Panko Pro | Bolsa 1 Kg (Caja 10u) | `insumos-crujientes` | `images/products/sushi/OLV-SSH-006.jpg` |
| `OLV-SSH-007` | Salsa de Soya Tradicional Japofood Bidón 5 LT | Japofood | Bidón 5 Litros | `salsas-orientales` | `images/products/sushi/OLV-SSH-007.jpg` |
| `OLV-SSH-008` | Salsa Teriyaki Glaze Espesa Japofood 1.8 LT | Japofood | Botella 1.8 Litros (Caja 6u) | `salsas-orientales` | `images/products/sushi/OLV-SSH-008.jpg` |
| `OLV-SSH-009` | Salsa Anguila Unagi Tare Premium 1.8 LT | Japofood | Botella 1.8 Litros | `salsas-orientales` | `images/products/sushi/OLV-SSH-009.jpg` |
| `OLV-SSH-010` | Wasabi en Polvo Grado A Lata 1 KG | Wasabi Fuji | Lata metálica hermética 1 Kg | `condimentos-orientales` | `images/products/sushi/OLV-SSH-010.jpg` |
| `OLV-SSH-011` | Jengibre Encurtido Gari Blanco Balde 1.5 KG | Gari Master | Balde plástico con salmuera 1.5 Kg | `condimentos-orientales` | `images/products/sushi/OLV-SSH-011.jpg` |
| `OLV-SSH-012` | Sésamo Tostado Bicolor Blanco y Negro 1 KG | Japofood | Bolsa sellada 1 Kg | `condimentos-orientales` | `images/products/sushi/OLV-SSH-012.jpg` |
| `OLV-SSH-013` | Esterilla Makisu de Bambú Reforzada (Pack 5u) | Chef Tools Pro | Pack 5 esterillas de bambú | `herramientas-sushi` | `images/products/sushi/OLV-SSH-013.jpg` |

### 3. Congelados (`congelados`) — Carpeta: `public/images/products/congelados/`

| SKU | Producto | Marca | Formato / Unidad | Subcategoría | Archivo Sugerido |
|---|---|---|---|---|---|
| `OLV-CON-001` | Camarón Ecuatoriano P&D 36/40 (Pelado y Desvenado) 1 KG | Pacífico Sur | Bolsa IQF 1 Kg (Caja 10 Kg) | `mariscos-camarones` | `images/products/congelados/OLV-CON-001.jpg` |
| `OLV-CON-002` | Camarón Ecuatoriano Con Cáscara 36/40 1 KG (Caja 10 KG) | Pacífico Sur | Bolsa 1 Kg (Caja 10 Kg) | `mariscos-camarones` | `images/products/congelados/OLV-CON-002.jpg` |
| `OLV-CON-003` | Camarón Chino Calibre 36/40 Bolsa 1 KG | Importado Oriental | Bolsa 1 Kg congelado rápido | `mariscos-camarones` | `images/products/congelados/OLV-CON-003.jpg` |
| `OLV-CON-004` | Papas Prefritas Corte Bastón 10 MM Cresswell (Caja 12 KG) | Cresswell | Caja 6 bolsas x 2 Kg (12 Kg) | `papas-prefritas` | `images/products/congelados/OLV-CON-004.jpg` |
| `OLV-CON-005` | Papas Prefritas Corte Fino 7 MM Cresswell (Caja 12 KG) | Cresswell | Caja 6 bolsas x 2 Kg (12 Kg) | `papas-prefritas` | `images/products/congelados/OLV-CON-005.jpg` |
| `OLV-CON-006` | Papas Prefritas Corte Grueso 12 MM Cresswell (Caja 12 KG) | Cresswell | Caja 6 bolsas x 2 Kg (12 Kg) | `papas-prefritas` | `images/products/congelados/OLV-CON-006.jpg` |
| `OLV-CON-007` | Corte de Vacuno Asado Carnicero / Vacío Importado **(pasa a Proteínas)** | Frigorífico Pampa | Piezas al vacío de 2.5 a 4 Kg | `carnes-cortes` | `images/products/congelados/OLV-CON-007.jpg` |
| `OLV-CON-008` | Pulpa de Maracuyá Natural Con Pepa Río Alto 1 KG | Río Alto | Bolsa 1 Kg (Caja 10u) | `pulpas-fruta` | `images/products/congelados/OLV-CON-008.jpg` |
| `OLV-CON-009` | Pulpa de Maracuyá Natural Sin Pepa Río Alto 1 KG | Río Alto | Bolsa 1 Kg (Caja 10u) | `pulpas-fruta` | `images/products/congelados/OLV-CON-009.jpg` |
| `OLV-CON-010` | Pulpa de Mango Natural Río Alto 1 KG | Río Alto | Bolsa 1 Kg congelada | `pulpas-fruta` | `images/products/congelados/OLV-CON-010.jpg` |
| `OLV-CON-011` | Pulpa de Frambuesa Natural Río Alto 1 KG | Río Alto | Bolsa 1 Kg congelada | `pulpas-fruta` | `images/products/congelados/OLV-CON-011.jpg` |
| `OLV-CON-012` | Pulpa de Frutilla Natural Río Alto 1 KG | Río Alto | Bolsa 1 Kg congelada | `pulpas-fruta` | `images/products/congelados/OLV-CON-012.jpg` |

### 4. Lácteos y Refrigerados (`lacteos`) — Carpeta: `public/images/products/lacteos/`

| SKU | Producto | Marca | Formato / Unidad | Subcategoría | Archivo Sugerido |
|---|---|---|---|---|---|
| `OLV-LAC-001` | Crema de Leche Gastronómica Colún 1 L (Caja 12u) | Colún | Caja 12 Tetra Pak x 1 Litro | `cremas-leche` | `images/products/lacteos/OLV-LAC-001.jpg` |
| `OLV-LAC-002` | Crema de Leche UHT Surlat 1 L (Caja 12u) | Surlat | Caja máster de 12 Litros | `cremas-leche` | `images/products/lacteos/OLV-LAC-002.jpg` |
| `OLV-LAC-003` | Leche Entera UHT Tottus 1 L (Caja 12u) | Tottus | Caja 12 envases x 1 Litro | `cremas-leche` | `images/products/lacteos/OLV-LAC-003.jpg` |
| `OLV-LAC-004` | Mantequilla Con Sal Colún Barra 250 GR (Caja 40u) | Colún | Caja 40 barras x 250g (10 Kg) | `mantequillas` | `images/products/lacteos/OLV-LAC-004.jpg` |
| `OLV-LAC-005` | Queso Mozzarella Barra Gastronómica Molfino 3.5 KG | Molfino | Pieza al vacío 3.5 Kg (Caja 14 Kg) | `quesos-maduros` | `images/products/lacteos/OLV-LAC-005.jpg` |
| `OLV-LAC-006` | Queso Parmesano Maduro Horma Entera 7-8 KG | Valle Verde | Horma cilíndrica de 7.5 Kg aprox | `quesos-maduros` | `images/products/lacteos/OLV-LAC-006.jpg` |

### 5. Limpieza y Aseo (`limpieza`) — Carpeta: `public/images/products/limpieza/`

| SKU | Producto | Marca | Formato / Unidad | Subcategoría | Archivo Sugerido |
|---|---|---|---|---|---|
| `OLV-ASE-001` | Lavaloza Concentrado Industrial Ecol L-2000 Bidón 5 LT | Ecol Químicos | Bidón industrial 5 Litros | `quimicos-limpieza` | `images/products/limpieza/OLV-ASE-001.jpg` |
| `OLV-ASE-002` | Desengrasante Pesado Industrial Ecol D-2000 Bidón 5 LT | Ecol Químicos | Bidón industrial 5 Litros | `quimicos-limpieza` | `images/products/limpieza/OLV-ASE-002.jpg` |
| `OLV-ASE-003` | Cloro Líquido Industrial 5% Bidón OK 5 LT | OK Químicos | Bidón opaco 5 Litros | `quimicos-limpieza` | `images/products/limpieza/OLV-ASE-003.jpg` |
| `OLV-ASE-004` | Limpiador Desinfectante de Pisos Don Tito Lavanda 5 LT | Don Tito | Bidón 5 Litros | `quimicos-limpieza` | `images/products/limpieza/OLV-ASE-004.jpg` |
| `OLV-ASE-005` | Bolsas de Aseo Alta Densidad 80x110 Rollo 10u | Aseo Plus | Rollo 10 bolsas (Caja 20 rollos) | `bolsas-aseo` | `images/products/limpieza/OLV-ASE-005.jpg` |
| `OLV-ASE-006` | Bolsas de Aseo Extra Grandes 110x130 Pack 10u | Aseo Plus | Pack 10 bolsas gigantes | `bolsas-aseo` | `images/products/limpieza/OLV-ASE-006.jpg` |
| `OLV-ASE-007` | Guante Nitrilo Negro Sin Polvo Caja 100u | Safeguard Pro | Caja 100 guantes (S, M, L) | `guantes-seguridad` | `images/products/limpieza/OLV-ASE-007.jpg` |
| `OLV-ASE-008` | Guante Látex Descartable Ambidextro Caja 100u | Safeguard Pro | Caja 100 unidades (S, M, L) | `guantes-seguridad` | `images/products/limpieza/OLV-ASE-008.jpg` |
| `OLV-ASE-009` | Papel Toalla Nova Industrial Pack 2x250 Metros | Nova Pro | Pack 2 bobinas x 250m (500m) | `papeleria-servilletas` | `images/products/limpieza/OLV-ASE-009.jpg` |
| `OLV-ASE-010` | Papel Higiénico Jumbo 1x6 Rollos x 300 Metros | OK Eco Pro | Fardo 6 rollos x 300m (1800m) | `papeleria-servilletas` | `images/products/limpieza/OLV-ASE-010.jpg` |
| `OLV-ASE-011` | Servilleta Blanca Doblada Joker 40x40 (Caja 1200u) | Joker | Caja 1200 unidades 1/4 | `papeleria-servilletas` | `images/products/limpieza/OLV-ASE-011.jpg` |
| `OLV-ASE-012` | Servilleta Negra Doblada Gourmet Joker 40x40 (Caja 1200u) | Joker | Caja 1200 unidades | `papeleria-servilletas` | `images/products/limpieza/OLV-ASE-012.jpg` |
| `OLV-ASE-013` | Paños Microfibra Absorbente Teddy 38x38 CM (Pack 10u) | Teddy Pro | Pack 10 paños amarillos | `accesorios-aseo` | `images/products/limpieza/OLV-ASE-013.jpg` |

### 6. Insumos para Restaurantes (`insumos`) — Carpeta: `public/images/products/insumos/`

| SKU | Producto | Marca | Formato / Unidad | Subcategoría | Archivo Sugerido |
|---|---|---|---|---|---|
| `OLV-INS-001` | Rollo Alusa Film PVC Adherente 300m Japofood (Caja 6u) | Japofood | Caja 6 rollos x 300 metros | `films-alusa` | `images/products/insumos/OLV-INS-001.jpg` |
| `OLV-INS-002` | Rollo Alusa Film PVC Profesional 45cm x 1400 Metros | PlastiPack | Bobina industrial 1400 metros | `films-alusa` | `images/products/insumos/OLV-INS-002.jpg` |
| `OLV-INS-003` | Rollo Térmico 80x80 para Impresoras POS y Boletas (Caja 50u) | PaperTech B2B | Caja 50 rollos BPA Free | `rollos-termicos` | `images/products/insumos/OLV-INS-003.jpg` |
| `OLV-INS-004` | Envase Sushi Box Premium Negro Tapa Antivaho (Pack 50u) | EcoPack Sushi | Pack 50 bandejas + 50 tapas antivaho | `envases-delivery` | `images/products/insumos/OLV-INS-004.jpg` |
| `OLV-INS-005` | Bowl Kraft Ecológico 1000 CC Con Tapa PET (Pack 50u) | EcoKraft | Pack 50 bowls kraft + 50 tapas | `envases-delivery` | `images/products/insumos/OLV-INS-005.jpg` |


---

## 10. Enlaces

- Diseño en Claude Design: https://claude.ai/artifact/5iqsP3wdetSg52RTJTE67E
- Guía de fotos (doc compartible): https://claude.ai/artifact/45oFDAbFm6zToPdtDxhfsF · copia local en `docs/guia-fotos-productos.md`
- Proyecto original de Antigravity: `C:\Users\Julieta Vasquez\.gemini\antigravity\scratch\olivo-signature`

*Distribuidora e Importadora Olivo SpA — documento de traspaso para Claude Code, actualizado el 2 de noviembre de 2026.*
