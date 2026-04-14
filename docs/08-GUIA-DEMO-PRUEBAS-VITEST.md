# Guia de Demo - Pruebas de Sistemas con Vitest

## Objetivo

Esta guia sirve para realizar una demostracion en vivo de las tecnicas de prueba de sistemas aplicadas al proyecto `El Lider`, usando `Vitest` como framework.

La demostracion esta pensada para durar entre 8 y 10 minutos y cubrir exactamente estos 3 tipos de prueba:

- Pruebas de programas con datos de prueba
- Prueba de vinculos con datos de prueba
- Prueba completa de sistemas con datos de prueba y datos reales

## Preparacion antes de exponer

- Abrir el proyecto en la terminal dentro de `C:\Users\eduar\OneDrive\Escritorio\School\IS702\el_lider`
- Tener abierto este archivo de apoyo
- Tener abierto el archivo de configuracion `vitest.config.mjs`
- Tener abierto el archivo `src/services/reports.test.ts`
- Tener lista la terminal para ejecutar comandos

## Archivos que conviene mostrar

- [vitest.config.mjs](C:/Users/eduar/OneDrive/Escritorio/School/IS702/el_lider/vitest.config.mjs)
- [src/test/vitest-setup.ts](C:/Users/eduar/OneDrive/Escritorio/School/IS702/el_lider/src/test/vitest-setup.ts)
- [src/test/supabase-queue.ts](C:/Users/eduar/OneDrive/Escritorio/School/IS702/el_lider/src/test/supabase-queue.ts)
- [src/lib/date-range.test.ts](C:/Users/eduar/OneDrive/Escritorio/School/IS702/el_lider/src/lib/date-range.test.ts)
- [src/lib/export.test.ts](C:/Users/eduar/OneDrive/Escritorio/School/IS702/el_lider/src/lib/export.test.ts)
- [src/services/reports.test.ts](C:/Users/eduar/OneDrive/Escritorio/School/IS702/el_lider/src/services/reports.test.ts)

## Comandos que usaras

### Ejecutar toda la suite

```bash
npm test
```

### Ejecutar cobertura

```bash
npm run test:coverage
```

### Ejecutar solo las pruebas de reportes

```bash
npx vitest run src/services/reports.test.ts --config vitest.config.mjs
```

### Ejecutar una sola prueba por nombre

```bash
npx vitest run src/services/reports.test.ts --config vitest.config.mjs -t "getIngredientConsumption separa consumo y rotacion por insumo"
```

## Estructura recomendada de la exposicion

### 1. Apertura

#### Que decir

Buenas tardes. En esta parte vamos a demostrar las tecnicas de prueba del sistema aplicadas a nuestro proyecto usando `Vitest`.

En nuestro caso, las pruebas estan organizadas para validar tres niveles:

- pruebas de programas con datos de prueba
- prueba de vinculos con datos de prueba
- prueba completa del sistema con datos de prueba y datos reales

Primero mostraremos una prueba individual, luego una prueba de integracion entre modulos, y finalmente una corrida completa de la suite.

#### Tiempo sugerido

1 minuto

## 2. Mostrar configuracion de Vitest

### Archivo a abrir

- [vitest.config.mjs](C:/Users/eduar/OneDrive/Escritorio/School/IS702/el_lider/vitest.config.mjs)

### Que decir

Aqui podemos ver que estamos utilizando `Vitest` como framework de pruebas.

Esta configuracion define:

- el entorno de pruebas
- los archivos de setup
- los alias del proyecto
- y la cobertura que usamos para verificar calidad

Tambien tenemos un setup especial para simular respuestas de Supabase sin depender de la base real durante las pruebas.

### Archivos de apoyo opcionales

- [src/test/vitest-setup.ts](C:/Users/eduar/OneDrive/Escritorio/School/IS702/el_lider/src/test/vitest-setup.ts)
- [src/test/supabase-queue.ts](C:/Users/eduar/OneDrive/Escritorio/School/IS702/el_lider/src/test/supabase-queue.ts)

### Que decir si los muestras

Estos archivos permiten simular datos de prueba y controlar las respuestas del sistema para verificar distintos escenarios, tanto validos como invalidos.

#### Tiempo sugerido

1 minuto

## 3. Pruebas de programas con datos de prueba

### Objetivo

Mostrar una rutina individual probada de forma aislada.

### Archivos a abrir

- [src/lib/date-range.test.ts](C:/Users/eduar/OneDrive/Escritorio/School/IS702/el_lider/src/lib/date-range.test.ts)
- [src/lib/export.test.ts](C:/Users/eduar/OneDrive/Escritorio/School/IS702/el_lider/src/lib/export.test.ts)

### Comando sugerido

```bash
npx vitest run src/lib/date-range.test.ts --config vitest.config.mjs
```

Si prefieres mostrar exportacion:

```bash
npx vitest run src/lib/export.test.ts --config vitest.config.mjs
```

### Que decir

Las pruebas de programas con datos de prueba consisten en verificar una rutina individual de forma aislada.

