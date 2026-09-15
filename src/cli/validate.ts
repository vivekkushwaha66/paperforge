import path from 'node:path';
import chalk from 'chalk';
import { validateProject } from '../validation/project-validator.js';
import { printDiagnostics } from '../validation/diagnostics.js';
import { logger } from '../logger/logger.js';

export function runValidateCommand(rawProjectPath: string = '.'): boolean {
  const projectDir = path.resolve(rawProjectPath);
  logger.banner('Paperforge — Project Integrity Validator', `@vivekkushwaha66/paperforge v0.1.0`);
  logger.info(`Validating project: ${chalk.cyan(projectDir)}`);

  const report = validateProject(projectDir);
  printDiagnostics(report, projectDir);

  if (!report.valid) {
    const errorLogPath = logger.writeErrorLog(projectDir, new Error('Project validation failed'), {
      projectDir,
      errors: report.errors,
      warnings: report.warnings
    });
    console.log(chalk.red(`Diagnostic report written to: ${chalk.yellowBright(errorLogPath)}`));
    process.exitCode = 1;
    return false;
  }

  return true;
}
