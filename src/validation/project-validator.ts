import fs from 'node:fs';
import path from 'node:path';
import { ProjectConfig, ProjectConfigSchema } from '../config/schema.js';
import { loadConfig, findConfigFile } from '../config/loader.js';
import { scanProject } from '../document/scanner.js';
import { resolveAssetPath } from '../markdown/asset-resolver.js';

export interface DiagnosticItem {
  type: 'error' | 'warning';
  file?: string;
  line?: number;
  message: string;
  suggestion?: string;
}

export interface ValidationReport {
  valid: boolean;
  errors: DiagnosticItem[];
  warnings: DiagnosticItem[];
  scannedCount: number;
}

export function validateProject(projectDir: string): ValidationReport {
  const errors: DiagnosticItem[] = [];
  const warnings: DiagnosticItem[] = [];

  const absProjectDir = path.resolve(projectDir);
  if (!fs.existsSync(absProjectDir)) {
    return {
      valid: false,
      errors: [{ type: 'error', message: `Target project directory does not exist: ${absProjectDir}` }],
      warnings: [],
      scannedCount: 0
    };
  }

  // 1. Configuration Validation
  const configFile = findConfigFile(absProjectDir);
  let config: ProjectConfig;
  if (!configFile) {
    warnings.push({
      type: 'warning',
      message: 'No paperforge.yaml found. Proceeding with default project configuration.'
    });
    try {
      config = loadConfig(absProjectDir).config;
    } catch (err) {
      errors.push({
        type: 'error',
        message: (err as Error).message
      });
      return { valid: false, errors, warnings, scannedCount: 0 };
    }
  } else {
    try {
      config = loadConfig(absProjectDir).config;
    } catch (err) {
      errors.push({
        type: 'error',
        file: configFile,
        message: (err as Error).message
      });
      return { valid: false, errors, warnings, scannedCount: 0 };
    }
  }

  // 2. Validate Fonts & Theme files
  if (config.theme?.css) {
    const cssPath = path.resolve(absProjectDir, config.theme.css);
    if (!fs.existsSync(cssPath)) {
      errors.push({
        type: 'error',
        file: configFile || 'paperforge.yaml',
        message: `Configured theme CSS file not found: ${config.theme.css} (resolved to: ${cssPath})`,
        suggestion: 'Check the theme.css path in paperforge.yaml or create the file.'
      });
    }
  }

  if (config.typography?.fonts) {
    for (const font of config.typography.fonts) {
      if (font.source === 'local') {
        if (font.variants && font.variants.length > 0) {
          for (const variant of font.variants) {
            const fontPath = path.resolve(absProjectDir, variant.path);
            if (!fs.existsSync(fontPath)) {
              errors.push({
                type: 'error',
                file: configFile || 'paperforge.yaml',
                message: `Local font variant file not found: ${variant.path} (${font.name}, weight ${variant.weight})`
              });
            }
          }
        } else if (font.path) {
          const fontPath = path.resolve(absProjectDir, font.path);
          if (!fs.existsSync(fontPath)) {
            errors.push({
              type: 'error',
              file: configFile || 'paperforge.yaml',
              message: `Local font file not found: ${font.path} (${font.name})`
            });
          }
        }
      }
    }
  }

  // 3. Scan documents
  let scanned;
  try {
    scanned = scanProject(absProjectDir, config);
  } catch (err) {
    errors.push({
      type: 'error',
      message: `Failed scanning project documents: ${(err as Error).message}`
    });
    return { valid: false, errors, warnings, scannedCount: 0 };
  }

  if (scanned.documents.length === 0 && !scanned.coverDoc) {
    warnings.push({
      type: 'warning',
      message: 'No documents found in content directory matching include/exclude patterns.'
    });
  }

  // 4. Validate unique 'order' values
  const seenOrders = new Map<number, string>();
  for (const doc of scanned.documents) {
    if (typeof doc.order === 'number') {
      if (seenOrders.has(doc.order)) {
        warnings.push({
          type: 'warning',
          file: doc.filePath,
          message: `Duplicate order ${doc.order} found in "${path.basename(doc.filePath)}" (already used in "${path.basename(seenOrders.get(doc.order)!)}")`
        });
      } else {
        seenOrders.set(doc.order, doc.filePath);
      }
    }

    if (!doc.title) {
      warnings.push({
        type: 'warning',
        file: doc.filePath,
        message: `Document has no title defined in frontmatter or top-level heading.`
      });
    }

    // 5. Validate image references inside doc
    const md = doc.rawMarkdown;
    const mdImageRegex = /!\[([^\]]*)\]\(([^)\s]+)(?:\s+"([^"]*)")?\)/g;
    let match;
    while ((match = mdImageRegex.exec(md)) !== null) {
      const assetRef = match[2];
      if (!/^https?:\/\//i.test(assetRef) && !assetRef.startsWith('data:')) {
        const resolved = resolveAssetPath(assetRef, doc.filePath, absProjectDir);
        if (!fs.existsSync(resolved)) {
          const upToMatch = md.slice(0, match.index);
          const line = upToMatch.split('\n').length;
          errors.push({
            type: 'error',
            file: doc.filePath,
            line,
            message: `Referenced image not found: ${assetRef}`,
            suggestion: `Target path resolved to: ${resolved}`
          });
        }
      }
    }
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings,
    scannedCount: scanned.documents.length + (scanned.coverDoc ? 1 : 0)
  };
}
