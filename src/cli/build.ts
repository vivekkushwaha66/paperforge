import fs from 'node:fs';
import path from 'node:path';
import chalk from 'chalk';
import { loadConfig } from '../config/loader.js';
import { scanProject } from '../document/scanner.js';
import { assembleHtml } from '../rendering/html-assembler.js';
import { SystemBrowserRenderer } from '../rendering/system-browser.js';
import { injectPdfMetadata } from '../document/metadata.js';
import { validateProject } from '../validation/project-validator.js';
import { printDiagnostics } from '../validation/diagnostics.js';
import { logger } from '../logger/logger.js';

export interface BuildCliOptions {
  output?: string;
  renderer?: 'system-browser' | 'puppeteer-core' | 'typst';
  verbose?: boolean;
  watch?: boolean;
}

export async function runBuildCommand(rawProjectPath: string = '.', options: BuildCliOptions = {}): Promise<void> {
  const startTime = Date.now();
  const projectDir = path.resolve(rawProjectPath);

  if (options.verbose) {
    logger.isVerbose = true;
  }

  logger.banner('Paperforge — Publication Build Pipeline', `@vivekkushwaha66/paperforge v0.1.0`);
  logger.info(`Target project: ${chalk.cyan(projectDir)}`);

  let currentStage = 1;
  let loadedConfig;

  try {
    // Stage 1: Load & Validate Configuration
    logger.step(1, 14, 'Load & Validate Configuration');
    currentStage = 1;
    loadedConfig = loadConfig(projectDir);
    const config = loadedConfig.config;

    // Apply CLI overrides
    if (options.output) {
      config.output.file = options.output;
    }
    if (options.renderer) {
      config.pdf.renderer = options.renderer;
    }

    // Stage 2: Pre-build project validation
    logger.step(2, 14, 'Run Pre-Build Project Validation');
    currentStage = 2;
    const valReport = validateProject(projectDir);
    if (!valReport.valid) {
      printDiagnostics(valReport, projectDir);
      throw new Error(`Validation failed with ${valReport.errors.length} error(s). Please resolve them before building.`);
    }

    // Stage 3: Scan Project Files
    logger.step(3, 14, 'Scan Project Files');
    currentStage = 3;
    const scanned = scanProject(projectDir, config);
    logger.info(`Discovered ${scanned.documents.length} chapter document(s)${scanned.coverDoc ? ' and 1 cover page' : ''}.`);

    // Stage 4: Verify Content
    logger.step(4, 14, 'Verify Document Content Sequence');
    currentStage = 4;
    if (scanned.documents.length === 0 && !scanned.coverDoc) {
      throw new Error(`No content found to build in "${projectDir}".`);
    }

    // Stage 5: Compile Documents & Inline Assets
    logger.step(5, 14, 'Compile Markdown & Inline Assets (Base64 Offline Mode)');
    currentStage = 5;
    const publication = {
      config,
      projectDir,
      cover: scanned.coverDoc,
      headerTemplate: scanned.headerTemplate,
      footerTemplate: scanned.footerTemplate,
      documents: scanned.documents,
      themeCss: '',
      typographyCss: ''
    };

    // Stage 6, 7, 8, 9, 10: Assemble Full HTML
    logger.step(6, 14, 'Synthesize Table of Contents (TOC) & Dotted Leaders');
    logger.step(7, 14, 'Interpolate Running Headers & Footers');
    logger.step(8, 14, 'Compile Typography Engine & Embed Font Faces');
    logger.step(9, 14, 'Apply CSS Print Themes & Paged Media Rules');
    logger.step(10, 14, 'Assemble Self-Contained HTML DOM Document');
    currentStage = 10;
    const { html, assetIssues } = assembleHtml(publication);

    if (assetIssues.length > 0) {
      logger.warn(`Found ${assetIssues.length} unresolved asset reference(s).`);
    }

    // Stage 11: Dispatch to PDF Rendering Engine
    logger.step(11, 14, `Dispatch to PDF Engine (${config.pdf.renderer})`);
    currentStage = 11;
    const renderer = new SystemBrowserRenderer();
    const outputPath = path.resolve(projectDir, config.output.file);

    const renderResult = await renderer.render(html, {
      config,
      headerTemplate: scanned.headerTemplate,
      footerTemplate: scanned.footerTemplate,
      outputPath
    });

    // Stage 12: Inject PDF /Info & XMP Metadata
    logger.step(12, 14, 'Inject PDF /Info & XMP Metadata (pdf-lib)');
    currentStage = 12;
    const metadataResult = await injectPdfMetadata(renderResult.pdfBuffer, config);

    // Stage 13: Write Binary PDF to Disk
    logger.step(13, 14, 'Write Binary PDF to Disk');
    currentStage = 13;
    const distDir = path.dirname(outputPath);
    if (!fs.existsSync(distDir)) {
      fs.mkdirSync(distDir, { recursive: true });
    }
    fs.writeFileSync(outputPath, Buffer.from(metadataResult.pdfBuffer));

    // Stage 14: Report Build Statistics
    logger.step(14, 14, 'Finalize & Report Build Statistics');
    currentStage = 14;
    const totalDurationMs = Date.now() - startTime;
    const fileSizeBytes = fs.statSync(outputPath).size;
    const fileSizeFormatted = fileSizeBytes > 1024 * 1024
      ? `${(fileSizeBytes / (1024 * 1024)).toFixed(2)} MB`
      : `${(fileSizeBytes / 1024).toFixed(1)} KB`;

    console.log();
    console.log(chalk.greenBright.bold('✔ Publication generated successfully!'));
    console.log(chalk.gray('─'.repeat(50)));
    console.log(`  ${chalk.bold('Output PDF:')}  ${chalk.cyanBright.bold(outputPath)}`);
    console.log(`  ${chalk.bold('Total Pages:')} ${chalk.white.bold(metadataResult.pageCount)}`);
    console.log(`  ${chalk.bold('File Size:')}   ${chalk.white(fileSizeFormatted)}`);
    console.log(`  ${chalk.bold('Build Time:')}  ${chalk.white(`${(totalDurationMs / 1000).toFixed(2)}s`)}`);
    console.log(chalk.gray('─'.repeat(50)));
    console.log();
  } catch (err) {
    const errorLogPath = logger.writeErrorLog(projectDir, err, {
      stage: currentStage,
      projectDir,
      options,
      config: loadedConfig?.config
    });

    console.log();
    logger.error(`Build failed at Stage ${currentStage}: ${(err as Error).message}`);
    console.log();
    console.log(chalk.bgRed.white.bold(' DIAGNOSTIC LOG GENERATED '));
    console.log(chalk.red(`A complete diagnostic report with timestamped logs and stack trace was saved to:`));
    console.log(`  👉 ${chalk.yellowBright.bold(errorLogPath)}`);
    console.log();

    process.exitCode = 1;
    throw err;
  }
}
