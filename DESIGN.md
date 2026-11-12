---
name: Guía de estudio y práctica 2026 · Lecciones de moto
description: A white product-sheet lesson series in one corporate red, grey cards and Figtree, wrapped around a choice of three light-studio glTF motorbikes whose own textures carry all of their colour.
colors:
  red: "#cc0000"
  red-deep: "#a80000"
  bike-highlight: "#ff1a1a"
  ink: "#1d1d1d"
  ink-soft: "#626262"
  white: "#ffffff"
  card-grey: "#f4f4f4"
  track-grey: "#ebebeb"
  hairline: "#e0e0e0"
  hairline-strong: "#bdbdbd"
  studio-top: "#f6f6f7"
  studio-bottom: "#e4e5e7"
  studio-scene: "#dfe0e2"
typography:
  display:
    fontFamily: "Figtree Variable, Figtree, system-ui, sans-serif"
    fontSize: "clamp(2rem, 4vw, 3.5rem)"
    fontWeight: 800
    lineHeight: 1.02
    letterSpacing: "-0.025em"
  headline:
    fontFamily: "Figtree Variable, Figtree, system-ui, sans-serif"
    fontSize: "1.375rem"
    fontWeight: 800
    lineHeight: 1.1
  title:
    fontFamily: "Figtree Variable, Figtree, system-ui, sans-serif"
    fontSize: "1.125rem"
    fontWeight: 700
    lineHeight: 1.45
  body:
    fontFamily: "Figtree Variable, Figtree, system-ui, sans-serif"
    fontSize: "1rem"
    fontWeight: 400
    lineHeight: 1.45
  label:
    fontFamily: "Figtree Variable, Figtree, system-ui, sans-serif"
    fontSize: "0.875rem"
    fontWeight: 800
    lineHeight: 1.45
  credit:
    fontFamily: "Figtree Variable, Figtree, system-ui, sans-serif"
    fontSize: "0.8125rem"
    fontWeight: 400
    lineHeight: 1.45
rounded:
  xs: "4px"
  sm: "6px"
  md: "8px"
  pill: "50%"
spacing:
  xs: "6px"
  sm: "10px"
  md: "16px"
  lg: "24px"
  xl: "32px"
components:
  button-primary:
    backgroundColor: "{colors.red}"
    textColor: "{colors.white}"
    rounded: "{rounded.md}"
    padding: "12px 28px"
    height: "48px"
  button-primary-hover:
    backgroundColor: "{colors.red-deep}"
  button-secondary:
    backgroundColor: "{colors.white}"
    textColor: "{colors.ink}"
    rounded: "{rounded.md}"
    padding: "12px 28px"
    height: "48px"
  button-secondary-hover:
    backgroundColor: "{colors.card-grey}"
  card-topic:
    backgroundColor: "{colors.card-grey}"
    textColor: "{colors.ink}"
    rounded: "{rounded.md}"
  card-topic-active:
    backgroundColor: "{colors.white}"
    textColor: "{colors.ink}"
    rounded: "{rounded.md}"
  tab-lesson:
    backgroundColor: "{colors.red}"
    textColor: "{colors.white}"
    padding: "0 36px 0 32px"
  link-lesson:
    backgroundColor: "{colors.white}"
    textColor: "{colors.ink-soft}"
    padding: "0 20px"
  link-lesson-hover:
    textColor: "{colors.red}"
  bike-picker:
    backgroundColor: "{colors.white}"
    textColor: "{colors.ink}"
    rounded: "{rounded.md}"
    padding: "8px 12px"
    height: "44px"
  loading-pill:
    backgroundColor: "{colors.white}"
    textColor: "{colors.ink-soft}"
    rounded: "{rounded.md}"
    padding: "8px 16px"
  caption-bar:
    backgroundColor: "{colors.ink}"
    textColor: "{colors.white}"
    rounded: "{rounded.sm}"
    padding: "5.6px 12px"
  model-credit:
    backgroundColor: "{colors.white}"
    textColor: "{colors.ink-soft}"
    typography: "{typography.credit}"
