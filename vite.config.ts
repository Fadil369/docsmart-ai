import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react-swc";
import { defineConfig } from "vite";
import { resolve } from 'path'

const projectRoot = process.env.PROJECT_ROOT || import.meta.dirname

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
  ],
  resolve: {
    alias: {
      '@': resolve(projectRoot, 'src')
    }
  },
  build: {
    // Bundle size optimization
    rollupOptions: {
      output: {
        manualChunks: {
          'react-vendor': ['react', 'react-dom'],
          'radix-vendor': ['@radix-ui/react-dialog', '@radix-ui/react-avatar', '@radix-ui/react-tabs'],
          'animation-vendor': ['framer-motion'],
          'form-vendor': ['react-hook-form', 'zod'],
          'payment-vendor': ['@stripe/stripe-js', '@paypal/react-paypal-js']
        }
      }
    },
    // Chunk size warning limit
    chunkSizeWarningLimit: 600,
    // Source maps for production debugging
    sourcemap: true,
    // Asset optimization
    assetsDir: 'assets',
    // Minification
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true
      }
    }
  },
  // Development server optimization
  server: {
    port: 5173,
    open: true,
    cors: true
  },
  // Preview server configuration
  preview: {
    port: 4173,
    open: true
  }
});
