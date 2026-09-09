import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import path from 'node:path';

// Dedicated build: never load .env files or forward VITE_* from the build environment.
export default defineConfig(() => {
  const publishedAt = process.env.BUILD_PUBLISHED_AT || new Date().toISOString();
  const buildId = process.env.BUILD_ID || `web-${publishedAt}`;
  if (!/^[A-Za-z0-9._:+-]{1,160}$/.test(buildId) || Number.isNaN(Date.parse(publishedAt))) {
    throw new Error('Invalid public build metadata');
  }
  return {
    envDir: false,
    envPrefix: [],
    base: '/',
    plugins: [react(), tailwindcss(), {
      name: 'web-version-manifest',
      generateBundle() {
        this.emitFile({ type: 'asset', fileName: 'version.json', source: JSON.stringify({ schemaVersion: 1, buildId, publishedAt }, null, 2) });
      },
    }],
    define: {
      __APP_BUILD_ID__: JSON.stringify(buildId),
      __APP_PUBLISHED_AT__: JSON.stringify(publishedAt),
      __WEB_PRODUCTION__: 'true',
    },
    resolve: { alias: { '@': path.resolve(__dirname, '.') }, dedupe: ['react', 'react-dom'] },
    build: { outDir: 'dist-web/client', emptyOutDir: true, sourcemap: false },
  };
});
