import { test, expect } from '@playwright/test'
import { Buffer } from 'node:buffer'

const adminToken = process.env.PLAYWRIGHT_ADMIN_TOKEN || 'playwright-admin'

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
    await page.route('**/api/**', async (route) => {
      const headerToken = route.request().headers()['token']
      if (headerToken !== undefined) {
        expect(headerToken).toBe(adminToken)
      }
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ success: true, data: [] })
      })
    })

    await page.addInitScript(({ token }) => {
      window.sessionStorage.setItem('token', token)
    }, { token: adminToken })
  })

  test('SPEED-ADMIN-001 · users page loads within budget (configurable)', async ({ page }, testInfo) => {
    const budgetMs = getBudgetMs()

    await page.goto('/users', { waitUntil: 'load' })

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

  test('SPEED-ADMIN-002 · list page loads within budget (configurable)', async ({ page }, testInfo) => {
    const budgetMs = getBudgetMs()

    await page.goto('/list', { waitUntil: 'load' })

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

  test('SPEED-ADMIN-003 · orders page loads within budget (configurable)', async ({ page }, testInfo) => {
    const budgetMs = getBudgetMs()

    await page.goto('/orders', { waitUntil: 'load' })

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
