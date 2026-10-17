import { expect, type Locator, type Page } from '@playwright/test';

type ModuleName =
  | 'Admin'
  | 'PIM'
  | 'Leave'
  | 'Time'
  | 'Recruitment'
  | 'My Info'
  | 'Performance'
  | 'Dashboard'
  | 'Directory'
  | 'Maintenance'
  | 'Claim'
  | 'Buzz';

interface ModulePage {
  expectedUrl: RegExp;
  heading: string;
  primaryControl?: (page: Page) => Locator;
}

const modulePages: Record<ModuleName, ModulePage> = {
  Admin: {
    expectedUrl: /\/web\/index\.php\/admin\/viewSystemUsers$/,
    heading: 'System Users',
    primaryControl: (page) => page.getByText('Add', { exact: true }).first()
  },
  PIM: {
    expectedUrl: /\/web\/index\.php\/pim\/viewEmployeeList$/,
    heading: 'PIM',
    primaryControl: (page) => page.getByText('Add', { exact: true }).first()
  },
  Leave: {
    expectedUrl: /\/web\/index\.php\/leave\/viewLeaveList$/,
    heading: 'Leave'
  },
  Time: {
    expectedUrl: /\/web\/index\.php\/time\/viewEmployeeTimesheet$/,
    heading: 'Time',
    primaryControl: (page) => page.getByText('View', { exact: true }).first()
  },
  Recruitment: {
    expectedUrl: /\/web\/index\.php\/recruitment\/viewCandidates$/,
    heading: 'Recruitment',
    primaryControl: (page) => page.getByText('Add', { exact: true }).first()
  },
  'My Info': {
    expectedUrl: /\/web\/index\.php\/pim\/viewPersonalDetails\/empNumber\/\d+$/,
    heading: 'Personal Details',
    primaryControl: (page) => page.getByText('Save', { exact: true }).first()
  },
  Performance: {
    expectedUrl: /\/web\/index\.php\/performance\/searchEvaluatePerformanceReview$/,
    heading: 'Manage Reviews'
  },
  Dashboard: {
    expectedUrl: /\/web\/index\.php\/dashboard\/index$/,
    heading: 'Dashboard'
  },
  Directory: {
    expectedUrl: /\/web\/index\.php\/directory\/viewDirectory$/,
    heading: 'Directory'
  },
  Maintenance: {
    expectedUrl: /\/web\/index\.php\/maintenance\/purgeEmployee$/,
    heading: 'Administrator Access',
    primaryControl: (page) => page.locator('input[type="password"]')
  },
  Claim: {
    expectedUrl: /\/web\/index\.php\/claim\/viewAssignClaim$/,
    heading: 'Claim',
    primaryControl: (page) => page.getByText('Assign Claim', { exact: true }).first()
  },
  Buzz: {
    expectedUrl: /\/web\/index\.php\/buzz\/viewBuzz$/,
    heading: 'Buzz',
    primaryControl: (page) => page.getByRole('textbox', { name: "What's on your mind?" })
  }
};

function isModuleName(name: string): name is ModuleName {
  return Object.prototype.hasOwnProperty.call(modulePages, name);
}

export class SiteNavigationPage {
  constructor(private readonly page: Page) {}

  async openModule(name: string): Promise<void> {
    if (!isModuleName(name)) {
      throw new Error(`Unsupported OrangeHRM module: ${name}`);
    }
    if (name === 'Maintenance') {
      const maintenanceUrl = new URL('/web/index.php/maintenance/viewMaintenanceModule', this.page.url());
      await this.page.goto(maintenanceUrl.toString(), { waitUntil: 'domcontentloaded' });
      return;
    }

    await this.page.getByRole('link', { name, exact: true }).click();
    await this.page.getByRole('link', { name, exact: true }).click();
  }

  async expectModulePage(name: string): Promise<void> {
    if (!isModuleName(name)) {
      throw new Error(`Unsupported OrangeHRM module: ${name}`);
    }

    const module = modulePages[name];
    await expect(this.page).toHaveURL(module.expectedUrl);
    await expect(this.page.getByText(module.heading, { exact: true }).first()).toBeVisible();

    if (module.primaryControl) {
      await expect(module.primaryControl(this.page)).toBeVisible();
    }
  }
}
