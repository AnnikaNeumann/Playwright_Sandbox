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

### Local execution

Create a `.env` file (see `.env.example`) and fill in the required values:

| Variable | Required | Description |
|---|---|---|
| `BASE_URL` | Optional | Defaults to `https://posteo.de/en`; non-Posteo values are ignored by the login page object |
| `TEST_USER_EMAIL` | Yes (auth tests) | Posteo account email address |
| `TEST_PASSWORD` | Yes (auth tests) | Posteo account password |
| `TEST_USER_FULL_NAME` | Optional | Used by profile/dashboard specs |
| `TEST_USER_PHONE` | Optional | Used by profile/dashboard specs |
| `POSTEO_VALID_CREDENTIALS` | Optional | Set to `true` to enable authenticated login/logout tests locally |

### GitHub Actions secrets

Go to **Settings → Secrets and variables → Actions** and ensure the following repository secrets are set:

| Secret | Notes |
|---|---|
| `TEST_USER_EMAIL` | Posteo account email — re-enter if tests report a missing value |
| `TEST_PASSWORD` | Posteo account password — re-enter if tests report a missing value |
| `BASE_URL` | Recommended even with the fallback; set to `https://posteo.de/en` |
| `POSTEO_VALID_CREDENTIALS` | Set to `true` to enable the authenticated login and logout tests in CI |
| `TEST_USER_FULL_NAME` | Required by dashboard/profile specs |
| `TEST_USER_PHONE` | Required by dashboard/profile specs |

If tests fail with credential errors after adding secrets, re-enter them to rule out stale or incorrectly-typed values.

### Provider-side IP blocking

Posteo and some other providers may challenge or block requests originating from GitHub-hosted runner IP ranges. If credentials are verified correct but authenticated tests still fail only in CI, switch to a self-hosted runner for jobs that exercise authenticated flows:

```yaml
runs-on: self-hosted   # replace ubuntu-latest in the affected job
```

Self-hosted runners use your own network, which avoids cloud-runner IP blocks.

## Current focus

- Strengthen Playwright fundamentals with reliable E2E flows
- Exercise Posteo login and related webmail flows as the primary live-site target
- Keep test code maintainable through page objects and focused specs
- Prepare a clean structure for CI pipeline integration

## Roadmap

- Add broader regression coverage
- Integrate accessibility testing once core E2E flows are stable