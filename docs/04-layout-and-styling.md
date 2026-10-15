# 04. Layout, Styling, and Typography

> Implementing headers, footers, covers, table of contents, and typography systems

* **Package:** `@vivekkushwaha66/paperforge`
* **License:** MIT

---

## 1. Running Headers and Footers

Paperforge supports fully customizable, Markdown-rendered running headers and footers defined in standalone files:

```yaml
# paperforge.yaml
header:
  file: "./header.md"
footer:
  file: "./footer.md"
```

### Template Interpolation Variables

Headers and footers are compiled as dynamic templates, supporting runtime metadata substitution:

| Variable | Description | Example Output |
| :--- | :--- | :--- |
| `{{title}}` | Project or active chapter title | `"AI Stock Research Prompt Library"` |
| `{{chapter}}` | Title of the current chapter | `"Financial Statements"` |
| `{{author}}` | Document author | `"Vivek Kushwaha"` |
| `{{date}}` | Build or release date | `"September 2026"` |
| `{{version}}` | Publication version | `"1.0.0"` |
| `{{page}}` | Current physical page number | `14` |
| `{{pages}}` | Total page count of publication | `48` |

### Example `header.md`

```markdown
<div class="forge-header">
  <span class="brand-title">{{title}}</span>
  <span class="chapter-title">{{chapter}}</span>
</div>
```

### Example `footer.md`

```markdown
<div class="forge-footer">
  <span class="author-credits">© {{date}} {{author}} — All Rights Reserved</span>
  <span class="page-counter">Page {{page}} of {{pages}}</span>
</div>
```

Headers and footers are rendered into CSS Paged Media `@top-center`, `@bottom-left`, and `@bottom-right` margin boxes, ensuring they remain fixed across pages without colliding with document body text.

---

## 2. Dedicated Cover Page

The cover is authored as an independent Markdown file with its own layout semantics:

```yaml
# paperforge.yaml
cover:
  file: "./cover.md"
```

### Example `cover.md`

```markdown
---
type: "cover"
title: "AI Stock Research Prompt Library"
subtitle: "A practical framework for AI-assisted equity analysis"
author: "Vivek Kushwaha"
version: "1.0"
date: "2026"
---

<div class="cover-container">
  <div class="cover-badge">Developer Edition</div>
  <h1 class="cover-title">{{title}}</h1>
  <p class="cover-subtitle">{{subtitle}}</p>
  
  <div class="cover-footer">
    <span class="cover-author">Authored by {{author}}</span>
    <span class="cover-version">v{{version}}</span>
  </div>
</div>
```

The cover automatically:
* Suppresses running headers, footers, and page numbers.
* Forces an automatic page break after completion.
* Receives a `.page-cover` CSS class for full-bleed background designs.

---

## 3. Table of Contents (TOC) Engine & Styling

When `toc.enabled: true` is set, Paperforge parses the assembled document tree and generates a semantic navigation page:

```html
<nav class="forge-toc">
  <h2 class="toc-title">Table of Contents</h2>
  <ol class="toc-list depth-1">
    <li class="toc-item">
      <a href="#intro" class="toc-link">
        <span class="toc-text">1. Introduction</span>
        <span class="toc-leader"></span>
        <span class="toc-page">3</span>
      </a>
      <ol class="toc-list depth-2">
        <li class="toc-item">
          <a href="#intro-workflow" class="toc-link">
            <span class="toc-text">1.1 Research Workflow</span>
            <span class="toc-leader"></span>
            <span class="toc-page">4</span>
          </a>
        </li>
      </ol>
    </li>
  </ol>
</nav>
```

### Dotted Leader Styling

Paperforge provides print-grade CSS for leader lines connecting headings to their page numbers:

```css
.toc-link {
  display: flex;
  align-items: baseline;
  text-decoration: none;
  color: inherit;
}

.toc-leader {
  flex-grow: 1;
  border-bottom: 1px dotted #999;
  margin: 0 8px;
}

.toc-page {
  font-variant-numeric: tabular-nums;
  font-weight: 600;
}
```

---

## 4. Typography System & Font Selectors
 
Paperforge translates the `typography` block in `paperforge.yaml` directly into CSS custom properties, local `@font-face` declarations, and semantic font family assignments:

### Configuration Mapping

```yaml
typography:
  fonts:
    # Local font with multi-variant definitions
    - name: "Geist"
      source: "local"
      variants:
        - path: "./assets/fonts/Geist-Regular.woff2"
          weight: 400
          style: "normal"
        - path: "./assets/fonts/Geist-Bold.woff2"
          weight: 700
          style: "normal"
    # Local font with shorthand
    - name: "Fira Code"
      source: "local"
      path: "./assets/fonts/FiraCode-Regular.woff2"
      weight: 400
    # Remote web font (optional)
    - name: "Inter"
      source: "google"
      url: "https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700&display=swap"

  selectors:
    body: "'Geist', sans-serif"
    headings: "'Geist', sans-serif"
    code: "'Fira Code', monospace"
```

### Generated CSS Pipeline

The rendering engine generates and injects the following CSS rules before any user theme, converting local font files into optimized Base64 data URIs for 100% offline self-containment:

