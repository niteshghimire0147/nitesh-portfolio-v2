import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],

  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true,
      },
    },
  },

  build: {
    sourcemap: false,          // no .map files — source not recoverable
    minify: 'terser',          // aggressive minification
    terserOptions: {
      compress: {
        drop_console: true,    // strip all console.* calls from bundle
        drop_debugger: true,   // strip debugger statements
        pure_funcs: ['console.log', 'console.warn', 'console.info'],
      },
      mangle: {
        toplevel: true,        // rename top-level variable names
      },
      format: {
        comments: false,       // strip all comments
      },
    },
    rollupOptions: {
      output: {
        // Randomise chunk filenames — no predictable naming
        entryFileNames:   'assets/[hash].js',
        chunkFileNames:   'assets/[hash].js',
        assetFileNames:   'assets/[hash][extname]',
      },
    },
  },
});
