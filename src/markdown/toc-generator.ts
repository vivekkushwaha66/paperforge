import { TocConfig } from '../config/schema.js';
import { DocumentFile } from '../document/model.js';

export interface TocHeading {
  level: number;
  text: string;
  slug: string;
  documentTitle: string;
}

function slugify(text: string): string {
  return text
    .trim()
    .toLowerCase()
    .replace(/<[^>]+>/g, '')
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-');
}

function matchesExclude(title: string, excludePatterns: string[]): boolean {
  for (const pattern of excludePatterns) {
    if (pattern.endsWith('*')) {
      const prefix = pattern.slice(0, -1);
      if (title.toLowerCase().startsWith(prefix.toLowerCase())) return true;
    } else if (title.toLowerCase() === pattern.toLowerCase()) {
      return true;
    }
  }
  return false;
}

export function extractHeadings(docs: DocumentFile[], config: TocConfig): TocHeading[] {
  const headings: TocHeading[] = [];

  for (const doc of docs) {
    if (!doc.toc) continue;

    const maxDepth = doc.tocDepth ?? config.maxDepth;
    const lines = doc.rawMarkdown.split('\n');

    for (const line of lines) {
      const match = line.match(/^(#{1,6})\s+(.+)$/);
      if (match) {
        const level = match[1].length;
        if (level >= config.minDepth && level <= maxDepth) {
          const rawText = match[2].trim();
          const cleanText = rawText.replace(/[*_`[\]]/g, '').trim();

          if (!matchesExclude(cleanText, config.exclude)) {
            headings.push({
              level,
              text: cleanText,
              slug: slugify(cleanText),
              documentTitle: doc.title
            });
          }
        }
      }
    }
  }

  return headings;
}

export function generateTocHtml(headings: TocHeading[], config: TocConfig): string {
  if (headings.length === 0) return '';

  const listTag = config.ordered ? 'ol' : 'ul';
  let html = `<nav class="forge-toc ${config.pageBreakAfter ? 'page-break-after' : ''}">\n`;
  html += `  <h2 class="toc-title">${config.title}</h2>\n`;
  html += `  <${listTag} class="toc-list depth-1">\n`;

  let currentLevel = config.minDepth;
  let counterMap: Record<number, number> = {};

  for (let i = 0; i < headings.length; i++) {
    const heading = headings[i];
    const diff = heading.level - currentLevel;

    if (diff > 0) {
      for (let d = 0; d < diff; d++) {
        const levelNum = currentLevel + d + 1;
        counterMap[levelNum] = 0;
        html += `  <${listTag} class="toc-list depth-${levelNum}">\n`;
      }
    } else if (diff < 0) {
      for (let d = 0; d < Math.abs(diff); d++) {
        html += `  </${listTag}>\n</li>\n`;
      }
    } else if (i > 0) {
      html += `  </li>\n`;
    }

    currentLevel = heading.level;
    counterMap[currentLevel] = (counterMap[currentLevel] || 0) + 1;

    // Number prefix
    let numberPrefix = '';
    if (config.ordered) {
      const parts: number[] = [];
      for (let l = config.minDepth; l <= currentLevel; l++) {
        parts.push(counterMap[l] || 1);
      }
      const numStr = parts.length === 1 ? `${parts[0]}.` : parts.join('.');
      numberPrefix = `<span class="toc-number">${numStr} </span>`;
    }

    html += `    <li class="toc-item toc-item-level-${currentLevel}">\n`;
    html += `      <a href="#${heading.slug}" class="toc-link">\n`;
    html += `        <span class="toc-text">${numberPrefix}${heading.text}</span>\n`;
    if (config.pageNumbers) {
      html += `        <span class="toc-leader"></span>\n`;
      html += `        <span class="toc-page" data-target="${heading.slug}"></span>\n`;
    }
    html += `      </a>\n`;
  }

  // Close remaining open tags
  for (let d = currentLevel; d > config.minDepth; d--) {
    html += `  </${listTag}>\n</li>\n`;
  }
  html += `  </li>\n  </${listTag}>\n</nav>\n`;

  return html;
}
