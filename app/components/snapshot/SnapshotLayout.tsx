import {useId, type ReactNode} from 'react';

import styles from './SnapshotLayout.module.css';

export default function SnapshotLayout({children}: {children: ReactNode}) {
  const titleId = useId();

  return (
    <section className={styles.section} aria-labelledby={titleId}>
      <h2 id={titleId} className={styles.heading}>
        Snapshot
      </h2>
      <dl className={styles.facts}>{children}</dl>
    </section>
  );
}
