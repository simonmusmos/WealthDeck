import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
// Note: to test /api routes locally, run `vercel dev` instead of `vite dev`.
// `vite dev` proxies /api → vercel dev (port 3000) so both work together.
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': {
        target:       'http://localhost:3000',
        changeOrigin: true,
      },
    },
  },
})
