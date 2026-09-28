import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate', // อัปเดตแอปอัตโนมัติเมื่อมีเวอร์ชันใหม่
      includeAssets: ['favicon.ico', 'apple-touch-icon.png', 'mask-icon.svg'],
      manifest: {
        name: 'Sales Dashboard',
        short_name: 'SalesDash',
        description: 'ระบบสรุปยอดขายรายวันและรายเดือน',
        theme_color: '#4f46e5', // สีแถบด้านบน (Indigo 600)
        background_color: '#f8fafc',
        display: 'standalone', // ทำให้แสดงผลเต็มจอเหมือนแอปปกติ
        icons: [
          {
            src: '/pwa-192x192.png',
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: '/pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any maskable'
          }
        ]
      }
    })
  ],
})