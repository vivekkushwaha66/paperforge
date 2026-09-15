import MarkdownIt from 'markdown-it';
import anchor from 'markdown-it-anchor';

export interface MarkdownParserOptions {
  enableHtml?: boolean;
  linkify?: boolean;
  typographer?: boolean;
}

export function createMarkdownParser(options: MarkdownParserOptions = {}): MarkdownIt {
  const md = new MarkdownIt({
    html: options.enableHtml ?? true,
    xhtmlOut: true,
    breaks: false,
    langPrefix: 'language-',
    linkify: options.linkify ?? true,
    typographer: options.typographer ?? true
  });

  // Add anchor tags to headings for TOC navigation
  md.use(anchor, {
    level: [1, 2, 3, 4, 5, 6],
    slugify: (s: string) =>
      s
        .trim()
        .toLowerCase()
        .replace(/<[^>]+>/g, '')
        .replace(/[^\w\s-]/g, '')
        .replace(/\s+/g, '-')
  });

  return md;
}
