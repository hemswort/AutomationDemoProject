# AutomationDemoProject
End-to-end E-commerce Test Automation Platform using Playwright, TypeScript, Cucumber.js, GitHub Actions CI/CD, Jira integration, automated reporting, and AI-powered test failure analysis.

## Emailing CI reports

After each completed, non-cancelled push run on `main`, GitHub Actions emails the
Cucumber HTML and JSON reports to `craddipufeippi-8639@yopmail.com`, including
when scenarios fail. Pull request runs do not send email.

Verify a sending domain in Resend, then configure the following in the
repository's **Settings → Secrets and variables → Actions**:

- Secret `RESEND_API_KEY`: API key from Resend.
- Variable `REPORT_FROM_EMAIL`: sender address on the verified Resend domain.

The report recipient is configured in `.github/workflows/playwright.yml`.
Never commit the API key or put it in workflow YAML. Resend will reject sender
addresses that are not on a verified domain.

## Watch tests run in a browser

Run `npm run test:headed` to open Chromium visibly and watch the complete
Cucumber suite execute. Actions are slowed slightly for easier viewing. The
standard `npm test` command and CI workflow remain headless.

## Run tests with Docker

Docker runs the Playwright/Cucumber test runner in a container with its browser
dependencies installed. Install Docker Desktop and make sure it is running, then
run these commands from the project root:

```sh
docker compose build
docker compose run --rm e2e
```

The default command runs the full Cucumber suite. To run a subset, pass the
existing npm script to the service:

```sh
docker compose run --rm e2e npm run test:smoke
docker compose run --rm e2e npm run test:chromium
```

Reports are written to the local `reports/` directory. The container uses the
Playwright `v1.64.1` image to match the version in `package-lock.json`. The
container runs headless; use `npm run test:headed` on the host to watch a browser.
