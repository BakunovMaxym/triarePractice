import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      // Proxy API requests to the backend
      '/auth': 'http://localhost:3000',
      '/api': 'http://localhost:3000',
      '/courses': 'http://localhost:3000',
      '/user': 'http://localhost:3000',
      // add more if needed
    },
  },
});
