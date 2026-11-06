import type {ReactNode} from 'react';
import Link from '@docusaurus/Link';
import Translate, {translate} from '@docusaurus/Translate';
import Layout from '@theme/Layout';
import Heading from '@theme/Heading';
import styles from './index.module.css';

type Product = {to: string; title: string; description: ReactNode};

const products: Product[] = [
  {
    to: '/panel/',
    title: 'Loch Panel',
    description: (
      <Translate id="home.panel.description">
        Manage containers, websites and managed services from the web interface.
      </Translate>
    ),
  },
  {
    to: '/cli/',
    title: 'Loch CLI',
    description: (
      <Translate id="home.cli.description">
        Drive your servers from a terminal or connect an AI assistant (MCP).
      </Translate>
    ),
  },
  {
    to: '/s3/',
    title: 'Loch S3',
    description: (
      <Translate id="home.s3.description">
        Self-hosted S3-compatible object storage, in a single binary.
      </Translate>
    ),
  },
  {
    to: '/lambda-runtime/',
    title: 'Loch Lambda Runtime',
    description: (
      <Translate id="home.lambda-runtime.description">
        Run handlers written for AWS Lambda™ in plain Docker containers.
      </Translate>
    ),
  },
  {
    to: '/queue/',
    title: 'Loch Queue Manager',
    description: (
      <Translate id="home.queue.description">
        A Traefik plugin that puts visitors in a waiting room when traffic exceeds capacity.
      </Translate>
    ),
  },
  {
    to: '/deploy/',
    title: 'Loch Deploy',
    description: (
      <Translate id="home.deploy.description">
        Deploy Docker Compose stacks from GitLab CI without SSH, with short-lived OIDC tokens.
      </Translate>
    ),
  },
];

export default function Home(): ReactNode {
  return (
    <Layout
      title={translate({id: 'home.title', message: 'Documentation'})}
      description={translate({
        id: 'home.description',
        message: 'Documentation for the Loch.sh infrastructure',
      })}>
      <main className="container margin-vert--xl">
        <Heading as="h1">
          <Translate id="home.heading">Loch.sh documentation</Translate>
        </Heading>
        <div className={styles.grid}>
          {products.map(({to, title, description}) => (
            <Link key={to} to={to} className={styles.card}>
              <Heading as="h2">{title}</Heading>
              <p>{description}</p>
            </Link>
          ))}
        </div>
      </main>
    </Layout>
  );
}
