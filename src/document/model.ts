import { ProjectConfig, Frontmatter } from '../config/schema.js';

export interface DocumentFile {
  filePath: string;
  relativePath: string;
  slug: string;
  type: 'chapter' | 'appendix' | 'cover' | 'blank';
  title: string;
  subtitle?: string;
  order?: number;
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
  header: boolean;
  footer: boolean;
  pageNumbers: boolean;

  // Metadata
  frontmatter: Frontmatter;
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
}
