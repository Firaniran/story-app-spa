import { defineConfig } from 'vite'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  base: '/story-app-spa/',
  plugins: [
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: [
        'icon-192.png',
        'icon-512.png',
        'screenshot-desktop.png',
        'screenshot-mobile.png'
      ],
      manifest: {
        name: 'Story App SPA',
        short_name: 'StoryApp',
        start_url: '/',
        display: 'standalone',
        background_color: '#ffffff',
        theme_color: '#2196f3',
        icons: [
          {
            src: 'icon-192.png',
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: 'icon-512.png',
            sizes: '512x512',
            type: 'image/png'
          }
        ],
        shortcuts: [
          {
            name: 'Tambah Cerita',
            short_name: 'Tambah',
            url: '/#/add',
            icons: [{ src: 'icon-192.png', sizes: '192x192' }]
          }
        ],
        screenshots: [
          {
            src: 'screenshot-desktop.png',
            type: 'image/png',
            sizes: '800x600'
          },
          {
            src: 'screenshot-mobile.png',
            type: 'image/png',
            sizes: '360x640'
          }
        ]
      },
      srcDir: 'src',
      filename: 'service-worker.js',
      strategies: 'injectManifest',
      workbox: {
        runtimeCaching: [
          {
            urlPattern: ({ request }) => request.destination === 'document',
            handler: 'NetworkFirst'
          },
          {
            urlPattern: ({ request }) => request.destination === 'image',
            handler: 'CacheFirst'
          }
        ]
      }
    })
  ]
})