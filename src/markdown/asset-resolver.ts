import fs from 'node:fs';
import path from 'node:path';
import { logger } from '../logger/logger.js';

export interface AssetValidationIssue {
  filePath: string;
  line?: number;
  assetPath: string;
  resolvedPath: string;
  message: string;
}

const MIME_TYPES: Record<string, string> = {
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp',
  '.gif': 'image/gif'
};

export function resolveAssetPath(assetRef: string, mdFilePath: string, projectDir: string): string {
  // If absolute HTTP/HTTPS link, return as-is
  if (/^https?:\/\//i.test(assetRef)) {
    return assetRef;
  }

  // Remove leading query params or anchors if any
  const cleanRef = assetRef.split('?')[0].split('#')[0];

  // 1. Root-relative or starts with assets/
  if (cleanRef.startsWith('/') || cleanRef.startsWith('assets/') || cleanRef.startsWith('assets\\')) {
    const rel = cleanRef.startsWith('/') ? cleanRef.slice(1) : cleanRef;
    return path.resolve(projectDir, rel);
  }

  // 2. Relative to markdown file (./ or ../ or direct filename)
  const mdDir = path.dirname(mdFilePath);
  return path.resolve(mdDir, cleanRef);
}

export function imageToBase64DataUri(absolutePath: string): string {
  const ext = path.extname(absolutePath).toLowerCase();
  const mime = MIME_TYPES[ext] || 'application/octet-stream';
  const fileBuffer = fs.readFileSync(absolutePath);
  return `data:${mime};base64,${fileBuffer.toString('base64')}`;
}

export function validateAndInlineAssets(
  markdown: string,
  mdFilePath: string,
  projectDir: string,
  issues: AssetValidationIssue[] = []
): string {
  // Match markdown image syntax: ![alt](path "optional title")
  const mdImageRegex = /!\[([^\]]*)\]\(([^)\s]+)(?:\s+"([^"]*)")?\)/g;

  let replaced = markdown.replace(mdImageRegex, (match, alt, assetRef, title) => {
    if (/^https?:\/\//i.test(assetRef) || assetRef.startsWith('data:')) {
      return match;
    }

    const resolved = resolveAssetPath(assetRef, mdFilePath, projectDir);

    if (!fs.existsSync(resolved) || !fs.statSync(resolved).isFile()) {
      // Find line number for diagnostics
      const upToMatch = markdown.slice(0, markdown.indexOf(match));
      const line = upToMatch.split('\n').length;
      issues.push({
        filePath: mdFilePath,
        line,
        assetPath: assetRef,
        resolvedPath: resolved,
        message: `Referenced image not found: ${assetRef}`
      });
      logger.warn(`Missing asset referenced in ${path.relative(projectDir, mdFilePath)}:${line} -> ${assetRef}`);
      return match;
    }

    try {
      const dataUri = imageToBase64DataUri(resolved);
      const titleAttr = title ? ` "${title}"` : '';
      return `![${alt}](${dataUri}${titleAttr})`;
    } catch (err) {
      logger.warn(`Failed to read and inline asset: ${resolved} (${(err as Error).message})`);
      return match;
    }
  });

  // Also handle <img src="..."> in raw HTML inside markdown
  const htmlImgRegex = /<img\s+([^>]*?)src=["']([^"']+)["']([^>]*?)>/gi;
  replaced = replaced.replace(htmlImgRegex, (match, before, src, after) => {
    if (/^https?:\/\//i.test(src) || src.startsWith('data:')) {
      return match;
    }

    const resolved = resolveAssetPath(src, mdFilePath, projectDir);
    if (!fs.existsSync(resolved) || !fs.statSync(resolved).isFile()) {
      const upToMatch = markdown.slice(0, markdown.indexOf(match));
      const line = upToMatch.split('\n').length;
      issues.push({
        filePath: mdFilePath,
        line,
        assetPath: src,
        resolvedPath: resolved,
        message: `HTML <img> references missing image: ${src}`
      });
      return match;
    }

    try {
      const dataUri = imageToBase64DataUri(resolved);
      return `<img ${before}src="${dataUri}"${after}>`;
    } catch {
      return match;
    }
  });

  return replaced;
}
