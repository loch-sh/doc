/**
 * Demo data shown in the screenshots, on top of the interface's mock fixtures.
 * Everything is invented: example.com domains, private addresses only.
 */
import type {MockApi} from './.interface/tests/mocks/api';
import {hostingStack} from './.interface/tests/mocks/fixtures';

const now = Date.now();
const DAY = 86_400_000;
const iso = (offsetMs: number) => new Date(now + offsetMs).toISOString();
const created = Math.floor((now - 3 * DAY) / 1000);

const COMPOSE = 'com.docker.compose.project';

type Labels = Record<string, string>;

const container = (
  stack: string,
  service: string,
  image: string,
  {state = 'running', status, labels = {}}: {state?: string; status?: string; labels?: Labels} = {},
) => ({
  Id: Buffer.from(`${stack}-${service}`).toString('hex').padEnd(64, '0').slice(0, 64),
  Names: [`/${stack}-${service}-1`],
  Image: image,
  ImageID: '',
  Command: '',
  Created: created,
  State: state,
  Status: status ?? (state === 'running' ? 'Up 3 days' : 'Exited (0) 2 hours ago'),
  Ports: [],
  Labels: {[COMPOSE]: stack, 'com.docker.compose.service': service, ...labels},
  HostConfig: {NetworkMode: `${stack}_default`},
  NetworkSettings: {Networks: {}},
  Mounts: [],
});

const hosted = {'sh.loch.managed': 'true'};
const service = (engine: string, instance: string) => ({'sh.loch.service': engine, 'sh.loch.instance': instance});

export const demoContainers = [
  container('hosted-shop', 'web', 'mirror.gcr.io/webdevops/php-nginx:8.4', {labels: hosted}),
  container('hosted-blog', 'web', 'mirror.gcr.io/webdevops/php-apache:8.3', {labels: hosted}),
  container('hosted-docs', 'web', 'mirror.gcr.io/library/nginx:1.29-alpine', {labels: hosted}),
  container('crm', 'web', 'mirror.gcr.io/library/nginx:1.29-alpine'),
  container('crm', 'php', 'mirror.gcr.io/webdevops/php-fpm:8.4'),
  container('crm', 'worker', 'mirror.gcr.io/webdevops/php:8.4', {
    state: 'exited',
    status: 'Exited (1) 2 hours ago',
  }),
  container('monitoring', 'grafana', 'mirror.gcr.io/grafana/grafana:12.2.0'),
  container('monitoring', 'prometheus', 'mirror.gcr.io/prom/prometheus:v3.6.0'),
  container('svc-postgres-17', 'postgres', 'mirror.gcr.io/library/postgres:17', {
    labels: service('postgres', 'postgres-17'),
  }),
  container('svc-redis-cache', 'redis', 'mirror.gcr.io/library/redis:8.4-alpine', {
    labels: service('redis', 'redis-cache'),
  }),
];

export const containerId = (name: string) => demoContainers.find((c) => c.Names[0] === `/${name}`)!.Id;

/** GET /docker/:id (Docker inspect). */
function inspect(id: string) {
  const c = demoContainers.find((x) => x.Id === id || x.Id.startsWith(id));
  if (!c) return undefined;
  const running = c.State === 'running';
  return {
    Id: c.Id,
    Name: c.Names[0],
    Created: new Date(c.Created * 1000).toISOString(),
    Image: 'sha256:4f2a9c1e7b3d8a6f5e0c2b9d7a1e3f6c8b0d2e4f6a8c0e2b4d6f8a0c2e4b6d8f',
    RestartCount: 0,
    HostsPath: `/var/lib/docker/containers/${c.Id}/hosts`,
    LogPath: `/var/lib/docker/containers/${c.Id}/${c.Id}-json.log`,
    State: {
      Status: c.State,
      Running: running,
      Paused: false,
      Restarting: false,
      ExitCode: running ? 0 : 1,
      StartedAt: new Date(c.Created * 1000).toISOString(),
      FinishedAt: '0001-01-01T00:00:00Z',
    },
    Config: {Image: c.Image, Labels: c.Labels, Tty: true, Env: []},
    NetworkSettings: {Ports: {'80/tcp': null}, Networks: {}},
    Mounts: [
      {Type: 'bind', Source: '/data/crm/app', Destination: '/app', Mode: 'rw', RW: true},
      {Type: 'volume', Name: 'crm_sessions', Source: '/var/lib/docker/volumes/crm_sessions/_data', Destination: '/var/lib/php/sessions', RW: true},
    ],
  };
}

const router = (name: string, domains: string[], serviceName: string) => ({
  name,
  rule: domains.map((d) => `Host(\`${d}\`)`).join(' || '),
  domains,
  entrypoints: ['websecure'],
  tls: true,
  certResolver: 'letsencrypt',
  serviceName,
});

