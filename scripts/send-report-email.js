import { readFile } from 'node:fs/promises';

const requiredEnvironment = [
  'RESEND_API_KEY',
  'REPORT_FROM_EMAIL',
  'REPORT_RECIPIENT',
  'GITHUB_RUN_NUMBER',
  'GITHUB_SERVER_URL',
  'GITHUB_REPOSITORY',
  'GITHUB_RUN_ID',
  'GITHUB_SHA',
  'GITHUB_REF_NAME'
];

const missingEnvironment = requiredEnvironment.filter((name) => !process.env[name]);
if (missingEnvironment.length > 0) {
  throw new Error(`Missing required email configuration: ${missingEnvironment.join(', ')}`);
}

const reportDirectory = new URL('../reports/', import.meta.url);
const [reportJson, reportHtml] = await Promise.all([
  readFile(new URL('cucumber-report.json', reportDirectory), 'utf8'),
  readFile(new URL('cucumber-report.html', reportDirectory), 'utf8')
]);

const features = JSON.parse(reportJson);
const scenarios = features.flatMap((feature) =>
  (feature.elements ?? []).filter((element) =>
    ['Scenario', 'Scenario Outline'].includes(element.keyword)
  )
);

const scenarioResults = scenarios.map((scenario) => {
  const statuses = scenario.steps.map((step) => step.result?.status);
  if (statuses.includes('failed')) return 'failed';
  if (statuses.includes('undefined') || statuses.includes('ambiguous')) return 'failed';
  if (statuses.includes('skipped') || statuses.includes('pending')) return 'skipped';
  return 'passed';
});

const passed = scenarioResults.filter((status) => status === 'passed').length;
const failed = scenarioResults.filter((status) => status === 'failed').length;
const skipped = scenarioResults.filter((status) => status === 'skipped').length;
const testStatus = failed === 0 ? 'passed' : 'failed';
const runUrl = `${process.env.GITHUB_SERVER_URL}/${process.env.GITHUB_REPOSITORY}/actions/runs/${process.env.GITHUB_RUN_ID}`;
const escapeHtml = (value) =>
  value.replace(/[&<>"']/g, (character) => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;'
  })[character]);

const response = await fetch('https://api.resend.com/emails', {
  method: 'POST',
  headers: {
    Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    from: `OrangeHRM Automation <${process.env.REPORT_FROM_EMAIL}>`,
    to: [process.env.REPORT_RECIPIENT],
    subject: `OrangeHRM automation report (${testStatus}) — CI run #${process.env.GITHUB_RUN_NUMBER}`,
    text: [
      'Hello,',
      '',
      `The OrangeHRM automated test suite completed with status: ${testStatus}.`,
      `Scenarios: ${scenarios.length} total; ${passed} passed; ${failed} failed; ${skipped} skipped.`,
      `Branch: ${process.env.GITHUB_REF_NAME}`,
      `Commit: ${process.env.GITHUB_SHA}`,
      `GitHub Actions run: ${runUrl}`,
      '',
      'The detailed HTML and JSON reports are attached.'
    ].join('\n'),
    html: `<!doctype html>
<html lang="en">
  <body style="margin:0;background:#f4f6f8;font-family:Arial,sans-serif;color:#1f2937">
    <div style="max-width:640px;margin:32px auto;background:#fff;border:1px solid #e5e7eb;border-radius:8px;overflow:hidden">
      <div style="padding:24px 28px;background:#123b5d;color:#fff">
        <h1 style="margin:0;font-size:22px">OrangeHRM Automation Report</h1>
        <p style="margin:8px 0 0">CI run #${escapeHtml(process.env.GITHUB_RUN_NUMBER)} completed with status: ${escapeHtml(testStatus)}</p>
      </div>
      <div style="padding:24px 28px">
        <p>Hello,</p>
        <p>The automated test suite completed with status: <strong>${escapeHtml(testStatus)}</strong>. Detailed HTML and JSON reports are attached.</p>
        <p style="padding:16px;background:#f3f8fc;border-radius:6px">
          <strong>${scenarios.length}</strong> scenarios &nbsp;·&nbsp;
          <strong style="color:#16803c">${passed} passed</strong> &nbsp;·&nbsp;
          <strong style="color:#b42318">${failed} failed</strong> &nbsp;·&nbsp;
          <strong>${skipped} skipped</strong>
        </p>
        <p><strong>Branch:</strong> ${escapeHtml(process.env.GITHUB_REF_NAME)}<br>
          <strong>Commit:</strong> ${escapeHtml(process.env.GITHUB_SHA)}</p>
        <p><a href="${escapeHtml(runUrl)}" style="color:#1261a0">View GitHub Actions run</a></p>
      </div>
    </div>
  </body>
</html>`,
    attachments: [
      {
        filename: `orangehrm-report-${process.env.GITHUB_RUN_NUMBER}.html`,
        content: Buffer.from(reportHtml).toString('base64')
      },
      {
        filename: `orangehrm-report-${process.env.GITHUB_RUN_NUMBER}.json`,
        content: Buffer.from(reportJson).toString('base64')
      }
    ]
  })
});

const responseBody = await response.text();
if (!response.ok) {
  throw new Error(`Resend email delivery failed (${response.status}): ${responseBody}`);
}

let resendResponse;
try {
  resendResponse = JSON.parse(responseBody);
} catch (error) {
  throw new Error('Resend returned an invalid JSON response.', { cause: error });
}

console.log(`Cucumber report emailed to ${process.env.REPORT_RECIPIENT} (Resend ID: ${resendResponse.id})`);
