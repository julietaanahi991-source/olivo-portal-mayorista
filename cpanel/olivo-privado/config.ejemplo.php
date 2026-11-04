<?php
/**
 * OLIVO · Configuración privada del microservicio de cotizaciones.
 *
 * 1. Copia este archivo como  config.php  (sin «.ejemplo») dentro de la carpeta  olivo-privado/
 * 2. Esa carpeta va en tu carpeta de usuario de cPanel, FUERA de public_html:
 *      /home/TU_USUARIO/olivo-privado/config.php
 * 3. Completa los valores marcados con «CAMBIAR».
 * Nunca subas este archivo a public_html ni lo compartas: tiene la clave de la base de datos.
 */

return [

    // Base de datos creada en cPanel → «Bases de datos MySQL».
    // En cPanel los nombres llevan tu usuario como prefijo, por ejemplo: olivouser_portal
    'db' => [
        'host'    => 'localhost',
        'port'    => 3306,
        'nombre'  => 'CAMBIAR_usuario_portal',
        'usuario' => 'CAMBIAR_usuario_portal',
        'clave'   => 'CAMBIAR_clave_segura',
    ],

    'correo' => [
        // Casilla donde llegan las solicitudes (la que revisan los ejecutivos).
        'ventas'           => 'CAMBIAR@distribuidoraolivo.cl',
        // Remitente: debe ser una casilla REAL del mismo dominio, creada en cPanel → «Cuentas de correo»,
        // para que los correos no caigan en spam. Ej.: portal@distribuidoraolivo.cl
        'remitente'        => 'CAMBIAR@distribuidoraolivo.cl',
        'nombre_remitente' => 'Distribuidora Olivo',
        // true = el cliente recibe una copia de su lista con el código de seguimiento.
        'copia_al_cliente' => true,
        'firma'            => "Distribuidora e Importadora Olivo SpA\nViña del Mar, Región de Valparaíso",
    ],

    // Dominios desde donde se aceptan envíos. Deja el del portal (con https).
    'origenes_permitidos' => [
        'https://mayorista.distribuidoraolivo.cl',
    ],

    // Máximo de solicitudes por IP cada 10 minutos (anti-abuso).
    'limite_por_10_minutos' => 5,

    // Texto aleatorio para anonimizar las IP guardadas. Cámbialo por cualquier frase larga.
    'sal_ip' => 'CAMBIAR_frase_larga_aleatoria',

    // Reenvío al CRM (YAL CRM / Tecnich). Déjalo vacío hasta que Tecnich entregue la URL.
    'crm' => [
        'url'       => '',
        'cabeceras' => [
            // 'Authorization: Bearer TOKEN_ENTREGADO_POR_TECNICH',
        ],
    ],
];
