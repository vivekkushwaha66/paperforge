import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { Publication } from '../document/model.js';
import { createMarkdownParser } from '../markdown/parser.js';
import { extractHeadings, generateTocHtml } from '../markdown/toc-generator.js';
import { renderCoverPage } from '../layout/cover.js';
import { generateTypographyCss } from '../layout/typography.js';
import { validateAndInlineAssets, AssetValidationIssue } from '../markdown/asset-resolver.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export interface AssembledHtmlResult {
  html: string;
  assetIssues: AssetValidationIssue[];
}

export function assembleHtml(publication: Publication): AssembledHtmlResult {
  const md = createMarkdownParser();
  const assetIssues: AssetValidationIssue[] = [];

  // 1. Process cover if present
  let coverHtml = '';
  if (publication.cover) {
    const inlinedCoverMd = validateAndInlineAssets(
      publication.cover.rawMarkdown,
      publication.cover.filePath,
      publication.projectDir,
      assetIssues
    );
    publication.cover.rawMarkdown = inlinedCoverMd;
    coverHtml = renderCoverPage(publication.cover, publication.config, md);
  }

  // 2. Process chapter documents & inline assets
  const renderedChapters: string[] = [];
  for (const doc of publication.documents) {
    const inlinedMd = validateAndInlineAssets(
      doc.rawMarkdown,
      doc.filePath,
      publication.projectDir,
      assetIssues
    );
    doc.rawMarkdown = inlinedMd;
    doc.htmlContent = md.render(inlinedMd);

    const classes: string[] = ['forge-chapter'];
    if (doc.pageBreakBefore) classes.push('page-break-before');
    if (doc.pageBreakAfter) classes.push('page-break-after');

    renderedChapters.push(`
<article class="${classes.join(' ')}" id="doc-${doc.slug}">
  ${doc.htmlContent}
</article>
`);
  }

  // 3. Generate Table of Contents if enabled
  let tocHtml = '';
  if (publication.config.toc.enabled) {
    const headings = extractHeadings(publication.documents, publication.config.toc);
    tocHtml = generateTocHtml(headings, publication.config.toc);
  }

function findThemeCssFile(filename: string): string | null {
  const candidateDirs = [
    path.resolve(__dirname, 'themes'),
    path.resolve(__dirname, 'rendering', 'themes'),
    path.resolve(__dirname, '../rendering/themes'),
    path.resolve(__dirname, '../../rendering/themes'),
    path.resolve(__dirname, '../src/rendering/themes')
  ];
  for (const dir of candidateDirs) {
    const full = path.join(dir, filename);
    if (fs.existsSync(full)) return full;
  }
  return null;
}

  // 4. Resolve Themes
  let themeCssContent = '';
  const themeSetting = publication.config.theme;
  const isVKLabs = themeSetting.name === 'vivek-kushwaha-labs' || (!themeSetting.name && !themeSetting.css && publication.config.author.toLowerCase().includes('vivek kushwaha'));
  const themeFileName = isVKLabs ? 'vivek-kushwaha-labs.css' : 'default.css';
  const themePath = findThemeCssFile(themeFileName);
  if (themePath) {
    themeCssContent = fs.readFileSync(themePath, 'utf-8');
  }

  // Load custom theme CSS if specified in config
  let customCssContent = '';
  if (themeSetting.css) {
    const customCssPath = path.resolve(publication.projectDir, themeSetting.css);
    if (fs.existsSync(customCssPath)) {
      customCssContent = fs.readFileSync(customCssPath, 'utf-8');
    }
  }

  // 5. Generate typography CSS
  const typographyCss = generateTypographyCss(publication.config.typography, publication.projectDir);

  // 6. Assemble complete document based on TOC position
  let bodyContent = '';
  const tocPos = publication.config.toc.position;

  if (tocPos === 'start') {
    bodyContent = `
      ${tocHtml}
      ${coverHtml}
      ${renderedChapters.join('\n')}
    `;
  } else if (tocPos === 'inline') {
    bodyContent = `
      ${coverHtml}
      ${renderedChapters.length > 0 ? renderedChapters[0] : ''}
      ${tocHtml}
      ${renderedChapters.slice(1).join('\n')}
    `;
  } else {
    // 'after-cover' (default)
    bodyContent = `
      ${coverHtml}
      ${tocHtml}
      ${renderedChapters.join('\n')}
    `;
  }

  const fullHtml = `<!DOCTYPE html>
<html lang="${publication.config.language}">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${publication.config.title}</title>
  <style>
    /* 1. Base Typography */
    ${typographyCss}

    /* 2. Theme Stylesheet */
    ${themeCssContent}

    /* 3. Custom Project Overrides */
    ${customCssContent}
  </style>
</head>
<body>
  <div class="forge-container">
    ${bodyContent}
  </div>
</body>
</html>`;

  return {
    html: fullHtml,
    assetIssues
  };
}
