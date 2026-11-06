import type {ReactNode} from 'react';
import useBaseUrl from '@docusaurus/useBaseUrl';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import {useDocsVersion} from '@docusaurus/plugin-content-docs/client';
import ThemedImage from '@theme/ThemedImage';
import styles from './Screenshot.module.css';

type Props = {
  /** Scene id from screenshots/scenes.ts */
  id: string;
  alt: string;
  caption?: ReactNode;
};

/**
 * A panel screenshot in the reader's language and color scheme, for the docs
 * version being read: static/img/screenshots/panel/<version>/<locale>/<id>-<light|dark>.png
 * ("next" for the current docs).
 */
export default function Screenshot({id, alt, caption}: Props): ReactNode {
  const {i18n} = useDocusaurusContext();
  const {version} = useDocsVersion();
  const folder = version === 'current' ? 'next' : version;
  const base = `/img/screenshots/panel/${folder}/${i18n.currentLocale}/${id}`;
  const light = useBaseUrl(`${base}-light.png`);
  const dark = useBaseUrl(`${base}-dark.png`);
  return (
    <figure className={styles.figure}>
      <ThemedImage alt={alt} sources={{light, dark}} className={styles.image} loading="lazy" />
      {caption && <figcaption className={styles.caption}>{caption}</figcaption>}
    </figure>
  );
}
