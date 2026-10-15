import { ProjectConfig } from './schema.js';

export const DEFAULT_CONFIG: ProjectConfig = {
  title: 'Paperforge Publication',
  author: 'Author',
  version: '1.0.0',
  language: 'en-US',
  creator: '@vivekkushwaha66/paperforge v0.1.0',
  keywords: [],
  output: {
    file: './dist/publication.pdf'
  },
  content: {
    directory: './content',
    include: ['*.md'],
    exclude: ['drafts/*', '_*']
  },
  pdf: {
    format: 'A4',
    orientation: 'portrait',
    printBackground: true,
    pageNumbers: true,
    fullBleed: false,
    layout: 'document',
    margins: {
      top: '20mm',
      bottom: '20mm',
      left: '20mm',
      right: '20mm'
    },
    renderer: 'system-browser'

  },
  toc: {
    enabled: true,
    title: 'Table of Contents',
    minDepth: 1,
    maxDepth: 3,
    ordered: true,
    pageNumbers: true,
    pageBreakAfter: true,
    position: 'after-cover',
    exclude: []
  },
  typography: {
    fonts: [],
    selectors: {
      body: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      headings: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      code: '"SFMono-Regular", Consolas, "Liberation Mono", Menlo, monospace',
      cover: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
    },
    fontSize: {
      base: '11pt',
      h1: '24pt',
      h2: '18pt',
      h3: '14pt',
      h4: '12pt'
    },
    lineHeight: 1.6
  },
  theme: {}
};
