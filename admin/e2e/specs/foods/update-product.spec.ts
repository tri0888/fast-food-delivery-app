import { test, expect } from '@playwright/test'

const adminToken = process.env.PLAYWRIGHT_ADMIN_TOKEN || 'playwright-admin'

const mockFoods = [
  {
    _id: 'food-001',
    name: 'Automation Pizza',
    description: 'Cheesy goodness',
    price: 22,
    quantity: 5,
    image: 'https://cdn.fastfood.dev/pizza.png'
  }
]

test.describe('Products · Update flow', () => {
  test('admin can update an existing product', async ({ page }) => {
    let editPayload: string | undefined
    const capturedListResponses: string[] = []

    await page.route('**/api/**', async (route) => {
      const url = new URL(route.request().url())

      if (url.pathname.endsWith('/api/food/list')) {
        capturedListResponses.push(url.toString())
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({ success: true, data: mockFoods })
        })
        return
      }

      if (url.pathname.endsWith('/api/food/edit')) {
        editPayload = route.request().postData() || undefined
        expect(route.request().headers()['token']).toBe(adminToken)
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({ success: true, message: 'Food Updated' })
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

    const row = page.locator('.list-table-format').filter({ hasText: 'Automation Pizza' }).first()
    await expect(row).toBeVisible()
    await row.getByRole('link', { name: 'Edit' }).click()
    await page.waitForURL('**/edit/food-001')

    await page.getByPlaceholder('Type Here').fill('Automation Pizza XL')
    await page.getByPlaceholder('$20').fill('25')

    await page.getByRole('button', { name: 'UPDATE' }).click()
    const dialog = page.locator('.confirm-dialog')
    await expect(dialog).toBeVisible()
    await dialog.getByRole('button', { name: 'Update' }).click()

    await expect(page.locator('.Toastify__toast--success')).toContainText('Food Updated')
    await expect(page).toHaveURL(/\/list$/)

    expect(capturedListResponses.length).toBeGreaterThanOrEqual(2)
    expect(editPayload).toContain('Automation Pizza XL')
    expect(editPayload).toContain('25')
  })

  test('shows error toast when backend rejects invalid edits', async ({ page }) => {
    let editPayload: string | undefined

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

      if (url.pathname.endsWith('/api/food/edit')) {
        editPayload = route.request().postData() || undefined
        expect(route.request().headers()['token']).toBe(adminToken)
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({ success: false, message: 'Food information cannot be left blank' })
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

    const row = page.locator('.list-table-format').filter({ hasText: 'Automation Pizza' }).first()
    await expect(row).toBeVisible()
    await row.getByRole('link', { name: 'Edit' }).click()
    await page.waitForURL('**/edit/food-001')

    await page.getByPlaceholder('Type Here').fill('  ')
    await page.getByPlaceholder('$20').fill('24')

    await page.getByRole('button', { name: 'UPDATE' }).click()
    const dialog = page.locator('.confirm-dialog')
    await expect(dialog).toBeVisible()
    await dialog.getByRole('button', { name: 'Update' }).click()

    await expect(page.locator('.Toastify__toast--error')).toContainText('Food information cannot be left blank')
    await expect(page).toHaveURL(/\/edit\/food-001$/)

    expect(editPayload).toBeDefined()
  })
})
