import { test, expect } from '@playwright/test'
import { Buffer } from 'node:buffer'

const sampleFoods = [
  {
    _id: 'food-perf-1',
    name: 'Perf Taco',
    description: 'Fast enough for automation',
    price: 8,
    category: 'Taco',
    image: 'perf-taco.png',
    stock: 10
  }
]

const pixelPng = Buffer.from(
  'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR4nGMAAQAABQABDQottAAAAABJRU5ErkJggg==',
  'base64'
)

type NavTimings = {
  domContentLoadedEventEnd: number
  loadEventEnd: number
  responseEnd: number
  transferSize?: number
}

function getBudgetMs(): number {
  const raw = process.env.PLAYWRIGHT_SPEED_BUDGET_MS
  const parsed = raw ? Number(raw) : NaN
  return Number.isFinite(parsed) ? parsed : 15_000
}

test.describe('Speed · Navigation timings', () => {
  test.beforeEach(async ({ page }) => {
    await page.addInitScript(() => {
      // Make the app load cart data (more realistic) but keep it deterministic via stubs.
      window.localStorage.setItem('token', 'playwright-speed')
    })

    await page.route('**/api/food/list', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ success: true, data: sampleFoods })
      })
    })

    await page.route('**/api/cart/get', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ success: true, cartData: {}, isCartLocked: false })
      })
    })

    await page.route('**/images/**', async (route) => {
      await route.fulfill({ status: 200, contentType: 'image/png', body: pixelPng })
    })
  })

  test('SPEED-FE-001 · homepage loads within budget (configurable)', async ({ page }, testInfo) => {
    const budgetMs = getBudgetMs()

    await page.goto('/', { waitUntil: 'load' })

    const nav = await page.evaluate(() => {
      const entry = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming | undefined
      if (!entry) return null
      return {
        domContentLoadedEventEnd: entry.domContentLoadedEventEnd,
        loadEventEnd: entry.loadEventEnd,
        responseEnd: entry.responseEnd,
        transferSize: entry.transferSize
      }
    })

    expect(nav, 'Navigation timing entry should be present').not.toBeNull()

    const timings = nav as NavTimings
    expect(timings.domContentLoadedEventEnd).toBeGreaterThan(0)
    expect(timings.loadEventEnd).toBeGreaterThan(0)

    // Keep the default budget generous to avoid flaky CI.
    expect(timings.loadEventEnd).toBeLessThan(budgetMs)

    await testInfo.attach('speed-metrics', {
      contentType: 'application/json',
      body: Buffer.from(JSON.stringify({ budgetMs, timings }, null, 2))
    })
  })

  test('SPEED-FE-002 · cart page loads within budget (configurable)', async ({ page }, testInfo) => {
    const budgetMs = getBudgetMs()

    await page.goto('/cart', { waitUntil: 'load' })

    const nav = await page.evaluate(() => {
      const entry = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming | undefined
      if (!entry) return null
      return {
        domContentLoadedEventEnd: entry.domContentLoadedEventEnd,
        loadEventEnd: entry.loadEventEnd,
        responseEnd: entry.responseEnd,
        transferSize: entry.transferSize
      }
    })

    expect(nav, 'Navigation timing entry should be present').not.toBeNull()

    const timings = nav as NavTimings
    expect(timings.domContentLoadedEventEnd).toBeGreaterThan(0)
    expect(timings.loadEventEnd).toBeGreaterThan(0)
    expect(timings.loadEventEnd).toBeLessThan(budgetMs)

    await testInfo.attach('speed-metrics', {
      contentType: 'application/json',
      body: Buffer.from(JSON.stringify({ budgetMs, timings }, null, 2))
    })
  })
})
