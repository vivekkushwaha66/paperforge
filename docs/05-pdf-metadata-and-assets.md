# 05. PDF Metadata and Assets

> Managing binary PDF document properties and relative media assets

* **Package:** `@vivekkushwaha66/paperforge`
* **License:** MIT

---

## 1. PDF Metadata Generation

Paperforge writes standard PDF document properties into both the classic **PDF Document Information Dictionary** (`/Info`) and modern **XMP (Extensible Metadata Platform)** data streams.

### Metadata Schema

```yaml
# In paperforge.yaml or frontmatter
title: "AI Stock Research Prompt Library"
subtitle: "A practical framework for AI-assisted equity research"
author: "Vivek Kushwaha"
description: "Structured prompt workflows for tech equity analysis."
subject: "Financial Analysis & Artificial Intelligence"
keywords:
  - "finance"
  - "equity research"
  - "AI prompts"
  - "DCF modeling"
creator: "@vivekkushwaha66/paperforge v0.1.0"
publisher: "Vivek Kushwaha Labs"
language: "en-US"
version: "1.0.0"
copyright: "© 2026 Vivek Kushwaha. All rights reserved."
```

### PDF Engine Injection

During final rendering, Paperforge writes these properties directly into the binary PDF structure:

| Standard PDF Field | Source Configuration Property |
| :--- | :--- |
| `/Title` | `title` (or chapter title if standalone) |
| `/Author` | `author` |
| `/Subject` | `subject` or `description` |
| `/Keywords` | `keywords` (comma-separated string) |
| `/Creator` | `creator` (`@vivekkushwaha66/paperforge v0.1.0`) |
| `/Producer` | `Paperforge Engine` |
| `/CreationDate` | ISO 8601 build timestamp |
| `/ModDate` | ISO 8601 build timestamp |

PDF readers (Adobe Acrobat, Preview, Chrome PDF Viewer) and search indexers read these properties to display author credits, window titles, and search indices.

---

## 2. Asset Resolution Engine

Markdown documents frequently reference images, diagrams, and figures. Paperforge provides robust, deterministic asset path resolution.

### Markdown Syntax

```markdown
![System Architecture](../assets/images/architecture.svg)
![Financial Chart](./charts/q3-revenue.png)
```

### Supported Media Formats

* **SVG (`.svg`):** Recommended for vector graphics, architecture diagrams, and logos. Rendered at native vector resolution without pixelation.
* **PNG (`.png`):** Recommended for raster screenshots, graphs, and pixel-exact diagrams.
* **JPEG/JPG (`.jpg`, `.jpeg`):** High-efficiency format for photographs.
* **WebP (`.webp`):** Modern compressed image format.

### Path Resolution Algorithm

1. **Relative to Markdown File:** If the asset path begins with `./` or `../`, Paperforge resolves it relative to the directory containing the active `.md` document.
2. **Project Root Relative:** If the path begins with `/` or references `assets/`, it is resolved relative to the root project folder.
3. **Data URI Conversion:** In offline build mode, local image assets are converted into optimized Base64 data URIs or local file protocol references before feeding into the rendering engine, guaranteeing zero network requests and reproducible builds.

### Broken Asset Validation

If any referenced image cannot be located on disk, `paperforge validate` and `paperforge build` immediately halt with a descriptive error indicating the document name, line number, and unresolved asset path:

```text
✗ content/03-financial-statements.md:42 references missing image:
  assets/charts/missing-model.png (resolved to d:/projects/my-doc/assets/charts/missing-model.png)
```

---

*Previous Document:* [04. Layout and Styling](./04-layout-and-styling.md)  
*Next Document:* [06. CLI and Build Pipeline](./06-cli-and-build-pipeline.md)
