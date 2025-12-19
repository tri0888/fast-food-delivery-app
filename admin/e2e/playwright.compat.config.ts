import { defineConfig, devices } from '@playwright/test'
import path from 'node:path'
import dotenv from 'dotenv'

const envPath = path.resolve(process.cwd(), 'e2e/.env.playwright')
dotenv.config({ path: envPath, override: true })

const previewPort = Number(process.env.PLAYWRIGHT_ADMIN_PORT || 4175)
const localPreviewUrl = `http://127.0.0.1:${previewPort}`
const baseURL = process.env.PLAYWRIGHT_ADMIN_BASE_URL || localPreviewUrl
const shouldStartWebServer = process.env.PLAYWRIGHT_ADMIN_SKIP_WEB_SERVER !== 'true'

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
  webServer: shouldStartWebServer
    ? {
        command: `npm run preview -- --host 0.0.0.0 --port ${previewPort}`,
        reuseExistingServer: !process.env.CI,
        timeout: 60_000,
        url: localPreviewUrl
      }
    : undefined,
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
