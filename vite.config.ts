import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react-swc";
import { resolve } from 'path';
import { defineConfig } from "vite";

const projectRoot = process.env.PROJECT_ROOT || import.meta.dirname

// https://vite.dev/config/
export default defineConfig({
  // Base URL configuration for proper asset loading
  base: './',
  
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
    // Target modern browsers for better performance
    target: 'esnext',
    
    // Bundle size optimization
    rollupOptions: {
      output: {
        manualChunks: {
          // React and core dependencies
          'react-vendor': ['react', 'react-dom', 'react-router-dom'],
          
          // UI library chunks
          'radix-vendor': [
            '@radix-ui/react-dialog', 
            '@radix-ui/react-avatar', 
            '@radix-ui/react-tabs',
            '@radix-ui/react-select',
            '@radix-ui/react-accordion',
            '@radix-ui/react-alert-dialog'
          ],
          
          // Animation and motion
          'animation-vendor': ['framer-motion'],
          
          // Form handling
          'form-vendor': ['react-hook-form', 'zod', '@hookform/resolvers'],
          
          // Payment processing
          'payment-vendor': ['@stripe/stripe-js', '@paypal/react-paypal-js'],
          
          // Document processing
          'document-vendor': [
            'pdf-lib', 
            'mammoth', 
            'xlsx', 
            'marked', 
            'papaparse',
            'tesseract.js',
            'jszip'
          ],
          
          // Charts and analytics
          'analytics-vendor': ['recharts', 'd3'],
          
          // AI and API
          'ai-vendor': ['openai', '@azure/ai-text-analytics'],
          
          // Utilities
          'utils-vendor': [
            'lodash',
            'date-fns',
            'uuid',
            'file-saver',
            'axios',
            'franc'
          ]
        },
        
        // Asset naming for better caching
        assetFileNames: (assetInfo) => {
          const info = assetInfo.name!.split('.');
          const ext = info[info.length - 1];
          if (/png|jpe?g|svg|gif|tiff|bmp|ico/i.test(ext)) {
            return `assets/images/[name]-[hash][extname]`;
          }
          if (/woff2?|eot|ttf|otf/i.test(ext)) {
            return `assets/fonts/[name]-[hash][extname]`;
          }
          return `assets/[name]-[hash][extname]`;
        },
        
        // Chunk naming for better debugging
        chunkFileNames: 'assets/js/[name]-[hash].js',
        entryFileNames: 'assets/js/[name]-[hash].js',
      },
    },
    
    // Chunk size warning limit (increased for complex app)
    chunkSizeWarningLimit: 1000,
    
    // Source maps for production debugging
    sourcemap: true,
    
    // Asset optimization
    assetsDir: 'assets',
    
    // Minification with advanced options
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true,
        pure_funcs: ['console.log', 'console.debug'],
        passes: 2,
      },
      mangle: {
        safari10: true,
      },
      format: {
        comments: false,
      },
    },
  },
  
  // Development server optimization
  server: {
    port: 5173,
    open: true,
    cors: true,
    host: true, // Allow external connections
    
    // Hot Module Replacement
    hmr: {
      overlay: true,
    },
    
    // Proxy for API calls during development
    proxy: {
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true,
        secure: false,
      },
    },
  },
  
  // Preview server configuration
  preview: {
    port: 4173,
    open: true,
    host: true,
  },
  
  // Optimization settings
  optimizeDeps: {
    // Pre-bundle dependencies for faster dev startup
    include: [
      'react',
      'react-dom',
      'react-router-dom',
      'framer-motion',
      'openai',
      'pdf-lib',
      'mammoth',
      'xlsx',
      'recharts'
    ],
    
    // Exclude large dependencies that should be dynamically imported
    exclude: [
      'tesseract.js',
      'sharp',
      'pdfjs-dist'
    ],
  },
  
  // Worker configuration
  worker: {
    format: 'es',
  },
  
  // Environment variables
  define: {
    __APP_VERSION__: JSON.stringify(process.env.npm_package_version || '1.0.0'),
    __BUILD_TIME__: JSON.stringify(new Date().toISOString()),
  },
  
  // CSS configuration
  css: {
    devSourcemap: true,
    preprocessorOptions: {
      scss: {
        additionalData: `@import "@/styles/variables.scss";`,
      },
    },
  },
});
