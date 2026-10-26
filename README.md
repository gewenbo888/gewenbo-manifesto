# Gewenbo Manifesto — 一使命

A bilingual manifesto in ascending order: 1 · 2 · 3 · 4 · 5 · 6 · 7 · 16.

[![Live Demo](https://img.shields.io/badge/demo-gewenbo--manifesto.vercel.app-c9a24b)](https://gewenbo-manifesto.vercel.app)

## Overview

A single-page bilingual (English / Chinese) manifesto site presenting a layered personal framework — each section adds one numerical layer to the last:

1. **One Mission** — 一使命
2. **Two Identities** — 二重身份 (Creator × Seeker)
3. **Three Core Principles** — 三大原则 (Truth · Goodness · Beauty · 真善美)
4. **Four Integrations** — 四大融合 (Capitalism × Socialism, AI × Human, Quantum × Relativity, Digital × Physical)
5. **Five Archetypes** — 五行人格 (Metal · Wood · Water · Fire · Earth, each paired with two archetypal figures)
6. **Six Major Domains** — 六大领域 (Matter · Energy · Information · Biology · Consciousness · Space-Time)
7. **Seven-Step Path** — 七步之道 (Anchor → Deepen → Breakthrough → Momentum → Cross-Domain → Integration → Inheritance)
8. **Sixteen Visions** — 十六愿景 (Truth-seeking · Benevolence · Beauty-creation · World utility, four each)

Every section includes a distinct geometric motif — a single dot for One, a duality for Two, a triangle for Three, a quadrant for Four, a five-element wheel for Five, a grid for Six, a staircase for Seven, a 4×4 matrix for Sixteen.

## Design & Tech

- **Stack:** Static HTML, vanilla JavaScript, inline SVG diagrams; no build step or runtime dependencies
- **Aesthetic:** Ink-green digital archive with ivory editorial typography, antique-gold orbital artwork, a fixed sixteen-chapter top navigation, and lightweight reading navigation. Standalone worlds retain their existing reading layouts.
- **Typography:** Fraunces (variable serif) · Cormorant Garamond (body serif) · Noto Serif SC (Chinese) · JetBrains Mono (data)
- **Bilingual:** Chinese, English, and bilingual modes with a persisted language preference
- **Deployment:** Vercel

## Links

- [Live Site](https://gewenbo-manifesto.vercel.app)
- [GitHub Repository](https://github.com/gewenbo888/gewenbo-manifesto)

## Local preview

Requires Node.js 20 or later. No dependency installation is needed.

```sh
npm run dev
```

Open http://127.0.0.1:4174. The preview server supports the same extensionless HTML routes as Vercel. Override the port with `PORT=4175 npm run dev`.

The homepage edition is implemented in `edition.css` and `edition.js`. The cover fills the viewport and centers the original title over the existing Psy triangle-field animation. `triangle-field.js` ports the reference site’s TypeScript simulation; `hero-motion.js` mounts it without React. The vector orbital mesh remains a no-JavaScript fallback. The mission statement starts below the cover. All text, links, and language controls remain native HTML. The original sixteen chapter destinations and content remain available. The mission introduction directly states the original mission rather than defining the word “mission.”

### Reading interface

The fixed chapter rail includes localized labels and scroll buttons on narrow screens. Chapter headers link directly to the full chapter; the bottom reading controls move to the actual previous and next chapters. All manuscript statements remain unchanged.

The breakthroughs comparison is a native table with row/column headers. It and the two matrices scroll within their own regions; row labels remain fixed while browsing columns. Localized hints and buttons provide an alternative to touch scrolling. The identity section uses open text columns rather than decorative image cards. Reduced-motion preferences are respected throughout.

### Standalone chapters and atlas

`publication.css` and `publication.js` extend the same cool-white, graphite, and restrained forest-green reading system to the sixteen standalone chapters, the existing worlds index, and the project atlas. Each page exposes the full chapter rail at the top. The mission page has a full-screen title cover and a reading link into a full-width mission statement; its collapsible outline follows the statement. Articles add an in-page outline that stays beside the article on desktop and becomes a native disclosure on small screens. The existing source paragraphs, illustrations, and per-chapter interactive tools remain in place.

The shared shell preserves language preference, adds roving keyboard behavior to existing tab panels, and keeps native article tables within labeled scroll regions. Atlas search, category filtering, sorting, live counts, and screenshots continue to use the existing project data; loading failures now offer a retry action. Decorative telemetry and particle overlays are omitted from this reading edition.

The restrained edition removes repeated display numbers, decorative English section labels, gold ornament, and generic card surfaces. The complete chapter index stays in the masthead; original manuscript paragraphs and functional diagrams are preserved.

The motion field preserves the reference’s folding geometry, facet lighting, pointer scattering and spring recovery. It pauses offscreen and in hidden tabs, and renders a still frame for reduced motion. Four Integrations uses open paired formulas on the homepage; its chapter slider has one visible track, localized pole labels/readout, and preserves all four pairings and three zones.
