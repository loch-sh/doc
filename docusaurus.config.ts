import {existsSync} from 'node:fs';
import {themes as prismThemes} from 'prism-react-renderer';
import type {Config} from '@docusaurus/types';
import type * as Preset from '@docusaurus/preset-classic';
import type {Options as DocsOptions} from '@docusaurus/plugin-content-docs';

// The CI (or a self-hosted build) sets the public URL.
const url = process.env.DOCS_URL ?? 'https://docs.loch.sh';
const baseUrl = process.env.DOCS_BASE_URL ?? '/';

// One docs instance per product, each versioned on its own releases.
// `release`: the docs describe exactly this release (default branch = tag), shown instead of "Next".
// `nav`: short name in the top menu.
const products: {id: string; label: string; nav: string; release?: string}[] = [
  {id: 'panel', label: 'Loch Panel', nav: 'Panel'},
  {id: 'cli', label: 'Loch CLI', nav: 'CLI'},
  {id: 's3', label: 'Loch S3', nav: 'S3', release: '1.4.1'},
  {id: 'lambda-runtime', label: 'Loch Lambda Runtime', nav: 'Lambda Runtime', release: '1.0.1'},
  {id: 'queue', label: 'Loch Queue Manager', nav: 'Queue', release: '1.0.1'},
  {id: 'deploy', label: 'Loch Deploy', nav: 'Deploy', release: '1.0.0'},
];

const docsInstance = ({id, release}: {id: string; release?: string}): [string, DocsOptions] => [
  '@docusaurus/plugin-content-docs',
  {
    id,
    path: `docs/${id}`,
    routeBasePath: id,
    sidebarPath: `./sidebars/${id}.ts`,
    editUrl: undefined,
    // Read from git history: CI only (needs a full clone), keeps local builds fast.
    showLastUpdateTime: Boolean(process.env.CI),
    versions: {
      // "Unreleased" banner only for "Next", once a version has been frozen.
      current: {
        label: release ?? 'Next',
        banner: !release && existsSync(`${id}_versions.json`) ? 'unreleased' : 'none',
      },
    },
  },
];

const config: Config = {
  title: 'Loch.sh Docs',
  tagline: 'Documentation for the Loch.sh infrastructure',
  favicon: 'img/favicon.ico',

  url,
  baseUrl,
  trailingSlash: true,

  onBrokenLinks: 'throw',
  onBrokenAnchors: 'throw',
  markdown: {
    hooks: {onBrokenMarkdownLinks: 'throw'},
  },

  i18n: {
    defaultLocale: 'en',
    locales: ['en', 'fr'],
    localeConfigs: {
      en: {label: 'English', htmlLang: 'en'},
      fr: {label: 'Français', htmlLang: 'fr'},
    },
  },

  presets: [
    [
      'classic',
      {
        docs: false,
        blog: false,
        theme: {customCss: './src/css/custom.css'},
      } satisfies Preset.Options,
    ],
  ],

  plugins: [
    ...products.map(docsInstance),
    'docusaurus-plugin-matomo',
    [
      'docusaurus-plugin-llms',
      {
        // Verbose, machine-readable layer (llms.txt, context7): English, current docs.
        docsDir: [
          {path: 'docs/panel', routeBasePath: 'panel', label: 'Loch Panel'},
          {path: 'docs/cli', routeBasePath: 'cli', label: 'Loch CLI'},
          {path: 'docs/s3', routeBasePath: 's3', label: 'Loch S3'},
          {path: 'docs/lambda-runtime', routeBasePath: 'lambda-runtime', label: 'Loch Lambda Runtime'},
          {path: 'docs/queue', routeBasePath: 'queue', label: 'Loch Queue Manager'},
          {path: 'docs/deploy', routeBasePath: 'deploy', label: 'Loch Deploy'},
        ],
        generateMarkdownFiles: true,
        excludeImports: true,
        removeDuplicateHeadings: true,
        logLevel: 'quiet',
      },
    ],
  ],

  themeConfig: {
    image: 'img/og.png',
    colorMode: {respectPrefersColorScheme: true},
    matomo: {
      matomoUrl: 'https://analytics.nitrique.net/',
      siteId: '43',
      phpLoader: 'matomo.php',
      jsLoader: 'matomo.js',
    },
    navbar: {
      title: 'Loch.sh',
      logo: {alt: 'Loch.sh', src: 'img/logo.svg'},
      items: [
        ...products.flatMap(({id, nav}) => [
          {
            type: 'docSidebar' as const,
            docsPluginId: id,
            sidebarId: id,
            position: 'left' as const,
            label: nav,
          },
        ]),
        // Version dropdown of the product being read (src/theme/NavbarItem).
        {type: 'custom-productVersionDropdown', position: 'right'},
        {type: 'localeDropdown', position: 'right'},
        {href: 'https://loch.sh', label: 'loch.sh', position: 'right'},
      ],
    },
    footer: {
      style: 'dark',
      links: [
        {
          title: 'Docs',
          items: [
            {label: 'Loch Panel', to: '/panel/'},
            {label: 'Loch CLI', to: '/cli/'},
            {label: 'Loch S3', to: '/s3/'},
            {label: 'Loch Lambda Runtime', to: '/lambda-runtime/'},
            {label: 'Loch Queue Manager', to: '/queue/'},
            {label: 'Loch Deploy', to: '/deploy/'},
          ],
        },
        {
          title: 'For AI assistants',
          items: [
            {label: 'llms.txt', href: `${url}${baseUrl}llms.txt`},
            {label: 'llms-full.txt', href: `${url}${baseUrl}llms-full.txt`},
          ],
        },
      ],
      copyright: `© ${new Date().getFullYear()} Loch.sh`,
    },
    prism: {
      theme: prismThemes.github,
      darkTheme: prismThemes.dracula,
      additionalLanguages: ['bash', 'toml', 'yaml', 'json', 'go'],
    },
  } satisfies Preset.ThemeConfig,
};

export default config;
