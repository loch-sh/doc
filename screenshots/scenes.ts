import type {Page} from '@playwright/test';
import type {MockApi} from './.interface/tests/mocks/api';
import {restrictedUser} from './.interface/tests/mocks/fixtures';
import type {WsMock} from './fixtures';
import {demoContainers} from './demo';

/**
 * One scene = one screenshot, captured for each locale and color scheme as
 * static/img/screenshots/panel/next/<locale>/<id>-<light|dark>.png.
 * Use the id in a page: <Screenshot id="..." alt="..." />.
 */
export interface Scene {
  id: string;
  path: string;
  /** Prepare the mock state (API and WebSocket) before the page loads. */
  setup?: (api: MockApi, ws: WsMock) => void;
  /** Act on the page, then wait for the content to show. */
  ready?: (page: Page) => Promise<void>;
  /** Capture only this element. */
  locator?: string;
  /** Viewport of the scene (default 1440x900). */
  viewport?: {width: number; height: number};
  /** Wait before the capture, in ms (default 600). */
  settle?: number;
}

const now = Date.now();
const ago = (minutes: number) => new Date(now - minutes * 60_000).toISOString();

/** Expands a stack of the Containers page. */
async function expandStack(page: Page, stack: string) {
  await page.locator(`tr[data-row-key="${stack}"] button.ant-table-row-expand-icon`).click();
}

/** Opens the details panel of a container of an expanded stack. */
async function openDetails(page: Page, container: string) {
  await page
    .getByRole('row')
    .filter({has: page.getByRole('cell', {name: container, exact: true})})
    .last()
    .locator('button:has(.anticon-info-circle)')
    .click();
  await page.locator('.ant-drawer-body .ant-list').waitFor();
}

const LOG_LINES = [
  '[06-Nov-2026 09:12:01] NOTICE: fpm is running, pid 1',
  '[06-Nov-2026 09:12:01] NOTICE: ready to handle connections',
  '10.20.0.3 - 06/Nov/2026:09:14:22 +0100 "GET /index.php" 200',
  '10.20.0.3 - 06/Nov/2026:09:14:23 +0100 "GET /api/customers" 200',
  '10.20.0.3 - 06/Nov/2026:09:14:31 +0100 "POST /api/customers/1842/notes" 201',
  '[06-Nov-2026 09:15:02] WARNING: [pool www] seems busy (you may need to increase pm.start_servers)',
  '10.20.0.3 - 06/Nov/2026:09:15:07 +0100 "GET /api/invoices?page=2" 200',
  '10.20.0.3 - 06/Nov/2026:09:15:12 +0100 "GET /api/customers/1842" 200',
  '10.20.0.3 - 06/Nov/2026:09:16:40 +0100 "GET /index.php" 200',
];

const TERMINAL =
  '\x1b[32mapplication@crm-php\x1b[0m:\x1b[34m/app\x1b[0m$ php bin/console about | head -8\r\n' +
  ' -------------------- ---------------------------------\r\n' +
  '  Symfony                                               \r\n' +
  ' -------------------- ---------------------------------\r\n' +
  '  Version              7.3.4                            \r\n' +
  '  Environment          prod                             \r\n' +
  '  Debug                false                            \r\n' +
  ' -------------------- ---------------------------------\r\n' +
  '\x1b[32mapplication@crm-php\x1b[0m:\x1b[34m/app\x1b[0m$ ';

function mockLogsAndTerminal(ws: WsMock) {
  ws.on('logsStart', (_d, send) => send('logsData', LOG_LINES.join('\n') + '\n'));
  ws.on('attach', (_d, send) => {
    send('attach', null);
    send('stdout', TERMINAL);
  });
}

/** Live stats of the running containers: a short history for the sparklines. */
function mockStats(ws: WsMock) {
  ws.on('statsStart', (data, send) => {
    const ids = (data as {ids: string[]}).ids;
    const base: Record<string, [number, number, number]> = {
      'crm-web': [0.4, 24, 3],
      'crm-php': [6.5, 182, 12],
    };
    for (let i = 0; i < 20; i++) {
      send(
        'statsData',
        ids.map((id) => {
          const c = demoContainers.find((x) => x.Id === id)!;
          const key = c.Names[0].slice(1).replace(/-1$/, '');
          const [cpu, mem, pids] = base[key] ?? [1, 64, 4];
          const wave = 1 + 0.35 * Math.sin(i / 2 + cpu);
          const memUsage = (mem + 6 * Math.sin(i / 3)) * 1024 ** 2;
          return {
            id,
            name: c.Names[0].slice(1),
            cpuPct: +(cpu * wave).toFixed(2),
            memUsage,
            memLimit: 512 * 1024 ** 2,
            memPct: (memUsage / (512 * 1024 ** 2)) * 100,
            netRx: (mem * 0.9 + i * 3.5) * 1024 ** 2,
            netTx: (mem * 0.4 + i * 1.2) * 1024 ** 2,
            pids,
          };
        }),
      );
    }
  });
}

