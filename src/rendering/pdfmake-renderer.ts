import pdfmake from 'pdfmake';
import MarkdownIt from 'markdown-it';
import { IPdfRenderer, RenderOptions, RenderResult } from './engine-interface.js';
import { logger } from '../logger/logger.js';
import { DocumentFile, Publication } from '../document/model.js';
import { createMarkdownParser } from '../markdown/parser.js';
import { findSystemBrowser, findMermaidScript } from './system-browser.js';
import puppeteer from 'puppeteer-core';

export function parseLengthToPt(val: string | number | undefined, defaultVal = 0): number {
  if (val === undefined || val === null) return defaultVal;
  if (typeof val === 'number') return val;
  const str = String(val).trim();
  const match = str.match(/^([0-9.]+)\s*(px|mm|cm|in|pt)?$/i);
  if (!match) return defaultVal;
  const num = parseFloat(match[1]);
  const unit = (match[2] || 'pt').toLowerCase();
  switch (unit) {
    case 'mm':
      return (num * 72) / 25.4;
    case 'cm':
      return (num * 72) / 2.54;
    case 'in':
      return num * 72;
    case 'px':
      return num * 0.75;
    case 'pt':
    default:
      return num;
  }
}

export function isDarkColor(colorStr?: string): boolean {
  if (!colorStr || colorStr === 'transparent' || colorStr === 'white') return false;
  const hex = colorStr.replace('#', '').trim();
  if (hex.length === 3) {
    const r = parseInt(hex[0] + hex[0], 16);
    const g = parseInt(hex[1] + hex[1], 16);
    const b = parseInt(hex[2] + hex[2], 16);
    const brightness = (r * 299 + g * 587 + b * 114) / 1000;
    return brightness < 128;
  }
  if (hex.length >= 6) {
    const r = parseInt(hex.substring(0, 2), 16);
    const g = parseInt(hex.substring(2, 4), 16);
    const b = parseInt(hex.substring(4, 6), 16);
    const brightness = (r * 299 + g * 587 + b * 114) / 1000;
    return brightness < 128;
  }
  return false;
}

/**
 * Renders a Mermaid diagram string into an SVG using the local system browser (if available).
 */
export async function convertMermaidToSvg(mermaidCode: string): Promise<string | null> {
  const browserPath = findSystemBrowser();
  const mermaidScript = findMermaidScript();
  if (!browserPath || !mermaidScript) return null;

  let browser;
  try {
    browser = await puppeteer.launch({
      executablePath: browserPath,
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-gpu']
    });
    const page = await browser.newPage();
    await page.setContent('<!DOCTYPE html><html><body><div id="container"></div></body></html>');
    await page.addScriptTag({ path: mermaidScript });
    const svg: string = await page.evaluate(async (code: string) => {
      const m = (window as any).mermaid;
      if (!m) return '';
      m.initialize({ startOnLoad: false, theme: 'dark' });
      const renderRes = await m.render('diagram-svg', code);
      return renderRes.svg;
    }, mermaidCode);
    return svg || null;
  } catch (err) {
    logger.debug(`Could not render Mermaid to SVG via headless browser: ${(err as Error).message}`);
    return null;
  } finally {
    if (browser) {
      await browser.close().catch(() => {});
    }
  }
}

export class PdfMakeRenderer implements IPdfRenderer {
  readonly name: string = 'pdfmake';

  constructor() {
    pdfmake.setUrlAccessPolicy(() => true);
    pdfmake.setLocalAccessPolicy(() => true);
    pdfmake.setFonts({
      Helvetica: {
        normal: 'Helvetica',
        bold: 'Helvetica-Bold',
        italics: 'Helvetica-Oblique',
        bolditalics: 'Helvetica-BoldOblique'
      },
      Courier: {
        normal: 'Courier',
        bold: 'Courier-Bold',
        italics: 'Courier-Oblique',
        bolditalics: 'Courier-BoldOblique'
      },
      Times: {
        normal: 'Times-Roman',
        bold: 'Times-Bold',
        italics: 'Times-Italic',
        bolditalics: 'Times-BoldItalic'
      }
    });
  }

