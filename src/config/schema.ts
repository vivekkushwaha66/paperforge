import { z } from 'zod';

export const FontVariantSchema = z.object({
  path: z.string(),
  weight: z.union([z.number(), z.string()]).default(400),
  style: z.enum(['normal', 'italic', 'oblique']).default('normal')
});

export const FontConfigSchema = z.object({
  name: z.string(),
  source: z.enum(['local', 'system', 'google', 'web']),
  path: z.string().optional(),
  variants: z.array(FontVariantSchema).optional(),
  url: z.string().optional()
});

export const TypographySchema = z.object({
  fonts: z.array(FontConfigConfigFallbackSchema()).optional().default([]),
  selectors: z.object({
    body: z.string().default('-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'),
    headings: z.string().default('-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'),
    code: z.string().default('"SFMono-Regular", Consolas, "Liberation Mono", Menlo, monospace'),
    cover: z.string().default('-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif')
  }).default({}),
  fontSize: z.object({
    base: z.string().default('11pt'),
    h1: z.string().default('24pt'),
    h2: z.string().default('18pt'),
    h3: z.string().default('14pt'),
    h4: z.string().default('12pt')
  }).default({}),
  lineHeight: z.union([z.number(), z.string()]).default(1.6)
}).default({});

function FontConfigConfigFallbackSchema() {
  return FontConfigSchema;
}

export const TocConfigSchema = z.object({
  enabled: z.boolean().default(true),
  title: z.string().default('Table of Contents'),
  minDepth: z.number().int().min(1).max(6).default(1),
  maxDepth: z.number().int().min(1).max(6).default(3),
  ordered: z.boolean().default(true),
  pageNumbers: z.boolean().default(true),
  pageBreakAfter: z.boolean().default(true),
  position: z.enum(['after-cover', 'inline', 'start']).default('after-cover'),
  exclude: z.array(z.string()).default([])
}).default({});

export function parseMarginString(val: string): { top: string; bottom: string; left: string; right: string } {
  const parts = val.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 1) {
    return { top: parts[0], bottom: parts[0], left: parts[0], right: parts[0] };
  }
  if (parts.length === 2) {
    return { top: parts[0], bottom: parts[0], left: parts[1], right: parts[1] };
  }
  if (parts.length === 3) {
    return { top: parts[0], right: parts[1], bottom: parts[2], left: parts[1] };
  }
  if (parts.length >= 4) {
    return { top: parts[0], right: parts[1], bottom: parts[2], left: parts[3] };
  }
  return { top: '20mm', bottom: '20mm', left: '20mm', right: '20mm' };
}

export const MarginObjectSchema = z.object({
  top: z.string().default('20mm'),
  bottom: z.string().default('20mm'),
  left: z.string().default('20mm'),
  right: z.string().default('20mm')
});

export const MarginsSchema = z.preprocess((val) => {
  if (typeof val === 'string') {
    return parseMarginString(val);
  }
  return val;
}, MarginObjectSchema.default({}));

export const ContentMarginObjectSchema = z.object({
  top: z.string().default('0mm'),
  bottom: z.string().default('0mm'),
  left: z.string().default('0mm'),
  right: z.string().default('0mm')
});

export const ContentMarginsSchema = z.preprocess((val) => {
  if (typeof val === 'string') {
    return parseMarginString(val);
  }
  return val;
}, ContentMarginObjectSchema.default({}));

export const PdfConfigSchema = z.object({
  format: z.string().default('A4'),
  width: z.string().optional(),
  height: z.string().optional(),
  orientation: z.enum(['portrait', 'landscape']).default('portrait'),
  printBackground: z.boolean().default(true),
  pageNumbers: z.boolean().default(true),
  background: z.string().optional(),
  fullBleed: z.boolean().default(false),
  layout: z.enum(['document', 'cards', 'presentation', 'slides']).default('document'),
  margins: MarginsSchema.default({}),
  content_margins: ContentMarginsSchema.optional(),
  contentMargins: ContentMarginsSchema.optional(),
  renderer: z.enum(['system-browser', 'puppeteer-core', 'typst', 'pdfmake']).default('system-browser')
}).default({});

