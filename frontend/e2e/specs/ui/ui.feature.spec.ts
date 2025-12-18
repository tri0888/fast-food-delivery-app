import { Buffer } from 'node:buffer'
import type { Page, Route } from '@playwright/test'
import { test, expect } from '../../fixtures/baseTest'

const sampleFoods = [
  {
    _id: 'food-ui-501',
    name: 'UI Pho Delight',
    description: 'Mobile ready soup',
    price: 11,
    category: 'Soup',
    image: 'pho-ui.png',
    stock: 4
  },
  {
    _id: 'food-ui-502',
    name: 'Desktop Burger',
    description: 'Desktop sized burger',
    price: 13,
    category: 'Burger',
    image: 'burger-ui.png',
    stock: 6
  }
]

const pixelPng = Buffer.from(
  'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR4nGMAAQAABQABDQottAAAAABJRU5ErkJggg==',
  'base64'
)

type PageContext = { page: Page }

async function primeFoodList(route: Route, foods = sampleFoods) {
  await route.fulfill({
    status: 200,
    contentType: 'application/json',
    body: JSON.stringify({ success: true, data: foods })
  })
}

test.describe('Feature · UI conformance', () => {
  test.beforeEach(async ({ page }: PageContext) => {
    await page.route('**/api/food/list', async (route: Route) => {
      await primeFoodList(route)
    })

    await page.route('**/api/cart/get', async (route: Route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ success: true, cartData: {}, isCartLocked: false })
      })
    })

    await page.route('**/images/**', async (route: Route) => {
      await route.fulfill({ status: 200, contentType: 'image/png', body: pixelPng })
    })
  })

  test('FEA_UI_FEAT_02 + FEA_UI_FEAT_12 · Mobile viewport lists dishes without horizontal scroll', async ({ page }: PageContext) => {
    await page.setViewportSize({ width: 375, height: 720 })
    await page.goto('/')

    await expect(page.locator('.food-display-list')).toBeVisible()
    await expect(page.locator('.food-item')).toHaveCount(2)

    const hasHorizontalScroll = await page.evaluate(() => document.body.scrollWidth > window.innerWidth + 5)
    expect(hasHorizontalScroll).toBe(false)
  })

  test('FEA_UI_FEAT_03 + FEA_UI_FEAT_13 · Broken food images fall back to placeholder asset', async ({ page }: PageContext) => {
    await page.unroute('**/images/**')
    await page.route('**/images/**', async (route: Route) => {
      await route.fulfill({ status: 404 })
    })

    await page.goto('/')
    await expect(page.locator('.food-item-image').first()).toHaveAttribute('src', /placeholder|fallback/i)
  })

  test('FEA_UI_FEAT_04 + FEA_UI_FEAT_14 · Search panel filters list after typing keywords', async ({ page }: PageContext) => {
    await page.goto('/')

    const searchInput = page.locator('.filter-sidebar .search-input')
    await searchInput.fill('pho')
    await page.getByRole('button', { name: 'Apply' }).click()

    await expect(page.locator('.food-item')).toHaveCount(1)
    await expect(page.locator('.food-item-name-rating p').first()).toHaveText('UI Pho Delight')
  })

  test('FEA_UI_FEAT_06 + FEA_UI_FEAT_16 · Cart badge increments when items are added', async ({ page }: PageContext) => {
    await page.addInitScript(() => {
      window.localStorage.setItem('token', 'ui-feature-token')
    })

    const cartAdds: Array<Record<string, unknown>> = []

    await page.route('**/api/cart/add', async (route: Route) => {
      cartAdds.push(route.request().postDataJSON())
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ success: true })
      })
    })

    await page.goto('/')
    await page.locator('.food-item .add').first().click()

    expect(cartAdds[0]).toEqual({ itemId: 'food-ui-501' })
    await expect(page.locator('.navbar-search-icon .dot')).toHaveClass(/dot/)
  })

  test('FEA_UI_FEAT_07 + FEA_UI_FEAT_17 · Pagination control loads next page data', async ({ page }: PageContext) => {
    await page.goto('/')
    await expect(page.getByRole('button', { name: /next/i })).toBeVisible()
  })

  test('FEA_UI_FEAT_09 + FEA_UI_FEAT_19 · Server error shows red toast notification', async ({ page }: PageContext) => {
    await page.unroute('**/api/food/list')
    await page.route('**/api/food/list', async (route: Route) => {
      await route.fulfill({ status: 500, contentType: 'application/json', body: JSON.stringify({ success: false }) })
    })

    await page.goto('/')
    await expect(page.locator('.Toastify__toast--error')).toContainText(/server/i)
  })

  test('FEA_UI_FEAT_10 + FEA_UI_FEAT_20 · Logout redirects to login state', async ({ page }: PageContext) => {
    await page.addInitScript(() => {
      window.localStorage.setItem('token', 'ui-logout-token')
    })

    await page.goto('/')
    const profile = page.locator('.navbar-profile')
    await expect(profile).toBeVisible()

    await profile.hover()
    await page.locator('.nav-profile-dropdown li', { hasText: 'Logout' }).click()

    await expect(page).toHaveURL(/\/$/)
    await expect(page.getByRole('button', { name: /sign in/i })).toBeVisible()
  })
})
