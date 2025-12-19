import { defineConfig, devices } from '@playwright/test'
import path from 'path'
import dotenv from 'dotenv'

const envPath = path.resolve(process.cwd(), 'e2e/.env.playwright')
dotenv.config({ path: envPath, override: true })

const baseURL = process.env.PLAYWRIGHT_BASE_URL || 'http://127.0.0.1:4173'

export default defineConfig({
  testDir: path.resolve(process.cwd(), 'e2e/specs/compat'),
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 2 : undefined,
  reporter: process.env.CI ? 'line' : [['html', { open: 'never' }]],
  timeout: 60_000,
  use: {
    baseURL,
    trace: 'on',
    screenshot: 'on',
    video: 'on'
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
    },
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] }
    },
    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] }
    }
  ],
  outputDir: path.resolve(process.cwd(), 'e2e/test-results')
})
