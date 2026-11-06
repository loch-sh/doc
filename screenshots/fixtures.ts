/**
 * Every API request is answered by the interface's in-memory MockApi, plus the
 * demo data of the docs (demo.ts). The WebSocket (logs, terminal, stats) is
 * answered by the scene's handlers (WsMock). Nothing leaves the browser.
 */
import {test as base} from '@playwright/test';
import {createMockApi, type MockApi} from './.interface/tests/mocks/api';
import {withDemoData} from './demo';

/** The API address shown in the pages (the docs' example address). */
export const API_URL = 'https://panel-api.example.com';
export const WS_URL = 'wss://panel-api.example.com';

type Send = (event: string, data: unknown) => void;

/** Answers of the mocked WebSocket, by event received from the page. */
export class WsMock {
  private readonly handlers = new Map<string, (data: unknown, send: Send) => void>();

  on(event: string, handler: (data: unknown, send: Send) => void): this {
    this.handlers.set(event, handler);
    return this;
  }

  handle(event: string, data: unknown, send: Send): void {
    this.handlers.get(event)?.(data, send);
  }
}

export const test = base.extend<{api: MockApi; ws: WsMock}>({
  ws: async ({}, use) => {
    await use(new WsMock());
  },
  api: [
    async ({page, baseURL, ws}, use) => {
      const api = withDemoData(createMockApi());
      const appOrigin = new URL(baseURL!).origin;
      await page.route('**/*', (route) =>
        new URL(route.request().url()).origin === appOrigin
          ? route.fallback()
          : route.abort('blockedbyclient'),
      );
      // Runtime configuration of the interface (normally written by its Docker entrypoint).
      await page.route(`${appOrigin}/config.js`, (route) =>
        route.fulfill({
          contentType: 'application/javascript',
          body: `window.__APP_CONFIG__ = ${JSON.stringify({apiUrl: API_URL, wsUrl: WS_URL})};`,
        }),
      );
      await page.route(`${API_URL}/**`, async (route) => {
        const request = route.request();
        const url = new URL(request.url());
        const raw = request.postData();
        let body: unknown = raw ?? undefined;
        try {
          body = raw ? JSON.parse(raw) : undefined;
        } catch {
          // keep the raw body
        }
        const res = api.handle({method: request.method(), path: url.pathname, query: url.searchParams, body});
        await route.fulfill({
          status: res.status,
          contentType: res.contentType ?? 'application/json',
          body: res.text ?? (res.body === undefined ? '' : JSON.stringify(res.body)),
          headers: {'Access-Control-Allow-Origin': appOrigin, 'Access-Control-Allow-Credentials': 'true'},
        });
      });
      await page.routeWebSocket(new RegExp(`^${WS_URL}`), (socket) => {
        const send: Send = (event, data) => socket.send(JSON.stringify({event, data}));
        socket.onMessage((message) => {
          try {
            const {event, data} = JSON.parse(String(message)) as {event: string; data: unknown};
            ws.handle(event, data, send);
          } catch {
            // not a JSON message
          }
        });
      });
      await use(api);
    },
    {auto: true},
  ],
});
