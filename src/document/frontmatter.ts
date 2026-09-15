import matter from 'gray-matter';
import { Frontmatter, FrontmatterSchema } from '../config/schema.js';

export interface ParsedDocument {
  frontmatter: Frontmatter;
  content: string;
  extractedTitle: string;
}

export function extractFirstH1(markdown: string): string | null {
  const match = markdown.match(/^#\s+(.+)$/m);
  return match ? match[1].trim() : null;
}

export function parseFrontmatter(fileContent: string, fallbackTitle: string): ParsedDocument {
  const parsed = matter(fileContent);
  const validated = FrontmatterSchema.safeParse(parsed.data || {});
  const frontmatter: Frontmatter = validated.success ? validated.data : FrontmatterSchema.parse({});
  const firstH1 = extractFirstH1(parsed.content);
  const extractedTitle = frontmatter.title || firstH1 || fallbackTitle;

  return {
    frontmatter,
    content: parsed.content,
    extractedTitle
  };
}
