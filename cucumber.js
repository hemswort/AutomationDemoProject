export default {
  paths: ['features/**/*.feature'],
  requireModule: ['tsx/cjs'],
  require: [
    'features/support/**/*.ts',
    'features/step-definitions/**/*.ts'
  ],
  format: [
    'progress-bar',
    'html:reports/cucumber-report.html',
    'json:reports/cucumber-report.json'
  ],
  formatOptions: {
    snippetInterface: 'async-await'
  },
  publishQuiet: true
};
