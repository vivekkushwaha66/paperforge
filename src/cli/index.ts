import { Command } from 'commander';
import { runBuildCommand } from './build.js';
import { runValidateCommand } from './validate.js';
import { runInitCommand } from './init.js';
import { runPreviewCommand } from './preview.js';

const program = new Command();

program
  .name('paperforge')
  .description('Markdown → Publication-grade PDF publishing CLI')
  .version('0.1.0', '-V, --version', 'Output the version number');

program
  .command('build [project-path]')
  .description('Compile target markdown publication into distribution PDF')
  .option('-o, --output <path>', 'Override the destination PDF path')
  .option('-r, --renderer <engine>', 'Select rendering engine (system-browser, puppeteer-core, typst)')
  .option('-v, --verbose', 'Enable verbose logging and diagnostic output')
  .option('-w, --watch', 'Rebuild automatically when files change')
  .action(async (projectPath, options) => {
    try {
      await runBuildCommand(projectPath || '.', options);
    } catch {
      process.exit(1);
    }
  });

program
  .command('validate [project-path]')
  .description('Validate project structure, configuration, and assets without rendering')
  .action((projectPath) => {
    const ok = runValidateCommand(projectPath || '.');
    if (!ok) {
      process.exit(1);
    }
  });

program
  .command('init [target-dir]')
  .description('Bootstrap a new Paperforge publication directory with sensible defaults')
  .option('-y, --yes', 'Bootstrap immediately using default configuration without prompting')
  .option('-t, --title <title>', 'Specify publication title')
  .option('-a, --author <author>', 'Specify publication author')
  .option('--theme <name>', 'Scaffold with pre-configured theme (default, vivek-kushwaha-labs)')
  .option('-f, --force', 'Overwrite existing files in target directory')
  .action((targetDir, options) => {
    runInitCommand(targetDir || '.', options);
  });

program
  .command('preview [project-path]')
  .description('Launch local preview server for document')
  .option('-p, --port <number>', 'Port for preview server', '3000')
  .action((projectPath, options) => {
    runPreviewCommand(projectPath || '.', parseInt(options.port, 10));
  });

program.parse(process.argv);
