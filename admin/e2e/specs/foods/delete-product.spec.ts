import { test, expect } from '@playwright/test'

const adminToken = process.env.PLAYWRIGHT_ADMIN_TOKEN || 'playwright-admin'

const mockFoods = [
  {
    _id: 'food-101',
    name: 'Temp Burger',
    description: 'Soon to be removed',
    price: 11,
    quantity: 3,
    image: 'https://cdn.fastfood.dev/burger.png'
  }
]

test.describe('Products · Delete flow', () => {
  test('admin can delete a product after confirming', async ({ page }) => {
    let removePayload: string | undefined

    await page.route('**/api/**', async (route) => {
      const url = new URL(route.request().url())

      if (url.pathname.endsWith('/api/food/list')) {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({ success: true, data: mockFoods })
        })
        return
      }

      if (url.pathname.endsWith('/api/food/remove')) {
        removePayload = route.request().postData() || undefined
        expect(route.request().headers()['token']).toBe(adminToken)
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({ success: true, message: 'Food Removed' })
        })
        return
      }

      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ success: true })
      })
    })

    await page.addInitScript(({ token }) => {
      window.sessionStorage.setItem('token', token)
    }, { token: adminToken })

    await page.goto('/list')

    const row = page.locator('.list-table-format').filter({ hasText: 'Temp Burger' }).first()
    await expect(row).toBeVisible()

    await row.locator('.delete-btn').click()
    const dialog = page.locator('.confirm-dialog')
    await expect(dialog).toBeVisible()
    await dialog.getByRole('button', { name: 'Xóa' }).click()

    await expect(page.locator('.Toastify__toast--success')).toContainText('Food Removed')
    expect(removePayload).toContain('food-101')
  })
})
