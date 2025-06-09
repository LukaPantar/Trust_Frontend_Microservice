import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';

export default defineConfig({
  plugins: [vue()],
  server: {
    port: 5172,
    proxy: {
      '/stakeholders': {
        target: 'http://trust_evaluator_microservice:8001',
        changeOrigin: true,
        rewrite: path => path,
      },
      '/stakeholder': {
        target: 'http://trust_evaluator_microservice:8001',
        changeOrigin: true,
        rewrite: path => path,
      },
    },
  },
});
