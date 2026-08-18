import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import {defineConfig} from 'vite';

export default defineConfig(() => {
  return {
    plugins: [react(), tailwindcss()],
    resolve: {
      alias: [
        { find: /^react-quill$/, replacement: path.resolve(__dirname, './SafeQuill.tsx') },
        { find: '@', replacement: path.resolve(__dirname, '.') },
      ],
    },
    build: {
      target: 'esnext',
      minify: 'esbuild',
      cssMinify: true,
      rollupOptions: {
        output: {
          manualChunks: (id) => {
            if (id.includes('node_modules')) {
              if (id.includes('/react/') || id.includes('/react-dom/') || id.includes('/react-router') || id.includes('/react-is/') || id.includes('/react-helmet-async/')) return 'vendor-react';
              if (id.includes('/@supabase/')) return 'vendor-supabase';
              if (id.includes('/framer-motion/') || id.includes('/motion/')) return 'vendor-motion';
              if (id.includes('/lucide-react/')) return 'vendor-icons';
              if (id.includes('/swiper/')) return 'vendor-swiper';
              if (id.includes('/@hello-pangea/dnd/')) return 'vendor-dnd';
            }
          }
        }
      },
    },
    server: {
      hmr: process.env.DISABLE_HMR !== 'true',
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
  };
});
