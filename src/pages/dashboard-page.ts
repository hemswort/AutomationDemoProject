import { expect, type Page } from '@playwright/test';

export class DashboardPage {
  constructor(private readonly page: Page) {}

  async expectDashboardPage(): Promise<void> {
    await expect(this.page).toHaveURL(/\/web\/index\.php\/dashboard\/index$/, { timeout: 30000 });
    await expect(this.page.locator('h6')).toHaveText('Dashboard', { timeout: 30000 });
  }
}
