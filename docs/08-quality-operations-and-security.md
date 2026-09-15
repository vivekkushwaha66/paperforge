# 08. Quality, Operations, and Security

> Operational standards: validation, error handling, performance, reproducibility, and local security

* **Package:** `@vivekkushwaha66/paperforge`
* **License:** MIT

---

## 1. Project Validation Matrix

Running `paperforge validate` checks the integrity of the project across four distinct layers before invoking any rendering engine:

```text
┌────────────────────────────────────────────────────────┐
│                   Validation Checks                    │
├───────────────────┬────────────────────────────────────┤
│ Configuration     │ • Valid YAML syntax                │
│                   │ • Strict schema typing via Zod     │
│                   │ • Valid font and theme file paths  │
├───────────────────┼────────────────────────────────────┤
│ Documents         │ • Well-formed YAML frontmatter     │
│                   │ • Unique 'order' values            │
│                   │ • Title defined for each chapter   │
├───────────────────┼────────────────────────────────────┤
│ Assets & Media    │ • All referenced images exist      │
│                   │ • Supported extensions (SVG, PNG)  │
│                   │ • Valid relative path references   │
├───────────────────┼────────────────────────────────────┤
│ Publication       │ • Cover file exists if configured  │
│                   │ • Header/footer templates resolved │
│                   │ • Non-empty document sequence      │
└───────────────────┴────────────────────────────────────┘
```

---

## 2. Error Handling & Diagnostics

CLI errors are formatted to be immediately actionable, pinpointing the exact file and line number:

### Example Validation Error

```text
Paperforge Diagnostics

✗ Validation failed with 1 error and 1 warning:

  ERROR  content/03-valuation.md:18
  Referenced image not found: assets/charts/dcf-graph.png
  Target path resolved to: D:/projects/paperforge/assets/charts/dcf-graph.png

  WARN   content/01-introduction.md:4
  Document is missing 'description' frontmatter field.

Run 'paperforge validate --fix' to attempt automatic remediation.
```

### Stack Traces & Debugging

* By default, raw Node.js stack traces are suppressed to maintain clean terminal output.
* Running with `--verbose` or setting `DEBUG=paperforge:*` exposes full execution traces and engine logs.

---

## 3. Determinism and Reproducibility

A core design tenet of `@vivekkushwaha66/paperforge` is byte-for-byte reproducibility:

* **Fixed Metadata Ordering:** Dictionary keys in PDF `/Info` and XMP metadata are sorted alphabetically.
* **Deterministic Asset Embedding:** Base64-embedded assets and CSS rules are injected in stable, deterministic order.
* **Source Protection:** Compiling a PDF never mutates, rewrites, or leaves temporary scratch files inside the source Markdown directory.

---

## 4. Performance Targets

| Document Size | Benchmark Criteria | Target Duration |
| :--- | :--- | :--- |
| **Small Publication** | 1 to 5 chapters (< 20 pages, < 10 images) | **< 3.5 seconds** |
| **Medium Publication** | 6 to 20 chapters (20–100 pages, rich diagrams) | **< 8.0 seconds** |
| **Large Book** | 20+ chapters (100–300 pages, extensive tables) | **< 18.0 seconds** |

### Memory Consumption

Memory utilization is capped under **300MB RAM** by streaming document pages and releasing in-memory DOM representations immediately after PDF generation.

---

## 5. Accessibility

Generated PDFs follow modern document accessibility best practices:

* **True Selectable Text:** Typography and headings are compiled as native vector glyphs with selectable text streams.
* **PDF Bookmarks / Outline:** Markdown `h1` through `h3` headings are compiled into the PDF reader's left navigation outline.
* **Semantic Tagging:** Uses semantic HTML (`<article>`, `<header>`, `<footer>`, `<figure>`, `<nav>`) to assist screen readers.
* **High-Contrast Typography:** Built-in themes enforce a minimum contrast ratio of 4.5:1 for body copy.

---

## 6. Security Sandbox

Paperforge operates exclusively in local-first mode:

1. **Local Resource Sandboxing:** The rendering engine operates with restricted origins, preventing arbitrary network calls unless explicitly permitted in `paperforge.yaml`.
2. **Path Traversal Protection:** Relative asset paths (e.g., `../../secret.txt`) cannot escape the project root directory.
3. **No External Analytics:** Paperforge transmits zero telemetry, analytics, or user document metrics.

---

*Previous Document:* [07. Architecture and Tech Stack](./07-architecture-and-tech-stack.md)  
*Next Document:* [09. Roadmap and Releases](./09-roadmap-and-releases.md)
