import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import chalk from 'chalk';
import { logger } from '../logger/logger.js';

export interface InitCliOptions {
  theme?: string;
  force?: boolean;
  yes?: boolean;
  title?: string;
  author?: string;
}

export function runInitCommand(targetDir: string = '.', options: InitCliOptions = {}): boolean {
  const destDir = path.resolve(targetDir);
  logger.banner('Paperforge — Project Scaffolding', `@vivekkushwaha66/paperforge v0.1.0`);
  logger.info(`Bootstrapping publication in: ${chalk.cyan(destDir)}`);

  const exists = fs.existsSync(destDir);
  if (exists) {
    const existingFiles = fs.readdirSync(destDir);
    const hasPaperforgeConfig = existingFiles.includes('paperforge.yaml') || existingFiles.includes('paperforge.yml');

    if (hasPaperforgeConfig && !options.force && !options.yes) {
      logger.warn(`Directory "${destDir}" already contains a paperforge.yaml.`);
      console.log(chalk.gray(`  Use ${chalk.yellow('--force')} or ${chalk.yellow('-y')} to overwrite.`));
      process.exitCode = 1;
      return false;
    }
  }

  // Create required subdirectories
  fs.mkdirSync(path.join(destDir, 'content'), { recursive: true });
  fs.mkdirSync(path.join(destDir, 'assets', 'images'), { recursive: true });
  fs.mkdirSync(path.join(destDir, 'assets', 'fonts'), { recursive: true });
  fs.mkdirSync(path.join(destDir, 'theme'), { recursive: true });

  const rawName = path.basename(destDir);
  const projectName = options.title || (rawName && rawName !== '.' && rawName !== '/' ? rawName : 'My Publication');
  const projectSlug = projectName.toLowerCase().replace(/[^a-z0-9_-]/g, '-');
  const authorName = options.author || os.userInfo()?.username || 'Vivek Kushwaha';
  const selectedTheme = options.theme === 'vivek-kushwaha-labs' ? 'vivek-kushwaha-labs' : 'default';

  // 1. paperforge.yaml
  const yamlContent = `# Paperforge Project Configuration
title: "${projectName}"
subtitle: "A publication generated with @vivekkushwaha66/paperforge"
author: "${authorName}"
version: "1.0.0"
date: "2026"

output:
  file: "./dist/${projectSlug}.pdf"

content:
  directory: "./content"
  include: ["*.md"]
  exclude: ["drafts/*", "_*"]

cover:
  file: "./cover.md"
header:
  file: "./header.md"
footer:
  file: "./footer.md"

pdf:
  format: "A4"
  orientation: "portrait"
  printBackground: true
  pageNumbers: true
  margins:
    top: "20mm"
    bottom: "20mm"
    left: "20mm"
    right: "20mm"
  renderer: "system-browser"

toc:
  enabled: true
  title: "Table of Contents"
  minDepth: 1
  maxDepth: 3
  ordered: true
  pageNumbers: true
  pageBreakAfter: true
  position: "after-cover"
  exclude: []

typography:
  selectors:
    body: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
    headings: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
    code: "'SFMono-Regular', Consolas, Monaco, monospace"
    cover: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
  fontSize:
    base: "11pt"
    h1: "24pt"
    h2: "18pt"
    h3: "14pt"
    h4: "12pt"
  lineHeight: 1.6

theme:
  name: "${selectedTheme}"
  css: "./theme/style.css"
`;
  fs.writeFileSync(path.join(destDir, 'paperforge.yaml'), yamlContent, 'utf-8');

  // 2. cover.md
  const coverMd = `---
type: "cover"
title: "${projectName}"
subtitle: "A modern publication authored in Markdown"
author: "${authorName}"
version: "1.0.0"
date: "2026"
---

<div class="cover-badge">Developer Edition</div>
<h1 class="cover-title">{{title}}</h1>
<p class="cover-subtitle">{{subtitle}}</p>

<div class="cover-footer">
  <span class="cover-author">Authored by {{author}}</span>
  <span class="cover-version">v{{version}}</span>
</div>
`;
  fs.writeFileSync(path.join(destDir, 'cover.md'), coverMd, 'utf-8');

  // 3. header.md
  const headerMd = `<span style="font-weight: 600;">{{title}}</span>
<span>{{chapter}}</span>
`;
  fs.writeFileSync(path.join(destDir, 'header.md'), headerMd, 'utf-8');

  // 4. footer.md
  const footerMd = `<span>© {{date}} {{author}} — All Rights Reserved</span>
<span>Page {{page}} of {{pages}}</span>
`;
  fs.writeFileSync(path.join(destDir, 'footer.md'), footerMd, 'utf-8');

  // 5. assets/images/sample-diagram.svg
  const sampleSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 500 120" width="100%" height="120">
  <rect width="500" height="120" rx="8" fill="#0A0B0E"/>
  <rect x="20" y="20" width="130" height="80" rx="6" fill="#1E293B" stroke="#DFBA87" stroke-width="1.5"/>
  <text x="85" y="65" fill="#DFBA87" font-family="sans-serif" font-size="13" font-weight="bold" text-anchor="middle">Markdown</text>
  <path d="M 160 60 L 195 60" stroke="#DFBA87" stroke-width="2"/>
  <rect x="205" y="20" width="130" height="80" rx="6" fill="#1E293B" stroke="#DFBA87" stroke-width="1.5"/>
  <text x="270" y="65" fill="#4ADE80" font-family="sans-serif" font-size="13" font-weight="bold" text-anchor="middle">Paperforge</text>
  <path d="M 345 60 L 380 60" stroke="#DFBA87" stroke-width="2"/>
  <rect x="390" y="20" width="90" height="80" rx="6" fill="#1E293B" stroke="#DFBA87" stroke-width="1.5"/>
  <text x="435" y="65" fill="#FFFFFF" font-family="sans-serif" font-size="13" font-weight="bold" text-anchor="middle">PDF</text>
</svg>`;
  fs.writeFileSync(path.join(destDir, 'assets', 'images', 'sample-diagram.svg'), sampleSvg, 'utf-8');

  // 6. content/01-introduction.md
  const introMd = `---
title: "Introduction"
order: 1
---

# Introduction

Welcome to **${projectName}**! This publication is authored in Markdown and compiled with [Paperforge](https://github.com/vivekkushwaha66/paperforge).

## Overview

Paperforge provides a deterministic publishing workflow as code:

- Deterministic document sequencing
- Configurable Table of Contents with leader lines
- Offline Base64 font inlining
- Dynamic headers, footers, and page numbers

![Publishing Pipeline](../assets/images/sample-diagram.svg)

> "Simplicity is the prerequisite for reliability." — Edsger W. Dijkstra
`;
  fs.writeFileSync(path.join(destDir, 'content', '01-introduction.md'), introMd, 'utf-8');

  // 7. content/02-getting-started.md
  const startMd = `---
title: "Getting Started"
order: 2
---

# Getting Started

Follow these steps to organize chapters and configure publication styles.

## Adding Chapters

Place Markdown files inside \`content/\`. Frontmatter controls order and layout:

\`\`\`markdown
---
title: "Advanced Topics"
order: 3
toc: true
---
\`\`\`

## Feature Matrix

| Feature | Supported | Notes |
| :--- | :--- | :--- |
| Table of Contents | Yes | Automatic depth & leader lines |
| Vector Graphics | Yes | SVG, PNG, JPG, WebP |
| Custom Themes | Yes | CSS Paged Media support |
`;
  fs.writeFileSync(path.join(destDir, 'content', '02-getting-started.md'), startMd, 'utf-8');

  // 8. theme/style.css
  const styleCss = `/* Custom overrides for ${projectName} */
/* Add your custom styles and @page rules here */
`;
  fs.writeFileSync(path.join(destDir, 'theme', 'style.css'), styleCss, 'utf-8');

  logger.success(`Publication project successfully bootstrapped in: ${chalk.cyan(destDir)}`);
  console.log();
  console.log(chalk.bold('Quick start:'));
  const rel = path.relative(process.cwd(), destDir);
  if (rel && rel !== '.') {
    console.log(`  ${chalk.cyan(`cd ${rel}`)}`);
  }
  console.log(`  ${chalk.cyan('paperforge validate')}   ${chalk.gray('# Verify project files and assets')}`);
  console.log(`  ${chalk.cyan('paperforge build')}      ${chalk.gray('# Compile publication into PDF')}`);
  console.log(`  ${chalk.cyan('paperforge preview')}    ${chalk.gray('# Start local live preview server')}`);
  console.log();

  return true;
}
