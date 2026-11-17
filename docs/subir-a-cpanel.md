# Subir el portal a cPanel — entrega del 17 nov 2026

**Sitio:** https://mayorista.distribuidoraolivo.cl
**Versión a subir:** la última de la rama `main` (GitHub: julietaanahi991-source/olivo-portal-mayorista).
**Versión que hoy está en producción:** la del 9 nov (logo con «Signature», titular «…en un solo lugar», 7 líneas).

## Dónde van los archivos

Todo lo que está dentro de la carpeta **`public/`** del repositorio va en la carpeta del subdominio en cPanel
(la misma donde hoy está `index.html`), **respetando las mismas subcarpetas**.
Ejemplo: `public/js/app.js` → `js/app.js` del subdominio.

## 1. Archivos que se reemplazan (6)

| Archivo en el repositorio | Va en el servidor como |
|---|---|
| `public/index.html` | `index.html` |
| `public/css/styles.css` | `css/styles.css` |
| `public/js/app.js` | `js/app.js` |
| `public/js/data.js` | `js/data.js` |
| `public/api/cotizar.php` | `api/cotizar.php` |
| `public/images/products/congelados/OLV-CON-003.jpg` | `images/products/congelados/OLV-CON-003.jpg` |

## 2. Archivos nuevos (20)

| Archivo en el repositorio | Va en el servidor como |
|---|---|
| `public/js/data-servilletas.js` | `js/data-servilletas.js` |
| `public/images/cat-servilletas.jpg` | `images/cat-servilletas.jpg` |
| `public/images/hero-servilletas.jpg` | `images/hero-servilletas.jpg` |
| `public/images/products/servilletas/` (carpeta nueva, 12 fotos) | `images/products/servilletas/` |
| `public/images/products/congelados/OLV-CON-049.jpg` | `images/products/congelados/OLV-CON-049.jpg` |
| `public/images/products/lacteos/OLV-LAC-024.jpg` | `images/products/lacteos/OLV-LAC-024.jpg` |
| `public/images/products/insumos/OLV-INS-024.jpg` | `images/products/insumos/OLV-INS-024.jpg` |
| `public/images/products/insumos/OLV-INS-025.jpg` | `images/products/insumos/OLV-INS-025.jpg` |
| `public/images/products/insumos/OLV-INS-027.jpg` | `images/products/insumos/OLV-INS-027.jpg` |

Las 12 fotos de la carpeta `servilletas` son: `OLV-SER-001.jpg` a `OLV-SER-010.jpg`, `OLV-SER-012.jpg` y `OLV-SER-013.jpg` (no existe la 011).

## 3. Archivo que se borra del servidor

- `api/estado.php` — era solo para diagnóstico de la instalación; no debe quedar público.

## 4. Revisión después de subir

1. Abrir https://mayorista.distribuidoraolivo.cl y recargar con **Ctrl + F5**.
2. Debe verse: logo solo «OLIVO», titular «Todo lo que tu negocio necesita, **en un solo proveedor**.», sin la fila «Sin registro ni login · Cotización formal por correo · …» bajo los botones del banner principal, el 2.º banner de **Servilletas Joker** (ya no el de sushi) y la tarjeta **Servilletas** al final de «Explora todo para tu negocio».
3. Entrar a **Servilletas**: 16 productos (37,5 x 33 cm: 4 · 40 x 40 cm: 9 · otras medidas: 3), todos con foto. Buscar «tapa bowl», «camarón chino», «atún filete» y «Surlat»: ya no deben decir «Foto pendiente».
4. En «¿Qué tipo de local tienes?» deben aparecer Restaurante, Cafetería, Local de sushi y **Hotel**.
5. Hacer una cotización de prueba y revisar que llegue el correo y que el botón «Enviar solicitud por WhatsApp» abra el chat con Olivo (+56 9 7723 6128).

Si la página sale con el diseño anterior, es caché: `index.html` carga los archivos con `?v=2026-11-17-2`, así que basta con confirmar que se subió el `index.html` nuevo.
