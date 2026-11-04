const fs = require('fs');
const prods = JSON.parse(fs.readFileSync('data/products-manifest.json', 'utf8'));

const catNames = {
  'alimentos': 'Alimentos y Abarrotes',
  'sushi': 'Sushi y Gastronomía Oriental',
  'congelados': 'Congelados',
  'lacteos': 'Lácteos y Refrigerados',
  'limpieza': 'Limpieza y Aseo',
  'insumos': 'Insumos para Restaurantes'
};

let md = '';
const byCat = {};
prods.forEach(p => {
  byCat[p.cat] = byCat[p.cat] || [];
  byCat[p.cat].push(p);
});

for (const cat of Object.keys(byCat)) {
  const list = byCat[cat];
  md += '\n### ' + (catNames[cat] || cat) + ' (`' + cat + '`) — ' + list.length + ' productos\n\n';
  md += '| SKU | Producto | Marca | Formato | Subcategoría | Archivo Sugerido (`public/images/products/...`) |\n';
  md += '|---|---|---|---|---|---|\n';
  list.forEach(p => {
    const slug = p.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '').slice(0, 32);
    const suggestedFile = 'images/products/' + cat + '/' + p.sku.toLowerCase() + '-' + slug + '.jpg';
    md += '| `' + p.sku + '` | **' + p.name + '** | ' + p.brand + ' | ' + p.format + ' | `' + p.sub + '` | `' + suggestedFile + '` |\n';
  });
}

fs.writeFileSync('data/products-table.md', md, 'utf8');
console.log('Generated data/products-table.md successfully!');
