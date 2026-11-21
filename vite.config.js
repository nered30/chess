import { defineConfig } from 'vite';

export default defineConfig({
  // 앱(WebView) 안에서 파일 경로가 맞도록 상대 경로로 빌드합니다
  base: './',
  build: { outDir: 'dist', target: 'es2022', chunkSizeWarningLimit: 1500 },
});
