import fs from 'node:fs';
import path from 'node:path';
import puppeteer, { PaperFormat } from 'puppeteer-core';
import { IPdfRenderer, RenderOptions, RenderResult } from './engine-interface.js';
import { buildPuppeteerHeaderTemplate, buildPuppeteerFooterTemplate } from '../layout/header-footer.js';
import { logger } from '../logger/logger.js';

export function findSystemBrowser(): string {
  // 1. Explicit environment variable
  if (process.env.PAPERFORGE_BROWSER_PATH && fs.existsSync(process.env.PAPERFORGE_BROWSER_PATH)) {
    return process.env.PAPERFORGE_BROWSER_PATH;
  }
  if (process.env.PUPPETEER_EXECUTABLE_PATH && fs.existsSync(process.env.PUPPETEER_EXECUTABLE_PATH)) {
    return process.env.PUPPETEER_EXECUTABLE_PATH;
  }
  if (process.env.CHROME_PATH && fs.existsSync(process.env.CHROME_PATH)) {
    return process.env.CHROME_PATH;
  }

  const platform = process.platform;
  const candidates: string[] = [];

  if (platform === 'win32') {
    const progFiles = process.env.PROGRAMFILES || 'C:\\Program Files';
    const progFilesX86 = process.env['PROGRAMFILES(X86)'] || 'C:\\Program Files (x86)';
    const localAppData = process.env.LOCALAPPDATA || '';

    candidates.push(
      path.join(progFilesX86, 'Microsoft', 'Edge', 'Application', 'msedge.exe'),
      path.join(progFiles, 'Microsoft', 'Edge', 'Application', 'msedge.exe'),
      path.join(progFiles, 'Google', 'Chrome', 'Application', 'chrome.exe'),
      path.join(progFilesX86, 'Google', 'Chrome', 'Application', 'chrome.exe'),
      path.join(progFilesX86, 'Microsoft', 'Edge Beta', 'Application', 'msedge.exe'),
      path.join(localAppData, 'Google', 'Chrome', 'Application', 'chrome.exe'),
      path.join(localAppData, 'Microsoft', 'Edge', 'Application', 'msedge.exe')
    );
  } else if (platform === 'darwin') {
    candidates.push(
      '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
      '/Applications/Microsoft Edge.app/Contents/MacOS/Microsoft Edge',
      '/Applications/Chromium.app/Contents/MacOS/Chromium',
      '/Applications/Brave Browser.app/Contents/MacOS/Brave Browser'
    );
  } else {
    // Linux
    candidates.push(
      '/usr/bin/google-chrome-stable',
      '/usr/bin/google-chrome',
      '/usr/bin/chromium',
      '/usr/bin/chromium-browser',
      '/usr/bin/microsoft-edge-stable',
      '/usr/bin/microsoft-edge',
      '/snap/bin/chromium'
    );
  }

  for (const candidate of candidates) {
    if (candidate && fs.existsSync(candidate)) {
      return candidate;
    }
  }

  throw new Error(
    `No supported browser (Google Chrome, Microsoft Edge, or Chromium) was found on your system.\n` +
    `Please set the PUPPETEER_EXECUTABLE_PATH environment variable or install Google Chrome or Microsoft Edge.`
  );
}

export class SystemBrowserRenderer implements IPdfRenderer {
  public readonly name = 'system-browser';

  public async render(assembledHtml: string, options: RenderOptions): Promise<RenderResult> {
    const startTime = Date.now();
    const browserPath = findSystemBrowser();
    logger.debug(`Using system browser at: ${browserPath}`);

    const browser = await puppeteer.launch({
      executablePath: browserPath,
      headless: true,
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-gpu',
        '--font-render-hinting=medium'
      ]
    });

    try {
      const page = await browser.newPage();
      await page.setContent(assembledHtml, {
        waitUntil: ['load', 'domcontentloaded']
      });

      const pdfConfig = options.config.pdf;
      const isFullBleed =
        assembledHtml.includes('forge-page') ||
        pdfConfig.fullBleed ||
        Boolean(pdfConfig.background) ||
        pdfConfig.layout === 'cards' ||
        pdfConfig.format?.toLowerCase() === 'square';

      const pdfOptions: any = {
        landscape: pdfConfig.orientation === 'landscape',
        printBackground: pdfConfig.printBackground ?? true
      };

      if (pdfConfig.width && pdfConfig.height) {
        pdfOptions.width = pdfConfig.width;
        pdfOptions.height = pdfConfig.height;
      } else if (pdfConfig.format?.toLowerCase() === 'square') {
        pdfOptions.width = '200mm';
        pdfOptions.height = '200mm';
      } else if (pdfConfig.format?.includes('x')) {
        const [w, h] = pdfConfig.format.split('x');
        pdfOptions.width = w.endsWith('px') || w.endsWith('mm') || w.endsWith('in') ? w : `${w}px`;
        pdfOptions.height = h.endsWith('px') || h.endsWith('mm') || h.endsWith('in') ? h : `${h}px`;
      } else {
        pdfOptions.format = (pdfConfig.format || 'A4') as PaperFormat;
      }

      if (isFullBleed) {
        pdfOptions.margin = {
          top: '0px',
          bottom: '0px',
          left: '0px',
          right: '0px'
        };
        pdfOptions.displayHeaderFooter = false;
      } else {
        const headerHtml = buildPuppeteerHeaderTemplate(options.headerTemplate, options.config);
        const footerHtml = buildPuppeteerFooterTemplate(options.footerTemplate, options.config);
        const hasHeaderOrFooter = Boolean(options.headerTemplate || options.footerTemplate || pdfConfig.pageNumbers);

        pdfOptions.displayHeaderFooter = hasHeaderOrFooter;
        pdfOptions.headerTemplate = headerHtml;
        pdfOptions.footerTemplate = footerHtml;
        pdfOptions.margin = {
          top: pdfConfig.margins?.top || '20mm',
          bottom: pdfConfig.margins?.bottom || '20mm',
          left: pdfConfig.margins?.left || '20mm',
          right: pdfConfig.margins?.right || '20mm'
        };
      }

      const pdfUint8 = await page.pdf(pdfOptions);


      const durationMs = Date.now() - startTime;
      return {
        pdfBuffer: pdfUint8,
        durationMs
      };
    } finally {
      await browser.close();
    }
  }
}
