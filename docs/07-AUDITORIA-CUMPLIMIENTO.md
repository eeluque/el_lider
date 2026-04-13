# Auditoría de cumplimiento del proyecto

Fecha de auditoría: 2026-04-12  
Alcance: app + código del repositorio actual  
Fuente de verdad principal: implementación en `src/`, soporte en `docs/` y resultado de `npm test`

## Resumen ejecutivo

La app sí tiene una base funcional sólida para un sistema transaccional web de comedor: flujo público de pedidos, cuenta de cliente, panel administrativo, inventario, reportes y exportación. El patrón dominante no es "no existe", sino `Parcial`: hay bastante implementación real, pero con inconsistencias de navegación, textos, validaciones, documentación y estandarización visual.

Hallazgos de mayor impacto:

1. Hay problemas visibles de redacción/codificación de texto en múltiples archivos (`Comedor El LÃ­der`, `MenÃº`, `ContraseÃ±a`, `Ã­tems`, etc.), lo que afecta claridad, ortografía y calidad de presentación.
2. Las validaciones existen, pero dependen sobre todo de HTML nativo y mensajes en `src/lib/form-validation.ts`; faltaban validaciones en tiempo real, reglas de longitud más completas y más validación cruzada.
3. Los reportes están bien avanzados y hay cobertura automatizada para `src/services/reports.ts`, `src/lib/date-range.ts` y `src/lib/export.ts`, pero el estado de pruebas no estaba totalmente verde al momento de la auditoría inicial.

## Matriz de cumplimiento

### 1. Interfaz y adaptación

| Tarjeta | Estado | Evidencia del repo | Acción mínima recomendada |
| --- | --- | --- | --- |
| Definir tipo de interfaz | Cumple | La solución es una app web transaccional con rutas públicas, cuenta y panel admin (`src/app/(public)`, `src/app/account`, `src/app/admin`). | Documentar en presentación que se eligió una interfaz web por tareas de consulta, captura y seguimiento en varios roles. |
| Validar adaptación de la interfaz | Parcial | Los flujos principales sí existen y `employee` reutiliza la experiencia de `admin`, pero la adaptación por rol depende de restricciones de acceso y visibilidad que deben revisarse pantalla por pantalla. | Auditar cada flujo crítico contra tareas reales y validar permisos/visibilidad por rol. |
| Revisar títulos de pantallas | Parcial | Varias páginas tienen `h1`, pero no hay una convención global y algunos encabezados varían entre "Dashboard", "Panel", "Lista de Insumos" o cabeceras muy custom. | Definir una guía de títulos por módulo y aplicarla en todas las páginas. |
| Uniformar ubicación de elementos | Parcial | En admin hay cierta consistencia, pero varios reportes usan cabeceras y composiciones distintas (`delivered-orders-daily`, `inventory-kardex`, `cancelled-orders`). | Establecer un layout base para reportes con posición fija de título, filtros, exportación y tabla. |
| Estandarizar navegación | Parcial | `AdminSidebar` está bien estructurado, pero había duplicidad de accesos en `PublicNav` y diferencias terminológicas entre menú público y panel. | Unificar la navegación pública/admin y la terminología visible. |
| Estandarizar fuentes y tamaños | Parcial | El layout usa `Geist`, pero varios reportes fuerzan estilos y familias distintas vía CSS inline (`inventory-kardex`). | Centralizar tipografía y escalas de texto en estilos compartidos. |
| Estandarizar colores y colorimetría | Parcial | Hay una paleta café/dorado dominante, pero con muchos colores hardcodeados y variantes especiales por reporte. | Llevar colores a tokens/CSS variables y reducir estilos inline. |
| Revisar uso de tecla ESC | No aplica | No hay modales ni diálogos complejos donde ESC sea una expectativa central. | Mantener fuera de alcance hasta introducir overlays o modales. |

### 2. Claridad de textos y terminología

