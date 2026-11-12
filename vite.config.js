
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

// Configuración de Vite para Tienda NBA
export default defineConfig({
  plugins: [react()],

  server: {
    proxy: {
      // Peticiones a nuestra API de Spring Boot
      '/api': {
        target: 'http://localhost:8080',
        changeOrigin: true,
      },

      // Imágenes subidas desde el panel ADMIN
      '/uploads': {
        target: 'http://localhost:8080',
        changeOrigin: true,
      },
    },
  },
});
