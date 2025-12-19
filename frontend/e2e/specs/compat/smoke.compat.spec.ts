import { test, expect } from '@playwright/test'
import { Buffer } from 'node:buffer'

const sampleFoods = [
  {
    _id: 'food-compat-1',
    name: 'Compat Burger',
    description: 'Cross-browser friendly',
    price: 9,
    category: 'Burger',
    image: 'compat-burger.png',
    stock: 10
  }
]

const pixelPng = Buffer.from(
  'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR4nGMAAQAABQABDQottAAAAABJRU5ErkJggg==',
  'base64'
)

test.describe('Compatibility · Smoke', () => {
  test.beforeEach(async ({ page }) => {
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

  test('COMPAT-FE-001 · homepage renders navbar and menu section', async ({ page }) => {
    await page.goto('/')

    await expect(page.getByRole('link', { name: /^home$/i })).toBeVisible()
    await expect(page.locator('a[href="/cart"]').first()).toBeVisible()
    await expect(page.locator('.food-display-list')).toBeVisible()
  })

  test('COMPAT-FE-002 · cart page route renders without crash', async ({ page }) => {
    await page.goto('/cart')
    await expect(page).toHaveURL(/\/cart/)
    await expect(page.locator('body')).toBeVisible()
  })

  test('COMPAT-FE-003 · food cards render and images load', async ({ page }) => {
    let sawOkImageResponse = false
    page.on('response', (res) => {
      if (res.url().includes('/images/') && res.status() === 200) {
        sawOkImageResponse = true
      }
    })

    await page.goto('/')

    await expect(page.locator('.food-item')).toHaveCount(1)
    const img = page.locator('.food-item-image').first()
    await expect(img).toHaveCount(1)

    // Cross-browser robustness: validate that the image request succeeded.
    await expect.poll(() => sawOkImageResponse).toBeTruthy()
  })

  test('COMPAT-FE-004 · add-to-cart interaction does not crash', async ({ page }) => {
    await page.goto('/')

    // For guest users, the app still updates UI state locally.
    await expect(page.locator('img.add')).toBeVisible()
    await page.locator('img.add').click()

    await expect(page.locator('.food-item-counter')).toBeVisible()
    await expect(page.locator('.food-item-counter p')).toHaveText('1')
  })

  test('COMPAT-FE-005 · cart route supports reload (no blank screen)', async ({ page }) => {
    await page.goto('/cart')
    await page.reload()
    await expect(page).toHaveURL(/\/cart/)
    await expect(page.locator('body')).toBeVisible()
  })

  test('COMPAT-FE-006 · food images render (no broken images)', async ({ page }) => {
    let okImageResponses = 0
    page.on('response', (res) => {
      if (res.url().includes('/images/') && res.status() === 200) {
        okImageResponses++
      }
    })

    await page.goto('/')

    const imgs = page.locator('img')
    const count = await imgs.count()
    expect(count).toBeGreaterThan(0)

    // At least one image fetch should succeed.
    await expect.poll(() => okImageResponses).toBeGreaterThan(0)
  })
})
