import { test, expect } from '@playwright/test'

const adminToken = process.env.PLAYWRIGHT_ADMIN_TOKEN || 'playwright-admin'
const pixelPng = Buffer.from(
  'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR4nGNgYAAAAAMAAWgmWQ0AAAAASUVORK5CYII=',
  'base64'
)

test.describe('Products · Add flow', () => {
  test('admin can add a new product with confirmation', async ({ page }) => {
    let addPayload: string | undefined

    await page.route('**/api/**', async (route) => {
      const url = new URL(route.request().url())

      if (url.pathname.endsWith('/api/food/add')) {
        addPayload = route.request().postData() || undefined
        expect(route.request().headers()['token']).toBe(adminToken)
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({ success: true, message: 'Food Added' })
        })
        return
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

    await page.goto('/add')

    await page.setInputFiles('#image', {
      name: 'add.png',
      mimeType: 'image/png',
      buffer: pixelPng
    })

    await page.getByPlaceholder('Type Here').fill('Cart Lab Special')
    await page.getByPlaceholder('Write content here').fill('Dedicated automation meal')
    await page.getByPlaceholder('$20').fill('18')
    await page.getByPlaceholder('0', { exact: true }).fill('7')

    await page.getByRole('button', { name: 'ADD' }).click()
    const dialog = page.locator('.confirm-dialog')
    await expect(dialog).toBeVisible()
    await dialog.getByRole('button', { name: 'Add' }).click()

    await expect(page.locator('.Toastify__toast--success')).toContainText('Food Added')
    await expect(page.getByPlaceholder('Type Here')).toHaveValue('')

    expect(addPayload).toContain('Cart Lab Special')
  })

  test('shows validation error toast when required fields are missing', async ({ page }) => {
    let addPayload: string | undefined

    await page.route('**/api/**', async (route) => {
      const url = new URL(route.request().url())

      if (url.pathname.endsWith('/api/food/add')) {
        addPayload = route.request().postData() || undefined
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
        body: JSON.stringify({ success: true, data: [] })
      })
    })

    await page.addInitScript(({ token }) => {
      window.sessionStorage.setItem('token', token)
    }, { token: adminToken })

    await page.goto('/add')

    await page.setInputFiles('#image', {
      name: 'add.png',
      mimeType: 'image/png',
      buffer: pixelPng
    })

    await page.getByPlaceholder('Type Here').fill('  ')
    await page.getByPlaceholder('Write content here').fill('  ')
    await page.getByPlaceholder('$20').fill('12')
    await page.getByPlaceholder('0', { exact: true }).fill('5')

    await page.getByRole('button', { name: 'ADD' }).click()
    const dialog = page.locator('.confirm-dialog')
    await expect(dialog).toBeVisible()
    await dialog.getByRole('button', { name: 'Add' }).click()

    await expect(page.locator('.Toastify__toast--error')).toContainText('Food information cannot be left blank')
    await expect(page.getByPlaceholder('Type Here')).toHaveValue('  ')

    expect(addPayload).toBeDefined()
    expect(addPayload).not.toContain('Cart Lab Special')
  })
})