const audit = (id: number, minutes: number, level: string, event: string, user: string | undefined, fields: Record<string, unknown>) => ({
  id,
  time: ago(minutes),
  level,
  event,
  user,
  fields,
});

const auditEntries = [
  audit(9, 3, 'INFO', 'container action', 'ada@example.com', {action: 'restart', container: 'crm-worker-1'}),
  audit(8, 9, 'WARN', 'access denied', 'remi@example.com', {method: 'POST', path: '/docker/monitoring-grafana-1/stop'}),
  audit(7, 14, 'INFO', 'user logged in', 'remi@example.com', {ip: '10.8.0.27'}),
  audit(6, 42, 'INFO', 'hosting stack updated', 'ada@example.com', {stack: 'shop', operation: 'op-7f3c'}),
  audit(5, 44, 'INFO', 'hosting operation finished', 'ada@example.com', {stack: 'shop', kind: 'update', state: 'succeeded'}),
  audit(4, 95, 'ERROR', 'cron job failed', undefined, {job: 'Shop health check', error: '503 Service Unavailable'}),
  audit(3, 130, 'INFO', 'api key created', 'lin@example.com', {name: 'GitLab CI deploy', expires: '180 days'}),
  audit(2, 182, 'WARN', 'login failed', undefined, {reason: 'state mismatch', ip: '10.8.0.40'}),
  audit(1, 190, 'INFO', 'user logged in', 'ada@example.com', {ip: '10.8.0.12'}),
];

const COMPOSE_FAILED = `[+] Pulling 1/1
 ✔ web Pulled                                                         1.2s
[+] Running 1/1
 ✘ Container hosted-shop-web-1  Error                                 4.1s
Error response from daemon: failed to create task for container: failed to create shim task:
OCI runtime create failed: runc create failed: unable to start container process:
error during container init: error mounting "/data/websites/hosted/shop/php.ini" to rootfs at
"/opt/docker/etc/php/php.ini": not a directory
[+] Restoring the previous configuration
[+] Running 1/1
 ✔ Container hosted-shop-web-1  Started                               1.8s`;

