import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { fileURLToPath, URL } from 'node:url'

// https://vite.dev/config/
export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    }
  },
  server: {
    // 开发环境代理配置，解决CORS问题
    // 在开发环境中，VITE_API_BASE应该留空，让请求通过代理转发
    // 在生产环境中，VITE_API_BASE应该设置为实际的后端地址
    proxy: {
      '/getid': {
        target: 'http://localhost:5731',
        changeOrigin: true
      },
      '/getdata': {
        target: 'http://localhost:5731',
        changeOrigin: true
      }
    }
  }
})
