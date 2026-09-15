import { describe, it, expect } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import { generateTypographyCss } from '../../src/layout/typography.js';
import { logger } from '../../src/logger/logger.js';

describe('Typography Engine', () => {
  it('generates CSS variables and font-family rules', () => {
    const css = generateTypographyCss({
      fonts: [
        {
          name: 'Inter',
          source: 'google',
          url: 'https://fonts.googleapis.com/css2?family=Inter&display=swap'
        }
      ],
      selectors: {
        body: "'Inter', sans-serif",
        headings: "'Inter', sans-serif",
        code: "'Fira Code', monospace",
        cover: "'Inter', sans-serif"
      },
      fontSize: {
        base: '11pt',
        h1: '26pt',
        h2: '18pt',
        h3: '14pt',
        h4: '12pt'
      },
      lineHeight: 1.6
    }, '.');

    expect(css).toContain('@import url(\'https://fonts.googleapis.com/css2?family=Inter&display=swap\');');
    expect(css).toContain('--font-body: \'Inter\', sans-serif;');
    expect(css).toContain('--font-headings: \'Inter\', sans-serif;');
    expect(css).toContain('--font-code: \'Fira Code\', monospace;');
    expect(css).toContain('font-size: var(--font-size-base);');
  });
});

describe('Logger & Error Diagnostic Log File', () => {
  it('records timestamped log entries and writes an error file with full diagnostics', () => {
    logger.info('Test info message');
    logger.warn('Test warning message');

    const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'paperforge-log-test-'));
    const testError = new Error('Simulated critical build failure');

    const logFilePath = logger.writeErrorLog(tempDir, testError, {
      project: 'test-project',
      stage: 5
    });

    expect(fs.existsSync(logFilePath)).toBe(true);

    const logContent = fs.readFileSync(logFilePath, 'utf-8');
    expect(logContent).toContain('Paperforge Error Diagnostics Log');
    expect(logContent).toContain('Simulated critical build failure');
    expect(logContent).toContain('Test info message');
    expect(logContent).toContain('Test warning message');
    expect(logContent).toContain('Timestamp:');
    expect(logContent).toContain('Stack Trace:');

    // Clean up
    fs.rmSync(tempDir, { recursive: true, force: true });
  });
});
