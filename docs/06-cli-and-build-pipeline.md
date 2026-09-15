# 06. CLI and Build Pipeline

> CLI command interface and step-by-step compilation pipeline

* **Package:** `@vivekkushwaha66/paperforge`
* **License:** MIT

---

## 1. CLI Commands

The CLI can be invoked directly via `npx` or installed globally:

```bash
# Direct run
npx @vivekkushwaha66/paperforge <command> [options]

# Global run
npm install -g @vivekkushwaha66/paperforge
paperforge <command> [options]
```

### 1.1 `paperforge init [target-dir]`

Scaffolds a publication project with sensible defaults:

```bash
paperforge init my-guide
```

Creates:
```text
my-guide/
├── paperforge.yaml
├── cover.md
├── header.md
├── footer.md
├── content/
│   ├── 01-introduction.md
│   └── 02-getting-started.md
├── assets/
│   └── images/
└── theme/
    └── style.css
```

Options:
* `--theme <name>`: Scaffold with a pre-configured theme (e.g., `--theme vivek-kushwaha-labs` or `--theme minimal`).
* `--force`: Overwrite existing files in the target directory.

### 1.2 `paperforge build [project-path]`

Compiles the target project into a distribution PDF.

```bash
paperforge build ./my-guide
```

Options:
* `-o, --output <path>`: Override the destination PDF path.
* `-r, --renderer <engine>`: Select rendering engine (`system-browser`, `puppeteer-core`, `typst`).
* `-w, --watch`: Rebuild automatically when Markdown, assets, or CSS change.
* `-v, --verbose`: Enable debug logs and timing diagnostics.

### 1.3 `paperforge validate [project-path]`

Validates the integrity of the project without rendering the final PDF.

```bash
paperforge validate ./my-guide
```

Verifies:
* `paperforge.yaml` syntax and schema conformance.
* YAML frontmatter validity across all Markdown files.
* Image and asset references existence on disk.
* Uniqueness of explicit document `order` values.
* Theme stylesheet and font paths.

### 1.4 `paperforge preview [project-path]`

Starts a local development HTTP server rendering live HTML/Paged-Media previews in the user's default browser with hot reload.

---

## 2. Build Pipeline Architecture

The build process executes deterministically in 14 discrete stages:

```text
┌────────────────────────────────────────┐
│ 1. Load & Validate Configuration       │ (paperforge.yaml, CLI flags)
└──────────────────┬─────────────────────┘
                   ▼
┌────────────────────────────────────────┐
│ 2. Scan Project Files                  │ (content/, assets/, cover.md)
└──────────────────┬─────────────────────┘
                   ▼
┌────────────────────────────────────────┐
│ 3. Parse Document Frontmatter          │ (gray-matter extraction)
└──────────────────┬─────────────────────┘
                   ▼
┌────────────────────────────────────────┐
│ 4. Run Static Document Validation      │ (Zod schema checks)
└──────────────────┬─────────────────────┘
                   ▼
┌────────────────────────────────────────┐
│ 5. Sort Documents                      │ (order -> filename fallback)
└──────────────────┬─────────────────────┘
                   ▼
┌────────────────────────────────────────┐
│ 6. Resolve Media Assets & Fonts        │ (relative path mapping)
└──────────────────┬─────────────────────┘
                   ▼
┌────────────────────────────────────────┐
│ 7. Parse Markdown to Semantic HTML     │ (markdown-it AST)
└──────────────────┬─────────────────────┘
                   ▼
┌────────────────────────────────────────┐
│ 8. Synthesize Table of Contents (TOC)  │ (heading tree analysis & anchors)
└──────────────────┬─────────────────────┘
                   ▼
┌────────────────────────────────────────┐
│ 9. Compile Running Headers & Footers   │ (interpolate {{page}}, {{title}})
└──────────────────┬─────────────────────┘
                   ▼
┌────────────────────────────────────────┐
│ 10. Inject Typography & CSS Themes     │ (Google/local fonts, CSS variables)
└──────────────────┬─────────────────────┘
                   ▼
┌────────────────────────────────────────┐
│ 11. Generate PDF Metadata              │ (/Info dict & XMP payloads)
└──────────────────┬─────────────────────┘
                   ▼
┌────────────────────────────────────────┐
│ 12. Dispatch to PDF Rendering Engine   │ (System Chrome / Edge CDP)
└──────────────────┬─────────────────────┘
                   ▼
┌────────────────────────────────────────┐
│ 13. Write Binary PDF to Disk           │ (dist/publication.pdf)
└──────────────────┬─────────────────────┘
                   ▼
┌────────────────────────────────────────┐
│ 14. Report Build Statistics            │ (Page count, size, duration)
└────────────────────────────────────────┘
```

---

*Previous Document:* [05. PDF Metadata and Assets](./05-pdf-metadata-and-assets.md)  
*Next Document:* [07. Architecture and Tech Stack](./07-architecture-and-tech-stack.md)
