# OLIVO Signature — Portal Digital B2B Premium
**Distribuidora Olivo | Santiago, Chile**  
Sitio de referencia corporativo: [https://distribuidoraolivo.cl/](https://distribuidoraolivo.cl/)

---

## 1. Visión General del Proyecto

**OLIVO Signature** es la plataforma digital de abastecimiento B2B desarrollada para **Distribuidora Olivo**, orientada a restaurantes, locales de sushi, minimarkets, pizzerías y empresas del canal HORECA en Chile.

### Requisito Primordial de Negocio
> **Ningún producto muestra precios en el portal público ni en el área de clientes.**  
> Los clientes seleccionan productos, formatos y cantidades, solicitan una cotización formal y reciben confirmación automática por correo. Posteriormente, un **ejecutivo comercial de Olivo** prepara una propuesta valorizada según el volumen de compra, la frecuencia y el destino logístico.

---

## 2. Identidad Visual y Branding Signature

- **Concepto:** Estética mediterránea, minimalista, delicada y de alta gama.
- **Paleta Cromática Oficial:**
  - **Verde Oliva Profundo:** `#163F32`
  - **Marfil / Crema:** `#F6F2E9`
  - **Dorado Suave / Champán:** `#C6A16C`
  - **Blanco Puro:** `#FFFFFF`
  - **Verde Bosque Acento:** `#0D261E`
- **Tipografías:** *Manrope* (encabezados modernos), *DM Sans* (interfaz y datos de lectura limpia) y toques editoriales en *Playfair Display*.

---

## 3. Arquitectura del Catálogo y Categorías Iniciales

1. **Alimentos y Abarrotes:** Aceites de freír Don Maravilla 5L/MaxiFrits 10L, Aceite Oliva Sabattini 5L, Arroces grado 2 (Coliseo, Flor de Ñiquén, Miraflores), Harinas Mont Blanc, Pastas Don Giuseppe, Salsas San Remo y RTU Pizza.
2. **Sushi y Gastronomía Oriental:** Arroz grano corto Shirakiku 9kg, Algas Nori Platinum Gold (50 hojas), Queso Crema gastronómico Milkaut 3.6kg, Reny Picot y Zanafoods 1.36kg, Panko japonés extra crujiente, Salsas de Soya, Teriyaki y Anguila Japofood, Wasabi Fuji en polvo, Jengibre encurtido Gari y esterillas Makisu.
3. **Congelados y Frutas IQF:** Camarón ecuatoriano P&D 36/40, Camarón con cáscara, Papas prefritas bastón 7mm, 10mm y 12mm Cresswell (12kg), Asado Carnicero / Vacío al vacío, y Pulpas de fruta 100% natural Río Alto (Maracuyá c/pepa y s/pepa, Mango, Frutilla, Frambuesa, Chirimoya).
4. **Lácteos y Refrigerados:** Cremas de leche gastronómicas Colún y Surlat 1L (cajas 12L), Leche entera Tottus, Mantequilla con sal Colún 250g, Queso Mozzarella Molfino 3.5kg en barra y Queso Parmesano maduro en horma 7-8kg.
5. **Limpieza y Aseo Institucional:** Lavalozas concentrados Ecol L-2000 5L y Relux 5L, Desengrasante pesado Ecol D-2000 5L, Cloro OK 5%, Limpiapisos Don Tito, Bolsas de basura alta densidad (50x70, 70x90, 80x110, 110x130), Guantes de nitrilo negro sin polvo, látex y vinilo (S/M/L), Papel toalla Nova 250m, Papel higiénico Jumbo 300m/500m y Servilletas Joker gourmet (blancas, negras y de colores 40x40).
6. **Insumos y Packaging Gastronómico:** Alusa Film PVC Japofood 300m con dispensador, Rollos PVC 45cm x 1400m industrial, Rollos térmicos para comandas y boletas 80x80 (pack 10u y caja 50u), Envases sushi box negro con tapa antivaho y bowls kraft ecológicos 1000cc.

---

## 4. Flujo de Trabajo Comercial y Roles de Usuario

La aplicación cuenta con una **Barra de Demostración Flotante** en la parte inferior para alternar de inmediato entre los 4 roles requeridos:

1. **Visitante B2B:**
   - Navegación libre por catálogo, fichas técnicas y colecciones.
   - Selección de insumos y cantidades.
   - Envío de cotización con formulario de empresa (Nombre, Razón Social, RUT, Correo, Teléfono, Comuna y Observaciones).
   - Recepción de pantalla de confirmación con número único (ej. `COT-2026-8491`).
   - Botón interactivo para ver el correo de confirmación generado.
2. **Cliente Registrado (Demostración: Sakura Sushi Bar SpA):**
   - Acceso con datos de empresa precargados.
   - Historial de solicitudes anteriores con estado.
   - Botón **«Repetir cotización»** que clona los productos anteriores al carrito en un clic.
   - Consulta de línea de crédito aprobada ($8.500.000 a 30 días) y ejecutivo comercial asignado.
3. **Ejecutivo Comercial (Matías Valenzuela):**
   - Bandeja de solicitudes de cotización recibidas.
   - Herramienta de **Valorización de Precios:** el ejecutivo visualiza los costos internos de referencia y define los precios unitarios netos cotizados al cliente, descuentos por escala y condiciones de pago.
   - Emisión formal con envío por correo simulado.
   - Generación de **Documento Formal de Cotización (Impresión / PDF)** con membrete oficial de Distribuidora Olivo.
4. **Administrador General:**
   - Panel de control de métricas y KPIs.
   - Maestro de productos y costos netos.
   - Creación de nuevos SKUs y categorías.
   - **Herramienta de Importación Masiva desde Excel / CSV** en tiempo real.

---

## 5. Instrucciones para Ejecutar Localmente

### Opción A: Con Node.js instalado en el sistema
```bash
cd olivo-signature
node server.js
```
Abre en tu navegador: **`http://localhost:3000`**

### Opción B: Con el runtime de Node v24 incluido en el entorno
```powershell
& "C:\Users\Julieta Vasquez\AppData\Local\ms-playwright-go\1.57.0\node.exe" server.js
```

---

## 6. Estructura de Archivos del Proyecto

```
olivo-signature/
├── package.json          # Configuración del paquete
├── server.js             # Servidor HTTP nativo Node.js v24 con fallback SPA
├── README.md             # Documentación técnica y comercial
└── public/
    ├── index.html        # Estructura semántica, SEO, OpenGraph y modales
    ├── css/
    │   └── styles.css    # Sistema de diseño Olivo Signature, paleta y microinteracciones
    ├── js/
    │   ├── data.js       # Base de datos con 50+ SKUs reales de Distribuidora Olivo
    │   └── app.js        # Controlador reactivo SPA, carrito sin precios, backoffice y cotizador
    └── images/           # Activos gráficos y catálogos de Distribuidora Olivo
```

---

## 7. Integración con `distribuidoraolivo.cl`

El portal está listo para ser desplegado como subdominio (`https://signature.distribuidoraolivo.cl`) o subcarpeta (`https://distribuidoraolivo.cl/signature`). No tiene dependencias de servicios externos para su funcionamiento inicial, permitiendo conectarse posteriormente a APIs transaccionales de correo (como Resend, SendGrid o AWS SES) y al ERP o sistema de facturación electrónica de Distribuidora Olivo.
