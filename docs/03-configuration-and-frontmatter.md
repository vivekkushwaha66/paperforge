# 03. Configuration and Frontmatter

> Complete specification for project configuration, typography, TOC, and frontmatter

* **Package:** `@vivekkushwaha66/paperforge`
* **License:** MIT

---

## 1. Project Configuration (`paperforge.yaml`)

The primary configuration file resides at the root of a Paperforge project: `paperforge.yaml`.

### Complete Configuration Schema

```yaml
# Document Identification & Metadata Defaults
title: "AI Stock Research Prompt Library"
subtitle: "A practical framework for AI-assisted equity analysis"
author: "Vivek Kushwaha"
version: "1.0.0"
date: "2026-09-15"

# Output Configuration
output:
  file: "./dist/stock-research.pdf"

# Content Discovery
content:
  directory: "./content"
  include: ["*.md"]
  exclude: ["drafts/*", "_*"]

# Layout & Structure Files
cover:
  file: "./cover.md"
header:
  file: "./header.md"
footer:
  file: "./footer.md"

# PDF Engine & Page Properties
pdf:
  format: "A4"                  # A4, Letter, Legal, or custom dimensions
  width: "1080px"               # Explicit width (e.g. "1080px", "210mm", "8.5in")
  height: "1080px"              # Explicit height (e.g. "1080px", "297mm", "11in")
  orientation: "portrait"       # portrait | landscape
  printBackground: true         # Include background colors & graphics
  pageNumbers: true             # Show page numbers
  background: "#0B0F19"         # Global page background color
  fullBleed: true               # Enable edge-to-edge printing with zero browser margin clip
  layout: "cards"               # document | cards | presentation | slides
  margins:                      # Page margins / outer shell padding
    top: "32px"
    bottom: "32px"
    left: "48px"
    right: "48px"
  content_margins:              # Separate inner content spacing
    top: "10px"
    bottom: "10px"
    left: "0px"
    right: "0px"
  renderer: "system-browser"    # system-browser | puppeteer-core | typst | pdfmake

# Table of Contents Configuration (New)
toc:
  enabled: true                 # Master toggle for automatic TOC generation
  title: "Table of Contents"    # Display title for the TOC section
  minDepth: 1                   # Starting heading level (1 = h1)
  maxDepth: 3                   # Deepest heading level (3 = h3)
  ordered: true                 # Numbered (1, 1.1) vs unnumbered bulleted entries
  pageNumbers: true             # Show page numbers with dotted leader lines
  pageBreakAfter: true          # Inject page break after TOC
  position: "after-cover"       # "after-cover" | "inline" | "start"
  exclude:                      # Exclude specific headings or titles
    - "License"
    - "Appendix*"

# Typography & Font Selectors (Local & Remote)
typography:
  fonts:
    # 1. Local font files with weight & style variants (100% offline)
    - name: "Geist"
      source: "local"
      variants:
        - path: "./assets/fonts/Geist-Regular.woff2"
          weight: 400
          style: "normal"
        - path: "./assets/fonts/Geist-Medium.woff2"
          weight: 500
          style: "normal"
        - path: "./assets/fonts/Geist-Bold.woff2"
          weight: 700
          style: "normal"
        - path: "./assets/fonts/Geist-Italic.woff2"
          weight: 400
          style: "italic"

    # 2. Local font single-file shorthand
    - name: "JetBrains Mono"
      source: "local"
      path: "./assets/fonts/JetBrainsMono-Regular.woff2"
      weight: 400

    # 3. System-installed OS font (zero download, uses host fonts)
    - name: "Segoe UI"
      source: "system"

    # 4. Google Fonts / CDN font (optional online fallback)
    - name: "Inter"
      source: "google"
      url: "https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap"

  selectors:
    body: "'Geist', 'Segoe UI', -apple-system, BlinkMacSystemFont, sans-serif"
    headings: "'Geist', 'Segoe UI', -apple-system, sans-serif"
    code: "'JetBrains Mono', Consolas, SFMono-Regular, monospace"
    cover: "'Geist', 'Segoe UI', sans-serif"
  fontSize:
    base: "11pt"
    h1: "24pt"
    h2: "18pt"
    h3: "14pt"
    h4: "12pt"
  lineHeight: 1.6

# Theme & Custom Styles
theme:
  css: "./theme/style.css"
```

