import { defineConfig } from 'vite';
import { resolve } from 'path';
import { copyFileSync, mkdirSync } from 'fs';

export default defineConfig({
  base: '/Arkadium-Pipe-Mania/',
  resolve: {
    alias: {
      '@': resolve(__dirname, './src')
    }
  },
  build: {
    target: 'esnext',
    outDir: 'docs',
    assetsDir: 'assets',
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        test: resolve(__dirname, 'tests/rendering.html')
      }
    }
  },
  server: {
    port: 3000,
    open: true
  },
  plugins: [
    {
      name: 'copy-config-files',
      closeBundle() {
        const configFiles = [
          'config/game.yaml',
          'config/visual-ms-dos.yaml',
          'config/visual-original.yaml'
        ];

        mkdirSync('docs/config', { recursive: true });

        configFiles.forEach(file => {
          try {
            copyFileSync(file, `docs/${file}`);
            console.log(`Copied ${file} to docs/${file}`);
          } catch (error) {
            console.error(`Failed to copy ${file}:`, error);
          }
        });
      }
    }
  ]
});
