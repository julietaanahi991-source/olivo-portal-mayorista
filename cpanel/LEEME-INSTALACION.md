# Portal mayorista Olivo — instalación en cPanel

Paquete para publicar el portal y su microservicio de cotizaciones en un hosting con **cPanel** (PHP + MySQL).
Tiempo estimado: 20–30 minutos.

## Qué trae el paquete

```
portal/                      → se sube a la carpeta del subdominio (público)
├── index.html, css/, js/, images/
└── api/
    ├── cotizar.php          → recibe las solicitudes de cotización
    ├── estado.php           → diagnóstico (solo responde sí/no; bórralo al terminar las pruebas)
    ├── _comun.php           → funciones internas (bloqueado al navegador)
    └── .htaccess            → protege la carpeta api
olivo-privado/
└── config.ejemplo.php       → configuración con claves (va FUERA de public_html)
sql/
└── 01-crear-tablas.sql      → crea las 2 tablas de la base de datos
pruebas/
└── cotizacion-ejemplo.json  → solicitud de ejemplo para probar sin el portal
opcional/
└── .htaccess-raiz           → fuerza https y mejora la caché (activar cuando el SSL funcione)
```

## Requisitos del hosting

- PHP **7.4 o superior** (recomendado 8.1+) con extensiones `pdo_mysql` y `mbstring` (vienen activas en casi todos los cPanel).
- MySQL 5.7+ o MariaDB 10.3+.
- Una casilla de correo del dominio para enviar los avisos (ej. `portal@distribuidoraolivo.cl`).

---

## Paso 1 · Crear el subdominio y el SSL

1. cPanel → **Dominios** (o **Subdominios**) → crear `mayorista.distribuidoraolivo.cl`.
   Anota la **raíz del documento** que asigna cPanel (por ejemplo `/home/TU_USUARIO/mayorista.distribuidoraolivo.cl` o `/home/TU_USUARIO/public_html/mayorista`).
2. cPanel → **SSL/TLS Status** → ejecutar **AutoSSL** para el subdominio (certificado gratis). Espera a que aparezca el candado verde.

## Paso 2 · Crear la base de datos

1. cPanel → **Bases de datos MySQL**:
   - Crear base de datos: por ejemplo `portal` (cPanel la deja como `TU_USUARIO_portal`).
   - Crear usuario con una clave segura (usa el generador de cPanel). Anota usuario y clave.
   - **Agregar el usuario a la base de datos** con **TODOS LOS PRIVILEGIOS**.
2. cPanel → **phpMyAdmin** → selecciona la base `TU_USUARIO_portal` → pestaña **SQL** → pega el contenido de `sql/01-crear-tablas.sql` → **Continuar**.
   Deben aparecer las tablas `cotizaciones` y `cotizacion_items`.

## Paso 3 · Crear la casilla que envía los correos

cPanel → **Cuentas de correo** → crear `portal@distribuidoraolivo.cl` (o la que prefieras).
Se usa como remitente: si el remitente no es una casilla real del dominio, los correos suelen caer en spam.

## Paso 4 · Configuración privada (fuera de public_html)

1. cPanel → **Administrador de archivos** → ve a tu carpeta de usuario (`/home/TU_USUARIO/`, el nivel de arriba de `public_html`).
2. Crea la carpeta **`olivo-privado`** y sube ahí `config.ejemplo.php`.
3. Renómbralo a **`config.php`** y edítalo (clic derecho → Editar). Completa lo marcado con `CAMBIAR`:
   - `db` → nombre de la base, usuario y clave del Paso 2 (host: `localhost`).
   - `correo.ventas` → casilla donde deben llegar las solicitudes (la que revisan los ejecutivos).
   - `correo.remitente` → la casilla del Paso 3.
   - `origenes_permitidos` → `https://mayorista.distribuidoraolivo.cl` (o el subdominio final).
   - `sal_ip` → cualquier frase larga (se usa para anonimizar las IP).
   - `crm.url` → dejar vacío hasta que Tecnich entregue la integración con YAL CRM.

> El servicio busca `olivo-privado/config.php` subiendo carpetas desde `api/`. Funciona tanto si el subdominio está en `public_html/mayorista` como en `/home/TU_USUARIO/mayorista.distribuidoraolivo.cl`.
> Si tu hosting lo ubica en otro lugar, define la variable de entorno `OLIVO_CONFIG` con la ruta completa al `config.php`.

## Paso 5 · Subir el portal

1. **Administrador de archivos** → entra a la **raíz del documento del subdominio** (Paso 1).
2. **Cargar** → sube el `.zip` del portal (o la carpeta `portal/` comprimida) → clic derecho → **Extraer**.
3. Verifica que `index.html` quede directamente en la raíz del subdominio (no dentro de una subcarpeta `portal/`).
   Si quedó dentro de `portal/`, mueve su contenido un nivel arriba.
