import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 3101,
    proxy: {
      '/api': {
        target: 'https://api.yensao24h.com',
        changeOrigin: true,
        secure: true,
      }
    }
  },
  preview: {
    port: 3101,
    host: true,
    allowedHosts: ['admin.yensao24h.com']
  },
  // Ensure proper base path if needed
  base: '/'
})
