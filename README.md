# Playwright Sandbox

Practical Playwright learning project built alongside my daily Selenium + C# work to level up with modern TypeScript, Cucumber BDD, and CI-ready UI test automation.

## Why this project

I use Selenium and C# in my day-to-day role, and this repository is my hands-on transition path into Playwright and modern JavaScript/TypeScript automation.

The goal is to practice production-style test design with:

- Page Object Model structure
- Cucumber BDD scenarios and step definitions
- Selective execution by tags, scenario name, and feature line
- CI-friendly test organization

## Tech stack

- Playwright
- Cucumber.js
- TypeScript
- Node.js
- dotenv

## Running tests

Install dependencies:

```bash
npm install
```

Run all scenarios:

```bash
npm test
```

Run one feature file:

```bash
npm run test:feature
```

Run one scenario by name:

```bash
npm run test:scenario -- "Successful login with valid credentials"
```

Run by tag:

```bash
npm run test:smoke
npm run test:regression
npm run test:negative
```

Run by line:

```bash
npm run test:line -- "tests/feature-files/login.feature:4"
```

## Environment setup

Create a `.env` file for local execution and add required values such as:

- `BASE_URL`
- `TEST_USERNAME`
- `TEST_PASSWORD`

## Current focus

- Strengthen Playwright fundamentals with reliable E2E flows
- Keep test code maintainable through page objects and reusable steps
- Prepare a clean structure for CI pipeline integration

## Roadmap

- Add broader regression coverage
- Integrate accessibility testing once core E2E flows are stable