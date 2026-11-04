<?php
/**
 * OLIVO · Portal mayorista — recibe una solicitud de cotización.
 *
 * Entrada: POST con JSON (Content-Type: application/json) desde el portal.
 * Hace:   valida → guarda en MySQL → genera código COT-AAAA-NNNN → avisa a ventas por correo
 *         → envía copia al cliente → (opcional) reenvía al CRM.
 * Salida: JSON { ok: true, codigo: "COT-2026-0001" } o { ok: false, error, errores? }.
 * El portal nunca muestra precios: aquí tampoco se manejan montos.
 */

declare(strict_types=1);
require __DIR__ . '/_comun.php';

const OLIVO_COMUNAS = ['Viña del Mar', 'Valparaíso', 'Concón', 'Quilpué', 'Villa Alemana', 'Limache', 'Quillota'];
const OLIVO_TIPOS = ['Restaurante', 'Local de sushi', 'Pizzería', 'Cafetería', 'Minimarket', 'Casino o catering', 'Otro'];

if (($_SERVER['REQUEST_METHOD'] ?? '') !== 'POST') {
    header('Allow: POST');
    olivo_responder(405, ['ok' => false, 'error' => 'metodo_no_permitido']);
}

$c = olivo_config();

// Solo se aceptan envíos desde el propio portal (si se configuró el origen).
$origen = $_SERVER['HTTP_ORIGIN'] ?? '';
if (!empty($c['origenes_permitidos']) && $origen !== '' && !in_array($origen, $c['origenes_permitidos'], true)) {
    olivo_responder(403, ['ok' => false, 'error' => 'origen_no_permitido']);
}

$crudo = file_get_contents('php://input', false, null, 0, 65536);
$d = json_decode($crudo ?: '', true);
if (!is_array($d)) {
    olivo_responder(400, ['ok' => false, 'error' => 'json_invalido']);
}

// Trampa anti-spam: campo oculto que una persona nunca completa.
if (!empty($d['website'])) {
    olivo_responder(200, ['ok' => true, 'codigo' => 'COT-' . date('Y') . '-0000']);
}

// ---------- Validación (los mismos campos que marca el formulario) ----------
$errores = [];
$nombre   = olivo_texto($d['clientName'] ?? '', 120);
$telefono = olivo_texto($d['phone'] ?? '', 30);
$email    = olivo_texto($d['email'] ?? '', 160);
$local    = olivo_texto($d['companyName'] ?? '', 160);
$rut      = olivo_rut(olivo_texto($d['rut'] ?? '', 20));
$comuna   = olivo_texto($d['comuna'] ?? '', 40);
$tipo     = olivo_texto($d['businessType'] ?? '', 40);
$notas    = olivo_parrafo($d['notes'] ?? '', 1000);

if ($nombre === '') $errores['clientName'] = true;
if (!preg_match('/^[0-9+\s().-]{8,30}$/', $telefono)) $errores['phone'] = true;
if (!filter_var($email, FILTER_VALIDATE_EMAIL)) $errores['email'] = true;
if ($local === '') $errores['companyName'] = true;
if ($rut === null) $errores['rut'] = true;
if (!in_array($comuna, OLIVO_COMUNAS, true)) $errores['comuna'] = true;
if (!in_array($tipo, OLIVO_TIPOS, true)) $tipo = 'Otro';

$items = [];
foreach ((array)($d['items'] ?? []) as $it) {
    if (!is_array($it)) continue;
    $sku = strtoupper(olivo_texto($it['sku'] ?? '', 20));
    $cantidad = (int)($it['quantity'] ?? 0);
    if (!preg_match('/^OLV-[A-Z]{3}-\d{3}$/', $sku) || $cantidad < 1 || $cantidad > 9999) continue;
    $items[] = [
        'sku' => $sku,
        'nombre' => olivo_texto($it['name'] ?? '', 200),
        'marca' => olivo_texto($it['brand'] ?? '', 80),
        'formato' => olivo_texto($it['format'] ?? '', 200),
        'cantidad' => $cantidad,
    ];
    if (count($items) >= 150) break;
}
if (!$items) $errores['items'] = true;