const domainEntry = (name: string, image: string, domains: string[]) => ({
  containerId: demoContainers.find((c) => c.Names[0] === `/${name}`)?.Id ?? '',
  containerName: name,
  containerState: 'running',
  containerImage: image,
  traefikEnabled: true,
  routers: [router(name, domains, name)],
  services: [{name, port: 80}],
});

export const demoDomains = [
  domainEntry('hosted-shop-web-1', 'mirror.gcr.io/webdevops/php-nginx:8.4', ['shop.example.com', 'www.shop.example.com']),
  domainEntry('hosted-blog-web-1', 'mirror.gcr.io/webdevops/php-apache:8.3', ['blog.example.com']),
  domainEntry('hosted-docs-web-1', 'mirror.gcr.io/library/nginx:1.29-alpine', ['docs.example.com']),
  domainEntry('crm-web-1', 'mirror.gcr.io/library/nginx:1.29-alpine', ['crm.example.com']),
  domainEntry('monitoring-grafana-1', 'mirror.gcr.io/grafana/grafana:12.2.0', ['grafana.example.com']),
];

export const demoStacks = () => [
  {...hostingStack('shop'), domains: ['shop.example.com', 'www.shop.example.com']},
  {
    ...hostingStack('blog'),
    template: 'php-apache' as const,
    phpVersion: '8.3',
    image: 'mirror.gcr.io/webdevops/php-apache:8.3',
  },
  {
    ...hostingStack('docs'),
    template: 'nginx' as const,
    phpVersion: undefined,
    image: 'mirror.gcr.io/library/nginx:1.29-alpine',
  },
];

export const demoUsers = [
  {name: 'Ada Admin', email: 'ada@example.com', profile: 'admin', permissions: []},
  {name: 'Lin Ops', email: 'lin@example.com', profile: 'admin', permissions: []},
  {
    name: 'Rémi Restricted',
    email: 'remi@example.com',
    profile: 'restricted',
    permissions: ['crm-web-1', 'crm-php-1'],
  },
  {name: 'Sam Newcomer', email: 'sam@example.com', profile: 'restricted', permissions: []},
];

export const demoCronJobs = () => [
  {
    id: 'c1',
    name: 'Clear the CRM cache',
    schedule: '0 3 * * *',
    type: 'docker_exec',
    enabled: true,
    once: false,
    dockerExec: {containerName: 'crm-php-1', command: ['php', 'bin/console', 'cache:clear'], workingDir: '/app'},
    lastRun: iso(-7 * 3600_000),
    lastStatus: 'success',
    lastOutput:
      '// Clearing the cache for the prod environment with debug false\n\n [OK] Cache for the "prod" environment (debug=false) was successfully cleared.',
    createdAt: iso(-30 * DAY),
    updatedAt: iso(-30 * DAY),
  },
  {
    id: 'c2',
    name: 'Restart the CRM worker',
    schedule: '30 4 * * 1',
    type: 'docker_action',
    enabled: true,
    once: false,
    dockerAction: {containerName: 'crm-worker-1', action: 'restart'},
    lastRun: iso(-3 * DAY),
    lastStatus: 'success',
    createdAt: iso(-30 * DAY),
    updatedAt: iso(-30 * DAY),
  },
  {
    id: 'c3',
    name: 'Shop health check',
    schedule: '*/15 * * * *',
    type: 'http',
    enabled: true,
    once: false,
    http: {method: 'GET', url: 'https://shop.example.com/health', timeout: 10},
    lastRun: iso(-6 * 60_000),
    lastStatus: 'error',
    lastError: 'GET https://shop.example.com/health: 503 Service Unavailable',
    createdAt: iso(-12 * DAY),
    updatedAt: iso(-12 * DAY),
  },
  {
    id: 'c4',
    name: 'Import the product catalog',
    schedule: '0 22 * * *',
    type: 'docker_exec',
    enabled: true,
    once: true,
    dockerExec: {containerName: 'crm-php-1', command: ['php', 'bin/console', 'app:import-catalog']},
    lastStatus: 'pending',
    createdAt: iso(-1 * DAY),
    updatedAt: iso(-1 * DAY),
  },
  {
    id: 'c5',
    name: 'Stop Grafana at night',
    schedule: '0 23 * * *',
    type: 'docker_action',
    enabled: false,
    once: false,
    dockerAction: {containerName: 'monitoring-grafana-1', action: 'stop'},
    lastRun: iso(-20 * DAY),
    lastStatus: 'success',
    createdAt: iso(-60 * DAY),
    updatedAt: iso(-20 * DAY),
  },
];

