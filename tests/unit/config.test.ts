import { describe, it, expect } from 'vitest';
import { ProjectConfigSchema, FrontmatterSchema } from '../../src/config/schema.js';
import { sortDocuments } from '../../src/document/ordering.js';
import { parseFrontmatter } from '../../src/document/frontmatter.js';
import { DocumentFile } from '../../src/document/model.js';

describe('Configuration & Frontmatter Schemas', () => {
  it('validates a default project configuration', () => {
    const parsed = ProjectConfigSchema.parse({});
    expect(parsed.title).toBe('Untitled Publication');
    expect(parsed.pdf.format).toBe('A4');
    expect(parsed.toc.enabled).toBe(true);
    expect(parsed.toc.minDepth).toBe(1);
    expect(parsed.toc.maxDepth).toBe(3);
  });

  it('validates customized configuration with typography and margins', () => {
    const custom = {
      title: 'Custom Doc',
      author: 'Vivek Kushwaha',
      pdf: {
        format: 'Letter',
        margins: {
          top: '25mm',
          bottom: '25mm'
        }
      },
      toc: {
        ordered: false,
        exclude: ['License', 'Appendix*']
      }
    };
    const parsed = ProjectConfigSchema.parse(custom);
    expect(parsed.title).toBe('Custom Doc');
    expect(parsed.pdf.format).toBe('Letter');
    expect(parsed.pdf.margins.top).toBe('25mm');
    expect(parsed.toc.ordered).toBe(false);
    expect(parsed.toc.exclude).toContain('Appendix*');
  });

  it('parses frontmatter correctly and falls back to markdown H1', () => {
    const raw = `---
title: "Explicit Title"
order: 5
toc: true
---

# Ignored Title
Some text here.
`;
    const result = parseFrontmatter(raw, 'Default Title');
    expect(result.extractedTitle).toBe('Explicit Title');
    expect(result.frontmatter.order).toBe(5);
  });

  it('extracts first H1 when title is absent from frontmatter', () => {
    const raw = `---
order: 2
---

# Inferred Chapter Title
Content goes here.
`;
    const result = parseFrontmatter(raw, 'Default Title');
    expect(result.extractedTitle).toBe('Inferred Chapter Title');
  });
});

describe('3-Tier Deterministic Ordering Algorithm', () => {
  it('sorts documents by explicit order first, then filename', () => {
    const docs: DocumentFile[] = [
      {
        filePath: '/docs/03-intro.md',
        relativePath: 'content/03-intro.md',
        slug: '03-intro',
        type: 'chapter',
        title: 'Intro',
        order: 10,
        rawMarkdown: '',
        htmlContent: '',
        toc: true,
        pageBreakBefore: true,
        pageBreakAfter: false,
        header: true,
        footer: true,
        pageNumbers: true,
        frontmatter: {}
      },
      {
        filePath: '/docs/01-first.md',
        relativePath: 'content/01-first.md',
        slug: '01-first',
        type: 'chapter',
        title: 'First',
        order: 2,
        rawMarkdown: '',
        htmlContent: '',
        toc: true,
        pageBreakBefore: true,
        pageBreakAfter: false,
        header: true,
        footer: true,
        pageNumbers: true,
        frontmatter: {}
      },
      {
        filePath: '/docs/02-unspecified.md',
        relativePath: 'content/02-unspecified.md',
        slug: '02-unspecified',
        type: 'chapter',
        title: 'Unspecified',
        rawMarkdown: '',
        htmlContent: '',
        toc: true,
        pageBreakBefore: true,
        pageBreakAfter: false,
        header: true,
        footer: true,
        pageNumbers: true,
        frontmatter: {}
      }
    ];

    const sorted = sortDocuments(docs);
    expect(sorted[0].slug).toBe('01-first'); // order: 2
    expect(sorted[1].slug).toBe('03-intro'); // order: 10
    expect(sorted[2].slug).toBe('02-unspecified'); // no explicit order -> ordered last
  });
});
