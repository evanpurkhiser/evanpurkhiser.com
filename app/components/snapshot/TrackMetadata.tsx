'use client';

import {useRef} from 'react';

import useIsOverflowing from '../../hooks/useIsOverflowing';

import styles from './ListeningToFact.module.css';
import {SnapshotFactContent} from './SnapshotFact';

type TrackMetadataProps = {
  artist: string;
  title: string;
};

export default function TrackMetadata({artist, title}: TrackMetadataProps) {
  const ref = useRef<HTMLSpanElement>(null);
  const isOverflowing = useIsOverflowing(ref);

  return (
    <SnapshotFactContent className={styles.metadata} ref={ref}>
      <strong>{title}</strong>
      <span className={`${styles.artist} ${isOverflowing ? styles.artistHidden : ''}`}>
        {' '}
        – {artist}
      </span>
    </SnapshotFactContent>
  );
}
