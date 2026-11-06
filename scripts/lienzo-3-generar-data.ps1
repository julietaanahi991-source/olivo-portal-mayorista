param(
  [Parameter(Mandatory)][string]$Lienzo,      # lienzo.json
  [Parameter(Mandatory)][string]$MapaFotos,   # mapa-fotos.json (SKU -> ruta)
  [Parameter(Mandatory)][string]$DataActual,  # public/js/data.js actual (para rescatar fichas técnicas)
  [Parameter(Mandatory)][string]$Salida       # nuevo data.js
)
# Genera data.js con el catálogo del lienzo de Claude Design (fuente de verdad del catálogo).
$ErrorActionPreference = 'Stop'
$utf8 = New-Object System.Text.UTF8Encoding($false)
$j = Get-Content $Lienzo -Raw -Encoding UTF8 | ConvertFrom-Json
$fotos = Get-Content $MapaFotos -Raw -Encoding UTF8 | ConvertFrom-Json
$viejo = [IO.File]::ReadAllText($DataActual, $utf8)

function JS($v) { return ($v | ConvertTo-Json -Compress -Depth 6) }

$meta = @{
  alimentos  = @{ short = 'Alimentos';  slug = 'alimentos-y-abarrotes' }
  proteinas  = @{ short = 'Proteínas';  slug = 'proteinas' }
  sushi      = @{ short = 'Sushi';      slug = 'sushi-y-gastronomia-oriental'; featured = $true }
  congelados = @{ short = 'Congelados'; slug = 'congelados' }
  lacteos    = @{ short = 'Lácteos';    slug = 'lacteos-y-refrigerados' }
  limpieza   = @{ short = 'Limpieza';   slug = 'limpieza-y-aseo'; featured = $true }
  insumos    = @{ short = 'Insumos';    slug = 'insumos-para-restaurantes' }
}

$sb = New-Object System.Text.StringBuilder
[void]$sb.AppendLine('// OLIVO — Catálogo del portal B2B (Distribuidora Olivo, V Región)')
[void]$sb.AppendLine('// Generado desde el lienzo de Claude Design (fuente del catálogo). Cero precios: todo va a cotización.')
[void]$sb.AppendLine('// Para regenerar: scripts de la sesión (lienzo.json + mapa de fotos). Las fichas técnicas antiguas se')
[void]$sb.AppendLine('// conservan solo cuando el SKU y la marca coinciden.')
[void]$sb.AppendLine('')
[void]$sb.AppendLine('const INITIAL_CATEGORIES = [')
$catName = @{}; $subName = @{}
$cats = @($j.categorias)
for ($i = 0; $i -lt $cats.Count; $i++) {
  $c = $cats[$i]; $m = $meta[$c.id]
  $catName[$c.id] = $c.name
  $subs = @($c.subs | ForEach-Object { $subName["$($c.id)|$($_.id)"] = $_.name; [ordered]@{ id = $_.id; name = $_.name } })
  $o = [ordered]@{ id = $c.id; slug = $m.slug; name = $c.name; shortName = $m.short; badge = $c.badge; featured = [bool]$m.featured; description = $c.desc; image = "images/cat-$($c.id).jpg"; subcategories = $subs }
  [void]$sb.AppendLine('  ' + (JS $o) + $(if ($i -lt $cats.Count - 1) { ',' } else { '' }))
}
[void]$sb.AppendLine('];')
[void]$sb.AppendLine('')

$pend = '^\[.*por confirmar\]$'
[void]$sb.AppendLine('const CATALOGO = [')
$ps = @($j.productos)
$sinFoto = 0
for ($i = 0; $i -lt $ps.Count; $i++) {
  $p = $ps[$i]
  $img = $fotos.($p.sku); if (-not $img) { $img = ''; $sinFoto++ }
  $o = [ordered]@{
    id = $p.sku; sku = $p.sku; name = $p.name
    brand = $(if ($p.brand -match $pend) { '' } else { $p.brand })
    categoryId = $p.cat; categoryName = $catName[$p.cat]
    subcategoryId = $p.sub; subcategoryName = $subName["$($p.cat)|$($p.sub)"]
    format = $(if ($p.format -match $pend) { '' } else { $p.format })
    image = $img
  }
  [void]$sb.AppendLine('  ' + (JS $o) + $(if ($i -lt $ps.Count - 1) { ',' } else { '' }))
}
[void]$sb.AppendLine('];')
[void]$sb.AppendLine('')

# Fichas técnicas del catálogo anterior (sin imágenes externas)
$ini = $viejo.IndexOf('const INITIAL_PRODUCTS = ['); $fin = $viejo.IndexOf('];', $ini) + 2
$fichas = $viejo.Substring($ini, $fin - $ini).Replace('const INITIAL_PRODUCTS = [', 'const FICHAS_DETALLE = [')
$fichas = ($fichas -split "`r?`n" | Where-Object { $_ -notmatch '^\s*(image|inStock|id|collections|minOrder):' }) -join "`n"
[void]$sb.AppendLine('// Detalle técnico del catálogo anterior (63 SKU). Se usa solo si coinciden SKU y marca.')
[void]$sb.AppendLine($fichas)
[void]$sb.AppendLine('')
[void]$sb.AppendLine(@'
const INITIAL_PRODUCTS = (function () {
  const norm = (s) => String(s || '').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9]/g, '');
  const porSku = {};
  FICHAS_DETALLE.forEach((f) => { porSku[f.sku] = f; });
  return CATALOGO.map((p) => {
    const f = porSku[p.sku];
    const base = Object.assign({ unit: '', description: '', specs: {} }, p);
    if (f && p.brand && norm(f.brand) === norm(p.brand)) {
      return Object.assign(base, { unit: f.unit || '', description: f.description || '', specs: f.specs || {} });
    }
    return base;
  });
})();

if (typeof module !== "undefined" && module.exports) {
  module.exports = { INITIAL_CATEGORIES, INITIAL_PRODUCTS };
}
'@)
[IO.File]::WriteAllText($Salida, $sb.ToString(), $utf8)
Write-Host ("data.js: {0} líneas · {1} productos · {2} sin foto" -f ($sb.ToString() -split "`n").Count, $ps.Count, $sinFoto)
