# 02. Core Concepts and Project Structure

> Understanding Paperforge entities and project organization

* **Package:** `@vivekkushwaha66/paperforge`
* **License:** MIT

---

## 1. Core Concepts

Paperforge revolves around five foundational concepts:

```text
┌────────────────────────────────────────────────────────┐
│                        Project                         │
│  (paperforge.yaml + theme/ + assets/ + content/)       │
│                                                        │
│  ┌──────────────┐   ┌──────────────┐   ┌────────────┐  │
│  │   Document   │   │   Document   │   │  Document  │  │
│  │  (intro.md)  │   │  (guide.md)  │   │ (stats.md) │  │
│  └──────┬───────┘   └──────┬───────┘   └─────┬──────┘  │
│         └──────────────────┼─────────────────┘         │
│                            ▼                           │
│                       Publication                      │
│             (Ordered Document Sequence)                │
│                            │                           │
│                            ▼                           │
│                      Theme Engine                      │
│             (Typography + CSS + Layouts)               │
│                            │                           │
│                            ▼                           │
│                     Build Pipeline                     │
│                            │                           │
│                            ▼                           │
│                    Distribution PDF                    │
└────────────────────────────────────────────────────────┘
```

### 1.1 Project
A directory containing the root configuration (`paperforge.yaml`), Markdown source documents, media assets, typography definitions, cover templates, headers/footers, and custom CSS stylesheets.

### 1.2 Document
An individual Markdown file (`.md`) equipped with optional YAML frontmatter. Frontmatter declares document-level behavior (title, ordering, TOC inclusion, page breaks, header/footer visibility, and metadata).

### 1.3 Publication
The synthesized multi-document book or paper. It combines all ordered documents into a single logical entity, resolving global page sequences, cross-references, and Table of Contents entries.

### 1.4 Theme
The styling rules, typography tokens, font selectors, and CSS Paged Media `@page` definitions that transform raw HTML content into polished, print-ready pages.

### 1.5 Build
The deterministic compilation process: scanning files, parsing frontmatter, evaluating configuration precedence, compiling Markdown, assembling TOC and headers/footers, generating metadata, and rendering the final PDF.

---

## 2. Standard Project Structure

A standard `@vivekkushwaha66/paperforge` project uses the following directory layout:

```text
my-publication/
├── paperforge.yaml            # Primary project configuration
├── cover.md                   # Dedicated front cover document
├── header.md                  # Reusable running header template
├── footer.md                  # Reusable running footer template
├── content/                   # Chapter and section Markdown documents
│   ├── 01-introduction.md
│   ├── 02-methodology.md
│   ├── 03-deep-dive.md
│   └── 04-summary.md
├── assets/                    # Media and embedded assets
│   ├── images/
│   │   ├── banner.png
│   │   └── diagram.svg
│   └── fonts/                 # Optional local web fonts
│       └── CustomFont.woff2
├── theme/                     # Custom stylesheet overrides
│   └── style.css
└── dist/                      # Output directory (git-ignored)
    └── my-publication.pdf
```

---

## 3. Real-World Example: Digital Product Publication

Below is an end-to-end example project modeling a commercial digital product:

### File Tree

```text
ai-stock-research/
├── paperforge.yaml
├── cover.md
├── header.md
├── footer.md
├── theme/
│   └── style.css
├── assets/
│   ├── brand-logo.svg
│   └── valuation-matrix.png
└── content/
    ├── 01-executive-summary.md
    ├── 02-qualitative-analysis.md
    ├── 03-financial-statements.md
    ├── 04-discounted-cash-flow.md
    └── 05-prompt-templates.md
```

### Build Command

```bash
npx @vivekkushwaha66/paperforge build ./ai-stock-research
```

### Build Result

```text
dist/
└── ai-stock-research.pdf
```

The output PDF is completely self-contained, with crisp vector graphics, embedded font faces, clickable TOC links, running headers with page counters, and full PDF document properties.

---

*Previous Document:* [01. Overview and Vision](./01-overview-and-vision.md)  
*Next Document:* [03. Configuration and Frontmatter](./03-configuration-and-frontmatter.md)
