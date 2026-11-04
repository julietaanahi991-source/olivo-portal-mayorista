-- OLIVO · Portal mayorista — tablas del microservicio de cotizaciones
-- Ejecutar UNA vez en phpMyAdmin, con la base de datos del portal seleccionada (pestaña «SQL»).
-- Compatible con MySQL 5.7+ y MariaDB 10.3+. Juego de caracteres utf8mb4 (tildes, ñ y emojis).

CREATE TABLE IF NOT EXISTS cotizaciones (
  id                 INT UNSIGNED NOT NULL AUTO_INCREMENT,
  codigo             VARCHAR(32)  NOT NULL,
  creado_en          DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  contacto           VARCHAR(120) NOT NULL,
  telefono           VARCHAR(30)  NOT NULL,
  email              VARCHAR(160) NOT NULL,
  razon_social       VARCHAR(160) NOT NULL,
  rut                VARCHAR(16)  NOT NULL,
  comuna             VARCHAR(40)  NOT NULL,
  tipo_negocio       VARCHAR(40)  NOT NULL,
  comentarios        TEXT         NULL,
  gclid              VARCHAR(200) NULL,
  utm_source         VARCHAR(200) NULL,
  utm_medium         VARCHAR(200) NULL,
  utm_campaign       VARCHAR(200) NULL,
  utm_term           VARCHAR(200) NULL,
  utm_content        VARCHAR(200) NULL,
  ip_hash            CHAR(64)     NOT NULL,
  user_agent         VARCHAR(255) NULL,
  correo_ventas_ok   TINYINT(1)   NOT NULL DEFAULT 0,
  correo_cliente_ok  TINYINT(1)   NOT NULL DEFAULT 0,
  estado_crm         VARCHAR(40)  NOT NULL DEFAULT 'pendiente',
  PRIMARY KEY (id),
  UNIQUE KEY uq_codigo (codigo),
  KEY idx_creado (creado_en),
  KEY idx_ip_creado (ip_hash, creado_en),
  KEY idx_rut (rut)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS cotizacion_items (
  id              INT UNSIGNED NOT NULL AUTO_INCREMENT,
  cotizacion_id   INT UNSIGNED NOT NULL,
  sku             VARCHAR(20)  NOT NULL,
  nombre          VARCHAR(200) NOT NULL,
  marca           VARCHAR(80)  NULL,
  formato         VARCHAR(200) NULL,
  cantidad        SMALLINT UNSIGNED NOT NULL,
  PRIMARY KEY (id),
  KEY idx_cotizacion (cotizacion_id),
  KEY idx_sku (sku),
  CONSTRAINT fk_items_cotizacion FOREIGN KEY (cotizacion_id) REFERENCES cotizaciones (id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Consulta útil para revisar las últimas solicitudes (pestaña «SQL» de phpMyAdmin):
-- SELECT c.codigo, c.creado_en, c.razon_social, c.comuna, c.correo_ventas_ok, COUNT(i.id) AS productos
-- FROM cotizaciones c LEFT JOIN cotizacion_items i ON i.cotizacion_id = c.id
-- GROUP BY c.id ORDER BY c.id DESC LIMIT 20;
