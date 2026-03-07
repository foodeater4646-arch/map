import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/supabase-api': {
        target: 'https://sqktlruozdaflvblssdu.supabase.co',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/supabase-api/, '')
      },
      '/generate-map': {
        target: 'http://localhost:8000',
        changeOrigin: true
      }
    }
  }
})
