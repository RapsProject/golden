import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    target: 'esnext',
    cssCodeSplit: true,
    // Re-enable module preload for critical vendor chunk
    modulePreload: {
      polyfill: true,
    },
    chunkSizeWarningLimit: 300,
    rollupOptions: {
      output: {
        manualChunks: {
          // Core framework — always needed
          vendor: ['react', 'react-dom', 'react-router-dom'],
          // Auth provider — loaded early but separated from vendor
          supabase: ['@supabase/supabase-js'],
          // Heavy libraries — lazy-loaded when their pages are visited
          katex: ['katex'],
          recharts: ['recharts'],
          quill: ['react-quill-new'],
        },
      },
    },
  },
})

