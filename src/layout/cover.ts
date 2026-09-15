import MarkdownIt from 'markdown-it';
import { DocumentFile } from '../document/model.js';
import { ProjectConfig } from '../config/schema.js';

export function renderCoverPage(coverDoc: DocumentFile | undefined, config: ProjectConfig, md: MarkdownIt): string {
  if (!coverDoc) return '';

  let raw = coverDoc.rawMarkdown;
  raw = raw.replace(/{{\s*title\s*}}/gi, coverDoc.title || config.title || '');
  raw = raw.replace(/{{\s*subtitle\s*}}/gi, coverDoc.subtitle || config.subtitle || '');
  raw = raw.replace(/{{\s*author\s*}}/gi, coverDoc.author || config.author || '');
  raw = raw.replace(/{{\s*version\s*}}/gi, coverDoc.frontmatter.version || config.version || '');
  raw = raw.replace(/{{\s*date\s*}}/gi, coverDoc.frontmatter.date || config.date || '');

  const renderedHtml = md.render(raw);

  return `
<div class="page-cover chapter-break">
  <div class="cover-inner">
    ${renderedHtml}
  </div>
</div>
`;
}
