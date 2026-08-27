import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import fs from 'fs';
import { defineConfig, Plugin } from 'vite';

const buildId = process.env.BUILD_ID || `${new Date().toISOString()}-${Math.random().toString(36).substring(2, 8)}`;
const publishedAt = new Date().toISOString();

function generateVersionJsonPlugin(): Plugin {
  return {
    name: 'generate-version-json',
    buildStart() {
      const versionManifest = {
        schemaVersion: 1,
        buildId,
        publishedAt,
        ...(process.env.K_REVISION ? { cloudRevision: process.env.K_REVISION } : {})
      };
      try {
        fs.mkdirSync(path.resolve(__dirname, 'public'), { recursive: true });
        fs.writeFileSync(
          path.resolve(__dirname, 'public/version.json'),
          JSON.stringify(versionManifest, null, 2)
        );
      } catch (err) {
        console.error('Failed to write public/version.json:', err);
      }
    },
    writeBundle() {
      const versionManifest = {
        schemaVersion: 1,
        buildId,
        publishedAt,
        ...(process.env.K_REVISION ? { cloudRevision: process.env.K_REVISION } : {})
      };
      try {
        fs.mkdirSync(path.resolve(__dirname, 'dist'), { recursive: true });
        fs.writeFileSync(
          path.resolve(__dirname, 'dist/version.json'),
          JSON.stringify(versionManifest, null, 2)
        );
      } catch (err) {
        console.error('Failed to write dist/version.json:', err);
      }
    }
  };
}

export default defineConfig(() => {
  return {
    plugins: [react(), tailwindcss(), generateVersionJsonPlugin()],
    define: {
      __APP_BUILD_ID__: JSON.stringify(buildId),
      __APP_PUBLISHED_AT__: JSON.stringify(publishedAt),
    },
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
      dedupe: ['react', 'react-dom'],
    },
    server: {
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      // Do not modifyâfile watching is disabled to prevent flickering during agent edits.
      hmr: process.env.DISABLE_HMR !== 'true',
      // Disable file watching when DISABLE_HMR is true to save CPU during agent edits.
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
  };
});
