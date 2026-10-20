# AutomationDemoProject
End-to-end E-commerce Test Automation Platform using Playwright, TypeScript, Cucumber.js, GitHub Actions CI/CD, Jira integration, automated reporting, and AI-powered test failure analysis.

## Emailing CI reports

After a successful push to `main`, GitHub Actions can email the Cucumber HTML and
JSON reports to the configured recipient. Pull request runs do not send email.

In the repository's **Settings → Secrets and variables → Actions**, add these
repository secrets:

- `GMAIL_USERNAME`: Gmail address used to send the report.
- `GMAIL_APP_PASSWORD`: Gmail app password (requires 2-Step Verification).
- `REPORT_RECIPIENT`: customer email address.

Then add the repository variable `REPORT_EMAIL_ENABLED` with the value `true`.
Until enabled, CI runs and uploads the report artifact as usual without sending
email. Never commit mail credentials or put them in workflow YAML.

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
