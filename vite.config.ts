import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// base: './' keeps the production build portable (open from any folder or static host)
export default defineConfig({
  base: './',
  plugins: [react(), tailwindcss()],
  server: { port: 5173, strictPort: true },
  // One page loaded once before presenting; a single ~160 kB gzipped bundle is fine.
  // assetsDir is not "assets": public/Assets (certificate originals) would land in the same
  // folder on case-insensitive Windows and break the case-sensitive preview server.
  build: { chunkSizeWarningLimit: 700, assetsDir: 'static' },
})
