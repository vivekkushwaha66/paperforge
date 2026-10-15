import { describe, it, expect } from 'vitest';
import { PdfMakeRenderer, parseLengthToPt, isDarkColor } from '../../src/rendering/pdfmake-renderer.js';
import { ProjectConfigSchema } from '../../src/config/schema.js';
import { Publication, DocumentFile } from '../../src/document/model.js';
import { PDFDocument } from 'pdf-lib';

describe('PdfMakeRenderer & Direct SVG Vector Engine', () => {
  it('correctly converts dimension strings to points', () => {
    expect(parseLengthToPt('72pt')).toBe(72);
    expect(parseLengthToPt('1in')).toBe(72);
    expect(parseLengthToPt('25.4mm')).toBeCloseTo(72, 1);
    expect(parseLengthToPt('96px')).toBe(72);
    expect(parseLengthToPt('1080px')).toBe(810);
  });

  it('detects dark vs light colors for contrast calculation', () => {
    expect(isDarkColor('#0F172A')).toBe(true);
    expect(isDarkColor('#000000')).toBe(true);
    expect(isDarkColor('#111625')).toBe(true);
    expect(isDarkColor('#FFFFFF')).toBe(false);
    expect(isDarkColor('#F8FAFC')).toBe(false);
  });

  it('renders markdown with embedded SVG vector charts directly to PDF without browser', async () => {
    const renderer = new PdfMakeRenderer();
    expect(renderer.name).toBe('pdfmake');

    const config = ProjectConfigSchema.parse({
      title: 'Vector Architecture Publication',
      author: 'Paperforge Architect',
      pdf: {
        renderer: 'pdfmake',
        format: 'A4',
        margins: { top: '20mm', bottom: '20mm', left: '20mm', right: '20mm' },
        background: '#0F172A'
      }
    });

    const doc1: DocumentFile = {
      filePath: '/path/01.md',
      relativePath: '01.md',
      slug: '01',
      type: 'card',
      title: 'Architecture Overview',
      rawMarkdown: `# Scalable Cloud Architecture

This is a **high-performance** architectural diagram embedded as vector SVG.

<svg width="400" height="150" viewBox="0 0 400 150">
  <rect x="10" y="10" width="380" height="130" rx="8" fill="#1E293B" stroke="#DFBA87" stroke-width="2"/>
  <text x="200" y="50" fill="#DFBA87" font-family="Helvetica" font-size="16" text-anchor="middle">Vector Ingress</text>
  <circle cx="80" cy="90" r="25" fill="#38BDF8"/>
  <circle cx="320" cy="90" r="25" fill="#34D399"/>
</svg>

- Zero browser dependencies required
- Crisp at any zoom level
`,
      htmlContent: '',
      toc: false,
      pageBreakBefore: false,
      pageBreakAfter: false,
      header: true,
      footer: true,
      pageNumbers: true,
      order: 1,
      background: '#0F172A',
      accentColor: '#DFBA87',
      frontmatter: {}
    };

    const doc2: DocumentFile = {
      filePath: '/path/02.md',
      relativePath: '02.md',
      slug: '02',
      type: 'card',
      title: 'Failover Strategy',
      rawMarkdown: `# Multi-Region Failover

Here is a chart defined inside a fenced svg block:

\`\`\`svg
<svg width="350" height="120" viewBox="0 0 350 120">
  <rect width="350" height="120" rx="6" fill="#172554" stroke="#60A5FA" stroke-width="1.5"/>
  <text x="175" y="65" fill="#93C5FD" font-family="Helvetica" font-size="14" text-anchor="middle">Region US-East &lt;---&gt; EU-West</text>
</svg>
\`\`\`

> Active-active replication guarantees sub-second recovery times.
`,
      htmlContent: '',
      toc: false,
      pageBreakBefore: false,
      pageBreakAfter: false,
      header: true,
      footer: true,
      pageNumbers: true,
      order: 2,
      background: '#020617',
      accentColor: '#60A5FA',
      frontmatter: {}
    };

    const publication: Publication = {
      projectDir: '.',
      config,
      documents: [doc1, doc2],
      themeCss: '',
      typographyCss: ''
    };

    const result = await renderer.render('', {
      config,
      outputPath: 'test.pdf',
      publication
    });

    expect(result.pdfBuffer).toBeDefined();
    expect(result.pdfBuffer.length).toBeGreaterThan(1000);
    expect(result.pageCount).toBe(2);

    // Verify valid PDF structure via pdf-lib
    const parsedPdf = await PDFDocument.load(result.pdfBuffer);
    expect(parsedPdf.getPageCount()).toBe(2);
    expect(parsedPdf.getTitle()).toBe('Vector Architecture Publication');
    expect(parsedPdf.getAuthor()).toBe('Paperforge Architect');
  });
});
