import { describe, it, expect, afterAll } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import { runInitCommand } from '../../src/cli/init.js';
import { validateProject } from '../../src/validation/project-validator.js';

describe('E2E: Project Scaffolding & Validation', () => {
  const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'paperforge-e2e-init-'));

  afterAll(() => {
    try {
      fs.rmSync(tempDir, { recursive: true, force: true });
    } catch {}
  });

  it('scaffolds a complete project structure via runInitCommand', () => {
    const projectPath = path.join(tempDir, 'my-test-book');
    runInitCommand(projectPath, { theme: 'vivek-kushwaha-labs' });

    expect(fs.existsSync(path.join(projectPath, 'paperforge.yaml'))).toBe(true);
    expect(fs.existsSync(path.join(projectPath, 'cover.md'))).toBe(true);
    expect(fs.existsSync(path.join(projectPath, 'header.md'))).toBe(true);
    expect(fs.existsSync(path.join(projectPath, 'footer.md'))).toBe(true);
    expect(fs.existsSync(path.join(projectPath, 'content', '01-introduction.md'))).toBe(true);
    expect(fs.existsSync(path.join(projectPath, 'content', '02-getting-started.md'))).toBe(true);
    expect(fs.existsSync(path.join(projectPath, 'theme', 'style.css'))).toBe(true);
  });

  it('quickly bootstraps with default options when using yes: true', () => {
    const projectPath = path.join(tempDir, 'quick-bootstrapped');
    const ok = runInitCommand(projectPath, { yes: true, title: 'Quick Book' });
    expect(ok).toBe(true);
    expect(fs.existsSync(path.join(projectPath, 'paperforge.yaml'))).toBe(true);
    expect(fs.existsSync(path.join(projectPath, 'assets', 'images', 'sample-diagram.svg'))).toBe(true);
    const yaml = fs.readFileSync(path.join(projectPath, 'paperforge.yaml'), 'utf-8');
    expect(yaml).toContain('title: "Quick Book"');
  });

  it('validates a healthy scaffolded project successfully', () => {
    const projectPath = path.join(tempDir, 'my-test-book');
    const report = validateProject(projectPath);

    expect(report.valid).toBe(true);
    expect(report.errors.length).toBe(0);
    expect(report.scannedCount).toBeGreaterThan(0);
  });

  it('detects broken asset references and reports exact line numbers', () => {
    const projectPath = path.join(tempDir, 'damaged-project');
    runInitCommand(projectPath, {});

    // Inject a broken image reference into chapter 1
    const chapterPath = path.join(projectPath, 'content', '01-introduction.md');
    fs.appendFileSync(chapterPath, '\n\n![Broken Diagram](assets/images/does-not-exist.png)\n');

    const report = validateProject(projectPath);
    expect(report.valid).toBe(false);
    expect(report.errors.length).toBeGreaterThan(0);

    const assetError = report.errors.find(e => e.message.includes('Referenced image not found'));
    expect(assetError).toBeDefined();
    expect(assetError?.message).toContain('assets/images/does-not-exist.png');
    expect(assetError?.line).toBeGreaterThan(1);
  });

  it('writes an error log file with timestamps when build fails on invalid project', async () => {
    const { runBuildCommand } = await import('../../src/cli/build.js');
    const projectPath = path.join(tempDir, 'damaged-project');

    let errorThrown: any = null;
    try {
      await runBuildCommand(projectPath, {});
    } catch (err) {
      errorThrown = err;
    }

    expect(errorThrown).not.toBeNull();
    const logsDir = path.join(projectPath, '.paperforge', 'logs');
    expect(fs.existsSync(logsDir)).toBe(true);

    const logFiles = fs.readdirSync(logsDir).filter(f => f.startsWith('build-error-') && f.endsWith('.log'));
    expect(logFiles.length).toBeGreaterThan(0);

    const logContent = fs.readFileSync(path.join(logsDir, logFiles[0]), 'utf-8');
    expect(logContent).toContain('Paperforge Error Diagnostics Log');
    expect(logContent).toContain('Timestamp:');
    expect(logContent).toContain('EXECUTION LOG HISTORY');
  });
});

