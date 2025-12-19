import { test, expect } from '@playwright/test'

const adminToken = process.env.PLAYWRIGHT_ADMIN_TOKEN || 'playwright-admin'

test.describe('Compatibility · Smoke', () => {
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

  test('COMPAT-ADMIN-001 · loads Users page and shows sidebar links', async ({ page }) => {
    await page.goto('/users')

    await expect(page.getByRole('link', { name: /add items/i })).toBeVisible()
    await expect(page.getByRole('link', { name: /list items/i })).toBeVisible()
    await expect(page.getByRole('link', { name: /orders/i })).toBeVisible()
    await expect(page.getByRole('link', { name: /users/i })).toBeVisible()

    await expect(page).toHaveURL(/\/users/)
  })

  test('COMPAT-ADMIN-002 · navigates to Orders page without crash', async ({ page }) => {
    await page.goto('/orders')

    await expect(page.getByRole('link', { name: /orders/i })).toBeVisible()
    await expect(page).toHaveURL(/\/orders/)
    await expect(page.locator('body')).toBeVisible()
  })

  test('COMPAT-ADMIN-003 · navigates to List page without crash', async ({ page }) => {
    await page.goto('/list')

    await expect(page.getByRole('link', { name: /list items/i })).toBeVisible()
    await expect(page).toHaveURL(/\/list/)
    await expect(page.locator('body')).toBeVisible()
  })

  test('COMPAT-ADMIN-004 · navigates to Add page and renders form controls', async ({ page }) => {
    await page.goto('/add')

    await expect(page.getByRole('link', { name: /add items/i })).toBeVisible()
    await expect(page).toHaveURL(/\/add/)

    // Basic smoke: there should be at least one input/textarea on the Add form.
    await expect(page.locator('input, textarea').first()).toBeVisible()
  })

  test('COMPAT-ADMIN-005 · deep-link /users renders directly with injected token', async ({ page }) => {
    // Each test starts from a fresh browser context, so this exercises a direct deep-link.
    await page.goto('/users')

    await expect(page).toHaveURL(/\/users/)
    await expect(page.getByRole('link', { name: /users/i })).toBeVisible()
    await expect(page.locator('body')).toBeVisible()
  })
})
