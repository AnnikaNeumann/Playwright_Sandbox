# Playwright Sandbox

Practical Playwright learning project focused on the native Playwright Test runner and TypeScript, using page objects and CI-ready E2E flows.

## Why this project

I use Selenium and C# in my day-to-day role, and this repository is my hands-on transition path into Playwright and modern JavaScript/TypeScript automation.

The goal is to practice production-style test design with:

- Page Object Model structure
- Native Playwright specs and test grouping
- Selective execution by grep tags and file targeting
- CI-friendly test organization


## Tech stack

- Playwright
- TypeScript
- Node.js
- dotenv

## Running tests

Install dependencies:

```bash
npm install
```

Run all tests:

```bash
npm test
```

Run all tests with a custom worker count (useful for live sites that rate-limit):

```bash
$env:PW_WORKERS=1; npx playwright test
```

Run headed mode:

```bash
npm run test:headed
```

Run smoke tests:

```bash
npm run test:smoke
```

Run a single spec file:

```bash
npx playwright test tests/specs/login.spec.ts
```

Open the HTML report:

```bash
npm run show-report
```

## Environment setup

Create a `.env` file for local execution and add required values such as:

- `BASE_URL` (optional, defaults to `https://posteo.de/en`; non-Posteo values are ignored by the shared login page object)
- `TEST_USER_EMAIL`
- `TEST_PASSWORD`
- `TEST_USER_FULL_NAME`
- `TEST_USER_PHONE`

## Current focus

- Strengthen Playwright fundamentals with reliable E2E flows
- Exercise Posteo login and related webmail flows as the primary live-site target
- Keep test code maintainable through page objects and focused specs
- Prepare a clean structure for CI pipeline integration

## Roadmap

- Add broader regression coverage
- Integrate accessibility testing once core E2E flows are stable