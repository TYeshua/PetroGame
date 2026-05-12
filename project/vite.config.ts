import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from "path";
import cesium from 'vite-plugin-cesium'; // 1. Importe o plugin

export default defineConfig({
  base: '/PetroGame/',
  plugins: [
    react(),
    cesium() // 2. Adicione à lista de plugins
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  optimizeDeps: {
    exclude: ['lucide-react'],
  },
});
