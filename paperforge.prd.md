# Paperforge — Product Requirements Document (PRD)

> Markdown → Professional PDF publishing CLI

* **Package:** `@vivekkushwaha66/paperforge`
* **Organization:** Vivek Kushwaha Labs
* **Author:** Vivek Kushwaha
* **License:** [MIT](https://opensource.org/licenses/MIT)
* **Status:** Planned
* **Version:** `0.1.0`
* **Runtime:** Node.js (>= 22 LTS)
* **Language:** TypeScript

---

## Executive Summary

`@vivekkushwaha66/paperforge` is a local-first, developer-friendly Node.js command-line publishing tool that converts a structured collection of Markdown files into publication-grade PDFs.

Paperforge treats document generation not merely as basic file-by-file conversion, but as a **reproducible publishing workflow as code**. Authors write in clean Markdown with YAML frontmatter, configure global design tokens and typography in a single `paperforge.yaml` file, and generate deterministic, commercial-grade digital publications, ebooks, technical reports, and whitepapers.

```text
Markdown + Frontmatter + Assets + Theme & Typography
                        ↓
             @vivekkushwaha66/paperforge
                        ↓
                 Publication PDF
```

---

## Documentation Suite Index

The Paperforge Product Requirements Document is modularized into nine focused specifications in the [`docs/`](./docs) directory. Follow the links below for comprehensive technical specifications:

### 1. [Overview, Problem Statement, and Vision](./docs/01-overview-and-vision.md)
* [1. Product Overview](./docs/01-overview-and-vision.md#1-product-overview)
* [2. Problem Statement](./docs/01-overview-and-vision.md#2-problem-statement)
* [3. Vision & Workflow](./docs/01-overview-and-vision.md#3-vision)
* [4. Product Principles](./docs/01-overview-and-vision.md#4-product-principles)
* [5. Goals and Non-Goals](./docs/01-overview-and-vision.md#5-goals-and-non-goals)
* [6. Target Users & Commercial Use Cases](./docs/01-overview-and-vision.md#6-target-users--use-cases)

### 2. [Core Concepts and Project Structure](./docs/02-core-concepts-and-structure.md)
* [1. Core Concepts (Project, Document, Publication, Theme, Build)](./docs/02-core-concepts-and-structure.md#1-core-concepts)
* [2. Standard Project Structure & File Conventions](./docs/02-core-concepts-and-structure.md#2-standard-project-structure)
* [3. Real-World Digital Product Example (`ai-stock-research`)](./docs/02-core-concepts-and-structure.md#3-real-world-example-digital-product-publication)

### 3. [Configuration, Frontmatter, and Ordering](./docs/03-configuration-and-frontmatter.md)
* [1. Project Configuration Schema (`paperforge.yaml`)](./docs/03-configuration-and-frontmatter.md#1-project-configuration-paperforgeyaml)
* [2. Configurable Table of Contents (TOC) Options](./docs/03-configuration-and-frontmatter.md#2-table-of-contents-toc-configuration)
* [3. Typography & Font Selector Configuration](./docs/03-configuration-and-frontmatter.md#3-typography--font-selector-configuration)
* [4. 4-Tier Configuration Precedence](./docs/03-configuration-and-frontmatter.md#4-configuration-precedence)
* [5. Markdown Frontmatter Specification](./docs/03-configuration-and-frontmatter.md#5-markdown-frontmatter-specification)
* [6. Deterministic Document Ordering Rules](./docs/03-configuration-and-frontmatter.md#6-document-ordering-rules)

### 4. [Layout, Styling, and Typography](./docs/04-layout-and-styling.md)
* [1. Markdown-based Running Headers and Footers](./docs/04-layout-and-styling.md#1-running-headers-and-footers)
* [2. Template Interpolation Variables (`{{title}}`, `{{page}}`, `{{pages}}`)](./docs/04-layout-and-styling.md#template-interpolation-variables)
* [3. Dedicated Full-Bleed Cover Page](./docs/04-layout-and-styling.md#2-dedicated-cover-page)
* [4. Table of Contents Engine & Dotted Leader Styling](./docs/04-layout-and-styling.md#3-table-of-contents-toc-engine--styling)
* [5. Typography Pipeline & Font Selectors CSS Mapping](./docs/04-layout-and-styling.md#4-typography-system--font-selectors)
* [6. CSS Themes & Print Layout Tokens (`@page`)](./docs/04-layout-and-styling.md#5-css-themes-and-page-layout-rules)
* [7. Vivek Kushwaha Labs Signature Theme (Obsidian & Champagne)](./docs/04-layout-and-styling.md#6-official-theme-vivek-kushwaha-labs-theme)

### 5. [PDF Metadata and Asset Management](./docs/05-pdf-metadata-and-assets.md)
* [1. Standard PDF `/Info` & XMP Metadata Generation](./docs/05-pdf-metadata-and-assets.md#1-pdf-metadata-generation)
* [2. Relative Asset Path Resolution Engine](./docs/05-pdf-metadata-and-assets.md#2-asset-resolution-engine)
* [3. Supported Media Formats (SVG, PNG, JPG, WebP)](./docs/05-pdf-metadata-and-assets.md#supported-media-formats)
* [4. Offline Base64 Embedding & Broken Asset Diagnostics](./docs/05-pdf-metadata-and-assets.md#broken-asset-validation)

### 6. [CLI Commands and Build Pipeline](./docs/06-cli-and-build-pipeline.md)
* [1. CLI Commands (`init`, `build`, `validate`, `preview`)](./docs/06-cli-and-build-pipeline.md#1-cli-commands)
* [2. CLI Options and Runtime Flags](./docs/06-cli-and-build-pipeline.md#12-paperforge-build-project-path)
* [3. 14-Stage Build Pipeline Architecture & Sequence](./docs/06-cli-and-build-pipeline.md#2-build-pipeline-architecture)

### 7. [Architecture, Tech Stack, and Lightweight PDF Engines](./docs/07-architecture-and-tech-stack.md)
* [1. The Problem with Heavy Browsers (Puppeteer/Playwright 300MB Downloads)](./docs/07-architecture-and-tech-stack.md#1-the-heavy-engine-problem-why-not-standard-puppeteer-or-playwright)
* [2. Evaluation of Lightweight PDF Generation Alternatives](./docs/07-architecture-and-tech-stack.md#2-evaluation-of-pdf-generation-alternatives)
* [3. Recommended Architecture: Pluggable `IPdfRenderer` Layer](./docs/07-architecture-and-tech-stack.md#3-recommended-architecture-the-pluggable-engine-layer)
* [4. System Browser Auto-Detection Engine (`puppeteer-core` + Chrome/Edge)](./docs/07-architecture-and-tech-stack.md#engine-1-system-browser-auto-detection-default)
* [5. Native Fast Typst Engine Adapter](./docs/07-architecture-and-tech-stack.md#engine-2-typst-engine-adapter-optional-native-compiler)
* [6. Technology Stack & TypeScript Dependencies](./docs/07-architecture-and-tech-stack.md#4-technology-stack)
* [7. Modular Source Directory Structure](./docs/07-architecture-and-tech-stack.md#5-suggested-source-code-structure)
* [8. Internal Document Model Interfaces](./docs/07-architecture-and-tech-stack.md#6-document-model)

### 8. [Quality, Operations, and Security](./docs/08-quality-operations-and-security.md)
* [1. Pre-Build Validation Matrix](./docs/08-quality-operations-and-security.md#1-project-validation-matrix)
* [2. Actionable Error Handling & CLI Diagnostics](./docs/08-quality-operations-and-security.md#2-error-handling--diagnostics)
* [3. Byte-for-Byte Reproducibility Standards](./docs/08-quality-operations-and-security.md#3-determinism-and-reproducibility)
* [4. Performance Benchmarks (< 3.5s Small, < 8s Medium)](./docs/08-quality-operations-and-security.md#4-performance-targets)
* [5. Document Accessibility & Vector Text Streams](./docs/08-quality-operations-and-security.md#5-accessibility)
* [6. Local-First Security Sandbox](./docs/08-quality-operations-and-security.md#6-security-sandbox)

### 9. [Roadmap, Ecosystem, and Initial Release](./docs/09-roadmap-and-releases.md)
* [1. MVP Scope Checklist (v0.1.0)](./docs/09-roadmap-and-releases.md#1-mvp-scope-checklist)
* [2. Post-MVP Feature Roadmap (v0.2.0+)](./docs/09-roadmap-and-releases.md#2-post-mvp-roadmap-v020)
* [3. Initial Release Specifications (`@vivekkushwaha66/paperforge@0.1.0`)](./docs/09-roadmap-and-releases.md#3-initial-release-specifications)
* [4. Real-World Commercial Validation Products](./docs/09-roadmap-and-releases.md#4-success-criteria)

---

## Key Specification Highlights

### 1. Configurable Table of Contents (TOC)
Paperforge introduces declarative configuration for generating clean, linked tables of contents:

```yaml
# In paperforge.yaml
toc:
  enabled: true
  title: "Table of Contents"
  minDepth: 1
  maxDepth: 3
  ordered: true
  pageNumbers: true
  pageBreakAfter: true
  position: "after-cover"
  exclude:
    - "License"
    - "Appendix*"
```
*(Read full details in [03. Configuration & Frontmatter](./docs/03-configuration-and-frontmatter.md#2-table-of-contents-toc-configuration) and [04. Layout & Styling](./docs/04-layout-and-styling.md#3-table-of-contents-toc-engine--styling))*

### 2. Local & Remote Typography with Font Selectors
Authors can specify local font files (100% offline via Base64 inlining), pre-installed system fonts, or Google Fonts, complete with weight/style variants and semantic font selectors:

```yaml
# In paperforge.yaml
typography:
  fonts:
    # Local font with multi-weight variants (fully offline)
    - name: "Geist"
      source: "local"
      variants:
        - path: "./assets/fonts/Geist-Regular.woff2"
          weight: 400
          style: "normal"
        - path: "./assets/fonts/Geist-Bold.woff2"
          weight: 700
          style: "normal"
    # Local monospace font
    - name: "JetBrains Mono"
      source: "local"
      path: "./assets/fonts/JetBrainsMono-Regular.woff2"
      weight: 400
    # Pre-installed OS font
    - name: "Segoe UI"
      source: "system"
  selectors:
    body: "'Geist', 'Segoe UI', -apple-system, sans-serif"
    headings: "'Geist', 'Segoe UI', sans-serif"
    code: "'JetBrains Mono', Consolas, monospace"
    cover: "'Geist', 'Segoe UI', sans-serif"
```
*(Read full details in [03. Configuration & Frontmatter](./docs/03-configuration-and-frontmatter.md#3-typography--font-selector-configuration) and [04. Layout & Styling](./docs/04-layout-and-styling.md#4-typography-system--font-selectors))*

### 3. Lightweight PDF Engine Architecture
To avoid the standard ~300MB download imposed by Puppeteer/Playwright, Paperforge decouples PDF generation via an abstract `IPdfRenderer` interface:
* **Default Engine (`system-browser`):** Uses `puppeteer-core` (only ~3.5MB) and auto-detects pre-installed system browsers (Microsoft Edge on Windows, Google Chrome/Chromium on Mac/Linux) with zero browser downloads required during install.
* **Optional Native Engine (`typst`):** Pluggable backend compiling to PDF in under 100 milliseconds without any browser dependencies.
* **Minimal Fallback:** Optional `paperforge install-browser` pulling minimal `chrome-headless-shell` (~40MB) only when running in bare headless containers.

*(Read full comparative analysis in [07. Architecture, Tech Stack, and Lightweight PDF Engines](./docs/07-architecture-and-tech-stack.md))*

---

## Quick Start

```bash
# Execute directly via npx
npx @vivekkushwaha66/paperforge build ./my-publication

# Or install globally
npm install -g @vivekkushwaha66/paperforge
paperforge build ./my-publication
```

---

*Authored by [Vivek Kushwaha](https://github.com/vivekkushwaha66) — Licensed under the [MIT License](https://opensource.org/licenses/MIT).*
