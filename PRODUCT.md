# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Stack

delegated: Vite + React + TypeScript, con Three.js mediante React Three Fiber (y drei para utilidades). Elegido porque el producto combina una escena 3D con bastante interfaz de lección alrededor (pasos, controles, progreso), y React Three Fiber mantiene ambas en un mismo modelo de componentes. El usuario delegó la elección; no hay destino de despliegue definido.

## Users

Principiantes curiosos: personas sin conocimientos previos de motos que quieren entender cómo se conduce una, por interés propio. No se asume que tengan moto, licencia ni vocabulario técnico.

## Product Purpose

Enseñar a conducir una moto mediante 3D interactivo: controles, maniobras, técnica y seguridad.

Sin decidir: qué significa éxito para el producto (por ejemplo, terminar un recorrido de lecciones, llegar preparado a una clase práctica real, o simple comprensión).

## Capabilities and Constraints

Confirmado:
- El aprendizaje ocurre sobre una representación 3D de la moto y su conducción.
- El contenido cubre controles, maniobras, técnica y seguridad.

- La lección 1 es «Conoce los mandos»: los cinco mandos de una moto manual con embrague (acelerador, freno delantero, embrague, palanca de cambios, freno trasero).
- La moto de la lección es la Yamaha R1 2020 (superdeportiva de 998 cc, 6 velocidades). El usuario pidió primero la Honda CB 190R 2.0, pero no existe un modelo 3D suyo con licencia libre; el 2026-11-12 pidió usar otra moto de alta cilindrada y eligió esta.
- El modelo 3D es «Yamaha R1» de ejsnowy (https://sketchfab.com/3d-models/yamaha-r1-7b3343ad0c0f4cbe94238c734e1b731a), licencia CC BY 4.0, descargado por el agente con la sesión del usuario en Sketchfab y guardado en public/models/yamaha_r1.glb (10,2 MB, texturas de 1k). La licencia exige crédito al autor, que aparece en la barra inferior de la lección.
- Las cinco piezas de los mandos son nodos propios del modelo (acelerador, maneta de freno, maneta de embrague, palanca de cambios, pedal de freno) y se animan sobre pivotes calculados al cargar.

Construido en la lección 1 pero no confirmado como regla del producto:
- Forma del aprendizaje: estudio guiado mando a mando seguido de una prueba sin pistas.
- Idioma: español.
- Dispositivos: pensado primero para escritorio y utilizable en móvil.

Sin decidir:
- Alcance del temario y orden de las lecciones siguientes.
- Si las lecciones futuras cubren también scooter o automática.
- Si hay simulación libre además de lecciones guiadas.
- Si hay cuentas o progreso guardado.

## Brand Commitments

El usuario pidió (2026-11-12) que el producto copie el diseño de la página de producto de la Honda CB 190R 2.0 (la moto de la lección pasó después a ser la Yamaha R1 2020, ver Capabilities) (motos.honda.com.co/motos-honda/motos-sport/CB-190-R-20): fondo blanco, tipografía Figtree, rojo corporativo #CC0000, tarjetas grises, tabla de especificaciones con título subrayado en rojo y barra fija inferior con botón rojo.

Límites acordados al aplicarlo (propuestos por el agente y confirmados por el usuario el 2026-11-12): se reproduce el lenguaje visual y la estructura, pero no se copian logotipos, escudo de alas, rótulo del modelo, fotos, vídeo, visor 360°, código ni precios, y el producto se presenta como proyecto educativo no oficial. No debe parecer ni afirmar ser un sitio de Honda.

## Evidence on Hand

El repositorio no tiene modelo 3D de la moto, contenido de lecciones, nombre de producto ni logo propios; el modelo 3D y el temario son activos que hay que producir. Los datos de la Yamaha R1 usados en la lección (998 cc, cuatro cilindros en línea, unos 199 CV, 6 velocidades, embrague multidisco asistido y antirrebote, dos discos delanteros de 320 mm y uno trasero de 220 mm con ABS) vienen del artículo de Wikipedia sobre la YZF-R1 leído el 2026-11-12; esa fuente no da cifras separadas para el modelo 2020 en varios puntos (la potencia es la de la columna 2015-2024). Si se quieren cifras oficiales del 2020 hay que sacarlas de la ficha de Yamaha.

No hay testimonios, datos de uso ni aval de ninguna autoescuela o entidad de tránsito. No afirmar que el producto sustituye la formación práctica ni que prepara para un examen oficial.

## Product Principles

1. Partir de cero: cada concepto se explica sin dar por sabido vocabulario ni experiencia previa.
2. El 3D enseña, no adorna: cada vista o interacción existe porque aclara algo que un texto o una foto no aclararía.
3. La seguridad forma parte de cada lección, no es un capítulo aparte.
4. Honestidad sobre el alcance: es comprensión previa a la práctica real, no un reemplazo de ella.
