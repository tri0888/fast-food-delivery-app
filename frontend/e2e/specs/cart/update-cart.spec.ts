import { test, expect } from '../../fixtures/baseTest'

const mockFoods = [
  {
    _id: 'food-203',
    name: 'Cart Counter Roll',
    description: 'Tasty and adjustable',
    price: 8,
    category: 'Rolls',
    image: 'roll.png',
    stock: 5
  }
]

const pixelGif = Buffer.from(
  'R0lGODlhAQABAIABAP///wAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw==',
  'base64'
)

test.describe('Cart · Update quantities', () => {
  test('customer can increment and decrement quantities from cart page', async ({ page }) => {
    const addCalls: string[] = []
    const removeCalls: unknown[] = []

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

    await page.route('**/api/cart/add', async (route) => {
      addCalls.push(route.request().postDataJSON().itemId)
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ success: true })
      })
    })

    await page.route('**/api/cart/remove', async (route) => {
      removeCalls.push(route.request().postDataJSON())
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ success: true })
      })
    })

    await page.goto('/cart')
    await expect(page.getByText(mockFoods[0].name)).toBeVisible()

    const quantityDisplay = page.locator('.quantity-display').first()
    const plusButton = page.locator('.cart-action-btn').filter({ hasText: '+' }).first()
    const minusButton = page.locator('.cart-action-btn').filter({ hasText: '-' }).first()

    await plusButton.click()
    await expect(quantityDisplay).toHaveText(/2/)

    await minusButton.click()
    await expect(quantityDisplay).toHaveText(/1/)

    expect(addCalls).toEqual(['food-203'])
    expect(removeCalls).toEqual([{ itemId: 'food-203' }])
  })
})
