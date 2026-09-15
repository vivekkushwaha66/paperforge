# Paperforge (`@vivekkushwaha66/paperforge`)

> Markdown → Publication-grade PDF publishing CLI

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)
[![Node.js](https://img.shields.io/badge/Node.js-%3E%3D22.0.0-green.svg)](https://nodejs.org/)

Paperforge is a local-first, developer-friendly command-line publishing tool that converts a structured collection of Markdown files into publication-grade, commercial-quality PDFs.

It treats document generation as a **reproducible publishing workflow as code**. Authors write in clean Markdown with YAML frontmatter, configure global typography and design tokens in `paperforge.yaml`, and generate deterministic digital publications, ebooks, technical reports, and whitepapers.

---

## Key Highlights

* **Lightweight Zero-Download Engine:** Uses `puppeteer-core` with automatic system browser discovery (Microsoft Edge on Windows, Google Chrome/Chromium on macOS and Linux) — **zero ~300MB downloads during npm install**.
* **3-Tier Deterministic Ordering:** Explicit frontmatter `order` -> lexicographical filename -> filesystem fallback.
* **Configurable Table of Contents (TOC):** Declarative depth, dotted leader lines, anchor navigation, and page counters.
* **Typography & Font Selectors:** Local offline fonts (`.woff2`, `.woff`, `.ttf`, `.otf` with weight/style variants) with 100% Base64 inlining, system fonts, and Google Fonts.
* **Running Headers & Footers:** Dynamic template interpolation (`{{title}}`, `{{chapter}}`, `{{author}}`, `{{page}}`, `{{pages}}`).
* **Dedicated Cover Pages:** Full-bleed custom cover generation with independent styling.
* **Vector Graphics & Asset Resolution:** Automatic relative path resolution and offline Base64 inlining for SVG, PNG, JPG, and WebP.
* **Standard PDF /Info & XMP Metadata:** Injects Title, Author, Subject, Keywords, Creator, and Producer tags.
* **Rich Chalk CLI & Diagnostic Error Logs:** Timestamped execution traces and automatic `.paperforge/logs/build-error-<timestamp>.log` generation on build issues.

---

## Quick Start

### Direct Execution via NPX

```bash
npx @vivekkushwaha66/paperforge build ./my-publication
```

### Global Installation

```bash
npm install -g @vivekkushwaha66/paperforge
paperforge build ./my-publication
```

---

## CLI Commands

### 1. Scaffold a New Project (`paperforge init`)

```bash
# Quickly bootstrap current directory with defaults (non-interactive)
paperforge init -y

# Quickly bootstrap a new directory with default settings
paperforge init my-guide -y

# Bootstrap with custom title and author
paperforge init my-guide -y --title "Distributed Systems Handbook" --author "Vivek Kushwaha"

# Scaffold with signature Vivek Kushwaha Labs theme (Obsidian & Champagne)
paperforge init my-guide --theme vivek-kushwaha-labs
```

### 2. Validate Project Integrity (`paperforge validate`)

```bash
paperforge validate ./my-guide
```

Verifies YAML schema, font paths, image references on disk, and unique document order sequences without rendering.

### 3. Build Distribution PDF (`paperforge build`)

```bash
paperforge build ./my-guide

# Custom output file
paperforge build ./my-guide -o ./dist/custom-name.pdf

# Verbose debug logging
paperforge build ./my-guide --verbose
```

### 4. Local HTML Preview Server (`paperforge preview`)

```bash
paperforge preview ./my-guide --port 3000
```

---

## Project Structure

A standard Paperforge publication layout:

```text
my-publication/
├── paperforge.yaml            # Primary project configuration
├── cover.md                   # Dedicated front cover document
├── header.md                  # Reusable running header template
├── footer.md                  # Reusable running footer template
├── content/                   # Chapter and section Markdown documents
│   ├── 01-introduction.md
│   ├── 02-methodology.md
│   └── 03-summary.md
├── assets/                    # Media and embedded assets
│   ├── images/
│   │   └── diagram.svg
│   └── fonts/                 # Local offline fonts
│       └── CustomFont.woff2
├── theme/                     # Custom stylesheet overrides
│   └── style.css
└── dist/                      # Output directory
    └── my-publication.pdf
```

---

## Configuration (`paperforge.yaml`)

```yaml
title: "AI Stock Research Prompt Library"
subtitle: "A practical framework for AI-assisted equity analysis"
author: "Vivek Kushwaha"
version: "1.0.0"
date: "September 2026"

output:
  file: "./dist/stock-research.pdf"

content:
  directory: "./content"
  include: ["*.md"]

pdf:
  format: "A4"
  orientation: "portrait"
  margins:
    top: "20mm"
    bottom: "20mm"
    left: "20mm"
    right: "20mm"

toc:
  enabled: true
  title: "Table of Contents"
  minDepth: 1
  maxDepth: 3
  ordered: true
  pageNumbers: true
  pageBreakAfter: true

typography:
  selectors:
    body: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
    headings: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
    code: "'SFMono-Regular', Consolas, Monaco, monospace"
    cover: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"

theme:
  name: "vivek-kushwaha-labs"
  css: "./theme/style.css"
```

---

## License

[MIT](LICENSE) © 2026 Vivek Kushwaha (Vivek Kushwaha Labs)
