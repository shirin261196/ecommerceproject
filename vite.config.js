import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server:{port:5173}
    // Only set base path for production (GitHub Pages)
  base: process.env.NODE_ENV === 'production' ? '/ecommerceproject/' : '/',
})
