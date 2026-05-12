import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    // Bind to loopback only — Tailscale Funnel binds the public Tailscale IP
    // separately on port 4180, so binding 0.0.0.0:4180 conflicts. strictPort
    // forces a single try on 127.0.0.1 (which IS free, even though the
    // Tailscale IP holds the same port number).
    host: '127.0.0.1',
    port: 4180,
    strictPort: true,
    allowedHosts: true,
    proxy: {
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true,
      },
    },
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@shared': path.resolve(__dirname, '../shared/src'),
    },
  },
});
