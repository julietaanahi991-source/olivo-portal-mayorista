# Guía de fotos de productos · Portal Olivo

*Actualizada el 31 de octubre de 2026. Versión compartible: https://claude.ai/artifact/45oFDAbFm6zToPdtDxhfsF*

## Resumen

Se necesita una foto limpia por producto, ordenada en una carpeta por categoría. Los catálogos de Canva sirven, pero la calidad final depende de cómo se exporten.

1. **Una foto por producto**, cuadrada, idealmente de 1200 × 1200 px, sin precios ni textos encima.
2. **Una carpeta por categoría**, con los nombres exactos de la sección "Carpetas por categoría" (son 7, incluida la nueva Proteínas).
3. **El nombre de cada archivo** puede ser el SKU (por ejemplo `OLV-ALM-001.jpg`) o el nombre del producto. Si no se sabe el SKU, se relaciona después.
4. **Los catálogos de Canva sirven como respaldo.** Lo mejor es exportar solo las fotos de producto; si no se puede, se manda el catálogo en PDF y se recorta cada producto.
5. **Para Proteínas** se necesita, además de las fotos, la lista de productos con marca, formato y unidad de venta (plantilla más abajo).

Todo va en `olivo-2026/fotos-productos/` (o comprimido en un .zip).

## Catálogos de Canva

Sirven, pero tal como están traen precios, porcentajes de descuento y textos encima de los productos. El portal no puede mostrar precios, así que lo ideal es sacar de Canva solo las fotos limpias.

| Opción | Cómo hacerlo en Canva | Resultado en el portal |
| --- | --- | --- |
| **A. Fotos originales** (la mejor) | En el panel izquierdo, entrar a **Cargas** (Uploads), donde están las imágenes subidas al armar el catálogo. Descargarlas desde los tres puntos de cada imagen. Si vinieron del proveedor o de un banco de imágenes, mandar esos archivos. | Foto nítida y completa, sin textos. |
| **B. Copia del catálogo sin precios** | Duplicar el diseño, borrar en la copia precios, porcentajes y títulos, y descargar en **PNG** con la mayor calidad. | Buena. Se recorta cada producto de cada página. |
| **C. Catálogo tal como está** (respaldo) | **Compartir → Descargar → PDF para imprimir**, o PNG. | Usable solo si el precio no tapa el producto. Se marcan los que hay que reemplazar. |

En B y C, si el catálogo es de una sola categoría (por ejemplo "Catálogo de Lácteos"), basta con dejarlo dentro de la carpeta de esa categoría. En los catálogos actuales (quesos, lácteos, pastas y harinas) el precio y el porcentaje tapan la parte de abajo de cada producto, por eso A o B dan mucho mejor resultado.

## Formato de las imágenes

| Requisito | Ideal | Mínimo aceptable |
| --- | --- | --- |
| Proporción | Cuadrada 1:1 | Cualquiera (se recorta) |
| Tamaño | 1200 × 1200 px | 600 × 600 px |
| Fondo | Blanco o neutro muy claro | Escena o mesa, si el producto se ve completo |
| Encuadre | Producto centrado, completo, con aire alrededor | Producto completo, sin cortes |
| Textos encima | Ninguno | Ninguno sobre el producto (ni precios, ni %, ni "C/IVA") |
| Tipo de archivo | JPG, PNG o WebP | PDF o PNG exportado de Canva |
| Peso | Cualquiera | Cualquiera (se optimiza a menos de 250 KB) |

Las fotos de las tarjetas de categoría y de los banners ya están listas. Esta guía es para las fotos de cada producto, más la tarjeta de Proteínas.

## Carpetas por categoría

```
fotos-productos/
├── alimentos/          Alimentos y abarrotes
├── sushi/              Sushi y gastronomía oriental
├── congelados/         Congelados
├── lacteos/            Lácteos y refrigerados
├── limpieza/           Limpieza y aseo
├── insumos/            Insumos para restaurantes
├── proteinas/          Proteínas (nueva)
└── catalogos-mixtos/   Catálogos de Canva con varias categorías
```

Nombre de cada archivo, en orden de preferencia:

1. El SKU: `OLV-ALM-001.jpg`.
2. El SKU y el nombre: `OLV-ALM-001-aceite-don-maravilla-5l.jpg`.
3. El nombre del producto como aparece en el catálogo: `aceite don maravilla 5 lt.jpg`.

## Nueva categoría: Proteínas

Se necesitan:

1. La lista de productos (plantilla abajo).
2. Una foto por producto en `fotos-productos/proteinas/`.
3. La foto de la tarjeta de portada, cuadrada de 1200 × 1200 px, producto en la mitad de arriba: `cat-proteinas.jpg`.
4. Confirmar subcategorías. Propuesta: Vacuno (cortes al vacío y por kilo), Cerdo, Pollo y aves, Elaborados (hamburguesas, apanados).

El "Corte de Vacuno Asado Carnicero / Vacío Importado" (`OLV-CON-007`) pasa de Congelados a Proteínas → Vacuno. Los SKU nuevos serán `OLV-PRO-001`, `OLV-PRO-002`, etc.

| Nombre del producto | Marca | Presentación (formato) | Unidad de venta | Subcategoría | Fresco, refrigerado o congelado | Archivo de la foto |
| --- | --- | --- | --- | --- | --- | --- |
| Asado Carnicero / Vacío Importado | Frigorífico Pampa | Piezas al vacío de 2,5 a 4 kg | Kilo | Vacuno | Congelado | vacio-importado.jpg |
|  |  |  |  |  |  |  |

Preguntas para Olivo:

- [ ] ¿Las proteínas se despachan frescas, refrigeradas o congeladas?
- [ ] ¿Se venden por kilo, por pieza o por caja?
- [ ] ¿Qué etiqueta corta llevará la tarjeta? Sugerencia: "Cortes seleccionados".

## Lista de productos

La lista completa con SKU por categoría está en `data/products-table.md` y en la sección 9 de `CLAUDE.md` (62 productos más el vacío importado, que pasa a Proteínas).

## Checklist de entrega

- [ ] Carpeta `fotos-productos/` con las 7 subcarpetas
- [ ] Una foto por producto, sin precios ni textos encima (o el catálogo de Canva en PNG o PDF)
- [ ] Archivos nombrados con el SKU o el nombre del producto
- [ ] Catálogos con varias categorías en `catalogos-mixtos/`
- [ ] Plantilla de Proteínas completa y subcategorías confirmadas
- [ ] Foto de la tarjeta de Proteínas (`cat-proteinas.jpg`)
