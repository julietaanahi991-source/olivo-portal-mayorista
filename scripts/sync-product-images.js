// OLIVO SIGNATURE — Sincronizador Automático de Imágenes de Productos
// Este script escanea 'public/images/products/' y actualiza 'public/js/data.js'
// buscando archivos que coincidan con el SKU del producto (ej: OLV-ALM-001.webp, OLV-ALM-001.jpg, olv-alm-001-*.png).

const fs = require('fs');
const path = require('path');

const PRODUCTS_DIR = path.join(__dirname, '..', 'public', 'images', 'products');
const DATA_FILE = path.join(__dirname, '..', 'public', 'js', 'data.js');

if (!fs.existsSync(PRODUCTS_DIR)) {
  console.error("El directorio 'public/images/products' no existe.");
  process.exit(1);
}

// 1. Leer data.js
let dataContent = fs.readFileSync(DATA_FILE, 'utf8');

// 2. Escanear carpetas de productos
const categories = fs.readdirSync(PRODUCTS_DIR, { withFileTypes: true })
  .filter(d => d.isDirectory())
  .map(d => d.name);

let updatedCount = 0;
const scannedFiles = {};

categories.forEach(cat => {
  const catDir = path.join(PRODUCTS_DIR, cat);
  const files = fs.readdirSync(catDir).filter(f => /\.(jpg|jpeg|png|webp|svg)$/i.test(f));
  scannedFiles[cat] = files;
});

console.log("=== ESCANEO DE IMÁGENES EN 'public/images/products/' ===");
for (const [cat, files] of Object.entries(scannedFiles)) {
  console.log(`- ${cat}: ${files.length} imágenes encontradas`);
}

// 3. Buscar productos en data.js y actualizar sus rutas de imagen si existe archivo local
const productRegex = /\{\s*id:\s*"([^"]+)",\s*sku:\s*"([^"]+)"[\s\S]*?image:\s*"([^"]+)"/g;

let match;
const updates = [];

while ((match = productRegex.exec(dataContent)) !== null) {
  const [fullBlock, prodId, sku, currentImg] = match;
  const skuNorm = sku.trim().toLowerCase();

  // Buscar coincidencia en cualquiera de las carpetas de categoría
  for (const [cat, files] of Object.entries(scannedFiles)) {
    const matchedFile = files.find(f => {
      const fNorm = f.toLowerCase();
      return fNorm.startsWith(skuNorm + '.') || fNorm.startsWith(skuNorm + '-') || fNorm.startsWith(skuNorm + '_');
    });

    if (matchedFile) {
      const newRelativePath = `images/products/${cat}/${matchedFile}`;
      if (currentImg !== newRelativePath) {
        updates.push({
          sku,
          oldPath: currentImg,
          newPath: newRelativePath
        });
      }
      break;
    }
  }
}

if (updates.length === 0) {
  console.log("\nNo se encontraron nuevas imágenes locales para vincular.");
  console.log("Para vincular una foto, nómbrala con el SKU correspondiente:");
  console.log("Ejemplo: 'public/images/products/alimentos/OLV-ALM-001.jpg' o 'OLV-ALM-001.webp'");
} else {
  updates.forEach(u => {
    // Reemplazar la ruta de imagen específica para este SKU
    const regex = new RegExp(`(sku:\\s*"${u.sku}"[\\s\\S]*?image:\\s*)"[^"]+"`, 'g');
    dataContent = dataContent.replace(regex, `$1"${u.newPath}"`);
    console.log(`[VINCULADO] ${u.sku} -> ${u.newPath}`);
  });

  fs.writeFileSync(DATA_FILE, dataContent, 'utf8');
  console.log(`\n¡Éxito! Se actualizaron ${updates.length} imágenes en 'public/js/data.js'.`);
}
