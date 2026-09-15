# 09. Roadmap, Ecosystem, and Initial Release

> MVP scope checklist, post-MVP vision, and release specifications

* **Package:** `@vivekkushwaha66/paperforge`
* **License:** MIT
* **Author:** Vivek Kushwaha (Vivek Kushwaha Labs)

---

## 1. MVP Scope Checklist

### Core Features (v0.1.0)

- [ ] **CLI Framework:** Built on Commander.js supporting `init`, `build`, and `validate`.
- [ ] **Package Branding:** Published to npm as `@vivekkushwaha66/paperforge` under the **MIT** license.
- [ ] **Lightweight Rendering Engine:** Zero-download default engine using `puppeteer-core` with system browser detection (Edge/Chrome).
- [ ] **Markdown Engine:** Robust Markdown-to-HTML parser (`markdown-it`) with table, footnote, and code-block support.
- [ ] **Frontmatter Parsing:** YAML frontmatter extraction (`gray-matter`) with Zod validation.
- [ ] **Document Ordering:** 3-tier precedence (`order` frontmatter -> lexical filename -> filesystem).
- [ ] **Table of Contents (TOC) Engine:**
  - [ ] Fully configurable via `paperforge.yaml` (`minDepth`, `maxDepth`, `ordered`, `pageNumbers`).
  - [ ] Automatic dotted leader lines and page anchor links.
- [ ] **Typography & Font Selector Engine:**
  - [ ] Local font files (`.woff2`, `.woff`, `.ttf`, `.otf` with weight/style variants) with 100% offline Base64 inlining, system fonts, and Google Fonts.
  - [ ] Declarative font family selectors for `body`, `headings`, `code`, and `cover`.
- [ ] **Running Headers & Footers:** Markdown-based templates with dynamic variables (`{{title}}`, `{{page}}`, `{{pages}}`).
- [ ] **Dedicated Cover Page:** Full-bleed custom cover generation with independent styling.
- [ ] **Relative Asset Resolver:** Automatic resolution and embedding of PNG, SVG, JPG, and WebP assets.
- [ ] **PDF Metadata Engine:** Standard `/Info` and XMP metadata injection.
- [ ] **Themes:** Default clean print theme and starter Vivek Kushwaha Labs theme.

---

## 2. Post-MVP Roadmap (v0.2.0+)

- [ ] **`paperforge preview`:** Live-reloading local browser preview server.
- [ ] **Typst Backend Adapter:** Native sub-second Rust/Wasm compilation backend without browser dependencies.
- [ ] **Interactive CLI Scaffolding:** Interactive prompts during `paperforge init`.
- [ ] **PDF Bookmarks & Outlines:** Native PDF navigation tree injection.
- [ ] **Watch Mode:** Automatic incremental rebuild on Markdown file save (`paperforge build --watch`).
- [ ] **Theme Packaging Ecosystem:** Ability to install reusable community themes via npm (e.g., `npm i @paperforge/theme-dracula`).
- [ ] **Official GitHub Action:** Zero-config CI/CD workflow for automated publication builds on GitHub releases.
- [ ] **Multi-Format Exporters:** Experimental EPUB and HTML export engines.

---

## 3. Initial Release Specifications

### Package Identity

* **NPM Package:** `@vivekkushwaha66/paperforge`
* **Initial Tag:** `0.1.0`
* **License:** `MIT`
* **Repository:** `https://github.com/vivekkushwaha66/paperforge`
* **Binary Executable:** `paperforge` (aliased to `@vivekkushwaha66/paperforge`)

### Distribution & Quick Start

```bash
# Direct execution without prior installation
npx @vivekkushwaha66/paperforge build ./my-publication

# Global installation
npm install -g @vivekkushwaha66/paperforge
paperforge build ./my-publication
```

---

## 4. Success Criteria

The `@vivekkushwaha66/paperforge` v0.1.0 release will be validated by successfully compiling four real-world commercial digital products without manual post-processing:

1. **AI Stock Research Prompt Library** (Financial valuation guides and research workflows)
2. **AI Prompt Library for Senior Engineers** (System design and code review playbooks)
3. **Senior Engineering Resume Kit** (Precision-formatted resumes and case studies)
4. **Technical Architecture Whitepaper** (Multi-chapter engineering specification with vector diagrams)

Each publication will use distinct themes, typography, covers, and Table of Contents configurations while sharing the same underlying CLI engine.

---

*Previous Document:* [08. Quality, Operations, and Security](./08-quality-operations-and-security.md)  
*Back to Overview:* [01. Overview and Vision](./01-overview-and-vision.md)
