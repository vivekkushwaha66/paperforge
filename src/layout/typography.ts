import fs from 'node:fs';
import path from 'node:path';
import { TypographyConfig, FontConfig } from '../config/schema.js';
import { logger } from '../logger/logger.js';

const FONT_MIME_TYPES: Record<string, string> = {
  '.woff2': 'font/woff2',
  '.woff': 'font/woff',
  '.ttf': 'font/ttf',
  '.otf': 'font/otf'
};

const FONT_FORMATS: Record<string, string> = {
  '.woff2': 'woff2',
  '.woff': 'woff',
  '.ttf': 'truetype',
  '.otf': 'opentype'
};

export function fontFileToBase64DataUri(absolutePath: string): string {
  const ext = path.extname(absolutePath).toLowerCase();
  const mime = FONT_MIME_TYPES[ext] || 'application/octet-stream';
  const buffer = fs.readFileSync(absolutePath);
  return `data:${mime};base64,${buffer.toString('base64')}`;
}

export function generateTypographyCss(config: TypographyConfig, projectDir: string): string {
  const rules: string[] = [];

  // 1. Process font configurations
  if (config.fonts && Array.isArray(config.fonts)) {
    for (const font of config.fonts) {
      if (font.source === 'local') {
        if (font.variants && font.variants.length > 0) {
          for (const variant of font.variants) {
            const fontPath = path.resolve(projectDir, variant.path);
            if (fs.existsSync(fontPath)) {
              const dataUri = fontFileToBase64DataUri(fontPath);
              const ext = path.extname(fontPath).toLowerCase();
              const format = FONT_FORMATS[ext] || 'woff2';
              rules.push(`@font-face {
  font-family: '${font.name}';
  src: url('${dataUri}') format('${format}');
  font-weight: ${variant.weight};
  font-style: ${variant.style};
  font-display: swap;
}`);
            } else {
              logger.warn(`Local font file not found: ${fontPath}`);
            }
          }
        } else if (font.path) {
          const fontPath = path.resolve(projectDir, font.path);
          if (fs.existsSync(fontPath)) {
            const dataUri = fontFileToBase64DataUri(fontPath);
            const ext = path.extname(fontPath).toLowerCase();
            const format = FONT_FORMATS[ext] || 'woff2';
            rules.push(`@font-face {
  font-family: '${font.name}';
  src: url('${dataUri}') format('${format}');
  font-weight: normal;
  font-style: normal;
  font-display: swap;
}`);
          } else {
            logger.warn(`Local font file not found: ${fontPath}`);
          }
        }
      } else if (font.source === 'google' || font.source === 'web') {
        if (font.url) {
          rules.push(`@import url('${font.url}');`);
        }
      }
    }
  }

  // 2. CSS Custom Properties and Selectors
  const sel = config.selectors || {};
  const fontSizes = config.fontSize || {};

  rules.push(`:root {
  --font-body: ${sel.body || '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'};
  --font-headings: ${sel.headings || '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'};
  --font-code: ${sel.code || '"SFMono-Regular", Consolas, "Liberation Mono", Menlo, monospace'};
  --font-cover: ${sel.cover || sel.headings || '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'};

  --font-size-base: ${fontSizes.base || '11pt'};
  --font-size-h1: ${fontSizes.h1 || '24pt'};
  --font-size-h2: ${fontSizes.h2 || '18pt'};
  --font-size-h3: ${fontSizes.h3 || '14pt'};
  --font-size-h4: ${fontSizes.h4 || '12pt'};
  --line-height-base: ${config.lineHeight || 1.6};
}

body {
  font-family: var(--font-body);
  font-size: var(--font-size-base);
  line-height: var(--line-height-base);
}

h1, h2, h3, h4, h5, h6 {
  font-family: var(--font-headings);
}

h1 { font-size: var(--font-size-h1); }
h2 { font-size: var(--font-size-h2); }
h3 { font-size: var(--font-size-h3); }
h4 { font-size: var(--font-size-h4); }

code, pre, kbd, samp {
  font-family: var(--font-code);
}

.page-cover {
  font-family: var(--font-cover);
}`);

  return rules.join('\n\n');
}