```css
/* 1. Local Offline Font Face Declarations (Base64 Inlined) */
@font-face {
  font-family: 'Geist';
  src: url('data:font/woff2;base64,d09GMgABAAAA...') format('woff2');
  font-weight: 400;
  font-style: normal;
  font-display: swap;
}

@font-face {
  font-family: 'Geist';
  src: url('data:font/woff2;base64,e82HMhBC...') format('woff2');
  font-weight: 700;
  font-style: normal;
  font-display: swap;
}

@font-face {
  font-family: 'Fira Code';
  src: url('data:font/woff2;base64,a31KMqWZ...') format('woff2');
  font-weight: 400;
  font-style: normal;
  font-display: swap;
}

/* 2. Remote Web Font Import (if configured) */
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700&display=swap');

/* 3. Semantic Font Selectors & Variables */
:root {
  --font-body: 'Geist', sans-serif;
  --font-headings: 'Geist', sans-serif;
  --font-code: 'Fira Code', monospace;
  --font-size-base: 11pt;
  --line-height-base: 1.6;
}

body {
  font-family: var(--font-body);
  font-size: var(--font-size-base);
  line-height: var(--line-height-base);
}

h1, h2, h3, h4, h5, h6 {
  font-family: var(--font-headings);
  font-weight: 700;
}

code, pre, kbd, samp {
  font-family: var(--font-code);
}
```

---

## 5. CSS Themes and Page Layout Rules

Paperforge includes a print-optimized default theme and supports user overrides via `theme.css`.

### Print Layout Tokens (`@page`)

```css
@page {
  size: A4 portrait;
  margin: 20mm;
  
  @top-left {
    content: element(headerLeft);
  }
  @bottom-right {
    content: counter(page);
  }
}

/* Avoid page breaks inside critical elements */
pre, blockquote, table, figure {
  break-inside: avoid;
  page-break-inside: avoid;
}

/* Force clean chapter breaks */
.chapter-start {
  break-before: page;
  page-break-before: always;
}
```

---

## 6. Official Theme: Vivek Kushwaha Labs Theme

Paperforge includes the signature **Vivek Kushwaha Labs** theme as an optional starter theme:

### Palette & Aesthetics

* **Obsidian (Base):** `#0A0B0E` (Deep luxury black for typography & cover backdrops)
* **Champagne (Accent):** `#DFBA87` (Warm metallic gold for badges, borders, and TOC accents)
* **Paper White (Canvas):** `#FFFFFF` (High contrast pure white for content readability)
* **Slate (Secondary):** `#64748B` (Muted captions, metadata, and header text)

```css
:root {
  --color-obsidian: #0A0B0E;
  --color-champagne: #DFBA87;
  --color-slate: #64748B;
  --color-canvas: #FFFFFF;
}

.cover-container {
  background: var(--color-obsidian);
  color: var(--color-canvas);
  border-top: 4px solid var(--color-champagne);
}

h1, h2 {
  color: var(--color-obsidian);
}

blockquote {
  border-left: 3px solid var(--color-champagne);
  background: #FAF9F6;
}
```

---

## 7. Full-Bleed Page Backgrounds & Separate Margins

For slide decks, social carousels, and publication cards, Paperforge supports complete edge-to-edge full-bleed printing where the background color paints the entire physical page (including margins).

### Page Margins vs. Content Margins

Paperforge separates outer page margins from inner content margins:

1. **Page Margins (`margins`)**: Controls the physical page shell padding (e.g. `32px 48px`). The background color flows completely behind this padding to the physical edges.
2. **Content Margins (`content_margins`)**: Spacing applied specifically to the inner `<main class="forge-page-content">` body, providing breathing room without affecting running headers or accent bars.

```yaml
# paperforge.yaml
pdf:
  fullBleed: true
  layout: "cards"
  width: "1080px"
  height: "1080px"
  margins: "32px 48px"          # Shell padding
  content_margins: "10px 0px"   # Inner content spacing
```

Per-page overrides can also be specified in frontmatter:

```markdown
---
title: "Multi-Region Resilience"
background: "#0C1B33"           # Navy background fills 100% of the page
margins: "40px 60px"
content_margins: "15px 0px"
accent_color: "#38BDF8"
---
```

---

## 8. Architecture Cards & Carousel Layouts

Paperforge provides built-in support for LinkedIn / Twitter architecture carousels and executive slide decks:

* **Square Format (1080×1080)**: Ideal for social carousels and slide decks.
* **In-Page Running Headers**: Includes a sleek metallic accent bar on the left and formatted page counter (`01 / 05`) on the right.
* **Native Diagram Cards**: Diagrams and code blocks are automatically enclosed in high-contrast card boxes (`.forge-diagram-card`).
* **Clean Page Breaks**: Exact 1-to-1 page budgeting with zero trailing blank pages.

### Example Architecture Card Publication

```yaml
# paperforge.config.yaml
title: "System Architecture Carousel"
author: "Engineering Platform"
output:
  file: "./dist/system-architecture.pdf"

pdf:
  layout: "cards"
  fullBleed: true
  width: "1080px"
  height: "1080px"
  margins: "32px 48px"
  background: "#0A0B0E"
```

---

*Previous Document:* [03. Configuration and Frontmatter](./03-configuration-and-frontmatter.md)  
*Next Document:* [05. PDF Metadata and Assets](./05-pdf-metadata-and-assets.md)