---

# Design System: Guía de estudio y práctica 2026 · Lecciones de moto

## Overview

**Creative North Star: "The Product Sheet"**

The app reads as a motorbike product page: a white ground, one corporate red, grey cards that open into label-and-text spec rows, a bike selector at the head of the panel, and a fixed bottom bar carrying the chosen bike's name, its credit and the red action. The 3D bike sits in a light studio field rather than a dark viewer, so the page and the object share one daylight. The language (white, red, grey, Figtree, underlined headings, bottom bar) follows the structure and style of a commercial motorbike product page, but the product is an unofficial educational project and carries no third-party logo, wing mark, wordmark, photo, video, code or price (PRODUCT.md, Brand Commitments).

The visitor picks one of three bikes (Yamaha R1 2020 by default, a classic Vespa, a Yamaha FZ 16) from a native list; the choice is mirrored in the URL as `?moto=id` and every lesson works on any of them. Only the R1 has separable controls that animate; on the others the controls topics carry an 'Ojo' notice row.

The content is a set of lessons held as data (currently "Conoce la motocicleta", 8 topics, and "Mandos y postura", 7 topics). Every lesson uses the same shell: three phases (intro, learn one topic at a time, a done review where any card or bike marker can be revisited), informational only, no quiz, score or exam. The shell must hold any number of topics and any number of rows per topic. Density is calm and tabular. Red is rationed to the places that mean "this is where you are or what you do next". The interface is white, grey and near-black ink; the bike is the only place with other colour, and that colour belongs to the downloaded model's own textures. Motion is camera travel between topics, the gesture of the five rider controls on the bike, one card reveal and the progress fill; nothing decorative.

