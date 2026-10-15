import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import puppeteer, { PaperFormat } from 'puppeteer-core';
import { IPdfRenderer, RenderOptions, RenderResult } from './engine-interface.js';
import { buildPuppeteerHeaderTemplate, buildPuppeteerFooterTemplate } from '../layout/header-footer.js';
import { logger } from '../logger/logger.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);


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

export function findMermaidScript(): string | null {
  const candidatePaths = [
    path.resolve(__dirname, 'mermaid.min.js'),
    path.resolve(__dirname, 'rendering/mermaid.min.js'),
    path.resolve(__dirname, '../rendering/mermaid.min.js'),
    path.resolve(__dirname, '../../node_modules/mermaid/dist/mermaid.min.js'),
    path.resolve(__dirname, '../../../node_modules/mermaid/dist/mermaid.min.js'),
    path.resolve(process.cwd(), 'node_modules/mermaid/dist/mermaid.min.js')
  ];
  for (const p of candidatePaths) {
    if (fs.existsSync(p)) return p;
  }
  return null;
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
      const pdfConfig = options.config.pdf;

      // Set viewport matching target aspect ratio / dimensions
      let vpWidth = 1080;
      let vpHeight = 1080;
      if (pdfConfig.width && pdfConfig.height) {
        vpWidth = parseInt(pdfConfig.width, 10) || 1080;
        vpHeight = parseInt(pdfConfig.height, 10) || 1080;
      } else if (pdfConfig.format?.includes('x')) {
        const [w, h] = pdfConfig.format.split('x');
        vpWidth = parseInt(w, 10) || 1080;
        vpHeight = parseInt(h, 10) || 1080;
      } else if (pdfConfig.format?.toLowerCase() === 'square') {
        vpWidth = 1080;
        vpHeight = 1080;
      } else if (pdfConfig.orientation === 'landscape') {
        vpWidth = 1440;
        vpHeight = 900;
      } else {
        vpWidth = 1200;
        vpHeight = 1600;
      }

      await page.setViewport({
        width: vpWidth,
        height: vpHeight,
        deviceScaleFactor: 2
      });

      await page.setContent(assembledHtml, {
        waitUntil: ['load', 'domcontentloaded']
      });


      // Render Mermaid diagrams if present
      const hasMermaid =
        assembledHtml.includes('language-mermaid') ||
        assembledHtml.includes('class="mermaid"') ||
        assembledHtml.includes("class='mermaid'");

      if (hasMermaid) {
        const mermaidScript = findMermaidScript();
        if (mermaidScript) {
          logger.debug(`Injecting Mermaid engine from: ${mermaidScript}`);
          await page.addScriptTag({ path: mermaidScript });

          const isDarkTheme =
            assembledHtml.includes('forge-page') ||
            Boolean(pdfConfig.background && pdfConfig.background !== '#FFFFFF') ||
            pdfConfig.layout === 'cards';

          await page.evaluate(async (dark) => {
            const codeNodes = document.querySelectorAll(
              'pre code.language-mermaid, pre.language-mermaid code, code.language-mermaid, div.language-mermaid'
            );
            codeNodes.forEach((node, idx) => {
              const pre = node.closest('pre') || node;
              const div = document.createElement('div');
              div.className = 'mermaid';
              div.id = `mermaid-chart-${idx}`;
              div.textContent = node.textContent || '';
              pre.parentNode?.replaceChild(div, pre);
            });

            if ((window as any).mermaid) {
              (window as any).mermaid.initialize({
                startOnLoad: false,
                securityLevel: 'loose',
                theme: dark ? 'dark' : 'default',
                themeVariables: dark
                  ? {
                      darkMode: true,
                      background: 'transparent',
                      mainBkg: '#1A1C24',
                      nodeBorder: '#383C4A',
                      primaryColor: '#DFBA87',
                      primaryTextColor: '#0E1015',
                      primaryBorderColor: '#DFBA87',
                      lineColor: '#94A3B8',
                      secondaryColor: '#181A20',
                      tertiaryColor: '#121316',
                      textColor: '#F1F5F9',
                      fontSize: '13px',
                      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
                    }
                  : {
                      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
                    }
              });

              await (window as any).mermaid.run();

              // Remove any mermaid tooltip / temporary elements added to body
              document
                .querySelectorAll('.mermaidTooltip, [class*="mermaidTooltip"], [id^="d3-tip"]')
                .forEach(el => el.remove());
            }
          }, isDarkTheme);


        } else {
          logger.warn('Mermaid blocks detected, but mermaid.min.js was not found.');
        }
      }

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
