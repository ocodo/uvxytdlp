import tailwindcss from '@tailwindcss/vite'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  server: {
    allowedHosts: []
  },
  build: {
    outDir: 'apiserver/dist',
    emptyOutDir: true,
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src/'),
    },
  },
  plugins: [react(), tailwindcss()],
})
