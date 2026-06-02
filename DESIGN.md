---
tokens:
  colors:
    canvas: "#f6faf8"
    surface: "#ffffff"
    surfaceMuted: "#eef5f2"
    text: "#102033"
    textMuted: "#5d6b7a"
    border: "#dbe7e2"
    primary: "#047857"
    primarySoft: "#dff7ec"
    secondary: "#0e7490"
    secondarySoft: "#e3f6fb"
    accent: "#b45309"
    accentSoft: "#fff4dd"
    danger: "#be123c"
  typography:
    fontFamily:
      sans: "var(--font-geist-sans), Arial, Helvetica, sans-serif"
      display: "var(--font-geist-sans), Arial, Helvetica, sans-serif"
      code: "var(--font-code), Consolas, monospace"
    fontSize:
      body: "0.95rem"
      small: "0.875rem"
      h1: "clamp(2.25rem, 4vw, 4.5rem)"
      h2: "1.75rem"
      h3: "1.25rem"
    lineHeight:
      body: "1.75"
      heading: "1.15"
  spacing:
    pageX: "clamp(1.25rem, 4vw, 2.5rem)"
    sectionY: "3rem"
    panel: "1.25rem"
  radii:
    control: "0.375rem"
    card: "0.5rem"
    media: "0.5rem"
  shadows:
    card: "0 10px 28px rgb(15 23 42 / 0.08)"
    media: "0 18px 42px rgb(15 23 42 / 0.16)"
---

# mrtee.vn Design System

## Overview

mrtee.vn is a digital yearbook and education archive. The interface should feel careful, warm, academic, and durable: a place for memories, student profiles, class identity, team journeys, photos, videos, and writing. Public pages can be rich and photographic; dashboard pages should be quiet, dense, and efficient.

Use real student/class/team media as the primary visual signal whenever available. Avoid generic decorative gradients, oversized marketing sections, nested cards, and layouts that hide the actual content.

## Colors

Use `canvas` for page backgrounds and `surface` for functional panels. `primary` is the main action color for education/identity. `secondary` is used sparingly for media, video, and technical accents. `accent` is reserved for warm memory/yearbook highlights.

Do not let the whole UI become only slate and emerald. Balance public pages with white surfaces, soft cyan media accents, warm amber memory accents, and restrained borders.

## Typography

Public hero headings may be large and expressive, but section headings, cards, forms, and dashboard labels must stay compact. Body text should remain readable with generous line-height. Do not use viewport-based font sizing outside true hero headings. Letter spacing should remain `0`.

## Layout

Use full-width page bands with constrained inner content. Keep cards for repeated items, modals, forms, and real tools only. Avoid cards inside cards. Media grids must have stable dimensions and must not distort images on mobile.

Public pages should prioritize:

- first viewport: brand/class/team/student identity with real media;
- middle: story, achievements, albums, video;
- bottom: members and related memories.

Dashboard pages should prioritize:

- clear section titles;
- predictable forms;
- compact data rows;
- direct action buttons.

## Elevation & Depth

Prefer border plus subtle tonal background before heavy shadows. Use stronger shadows only for media cards, lightboxes, and hover states. Dark overlays on photos should preserve legibility without making images look muddy.

## Shapes

Use 6-8px radius for cards, media, forms, and buttons. Use circles only for avatars, play buttons, or icon-only controls where the shape has a clear purpose.

## Components

Buttons should use icons when the action is tool-like, especially media, copy, edit, save, delete, slide, grid, and playlist controls. Forms should group related fields with compact labels and visible focus states. Album controls should use segmented buttons for slide/grid.

Student cards should show the student name as the primary text, class/team context as secondary text, and the best available portrait/background image as the visual anchor.

## Do's and Don'ts

Do use Vietnamese content as first-class UI text.
Do keep mobile media undistorted and tap targets comfortable.
Do make admin actions explicit and reversible where possible.
Do use generated or real bitmap media for public visual richness.

Don't use decorative blobs, one-note color palettes, or nested cards.
Don't crop faces aggressively in student/member cards.
Don't expose token/hash-like strings in public-facing URLs when a readable slug can be used.
Don't use email-derived slug tails for student profile links.
