param([Parameter(Mandatory)][string]$Archivo, [Parameter(Mandatory)][string]$Salida)
# Extrae del Categoria.dc.html del lienzo: categorías, productos y mapa SKU -> id de foto.
$ErrorActionPreference = 'Stop'
$t = [IO.File]::ReadAllText($Archivo, (New-Object System.Text.UTF8Encoding($false)))
$str = "'((?:[^'\\]|\\.)*)'"
function Des([string]$s) { return $s -replace "\\'", "'" -replace '\\\\', '\' }

# Mapa de fotos
$ini = $t.IndexOf('const IMG = {'); $fin = $t.IndexOf('};', $ini)
$img = [ordered]@{}
foreach ($m in [regex]::Matches($t.Substring($ini, $fin - $ini), "'(OLV-[A-Z]{3}-\d{3})':\s*'([0-9a-f]{32})'")) { $img[$m.Groups[1].Value] = $m.Groups[2].Value }

# Categorías
$ini = $t.IndexOf('const CATS = {'); $fin = $t.IndexOf('const P = [', $ini)
$bloque = $t.Substring($ini, $fin - $ini)
$cats = @()
foreach ($m in [regex]::Matches($bloque, "(\w+): \{ name: $str, badge: $str, desc: $str,\s*subs: \[(.*?)\] \}", 'Singleline')) {
  $subs = @()
  foreach ($s in [regex]::Matches($m.Groups[5].Value, "\[$str, $str\]")) { $subs += [ordered]@{ id = (Des $s.Groups[1].Value); name = (Des $s.Groups[2].Value) } }
  $cats += [ordered]@{ id = $m.Groups[1].Value; name = (Des $m.Groups[2].Value); badge = (Des $m.Groups[3].Value); desc = (Des $m.Groups[4].Value); subs = $subs }
}

# Productos
$ini = $t.IndexOf('const P = ['); $fin = $t.IndexOf('].map((r)', $ini)
$prods = @()
foreach ($m in [regex]::Matches($t.Substring($ini, $fin - $ini), "\[$str, $str, $str, $str, $str, $str\]")) {
  $sku = $m.Groups[1].Value
  $prods += [ordered]@{ sku = $sku; name = (Des $m.Groups[2].Value); brand = (Des $m.Groups[3].Value); cat = $m.Groups[4].Value; sub = $m.Groups[5].Value; format = (Des $m.Groups[6].Value); img = $img[$sku] }
}

$res = [ordered]@{ categorias = $cats; productos = $prods }
[IO.File]::WriteAllText($Salida, ($res | ConvertTo-Json -Depth 6), (New-Object System.Text.UTF8Encoding($false)))
Write-Host ("Categorías: {0} · Productos: {1} · Con foto: {2} · Fotos únicas: {3}" -f $cats.Count, $prods.Count, ($prods | Where-Object { $_.img }).Count, (($prods | Where-Object { $_.img } | ForEach-Object { $_.img }) | Sort-Object -Unique).Count)
$prods | Group-Object { $_.cat } | ForEach-Object { Write-Host ("  {0}: {1}" -f $_.Name, $_.Count) }
