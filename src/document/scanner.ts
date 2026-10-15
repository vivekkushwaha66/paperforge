import fs from 'node:fs';
import path from 'node:path';
import { ProjectConfig } from '../config/schema.js';
import { DocumentFile } from './model.js';
import { parseFrontmatter } from './frontmatter.js';
import { sortDocuments } from './ordering.js';
import { logger } from '../logger/logger.js';

function matchesPattern(filename: string, pattern: string): boolean {
  if (pattern === '*.md') return filename.endsWith('.md');
  if (pattern.startsWith('*.')) return filename.endsWith(pattern.slice(1));
  if (pattern.endsWith('/*')) {
    const dirPrefix = pattern.slice(0, -2);
    return filename.startsWith(dirPrefix);
  }
  if (pattern.startsWith('_*')) {
    return path.basename(filename).startsWith('_');
  }
  return filename === pattern || path.basename(filename) === pattern;
}

function shouldInclude(relPath: string, includePatterns: string[], excludePatterns: string[]): boolean {
  const normPath = relPath.replace(/\\/g, '/');

  for (const exc of excludePatterns) {
    if (matchesPattern(normPath, exc)) {
      return false;
    }
  }

  if (includePatterns.length === 0) return true;
  for (const inc of includePatterns) {
    if (matchesPattern(normPath, inc)) {
      return true;
    }
  }

  return false;
}

function walkDir(dir: string, baseDir: string = dir): string[] {
  if (!fs.existsSync(dir)) return [];
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  const files: string[] = [];

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      files.push(...walkDir(fullPath, baseDir));
    } else if (entry.isFile()) {
      files.push(path.relative(baseDir, fullPath));
    }
  }

  return files;
}

export interface ScannedProject {
  coverDoc?: DocumentFile;
  headerTemplate?: string;
  footerTemplate?: string;
  documents: DocumentFile[];
  mergedMetadata: Record<string, any>;
}