| Tarjeta | Estado | Evidencia del repo | Acción mínima recomendada |
| --- | --- | --- | --- |
| Revisar claridad de textos | Parcial | Hay textos útiles en formularios y paneles, pero también frases mezcladas y etiquetas poco uniformes. | Hacer una pasada global de copy por módulo con criterio de claridad y brevedad. |
| Revisar significado de códigos | Parcial | Se usan códigos entendibles como `ORD-XXXXXX`, pero también enums técnicos como `IN`, `OUT`, `ADJUSTMENT` y estados internos. | Mostrar etiquetas de negocio en UI y reservar códigos técnicos para backend/exportes técnicos. |
| Verificar instrucciones al usuario | Parcial | Algunas vistas explican el flujo (`Registrar pedido manual`, `Registrar movimiento`), pero no todos los formularios indican claramente qué hacer o qué formato esperar. | Agregar ayudas cortas en formularios críticos y filtros de reportes. |
| Estandarizar terminología | Parcial | Conviven "Menu"/"Menú", "Dashboard"/"Panel", "platillo"/"producto", "orden"/"pedido". | Crear un glosario mínimo y aplicarlo en navegación, títulos, botones y docs. |
| Revisar ortografía y redacción | No cumple | Hay mojibake y acentos rotos en varias vistas y docs (`LÃ­der`, `ContraseÃ±a`, `Ã­tems`, `Ã³rdenes`). | Normalizar codificación UTF-8 y corregir ortografía visible antes de la presentación. |
| Evitar mensajes ambiguos | Parcial | Muchos mensajes son específicos, pero aún hay genéricos como "Error al crear la cuenta. Intenta de nuevo." o "No se pudo registrar el pedido." | Mantener los mensajes concretos e incluir causa/acción cuando sea posible. |

### 3. Eficiencia de entrada y navegación

| Tarjeta | Estado | Evidencia del repo | Acción mínima recomendada |
| --- | --- | --- | --- |
| Reducir escritura manual | Parcial | Ya hay `select` para insumos, tipos y platillos, pero aún se capturan manualmente teléfonos, categorías y varios datos repetitivos. | Cambiar campos repetitivos a selecciones o sugerencias donde aplique. |
| Configurar valores predeterminados | Parcial | Hay defaults útiles como nombre en checkout, tipo `OUT`, checkboxes activos y cantidades iniciales. | Ampliar defaults a categorías, filtros y datos de cliente conocidos. |
| Reutilizar datos almacenados | Parcial | Checkout reutiliza nombre de sesión y el sistema reaprovecha catálogo/ingredientes existentes. | Reusar también teléfono y otros datos de cliente autenticado cuando existan. |
| Implementar listas y opciones | Parcial | Se usan listas y checkboxes en inventario, pedidos manuales y formularios admin. | Reemplazar más entradas libres donde ya existe catálogo o conjunto cerrado. |
| Optimizar pulsaciones y pasos | Parcial | El panel y los formularios principales son razonables, pero hay rutas duplicadas y algunos procesos siguen siendo manuales. | Reducir pasos en captura de pedidos e inventario con datos precargados y accesos directos. |
| Revisar manejo de cursor/foco | Parcial | El orden DOM de los formularios es lógico y no hay `tabIndex` problemáticos, pero no hay verificación explícita de foco. | Probar tabulación real y documentar incidencias por formulario. |
| Definir control del cursor | Parcial | No hay control activo de foco, solo navegación natural del navegador. | Agregar `autoFocus` o manejo de foco solo donde reduzca fricción real. |
| Implementar listas y opciones para reducir errores | Parcial | Las listas ya reducen errores en movimientos y pedidos manuales, pero no cubren todo el input repetitivo. | Priorizar listas en teléfonos, categorías y motivos cuando haya reglas cerradas. |
| Reutilizar datos almacenados para evitar reingreso | Parcial | Hay ejemplos puntuales, no una estrategia general. | Incorporar autocompletado para cliente y filtros persistentes por módulo. |
| Estandarizar navegación entre módulos | Parcial | La experiencia admin está bien encaminada, pero aún requiere una revisión por rol para confirmar consistencia de permisos y accesos visibles. | Alinear menú, permisos y estructura visible en una sola experiencia coherente. |