  async render(assembledHtml: string, options: RenderOptions): Promise<RenderResult> {
    const startTime = Date.now();
    logger.step(11, 14, 'Rendering PDF via PDFMake & Vector SVG Engine');

    const config = options.config;
    const publication = options.publication;

    // 1. Calculate Page Dimensions
    let pageSize: any = config.pdf.format || 'A4';
    if (config.pdf.width && config.pdf.height) {
      pageSize = {
        width: parseLengthToPt(config.pdf.width, 595.28),
        height: parseLengthToPt(config.pdf.height, 841.89)
      };
    }

    const globalPageMargins = config.pdf.margins || { top: '20mm', bottom: '20mm', left: '20mm', right: '20mm' };
    const defaultLeftMargin = parseLengthToPt(globalPageMargins.left, 56.7);
    const defaultTopMargin = parseLengthToPt(globalPageMargins.top, 56.7);
    const defaultRightMargin = parseLengthToPt(globalPageMargins.right, 56.7);
    const defaultBottomMargin = parseLengthToPt(globalPageMargins.bottom, 56.7);

    // 2. Prepare Documents to Render
    const docsToRender: DocumentFile[] = [];
    if (publication?.cover) {
      docsToRender.push(publication.cover);
    }
    if (publication?.documents && publication.documents.length > 0) {
      docsToRender.push(...publication.documents);
    }

    const pageCount = docsToRender.length || 1;
    const pageBackgrounds: (string | undefined)[] = [];
    const contentBlocks: any[] = [];
    const md = createMarkdownParser();

    for (let docIdx = 0; docIdx < docsToRender.length; docIdx++) {
      const doc = docsToRender[docIdx];
      const pageNum = docIdx + 1;
      const pagePad = String(pageNum).padStart(2, '0');
      const totalPad = String(pageCount).padStart(2, '0');

      const bg = doc.background || config.pdf.background || undefined;
      pageBackgrounds.push(bg);
      const isDark = isDarkColor(bg);

      const textColor = isDark ? '#E2E8F0' : '#1E293B';
      const headingColor = doc.accentColor || (isDark ? '#DFBA87' : '#0F172A');
      const mutedColor = isDark ? '#94A3B8' : '#64748B';

      // Header / Accent Bar (for carousel / presentation / cards)
      if (doc.header !== false && (config.pdf.fullBleed || config.pdf.layout === 'cards' || config.pdf.layout === 'presentation' || config.pdf.layout === 'slides')) {
        contentBlocks.push({
          columns: [
            {
              canvas: [
                {
                  type: 'rect',
                  x: 0,
                  y: 4,
                  w: 48,
                  h: 4,
                  color: doc.accentColor || '#DFBA87'
                }
              ],
              width: 60
            },
            {
              text: `${pagePad} / ${totalPad}`,
              alignment: 'right',
              fontSize: 10,
              color: mutedColor,
              bold: true
            }
          ],
          margin: [0, 0, 0, 16]
        });
      }

      // Convert Markdown to PDFMake content elements
      const tokens = md.parse(doc.rawMarkdown, {});
      const docElements = await this.tokensToPdfMakeElements(tokens, {
        textColor,
        headingColor,
        mutedColor,
        isDark,
        accentColor: doc.accentColor || '#DFBA87'
      });

      contentBlocks.push(...docElements);

      // Page break between documents (except the last one)
      if (docIdx < docsToRender.length - 1) {
        contentBlocks.push({
          text: '',
          pageBreak: 'after'
        });
      }
    }

    // 3. Document Definition
    const docDefinition: any = {
      pageSize,
      pageOrientation: config.pdf.orientation || 'portrait',
      pageMargins: [defaultLeftMargin, defaultTopMargin, defaultRightMargin, defaultBottomMargin],
      defaultStyle: {
        font: 'Helvetica',
        fontSize: 11,
        color: '#1E293B',
        lineHeight: 1.4
      },
      info: {
        title: config.title || 'Untitled Publication',
        author: config.author || 'Paperforge',
        subject: config.subject || undefined,
        keywords: config.keywords?.join(', ') || undefined,
        creator: config.creator || '@vivekkushwaha66/paperforge'
      },
      background: (currentPage: number, currentSize: { width: number; height: number }) => {
        const pageBg = pageBackgrounds[currentPage - 1] || config.pdf.background;
        if (!pageBg || pageBg === 'transparent' || pageBg === 'white') {
          return null;
        }
        return {
          canvas: [
            {
              type: 'rect',
              x: 0,
              y: 0,
              w: currentSize.width,
              h: currentSize.height,
              color: pageBg
            }
          ]
        };
      },
      content: contentBlocks
    };

    const pdfDoc = pdfmake.createPdf(docDefinition);
    const pdfBuffer = await pdfDoc.getBuffer();
    const durationMs = Date.now() - startTime;

    return {
      pdfBuffer: new Uint8Array(pdfBuffer),
      pageCount,
      durationMs
    };
  }

