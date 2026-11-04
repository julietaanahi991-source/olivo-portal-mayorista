<?php
/**
 * OLIVO · Diagnóstico del microservicio. Abrir en el navegador: https://<subdominio>/api/estado.php
 * Muestra solo sí/no: nunca claves ni datos de clientes.
 * Recomendado: borrar o renombrar este archivo cuando el portal esté en producción.
 */

declare(strict_types=1);
require __DIR__ . '/_comun.php';

$r = [
    'php_version' => PHP_VERSION,
    'php_ok' => version_compare(PHP_VERSION, '7.4.0', '>='),
    'extensiones' => ['pdo_mysql' => extension_loaded('pdo_mysql'), 'mbstring' => extension_loaded('mbstring'), 'curl' => extension_loaded('curl')],
    'config_encontrada' => false,
    'base_de_datos' => false,
    'tablas' => false,
    'correo_configurado' => false,
    'https' => (!empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off'),
];

$c = olivo_config();
$r['config_encontrada'] = true;
$r['correo_configurado'] = !empty($c['correo']['ventas']) && !empty($c['correo']['remitente']);

try {
    $pdo = olivo_db($c);
    $r['base_de_datos'] = true;
    $t = $pdo->query("SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = DATABASE() AND table_name IN ('cotizaciones','cotizacion_items')")->fetchColumn();
    $r['tablas'] = ((int)$t === 2);
} catch (Throwable $e) {
    $r['error_db'] = 'No se pudo conectar: revisa host, nombre, usuario y clave en config.php';
}

$r['listo'] = $r['php_ok'] && $r['extensiones']['pdo_mysql'] && $r['base_de_datos'] && $r['tablas'] && $r['correo_configurado'];
olivo_responder(200, $r);