Aqui estamos probando una funcionalidad puntual del sistema, sin depender de otros modulos.

En este caso usamos datos de prueba para comprobar que:

- la rutina responde correctamente en un caso esperado
- y tambien que mantiene un comportamiento correcto ante variaciones del dato de entrada

### Frase de cierre de esta parte

Con este tipo de prueba validamos que cada pieza pequena del sistema funcione bien por separado antes de conectarla con otras.

#### Tiempo sugerido

2 minutos

## 4. Prueba de vinculos con datos de prueba

### Objetivo

Mostrar la interaccion entre modulos dependientes.

### Archivo a abrir

- [src/services/reports.test.ts](C:/Users/eduar/OneDrive/Escritorio/School/IS702/el_lider/src/services/reports.test.ts)

### Prueba recomendada

Buscar esta prueba dentro del archivo:

- `getIngredientConsumption separa consumo y rotacion por insumo`

### Comando sugerido

```bash
npx vitest run src/services/reports.test.ts --config vitest.config.mjs -t "getIngredientConsumption separa consumo y rotacion por insumo"
```

### Que decir

La prueba de vinculos verifica que modulos interdependientes trabajen juntos como se planeo.

En este ejemplo se relacionan varias partes del sistema:

- movimientos de inventario
- informacion de pedidos
- reglas del reporte de consumo y rotacion

Aqui ya no se prueba una sola funcion aislada, sino la forma en que varios componentes colaboran para producir un resultado correcto.

Primero se procesan datos tipicos, y luego se incorporan variaciones para comprobar que el sistema siga respondiendo correctamente.

### Frase de cierre de esta parte

Con esto demostramos que la informacion fluye bien entre modulos y que las dependencias entre ellos no generan errores en el resultado final.

#### Tiempo sugerido

3 minutos

## 5. Prueba completa de sistemas con datos de prueba y datos reales

### Objetivo

Mostrar la validacion global del sistema mediante una corrida completa.

### Archivo principal

- [src/services/reports.test.ts](C:/Users/eduar/OneDrive/Escritorio/School/IS702/el_lider/src/services/reports.test.ts)

### Comando sugerido

```bash
npm test
```

Si quieres enseñar cobertura al final:

```bash
npm run test:coverage
```

### Que decir

La prueba completa del sistema evalua el comportamiento global del sistema usando datos de prueba y, conceptualmente, tambien datos reales.

En esta parte ejecutamos varias pruebas en conjunto para verificar:

- pedidos entregados
- stock critico
- kardex
- resumen de ventas
- platillos mas vendidos
- consumo y rotacion de insumos

Esto permite comprobar que el sistema responde correctamente cuando observamos su funcionamiento de manera integral.

Respecto a los datos reales, este tipo de prueba tambien se puede complementar comparando los resultados del sistema con operaciones reales ya conocidas del negocio, por ejemplo ventas diarias, movimientos reales de inventario o pedidos ya procesados correctamente.

### Frase de cierre de esta parte

Esta es la prueba que mas se acerca al comportamiento real del sistema, porque no se limita a una rutina o a una sola integracion, sino que verifica el comportamiento del conjunto.

#### Tiempo sugerido

3 minutos

## 6. Cierre

### Que decir

En conclusion, con `Vitest` pudimos demostrar tres niveles de verificacion del sistema.

Primero, las pruebas de programas con datos de prueba, para validar rutinas individuales.

Segundo, la prueba de vinculos con datos de prueba, para comprobar que modulos relacionados trabajen correctamente entre si.

Y tercero, la prueba completa del sistema con datos de prueba y datos reales, para verificar el comportamiento global del sistema antes de su uso real.

Estas pruebas nos ayudan a detectar errores a tiempo y a aumentar la confiabilidad del sistema del Comedor `El Lider`.

Muchas gracias.

#### Tiempo sugerido

1 minuto

## 7. Guion ultra corto por minuto

### Minuto 1

- Abrir `vitest.config.mjs`
- Explicar que usan `Vitest`
- Mencionar setup y simulacion de datos

### Minuto 2 a 3

- Abrir `date-range.test.ts` o `export.test.ts`
- Ejecutar una prueba individual
- Explicar que eso corresponde a pruebas de programas con datos de prueba

### Minuto 4 a 6

- Abrir `reports.test.ts`
- Ejecutar la prueba de `getIngredientConsumption`
- Explicar que eso corresponde a prueba de vinculos con datos de prueba

### Minuto 7 a 9

- Ejecutar `npm test`
- Explicar que esa corrida representa la prueba completa del sistema
- Mencionar comparacion con datos reales del negocio

### Minuto 10

- Dar cierre
- Repetir brevemente los 3 tipos de prueba

## 8. Recomendacion final

Para que la demostracion se vea fluida:

- no abras demasiados archivos
- deja preparados los comandos en la terminal
- enfocate en una prueba clara por cada tipo
- no leas nombres tecnicos de todas las pruebas, solo las necesarias
- usa `npm test` como cierre fuerte de la demostracion
