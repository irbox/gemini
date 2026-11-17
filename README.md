# The Lovelace Journal

A modern, high-tech, authentic Jekyll static publication and research engineering journal inspired by computing pioneer Ada Lovelace. 

Designed for deep-dive technical publications across **Frontier AI & Reasoning**, **Hardware Accelerators & Custom Silicon**, **Quantum Computing**, **Autonomous Systems & Robotics**, and **Biosensors & Health**.

---

## 1. Architectural Overview

The Lovelace Journal is engineered as a clean, modular **Jekyll 4.4.1 static site** compatible with both standard Jekyll compiler environments and native GitHub Pages deployment:

| Layer | Implementation |
| :--- | :--- |
| **Site Engine** | Jekyll 4.x / Liquid template architecture with modular layout hierarchy |
| **Styling Pipeline** | Modular SCSS partials (`_sass/`) compiled via Dart Sass / Jekyll Sass Converter into `assets/css/style.css` |
| **Client Enhancements** | Vanilla ECMAScript (`assets/js/main.js`): live JSON search modal, category filter tabs, responsive drawer |
| **Data Architecture** | YAML data models (`_data/navigation.yml`, `_data/authors.yml`, `_data/categories.yml`) |
| **Search Engine** | Static inverted index generated dynamically via Liquid (`search.json`) |
| **Vector Assets** | 100% original SVG vector graphics for brand logos, author avatars, and article illustrations |
| **Licensing & Rights** | 100% trademark-free, proprietary-free, original technical writing released under MIT license |

---

## 2. Codebase Directory Hierarchy

```text
.
├── _config.yml               # Global Jekyll 4 configuration (collections, defaults, sass, plugins)
├── Gemfile                   # Standard GitHub Pages & Jekyll Ruby gem bundle
├── _data/                    # Structured YAML data-driven sources
│   ├── navigation.yml        # Site-wide top nav & multi-column footer links
│   ├── authors.yml           # Author profiles, bios, and avatars
│   └── categories.yml        # Topic metadata, slugs, and descriptions
├── _sass/                    # Modular SCSS partials
│   ├── _variables.scss       # Design tokens, typography, brand indigo, neutral palettes
│   ├── _base.scss            # Accessible reset, buttons, badge pills
│   ├── _header.scss          # Sticky navigation, brand logo, mobile drawer
│   ├── _hero.scss            # Featured publication hero card
│   ├── _cards.scss           # Responsive story cards, category filters
│   ├── _post.scss            # Long-form article reading layout, typography, code blocks
│   ├── _footer.scss          # Multi-column footer & newsletter signup widget
│   └── _search.scss          # Live client-side search modal overlay
├── assets/
│   ├── css/
│   │   ├── style.scss        # Main SCSS entrypoint with Jekyll front matter
│   │   └── style.css         # Compiled production stylesheet
│   ├── js/
│   │   └── main.js           # Client-side search modal (⌘K), filter tabs, mobile drawer
│   └── images/
│       ├── logo.svg          # Lovelace Analytical Loop vector logo
│       ├── favicon.svg       # Vector favicon
│       ├── authors/          # Vector avatars for researcher personas
│       └── posts/            # Original technical vector illustrations
├── _includes/                # Modular Liquid partials
│   ├── head.html             # SEO meta tags, OpenGraph, Twitter Cards, canonical tags
│   ├── header.html           # Dynamic header driven by site.data.navigation.main
│   ├── footer.html           # Dynamic footer driven by site.data.navigation.footer
│   ├── hero.html             # Featured research hero card
│   ├── article_card.html     # Reusable story card with image, category, and read time
│   ├── newsletter.html       # Newsletter subscription callout
│   ├── search_modal.html     # Live modal search interface querying search.json
│   └── cookie_banner.html    # Privacy notice component
├── _layouts/                 # Jekyll master layouts
│   ├── default.html          # Base HTML5 wrapper (head, header, footer, scripts)
│   ├── home.html             # Homepage layout (hero, filter tabs, story grid)
│   ├── post.html             # Long-form article layout (breadcrumbs, author, related posts)
│   └── page.html             # Static content page layout (About, Categories)
├── _posts/                   # Original technical Markdown articles with rich front matter
│   ├── 2026-11-14-contextual-in-browser-neural-synthesis.md
│   ├── 2026-11-12-introducing-hydrogen-4-foundational-reasoning.md
│   ├── 2026-11-10-next-gen-matrix-silicon-accelerators.md
│   ├── 2026-11-08-annual-consumer-hardware-retrospective.md
│   ├── 2026-11-05-edge-coprocessors-power-optimization.md
│   ├── 2026-11-03-edge-biomarker-wearable-platform.md
│   ├── 2026-11-01-autonomous-pathfinding-deep-space-robotics.md
│   └── 2026-10-28-scaling-logical-qubits-fault-tolerant-surface-codes.md
├── index.html                # Declarative homepage (uses layout: home)
├── categories.html           # Topic browsing page (uses layout: page)
├── about.md                  # About The Lovelace Journal (uses layout: page)
├── search.json               # Liquid template generating live JSON search index of all posts
├── 404.html                  # Custom 404 error page
├── scripts/
│   └── build_jekyll.js       # Fast standalone build compiler
├── test/
│   └── jekyll.test.js        # Automated test suite validating Jekyll structures, SCSS, Liquid, and posts
└── package.json              # Project dependencies and npm scripts
```

