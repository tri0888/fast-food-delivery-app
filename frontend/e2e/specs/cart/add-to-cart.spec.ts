import { test, expect } from '../../fixtures/baseTest'

const mockFoods = [
  {
    _id: 'food-201',
    name: 'Cart Automation Bun',
    description: 'Filled with tasty scripts',
    price: 12,
    category: 'Burger',
    image: 'bun.png',
    stock: 3
  }
]

const pixelGif = Buffer.from(
  'R0lGODlhAQABAIABAP///wAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw==',
  'base64'
)

test.describe('Cart · Add item', () => {
  test('SCREEN-FE-001 · customer can add a product from the menu into cart', async ({ page }) => {
    const cartAdds: string[] = []

    await page.addInitScript((token) => {
      window.localStorage.setItem('token', token as string)
    }, 'customer-cart-token')

    await page.route('**/images/**', async (route) => {
      await route.fulfill({ status: 200, contentType: 'image/gif', body: pixelGif })
    })

    await page.route('**/api/food/list', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ success: true, data: mockFoods })
      })
    })

    await page.route('**/api/cart/get', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ success: true, cartData: {}, isCartLocked: false })
      })
    })

    await page.route('**/api/cart/add', async (route) => {
      cartAdds.push(route.request().postDataJSON().itemId)
      expect(route.request().headers()['token']).toBe('customer-cart-token')
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ success: true })
      })
    })

    await page.goto('/')
    await expect(page.getByRole('heading', { name: 'Top dishes near you' })).toBeVisible()

    await page.locator('.food-item .add').first().click()
    await expect(page.locator('.food-item-counter p').first()).toHaveText('1')

    await page.locator('.navbar-search-icon a').click()
    await page.waitForURL('**/cart')
    await expect(page.locator('.cart-items-title').first()).toBeVisible()
    await expect(page.getByText(mockFoods[0].name)).toBeVisible()

    expect(cartAdds).toEqual(['food-201'])
  })
})