export const ProjectConfigSchema = z.object({
  title: z.string().default('Untitled Publication'),
  subtitle: z.string().optional(),
  author: z.string().default('Unknown Author'),
  version: z.string().default('1.0.0'),
  date: z.string().optional(),
  description: z.string().optional(),
  subject: z.string().optional(),
  keywords: z.array(z.string()).default([]),
  language: z.string().default('en-US'),
  creator: z.string().default('@vivekkushwaha66/paperforge v0.1.0'),
  publisher: z.string().optional(),
  copyright: z.string().optional(),
  metadata: z.record(z.any()).optional(),

  output: z.object({
    file: z.string().default('./dist/publication.pdf')
  }).default({}),

  content: z.object({
    directory: z.string().default('./content'),
    include: z.array(z.string()).default(['*.md']),
    exclude: z.array(z.string()).default(['drafts/*', '_*'])
  }).default({}),

  cover: z.object({
    file: z.string().optional()
  }).optional(),

  header: z.object({
    file: z.string().optional()
  }).optional(),

  footer: z.object({
    file: z.string().optional()
  }).optional(),

  pdf: PdfConfigSchema.default({}),
  toc: TocConfigSchema.default({}),
  typography: TypographySchema.default({}),

  theme: z.object({
    name: z.string().optional(),
    css: z.string().optional()
  }).default({})
});

export type ProjectConfig = z.infer<typeof ProjectConfigSchema>;
export type TocConfig = z.infer<typeof TocConfigSchema>;
export type TypographyConfig = z.infer<typeof TypographySchema>;
export type FontConfig = z.infer<typeof FontConfigSchema>;
export type PdfConfig = z.infer<typeof PdfConfigSchema>;
export type Margins = z.infer<typeof MarginObjectSchema>;

export const FrontmatterSchema = z.object({
  title: z.string().optional(),
  subtitle: z.string().optional(),
  order: z.number().optional(),
  page: z.number().optional(),
  type: z.enum(['chapter', 'appendix', 'cover', 'blank', 'page', 'card']).default('chapter'),
  author: z.string().optional(),
  description: z.string().optional(),
  toc: z.boolean().default(true),
  toc_depth: z.number().int().min(1).max(6).optional(),
  page_break_before: z.boolean().default(true),
  page_break_after: z.boolean().default(false),
  header: z.union([z.boolean(), z.record(z.any()), z.string()]).default(true),
  footer: z.union([z.boolean(), z.record(z.any()), z.string()]).default(true),
  page_numbers: z.boolean().default(true),
  subject: z.string().optional(),
  keywords: z.array(z.string()).optional(),
  language: z.string().optional(),
  version: z.string().optional(),
  copyright: z.string().optional(),
  publisher: z.string().optional(),
  date: z.string().optional(),

  // Page-level Background (complete background covering margins)
  background: z.string().optional(),
  bg: z.string().optional(),
  backgroundColor: z.string().optional(),

  // Page-level Margins
  margins: MarginsSchema.optional(),
  page_margins: MarginsSchema.optional(),
  pageMargins: MarginsSchema.optional(),

  // Content-level Margins (separate from page margins)
  content_margins: ContentMarginsSchema.optional(),
  contentMargins: ContentMarginsSchema.optional(),

  // Page-level Styles and Classes
  style: z.string().optional(),
  styles: z.string().optional(),
  class: z.string().optional(),
  className: z.string().optional(),
  theme: z.string().optional(),
  accent_color: z.string().optional(),
  accentColor: z.string().optional(),

  // Metadata update option
  metadata: z.record(z.any()).optional()
}).passthrough();

export type Frontmatter = z.infer<typeof FrontmatterSchema>;