---

## 2. Table of Contents (TOC) Configuration

Paperforge features an automated, configurable TOC engine that scans the document headings and synthesizes a professional table of contents with leader lines, hyperlinked page anchors, and dynamic page numbering.

### Configuration Fields (`toc`)

| Field | Type | Default | Description |
| :--- | :--- | :--- | :--- |
| `enabled` | `boolean` | `true` | Enables or disables TOC generation. |
| `title` | `string` | `"Table of Contents"` | Heading displayed above the TOC. |
| `minDepth` | `number` | `1` | Minimum heading level to include (`1` for `#`). |
| `maxDepth` | `number` | `3` | Maximum heading level to include (`3` for `###`). |
| `ordered` | `boolean` | `true` | When true, renders hierarchical numbering (`1.`, `1.1`, `1.1.1`). |
| `pageNumbers` | `boolean` | `true` | Renders dotted leader lines and target page numbers. |
| `pageBreakAfter`| `boolean` | `true` | Ensures content following the TOC starts on a clean page. |
| `position` | `enum` | `"after-cover"` | Where TOC is inserted: `after-cover`, `start`, or `inline`. |
| `exclude` | `string[]` | `[]` | Glob patterns or exact strings of heading titles to omit. |

---

## 3. Typography & Font Selector Configuration

To ensure publications avoid default serif browser fonts and achieve a distinctive branded aesthetic, Paperforge provides a dedicated `typography` block with first-class support for **both local offline fonts and web fonts**.

### Key Capabilities

1. **First-Class Local Font Support (100% Offline):**
   * Authors can bundle `.woff2`, `.woff`, `.ttf`, and `.otf` files directly inside `assets/fonts/`.
   * Supports **multi-variant definitions** (Regular, Medium, Bold, Italic) for a single font family name.
   * Local font files are validated during `paperforge validate` and Base64-inlined into the generated CSS during build, guaranteeing complete offline determinism with zero external network dependencies.
2. **Operating System Fonts (`source: "system"`):**
   * Direct access to pre-installed platform typography (`Segoe UI` on Windows, `SF Pro` / `Helvetica Neue` on macOS, `Ubuntu` / `Cantarell` on Linux) without embedding or downloading any files.
3. **Google Fonts & Web Fonts (`source: "google"` / `source: "web"`):**
   * Injects optimized `<link>` or `@import` declarations into the rendering pipeline for projects that prefer hosted typography.
4. **Semantic Font Selectors:**
   * `body`: Body copy, paragraphs, lists, and tables.
   * `headings`: `h1` through `h6`.
   * `code`: Inline code, fenced code blocks, and pre elements.
   * `cover`: Hero titles, subtitles, and author callouts on the cover page.
5. **Scale Control:** Fine-tune base font sizes, line heights, and heading scales in standard print units (`pt`, `rem`, `px`).

### Font Configuration Schema

| Property | Type | Options | Description |
| :--- | :--- | :--- | :--- |
| `name` | `string` | e.g. `"Geist"`, `"Inter"` | The font-family name used in CSS rules. |
| `source` | `enum` | `"local"`, `"system"`, `"google"`, `"web"` | Where the font originates. |
| `path` | `string` | e.g. `"./assets/fonts/font.woff2"` | Path to local font file (shorthand for single variant). |
| `variants` | `array` | List of `{ path, weight, style }` | Explicit weights (400, 500, 700) and styles (normal, italic). |
| `url` | `string` | Valid HTTP(S) URL | Web font URL when `source: "google"` or `"web"`. |

---

## 4. Configuration Precedence

Paperforge enforces strict configuration hierarchy. More specific configurations override broader defaults:

```text
┌──────────────────────────────────────────────┐
│             1. CLI Arguments                 │  (e.g., --output ./custom.pdf --verbose)
└──────────────────────┬───────────────────────┘
                       ▼
┌──────────────────────────────────────────────┐
│         2. Document Frontmatter              │  (Per-document frontmatter overrides)
└──────────────────────┬───────────────────────┘
                       ▼
┌──────────────────────────────────────────────┐
│        3. Project Config (paperforge.yaml)   │  (Project-wide definitions)
└──────────────────────┬───────────────────────┘
                       ▼
┌──────────────────────────────────────────────┐
│             4. Built-in Defaults             │  (Engine fallback defaults)
└──────────────────────────────────────────────┘
```