if ($errores) {
    olivo_responder(422, ['ok' => false, 'error' => 'datos_invalidos', 'errores' => $errores]);
}

// Datos de campaña para medir Google Ads (opcionales).
$campania = [];
foreach (['gclid', 'utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content'] as $k) {
    $campania[$k] = olivo_texto($d['tracking'][$k] ?? '', 200) ?: null;
}

// ---------- Guardado ----------
try {
    $pdo = olivo_db($c);
    $ipHash = olivo_ip_hash($c);

    // Límite de envíos por IP (evita abusos).
    $limite = (int)($c['limite_por_10_minutos'] ?? 5);
    $q = $pdo->prepare('SELECT COUNT(*) FROM cotizaciones WHERE ip_hash = ? AND creado_en > (NOW() - INTERVAL 10 MINUTE)');
    $q->execute([$ipHash]);
    if ((int)$q->fetchColumn() >= $limite) {
        olivo_responder(429, ['ok' => false, 'error' => 'demasiados_envios']);
    }

    $pdo->beginTransaction();
    $ins = $pdo->prepare('INSERT INTO cotizaciones
        (codigo, contacto, telefono, email, razon_social, rut, comuna, tipo_negocio, comentarios,
         gclid, utm_source, utm_medium, utm_campaign, utm_term, utm_content, ip_hash, user_agent)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)');
    $ins->execute([
        'TEMP-' . bin2hex(random_bytes(6)), $nombre, $telefono, $email, $local, $rut, $comuna, $tipo, $notas,
        $campania['gclid'], $campania['utm_source'], $campania['utm_medium'], $campania['utm_campaign'],
        $campania['utm_term'], $campania['utm_content'], $ipHash,
        olivo_texto($_SERVER['HTTP_USER_AGENT'] ?? '', 255),
    ]);
    $id = (int)$pdo->lastInsertId();
    $codigo = sprintf('COT-%s-%04d', date('Y'), $id);
    $pdo->prepare('UPDATE cotizaciones SET codigo = ? WHERE id = ?')->execute([$codigo, $id]);

    $insItem = $pdo->prepare('INSERT INTO cotizacion_items (cotizacion_id, sku, nombre, marca, formato, cantidad) VALUES (?, ?, ?, ?, ?, ?)');
    foreach ($items as $it) {
        $insItem->execute([$id, $it['sku'], $it['nombre'], $it['marca'], $it['formato'], $it['cantidad']]);
    }
    $pdo->commit();
} catch (Throwable $e) {
    if (isset($pdo) && $pdo->inTransaction()) $pdo->rollBack();
    error_log('[olivo/cotizar] ' . $e->getMessage());
    olivo_responder(500, ['ok' => false, 'error' => 'error_guardando']);
}

// ---------- Correos (si fallan, la cotización igual queda guardada) ----------
$lineas = [];
foreach ($items as $it) {
    $lineas[] = sprintf('- %s × %d · %s (%s) [%s]', $it['nombre'], $it['cantidad'], $it['formato'], $it['marca'], $it['sku']);
}
$detalle = implode("\n", $lineas);
$correo = $c['correo'] ?? [];
$remitente = $correo['remitente'] ?? '';
$nombreRemitente = $correo['nombre_remitente'] ?? 'Distribuidora Olivo';

function olivo_enviar(string $para, string $asunto, string $cuerpo, string $remitente, string $nombreRemitente, string $responderA = ''): bool
{
    if ($para === '' || $remitente === '') return false;
    $cab = [
        'MIME-Version: 1.0',
        'Content-Type: text/plain; charset=UTF-8',
        'Content-Transfer-Encoding: 8bit',
        'From: =?UTF-8?B?' . base64_encode($nombreRemitente) . '?= <' . $remitente . '>',
    ];
    if ($responderA !== '') $cab[] = 'Reply-To: ' . $responderA;
    return @mail($para, '=?UTF-8?B?' . base64_encode($asunto) . '?=', $cuerpo, implode("\r\n", $cab), '-f' . $remitente);
}

