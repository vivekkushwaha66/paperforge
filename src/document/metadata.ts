import { PDFDocument } from 'pdf-lib';
import { ProjectConfig } from '../config/schema.js';

export interface MetadataResult {
  pdfBuffer: Uint8Array;
  pageCount: number;
}

export async function injectPdfMetadata(
  rawPdfBuffer: Uint8Array,
  config: ProjectConfig,
  buildDate: Date = new Date()
): Promise<MetadataResult> {
  const pdfDoc = await PDFDocument.load(rawPdfBuffer, { updateMetadata: false });

  if (config.title) {
    pdfDoc.setTitle(config.title);
  }

  if (config.author) {
    pdfDoc.setAuthor(config.author);
  }

  const subject = config.subject || config.description;
  if (subject) {
    pdfDoc.setSubject(subject);
  }

  if (config.keywords && config.keywords.length > 0) {
    pdfDoc.setKeywords(config.keywords);
  }

  pdfDoc.setCreator(config.creator || '@vivekkushwaha66/paperforge v0.1.0');
  pdfDoc.setProducer('Paperforge Engine');
  pdfDoc.setCreationDate(buildDate);
  pdfDoc.setModificationDate(buildDate);

  const pageCount = pdfDoc.getPageCount();
  const modifiedBytes = await pdfDoc.save({ updateMetadata: false } as any);

  return {
    pdfBuffer: modifiedBytes,
    pageCount
  };
}
