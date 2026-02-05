import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import path from 'path'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  // Set base URL for assets when served from /apps/[projectSlug]/
  // Falls back to '/' for local development
  base: process.env.VITE_BASE_URL || '/',
  server: {
    port: 3000,
  },
})
