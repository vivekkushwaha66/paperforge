import { describe, it, expect } from 'vitest';
import { extractHeadings, generateTocHtml } from '../../src/markdown/toc-generator.js';
import { resolveAssetPath, validateAndInlineAssets } from '../../src/markdown/asset-resolver.js';
import { DocumentFile } from '../../src/document/model.js';
import { TocConfig } from '../../src/config/schema.js';

describe('Table of Contents Generator', () => {
  const mockDocs: DocumentFile[] = [
    {
      filePath: '/proj/content/01.md',
      relativePath: 'content/01.md',
      slug: '01',
      type: 'chapter',
      title: 'Introduction',
      rawMarkdown: `# Introduction\n\nSome text.\n\n## Subtopic A\n\n### Deep Detail\n\n## Excluded Topic`,
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

  const tocConfig: TocConfig = {
    enabled: true,
    title: 'Table of Contents',
    minDepth: 1,
    maxDepth: 3,
    ordered: true,
    pageNumbers: true,
    pageBreakAfter: true,
    position: 'after-cover',
    exclude: ['Excluded Topic']
  };

  it('extracts headings respecting minDepth, maxDepth, and exclude patterns', () => {
    const headings = extractHeadings(mockDocs, tocConfig);
    expect(headings.length).toBe(3);
    expect(headings[0].text).toBe('Introduction');
    expect(headings[0].level).toBe(1);
    expect(headings[1].text).toBe('Subtopic A');
    expect(headings[1].level).toBe(2);
    expect(headings[2].text).toBe('Deep Detail');
    expect(headings[2].level).toBe(3);
    expect(headings.find(h => h.text === 'Excluded Topic')).toBeUndefined();
  });

  it('generates semantic HTML with leader lines and anchor links', () => {
    const headings = extractHeadings(mockDocs, tocConfig);
    const html = generateTocHtml(headings, tocConfig);

    expect(html).toContain('class="forge-toc');
    expect(html).toContain('<ol class="toc-list depth-1">');
    expect(html).toContain('href="#introduction"');
    expect(html).toContain('class="toc-leader"');
    expect(html).toContain('class="toc-page"');
    expect(html).toContain('<span class="toc-number">1. </span>Introduction');
  });
});

describe('Asset Resolver', () => {
  it('resolves relative paths and root-relative paths', () => {
    const resolvedRel = resolveAssetPath('../assets/images/logo.png', 'd:/projects/my-doc/content/01.md', 'd:/projects/my-doc');
    expect(resolvedRel.replace(/\\/g, '/')).toContain('my-doc/assets/images/logo.png');

    const resolvedRoot = resolveAssetPath('/assets/images/logo.png', 'd:/projects/my-doc/content/01.md', 'd:/projects/my-doc');
    expect(resolvedRoot.replace(/\\/g, '/')).toContain('my-doc/assets/images/logo.png');
  });

  it('flags missing assets during validation', () => {
    const issues: any[] = [];
    const md = 'Here is an image: ![Missing](assets/nonexistent.png)';
    validateAndInlineAssets(md, 'd:/projects/my-doc/content/01.md', 'd:/projects/my-doc', issues);

    expect(issues.length).toBe(1);
    expect(issues[0].assetPath).toBe('assets/nonexistent.png');
    expect(issues[0].line).toBe(1);
  });
});
