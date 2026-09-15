import { ProjectConfig } from '../config/schema.js';

export interface RenderOptions {
  config: ProjectConfig;
  headerTemplate?: string;
  footerTemplate?: string;
  outputPath: string;
}

export interface RenderResult {
  pdfBuffer: Uint8Array;
  pageCount?: number;
  durationMs: number;
}

export interface IPdfRenderer {
  readonly name: string;
  render(assembledHtml: string, options: RenderOptions): Promise<RenderResult>;
}
