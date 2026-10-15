import { PDFDocument } from 'pdf-lib';
import { ProjectConfig } from '../config/schema.js';

export interface MetadataResult {
  pdfBuffer: Uint8Array;
  pageCount: number;
}

export interface PdfMetadataInput {
  title?: string;
  author?: string;
  subject?: string;
  description?: string;
  keywords?: string[];
  creator?: string;
  producer?: string;
  creationDate?: Date;
  modificationDate?: Date;
  publisher?: string;
  copyright?: string;
  version?: string;
  [key: string]: any;
}

export async function injectPdfMetadata(
  rawPdfBuffer: Uint8Array,
  config: ProjectConfig | PdfMetadataInput,
  buildDate: Date = new Date(),
  overrides?: Record<string, any>
): Promise<MetadataResult> {
  const pdfDoc = await PDFDocument.load(rawPdfBuffer, { updateMetadata: false });

  const merged: PdfMetadataInput = {
    ...config,
    ...(overrides || {})
  };

  if (merged.title) {
    pdfDoc.setTitle(merged.title);
  }

  if (merged.author) {
    pdfDoc.setAuthor(merged.author);
  }

  const subject = merged.subject || merged.description;
  if (subject) {
    pdfDoc.setSubject(subject);
  }

  if (merged.keywords && merged.keywords.length > 0) {
    pdfDoc.setKeywords(merged.keywords);
  }

  pdfDoc.setCreator(merged.creator || '@vivekkushwaha66/paperforge v0.1.0');
  pdfDoc.setProducer(merged.producer || 'Paperforge Engine');
  pdfDoc.setCreationDate(merged.creationDate || buildDate);
  pdfDoc.setModificationDate(merged.modificationDate || buildDate);

  const pageCount = pdfDoc.getPageCount();
  const modifiedBytes = await pdfDoc.save({ updateMetadata: false } as any);

  return {
    pdfBuffer: modifiedBytes,
    pageCount
  };
}

