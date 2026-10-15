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

function interpolateInPageVariables(template: string, vars: Record<string, string>): string {
  let res = template;
  for (const [key, val] of Object.entries(vars)) {
    const re = new RegExp(`{{\\s*${key}\\s*}}`, 'gi');
    res = res.replace(re, val ?? '');
  }
  return res;
}

export function isFullBleedLayout(publication: Publication): boolean {
  const pdfConfig = publication.config.pdf;
  if (pdfConfig.fullBleed) return true;
  if (pdfConfig.background) return true;
  if (pdfConfig.content_margins || pdfConfig.contentMargins) return true;
  if (pdfConfig.layout === 'cards' || pdfConfig.layout === 'presentation' || pdfConfig.layout === 'slides') return true;
  if (pdfConfig.format?.toLowerCase() === 'square' || pdfConfig.width || pdfConfig.height) return true;
  if (publication.cover?.background || publication.cover?.contentMargins) return true;
  for (const doc of publication.documents) {
    if (
      doc.background ||
      doc.contentMargins ||
      doc.pageMargins ||
      doc.style ||
      doc.className ||
      doc.type === 'card' ||
      doc.type === 'page'
    ) {
      return true;
    }
  }
  return false;
}

function computePageSizeCss(publication: Publication): string {
  const pdfConfig = publication.config.pdf;
  if (pdfConfig.width && pdfConfig.height) {
    return `${pdfConfig.width} ${pdfConfig.height}`;
  }
  if (pdfConfig.format?.toLowerCase() === 'square') {
    return '200mm 200mm';
  }
  if (pdfConfig.format?.includes('x')) {
    const [w, h] = pdfConfig.format.split('x');
    const wVal = w.endsWith('px') || w.endsWith('mm') || w.endsWith('in') ? w : `${w}px`;
    const hVal = h.endsWith('px') || h.endsWith('mm') || h.endsWith('in') ? h : `${h}px`;
    return `${wVal} ${hVal}`;
  }
  return `${pdfConfig.format || 'A4'} ${pdfConfig.orientation || 'portrait'}`;
}