export const demoApiKeys = () => [
  {
    id: 'k1',
    name: 'CLI MacBook Pro',
    keyPrefix: 'lk_8f3a2c',
    scopes: ['*'],
    expiresAt: iso(62 * DAY),
    createdAt: iso(-28 * DAY),
    lastUsedAt: iso(-2 * 3600_000),
  },
  {
    id: 'k2',
    name: 'GitLab CI deploy',
    keyPrefix: 'lk_1d9e47',
    scopes: ['containers:read', 'containers:actions'],
    expiresAt: iso(170 * DAY),
    createdAt: iso(-15 * DAY),
    lastUsedAt: iso(-26 * 3600_000),
  },
  {
    id: 'k3',
    name: 'Monitoring script',
    keyPrefix: 'lk_b72f05',
    scopes: ['containers:read', 'containers:logs', 'containers:stats'],
    expiresAt: iso(-4 * DAY),
    createdAt: iso(-94 * DAY),
    lastUsedAt: iso(-5 * DAY),
  },
];

export const DEMO_TOKEN = 'lk_5c0e91_Zq7vN2xR8pLk4TfW1mYb6HdJ3sGa9UcE';

export const sftpConfig = {
  enabled: true,
  directory: '/data/websites',
  domain: 'sftp.example.com',
  port: '2022',
  webUserInterface: 'https://sftp.example.com/web/client',
  initDirs: ['web', 'logs'],
};

const sftpUser = (username: string, site: string, extra: Record<string, unknown> = {}) => ({
  username,
  email: `${username.split('-')[0]}@example.com`,
  site,
  subPath: '',
  homeDir: `/data/websites/hosted/${site}`,
  status: 1,
  quotaSize: 5 * 1024 ** 3,
  quotaFiles: 0,
  uploadBandwidth: 0,
  downloadBandwidth: 0,
  usedQuotaSize: 1.2 * 1024 ** 3,
  usedQuotaFiles: 18_342,
  requirePasswordChange: false,
  lastLogin: now - 2 * DAY,
  createdAt: now - 40 * DAY,
  publicKeys: [],
  ...extra,
});

export const sftpUsers = [
  sftpUser('shop-deploy', 'shop', {publicKeys: ['ssh-ed25519 AAAAC3NzaC1lZDI1NTE5AAAAIFakeKeyForDocs deploy@example.com']}),
  sftpUser('shop-agency', 'shop', {
    subPath: 'web/media',
    homeDir: '/data/websites/hosted/shop/web/media',
    quotaSize: 1024 ** 3,
    usedQuotaSize: 312 * 1024 ** 2,
    usedQuotaFiles: 2_140,
    lastLogin: now - 6 * 3600_000,
  }),
  sftpUser('blog-editor', 'blog', {usedQuotaSize: 420 * 1024 ** 2, usedQuotaFiles: 5_812, requirePasswordChange: true, lastLogin: 0}),
];

export const sftpSites = [
  {name: 'blog', homeDir: '/data/websites/hosted/blog', userCount: 1, totalUsedQuotaSize: 420 * 1024 ** 2},
  {name: 'docs', homeDir: '/data/websites/hosted/docs', userCount: 0, totalUsedQuotaSize: 0},
  {name: 'shop', homeDir: '/data/websites/hosted/shop', userCount: 2, totalUsedQuotaSize: 1.5 * 1024 ** 3},
];

export function withDemoData(api: MockApi): MockApi {
  api.state.stacks = demoStacks();
  return api
    .on('GET', '/docker', {status: 200, body: demoContainers})
    .on('GET', '/docker/:id', (_req, p) => {
      const body = inspect(p.id);
      return body ? {status: 200, body} : {status: 404, body: {code: 'NOT_FOUND', error: ''}};
    })
    .on('GET', '/domains', {status: 200, body: demoDomains})
    .on('GET', '/hosting/sites', {
      status: 200,
      body: api.state.stacks.map((s) => ({name: s.name, stack: s.name})),
    })
    .on('GET', '/users', {status: 200, body: demoUsers})
    .on('GET', '/cron', {status: 200, body: demoCronJobs()})
    .on('GET', '/users/me/api-keys', {status: 200, body: demoApiKeys()})
    .on('POST', '/users/me/api-keys', (req) => {
      const body = req.body as {name: string; scopes: string[]; expiresInDays: number};
      return {
        status: 201,
        body: {id: 'k4', name: body.name, token: DEMO_TOKEN, scopes: body.scopes, expiresAt: iso(body.expiresInDays * DAY)},
      };
    })
    .on('GET', '/sftp/config', {status: 200, body: sftpConfig})
    .on('GET', '/sftp/sites', {status: 200, body: sftpSites})
    .on('GET', '/sftp/users', {status: 200, body: sftpUsers});
}
