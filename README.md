# Conoce la motocicleta

Curso interactivo en 3D para principiantes, solo informativo (sin examen). Cada tema se estudia sobre una moto 3D que resalta la pieza de la que se habla y, en los mandos, la mueve.

- **Lección 1 · Conoce la motocicleta:** tipos de moto, chasis y suspensión, motor y transmisión, ruedas y llantas, frenos, dirección y manillar, cilindrada, potencia y peso, y tablero y testigos.
- **Lección 2 · Mandos y postura:** acelerador, freno delantero, embrague, palanca de cambios, freno trasero, direccionales, pito y luces, y la postura de conducción.

Los textos siguen la «Guía de estudio y práctica 2026» (capítulos 03 y 04). El resto de la guía (normativa, señales, conducción, mantenimiento) se irá añadiendo; sus capítulos de examen y simulacro no se implementan.
Proyecto educativo, no oficial. No está afiliado a Honda ni a Yamaha. El diseño de la interfaz se inspira en la estructura y el estilo de una página de producto de moto; no usa logotipos, fotos, vídeo ni código de ninguna marca.

## Cómo ejecutarlo

```bash
npm install
npm run dev
```

Abre http://localhost:5173. Para compilar: `npm run build`.

Hecho con Vite, React, TypeScript, Three.js y React Three Fiber.

## Motos

Un selector permite estudiar las lecciones sobre cinco motos (el enlace admite `?moto=` con `r1`, `vespa`, `naked125`, `fz16` o `ninja650`). La Yamaha R1 trae las piezas por separado y es la única cuyos mandos se mueven; en las demás se resaltan las piezas que el modelo permite señalar y la lección avisa de que los mandos pueden ser otros.

## Créditos

Modelos 3D de Sketchfab, todos con licencia [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/) (en `public/models/`):

- [«Yamaha R1»](https://sketchfab.com/3d-models/yamaha-r1-7b3343ad0c0f4cbe94238c734e1b731a) de ejsnowy.
- [«Worn Out Old School Vespa»](https://sketchfab.com/3d-models/worn-out-old-school-vespa-358a77040c53419b9bb50c462a160e6f) de Jakob_Forseth.
- [«125cc Naked Motorcycle»](https://sketchfab.com/3d-models/125cc-naked-motorcycle-c8c2a4c00c464c99969b1fc7503b14d2) de Peter Tilley.
- [«Yamaha Motorcycle Fz 16»](https://sketchfab.com/3d-models/yamaha-motorcycle-fz-16-c522b1bae9c2425db12d435ecb5e8783) de Javier.Herrera.
- [«Kawasaki Ninja 650»](https://sketchfab.com/3d-models/kawasaki-ninja-650-a0fcb1b23e6948639a09d804939f7c70) de alban (fotogrametría; se recorta el suelo que trae).
- Tipografía: Figtree, vía `@fontsource-variable/figtree`.

Los textos de la lección no han sido revisados por ningún instructor de conducción: son comprensión previa a la práctica real, no la sustituyen.