4. Asegúrate de que el archivo oculto `api/.htaccess` se haya subido (en el Administrador de archivos: **Configuración → Mostrar archivos ocultos**).

---

## Paso 6 · Pruebas

### 6.1 Diagnóstico
Abre `https://mayorista.distribuidoraolivo.cl/api/estado.php`. Debe responder algo así:

```json
{ "php_ok": true, "config_encontrada": true, "base_de_datos": true, "tablas": true, "correo_configurado": true, "https": true, "listo": true }
```

| Si ves… | Revisa |
|---|---|
| `config_no_encontrada` | Que exista `/home/TU_USUARIO/olivo-privado/config.php` (no `.ejemplo`) |
| `base_de_datos: false` | Nombre, usuario y clave en `config.php`; que el usuario esté agregado a la base con privilegios |
| `tablas: false` | Ejecutar `sql/01-crear-tablas.sql` en phpMyAdmin sobre la base correcta |
| `pdo_mysql: false` | cPanel → **Seleccionar versión de PHP** → activar `pdo_mysql` |

### 6.2 Prueba directa del servicio (opcional, sin el portal)
Edita `pruebas/cotizacion-ejemplo.json` (pon tu correo) y ejecútalo desde una terminal:

```bash
curl -X POST https://mayorista.distribuidoraolivo.cl/api/cotizar.php -H "Content-Type: application/json" --data @pruebas/cotizacion-ejemplo.json
```

Respuesta esperada: `{"ok":true,"codigo":"COT-2026-0001"}`.

### 6.3 Prueba completa desde el portal
1. Abre el portal, agrega 2 o 3 productos y ve a **Solicitar cotización**.
2. Envía el formulario vacío: deben aparecer los avisos en rojo junto a cada campo.
3. Complétalo con un RUT válido (ej. `76.123.456-0`) y tu correo → **Enviar**.
4. Debe aparecer la confirmación con un código **COT-2026-000X** (correlativo real, sin la palabra LOCAL).
5. Revisa:
   - La casilla de **ventas**: llega el aviso con el detalle (responder ese correo le contesta directo al cliente).
   - **Tu correo**: llega la copia con el código.
   - **phpMyAdmin**: la fila en `cotizaciones` y sus productos en `cotizacion_items`. Columnas `correo_ventas_ok` y `correo_cliente_ok` en 1.

### 6.4 Pruebas de seguridad rápidas
- `https://…/api/_comun.php` → debe dar **403 Prohibido**.
- `https://…/api/` → no debe listar archivos.
- `https://…/api/cotizar.php` abierto en el navegador (GET) → `{"ok":false,"error":"metodo_no_permitido"}`.
- Enviar 6 solicitudes seguidas → la 6.ª responde `demasiados_envios` (límite por IP en 10 minutos, configurable).

## Paso 7 · Al terminar las pruebas

- **Borra o renombra `api/estado.php`.**
- En phpMyAdmin borra las cotizaciones de prueba: `DELETE FROM cotizaciones WHERE comentarios LIKE '%prueba%';` (los productos se borran solos).
- Activa `opcional/.htaccess-raiz` (renómbralo a `.htaccess` en la raíz del subdominio) para forzar https.
- Confirma en cPanel → **Copias de seguridad** que el respaldo automático incluya archivos y base de datos.

---

## Cómo funciona (resumen técnico)

```
Portal (navegador) ──POST JSON──► api/cotizar.php
                                    ├─ valida datos (RUT con dígito verificador, correo, comuna V Región, productos)
                                    ├─ anti-spam: campo trampa + límite por IP
                                    ├─ guarda en MySQL (transacción): cotizaciones + cotizacion_items
                                    ├─ genera código correlativo COT-AAAA-NNNN
                                    ├─ correo a ventas (Reply-To = cliente) y copia al cliente
                                    └─ (opcional) reenvía JSON al CRM y guarda el resultado en estado_crm
```

- **Sin precios:** el servicio no recibe ni guarda montos.
- **Datos personales:** viajan por https, la configuración con claves está fuera de la carpeta pública, las IP se guardan anonimizadas (hash). No hay ninguna pantalla pública que liste cotizaciones: se revisan en el correo de ventas, phpMyAdmin o el CRM.
- **Campañas:** si la visita llegó desde Google Ads o con parámetros UTM, se guardan `gclid` y `utm_*` con la cotización (para medir ventas por campaña).
- **En el computador local** (sin PHP) el portal simula el código (`COT-AAAA-LOCALxxx`) para poder probar el recorrido.

## Pendientes conocidos (no bloquean la prueba)

- Teléfono oficial en el portal (`+56 9 6304 1374` vs `+56 9 7723 6128`) por confirmar con Olivo.
- ID de Google Tag Manager para medir conversiones.
- Integración con YAL CRM (Tecnich): basta poner la URL y las cabeceras en `config.php` → `crm`.
- El botón «Ver correo de confirmación» de la pantalla final muestra una vista previa simulada; el correo real lo envía el servidor.
