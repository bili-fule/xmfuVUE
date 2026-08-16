import * as path from 'node:path'
import { defineConfig } from 'vite'
import tailwindcss from '@tailwindcss/vite'
import vue from '@vitejs/plugin-vue'
import { mdPosts } from './src/plugins/md-posts'
import { prerender } from './src/plugins/prerender'

export default defineConfig({
  plugins: [mdPosts(), vue(), tailwindcss(), prerender()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
})