### 4. Mensajes, retroalimentación y validaciones

| Tarjeta | Estado | Evidencia del repo | Acción mínima recomendada |
| --- | --- | --- | --- |
| Revisar línea de estado o mensajes de estado | Parcial | Hay estados de carga, mensajes vacíos y confirmaciones puntuales, pero no una capa consistente de feedback por acción/proceso. | Estandarizar mensajes de carga, vacío, éxito y error por patrón de formulario/listado. |
| Implementar mensajes de éxito | Parcial | Existen en inventario, pedido manual, login registrado y checkout. | Llevar el mismo patrón a todas las operaciones CRUD relevantes. |
| Implementar mensajes de error | Parcial | El sistema devuelve errores claros en varias acciones server/client, pero no de forma uniforme en todos los módulos. | Unificar estilo y nivel de detalle de errores. |
| Implementar validación en tiempo real | No cumple | `src/lib/form-validation.ts` actúa sobre `onInvalid` y limpia en `onInput`, pero no anticipa errores antes del submit. | Agregar validación reactiva en campos críticos antes de enviar formularios. |
| Notificar procesos en curso | Parcial | Hay `loading` en login/checkout y `Suspense` con `Cargando...`, pero no en todas las acciones largas. | Añadir indicadores de envío/carga en formularios y reportes con fetch costoso. |
| Confirmar formularios completados | Parcial | Algunos formularios devuelven `success`, checkout muestra pedido registrado y register redirige al login. | Homologar todas las confirmaciones con texto claro y estado visual consistente. |
| Validar datos faltantes | Cumple | Hay `required` y mensajes en español en los formularios principales. | Mantener la regla y revisar cualquier formulario nuevo con el mismo estándar. |
| Validar longitud de campos | No cumple | Solo hay una regla explícita fuerte para contraseña mínima; faltan `minLength`/`maxLength` en múltiples entradas. | Definir longitudes por campo y aplicarlas en UI y acciones server. |
| Validar clase o composición | Parcial | Existen `type="email"`, `type="number"` y algunas restricciones nativas, pero no patrones más finos para teléfono u otros textos. | Añadir patrones y sanitización para campos con formato conocido. |
| Validar rango o sensatez | Parcial | Cantidades y stock sí tienen `min`/`step`, pero faltan más reglas de negocio visibles para fechas, teléfonos y otros límites. | Consolidar reglas de rango por campo y reflejarlas también en backend. |
| Validar valores inválidos | Parcial | Se valida disponibilidad de platillos, rol autorizado y cantidades positivas. | Completar reglas de negocio por formulario y mensajes específicos por caso. |
| Implementar referencias cruzadas | No cumple | No se observan validaciones intercampo fuertes como consistencia entre campos dependientes o controles de duplicado en formularios. | Agregar validaciones cruzadas donde haya relaciones entre campos o catálogos. |
| Comparar con datos almacenados | Parcial | Ya se compara correo existente, disponibilidad de menú y datos para reportes. | Extender comparaciones a duplicados, stock y consistencia de inventario. |
| Evaluar autovalidación | No aplica | No se usa una estrategia de códigos autovalidables como requisito central del dominio actual. | Mantener fuera de alcance salvo que se formalicen códigos con checksum. |

### 5. Codificación e identificadores

