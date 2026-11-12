# Conoce la motocicleta

Curso interactivo en 3D para principiantes, solo informativo (sin examen). Cada tema se estudia sobre una moto 3D que resalta la pieza de la que se habla y, en los mandos, la mueve.

Son 15 lecciones, una por capítulo de la «Guía de estudio y práctica 2026»; el selector de la barra inferior permite saltar entre ellas y el enlace admite `?leccion=N&tema=M`:

1. Conoce la motocicleta · 2. Mandos y postura · 3. Ruta de aprendizaje y licencia · 4. Física sencilla del manejo · 5. Protección y equipo · 6. Revisión antes de salir · 7. Aprender a manejar paso a paso · 8. Maniobras esenciales · 9. Señales de tránsito y demarcaciones · 10. Conducción defensiva · 11. Curvas, pendientes, lluvia y noche · 12. Carga, pasajero y ruta · 13. Mantenimiento y cuidado · 14. Incidentes, primeros auxilios y convivencia · 15. Consulta rápida.

Las lecciones 1 y 2 se estudian sobre la moto 3D. Las demás usan escenarios 3D hechos en código (carretera, patio de práctica, señales, intersección, rotonda, curva, lluvia, noche, incidente…) donde el tema activo se resalta; son esquemas pedagógicos, no medidas ni señales oficiales. Los capítulos de examen y simulacro (16 a 18) no se implementan: la educación es solo informativa.
Proyecto educativo, no oficial. No está afiliado a Honda ni a Yamaha. El diseño de la interfaz se inspira en la estructura y el estilo de una página de producto de moto; no usa logotipos, fotos, vídeo ni código de ninguna marca.

## Cómo ejecutarlo

```bash
npm install
npm run dev
```

Abre http://localhost:5173. Para compilar: `npm run build`.

Hecho con Vite, React, TypeScript, Three.js y React Three Fiber.

## Motos

Un selector permite estudiar las lecciones sobre tres motos (el enlace admite `?moto=` con `r1`, `vespa` o `fz16`). Solo hay motos cuyo modelo permite señalar sus partes: la Yamaha R1 trae las piezas por separado y es la única cuyos mandos se mueven; en la Vespa y la FZ 16 se resaltan las piezas que el modelo permite señalar y la lección avisa de que los mandos pueden ser otros.

## Créditos

Modelos 3D de Sketchfab, todos con licencia [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/) (en `public/models/`):

- [«Yamaha R1»](https://sketchfab.com/3d-models/yamaha-r1-7b3343ad0c0f4cbe94238c734e1b731a) de ejsnowy.
- [«Worn Out Old School Vespa»](https://sketchfab.com/3d-models/worn-out-old-school-vespa-358a77040c53419b9bb50c462a160e6f) de Jakob_Forseth.
- [«Yamaha Motorcycle Fz 16»](https://sketchfab.com/3d-models/yamaha-motorcycle-fz-16-c522b1bae9c2425db12d435ecb5e8783) de Javier.Herrera.
- Tipografía: Figtree, vía `@fontsource-variable/figtree`.

Los textos de la lección no han sido revisados por ningún instructor de conducción: son comprensión previa a la práctica real, no la sustituyen.