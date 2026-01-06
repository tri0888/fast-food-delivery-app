import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  // Load all env vars (not only VITE_*) for config-time usage
  const env = loadEnv(mode, process.cwd(), '')

  // For GitHub Pages project sites, BASE_URL should be '/<repo>/'
  // For local dev, omit BASE_URL to default to '/'
  let base = env.BASE_URL || '/'
  // Normalize in case the env is provided as '<repo>/' or '/<repo>'
  if (!base.startsWith('/')) base = `/${base}`
  if (!base.endsWith('/')) base = `${base}/`

  return {
    base,
    plugins: [react()],
    server: {
      host: '0.0.0.0',
      port: 5173,
    },
    test: {
      globals: true,
      environment: 'jsdom',
      setupFiles: './src/test/setup.js',
      css: true,
      coverage: {
        provider: 'v8',
        reporter: ['text', 'json', 'html'],
        exclude: [
          'node_modules/',
          'src/test/',
          '**/*.spec.js',
          '**/*.test.js'
        ]
      }
    }
  }
})
