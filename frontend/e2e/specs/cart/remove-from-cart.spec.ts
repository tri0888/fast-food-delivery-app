import { test, expect } from '../../fixtures/baseTest'

const mockFoods = [
  {
    _id: 'food-202',
    name: 'Cart Exit Pho',
    description: 'Ready to leave the basket',
    price: 14,
    category: 'Vietnamese',
    image: 'pho.png',
    stock: 5
  }
]

const pixelGif = Buffer.from(
  'R0lGODlhAQABAIABAP///wAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw==',
  'base64'
)

test.describe('Cart · Remove item', () => {
  test('customer can remove an item entirely from cart', async ({ page }) => {
    const removePayloads: unknown[] = []

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
        body: JSON.stringify({ success: true, cartData: { [mockFoods[0]._id]: 1 }, isCartLocked: false })
      })
    })

    await page.route('**/api/cart/remove', async (route) => {
      removePayloads.push(route.request().postDataJSON())
      expect(route.request().headers()['token']).toBe('customer-cart-token')
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ success: true })
      })
    })

    await page.goto('/cart')
    await expect(page.locator('.cart-items-title').first()).toBeVisible()
    await expect(page.getByText(mockFoods[0].name)).toBeVisible()

    await page.locator('.cart-actions .cross').click()

    await expect(page.locator('.cart-items .cart-items-item')).toHaveCount(0)
    expect(removePayloads).toEqual([
      { itemId: mockFoods[0]._id, removeCompletely: true }
    ])
  })
})
