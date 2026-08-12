import styles from './JobFact.module.css';
import SnapshotFact, {SnapshotFactContent, SnapshotFactIcon} from './SnapshotFact';

export default function JobFact() {
  return (
    <SnapshotFact label="engineer at">
      <SnapshotFactIcon aria-hidden="true">
        <img className={styles.logo} src="/sentry.png" alt="" width="18" height="18" />
      </SnapshotFactIcon>
      <SnapshotFactContent>
        <a className={styles.link} href="https://sentry.io/">
          <strong>Sentry.io</strong>
        </a>
      </SnapshotFactContent>
    </SnapshotFact>
  );
}
