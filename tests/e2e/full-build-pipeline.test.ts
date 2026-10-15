import { describe, it, expect } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';
import { PDFDocument } from 'pdf-lib';
import { runBuildCommand } from '../../src/cli/build.js';

describe('E2E: Full Publication Build Pipeline & PDF Verification', () => {
  // Increase timeout for full browser PDF rendering
  const BUILD_TIMEOUT = 60000;

  it('compiles "AI Stock Research Prompt Library" to valid PDF with metadata', async () => {
    const projectDir = path.resolve('examples/ai-stock-research');
    const expectedPdfPath = path.resolve(projectDir, 'dist/ai-stock-research.pdf');

    // Clean previous output if exists
    if (fs.existsSync(expectedPdfPath)) {
      fs.unlinkSync(expectedPdfPath);
    }

    await runBuildCommand(projectDir, { verbose: true });

    expect(fs.existsSync(expectedPdfPath)).toBe(true);
    const pdfBytes = fs.readFileSync(expectedPdfPath);
    expect(pdfBytes.length).toBeGreaterThan(5000);

    // Verify PDF structure with pdf-lib
    const pdfDoc = await PDFDocument.load(pdfBytes, { updateMetadata: false });
    expect(pdfDoc.getPageCount()).toBeGreaterThanOrEqual(5);
    expect(pdfDoc.getTitle()).toBe('AI Stock Research Prompt Library');
    expect(pdfDoc.getAuthor()).toBe('Vivek Kushwaha');
    expect(pdfDoc.getCreator()).toContain('@vivekkushwaha66/paperforge');
    expect(pdfDoc.getProducer()).toBe('Paperforge Engine');
  }, BUILD_TIMEOUT);

  it('compiles "Senior Engineering Resume Kit" to valid PDF', async () => {
    const projectDir = path.resolve('examples/resume-kit');
    const expectedPdfPath = path.resolve(projectDir, 'dist/resume-kit.pdf');

    if (fs.existsSync(expectedPdfPath)) {
      fs.unlinkSync(expectedPdfPath);
    }

    await runBuildCommand(projectDir, {});

    expect(fs.existsSync(expectedPdfPath)).toBe(true);
    const pdfBytes = fs.readFileSync(expectedPdfPath);
    const pdfDoc = await PDFDocument.load(pdfBytes, { updateMetadata: false });
    expect(pdfDoc.getPageCount()).toBeGreaterThanOrEqual(1);
    expect(pdfDoc.getTitle()).toBe('Senior Engineering Resume Kit');
  }, BUILD_TIMEOUT);

  it('compiles "AI Prompt Library for Senior Engineers" to valid PDF', async () => {
    const projectDir = path.resolve('examples/ai-prompt-library');
    const expectedPdfPath = path.resolve(projectDir, 'dist/ai-prompt-library.pdf');

    if (fs.existsSync(expectedPdfPath)) {
      fs.unlinkSync(expectedPdfPath);
    }

    await runBuildCommand(projectDir, {});

    expect(fs.existsSync(expectedPdfPath)).toBe(true);
    const pdfBytes = fs.readFileSync(expectedPdfPath);
    const pdfDoc = await PDFDocument.load(pdfBytes, { updateMetadata: false });
    expect(pdfDoc.getPageCount()).toBeGreaterThanOrEqual(3);
    expect(pdfDoc.getTitle()).toBe('AI Prompt Library for Senior Engineers');
  }, BUILD_TIMEOUT);

  it('compiles "Technical Architecture Whitepaper" with vector diagram to valid PDF', async () => {
    const projectDir = path.resolve('examples/architecture-whitepaper');
    const expectedPdfPath = path.resolve(projectDir, 'dist/architecture-whitepaper.pdf');

    if (fs.existsSync(expectedPdfPath)) {
      fs.unlinkSync(expectedPdfPath);
    }

    await runBuildCommand(projectDir, {});

    expect(fs.existsSync(expectedPdfPath)).toBe(true);
    const pdfBytes = fs.readFileSync(expectedPdfPath);
    const pdfDoc = await PDFDocument.load(pdfBytes, { updateMetadata: false });
    expect(pdfDoc.getPageCount()).toBeGreaterThanOrEqual(3);
    expect(pdfDoc.getTitle()).toBe('Technical Architecture Whitepaper');
  }, BUILD_TIMEOUT);

  it('compiles "System Architecture Carousel" (1080x1080 square cards) to publication PDF', async () => {
    const projectDir = path.resolve('examples/system-architecture-carousel');
    const expectedPdfPath = path.resolve(projectDir, 'dist/system-architecture-carousel.pdf');

    if (fs.existsSync(expectedPdfPath)) {
      fs.unlinkSync(expectedPdfPath);
    }

    await runBuildCommand(projectDir, {});

    expect(fs.existsSync(expectedPdfPath)).toBe(true);
    const pdfBytes = fs.readFileSync(expectedPdfPath);
    const pdfDoc = await PDFDocument.load(pdfBytes, { updateMetadata: false });
    expect(pdfDoc.getPageCount()).toBe(5);
    expect(pdfDoc.getTitle()).toBe('Most systems slow down because of how they share state');
  }, BUILD_TIMEOUT);

  it('compiles "Executive Brief Cards" with multi-page styling and updated metadata', async () => {
    const projectDir = path.resolve('examples/executive-brief-cards');
    const expectedPdfPath = path.resolve(projectDir, 'dist/executive-brief-cards.pdf');

    if (fs.existsSync(expectedPdfPath)) {
      fs.unlinkSync(expectedPdfPath);
    }

    await runBuildCommand(projectDir, {});

    expect(fs.existsSync(expectedPdfPath)).toBe(true);
    const pdfBytes = fs.readFileSync(expectedPdfPath);
    const pdfDoc = await PDFDocument.load(pdfBytes, { updateMetadata: false });
    expect(pdfDoc.getPageCount()).toBe(3);
    expect(pdfDoc.getSubject()).toBe('Strategic AI Compute & Agent Orchestration');
    expect(pdfDoc.getKeywords()).toContain('gpu-clusters');
  }, BUILD_TIMEOUT);
});

