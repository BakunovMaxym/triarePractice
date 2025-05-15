import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import viteStaticCopy from 'vite-plugin-static-copy';


export default defineConfig({
  plugins: [
    react(),
    viteStaticCopy({
      targets: [
        {
          src: 'index.html',
          dest: './'
        }
      ]
    }),
  ],
  server: {
    port: 5173,
  },
});
