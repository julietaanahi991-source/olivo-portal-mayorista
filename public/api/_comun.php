<?php
/**
 * OLIVO · Portal mayorista — funciones compartidas del microservicio de cotizaciones.
 * Este archivo no se llama directamente desde el navegador (lo bloquea .htaccess).
 */

declare(strict_types=1);

function olivo_responder(int $status, array $cuerpo): void
{
    http_response_code($status);
    header('Content-Type: application/json; charset=utf-8');
    header('Cache-Control: no-store');
    header('X-Content-Type-Options: nosniff');
    echo json_encode($cuerpo, JSON_UNESCAPED_UNICODE);
    exit;
}

/**
 * Carga la configuración privada. Se busca, en orden:
 *  1. La ruta indicada en la variable de entorno OLIVO_CONFIG (opcional).
 *  2. ~/olivo-privado/config.php, subiendo carpetas desde /api hasta encontrarla.
 * La carpeta olivo-privado debe quedar FUERA de public_html.
 */
function olivo_config(): array
{
    static $config = null;
    if ($config !== null) {
        return $config;
    }
    $candidatos = [];
    $env = getenv('OLIVO_CONFIG');
    if ($env) {
        $candidatos[] = $env;
    }
    $dir = __DIR__;
    for ($i = 0; $i < 5; $i++) {
        $dir = dirname($dir);
        $candidatos[] = $dir . '/olivo-privado/config.php';
    }
    foreach ($candidatos as $ruta) {
        if (is_file($ruta)) {
            $config = require $ruta;
            if (is_array($config)) {
                return $config;
            }
        }
    }
    olivo_responder(500, ['ok' => false, 'error' => 'config_no_encontrada']);
}

function olivo_db(array $c): PDO
{
    $dsn = sprintf('mysql:host=%s;port=%d;dbname=%s;charset=utf8mb4', $c['db']['host'], (int)($c['db']['port'] ?? 3306), $c['db']['nombre']);
    return new PDO($dsn, $c['db']['usuario'], $c['db']['clave'], [
        PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
        PDO::ATTR_EMULATE_PREPARES => false,
    ]);
}

/** Quita saltos de línea y espacios extra; corta al largo máximo. */
function olivo_texto($v, int $max): string
{
    $v = is_scalar($v) ? (string)$v : '';
    $v = preg_replace('/[\r\n\t]+/u', ' ', $v) ?? '';
    $v = trim(preg_replace('/\s{2,}/u', ' ', $v) ?? '');
    return mb_substr($v, 0, $max, 'UTF-8');
}

/** Texto multilínea (comentarios): conserva saltos de línea, corta al máximo. */
function olivo_parrafo($v, int $max): string
{
    $v = is_scalar($v) ? (string)$v : '';
    $v = str_replace(["\r\n", "\r"], "\n", $v);
    return mb_substr(trim($v), 0, $max, 'UTF-8');
}

/** Valida un RUT chileno (formato y dígito verificador). Devuelve el RUT normalizado o null. */
function olivo_rut(string $rut): ?string
{
    $limpio = strtoupper(preg_replace('/[^0-9kK]/', '', $rut) ?? '');
    if (strlen($limpio) < 8 || strlen($limpio) > 9) {
        return null;
    }
    $cuerpo = substr($limpio, 0, -1);
    $dv = substr($limpio, -1);
    $suma = 0;
    $factor = 2;
    for ($i = strlen($cuerpo) - 1; $i >= 0; $i--) {
        $suma += (int)$cuerpo[$i] * $factor;
        $factor = $factor === 7 ? 2 : $factor + 1;
    }
    $resto = 11 - ($suma % 11);
    $esperado = $resto === 11 ? '0' : ($resto === 10 ? 'K' : (string)$resto);
    if ($dv !== $esperado) {
        return null;
    }
    return number_format((int)$cuerpo, 0, ',', '.') . '-' . $dv;
}

function olivo_ip_hash(array $c): string
{
    $ip = $_SERVER['REMOTE_ADDR'] ?? '0.0.0.0';
    return hash('sha256', ($c['sal_ip'] ?? 'olivo') . '|' . $ip);
}