export function assembleHtml(publication: Publication): AssembledHtmlResult {
  const md = createMarkdownParser();
  const assetIssues: AssetValidationIssue[] = [];
  const fullBleed = isFullBleedLayout(publication);

  const totalPages = publication.documents.length + (publication.cover ? 1 : 0);
  const totalPagesPad = String(totalPages).padStart(2, '0');

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

    if (fullBleed) {
      const coverDoc = publication.cover;
      const bg = coverDoc.background || publication.config.pdf.background || 'transparent';
      const pageMargins = coverDoc.pageMargins || publication.config.pdf.margins || { top: '32px', bottom: '32px', left: '48px', right: '48px' };
      const contentMargins = coverDoc.contentMargins || publication.config.pdf.content_margins || publication.config.pdf.contentMargins || { top: '0px', bottom: '0px', left: '0px', right: '0px' };
      const customStyle = coverDoc.style || '';
      const customClass = coverDoc.className || '';

      const renderedCoverContent = renderCoverPage(coverDoc, publication.config, md);

      coverHtml = `
<article class="forge-chapter forge-page ${customClass}" id="doc-cover" style="background: ${bg}; ${customStyle}">
  <div class="forge-page-shell" style="padding: ${pageMargins.top} ${pageMargins.right} ${pageMargins.bottom} ${pageMargins.left};">
    <main class="forge-page-content" style="margin: ${contentMargins.top} ${contentMargins.right} ${contentMargins.bottom} ${contentMargins.left};">
      ${renderedCoverContent}
    </main>
  </div>
</article>
`;
    } else {
      coverHtml = renderCoverPage(publication.cover, publication.config, md);
    }
  }

  // 2. Process chapter documents & inline assets
  const renderedChapters: string[] = [];
  let pageOffset = publication.cover ? 2 : 1;

  for (let i = 0; i < publication.documents.length; i++) {
    const doc = publication.documents[i];
    const pageIndex = i + pageOffset;
    const pageStr = String(pageIndex);
    const pagePad = pageStr.padStart(2, '0');

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

    if (fullBleed) {
      classes.push('forge-page');
      if (doc.className) classes.push(doc.className);

      const bg = doc.background || publication.config.pdf.background || 'transparent';
      const pageMargins = doc.pageMargins || publication.config.pdf.margins || { top: '32px', bottom: '32px', left: '48px', right: '48px' };
      const contentMargins = doc.contentMargins || publication.config.pdf.content_margins || publication.config.pdf.contentMargins || { top: '0px', bottom: '0px', left: '0px', right: '0px' };
      const accentColor = doc.accentColor || '#DFBA87';
      const customStyle = doc.style || '';

      const varContext: Record<string, string> = {
        title: publication.config.title,
        chapter: doc.title,
        author: publication.config.author,
        date: publication.config.date || '',
        version: publication.config.version,
        page: pageStr,
        pages: String(totalPages),
        pagePad,
        pagesPad: totalPagesPad,
        subject: publication.config.subject || ''
      };

      // In-page Running Header
      let headerHtml = '';
      if (doc.header !== false) {
        let leftContent = `<div class="forge-accent-bar" style="background-color: ${accentColor};"></div>`;
        let rightContent = `<div class="forge-page-number">${pagePad} / ${totalPagesPad}</div>`;

        if (typeof doc.header === 'object') {
          if (doc.header.accent_bar === false) {
            leftContent = '';
          } else if (typeof doc.header.accent_bar === 'string') {
            leftContent = `<div class="forge-accent-bar" style="background-color: ${doc.header.accent_bar};"></div>`;
          }
          if (doc.header.left !== undefined) {
            leftContent = interpolateInPageVariables(doc.header.left, varContext);
          }
          if (doc.header.right !== undefined) {
            rightContent = `<div class="forge-page-number">${interpolateInPageVariables(doc.header.right, varContext)}</div>`;
          }
        } else if (typeof doc.header === 'string') {
          rightContent = `<div class="forge-page-number">${interpolateInPageVariables(doc.header, varContext)}</div>`;
        }

        headerHtml = `
<header class="forge-page-header">
  <div class="forge-header-left">${leftContent}</div>
  <div class="forge-header-right">${rightContent}</div>
</header>
`;
      }

      // In-page Running Footer
      let footerHtml = '';
      if (doc.footer !== false) {
        let leftFooter = publication.config.subject || publication.config.title || '';
        let rightFooter = `<span class="swipe-indicator">Swipe <span class="swipe-arrow">▶</span></span>`;

        if (typeof doc.footer === 'object') {
          if (doc.footer.left !== undefined) {
            leftFooter = interpolateInPageVariables(doc.footer.left, varContext);
          }
          if (doc.footer.right !== undefined) {
            rightFooter = interpolateInPageVariables(doc.footer.right, varContext);
          }
        } else if (typeof doc.footer === 'string') {
          leftFooter = interpolateInPageVariables(doc.footer, varContext);
        }

        footerHtml = `
<footer class="forge-page-footer">
  <div class="forge-footer-left">${leftFooter}</div>
  <div class="forge-footer-right">${rightFooter}</div>
</footer>
`;
      }

      renderedChapters.push(`
<article class="${classes.join(' ')}" id="doc-${doc.slug}" style="background: ${bg}; ${customStyle}">
  <div class="forge-page-shell" style="padding: ${pageMargins.top} ${pageMargins.right} ${pageMargins.bottom} ${pageMargins.left};">
    ${headerHtml}
    <main class="forge-page-content" style="margin: ${contentMargins.top} ${contentMargins.right} ${contentMargins.bottom} ${contentMargins.left};">
      ${doc.htmlContent}
    </main>
    ${footerHtml}
  </div>
</article>
`);
    } else {
      renderedChapters.push(`
<article class="${classes.join(' ')}" id="doc-${doc.slug}">
  ${doc.htmlContent}
</article>
`);
    }
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
  const isVKLabs = themeSetting.name === 'vivek-kushwaha-labs' || (!themeSetting.name && !themeSetting.css && !fullBleed && publication.config.author.toLowerCase().includes('vivek kushwaha'));
  const isCarousel = themeSetting.name === 'executive-carousel' || (fullBleed && (publication.config.pdf.layout === 'cards' || publication.config.pdf.background || !themeSetting.name));

  let themeFileName = 'default.css';
  if (themeSetting.name === 'executive-carousel' || isCarousel) {
    themeFileName = 'executive-carousel.css';
  } else if (isVKLabs) {
    themeFileName = 'vivek-kushwaha-labs.css';
  }

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

  const pageSizeCss = computePageSizeCss(publication);

  const fullHtml = `<!DOCTYPE html>
<html lang="${publication.config.language}">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${publication.config.title}</title>
  <style>
    @page {
      size: ${pageSizeCss};
      margin: ${fullBleed ? '0' : (publication.config.pdf.margins?.top || '20mm')};
    }

    ${fullBleed ? `
    html, body {
      margin: 0 !important;
      padding: 0 !important;
      background: transparent !important;
      -webkit-print-color-adjust: exact !important;
      print-color-adjust: exact !important;
    }
    .forge-container {
      margin: 0 !important;
      padding: 0 !important;
    }
    ` : ''}

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

