import { spawn } from 'node:child_process';
import { mkdir } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const projectRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const reportDirectory = resolve(projectRoot, 'reports');
const cucumberCli = resolve(
  projectRoot,
  'node_modules',
  '@cucumber',
  'cucumber',
  'bin',
  'cucumber.js'
);

await mkdir(reportDirectory, { recursive: true });

const args = process.argv.slice(2);
const headed = args.includes('--headed');
const slowMoArg = args.find((argument) => argument.startsWith('--slow-mo='));
const cucumberArgs = args.filter(
  (argument) => argument !== '--headed' && !argument.startsWith('--slow-mo=')
);

const cucumber = spawn(process.execPath, [cucumberCli, ...cucumberArgs], {
  cwd: projectRoot,
  stdio: 'inherit',
  env: {
    ...process.env,
    ...(headed ? { HEADLESS: 'false' } : {}),
    ...(slowMoArg ? { PLAYWRIGHT_SLOW_MO: slowMoArg.slice('--slow-mo='.length) } : {})
  }
});

cucumber.on('error', (error) => {
  console.error('Unable to start Cucumber:', error);
  process.exitCode = 1;
});

cucumber.on('exit', (code, signal) => {
  if (signal) {
    console.error(`Cucumber stopped by signal ${signal}`);
  }
  process.exitCode = code ?? 1;
});
