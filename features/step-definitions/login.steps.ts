import { Given, Then, When } from '@cucumber/cucumber';
import type { World } from '../support/world';

Given('I am on the OrangeHRM login page', async function (this: World) {
  await this.loginPage.open();
});

When('I login as {string} with password {string}', async function (this: World, username: string, password: string) {
  await this.loginPage.login(username, password);
});

Then('I should see the OrangeHRM dashboard', async function (this: World) {
  await this.dashboardPage.expectDashboardPage();
});

Then('I should see the login error {string}', async function (this: World, expectedMessage: string) {
  await this.loginPage.expectErrorMessage(expectedMessage);
});

Given('I am logged in as the OrangeHRM admin', async function (this: World) {
  await this.loginPage.open();
  await this.loginPage.login('Admin', 'admin123');
  await this.dashboardPage.expectDashboardPage();
});

When('I open the {string} module', async function (this: World, moduleName: string) {
  await this.siteNavigationPage.openModule(moduleName);
});

Then('I should see the {string} module\'s primary page and control', async function (this: World, moduleName: string) {
  await this.siteNavigationPage.expectModulePage(moduleName);
});
