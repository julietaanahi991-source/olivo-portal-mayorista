param(
  [Parameter(Mandatory)][string]$Lienzo,     # lienzo.json (productos con sku, cat, img)
  [Parameter(Mandatory)][string]$Fotos,      # carpeta con <id>.(jpg|png|webp)
  [Parameter(Mandatory)][string]$Destino,    # public/images/products
  [Parameter(Mandatory)][string]$Salida,     # mapa SKU -> ruta (json)
  [int]$Tam = 1000, [int]$Calidad = 84
)
# Copia las fotos del lienzo al portal como images/products/<cat>/<SKU>.jpg (webp se deja como webp).
$ErrorActionPreference = 'Stop'
Add-Type -AssemblyName System.Drawing
$enc = [System.Drawing.Imaging.ImageCodecInfo]::GetImageEncoders() | Where-Object { $_.MimeType -eq 'image/jpeg' }
$ep = New-Object System.Drawing.Imaging.EncoderParameters 1
$ep.Param[0] = New-Object System.Drawing.Imaging.EncoderParameter ([System.Drawing.Imaging.Encoder]::Quality), ([long]$Calidad)

$j = Get-Content $Lienzo -Raw -Encoding UTF8 | ConvertFrom-Json
$mapa = [ordered]@{}
$cache = @{}   # id -> bytes ya convertidos (jpg) para no recodificar fotos compartidas
$n = 0; $conv = 0; $copia = 0
foreach ($p in $j.productos) {
  if (-not $p.img) { continue }
  $src = Get-ChildItem -LiteralPath $Fotos -File -Filter "$($p.img).*" | Select-Object -First 1
  if (-not $src) { Write-Host "Sin archivo: $($p.sku) $($p.img)"; continue }
  $dir = Join-Path $Destino $p.cat
  New-Item -ItemType Directory -Force $dir | Out-Null
  if ($src.Extension -eq '.webp') {
    $dest = Join-Path $dir "$($p.sku).webp"
    Copy-Item -LiteralPath $src.FullName $dest -Force; $copia++
  } else {
    $dest = Join-Path $dir "$($p.sku).jpg"
    if (-not $cache.ContainsKey($p.img)) {
      $img = [System.Drawing.Image]::FromFile($src.FullName)
      try {
        $esJpgChico = $src.Extension -eq '.jpg' -and $img.Width -le $Tam -and $img.Height -le $Tam -and $src.Length -le 250KB
        if ($esJpgChico) {
          $cache[$p.img] = [IO.File]::ReadAllBytes($src.FullName); $copia++
        } else {
          $k = [Math]::Min(1.0, $Tam / [Math]::Max($img.Width, $img.Height))
          $w = [int][Math]::Round($img.Width * $k); $h = [int][Math]::Round($img.Height * $k)
          $bmp = New-Object System.Drawing.Bitmap $w, $h
          $g = [System.Drawing.Graphics]::FromImage($bmp)
          $g.Clear([System.Drawing.Color]::White)
          $g.InterpolationMode = 'HighQualityBicubic'; $g.SmoothingMode = 'HighQuality'; $g.PixelOffsetMode = 'HighQuality'
          $g.DrawImage($img, 0, 0, $w, $h)
          $g.Dispose()
          $ms = New-Object IO.MemoryStream
          $bmp.Save($ms, $enc, $ep); $bmp.Dispose()
          $cache[$p.img] = $ms.ToArray(); $ms.Dispose(); $conv++
        }
      } finally { $img.Dispose() }
    }
    [IO.File]::WriteAllBytes($dest, $cache[$p.img])
  }
  $mapa[$p.sku] = 'images/products/' + $p.cat + '/' + (Split-Path $dest -Leaf)
  $n++
}
[IO.File]::WriteAllText($Salida, ($mapa | ConvertTo-Json), (New-Object System.Text.UTF8Encoding($false)))
Write-Host "Fotos ubicadas: $n (convertidas $conv, copiadas tal cual $copia)"
