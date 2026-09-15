import chalk from 'chalk';
import path from 'node:path';
import { ValidationReport } from './project-validator.js';

export function printDiagnostics(report: ValidationReport, projectDir: string): void {
  const errCount = report.errors.length;
  const warnCount = report.warnings.length;

  if (errCount === 0 && warnCount === 0) {
    console.log(chalk.greenBright.bold(`\n✔ Project validation passed! (${report.scannedCount} document(s) verified)\n`));
    return;
  }

  console.log();
  console.log(chalk.bold.hex('#DFBA87')('Paperforge Diagnostics'));
  console.log(chalk.gray('─'.repeat(50)));

  if (errCount > 0) {
    console.log(chalk.red.bold(`\n✗ Validation failed with ${errCount} error(s) and ${warnCount} warning(s):\n`));
  } else {
    console.log(chalk.yellow.bold(`\n⚠ Validation passed with ${warnCount} warning(s):\n`));
  }

  for (const err of report.errors) {
    const loc = err.file
      ? `${path.relative(projectDir, err.file)}${err.line ? `:${err.line}` : ''}`
      : 'General';
    console.log(`  ${chalk.bgRed.black.bold(' ERROR ')} ${chalk.bold.red(loc)}`);
    console.log(`  ${chalk.white(err.message)}`);
    if (err.suggestion) {
      console.log(`  ${chalk.gray('↳ Suggestion:')} ${chalk.cyan(err.suggestion)}`);
    }
    console.log();
  }

  for (const warn of report.warnings) {
    const loc = warn.file
      ? `${path.relative(projectDir, warn.file)}${warn.line ? `:${warn.line}` : ''}`
      : 'General';
    console.log(`  ${chalk.bgYellow.black.bold(' WARN ')} ${chalk.bold.yellow(loc)}`);
    console.log(`  ${chalk.gray(warn.message)}`);
    if (warn.suggestion) {
      console.log(`  ${chalk.gray('↳ Suggestion:')} ${chalk.cyan(warn.suggestion)}`);
    }
    console.log();
  }
}
