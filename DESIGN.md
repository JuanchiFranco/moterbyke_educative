---
name: Lección 1 · Conoce los mandos
description: A white product-sheet lesson in one corporate red, grey cards and Figtree, wrapped around a light-studio glTF motorbike whose own textures carry all of its colour.
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
  card-control:
    backgroundColor: "{colors.card-grey}"
    textColor: "{colors.ink}"
    rounded: "{rounded.md}"
  card-control-active:
    backgroundColor: "{colors.white}"
    textColor: "{colors.ink}"
    rounded: "{rounded.md}"
  tab-lesson:
    backgroundColor: "{colors.red}"
    textColor: "{colors.white}"
    padding: "0 36px 0 32px"
  caption-bar:
    backgroundColor: "{colors.ink}"
    textColor: "{colors.white}"
    rounded: "{rounded.sm}"
    padding: "5.6px 12px"
  spot-option:
    backgroundColor: "{colors.white}"
    textColor: "{colors.ink}"
    rounded: "{rounded.md}"
    padding: "15px 16px"
  spot-option-right:
    backgroundColor: "{colors.red}"
    textColor: "{colors.white}"
  model-credit:
    backgroundColor: "{colors.white}"
    textColor: "{colors.ink-soft}"
    typography: "{typography.credit}"
---

# Design System: Lección 1 · Conoce los mandos

## Overview

**Creative North Star: "The Product Sheet"**

The lesson reads as a motorbike product page: a white ground, one corporate red, grey cards that open into label-and-value spec rows, and a fixed bottom bar carrying the model name, its credit and the red action. The 3D bike sits in a light studio field rather than a dark viewer, so the page and the object share one daylight. The language (white, red, grey, Figtree, underlined headings, bottom bar) follows the structure and style of a commercial motorbike product page, but the product is an unofficial educational project and carries no third-party logo, wing mark, wordmark, photo, video, code or price (PRODUCT.md, Brand Commitments).

Density is calm and tabular. Red is rationed to the places that mean "this is where you are or what you do next". Everything in the interface is white, grey and near-black ink; the bike is the only place with other colour, and that colour belongs to the downloaded model's own textures, not to the interface palette. Motion is camera travel between controls, the active control's gesture on the bike, one card reveal and the progress fill; nothing decorative.