---

## 3. Research Pillars & Content Matrix

The publication features 8 technical articles spanning frontier computing fields:

1. **Contextual In-Browser Neural Synthesis (Nov 14, 2026)**: WebGPU shader pipelines, browser-side token streaming, KV-cache quantization, and local zero-latency inference.
2. **Introducing Hydrogen-4: Foundational Reasoning (Nov 12, 2026)**: Deep reasoning architecture using Monte Carlo Tree Search token trajectories, self-correcting verification loops, and synthetic formal proofs.
3. **Next-Gen Matrix Silicon Accelerators (Nov 10, 2026)**: Systolic matrix execution units, near-memory processing with high-bandwidth interconnects, and dynamic thermal gating.
4. **Annual Consumer Hardware & Silicon Retrospective (Nov 08, 2026)**: On-device NPU compute, energy-per-token scaling across client devices, and display glass innovations.
5. **Edge Coprocessors & Ultra-Low-Power Optimization (Nov 05, 2026)**: Heterogeneous core partitioning, opportunistic sleep duty-cycles, and ambient sensor inference.
6. **Edge Biomarker Monitoring Platform (Nov 03, 2026)**: Multi-wavelength photoplethysmography (PPG), micro-optical sensor suites, and on-die arrhythmia detection.
7. **Autonomous Pathfinding in Deep Space Robotics (Nov 01, 2026)**: Asynchronous multi-agent consensus, visual SLAM under extreme light variations, and radiation-tolerant computation.
8. **Scaling Logical Qubits with Fault-Tolerant Surface Codes (Oct 28, 2026)**: Distance-7 surface code fabrics, cryogenic feedlines, and real-time syndromic error decoding.

---

## 4. Quick Start & Build Commands

```bash
# 1. Install dependencies
npm install

# 2. Run automated test suite (7 tests verifying config, data, SCSS compilation, posts, and zero trademark violations)
npm test

# 3. Compile the production site (outputs to dist/ and _site/)
npm run build

# 4. Preview the compiled site locally
npm run preview
```

---

## 5. Deployment

- **Production Branch**: `gh-pages`
- **Source Repository**: `https://github.com/irbox/gemini.git`
- **Live URL**: [https://irbox.github.io/gemini/](https://irbox.github.io/gemini/)

The compiled static assets in `dist/` are published directly to the `gh-pages` branch, providing instant CDN delivery with zero server overhead.