  private async tokensToPdfMakeElements(
    tokens: any[],
    theme: {
      textColor: string;
      headingColor: string;
      mutedColor: string;
      isDark: boolean;
      accentColor: string;
    }
  ): Promise<any[]> {
    const elements: any[] = [];
    let i = 0;

    while (i < tokens.length) {
      const token = tokens[i];

      // Headings (h1 to h6)
      if (token.type === 'heading_open') {
        const level = parseInt(token.tag.replace('h', ''), 10) || 1;
        const inlineToken = tokens[i + 1];
        const headingText = inlineToken ? this.renderInlineSpans(inlineToken, theme.headingColor) : '';
        const fontSizes: Record<number, number> = { 1: 24, 2: 18, 3: 14, 4: 12, 5: 11, 6: 10 };
        const margins: Record<number, [number, number, number, number]> = {
          1: [0, 8, 0, 12],
          2: [0, 8, 0, 10],
          3: [0, 6, 0, 8],
          4: [0, 4, 0, 6],
          5: [0, 4, 0, 4],
          6: [0, 4, 0, 4]
        };

        elements.push({
          text: headingText,
          fontSize: fontSizes[level] || 14,
          bold: true,
          color: theme.headingColor,
          margin: margins[level] || [0, 6, 0, 6]
        });
        i += 3; // heading_open, inline, heading_close
        continue;
      }

      // Paragraphs
      if (token.type === 'paragraph_open') {
        const inlineToken = tokens[i + 1];
        if (inlineToken) {
          // Check if paragraph contains an SVG image or inline SVG
          const svgMatch = inlineToken.content.match(/<svg[\s\S]*?<\/svg>/i);
          const dataUriSvgMatch = inlineToken.content.match(/data:image\/svg\+xml;base64,([A-Za-z0-9+/=]+)/);
          const dataUriRasterMatch = inlineToken.content.match(/data:image\/(png|jpeg|jpg);base64,([A-Za-z0-9+/=]+)/);

          if (svgMatch) {
            elements.push({
              svg: svgMatch[0],
              alignment: 'center',
              margin: [0, 8, 0, 8]
            });
          } else if (dataUriSvgMatch) {
            try {
              const svgContent = Buffer.from(dataUriSvgMatch[1], 'base64').toString('utf8');
              elements.push({
                svg: svgContent,
                alignment: 'center',
                margin: [0, 8, 0, 8]
              });
            } catch {
              // fallback to text
            }
          } else if (dataUriRasterMatch) {
            elements.push({
              image: `data:image/${dataUriRasterMatch[1]};base64,${dataUriRasterMatch[2]}`,
              alignment: 'center',
              margin: [0, 8, 0, 8]
            });
          } else {
            const spans = this.renderInlineSpans(inlineToken, theme.textColor);
            elements.push({
              text: spans,
              color: theme.textColor,
              fontSize: 11,
              margin: [0, 0, 0, 8]
            });
          }
        }
        i += 3; // paragraph_open, inline, paragraph_close
        continue;
      }

      // Code block or Fenced diagram (SVG / Mermaid / Code)
      if (token.type === 'fence' || token.type === 'code_block') {
        const info = (token.info || '').trim().toLowerCase();
        const codeContent = token.content.trim();

        if (info === 'svg') {
          // Direct SVG block
          elements.push({
            svg: codeContent,
            alignment: 'center',
            margin: [0, 10, 0, 10]
          });
        } else if (info === 'mermaid') {
          // Mermaid block -> render to SVG if browser available
          const svg = await convertMermaidToSvg(codeContent);
          if (svg) {
            elements.push({
              svg,
              alignment: 'center',
              margin: [0, 10, 0, 10]
            });
          } else {
            // Render styled diagram card box
            elements.push({
              table: {
                widths: ['*'],
                body: [
                  [
                    {
                      text: `[Mermaid Diagram: ${codeContent.split('\n')[0]}]\n${codeContent}`,
                      font: 'Courier',
                      fontSize: 9,
                      color: theme.mutedColor,
                      fillColor: theme.isDark ? '#1E293B' : '#F1F5F9',
                      margin: [10, 10, 10, 10]
                    }
                  ]
                ]
              },
              layout: 'noBorders',
              margin: [0, 8, 0, 8]
            });
          }
        } else {
          // Standard Syntax Code Box
          elements.push({
            table: {
              widths: ['*'],
              body: [
                [
                  {
                    text: codeContent,
                    font: 'Courier',
                    fontSize: 9.5,
                    color: theme.isDark ? '#38BDF8' : '#0369A1',
                    fillColor: theme.isDark ? '#0F172A' : '#F8FAFC',
                    margin: [8, 8, 8, 8]
                  }
                ]
              ]
            },
            layout: 'noBorders',
            margin: [0, 4, 0, 8]
          });
        }
        i++;
        continue;
      }

      // Direct HTML block containing SVG
      if (token.type === 'html_block') {
        const svgMatch = token.content.match(/<svg[\s\S]*?<\/svg>/i);
        if (svgMatch) {
          elements.push({
            svg: svgMatch[0],
            alignment: 'center',
            margin: [0, 10, 0, 10]
          });
        }
        i++;
        continue;
      }

      // Unordered or Ordered List
      if (token.type === 'bullet_list_open' || token.type === 'ordered_list_open') {
        const isOrdered = token.type === 'ordered_list_open';
        const listItems: any[] = [];
        const closeType = isOrdered ? 'ordered_list_close' : 'bullet_list_close';
        i++;

        while (i < tokens.length && tokens[i].type !== closeType) {
          if (tokens[i].type === 'list_item_open') {
            i++;
            const itemTexts: any[] = [];
            while (i < tokens.length && tokens[i].type !== 'list_item_close') {
              if (tokens[i].type === 'paragraph_open') {
                const inlineTok = tokens[i + 1];
                if (inlineTok) {
                  itemTexts.push(this.renderInlineSpans(inlineTok, theme.textColor));
                }
                i += 3;
              } else {
                i++;
              }
            }
            listItems.push({ text: itemTexts, color: theme.textColor, fontSize: 10.5 });
          } else {
            i++;
          }
        }

        if (isOrdered) {
          elements.push({ ol: listItems, margin: [0, 4, 0, 8] });
        } else {
          elements.push({ ul: listItems, margin: [0, 4, 0, 8] });
        }
        i++; // closeType
        continue;
      }

      // Blockquote
      if (token.type === 'blockquote_open') {
        i++;
        const quoteTexts: any[] = [];
        while (i < tokens.length && tokens[i].type !== 'blockquote_close') {
          if (tokens[i].type === 'paragraph_open') {
            const inlineTok = tokens[i + 1];
            if (inlineTok) {
              quoteTexts.push(this.renderInlineSpans(inlineTok, theme.textColor));
            }
            i += 3;
          } else {
            i++;
          }
        }
        elements.push({
          table: {
            widths: [4, '*'],
            body: [
              [
                { text: '', fillColor: theme.accentColor },
                {
                  text: quoteTexts,
                  italics: true,
                  color: theme.mutedColor,
                  fillColor: theme.isDark ? '#1E293B' : '#F8FAFC',
                  margin: [8, 6, 8, 6]
                }
              ]
            ]
          },
          layout: 'noBorders',
          margin: [0, 4, 0, 8]
        });
        i++;
        continue;
      }

      // Horizontal Rule
      if (token.type === 'hr') {
        elements.push({
          canvas: [
            {
              type: 'line',
              x1: 0,
              y1: 4,
              x2: 500,
              y2: 4,
              lineWidth: 1,
              lineColor: theme.isDark ? '#334155' : '#E2E8F0'
            }
          ],
          margin: [0, 8, 0, 8]
        });
        i++;
        continue;
      }

      i++;
    }

    return elements;
  }

  private renderInlineSpans(inlineToken: any, defaultColor: string): any[] {
    const spans: any[] = [];
    if (!inlineToken.children) {
      return [{ text: inlineToken.content || '', color: defaultColor }];
    }

    let isBold = false;
    let isItalic = false;

    for (const child of inlineToken.children) {
      if (child.type === 'strong_open') {
        isBold = true;
      } else if (child.type === 'strong_close') {
        isBold = false;
      } else if (child.type === 'em_open') {
        isItalic = true;
      } else if (child.type === 'em_close') {
        isItalic = false;
      } else if (child.type === 'code_inline') {
        spans.push({
          text: child.content,
          font: 'Courier',
          fontSize: 9.5,
          color: '#38BDF8',
          background: '#1E293B'
        });
      } else if (child.type === 'text') {
        spans.push({
          text: child.content,
          bold: isBold,
          italics: isItalic,
          color: defaultColor
        });
      } else if (child.type === 'link_open') {
        // child.attrs has href
      } else if (child.type === 'link_close') {
        // close link
      }
    }

    return spans.length > 0 ? spans : [{ text: inlineToken.content || '', color: defaultColor }];
  }
}
