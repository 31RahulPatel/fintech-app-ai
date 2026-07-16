import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
  },
  define: {
    // amazon-cognito-identity-js expects Node's `global`, which the browser (and Vite) don't provide.
    global: 'globalThis',
  },
})
