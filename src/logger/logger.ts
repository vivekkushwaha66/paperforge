import chalk from 'chalk';
import fs from 'node:fs';
import path from 'node:path';
import { format } from 'date-fns';

export type LogLevel = 'debug' | 'info' | 'warn' | 'error' | 'success';

export interface LogEntry {
  timestamp: string;
  level: LogLevel;
  message: string;
  details?: unknown;
}

export class Logger {
  private static instance: Logger;
  private logs: LogEntry[] = [];
  public isVerbose: boolean = false;

  private constructor() {}

  public static getInstance(): Logger {
    if (!Logger.instance) {
      Logger.instance = new Logger();
    }
    return Logger.instance;
  }

  private formatTimestamp(date: Date = new Date()): string {
    return format(date, 'yyyy-MM-dd HH:mm:ss.SSS');
  }

  private record(level: LogLevel, message: string, details?: unknown) {
    this.logs.push({
      timestamp: this.formatTimestamp(),
      level,
      message,
      details
    });
  }

  public debug(message: string, details?: unknown) {
    this.record('debug', message, details);
    if (this.isVerbose) {
      const ts = chalk.gray(`[${this.formatTimestamp()}]`);
      const badge = chalk.bgGray.black(' DEBUG ');
      console.log(`${ts} ${badge} ${chalk.gray(message)}`);
      if (details !== undefined) {
        console.dir(details, { depth: 5, colors: true });
      }
    }
  }

  public info(message: string) {
    this.record('info', message);
    const ts = chalk.gray(`[${this.formatTimestamp()}]`);
    const badge = chalk.bgBlue.bold(' INFO ');
    console.log(`${ts} ${badge} ${chalk.white(message)}`);
  }

  public step(stepNumber: number, totalSteps: number, title: string) {
    const msg = `[${stepNumber}/${totalSteps}] ${title}`;
    this.record('info', msg);
    const ts = chalk.gray(`[${this.formatTimestamp()}]`);
    const badge = chalk.bgCyan.black(` STAGE ${stepNumber}/${totalSteps} `);
    console.log(`${ts} ${badge} ${chalk.cyanBright.bold(title)}`);
  }

  public success(message: string) {
    this.record('success', message);
    const ts = chalk.gray(`[${this.formatTimestamp()}]`);
    const badge = chalk.bgGreen.black.bold(' SUCCESS ');
    console.log(`${ts} ${badge} ${chalk.greenBright.bold(message)}`);
  }

  public warn(message: string) {
    this.record('warn', message);
    const ts = chalk.gray(`[${this.formatTimestamp()}]`);
    const badge = chalk.bgYellow.black.bold(' WARN ');
    console.warn(`${ts} ${badge} ${chalk.yellowBright(message)}`);
  }

  public error(message: string, error?: unknown) {
    this.record('error', message, error);
    const ts = chalk.gray(`[${this.formatTimestamp()}]`);
    const badge = chalk.bgRed.white.bold(' ERROR ');
    console.error(`${ts} ${badge} ${chalk.redBright.bold(message)}`);
    if (error && this.isVerbose) {
      if (error instanceof Error && error.stack) {
        console.error(chalk.red(error.stack));
      } else {
        console.error(error);
      }
    }
  }

  public banner(title: string, subtitle?: string) {
    console.log();
    console.log(chalk.bold.hex('#DFBA87')(`  ╭──────────────────────────────────────────────────╮`));
    console.log(chalk.bold.hex('#DFBA87')(`  │  `) + chalk.bold.white(title.padEnd(48)) + chalk.bold.hex('#DFBA87')(`│`));
    if (subtitle) {
      console.log(chalk.bold.hex('#DFBA87')(`  │  `) + chalk.gray(subtitle.padEnd(48)) + chalk.bold.hex('#DFBA87')(`│`));
    }
    console.log(chalk.bold.hex('#DFBA87')(`  ╰──────────────────────────────────────────────────╯`));
    console.log();
  }

  public getHistory(): LogEntry[] {
    return [...this.logs];
  }

  public writeErrorLog(projectDir: string, err: unknown, context?: Record<string, unknown>): string {
    const now = new Date();
    const filenameTime = format(now, 'yyyyMMdd-HHmmss');
    
    const logsDir = path.join(projectDir, '.paperforge', 'logs');
    try {
      fs.mkdirSync(logsDir, { recursive: true });
    } catch {
      // Fallback to temp if projectDir is not writable
    }

    const logFilePath = path.join(logsDir, `build-error-${filenameTime}.log`);
    
    const header = [
      '================================================================================',
      `Paperforge Error Diagnostics Log`,
      `Timestamp: ${this.formatTimestamp(now)} (ISO: ${now.toISOString()})`,
      `Node.js: ${process.version} | Platform: ${process.platform} (${process.arch})`,
      `Project Directory: ${projectDir}`,
      '================================================================================',
      ''
    ];

    if (context) {
      header.push('--- CONTEXT & METADATA ---');
      header.push(JSON.stringify(context, null, 2));
      header.push('');
    }

    const errorDetails: string[] = ['--- ERROR DETAILS ---'];
    if (err instanceof Error) {
      errorDetails.push(`Name: ${err.name}`);
      errorDetails.push(`Message: ${err.message}`);
      if (err.stack) {
        errorDetails.push('');
        errorDetails.push('Stack Trace:');
        errorDetails.push(err.stack);
      }
    } else {
      errorDetails.push(`Raw Error: ${String(err)}`);
    }
    errorDetails.push('');

    const executionLog: string[] = ['--- EXECUTION LOG HISTORY ---'];
    for (const entry of this.logs) {
      executionLog.push(`[${entry.timestamp}] [${entry.level.toUpperCase().padEnd(7)}] ${entry.message}`);
      if (entry.details) {
        executionLog.push(`  Details: ${typeof entry.details === 'object' ? JSON.stringify(entry.details) : String(entry.details)}`);
      }
    }

    const fileContent = [...header, ...errorDetails, ...executionLog].join('\n');
    fs.writeFileSync(logFilePath, fileContent, 'utf-8');

    return logFilePath;
  }
}

export const logger = Logger.getInstance();