**Key Characteristics:**
- White page, grey cards, one red accent (#CC0000), near-black ink.
- Figtree Variable throughout, heavy 800 for headings, 400 to 700 for reading.
- A single 8px radius; the parallelogram tab is the only angled form.
- Spec rows (label above value, hairline between) for every control's sheet.
- State is never colour alone: number, check, border, dotted or dashed edge, strike-through.
- The bike is a glTF model lit by code-made studio panels; the interface never recolours it except to tint the active control red.

## Colors

A white-and-grey ground with one corporate red and near-black ink; the red appears on a few small, meaningful parts. The bike brings its own colour from its textures.

### Primary
- **Corporate Red** (`{colors.red}`): the lesson tab, the short bar under each panel heading, the active card border and number, the active marker, the correct quiz answer, filled progress segments, the primary button, the bottom hairline of the top bar, link hover in the credit line, text selection and caret.
- **Pressed Red** (`{colors.red-deep}`): primary button hover only.
- **Bike Highlight** (`{colors.bike-highlight}`): not an interface colour. It is the tint applied in the 3D scene (with emissive intensity 0.7) to the active control's meshes so it reads as red under studio light. It is a brighter, more saturated sibling of Corporate Red and does not match it; see the Highlight Stays in the Scene Rule.

### Neutral
- **Ink** (`{colors.ink}`): body and heading text, learned markers and check badges, focus ring, dark caption bars (at 92% opacity), secondary button border.
- **Soft Ink** (`{colors.ink-soft}`): secondary lines, status text, hints, disabled labels, pending card numbers, the model credit and its link.
- **White** (`{colors.white}`): page, top bar, panel, bottom bar, active card, markers at rest, quiz options, and the halo behind the lesson title.
- **Card Grey** (`{colors.card-grey}`): control cards at rest, hover fill of options and secondary button.
- **Track Grey** (`{colors.track-grey}`): unfilled progress segments.
- **Hairlines** (`{colors.hairline}`, `{colors.hairline-strong}`): panel edge, spec-row dividers, option borders, card hover border, scrollbar.
- **Studio Ground** (`{colors.studio-top}` to `{colors.studio-bottom}`): the radial gradient behind the 3D canvas, brightest low-centre. `{colors.studio-scene}` is the background of the code-made lighting environment, not a page surface.

### Named Rules
**The Red Means Here-or-Next Rule.** Red marks the current place (tab, active card, active marker, filled progress) or the next action (primary button), plus the heading underline. It is not used for decoration, error, or body emphasis.

**The Wrong Is Not Red Rule.** A wrong quiz answer is shown in ink with a dashed border and strike-through, never in red; red is reserved for correct and active.

**The Highlight Stays in the Scene Rule.** Bike Highlight tints only the active control's meshes in the canvas. Interface elements use Corporate Red; do not use the highlight value in CSS, and do not tint any other bike part.

## Typography

**Display Font:** Figtree Variable (with Figtree, system-ui, sans-serif), self-hosted via @fontsource-variable/figtree (wght axis).
**Body Font:** Figtree Variable, same stack.

**Character:** One humanist geometric sans doing everything; hierarchy comes from weight (800 against 400 to 600) and size, not from a second family.

### Hierarchy
- **Display** (800, clamp(2rem, 4vw, 3.5rem), 1.02, -0.025em): the lesson title over the 3D field, max 16em, balanced wrap, with a white text-shadow halo. Compact: clamp(1.5rem, 7vw, 2.25rem), set above the canvas.
- **Headline** (800, 1.375rem, 1.1): panel heading with its red bar; also the bike name in the bottom bar. Compact panel heading: 1.125rem.
- **Title** (700, 1.125rem): bar title, control name on a card, control number (800, 1.5rem).
- **Body** (400 to 600, 1rem, 1.45): spec values, quiz options (600, 1.0625rem), subtitle (500, 1.0625rem, soft ink, max 34rem), feedback (1.0625rem).
- **Label** (800, 0.875rem): spec-row labels; limb line and hint at 0.875rem regular in soft ink; caption bars 700 at 0.9375rem.
- **Credit** (400, 0.8125rem, soft ink): the unofficial-project and model credit line under the bike name, with the licence link underlined (offset 2px).

### Named Rules
**The Weight Does the Work Rule.** Rank by weight and size inside Figtree; do not introduce a second family or letter-spaced uppercase labels.

**The Halo Keeps Text Legible Rule.** Text that sits over the 3D canvas gets a white glow (`text-shadow: 0 0 0.5rem #fff, 0 0 1.25rem rgb(255 255 255 / 0.95)`), never a dark or offset shadow. Text outside the canvas needs none.

## Layout

A four-area grid: top bar (3.75rem), 3D field (flexible), control panel (25rem, i.e. 400px, right), fixed bottom bar (5.25rem). The page is exactly one viewport tall (100dvh); the panel scrolls internally and the active card is scrolled into view. Spacing is a loose rem rhythm: 0.375 to 0.75rem inside components, 1 to 1.5rem panel and card gutters, 2 to 2.5rem field and bar gutters. Cards stack with 0.625rem gaps. The lesson title floats over the canvas at top-left (2rem from top, 2.5rem from the sides); camera views are computed from the model so the bike sits beneath it.

Below 60rem the grid becomes a single column: bar (3.25rem), field (13 to 15rem minimum, 36 to 40dvh), panel, bottom bar. The title leaves the 3D field and sits above the canvas; the field hint and the bar title are hidden, and the bottom bar's model block keeps only its credit line (the CC BY attribution must stay visible), set small and centred under the buttons; the progress stripe moves to its own full-width row above the two buttons; inactive cards collapse to a single row.

## Elevation & Depth

Flat by default: depth comes from tone (white against #f4f4f4 cards, hairlines) and border colour, not shadow. Two soft shadows exist, both structural, plus the text halo that serves legibility over the canvas. Inside the canvas, depth is real lighting: a soft contact shadow under the bike and directional shadows.

### Shadow Vocabulary
- **Bottom bar lift** (`box-shadow: 0 -4px 16px rgb(0 0 0 / 0.08)`): separates the fixed bar from the panel and field.
- **Marker lift** (`box-shadow: 0 2px 8px rgb(0 0 0 / 0.18)`): lifts numbered markers off the bike.
- **Title halo** (`text-shadow: 0 0 0.5rem #fff, 0 0 1.25rem rgb(255 255 255 / 0.95)`): white glow behind the lesson title only.

### Named Rules
**The Flat Cards Rule.** Cards, options and buttons carry no shadow; state is border and fill.

## Shapes

Gently rounded and plain: one 8px radius (0.5rem) for cards, buttons, options and the hint chip; 6px for caption bars and the card header button; 4px for progress segments; full circles for markers and the check badge. The signature silhouette is the red parallelogram lesson tab (clip-path with a 1.25rem slanted right edge) flush to the top-left of the bar. Borders are 1px hairlines; the active card and option emphasis use 2px.

## Components

### Buttons
- **Shape:** 8px radius, 48px minimum height, padding 12px 28px, weight 600.
- **Primary (red):** red fill and border, white text. Hover darkens to pressed red. Disabled: dotted border, white fill, soft-ink text.
- **Secondary:** white fill, 1px ink border. Hover fills card grey. Disabled: hairline-strong border, soft ink.
- **Active:** moves down 1px. Focus: 3px ink outline offset 3px.
- On compact screens both buttons share the row equally.

### Cards / Containers
- **Control card:** 8px radius, 2px card-grey border and fill; hover darkens the border to hairline-strong. Header grid: number, name with limb line beneath, and a 1.5rem ink check badge once learned.
- **Active card:** white fill, red border, red number, expands into the spec sheet.
- **Spec sheet:** a definition list. Label (800, 0.875rem) above value (1rem), hairline between rows, top hairline; opens with a 0.45s clip reveal.
- **Quiz option:** white, 1px strong hairline, 8px radius. Idle hover: ink border, grey fill. Correct: red fill, white text, check. Wrong: 2px dashed ink border, soft ink, line-through. Locked: dotted border.

### Navigation
- **Top bar:** white, 1px red bottom border. Red parallelogram tab with white bold "Lección 1", bold title, right-aligned tabular status in soft ink (aria-live).
- **Bottom bar:** white with lift shadow; model block at left, flexible five-segment progress, then the two buttons.

### Model Block and Credit
The bike name (Headline, 800, 1.375rem) sits above one soft-ink credit line (0.8125rem) that states the unofficial educational status and credits the 3D model with title, author and a CC BY 4.0 link. The link is soft ink, underlined with a 2px offset, and turns Corporate Red on hover. The credit is required by the model's licence and is part of the bar, not optional copy.

### Progress Stripe
Five 8px-tall segments with 6px gaps on a track-grey base; each fills red left to right (0.7s) as a control is learned or answered.

### Markers and Caption Bars
Numbered 30px circles over the bike, positioned by projecting each control's anchor from the model: white with ink border at rest, ink fill when learned, red fill and 1.25 scale when active. Markers on the far side of the bike dim to 45%. Only the active marker shows a part name, on a dark caption bar (ink at 92%, white bold text, 6px radius) joined to the marker by a short ink rule. State also shows by fill and scale. Markers are hidden during the quiz.

### 3D Field
A light studio: the radial gradient behind a transparent canvas, a hemisphere light, two directional lights, and a code-only environment of four rectangular Lightformer panels (a top softbox, two side panels, a low white strip) on a #dfe0e2 background, plus a soft contact shadow. The bike is the downloaded Yamaha R1 glTF, oriented and scaled to its real 2.055 m length at load; all of its colour comes from its textures. The five controls are named nodes of the model, each on a pivot that performs its gesture while active. The active control is tinted Bike Highlight with emissive glow; learned and pending controls keep the model's own colour in the canvas (the learned state shows only on markers and cards). During the quiz no tint and no markers are shown.

## Do's and Don'ts

### Do:
- **Do** keep the page white with card-grey (#f4f4f4) containers and ink (#1d1d1d) text.
- **Do** spend red (#cc0000) only on the tab, heading bar, active state, correct answer, progress fill, link hover and the primary button.
- **Do** use one 8px radius and Figtree Variable at weights 400 to 800.
- **Do** present each control as label-and-value rows under a short 3.5rem by 4px red bar beneath the heading.
- **Do** put part names on dark caption bars, and always pair state colour with a second cue (check, border style, fill, strike-through).
- **Do** keep the fixed bottom bar: bike name with credit line, five red segments, secondary then primary button.
- **Do** keep the model credit with its licence link visible wherever the bottom bar shows the model block.
- **Do** put a white halo behind any text laid over the canvas.
- **Do** light the bike with code-made studio panels on a light ground, and compute markers and camera views from the model.

### Don't:
- **Don't** copy any third-party brand's logo, wing mark, wordmark, photos, video, 360 viewer, code or prices, or imply an official site.
- **Don't** use a dark 3D viewer; the field stays a light studio.
- **Don't** show errors in red or add a second accent colour to the interface chrome.
- **Don't** recolour the bike beyond the active-control tint, or hardcode a bike palette; the model's textures own its colour.
- **Don't** add decorative motion beyond camera travel, the active gesture, the card reveal and the progress fill.
- **Don't** add eyebrow kickers, glyph icons or a second type family.
