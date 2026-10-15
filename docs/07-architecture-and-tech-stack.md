# 07. Architecture, Tech Stack, and Lightweight PDF Engines

> System architecture, modular engine abstraction, and alternatives to heavy headless browsers

* **Package:** `@vivekkushwaha66/paperforge`
* **License:** MIT

---

## 1. The Heavy Engine Problem: Why Not Standard Puppeteer or Playwright?

Standard `puppeteer` and `playwright` packages automatically download a dedicated **170MB – 350MB Chromium / browser revision** during `npm install`.

For a developer CLI tool, this creates significant drawbacks:
* **Slow `npm install` and `npx` execution:** Downloading 300MB slows down CI pipelines and creates a painful first-run user experience.
* **Disk bloat:** Multiple projects or global installs consume gigabytes of redundant browser caches.
* **Firewall / Network issues:** Corporate or restricted networks frequently block automated binary downloads from Google/Chromium CDNs.

---

## 2. Evaluation of PDF Generation Alternatives

To provide a lightweight CLI footprint while retaining high visual fidelity, we evaluated five technical approaches:

| Approach | Package Size | Bundled Browser | HTML5 / CSS Paged Media Support | Speed | Windows / Mac / Linux Portability |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Standard Puppeteer / Playwright** | ~300 MB | Yes (mandatory) | 100% full web standards | Medium | High |
| **`puppeteer-core` + System Browser (Recommended Default)** | **~3.5 MB** | **No** (uses system Chrome/Edge) | **100% full web standards** | **Fast** | **Universal** (Edge is built-in on Windows; Chrome/Chromium ubiquitous on Mac/Linux) |
| **Typst (`@myriaddreamin/typst-ts-node`)** | ~15 MB | No (Native Wasm/Rust) | Typst typesetting language (Not HTML/CSS) | Instant (<100ms) | Universal |
| **WeasyPrint** | ~20 MB (Python + Cairo) | No | High CSS Paged Media support | Medium | Low (Requires native C libraries: Cairo, Pango, GObject) |
| **PDFKit / jsPDF** | ~4 MB | No | Minimal (No CSS, no Flexbox, manual drawing) | Very Fast | High |
| **`chrome-headless-shell`** | ~40 MB | Optional minimal binary | 100% full web standards | Fast | Universal |

---

## 3. Recommended Architecture: The Pluggable Engine Layer

Paperforge adopts an **Abstract Renderer Interface** (`IPdfRenderer`) with **System Browser Detection via `puppeteer-core`** as the default engine, accompanied by optional native backends.

```text
                      ┌───────────────────────────┐
                      │    Paperforge Pipeline    │
                      └─────────────┬─────────────┘
                                    │
                                    ▼
                      ┌───────────────────────────┐
                      │       IPdfRenderer        │
                      │  (Abstract Engine Layer)  │
                      └──────┬─────────────┬──────┘
                             │             │
              ┌──────────────┘             └─────────────┐
              ▼                                          ▼
┌───────────────────────────┐              ┌───────────────────────────┐
│   System Browser Engine   │ (Default)    │       Typst Engine        │ (High-Perf Native)
│     (puppeteer-core)      │              │   (@myriaddreamin/typst)  │
├───────────────────────────┤              ├───────────────────────────┤
│ • Zero browser download   │              │ • Zero browser needed     │
│ • Uses Chrome or MS Edge  │              │ • Sub-second build times  │
│ • Full CSS Paged Media    │              │ • Typographical perf      │
│ • Package size: < 4 MB    │              │ • Package size: ~15 MB    │
└───────────────────────────┘              └───────────────────────────┘
```

### Engine 1: System Browser Auto-Detection (Default)

* Uses `puppeteer-core` (only the lightweight Node.js CDP client without any Chromium binary).
* Uses `chrome-launcher` to auto-discover existing browser installations:
  * **Windows:** Microsoft Edge (installed on 100% of modern Windows PCs) or Google Chrome / Brave.
  * **macOS:** Google Chrome, Microsoft Edge, or Chromium.
  * **Linux:** Chromium, Google Chrome.
* **Result:** Instant installation (< 5 MB npm footprint), zero binary downloads, and 100% support for CSS Grid, Flexbox, `@page`, Google Fonts, and SVGs.
* **Graceful Fallback:** If no browser is found in a stripped-down Docker container, Paperforge provides `paperforge install-browser` which pulls only the stripped **`chrome-headless-shell`** (~40MB vs 300MB).

### Engine 2: PDFMake & Direct Vector SVG Engine

