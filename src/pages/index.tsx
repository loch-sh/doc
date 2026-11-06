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
    title: 'loch CLI',
    description: (
      <Translate id="home.cli.description">
        Drive your servers from a terminal or connect an AI assistant (MCP).
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
