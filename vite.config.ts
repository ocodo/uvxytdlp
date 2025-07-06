import tailwindcss from '@tailwindcss/vite'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'
import mdx from '@mdx-js/rollup'

// https://vite.dev/config/
export default defineConfig({
  server: {
    // just localhost, or ip addresses,
    // see vite docs to config allowed host names
    allowedHosts: []
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src/'),
    },
  },
  plugins: [react(), tailwindcss(), mdx()],
})
