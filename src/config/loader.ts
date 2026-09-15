import fs from 'node:fs';
import path from 'node:path';
import YAML from 'yaml';
import { ProjectConfig, ProjectConfigSchema } from './schema.js';
import { DEFAULT_CONFIG } from './defaults.js';
import { logger } from '../logger/logger.js';

export interface LoadedConfig {
  config: ProjectConfig;
  projectDir: string;
  configPath?: string;
}

export function findConfigFile(projectDir: string): string | null {
  const candidates = [
    'paperforge.yaml',
    'paperforge.yml',
    'paperforge.json'
  ];

  for (const candidate of candidates) {
    const fullPath = path.join(projectDir, candidate);
    if (fs.existsSync(fullPath) && fs.statSync(fullPath).isFile()) {
      return fullPath;
    }
  }

  return null;
}

export function loadConfig(projectDir: string): LoadedConfig {
  const absoluteProjectDir = path.resolve(projectDir);
  const configPath = findConfigFile(absoluteProjectDir);

  if (!configPath) {
    logger.debug(`No paperforge.yaml found in ${absoluteProjectDir}. Using default configuration.`);
    return {
      config: DEFAULT_CONFIG,
      projectDir: absoluteProjectDir
    };
  }

  logger.debug(`Loading configuration from ${configPath}`);
  const rawContent = fs.readFileSync(configPath, 'utf-8');
  let parsed: unknown;

  try {
    if (configPath.endsWith('.json')) {
      parsed = JSON.parse(rawContent);
    } else {
      parsed = YAML.parse(rawContent);
    }
  } catch (err) {
    throw new Error(`Failed to parse configuration file "${configPath}": ${(err as Error).message}`);
  }

  const result = ProjectConfigSchema.safeParse(parsed ?? {});
  if (!result.success) {
    const issues = result.error.issues.map(i => `  - ${i.path.join('.')}: ${i.message}`).join('\n');
    throw new Error(`Invalid configuration in "${configPath}":\n${issues}`);
  }

  return {
    config: result.data,
    projectDir: absoluteProjectDir,
    configPath
  };
}
