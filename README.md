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

The homepage edition is implemented in `edition.css` and `edition.js`. Its generated artwork lives in `assets/celestial-landscape.webp` (approximately 157 KB); all text, links, and language controls remain native HTML. The original sixteen chapter destinations and content remain available. The mission introduction directly states the original mission rather than defining the word “mission.”

### Reading interface

The fixed chapter rail includes localized labels and scroll buttons on narrow screens. Chapter headers link directly to the full chapter; the bottom reading controls move to the actual previous and next chapters. All manuscript statements remain unchanged.

The breakthroughs comparison is a native table with row/column headers. It and the two matrices scroll within their own regions; row labels remain fixed while browsing columns. Localized hints and buttons provide an alternative to touch scrolling. The identity diptych uses the compressed `assets/identity-worlds.webp` artwork (approximately 106 KB). Reduced-motion preferences are respected throughout.