| Tarjeta | Estado | Evidencia del repo | Acción mínima recomendada |
| --- | --- | --- | --- |
| Identificar campos con codificación | Cumple | Se identifican `order_number`, `OrderStatus`, `InventoryMovementType`, roles y rutas/reportes. | Documentar estos identificadores como parte del modelo funcional. |
| Aplicar codificación adecuada | Parcial | `generateOrderNumber()` usa `ORD-` + timestamp base36, legible pero no necesariamente secuencial ni explicable académicamente. | Definir si el código de pedido debe ser secuencial o mantener el actual con una justificación clara. |
| Justificar codificación usada | Parcial | La intención es inferible desde `src/services/orders.ts`, pero no está formalizada en una nota de diseño. | Agregar una breve justificación técnica en docs del proyecto. |
| Validar simplicidad de códigos | Parcial | `ORD-XXXXXX` es simple, pero enums como `IN`/`OUT`/`ADJUSTMENT` se exponen sin siempre traducirse al usuario. | Presentar etiquetas humanas de forma consistente y reservar códigos técnicos al sistema. |
| Confirmar que los códigos sean entendibles para el usuario | Parcial | En reportes ya se traducen algunos valores, pero no de manera uniforme en todas las vistas. | Revisar todas las tablas/listados y traducir cualquier código visible al usuario final. |

### 6. Reportes, consultas y funcionamiento general

| Tarjeta | Estado | Evidencia del repo | Acción mínima recomendada |
| --- | --- | --- | --- |
| Completar reportes requeridos | Parcial | Existen reportes admin de entregados, stock crítico, kardex y cancelados; también analítica de ventas, top platos y consumo. | Validar contra la lista oficial del curso y contra la matriz de acceso por rol. |
| Corregir reportes según retroalimentación | No verificable | No hay insumo de retroalimentación de Unidad 2 dentro del repo. | Reauditar esta tarjeta cuando se comparta la retroalimentación externa. |
| Revisar formato de reportes | Parcial | Los reportes tienen diseño trabajado y exportación, pero con estilos muy distintos entre sí y con texto roto. | Estandarizar layout, tipografía, colores y textos de reportes. |
| Completar consultas requeridas | Parcial | `src/services/reports.ts` cubre consultas importantes, pero la documentación aún promete rutas y reportes por rol no implementados. | Cerrar la brecha entre consultas reales, rutas expuestas y documentación. |
| Corregir consultas según retroalimentación | No verificable | La retroalimentación previa no está disponible en el repositorio. | Retomar cuando exista evidencia externa concreta. |
| Probar funcionamiento de consultas | Parcial | Hay pruebas automatizadas para servicios de reportes y utilidades, pero no pruebas end-to-end ni estado 100% verde. | Corregir la prueba fallida y ampliar verificación manual/automatizada por flujo. |
| Preparar evidencia de reportes | No verificable | El repo no contiene capturas, PDFs de muestra ni carpeta de evidencia final. | Generar una carpeta de evidencias o material de demo cuando se cierre la auditoría técnica. |
| Preparar evidencia de consultas | No verificable | Hay capacidad de exportar y probar, pero no evidencia preparada para exposición. | Guardar salidas representativas de consultas/reportes ya validadas. |
| Revisar funcionamiento general | Parcial | El proyecto corre pruebas y tiene cobertura documentada, pero `npm test` no pasa completo al 2026-04-12 por un fallo en `src/lib/export.test.ts`. | Restaurar el estado verde de pruebas y hacer una pasada funcional manual por flujos críticos. |
| Explicar objetivo del sistema | No aplica | Esta pasada audita app y código, no materiales de defensa oral. | Mover a una auditoría de presentación o documentación académica. |
| Explicar módulos del sistema | No aplica | Fuera del alcance actual, aunque la estructura del proyecto sí permite derivarlo después. | Prepararlo en una siguiente etapa basada en la app auditada. |
| Explicar decisiones de diseño | No aplica | El código contiene evidencia, pero no se auditó aquí la narrativa de defensa. | Elaborar una nota de justificación una vez cerradas las brechas técnicas. |
| Preparar ejemplos para defensa | No aplica | No corresponde a esta pasada centrada en implementación. | Resolver al preparar demo/presentación. |
| Preparar respuestas a preguntas | No aplica | No es verificable desde código solamente. | Dejar para la fase de defensa. |
| Ensayar defensa del proyecto | No aplica | No forma parte de la auditoría técnica del repo. | Tratar en una sesión separada. |
| Preparar demo final | No aplica | No hay material de demo empaquetado en el repo. | Hacerlo al final, con base en la versión ya corregida. |
| Preparar respaldo de presentación | No aplica | No hay material alterno cargado en el repo. | Resolver cuando se produzcan capturas, PDF o video. |

