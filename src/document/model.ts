import { ProjectConfig, Frontmatter, Margins } from '../config/schema.js';

export interface DocumentFile {
  filePath: string;
  relativePath: string;
  slug: string;
  type: 'chapter' | 'appendix' | 'cover' | 'blank' | 'page' | 'card';
  title: string;
  subtitle?: string;
  order?: number;
  page?: number;
  author?: string;
  description?: string;

  // Raw and processed content
  rawMarkdown: string;
  htmlContent: string;

  // Layout behaviors
  toc: boolean;
  tocDepth?: number;
  pageBreakBefore: boolean;
  pageBreakAfter: boolean;
  header: boolean | Record<string, any> | string;
  footer: boolean | Record<string, any> | string;
  pageNumbers: boolean;

  // Page-level styling & margins
  background?: string;
  pageMargins?: Margins;
  contentMargins?: Margins;
  style?: string;
  className?: string;
  theme?: string;
  accentColor?: string;
  metadata?: Record<string, any>;

  // Metadata
  frontmatter: Frontmatter | Record<string, any>;
}

export interface Publication {
  config: ProjectConfig;
  projectDir: string;
  cover?: DocumentFile;
  headerTemplate?: string;
  footerTemplate?: string;
  documents: DocumentFile[];
  tocHtml?: string;
  themeCss: string;
  typographyCss: string;
  mergedMetadata?: Record<string, any>;
}