### Example

If `paperforge.yaml` defines:
```yaml
pdf:
  pageNumbers: true
```

An individual chapter can disable page numbering:
```markdown
---
title: Full Page Visual
page_numbers: false
---
```

---

## 5. Markdown Frontmatter Specification

Every document in `content/` may contain a YAML frontmatter block at the top of the file:

```markdown
---
title: "Discounted Cash Flow Analysis"
subtitle: "Valuation models and sensitivity metrics"
order: 3
type: "chapter"
toc: true
page_break_before: true
page_break_after: false
header: true
footer: true
author: "Vivek Kushwaha"
description: "In-depth DCF methodology for tech equities."
keywords: ["finance", "DCF", "valuation"]
---

# Discounted Cash Flow Analysis

Content begins here...
```

### Frontmatter Schema

#### Content Properties
* `title` (`string`): Document title used in headers, TOC, and PDF bookmarks.
* `subtitle` (`string`, optional): Subtitle or section overview.
* `order` (`number`, optional): Explicit sequence index for publication assembly.
* `type` (`string`, default: `"chapter"`): Document category (`chapter`, `appendix`, `cover`, `blank`).
* `author` (`string`, optional): Author override for this chapter.
* `description` (`string`, optional): Chapter summary.

#### Layout & Pagination Properties
* `toc` (`boolean`, default: `true`): Set to `false` to omit this document's headings from the Table of Contents.
* `toc_depth` (`number`, optional): Per-document override for maximum heading depth.
* `page_break_before` (`boolean`, default: `true`): Forces a page break immediately before this chapter begins.
* `page_break_after` (`boolean`, default: `false`): Forces a page break after this chapter finishes.
* `header` (`boolean`, default: `true`): Controls whether the running header appears on this document's pages.
* `footer` (`boolean`, default: `true`): Controls whether the running footer appears on this document's pages.
* `page_numbers` (`boolean`, default: `true`): Controls page counter visibility on this document.

#### Styling & Visual Properties (New)
* `background` (`string`, optional): Custom background color or gradient for this specific page (e.g. `"#0B0F19"`, `"#061A23"`). Fills the entire page including margin areas.
* `margins` (`string | object`, optional): Overrides page shell margins/padding for this document (e.g. `"32px 48px"` or `{ top: "20mm", bottom: "20mm", left: "20mm", right: "20mm" }`).
* `content_margins` (`string | object`, optional): Separate inner content spacing/margin (e.g. `"10px 0px"`).
* `accent_color` (`string`, optional): Primary accent color for headers, badges, and card boundaries (e.g. `"#DFBA87"`, `"#38BDF8"`).
* `className` (`string`, optional): Additional CSS class names attached to the page container for targeted CSS styling.
* `style` (`string`, optional): Inline CSS rules applied directly to this page's root container.

#### Metadata Properties & Dynamic Overrides
* `metadata` (`record<string, any>`, optional): Dynamic PDF metadata dictionary. Values defined in frontmatter override the global `paperforge.yaml` metadata.
* `subject` (`string`, optional): Injected into PDF `/Subject` dictionary and XMP metadata.
* `keywords` (`string[]`, optional): Injected into PDF `/Keywords` dictionary and search indexes.
* `language` (`string`, optional, e.g., `"en-US"`)
* `version` (`string`, optional)
* `copyright` (`string`, optional)

---

## 6. Document Ordering Rules

Paperforge determines document sequence using a deterministic, 3-tier precedence algorithm:

1. **Explicit Frontmatter Order:** Documents containing an `order` integer are placed in ascending numerical order (`order: 1`, `order: 2`, etc.).
2. **Lexicographical Filename Ordering:** Documents without an explicit `order` fallback to alphabetical/numerical sorting by filename (e.g., `01-intro.md`, `02-guide.md`).
3. **Filesystem Ordering Fallback:** Used only if filenames are identical across nested subdirectories.

---

*Previous Document:* [02. Core Concepts and Structure](./02-core-concepts-and-structure.md)  
*Next Document:* [04. Layout and Styling](./04-layout-and-styling.md)