* Pure JavaScript PDF generator executing directly in Node.js with **zero browser dependencies**.
* Compiles Markdown AST directly into PDF primitives with embedded vector SVGs via `{ svg: svgContent }`.
* Sub-100ms compilation speed (~0.09s for multi-page carousels).
* Natively supports full-bleed page backgrounds, custom page and content margins, in-page headers, and metadata injection.

### Engine 3: Typst Engine Adapter (Optional Native Compiler)

* Typst is a modern, Rust-based typesetting engine built as an alternative to LaTeX.
* Through the `@myriaddreamin/typst-ts-node` package or Wasm bindings, Paperforge can compile documents directly in memory in **under 100 milliseconds** with **zero browser dependencies**.
* Ideal for CI environments, serverless functions, or users seeking maximum compilation speed.

---

## 4. Technology Stack

* **Runtime:** Node.js (>= 22.0.0 LTS)
* **Language:** TypeScript 5.x (compiled to modern ESM + CJS)
* **CLI Framework:** `commander` (compact, reliable, standard)
* **Markdown Engine:** `markdown-it` (extensible plugin architecture for tables, anchors, and task lists)
* **Frontmatter Parser:** `gray-matter`
* **Schema Validation:** `zod`
* **Renderer Client:** `puppeteer-core` + `chrome-launcher`
* **Template Interpolation:** `eta` or zero-dependency regex engine for headers/footers
* **Test Suite:** `vitest`

---

## 5. Suggested Source Code Structure

```text
src/
├── cli/
│   ├── index.ts               # Commander entrypoint
│   ├── build.ts               # 'paperforge build' command
│   ├── init.ts                # 'paperforge init' command
│   ├── validate.ts            # 'paperforge validate' command
│   └── preview.ts             # 'paperforge preview' command
│
├── config/
│   ├── schema.ts              # Zod schemas (project, typography, toc)
│   ├── loader.ts              # Loads paperforge.yaml with inheritance
│   └── defaults.ts            # Built-in fallback configurations
│
├── document/
│   ├── model.ts               # Core Document and Publication data types
│   ├── scanner.ts             # Scans content/ directory for .md files
│   ├── frontmatter.ts         # Extracts and normalizes YAML frontmatter
│   ├── ordering.ts            # 3-tier document sequencing
│   └── metadata.ts            # Generates PDF /Info and XMP payloads
│
├── markdown/
│   ├── parser.ts              # markdown-it instance with plugins
│   ├── toc-generator.ts       # Synthesizes Table of Contents tree
│   └── asset-resolver.ts      # Resolves and embeds images/assets
│
├── layout/
│   ├── header-footer.ts       # Interpolates dynamic page template vars
│   ├── cover.ts               # Formats dedicated cover pages
│   └── typography.ts          # Generates @font-face and font selectors
│
├── rendering/
│   ├── engine-interface.ts    # IPdfRenderer abstraction
│   ├── system-browser.ts      # puppeteer-core + chrome-launcher engine
│   ├── typst-adapter.ts       # Optional native Typst engine
│   └── html-assembler.ts      # Combines documents, styles, and scripts
│
├── validation/
│   ├── project-validator.ts   # Comprehensive pre-build diagnostics
│   └── diagnostics.ts         # User-friendly error reporting
│
└── index.ts                   # Programmatic API entrypoint
```

---

## 6. Document Model

The core document model represents content independently of rendering engines:

```typescript
export interface DocumentFile {
  filePath: string;
  slug: string;
  type: 'chapter' | 'appendix' | 'cover' | 'blank';
  title: string;
  subtitle?: string;
  order?: number;
  author?: string;
  description?: string;

  // Raw and processed content
  rawMarkdown: string;
  htmlContent: string;

  // Layout behaviors
  toc: boolean;
  tocDepth?: number;
  pageBreakBefore: boolean;
  pageBreakAfter: boolean;
  header: boolean;
  footer: boolean;
  pageNumbers: boolean;

  // Metadata
  metadata: Record<string, unknown>;
}

export interface Publication {
  config: ProjectConfig;
  cover?: DocumentFile;
  headerTemplate?: string;
  footerTemplate?: string;
  documents: DocumentFile[];
  tocHtml?: string;
  themeCss: string;
  typographyCss: string;
}
```

---

*Previous Document:* [06. CLI and Build Pipeline](./06-cli-and-build-pipeline.md)  
*Next Document:* [08. Quality, Operations, and Security](./08-quality-operations-and-security.md)
