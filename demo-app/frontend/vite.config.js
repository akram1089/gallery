import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    host: true,
    port: 5173,
    allowedHosts: ["demo-akram.duckdns.org"], // 👈 add this
    watch: {
      usePolling: true
    }
  }
})