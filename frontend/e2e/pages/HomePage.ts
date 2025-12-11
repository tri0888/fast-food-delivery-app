import { Page, expect } from '@playwright/test'

export class HomePage {
  constructor(private readonly page: Page) {}

  async goto() {
    await this.page.goto('/')
  }

  async expectAppShellVisible() {
    await this.page.waitForLoadState('networkidle')
    await expect(this.page.locator('body')).toBeVisible()
  }
}
