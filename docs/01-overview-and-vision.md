# 01. Overview and Vision

> Markdown → Professional PDF publishing CLI

* **Package:** `@vivekkushwaha66/paperforge`
* **Organization:** Vivek Kushwaha Labs
* **License:** MIT
* **Status:** Planned
* **Version:** 0.1.0
* **Runtime:** Node.js (>= 22 LTS)
* **Language:** TypeScript

---

## 1. Product Overview

`@vivekkushwaha66/paperforge` is a developer-first, local-first Node.js CLI that converts a structured collection of Markdown files into a publication-grade PDF.

Markdown remains the sole source of truth for content. YAML frontmatter defines document metadata, ordering, and publishing behavior, while a root configuration file (`paperforge.yaml`) defines global defaults, typography, themes, headers/footers, table of contents, and output settings.

### Core Workflow

```text
Markdown + Frontmatter + Assets + Theme & Typography
                        ↓
             @vivekkushwaha66/paperforge
                        ↓
                 Publication PDF
```

Example usage:

```bash
# Direct execution via npx
npx @vivekkushwaha66/paperforge build ./my-product

# Or global install
npm install -g @vivekkushwaha66/paperforge
paperforge build ./my-product
```

Output:

```text
my-product/
└── dist/
    └── my-product.pdf
```

---

## 2. Problem Statement

Creating professional PDFs from Markdown usually requires stitching together multiple fragmented tools and manually managing:

* Markdown-to-HTML conversion
* Multi-file document ordering
* Page layouts and pagination
* Dynamic headers and footers with page numbering
* Automated, configurable Table of Contents (TOC) with leader dots
* Typography and custom web font loading
* Dedicated cover pages
* PDF metadata (Title, Author, Subject, Keywords, XMP)
* Relative image and asset resolution
* Print-optimized CSS styling
* Heavy PDF rendering engines requiring hundreds of megabytes of downloads

Most existing tools focus narrowly on simple file-by-file conversion. **Paperforge treats document generation as a complete publishing workflow**, making document production reproducible, configurable, and developer-friendly.

---

## 3. Vision

Paperforge makes it possible to maintain an entire publication as version-controlled code. A publication is fully reproducible from:

```text
Markdown + Frontmatter + Configuration + Assets + CSS & Typography
```

Any team member or CI/CD runner can clone a repository and produce the identical publication locally:

```bash
git clone <repository>
npm install
npx @vivekkushwaha66/paperforge build
```

---

## 4. Product Principles

1. **Write in Markdown. Describe with frontmatter. Publish with Paperforge.**
2. **Simplicity > Complexity:** Zero unnecessary abstraction; developers stay in Markdown.
3. **Reproducibility > UI:** Every build is deterministic and version-controllable.
4. **Lightweight & Fast:** Avoid multi-hundred-megabyte mandatory runtime bloat by leveraging system browsers or lightweight native compilation.
5. **Configuration over Manual Editing:** Define layouts, typography, and TOC globally while allowing per-document overrides.

---

## 5. Goals and Non-Goals

### Primary Goals

* **Multi-file Assembly:** Convert multiple Markdown files into a single, cohesive PDF.
* **Source of Truth:** Markdown files and frontmatter define structure and content.
* **Lightweight Engine Footprint:** Avoid bundling 300MB Chromium binaries by default.
* **Configurable Table of Contents:** Automatic generation with configurable depth, numbering, leader dots, and placement.
* **Typography & Font Selectors:** First-class configuration for Google Fonts, local web fonts (`.woff2`), and font family selectors.
* **Page Layouts & Numbers:** Support running headers, footers, cover pages, and page counters (`Page X of Y`).
* **Deterministic Builds:** Guarantee consistent outputs across identical inputs.
* **CLI Validation:** Provide instant, actionable diagnostics for broken asset links or invalid frontmatter.

### Secondary Goals

* Create reusable, shareable themes.
* Ensure output is commercial-grade for digital products, ebooks, engineering manuals, and client reports.
* Maintain an extensible, open-source MIT ecosystem.

### Non-Goals (Initial Release)

The initial release deliberately excludes:

* Web dashboards or cloud document hosting
* User accounts, authentication, or collaboration backends
* In-browser WYSIWYG editors
* AI content generation
* Proprietary databases or SaaS infrastructure
* Payment gateways
* EPUB / DOCX output (deferred to post-MVP)

---

## 6. Target Users & Use Cases

### Target Users

* **Developers & Indie Hackers:** Packaging technical guides, cheat sheets, and digital products.
* **Technical Writers:** Authoring structured engineering specifications and manuals.
* **Consultants & Analysts:** Generating professional whitepapers and client deliverables.
* **Educators & Authors:** Creating structured courses, ebooks, and workshop material.

### Example Use Cases

* AI Prompt Libraries and Engineering Cookbooks
* API Reference Manuals and Architecture Blueprints
* Digital Ebooks and Career Handbooks
* Company Playbooks and SOPs
* Resume and Portfolio Kits

---

*Next Document:* [02. Core Concepts and Structure](./02-core-concepts-and-structure.md)
