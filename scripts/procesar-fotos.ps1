<#
  OLIVO — Procesa fotos de producto y las vincula en data.js (no necesita Node ni instalar nada).

  Uso 1, fotos sueltas: deja cada foto en fotos-productos/<categoria>/ con el SKU al inicio del nombre
  (OLV-ALM-001.jpg o "OLV-ALM-001 aceite.png") y corre:
      powershell -ExecutionPolicy Bypass -File scripts/procesar-fotos.ps1

  Uso 2, recortes desde un catálogo: un CSV con columnas sku,archivo,x,y,ancho,alto,borrar,modo
  (coordenadas en píxeles de la página, o de una vista reducida usando -Escala; "borrar" es opcional:
  zonas x1:y1:x2:y2 separadas por ";" que se pintan de blanco antes de recortar; "modo" vacío = producto
  sobre fondo blanco, se recorta el blanco sobrante; "escena" = foto con ambiente, se respeta el fondo):
      powershell -ExecutionPolicy Bypass -File scripts/procesar-fotos.ps1 -Recortes fotos-productos/.../recortes.csv

  Cada foto: se recorta el fondo sobrante, se centra en un cuadrado blanco de -Tam px, se guarda como
  public/images/products/<categoria>/<SKU>.jpg (calidad -Calidad) y se actualiza el campo image en data.js.
  Al final lista los SKU que siguen sin foto local.
#>
param(
  [string]$Recortes = '',
  [int]$Tam = 1000,
  [int]$Calidad = 84,
  [double]$Ocupacion = 0.86,
  [int]$Umbral = 236,
  [double]$Escala = 1.0   # multiplica las coordenadas del CSV (útil si se midieron sobre una vista reducida)
)
$ErrorActionPreference = 'Stop'
$Root = Split-Path -Parent $PSScriptRoot
$enc = New-Object System.Text.UTF8Encoding($false)

Add-Type -ReferencedAssemblies System.Drawing -TypeDefinition @'
using System;
using System.Drawing;
using System.Drawing.Drawing2D;
using System.Drawing.Imaging;
using System.Runtime.InteropServices;

public static class OlivoFotos {
  // Recorta la región, pinta de blanco las zonas indicadas, quita el fondo claro sobrante
  // y centra el producto en un cuadrado blanco.
  public static Bitmap Procesar(Bitmap pagina, Rectangle region, Rectangle[] blancos, int tam, double ocupacion, int umbral) {
    region.Intersect(new Rectangle(0, 0, pagina.Width, pagina.Height));
    Bitmap rec = new Bitmap(region.Width, region.Height, PixelFormat.Format24bppRgb);
    using (Graphics g = Graphics.FromImage(rec)) {
      g.Clear(Color.White);
      g.DrawImage(pagina, new Rectangle(0, 0, region.Width, region.Height), region, GraphicsUnit.Pixel);
      foreach (Rectangle b in blancos) {
        Rectangle r = new Rectangle(b.X - region.X, b.Y - region.Y, b.Width, b.Height);
        g.FillRectangle(Brushes.White, r);
      }
    }
    Rectangle caja = Contenido(rec, umbral);
    if (caja.Width < 4 || caja.Height < 4) caja = new Rectangle(0, 0, rec.Width, rec.Height);
    Bitmap salida = new Bitmap(tam, tam, PixelFormat.Format24bppRgb);
    using (Graphics g = Graphics.FromImage(salida)) {
      g.Clear(Color.White);
      g.InterpolationMode = InterpolationMode.HighQualityBicubic;
      g.SmoothingMode = SmoothingMode.HighQuality;
      g.PixelOffsetMode = PixelOffsetMode.HighQuality;
      double escala = Math.Min(tam * ocupacion / caja.Width, tam * ocupacion / caja.Height);
      int w = (int)Math.Round(caja.Width * escala), h = (int)Math.Round(caja.Height * escala);
      g.DrawImage(rec, new Rectangle((tam - w) / 2, (tam - h) / 2, w, h), caja, GraphicsUnit.Pixel);
    }
    rec.Dispose();
    return salida;
  }

