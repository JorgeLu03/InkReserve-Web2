import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
const railwayHost = process.env.RAILWAY_PUBLIC_DOMAIN
const allowedHosts = ['localhost', '127.0.0.1']
if (railwayHost) allowedHosts.push(railwayHost)

export default defineConfig({
  plugins: [react()],
  server: {
    host: '0.0.0.0',
    allowedHosts,
    proxy: {
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true,
      },
    },
  },
  preview: {
    host: '0.0.0.0',
    allowedHosts,
  },
})