**Key Characteristics:**
- White page, grey cards, one red accent (#CC0000), near-black ink.
- Figtree Variable throughout, heavy 800 for headings, 400 to 700 for reading.
- A single 8px radius; the parallelogram tab is the only angled form.
- Spec rows (label above text, hairline between) for every topic's sheet, in any number.
- Lesson switching lives in the top bar: one red tab for the open lesson, plain soft-ink buttons for the others.
- State is never colour alone: number, check, border, fill, scale.
- Bike choice is one plain native select at the top of the panel, styled like the rest (hairline border, 8px radius), never a gallery or carousel.
- The bike is a glTF model lit by code-made studio panels; the interface never recolours it except to tint the active topic's model parts red.

## Colors

A white-and-grey ground with one corporate red and near-black ink; the red appears on a few small, meaningful parts. The bike brings its own colour from its textures.

### Primary
- **Corporate Red** (`{colors.red}`): the open-lesson tab, hover colour of the other lesson buttons, the short bar under the panel heading, the active card border and number, the active marker, filled progress segments, the primary button, the bottom hairline of the top bar, link hover in the credit line, text selection and caret.
- **Pressed Red** (`{colors.red-deep}`): primary button hover only.
- **Bike Highlight** (`{colors.bike-highlight}`): not an interface colour. It is the tint applied in the 3D scene (with emissive intensity 0.7) to the active topic's model nodes so they read as red under studio light. It is a brighter, more saturated sibling of Corporate Red and does not match it; see the Highlight Stays in the Scene Rule.

### Neutral
- **Ink** (`{colors.ink}`): body and heading text, seen markers and check badges, seen card numbers, focus ring, dark caption bars (at 92% opacity), secondary button border, marker border at rest, bike-picker text and its hover border.
- **Soft Ink** (`{colors.ink-soft}`): inactive lesson buttons, secondary lines, status text, hints, disabled labels, pending card numbers, the model credit and its links, the subtitle, the loading pill text.
- **White** (`{colors.white}`): page, top bar, panel, bottom bar, active card, markers at rest, the field hint chip, the loading pill, the bike-picker field, and the halo behind the title.
- **Card Grey** (`{colors.card-grey}`): topic cards at rest, hover fill of the secondary button.
- **Track Grey** (`{colors.track-grey}`): unfilled progress segments.
- **Hairlines** (`{colors.hairline}`, `{colors.hairline-strong}`): panel edge, spec-row dividers, hint chip border, card hover border, scrollbar, disabled button border, bike-picker border, loading pill border.
- **Studio Ground** (`{colors.studio-top}` to `{colors.studio-bottom}`): the radial gradient behind the 3D canvas, brightest low-centre. `{colors.studio-scene}` is the background of the code-made lighting environment, not a page surface.

### Named Rules
**The Red Means Here-or-Next Rule.** Red marks the current place (open-lesson tab, active card, active marker, filled progress), the next action (primary button), the hover on a lesson button, plus the heading underline. It is not used for decoration or body emphasis.

**The Highlight Stays in the Scene Rule.** Bike Highlight tints only the active topic's model nodes in the canvas. Interface elements use Corporate Red; do not use the highlight value in CSS, and do not tint any other bike part.

## Typography

**Display Font:** Figtree Variable (with Figtree, system-ui, sans-serif), self-hosted via @fontsource-variable/figtree (wght axis).
**Body Font:** Figtree Variable, same stack.

**Character:** One humanist geometric sans doing everything; hierarchy comes from weight (800 against 400 to 600) and size, not from a second family.

### Hierarchy
- **Display** (800, clamp(2rem, 4vw, 3.5rem), 1.02, -0.025em): the title over the 3D field (the lesson title in intro, the topic name while learning, "Terminaste «lesson title»" when done), max 16em, balanced wrap, with a white text-shadow halo. Compact: clamp(1.5rem, 7vw, 2.25rem), set above the canvas.
- **Headline** (800, 1.375rem, 1.1): panel heading with its red bar ("Temas", "Repaso" when done); also the bike name in the bottom bar. Compact panel heading: 1.125rem.
- **Title** (700, 1.125rem): lesson title in the top bar, topic name on a card, card number (800, 1.5rem).
- **Body** (400 to 500, 1rem, 1.45): spec-row text; subtitle (500, 1.0625rem, soft ink, max 34rem).
- **Label** (800, 0.875rem): spec-row labels and the 'Moto' picker label (the picker value is 600 at 1rem); tag line and hint at 0.875rem regular in soft ink; caption bars 700 at 0.9375rem; button text 600 at 1rem; lesson tab 700 and lesson buttons 600 at 1rem; top-bar status 0.9375rem tabular figures.
- **Credit** (400, 0.8125rem, soft ink): the unofficial-project and model credit line under the bike name, links underlined (offset 2px).

### Named Rules
**The Weight Does the Work Rule.** Rank by weight and size inside Figtree; do not introduce a second family or letter-spaced uppercase labels.

**The Halo Keeps Text Legible Rule.** Text that sits over the 3D canvas gets a white glow (`text-shadow: 0 0 0.5rem #fff, 0 0 1.25rem rgb(255 255 255 / 0.95)`), never a dark or offset shadow. Text outside the canvas needs none.

## Layout

A four-area grid: top bar (3.75rem), 3D field (flexible), topic panel (25rem, i.e. 400px, right), fixed bottom bar (5.25rem). The page is exactly one viewport tall (100dvh); the panel scrolls internally and the active card is scrolled into view, so lists of 7 or 8 cards and sheets of any row count fit. Spacing is a loose rem rhythm: 0.375 to 0.75rem inside components, 1 to 1.5rem panel and card gutters, 2 to 2.5rem field and bar gutters. Cards stack with 0.625rem gaps. The panel opens with the bike picker (label above a full-width list, 1.25rem below it; 0.75rem on compact), then the heading and cards. The title floats over the canvas at top-left (2rem from top, 2.5rem from the sides); camera views are computed from the model per topic, with a shared overview for intro and for topics without model nodes.

The top bar groups the lesson buttons at the left (tab and links flush to the bar edge), then the lesson title, then the status pushed right.

Below 60rem the grid becomes a single column: bar (3.25rem), field (13 to 15rem minimum, 36 to 40dvh), panel, bottom bar. The title leaves the 3D field and sits above the canvas; the field hint and the bar's lesson title are hidden (lesson buttons stay), and the bottom bar's model block keeps only its credit line (the CC BY attribution of the chosen bike must stay visible), set small and centred under the buttons; the progress stripe moves to its own full-width row above the two buttons; inactive cards collapse to a single row.

## Elevation & Depth

Flat by default: depth comes from tone (white against #f4f4f4 cards, hairlines) and border colour, not shadow. Two soft shadows exist, both structural, plus the text halo that serves legibility over the canvas. Inside the canvas, depth is real lighting: a soft contact shadow under the bike and directional shadows.

### Shadow Vocabulary
- **Bottom bar lift** (`box-shadow: 0 -4px 16px rgb(0 0 0 / 0.08)`): separates the fixed bar from the panel and field.
- **Marker lift** (`box-shadow: 0 2px 8px rgb(0 0 0 / 0.18)`): lifts numbered markers off the bike.
- **Title halo** (`text-shadow: 0 0 0.5rem #fff, 0 0 1.25rem rgb(255 255 255 / 0.95)`): white glow behind the title only.

### Named Rules
**The Flat Cards Rule.** Cards and buttons carry no shadow; state is border and fill.

## Shapes

Gently rounded and plain: one 8px radius (0.5rem) for cards, buttons and the hint chip; 6px for caption bars and the card header button; 4px for progress segments; full circles for markers and the check badge. The signature silhouette is the red parallelogram tab (clip-path with a 1.25rem slanted right edge) flush to the top-left of the bar; it marks the open lesson only. Borders are 1px hairlines; the card and active-card borders are 2px.

## Components

### Buttons
- **Shape:** 8px radius, 48px minimum height, padding 12px 28px, weight 600.
- **Primary (red):** red fill and border, white text. Hover darkens to pressed red. Reads Empezar, Siguiente, Terminar, then "Ir a la lección N" when done on a lesson that has a successor, or "Volver al inicio" on the last lesson.
- **Secondary:** white fill, 1px ink border. Hover fills card grey. Reads Anterior, or Repasar desde el primero when done. Disabled (intro): hairline-strong border, soft ink.
- **Active:** moves down 1px. Focus: 3px ink outline offset 3px.
- On compact screens both buttons share the row equally.

### Cards / Containers
- **Topic card:** 8px radius, 2px card-grey border and fill; hover darkens the border to hairline-strong. Header grid: number, topic name with its tag line beneath, and a 1.5rem ink check badge (sr-only label "Visto") once seen.
- **Active card:** white fill, red border, red number, expands into the spec sheet. Clicking any card, or any bike marker, makes it active, in learn and in done.
- **Spec sheet:** a definition list of label (800, 0.875rem) above text (1rem) rows, hairline between rows and on top, any number of rows; opens with a 0.45s clip reveal. Rows are the topic's own, plus a bike-specific data row only for the bike it belongs to (e.g. 'En la R1'), plus, in topics that describe a rider control, an 'Ojo' row on bikes whose model cannot animate it, saying the controls may differ. Same row style as every other; no warning colour or icon.

### Navigation
- **Top bar:** white, 1px red bottom border. Left: the lesson buttons ("Lección N"). The open one is the red parallelogram tab with white bold text; the others are plain soft-ink 600 buttons with 1.25rem side padding that turn red on hover (no fill, no underline). Then the bold lesson title, then right-aligned tabular status in soft ink (aria-live): "N temas", "Tema N de M", "Lección completada".
- **Bottom bar:** white with lift shadow; model block at left, flexible progress, then the two buttons.

### Bike Picker
A native select under a 'Moto' label (800, 0.875rem), first in the panel. Full width, 44px minimum height, padding 8px 12px, 1px strong-hairline border, 8px radius, white fill, ink text at weight 600; options read 'Name · kind'. Hover turns the border ink; focus uses the global 3px ink outline. Native chrome is kept for the open list.

### Loading Pill
While a bike's model loads, a small white pill 'Cargando la moto…' (8px radius, 1px hairline border, soft ink, weight 600, padding 8px 16px) sits centred at 55% of the field height; markers are hidden until the layout exists. Same material as the field hint chip; no spinner, no motion.

### Model Block and Credit
The selected bike's name (Headline, 800, 1.375rem) sits above one soft-ink credit line (0.8125rem) that states the unofficial educational status and credits that bike's 3D model with its title link, author and licence link (CC BY 4.0). Links are soft ink, underlined with a 2px offset, and turn Corporate Red on hover. The credit changes with the bike and is required by each model's licence and is part of the bar, not optional copy.

### Progress Stripe
One 8px-tall segment per topic of the open lesson (column count from the `--n` custom property, default 5) with 6px gaps on a track-grey base; each fills red left to right (0.7s) when its topic has been seen. Seen state is kept per lesson. Review state does not fill unseen segments.

### Markers and Caption Bars
Numbered 30px circles over the bike, shown for topics that have model nodes and anchored to the first node of each topic; topics without nodes have no marker. White with ink border at rest, ink fill once seen, red fill and 1.25 scale when active. Only the active marker shows a part name, on a dark caption bar (ink at 92%, white bold text, 6px radius) joined to the marker by a short ink rule.

### 3D Field
A light studio: the radial gradient behind a transparent canvas, a hemisphere light, two directional lights, and a code-only environment of four rectangular Lightformer panels (a top softbox, two side panels, a low white strip) on a #dfe0e2 background, plus a soft contact shadow. Each bike is a downloaded glTF with its own spec in code: orientation by two named wheels (R1, Vespa) or by the longest axis (FZ 16); scale to a real length; stray nodes hidden (the FZ 16's studio box); and which nodes or materials ('mat:Name') each topic highlights (a topic with none shows the full bike and no marker). All colour comes from the textures. The active topic's named model nodes are tinted Bike Highlight with emissive glow while that topic is active; on the Yamaha R1 only, the five rider controls (throttle, front brake, clutch, shift lever, rear brake) also perform a gesture on a pivot. Seen and pending topics keep the model's own colour in the canvas. In intro and done nothing is tinted.

## Do's and Don'ts

### Do:
- **Do** keep the page white with card-grey (#f4f4f4) containers and ink (#1d1d1d) text.
- **Do** spend red (#cc0000) only on the open-lesson tab, lesson-button hover, heading bar, active state, progress fill, link hover and the primary button.
- **Do** use one 8px radius and Figtree Variable at weights 400 to 800.
- **Do** present each topic as label-and-text rows under a short 3.5rem by 4px red bar beneath the panel heading, with as many rows as the topic has.
- **Do** put part names on dark caption bars, and always pair state colour with a second cue (check, fill, scale, border).
- **Do** keep the fixed bottom bar: bike name with credit line, one red segment per topic, secondary then primary button.
- **Do** keep the chosen bike's credit with its licence link visible wherever the bottom bar shows the model block.
- **Do** keep the bike choice a single native select at the top of the panel, mirrored in `?moto=id`, and hide markers while a model loads.
- **Do** say honestly, in a plain 'Ojo' spec row, when a bike's model cannot show a control.
- **Do** put a white halo behind any text laid over the canvas.
- **Do** add lessons as data in the same shell: one tab or button per lesson, one card, segment and optional marker per topic.
- **Do** light the bike with code-made studio panels on a light ground, and compute markers and camera views from the model.
- **Do** keep education informational: revisit by tapping a card or marker, never by testing.

### Don't:
- **Don't** copy any third-party brand's logo, wing mark, wordmark, photos, video, 360 viewer, code or prices, or imply an official site.
- **Don't** use a dark 3D viewer; the field stays a light studio.
- **Don't** add a second accent colour to the interface chrome, or give inactive lesson buttons a fill or a red state at rest.
- **Don't** recolour the bike beyond the active-topic tint, or hardcode a bike palette; the model's textures own its colour.
- **Don't** add decorative motion beyond camera travel, the control gestures, the card reveal and the progress fill.
- **Don't** add eyebrow kickers, glyph icons or a second type family.
- **Don't** add quizzes, scores or graded feedback (user decision, 2026-11-12).
