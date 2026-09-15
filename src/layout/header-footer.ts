import { ProjectConfig } from '../config/schema.js';

export interface HeaderFooterContext {
  title: string;
  chapter?: string;
  author: string;
  date?: string;
  version: string;
}

export function interpolateTemplate(
  template: string,
  context: HeaderFooterContext,
  isPuppeteerMode: boolean = true
): string {
  let output = template;

  output = output.replace(/{{\s*title\s*}}/gi, context.title || '');
  output = output.replace(/{{\s*chapter\s*}}/gi, context.chapter || context.title || '');
  output = output.replace(/{{\s*author\s*}}/gi, context.author || '');
  output = output.replace(/{{\s*date\s*}}/gi, context.date || '');
  output = output.replace(/{{\s*version\s*}}/gi, context.version || '');

  if (isPuppeteerMode) {
    // In Puppeteer header/footer templates, special class names are replaced by Chromium:
    // <span class="pageNumber"></span> and <span class="totalPages"></span>
    output = output.replace(/{{\s*page\s*}}/gi, '<span class="pageNumber"></span>');
    output = output.replace(/{{\s*pages\s*}}/gi, '<span class="totalPages"></span>');
  }

  return output;
}

export function buildPuppeteerHeaderTemplate(rawTemplate: string | undefined, config: ProjectConfig): string {
  if (!rawTemplate) return '<div></div>';

  const interpolated = interpolateTemplate(rawTemplate, {
    title: config.title,
    author: config.author,
    date: config.date,
    version: config.version
  }, true);

  return `
    <div style="font-size: 8pt; width: 100%; margin: 0 20mm; color: #64748B; display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid #E2E8F0; padding-bottom: 3px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
      ${interpolated}
    </div>
  `;
}

export function buildPuppeteerFooterTemplate(rawTemplate: string | undefined, config: ProjectConfig): string {
  if (!rawTemplate) {
    if (config.pdf.pageNumbers) {
      return `
        <div style="font-size: 8pt; width: 100%; margin: 0 20mm; color: #64748B; display: flex; justify-content: flex-end; align-items: center; border-top: 1px solid #E2E8F0; padding-top: 3px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
          <span>Page <span class="pageNumber"></span> of <span class="totalPages"></span></span>
        </div>
      `;
    }
    return '<div></div>';
  }

  const interpolated = interpolateTemplate(rawTemplate, {
    title: config.title,
    author: config.author,
    date: config.date,
    version: config.version
  }, true);

  return `
    <div style="font-size: 8pt; width: 100%; margin: 0 20mm; color: #64748B; display: flex; justify-content: space-between; align-items: center; border-top: 1px solid #E2E8F0; padding-top: 3px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
      ${interpolated}
    </div>
  `;
}
