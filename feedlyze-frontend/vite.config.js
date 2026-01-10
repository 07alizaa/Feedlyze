import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    host: true, // Allow external access (needed for ngrok)
    port: 5173,
    // Allow ngrok domains
    allowedHosts: [
      'localhost',
      '.ngrok-free.app',
      '.ngrok.io'
    ]
  }
})
