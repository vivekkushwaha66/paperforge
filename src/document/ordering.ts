import path from 'node:path';
import { DocumentFile } from './model.js';

export function sortDocuments(docs: DocumentFile[]): DocumentFile[] {
  return [...docs].sort((a, b) => {
    const hasOrderA = typeof a.order === 'number';
    const hasOrderB = typeof b.order === 'number';

    // 1. Explicit Frontmatter Order
    if (hasOrderA && hasOrderB) {
      if (a.order !== b.order) {
        return (a.order as number) - (b.order as number);
      }
    } else if (hasOrderA && !hasOrderB) {
      return -1; // Ordered comes first
    } else if (!hasOrderA && hasOrderB) {
      return 1;
    }

    // 2. Lexicographical Filename Ordering
    const filenameA = path.basename(a.filePath);
    const filenameB = path.basename(b.filePath);
    const fileCompare = filenameA.localeCompare(filenameB, undefined, { numeric: true, sensitivity: 'base' });
    if (fileCompare !== 0) {
      return fileCompare;
    }

    // 3. Relative Path Fallback
    return a.relativePath.localeCompare(b.relativePath, undefined, { numeric: true });
  });
}