$aVentas = "Nueva solicitud de cotización desde el portal mayorista.\n\n"
    . "Código: $codigo\nFecha: " . date('d-m-Y H:i') . "\n\n"
    . "Contacto: $nombre\nTeléfono: $telefono\nCorreo: $email\n"
    . "Razón social / local: $local\nRUT: $rut\nComuna: $comuna\nTipo de negocio: $tipo\n\n"
    . "Productos solicitados:\n$detalle\n\n"
    . ($notas !== '' ? "Comentarios de despacho:\n$notas\n\n" : '')
    . ($campania['gclid'] || $campania['utm_source'] ? "Origen: " . ($campania['utm_source'] ?? '') . ' ' . ($campania['utm_campaign'] ?? '') . ($campania['gclid'] ? ' (Google Ads)' : '') . "\n" : '');
$okVentas = olivo_enviar((string)($correo['ventas'] ?? ''), "Cotización $codigo · $local · $comuna", $aVentas, $remitente, $nombreRemitente, $email);

$okCliente = false;
if (!empty($correo['copia_al_cliente'])) {
    $aCliente = "Hola $nombre,\n\n"
        . "¡Tu solicitud fue recibida! Un ejecutivo de Distribuidora Olivo revisará los productos seleccionados "
        . "y enviará una cotización personalizada a tu correo electrónico.\n\n"
        . "Código de seguimiento: $codigo\nDespacho en: $comuna\n\n"
        . "Productos solicitados:\n$detalle\n\n"
        . "Despachos de lunes a sábado, de 9:00 a 15:00 hrs.\n"
        . ($correo['firma'] ?? 'Distribuidora e Importadora Olivo SpA') . "\n";
    $okCliente = olivo_enviar($email, "Recibimos tu solicitud $codigo · Distribuidora Olivo", $aCliente, $remitente, $nombreRemitente, (string)($correo['ventas'] ?? ''));
}

// ---------- Reenvío al CRM (opcional; queda listo para YAL CRM) ----------
$estadoCrm = 'no_configurado';
if (!empty($c['crm']['url']) && function_exists('curl_init')) {
    $payload = json_encode([
        'codigo' => $codigo, 'contacto' => $nombre, 'telefono' => $telefono, 'email' => $email,
        'razon_social' => $local, 'rut' => $rut, 'comuna' => $comuna, 'tipo_negocio' => $tipo,
        'comentarios' => $notas, 'items' => $items, 'campania' => $campania,
    ], JSON_UNESCAPED_UNICODE);
    $ch = curl_init($c['crm']['url']);
    curl_setopt_array($ch, [
        CURLOPT_POST => true,
        CURLOPT_POSTFIELDS => $payload,
        CURLOPT_HTTPHEADER => array_merge(['Content-Type: application/json'], (array)($c['crm']['cabeceras'] ?? [])),
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_TIMEOUT => 8,
    ]);
    curl_exec($ch);
    $http = (int)curl_getinfo($ch, CURLINFO_HTTP_CODE);
    curl_close($ch);
    $estadoCrm = ($http >= 200 && $http < 300) ? 'enviado' : 'error_' . $http;
}

try {
    $pdo->prepare('UPDATE cotizaciones SET correo_ventas_ok = ?, correo_cliente_ok = ?, estado_crm = ? WHERE id = ?')
        ->execute([$okVentas ? 1 : 0, $okCliente ? 1 : 0, $estadoCrm, $id]);
} catch (Throwable $e) {
    error_log('[olivo/cotizar] estado: ' . $e->getMessage());
}

olivo_responder(200, ['ok' => true, 'codigo' => $codigo]);
