import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'
import dotenv from 'dotenv'
import { resolve } from 'path'
import { tanstackRouter } from '@tanstack/router-plugin/vite'
import { VitePWA } from 'vite-plugin-pwa'
import { getBuildRevision } from './getBuildRevision'

dotenv.config({
  path: '../../.env',
})

const buildRevision = getBuildRevision()

// https://vite.dev/config/
export default defineConfig({
  base: '/',
  define: {
    'import.meta.env.VITE_REVISION_COUNT': JSON.stringify(buildRevision.count),
    'import.meta.env.VITE_COMMIT_HASH': JSON.stringify(buildRevision.hash),
  },
  plugins: [
    tanstackRouter({
      target: 'react',
      autoCodeSplitting: true,
    }),
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.ico', 'apple-touch-icon.png'],
      manifest: {
        name: 'NOEMA System',
        short_name: 'NOEMA',
        lang: 'ko',
        start_url: './',
        scope: './',
        display: 'standalone',
        theme_color: '#0172ad',
        background_color: '#ffffff',
        icons: [
          {
            src: 'pwa-192x192.png',
            sizes: '192x192',
            type: 'image/png',
          },
          {
            src: 'pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png',
          },
          {
            src: 'pwa-maskable-512x512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'maskable',
          },
        ],
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,webmanifest}'],
        navigateFallback: 'index.html',
      },
    }),
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
  preview: {
    port: 4173,
  },
  resolve: {
    alias: {
      '@shared': resolve(__dirname, '../shared'),
    },
  },
})