export function scanProject(projectDir: string, config: ProjectConfig): ScannedProject {
  const contentDir = path.resolve(projectDir, config.content.directory);
  logger.debug(`Scanning content directory: ${contentDir}`);

  const mergedMetadata: Record<string, any> = {
    title: config.title,
    subtitle: config.subtitle,
    author: config.author,
    version: config.version,
    date: config.date,
    description: config.description,
    subject: config.subject,
    keywords: [...config.keywords],
    language: config.language,
    creator: config.creator,
    publisher: config.publisher,
    copyright: config.copyright,
    ...(config.metadata || {})
  };

  // 1. Scan and parse cover.md if configured or present
  let coverDoc: DocumentFile | undefined;
  const coverFilePath = config.cover?.file
    ? path.resolve(projectDir, config.cover.file)
    : path.resolve(projectDir, 'cover.md');

  if (fs.existsSync(coverFilePath) && fs.statSync(coverFilePath).isFile()) {
    const raw = fs.readFileSync(coverFilePath, 'utf-8');
    const { frontmatter, content, extractedTitle } = parseFrontmatter(raw, config.title);

    const bg = frontmatter.background || frontmatter.bg || frontmatter.backgroundColor;
    const pageMargins = frontmatter.margins || frontmatter.page_margins || frontmatter.pageMargins;
    const contentMargins = frontmatter.content_margins || frontmatter.contentMargins;
    const style = frontmatter.style || frontmatter.styles;
    const className = frontmatter.class || frontmatter.className;
    const accentColor = frontmatter.accent_color || frontmatter.accentColor;

    coverDoc = {
      filePath: coverFilePath,
      relativePath: path.relative(projectDir, coverFilePath),
      slug: 'cover',
      type: 'cover',
      title: frontmatter.title || extractedTitle || config.title,
      subtitle: frontmatter.subtitle || config.subtitle,
      author: frontmatter.author || config.author,
      rawMarkdown: content,
      htmlContent: '',
      toc: false,
      pageBreakBefore: false,
      pageBreakAfter: true,
      header: frontmatter.header ?? false,
      footer: frontmatter.footer ?? false,
      pageNumbers: false,
      background: bg,
      pageMargins,
      contentMargins,
      style,
      className,
      theme: frontmatter.theme,
      accentColor,
      metadata: frontmatter.metadata,
      frontmatter
    };

    if (frontmatter.metadata) {
      Object.assign(mergedMetadata, frontmatter.metadata);
    }
    logger.debug(`Found cover file: ${coverFilePath}`);
  }

  // 2. Load header template
  let headerTemplate: string | undefined;
  const headerPath = config.header?.file
    ? path.resolve(projectDir, config.header.file)
    : path.resolve(projectDir, 'header.md');
  if (fs.existsSync(headerPath) && fs.statSync(headerPath).isFile()) {
    headerTemplate = fs.readFileSync(headerPath, 'utf-8');
    logger.debug(`Found header template: ${headerPath}`);
  }

  // 3. Load footer template
  let footerTemplate: string | undefined;
  const footerPath = config.footer?.file
    ? path.resolve(projectDir, config.footer.file)
    : path.resolve(projectDir, 'footer.md');
  if (fs.existsSync(footerPath) && fs.statSync(footerPath).isFile()) {
    footerTemplate = fs.readFileSync(footerPath, 'utf-8');
    logger.debug(`Found footer template: ${footerPath}`);
  }

  // 4. Scan content directory for chapter markdown files
  const rawFiles = walkDir(contentDir);
  const matchedRelFiles = rawFiles.filter(f => shouldInclude(f, config.content.include, config.content.exclude));

  const documents: DocumentFile[] = [];
  for (const relFile of matchedRelFiles) {
    const fullPath = path.join(contentDir, relFile);
    const raw = fs.readFileSync(fullPath, 'utf-8');
    const defaultTitle = path.basename(relFile, path.extname(relFile))
      .replace(/^[\d-_]+/, '')
      .replace(/[-_]/g, ' ')
      .trim();

    const { frontmatter, content, extractedTitle } = parseFrontmatter(raw, defaultTitle || 'Chapter');
    const slug = path.basename(relFile, path.extname(relFile)).toLowerCase().replace(/[^a-z0-9_-]/g, '-');

    const bg = frontmatter.background || frontmatter.bg || frontmatter.backgroundColor;
    const pageMargins = frontmatter.margins || frontmatter.page_margins || frontmatter.pageMargins;
    const contentMargins = frontmatter.content_margins || frontmatter.contentMargins;
    const style = frontmatter.style || frontmatter.styles;
    const className = frontmatter.class || frontmatter.className;
    const accentColor = frontmatter.accent_color || frontmatter.accentColor;

    documents.push({
      filePath: fullPath,
      relativePath: path.relative(projectDir, fullPath),
      slug,
      type: frontmatter.type || 'chapter',
      title: frontmatter.title || extractedTitle,
      subtitle: frontmatter.subtitle,
      order: frontmatter.order ?? frontmatter.page,
      page: frontmatter.page ?? frontmatter.order,
      author: frontmatter.author,
      description: frontmatter.description,
      rawMarkdown: content,
      htmlContent: '',
      toc: frontmatter.toc !== false,
      tocDepth: frontmatter.toc_depth,
      pageBreakBefore: frontmatter.page_break_before !== false,
      pageBreakAfter: frontmatter.page_break_after === true,
      header: frontmatter.header !== false ? frontmatter.header : false,
      footer: frontmatter.footer !== false ? frontmatter.footer : false,
      pageNumbers: frontmatter.page_numbers !== false,
      background: bg,
      pageMargins,
      contentMargins,
      style,
      className,
      theme: frontmatter.theme,
      accentColor,
      metadata: frontmatter.metadata,
      frontmatter
    });

    // Merge document-level metadata overrides
    if (frontmatter.metadata) {
      Object.assign(mergedMetadata, frontmatter.metadata);
    }
    if (frontmatter.keywords && frontmatter.keywords.length > 0) {
      mergedMetadata.keywords = Array.from(new Set([...(mergedMetadata.keywords || []), ...frontmatter.keywords]));
    }
    if (frontmatter.subject) mergedMetadata.subject = frontmatter.subject;
    if (frontmatter.publisher) mergedMetadata.publisher = frontmatter.publisher;
    if (frontmatter.copyright) mergedMetadata.copyright = frontmatter.copyright;
    if (frontmatter.version) mergedMetadata.version = frontmatter.version;
  }

  // Sort documents deterministically
  const sortedDocuments = sortDocuments(documents);
  logger.debug(`Discovered and sorted ${sortedDocuments.length} document(s).`);

  return {
    coverDoc,
    headerTemplate,
    footerTemplate,
    documents: sortedDocuments,
    mergedMetadata
  };
}

