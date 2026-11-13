---
sidebar_position: 3
title: Testing
description: Run the Go tests, the engine integration tests, Vitest and the Playwright end-to-end tests of Loch Panel.
---

# Testing

Each project has its own test suites. The interface tests never need a running API: they use a mocked API.

## API

Run from `host-panel-api`:

| Command | What it runs |
|---|---|
| `make test` | Unit tests (`go test ./...`) |
| `make test-integration` | Integration tests (build tag `integration`): each service engine on its real images, and Docker exec. Needs Docker, takes a few minutes (timeout 20 min) |
| `make vet` / `make fmt` | Static analysis / formatting |

Add an integration test on real images for every new service engine.

## Interface

Run from `host-panel-interface`:

| Command | What it runs |
|---|---|
| `yarn typecheck` | Type-check of the app and the tests |
| `yarn lint` | ESLint |
| `yarn i18n:check` | Same keys, placeholders and tags in every language |
| `yarn test` | Unit and component tests (Vitest, jsdom). `yarn test:watch` for watch mode |
| `yarn test:e2e` | End-to-end tests (Playwright, Chromium) |

Before a merge request, run:

```bash
yarn lint && yarn i18n:check && yarn build
```

### Vitest

- Tests live next to the code: `src/**/*.test.ts(x)`.
- MSW serves the mocked API (`tests/setup/msw.ts`).
- `renderWithProviders` (`tests/setup/render.tsx`) mounts a component with React Query and a router.

### Playwright

- Tests live in `tests/e2e/*.spec.ts`.
- The app is built with `VITE_API_URL=http://api.test` into `dist-e2e/` and served by `vite preview` on port 4180.
- `page.route()` answers every request to `http://api.test` (`tests/e2e/fixtures.ts`). The WebSocket is accepted without a server. Requests to any other origin are refused.
- First run: `npx playwright install chromium`.
- On failure, the trace is in `test-results/`: `npx playwright show-trace <zip>`.

### The mocked API

Both suites share one in-memory mock of the API: `tests/mocks/api.ts`, with typed fixtures in `tests/mocks/fixtures.ts`.

A test **fails if the interface calls a route the mock does not serve**. When you add an API call to the interface, add the route to `tests/mocks/api.ts`, or override it in the test:

```ts
test("shows the API error", async ({ page, api }) => {
  api.on("POST", "/services/resources", {
    status: 409,
    body: { code: "RESOURCE_EXISTS" },
  });
  api.state.me = restrictedUser; // change the mocked state
  // ...
  expect(api.calls("POST", "/services/resources")[0].body).toEqual({ ... });
});
```

| Helper | Use |
|---|---|
| `api.state` | Change the mocked data for one test |
| `api.on(method, path, response)` | Override one route |
| `api.calls(method, path)` | Inspect the requests the interface sent |

## CLI

Run from `host-panel-cli`:

| Command | What it runs |
|---|---|
| `make test` | `go test ./...` |
| `make lint` | `go vet` and `golangci-lint` |

## Continuous integration

| Project | Jobs |
|---|---|
| API | `go test ./...` |
| Interface | `yarn lint`, `yarn typecheck`, `yarn i18n:check`, `yarn test`, `yarn build`; then `yarn test:e2e` |
| Repository | `secrets`: gitleaks on the whole history, on every pull request. Run it locally with `make secrets` (false positives: `.gitleaksignore`) |

## Good to know

- Integration test images come from `mirror.gcr.io`, like every other image.
- Playwright retries a failed test once in CI, never locally.
