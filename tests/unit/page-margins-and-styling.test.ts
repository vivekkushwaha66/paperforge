import { describe, it, expect } from 'vitest';
import { PDFDocument } from 'pdf-lib';
import {
  parseMarginString,
  MarginsSchema,
  ContentMarginsSchema,
  FrontmatterSchema,
  ProjectConfigSchema
} from '../../src/config/schema.js';
import { parseFrontmatter } from '../../src/document/frontmatter.js';
import { assembleHtml, isFullBleedLayout } from '../../src/rendering/html-assembler.js';
import { injectPdfMetadata } from '../../src/document/metadata.js';
import { Publication, DocumentFile } from '../../src/document/model.js';

describe('Margin Parsing and Schema Support', () => {
  it('parses shorthand CSS margin strings correctly', () => {
    // 1 token
    expect(parseMarginString('25px')).toEqual({
      top: '25px',
      bottom: '25px',
      left: '25px',
      right: '25px'
    });

    // 2 tokens (vertical horizontal)
    expect(parseMarginString('30px 45px')).toEqual({
      top: '30px',
      bottom: '30px',
      left: '45px',
      right: '45px'
    });

    // 3 tokens (top horizontal bottom)
    expect(parseMarginString('10px 20px 30px')).toEqual({
      top: '10px',
      right: '20px',
      bottom: '30px',
      left: '20px'
    });

    // 4 tokens (top right bottom left)
    expect(parseMarginString('10px 20px 30px 40px')).toEqual({
      top: '10px',
      right: '20px',
      bottom: '30px',
      left: '40px'
    });
  });

  it('validates MarginsSchema with string and object representations', () => {
    const fromString = MarginsSchema.parse('35mm 40mm');
    expect(fromString.top).toBe('35mm');
    expect(fromString.left).toBe('40mm');

    const fromObject = MarginsSchema.parse({
      top: '15mm',
      bottom: '25mm'
    });
    expect(fromObject.top).toBe('15mm');
    expect(fromObject.bottom).toBe('25mm');
    expect(fromObject.left).toBe('20mm'); // default
  });

  it('validates separate content margins schema', () => {
    const fromString = ContentMarginsSchema.parse('15px 0px');
    expect(fromString.top).toBe('15px');
    expect(fromString.left).toBe('0px');
  });

  it('validates ProjectConfigSchema with separate page margins and content margins', () => {
    const config = ProjectConfigSchema.parse({
      title: 'Carousel Publication',
      pdf: {
        format: 'Square',
        background: '#121316',
        margins: '40px 50px',
        content_margins: '20px 0px'
      }
    });

    expect(config.pdf.background).toBe('#121316');
    expect(config.pdf.margins.top).toBe('40px');
    expect(config.pdf.margins.left).toBe('50px');
    expect(config.pdf.content_margins?.top).toBe('20px');
  });
});

describe('Page-Level Frontmatter Customization', () => {
  it('parses page background, page margins, content margins, and custom styles', () => {
    const raw = `---
title: "Concurrency and Locks"
page: 2
background: "#181A20"
margins: "35px 48px"
content_margins: "24px 0px"
style: "color: #FFFFFF; font-weight: 500;"
class: "dark-slide problem-card"
header:
  right: "02 / 05"
  accent_bar: true
footer:
  left: "Systems Architecture"
  right: "Swipe ▶"
metadata:
  subject: "Distributed Systems State Sharing"
  keywords: ["locks", "concurrency"]
---

# The common instinct is to add locks.

Thousands of orders arrive concurrently.
`;

    const { frontmatter, extractedTitle } = parseFrontmatter(raw, 'Fallback');
    expect(extractedTitle).toBe('Concurrency and Locks');
    expect(frontmatter.page).toBe(2);
    expect(frontmatter.background).toBe('#181A20');
    expect(frontmatter.margins?.top).toBe('35px');
    expect(frontmatter.content_margins?.top).toBe('24px');
    expect(frontmatter.style).toContain('color: #FFFFFF');
    expect(frontmatter.class).toBe('dark-slide problem-card');
    expect((frontmatter.header as any).right).toBe('02 / 05');
    expect((frontmatter.footer as any).right).toBe('Swipe ▶');
    expect(frontmatter.metadata?.subject).toBe('Distributed Systems State Sharing');
  });
});