## Plan de acción priorizado

### Prioridad alta

1. Corregir codificación y redacción visible en UI y documentación.
   Evidencia: textos rotos en layout, navegación, formularios, reportes y README.
   Cambio mínimo: normalizar archivos a UTF-8 y hacer una pasada de copy para acentos, ortografía y términos.
   Validación esperada: ninguna vista o doc debe mostrar mojibake ni términos inconsistentes.

2. Alinear documentación, rutas y navegación real.
   Evidencia: `docs/04-ROUTES-LIST.md` y `CreateEmployeeForm` prometen acceso a `/employee`, pero ese módulo no está implementado como flujo navegable completo.
   Cambio mínimo: o se implementan las rutas faltantes o se actualizan docs y textos para reflejar el sistema real.
   Validación esperada: no debe existir ninguna ruta/documento importante que prometa un flujo inexistente.

3. Fortalecer validaciones de formularios.
   Evidencia: predominan `required`, tipos nativos y validación al invalidar; faltan reglas de longitud, patrones y validación en tiempo real.
   Cambio mínimo: definir reglas por campo crítico y aplicarlas en UI + acciones server.
   Validación esperada: el usuario recibe retroalimentación antes del submit y el backend rechaza entradas inválidas de forma consistente.

4. Recuperar estado verde de pruebas.
   Evidencia: `npm test` falló el 2026-04-12 en `src/lib/export.test.ts`.
   Cambio mínimo: alinear test e implementación de `formatReportPeriodSubtitle`.
   Validación esperada: `npm test` debe pasar completo.

### Prioridad media

5. Estandarizar layout de reportes.
   Evidencia: hay reportes visualmente buenos pero heterogéneos en títulos, filtros, cabeceras y tipografía.
   Cambio mínimo: crear un patrón común para banner, filtros, exportación, tabla y vacíos.
   Validación esperada: cualquier reporte nuevo o existente debe sentirse parte del mismo sistema.

6. Mejorar eficiencia de captura.
   Evidencia: todavía hay escritura manual en teléfonos, categorías y algunos datos reingresados.
   Cambio mínimo: añadir defaults, autocompletado y más listas donde ya existan catálogos.
   Validación esperada: menos escritura y menos errores en tareas frecuentes.

7. Traducir o encapsular códigos técnicos visibles.
   Evidencia: algunos estados y tipos aún aparecen como códigos de sistema.
   Cambio mínimo: mapear enums a etiquetas de negocio en todas las vistas.
   Validación esperada: el usuario final no necesita interpretar abreviaturas técnicas.

### Prioridad baja

8. Evaluar mejoras de foco y accesibilidad de teclado.
   Evidencia: no hay señales graves, pero tampoco una estrategia explícita de foco.
   Cambio mínimo: probar tabulación real y ajustar solo puntos de fricción.
   Validación esperada: el flujo con teclado es natural en formularios críticos.

## Próximo paso sugerido

Convertir primero las brechas de prioridad alta en tareas de implementación. El orden recomendado es:

1. Textos y codificación UTF-8.
2. Rutas/docs/navegación.
3. Validaciones.
4. Pruebas.

Después de eso, conviene hacer una segunda auditoría corta para reclasificar varias tarjetas `Parcial` a `Cumple`.
