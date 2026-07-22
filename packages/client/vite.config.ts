import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'
import dotenv from 'dotenv'
import { resolve } from 'path'
import { tanstackRouter } from '@tanstack/router-plugin/vite'

dotenv.config({
  path: '../../.env',
})

// https://vite.dev/config/
export default defineConfig({
  base: './',
  plugins: [
    tanstackRouter({
      target: 'react',
      autoCodeSplitting: true,
    }),
    react(),
  ],
  server: {
    watch: {
      usePolling: true,
    },
    port: Number(process.env.CLIENT_PORT),
    fs: {
      allow: ['..'],
    },
  },
  resolve: {
    alias: {
      '@shared': resolve(__dirname, '../shared'),
    },
  },
})
