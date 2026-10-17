import { After, Before, setDefaultTimeout } from '@cucumber/cucumber';
import { chromium, type Browser, type Page } from '@playwright/test';
import { LoginPage } from '../../src/pages/login-page';
import { DashboardPage } from '../../src/pages/dashboard-page';
import { SiteNavigationPage } from '../../src/pages/site-navigation-page';

setDefaultTimeout(30000);

export interface World {
  browser: Browser;
  page: Page;
  loginPage: LoginPage;
  dashboardPage: DashboardPage;
  siteNavigationPage: SiteNavigationPage;
}

Before(async function (this: World) {
  this.browser = await chromium.launch({ headless: true });
  const context = await this.browser.newContext();
  this.page = await context.newPage();
  this.loginPage = new LoginPage(this.page);
  this.dashboardPage = new DashboardPage(this.page);
  this.siteNavigationPage = new SiteNavigationPage(this.page);
});

After(async function (this: World) {
  if (this.browser) {
    await this.browser.close();
  }
});
