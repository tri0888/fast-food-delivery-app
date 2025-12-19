import { defineConfig, devices } from '@playwright/test'
import path from 'path'
import dotenv from 'dotenv'

const envPath = path.resolve(process.cwd(), 'e2e/.env.playwright')
dotenv.config({ path: envPath, override: true })

const baseURL = process.env.PLAYWRIGHT_BASE_URL || 'http://127.0.0.1:4173'

export default defineConfig({
  testDir: path.resolve(process.cwd(), 'e2e/specs/performance'),
  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  retries: 0,
  workers: 1,
  reporter: process.env.CI ? 'line' : [['html', { open: 'never' }]],
  timeout: 60_000,
  use: {
    baseURL,
    trace: 'off',
    screenshot: 'only-on-failure',
    video: 'off'
  },
  webServer: {
    command: 'npm run preview -- --host 0.0.0.0 --port 4173',
    reuseExistingServer: !process.env.CI,
    timeout: 60_000,
    url: 'http://127.0.0.1:4173'
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] }
    }
  ],
  outputDir: path.resolve(process.cwd(), 'e2e/test-results')
})
