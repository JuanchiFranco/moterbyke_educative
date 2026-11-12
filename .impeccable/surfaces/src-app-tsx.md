---
version: 1
slug: "src-app-tsx"
primary_target: "src/App.tsx"
related_targets: ["src/scene/Scene.tsx","src/scene/Bike.tsx","src/styles.css"]
---

# Lección 1 · Conoce los mandos

Scope: the first interactive 3D lesson (src/App.tsx and the scene under src/scene). Visitor mode: operate.

Audience and job: a curious beginner with no motorcycle vocabulary learns the five rider controls of a manual motorbike: which hand or foot works each, what it does, the gesture, one safety note and one fact about the bike. Language: Spanish. Desktop first, usable on a phone.

Task and states: study each control in turn on a 3D bike (pending, active, learned), then a short check where the visitor finds each control on the bike without hints (right, wrong, finished). Content lives in src/lesson/controls.ts. The bike is a Yamaha R1 2020, the 3D model 'Yamaha R1' by ejsnowy (CC BY 4.0, credit shown in the bottom bar), loaded from public/models/yamaha_r1.glb. The five controls are named nodes of the model, animated on pivots computed at load; markers and camera views are computed from the model.

Chosen direction: pinned by the user on 2026-11-12: copy the design of the Honda CB 190R 2.0 product page (motos.honda.com.co/motos-honda/motos-sport/CB-190-R-20). This replaces the earlier "Folleto de concesionario" direction, which was picked from the decision page. Not copied: logos and wing mark, model wordmark, photos, video, 360 viewer, code, prices. The page presents itself as an unofficial educational project.

Unresolved: product name; whether progress is saved; later lessons.

## Direction contract

THESIS: The lesson reads as a motorbike product page: white ground, one corporate red, a spec table for each control, and a fixed bottom bar with the red action. Refuses the dark 3D viewer and any costume of the brand itself (no logo, no photos).

OWN-WORLD: White page, #F4F4F4 grey cards, ink #1D1D1D, soft ink #626262, red #CC0000 for the tab, the section underline, the active state and the primary button. Figtree Variable in weights 400 to 800. Eight-pixel radius. A red parallelogram tab marks the lesson, a short red bar underlines each panel heading, the control sheet is label and value rows, part names sit on a dark caption bar.

STORY: The visitor sees a whole blue superbike, learns that five controls and four limbs run it, watches each control make its gesture, reads one fact about that part of the R1, then proves it by finding them unaided.

FIRST VIEWPORT: White top bar with the red lesson tab and the count. Light studio field on the left with the blue bike, the lesson title set large at top left, numbered markers on the bike. Right panel 400px: five grey control cards, the active one white with a red border and its spec rows. Fixed bottom bar: bike name with model credit, five-segment red progress, Anterior and the red primary button.

FORM: User-pinned reference, no roll; seed: none (unavailable). Signature interaction: the active control performs its own gesture on the bike while its sheet fills in; the progress segments fill red. Motion grammar: camera travel between controls, one card reveal, no decorative motion. States never rely on colour alone: pending grey card, learned check, active red border and expanded sheet.

FINISH: unreviewed and undocumented is unfinished; this build ends with the finish review, the verdict, DESIGN.md, and every shipping raster carrying its provenance
