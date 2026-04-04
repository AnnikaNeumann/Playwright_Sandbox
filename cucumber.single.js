require('dotenv').config({ path: '.env' });

require('ts-node').register({
  project: './tsconfig.json',
  transpileOnly: true,
  compilerOptions: {
    module: 'commonjs',
    esModuleInterop: true
  }
});

module.exports = {
  default: {
    require: [
      'tests/support/hooks.ts',
      'tests/support/world.ts',
      'tests/step-definitions/**/*.ts'
    ],
    format: [
      'progress-bar',
      'html:cucumber-report.html',
      'json:tests/cucumber.json'
    ],
    paths: ['tests/feature-files/**/*.feature'],
    parallel: 0,
    timeout: 30000,
    strict: true
  }
};
