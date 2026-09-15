import http from 'node:http';
import path from 'node:path';
import chalk from 'chalk';
import { loadConfig } from '../config/loader.js';
import { scanProject } from '../document/scanner.js';
import { assembleHtml } from '../rendering/html-assembler.js';
import { logger } from '../logger/logger.js';

export function runPreviewCommand(rawProjectPath: string = '.', port: number = 3000): void {
  const projectDir = path.resolve(rawProjectPath);
  logger.banner('Paperforge — Local Preview Server', `@vivekkushwaha66/paperforge v0.1.0`);
  logger.info(`Starting preview server for: ${chalk.cyan(projectDir)}`);

  const server = http.createServer((req, res) => {
    try {
      const { config } = loadConfig(projectDir);
      const scanned = scanProject(projectDir, config);
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

      const { html } = assembleHtml(publication);
      res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
      res.end(html);
    } catch (err) {
      res.writeHead(500, { 'Content-Type': 'text/plain; charset=utf-8' });
      res.end(`Paperforge Preview Error:\n${(err as Error).stack}`);
    }
  });

  server.listen(port, () => {
    console.log();
    logger.success(`Preview server active at: ${chalk.cyanBright.bold(`http://localhost:${port}`)}`);
    console.log(chalk.gray('Press Ctrl+C to stop the preview server.'));
    console.log();
  });
}