  // Fotos con ambiente (fondo no blanco): se recorta tal cual y, si no es cuadrado, los lados
  // se rellenan con el mismo recorte ampliado y desenfocado en vez de bandas blancas.
  public static Bitmap Escena(Bitmap pagina, Rectangle region, int tam) {
    region.Intersect(new Rectangle(0, 0, pagina.Width, pagina.Height));
    Bitmap salida = new Bitmap(tam, tam, PixelFormat.Format24bppRgb);
    using (Graphics g = Graphics.FromImage(salida)) {
      g.InterpolationMode = InterpolationMode.HighQualityBicubic;
      g.PixelOffsetMode = PixelOffsetMode.HighQuality;
      double cubre = Math.Max((double)tam / region.Width, (double)tam / region.Height);
      int cw = (int)Math.Ceiling(region.Width * cubre), ch = (int)Math.Ceiling(region.Height * cubre);
      // Desenfoque en dos pasos (achicar mucho y volver a agrandar) para que el relleno no se vea en bloques.
      using (Bitmap chico = new Bitmap(Math.Max(1, cw / 32), Math.Max(1, ch / 32)))
      using (Bitmap medio = new Bitmap(Math.Max(1, cw / 4), Math.Max(1, ch / 4))) {
        using (Graphics gc = Graphics.FromImage(chico)) {
          gc.InterpolationMode = InterpolationMode.HighQualityBilinear;
          gc.DrawImage(pagina, new Rectangle(0, 0, chico.Width, chico.Height), region, GraphicsUnit.Pixel);
        }
        using (Graphics gm = Graphics.FromImage(medio)) {
          gm.InterpolationMode = InterpolationMode.HighQualityBicubic;
          gm.PixelOffsetMode = PixelOffsetMode.HighQuality;
          gm.DrawImage(chico, new Rectangle(0, 0, medio.Width, medio.Height));
        }
        g.InterpolationMode = InterpolationMode.HighQualityBicubic;
        g.DrawImage(medio, new Rectangle((tam - cw) / 2, (tam - ch) / 2, cw, ch));
      }
      g.InterpolationMode = InterpolationMode.HighQualityBicubic;
      double ajusta = Math.Min((double)tam / region.Width, (double)tam / region.Height);
      int w = (int)Math.Round(region.Width * ajusta), h = (int)Math.Round(region.Height * ajusta);
      g.DrawImage(pagina, new Rectangle((tam - w) / 2, (tam - h) / 2, w, h), region, GraphicsUnit.Pixel);
    }
    return salida;
  }

  // Caja que encierra los píxeles que no son fondo (algún canal por debajo del umbral).
  static Rectangle Contenido(Bitmap bmp, int umbral) {
    BitmapData d = bmp.LockBits(new Rectangle(0, 0, bmp.Width, bmp.Height), ImageLockMode.ReadOnly, PixelFormat.Format24bppRgb);
    byte[] px = new byte[d.Stride * bmp.Height];
    Marshal.Copy(d.Scan0, px, 0, px.Length);
    bmp.UnlockBits(d);
    int x0 = bmp.Width, y0 = bmp.Height, x1 = -1, y1 = -1;
    for (int y = 0; y < bmp.Height; y++) {
      int fila = y * d.Stride;
      for (int x = 0; x < bmp.Width; x++) {
        int i = fila + x * 3;
        if (px[i] < umbral || px[i + 1] < umbral || px[i + 2] < umbral) {
          if (x < x0) x0 = x; if (x > x1) x1 = x; if (y < y0) y0 = y; if (y > y1) y1 = y;
        }
      }
    }
    if (x1 < 0) return Rectangle.Empty;
    return new Rectangle(x0, y0, x1 - x0 + 1, y1 - y0 + 1);
  }

  public static void GuardarJpg(Bitmap bmp, string ruta, long calidad) {
    ImageCodecInfo codec = null;
    foreach (ImageCodecInfo c in ImageCodecInfo.GetImageEncoders()) if (c.MimeType == "image/jpeg") codec = c;
    EncoderParameters p = new EncoderParameters(1);
    p.Param[0] = new EncoderParameter(System.Drawing.Imaging.Encoder.Quality, calidad);
    bmp.Save(ruta, codec, p);
  }
}
'@

# --- Catálogo: SKU -> categoría, leído desde data.js ---
$dataPath = Join-Path $Root 'public\js\data.js'
$data = [IO.File]::ReadAllText($dataPath, $enc)
$cat = @{}
foreach ($m in [regex]::Matches($data, 'sku:\s*"([^"]+)"[\s\S]*?categoryId:\s*"([^"]+)"')) { $cat[$m.Groups[1].Value] = $m.Groups[2].Value }

function Guardar-Producto([string]$sku, [System.Drawing.Bitmap]$pagina, [System.Drawing.Rectangle]$region, $blancos, [string]$modo = '') {
  if (-not $cat.ContainsKey($sku)) { Write-Host "  [OMITIDO] $sku no existe en data.js" -ForegroundColor Yellow; return $false }
  $dir = Join-Path $Root "public\images\products\$($cat[$sku])"
  New-Item -ItemType Directory -Force $dir | Out-Null
  $out = Join-Path $dir "$sku.jpg"
  if ($modo -eq 'escena') { $bmp = [OlivoFotos]::Escena($pagina, $region, $Tam) }
  else { $bmp = [OlivoFotos]::Procesar($pagina, $region, [System.Drawing.Rectangle[]]$blancos, $Tam, $Ocupacion, $Umbral) }
  [OlivoFotos]::GuardarJpg($bmp, $out, $Calidad)
  $bmp.Dispose()
  $kb = [int]((Get-Item $out).Length / 1KB)
  Write-Host ("  [OK] {0} -> images/products/{1}/{0}.jpg ({2} KB)" -f $sku, $cat[$sku], $kb)
  return $true
}

