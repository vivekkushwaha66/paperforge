import { defineConfig } from 'tsdown';
import fs from 'node:fs';
import path from 'node:path';

export default defineConfig({
  entry: ['src/index.ts', 'src/cli/index.ts'],
  format: ['esm'],
  dts: true,
  clean: true,
  shims: true,
  sourcemap: true,
  banner: '#!/usr/bin/env node',
  onSuccess: async () => {
    const srcThemes = path.resolve('src/rendering/themes');
    const destThemes = path.resolve('dist/rendering/themes');
    if (fs.existsSync(srcThemes)) {
      fs.mkdirSync(destThemes, { recursive: true });
      fs.cpSync(srcThemes, destThemes, { recursive: true });
    }

    const mermaidSrc = path.resolve('node_modules/mermaid/dist/mermaid.min.js');
    const mermaidDest = path.resolve('dist/rendering/mermaid.min.js');
    if (fs.existsSync(mermaidSrc)) {
      fs.mkdirSync(path.dirname(mermaidDest), { recursive: true });
      fs.copyFileSync(mermaidSrc, mermaidDest);
    }
  }
});

