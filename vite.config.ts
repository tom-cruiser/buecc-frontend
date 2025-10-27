import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig(({ command, mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  return {
    plugins: [react()],
    optimizeDeps: {
      exclude: ['lucide-react'],
    },
    server: {
      host: true,
      port: process.env.PORT ? parseInt(process.env.PORT) : 3000,
    },
    preview: {
      port: process.env.PORT ? parseInt(process.env.PORT) : 3000,
      host: true
    },
    define: {
      'process.env.VITE_API_URL': JSON.stringify(process.env.VITE_API_URL),
      'process.env.NODE_ENV': JSON.stringify(mode)
    }
  };
});