$hechos = @()
if ($Recortes) {
  $csvPath = if ([IO.Path]::IsPathRooted($Recortes)) { $Recortes } else { Join-Path $Root $Recortes }
  $base = Split-Path -Parent $csvPath
  Write-Host "Recortes desde $Recortes"
  $paginas = @{}
  foreach ($r in (Import-Csv -LiteralPath $csvPath -Encoding UTF8)) {
    $archivo = Join-Path $base $r.archivo
    if (-not $paginas.ContainsKey($archivo)) { $paginas[$archivo] = New-Object System.Drawing.Bitmap $archivo }
    $region = New-Object System.Drawing.Rectangle ([int]([double]$r.x * $Escala)), ([int]([double]$r.y * $Escala)), ([int]([double]$r.ancho * $Escala)), ([int]([double]$r.alto * $Escala))
    $blancos = @()
    if ($r.borrar) {
      foreach ($z in $r.borrar.Split(';')) {
        $v = $z.Split(':') | ForEach-Object { [int]([double]$_ * $Escala) }
        $blancos += New-Object System.Drawing.Rectangle $v[0], $v[1], ($v[2] - $v[0]), ($v[3] - $v[1])
      }
    }
    if (Guardar-Producto $r.sku $paginas[$archivo] $region $blancos $r.modo) { $hechos += $r.sku }
  }
  $paginas.Values | ForEach-Object { $_.Dispose() }
} else {
  $entrada = Join-Path $Root 'fotos-productos'
  Write-Host "Fotos sueltas desde fotos-productos/"
  $fotos = Get-ChildItem $entrada -Recurse -File -Include *.jpg, *.jpeg, *.png | Where-Object { $_.FullName -notmatch '\\catalogos-mixtos\\' }
  foreach ($f in $fotos) {
    $m = [regex]::Match($f.Name, '^(OLV-[A-Z]{3}-\d{3})', 'IgnoreCase')
    if (-not $m.Success) { Write-Host "  [SIN SKU] $($f.Name): renombrar empezando por el SKU" -ForegroundColor Yellow; continue }
    $sku = $m.Groups[1].Value.ToUpper()
    $pagina = New-Object System.Drawing.Bitmap $f.FullName
    $region = New-Object System.Drawing.Rectangle 0, 0, $pagina.Width, $pagina.Height
    if (Guardar-Producto $sku $pagina $region @()) { $hechos += $sku }
    $pagina.Dispose()
  }
  $webp = Get-ChildItem $entrada -Recurse -File -Include *.webp
  foreach ($f in $webp) { Write-Host "  [WEBP] $($f.Name): exportar como JPG o PNG (este equipo no lee WebP)" -ForegroundColor Yellow }
}

# --- Vincular en data.js toda foto local que exista ---
$cambios = 0
foreach ($sku in $cat.Keys) {
  $ruta = "images/products/$($cat[$sku])/$sku.jpg"
  if (-not (Test-Path (Join-Path $Root "public\$ruta"))) { continue }
  # Ojo: [regex]::Replace(a, b, c, 1) interpreta el 1 como opción (IgnoreCase), no como cantidad.
  $rx = New-Object System.Text.RegularExpressions.Regex ('(sku:\s*"' + [regex]::Escape($sku) + '"[\s\S]*?image:\s*)"[^"]*"')
  $nuevo = $rx.Replace($data, ('${1}"' + $ruta + '"'), 1)
  if ($nuevo -ne $data) { $data = $nuevo; $cambios++ }
}
if ($cambios -gt 0) { [IO.File]::WriteAllText($dataPath, $data, $enc) }

$sinFoto = $cat.Keys | Where-Object { -not (Test-Path (Join-Path $Root "public\images\products\$($cat[$_])\$_.jpg")) } | Sort-Object
Write-Host ""
Write-Host ("Procesadas: {0} · Vinculadas nuevas en data.js: {1} · Con foto local: {2} de {3}" -f $hechos.Count, $cambios, ($cat.Count - @($sinFoto).Count), $cat.Count)
if (@($sinFoto).Count) { Write-Host ("Sin foto todavía: " + ($sinFoto -join ', ')) }
