---
sidebar_position: 3
title: Tests
description: Lancez les tests Go, les tests d'intégration des moteurs, Vitest et les tests de bout en bout Playwright de Loch Panel.
---

# Tests

Chaque projet a ses propres suites de tests. Les tests de l'interface n'ont jamais besoin d'une API en marche : ils utilisent une API simulée.

## API

À lancer depuis `host-panel-api` :

| Commande | Ce qu'elle lance |
|---|---|
| `make test` | Tests unitaires (`go test ./...`) |
| `make test-integration` | Tests d'intégration (build tag `integration`) : chaque moteur de services sur ses vraies images, et l'exec Docker. Nécessite Docker, dure quelques minutes (délai maximal 20 min) |
| `make vet` / `make fmt` | Analyse statique / formatage |

Ajoutez un test d'intégration sur les vraies images pour chaque nouveau moteur de services.

## Interface

À lancer depuis `host-panel-interface` :

| Commande | Ce qu'elle lance |
|---|---|
| `yarn typecheck` | Vérification des types de l'application et des tests |
| `yarn lint` | ESLint |
| `yarn i18n:check` | Mêmes clés, variables et balises dans toutes les langues |
| `yarn test` | Tests unitaires et de composants (Vitest, jsdom). `yarn test:watch` en mode surveillance |
| `yarn test:e2e` | Tests de bout en bout (Playwright, Chromium) |

Avant une merge request, lancez :

```bash
yarn lint && yarn i18n:check && yarn build
```

### Vitest

- Les tests sont à côté du code : `src/**/*.test.ts(x)`.
- MSW sert l'API simulée (`tests/setup/msw.ts`).
- `renderWithProviders` (`tests/setup/render.tsx`) monte un composant avec React Query et un routeur.

### Playwright

- Les tests sont dans `tests/e2e/*.spec.ts`.
- L'application est compilée avec `VITE_API_URL=http://api.test` dans `dist-e2e/` et servie par `vite preview` sur le port 4180.
- `page.route()` répond à chaque requête vers `http://api.test` (`tests/e2e/fixtures.ts`). Le WebSocket est accepté sans serveur. Les requêtes vers toute autre origine sont refusées.
- Premier lancement : `npx playwright install chromium`.
- En cas d'échec, la trace est dans `test-results/` : `npx playwright show-trace <zip>`.

### L'API simulée

Les deux suites partagent une même simulation de l'API en mémoire : `tests/mocks/api.ts`, avec des données typées dans `tests/mocks/fixtures.ts`.

Un test **échoue si l'interface appelle une route que la simulation ne sert pas**. Quand vous ajoutez un appel à l'API dans l'interface, ajoutez la route dans `tests/mocks/api.ts`, ou surchargez-la dans le test :

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

| Outil | Usage |
|---|---|
| `api.state` | Modifier les données simulées pour un test |
| `api.on(method, path, response)` | Surcharger une route |
| `api.calls(method, path)` | Inspecter les requêtes envoyées par l'interface |

## CLI

À lancer depuis `host-panel-cli` :

| Commande | Ce qu'elle lance |
|---|---|
| `make test` | `go test ./...` |
| `make lint` | `go vet` et `golangci-lint` |

## Intégration continue

| Projet | Jobs |
|---|---|
| API | `go test ./...` |
| Interface | `yarn lint`, `yarn typecheck`, `yarn i18n:check`, `yarn test`, `yarn build` ; puis `yarn test:e2e` |

## Bon à savoir

- Les images des tests d'intégration viennent de `mirror.gcr.io`, comme toutes les autres.
- Playwright relance une fois un test en échec en CI, jamais en local.
