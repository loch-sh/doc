import {existsSync} from 'node:fs';
import {themes as prismThemes} from 'prism-react-renderer';
import type {Config} from '@docusaurus/types';
import type * as Preset from '@docusaurus/preset-classic';
import type {Options as DocsOptions} from '@docusaurus/plugin-content-docs';

// The CI (or a self-hosted build) sets the public URL.
const url = process.env.DOCS_URL ?? 'https://docs.loch.sh';
const baseUrl = process.env.DOCS_BASE_URL ?? '/';

// One docs instance per product, each versioned on its own releases.
const products: {id: string; label: string}[] = [
  {id: 'panel', label: 'Loch Panel'},
  {id: 'cli', label: 'loch CLI'},
];

const docsInstance = (id: string): [string, DocsOptions] => [
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
      // "Unreleased" banner only once a version has been frozen.
      current: {label: 'Next', banner: existsSync(`${id}_versions.json`) ? 'unreleased' : 'none'},
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
    ...products.map(({id}) => docsInstance(id)),
    [
      'docusaurus-plugin-llms',
      {
        // Verbose, machine-readable layer (llms.txt, context7): English, current docs.
        docsDir: [
          {path: 'docs/panel', routeBasePath: 'panel', label: 'Loch Panel'},
          {path: 'docs/cli', routeBasePath: 'cli', label: 'loch CLI'},
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
    navbar: {
      title: 'Loch.sh',
      logo: {alt: 'Loch.sh', src: 'img/logo.svg'},
      items: [
        ...products.flatMap(({id, label}) => [
          {
            type: 'docSidebar' as const,
            docsPluginId: id,
            sidebarId: id,
            position: 'left' as const,
            label,
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
            {label: 'loch CLI', to: '/cli/'},
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