describe('Full-Bleed HTML Assembler with Separate Margins and Backgrounds', () => {
  it('detects full-bleed layout when background or card formatting is set', () => {
    const doc: DocumentFile = {
      filePath: 'doc.md',
      relativePath: 'content/doc.md',
      slug: 'hook',
      type: 'chapter',
      title: 'State Sharing',
      rawMarkdown: '# State Sharing',
      htmlContent: '<h1>State Sharing</h1>',
      toc: false,
      pageBreakBefore: false,
      pageBreakAfter: false,
      header: true,
      footer: true,
      pageNumbers: true,
      background: '#121316',
      pageMargins: { top: '32px', bottom: '32px', left: '48px', right: '48px' },
      contentMargins: { top: '24px', bottom: '24px', left: '0px', right: '0px' },
      style: 'color: #FFF;',
      frontmatter: {}
    };

    const pub: Publication = {
      config: ProjectConfigSchema.parse({
        title: 'System Carousel',
        pdf: { format: 'Square' }
      }),
      projectDir: '.',
      documents: [doc],
      themeCss: '',
      typographyCss: ''
    };

    expect(isFullBleedLayout(pub)).toBe(true);

    const { html } = assembleHtml(pub);
    // Verifies full bleed page container
    expect(html).toContain('class="forge-chapter forge-page"');

    // Verifies background is applied to page container
    expect(html).toContain('background: #121316');
    // Verifies separate page margins applied to page shell padding
    expect(html).toContain('padding: 32px 48px 32px 48px');
    // Verifies separate content margins applied to content container
    expect(html).toContain('margin: 24px 0px 24px 0px');
    // Verifies in-page accent bar and running header
    expect(html).toContain('class="forge-accent-bar"');
    expect(html).toContain('class="forge-page-number"');
  });

  it('supports different backgrounds and styles per page', () => {
    const doc1: DocumentFile = {
      filePath: '01.md',
      relativePath: 'content/01.md',
      slug: 'page-1',
      type: 'card',
      title: 'Page 1',
      rawMarkdown: '# Page 1',
      htmlContent: '<h1>Page 1</h1>',
      toc: false,
      pageBreakBefore: false,
      pageBreakAfter: true,
      header: true,
      footer: true,
      pageNumbers: true,
      background: '#0B132B',
      style: 'border-left: 4px solid #38BDF8;',
      frontmatter: {}
    };

    const doc2: DocumentFile = {
      filePath: '02.md',
      relativePath: 'content/02.md',
      slug: 'page-2',
      type: 'card',
      title: 'Page 2',
      rawMarkdown: '# Page 2',
      htmlContent: '<h1>Page 2</h1>',
      toc: false,
      pageBreakBefore: true,
      pageBreakAfter: false,
      header: true,
      footer: true,
      pageNumbers: true,
      background: '#18181B',
      style: 'border-left: 4px solid #34D399;',
      frontmatter: {}
    };

    const pub: Publication = {
      config: ProjectConfigSchema.parse({
        title: 'Multi-Style Publication',
        pdf: { format: 'Square' }
      }),
      projectDir: '.',
      documents: [doc1, doc2],
      themeCss: '',
      typographyCss: ''
    };

    const { html } = assembleHtml(pub);
    expect(html).toContain('background: #0B132B');
    expect(html).toContain('border-left: 4px solid #38BDF8;');
    expect(html).toContain('background: #18181B');
    expect(html).toContain('border-left: 4px solid #34D399;');
  });
});

describe('Metadata Injection and Updates', () => {
  it('updates PDF metadata dynamically from merged frontmatter', async () => {
    // Generate minimal PDF buffer with pdf-lib
    const initialDoc = await PDFDocument.create();
    initialDoc.addPage([500, 500]);
    const initialPdfBytes = await initialDoc.save();

    const config = ProjectConfigSchema.parse({
      title: 'Initial Title',
      author: 'Initial Author'
    });

    const overrides = {
      title: 'Updated State Sharing Carousel',
      author: 'Vivek Kushwaha',
      subject: 'System Architecture & High Concurrency',
      keywords: ['systems', 'trading-engine', 'concurrency'],
      version: '2.0.0'
    };

    const { pdfBuffer } = await injectPdfMetadata(initialPdfBytes, config, new Date(), overrides);

    const reloaded = await PDFDocument.load(pdfBuffer, { updateMetadata: false });
    expect(reloaded.getTitle()).toBe('Updated State Sharing Carousel');
    expect(reloaded.getAuthor()).toBe('Vivek Kushwaha');
    expect(reloaded.getSubject()).toBe('System Architecture & High Concurrency');
    expect(reloaded.getKeywords()).toContain('trading-engine');
  });
});