export const scenes: Scene[] = [
  {id: 'home', path: '/', settle: 2500},
  {
    id: 'home-user',
    path: '/',
    settle: 2500,
    setup: (api) => {
      api.state.me = {...restrictedUser, permissions: ['crm-web-1', 'crm-php-1', 'crm-worker-1']};
      api.on('GET', '/docker', {
        status: 200,
        body: demoContainers.filter((c) => c.Names[0].startsWith('/crm-')),
      });
    },
  },
  {
    id: 'containers-list',
    path: '/containers',
    ready: (page) => expandStack(page, 'crm'),
  },
  {
    id: 'stack-actions',
    path: '/containers',
    locator: '.ant-table-wrapper',
  },
  {
    id: 'stack-monitoring',
    path: '/containers',
    setup: (_api, ws) => mockStats(ws),
    ready: async (page) => {
      await expandStack(page, 'crm');
      await page.getByRole('button', {name: 'Monitoring'}).click();
    },
  },
  {
    id: 'container-details',
    path: '/containers',
    viewport: {width: 1440, height: 1100},
    setup: (_api, ws) => mockLogsAndTerminal(ws),
    ready: async (page) => {
      await expandStack(page, 'crm');
      await openDetails(page, 'php-1');
      await page.getByRole('button', {name: /Console only|Console uniquement/}).click();
      await page.getByRole('button', {name: /Show logs|Afficher les logs/}).click();
      await page.getByRole('button', {name: /Open a terminal|Ouvrir un terminal/}).click();
      await page.locator('.xterm-rows').nth(1).waitFor();
    },
    settle: 1200,
  },
  {
    id: 'cron-list',
    path: '/cron',
    viewport: {width: 1760, height: 900},
    ready: (page) => page.locator('tr[data-row-key="c1"] button.ant-table-row-expand-icon').click(),
  },
  {
    id: 'cron-form',
    path: '/cron',
    ready: async (page) => {
      await page.getByRole('button', {name: /New task|Nouvelle tâche/}).click();
      await page.locator('#name').fill('Clear the CRM cache');
      await page.locator('#schedule').fill('0 3 * * *');
      await page.locator('#containerName').click();
      await page.locator('.ant-select-item-option', {hasText: 'crm-php-1'}).click();
      await page.locator('#command').fill('php bin/console cache:clear');
      await page.locator('#workingDir').fill('/app');
    },
  },
  {id: 'apikeys-list', path: '/api-keys', viewport: {width: 1680, height: 900}},
  {
    id: 'apikey-created',
    path: '/api-keys',
    locator: '.ant-modal-container >> visible=true',
    ready: async (page) => {
      await page.getByRole('button', {name: /New key|Nouvelle clé/}).click();
      await page.locator('#name').fill('CLI MacBook Pro');
      await page.locator('.ant-modal-footer .ant-btn-primary').click();
      await page.getByRole('dialog', {name: /API key created|Clé API créée/}).waitFor();
    },
  },
  {id: 'admin-users-list', path: '/users'},
  {
    id: 'admin-users-grant',
    path: '/users',
    ready: async (page) => {
      await page.locator('tr', {hasText: 'remi@example.com'}).locator('button:has(.anticon-edit)').click();
      await page.locator('.ant-transfer').waitFor();
    },
  },
  {
    id: 'admin-audit-trail',
    path: '/security/audit',
    viewport: {width: 1680, height: 900},
    setup: (api) => api.on('GET', '/audit', {status: 200, body: {entries: auditEntries}}),
  },
  {
    id: 'sftp-sites-list',
    path: '/sftp',
    ready: (page) => page.locator('tr[data-row-key="shop"] button.ant-table-row-expand-icon').click(),
  },
  {id: 'hosting-list', path: '/hosting'},
  {id: 'hosting-create-type', path: '/hosting/new'},
  {
    id: 'hosting-create',
    path: '/hosting/new',
    ready: async (page) => {
      await page.getByRole('button', {name: /Next|Suivant/}).click();
    },
  },
  {
    id: 'hosting-last-operation-failed',
    path: '/hosting/shop',
    setup: (api) => {
      const shop = api.state.stacks.find((s) => s.name === 'shop')!;
      shop.operation = {
        id: 'op-7f3c',
        kind: 'update',
        state: 'failed',
        error: 'HOSTING_UPDATE_FAILED',
        rolledBack: true,
        output: COMPOSE_FAILED,
        startedAt: ago(12),
        finishedAt: new Date(now - 12 * 60_000 + 23_000).toISOString(),
      };
    },
    ready: (page) => page.getByRole('tab', {name: /Last operation|Dernière opération/}).click(),
  },
  {id: 'networks-list', path: '/networks'},
  {
    id: 'networks-create',
    path: '/networks/new',
    viewport: {width: 1440, height: 1300},
    ready: async (page) => {
      await page.locator('#name').fill('crm');
      await page.locator('#description').fill('Shop and blog backends');
      await page.getByRole('combobox').last().click();
      await page.locator('.ant-select-item-option').first().click();
      await page.locator('.ant-select-item-option').nth(1).click();
      await page.keyboard.press('Escape');
    },
  },
  {
    id: 'networks-detail',
    path: '/networks/backend',
    setup: (api) => {
      const net = api.state.networks.find((n) => n.name === 'backend')!;
      net.description = 'Shop and its cache';
      net.members = [
        {
          kind: 'site',
          name: 'shop',
          container: 'hosted-shop-web-1',
          containerId: 'aa23456789ab',
          state: 'running',
          ipv4: '10.20.0.3',
          mac: '02:42:0a:14:00:03',
          expected: true,
          present: true,
        },
        net.members.find((m) => m.kind === 'instance')!,
      ];
    },
  },
  {id: 'databases-postgres', path: '/databases/postgres'},
  {
    id: 'services-create-redis',
    path: '/services/redis/new',
    setup: (api) => {
      const redis = api.state.servicesConfig.engines!.find((e) => e.id === 'redis')!;
      redis.versions = [
        {...redis.versions[0], version: '8.6', image: 'mirror.gcr.io/library/redis:8.6-alpine', supportUntil: '2029-05-31'},
        {...redis.versions[0], supportUntil: '2027-05-31'},
      ];
    },
    ready: async (page) => {
      await page.locator('#name').fill('sessions');
    },
  },
  {
    id: 'services-credentials',
    path: '/services/postgres/new',
    locator: '.ant-modal-container >> visible=true',
    setup: (api) =>
      api.on('POST', '/services/resources', {
        status: 201,
        body: {
          resource: {instance: 'postgres-17', engine: 'postgres', version: '17', name: 'crm', managed: true, host: 'svc-postgres-17', port: 5432},
          credentials: [
            {key: 'host', value: 'svc-postgres-17'},
            {key: 'port', value: '5432'},
            {key: 'database', value: 'crm'},
            {key: 'user', value: 'crm'},
            {key: 'password', value: 'Xk7pQ2vR9mWb4TzL8nHc3JfY6sDg1AeU', secret: true},
            {
              key: 'uri',
              value: 'postgresql://crm:Xk7pQ2vR9mWb4TzL8nHc3JfY6sDg1AeU@svc-postgres-17:5432/crm',
              secret: true,
            },
          ],
          instanceCreated: false,
        },
      }),
    ready: async (page) => {
      await page.locator('#name').fill('crm');
      await page.getByRole('button', {name: /^(Create|Créer)$/}).first().click();
      await page.locator('.ant-modal-container >> visible=true').waitFor();
    },
  },
];
