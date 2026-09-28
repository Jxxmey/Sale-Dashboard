import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['logo.png'], // 🌟 เปลี่ยนเป็น logo.png
      manifest: {
        name: 'Sales Dashboard',
        short_name: 'SalesDash',
        description: 'ระบบสรุปยอดขายรายวันและรายเดือน',
        theme_color: '#4f46e5',
        background_color: '#f8fafc',
        display: 'standalone',
        icons: [
          {
            src: '/logo.png', // 🌟 ชี้ไปที่โลโก้ของคุณ
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: '/logo.png', // 🌟 ชี้ไปที่โลโก้ของคุณ
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any maskable'
          }
        ]
      }
    })
  ],
})