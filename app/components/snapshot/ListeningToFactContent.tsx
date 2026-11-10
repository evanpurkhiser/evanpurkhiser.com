'use client';

import {useQuery} from '@tanstack/react-query';
import {motion, type Variants} from 'framer-motion';

import useCurrentTime from '../../hooks/useCurrentTime';
import {recentlyListenedQueryOptions} from '../../lib/recentlyListenedQuery';
import type {RecentlyListenedTrack} from '../../lib/soundcloud/types';

import styles from './ListeningToFact.module.css';
import ListeningToFactInteraction, {
  HISTORY_EXIT_STAGGER_SECONDS,
} from './ListeningToFactInteraction';
import SnapshotFact, {SnapshotFactContent, SnapshotFactIcon} from './SnapshotFact';
import TrackMetadata from './TrackMetadata';

const relativeTime = new Intl.RelativeTimeFormat('en', {
  numeric: 'always',
  style: 'long',
});
const newYorkDateTime = new Intl.DateTimeFormat('en', {
  dateStyle: 'full',
  timeStyle: 'long',
  timeZone: 'America/New_York',
});
const primaryTimestampVariants: Variants = {
  entering: {opacity: 0},
  exiting: exitDelay => ({
    opacity: 0,
    transition: {delay: exitDelay, duration: 0.12},
  }),
  visible: {opacity: 1, transition: {delay: 0.25, duration: 0.12}},
};

function formatRelativeTime(playedAt: number, now: number) {
  const elapsedSeconds = Math.max(0, Math.floor((now - playedAt) / 1000));

  if (elapsedSeconds < 60) {
    return relativeTime.format(-elapsedSeconds, 'second');
  }

  const elapsedMinutes = Math.floor(elapsedSeconds / 60);

  if (elapsedMinutes < 60) {
    return relativeTime.format(-elapsedMinutes, 'minute');
  }

  const elapsedHours = Math.floor(elapsedMinutes / 60);

  if (elapsedHours < 24) {
    return relativeTime.format(-elapsedHours, 'hour');
  }

  return relativeTime.format(-Math.floor(elapsedHours / 24), 'day');
}

function formatPlayedAt(playedAt: number) {
  return newYorkDateTime.format(playedAt);
}

function TrackArtwork({track}: {track: RecentlyListenedTrack}) {
  if (!track.artwork_url) {
    return <span className={styles.artworkFallback} aria-hidden="true" />;
  }

  return (
    <img
      className={styles.artwork}
      src={track.artwork_url}
      alt=""
      width="18"
      height="18"
    />
  );
}

function TrackRow({
  timestampExitDelay,
  isPrimary = false,
  now,
  track,
}: {
  timestampExitDelay?: number;
  isPrimary?: boolean;
  now: number;
  track: RecentlyListenedTrack;
}) {
  const playedAt = new Date(track.played_at).toISOString();

  return (
    <div className={styles.trackRow}>
      <a className={styles.trackLink} href={track.permalink_url}>
        <SnapshotFactIcon>
          <TrackArtwork track={track} />
        </SnapshotFactIcon>
        <TrackMetadata artist={track.artist} title={track.title} />
      </a>
      {isPrimary ? (
        <motion.time
          className={styles.listenedAt}
          custom={timestampExitDelay}
          dateTime={playedAt}
          title={formatPlayedAt(track.played_at)}
          variants={primaryTimestampVariants}
        >
          {formatRelativeTime(track.played_at, now)}
        </motion.time>
      ) : (
        <time
          className={styles.listenedAt}
          dateTime={playedAt}
          title={formatPlayedAt(track.played_at)}
        >
          {formatRelativeTime(track.played_at, now)}
        </time>
      )}
    </div>
  );
}

function ListeningToFactPlaceholder({failed}: {failed: boolean}) {
  return (
    <SnapshotFact label="chilling to" valueClassName={styles.value}>
      <SnapshotFactIcon>
        <span className={styles.artworkLoading} aria-hidden="true" />
      </SnapshotFactIcon>
      <SnapshotFactContent className={styles.metadata} role="status">
        <span className={styles.artist}>{failed ? 'unavailable' : 'loading…'}</span>
      </SnapshotFactContent>
    </SnapshotFact>
  );
}

export default function ListeningToFactContent() {
  const {data: tracks = [], isError} = useQuery(recentlyListenedQueryOptions);
  const now = useCurrentTime();
  const [track, ...history] = tracks;

  if (!track) {
    return <ListeningToFactPlaceholder failed={isError} />;
  }

  return (
    <ListeningToFactInteraction
      primaryTrack={
        <TrackRow
          isPrimary
          now={now}
          timestampExitDelay={history.length * HISTORY_EXIT_STAGGER_SECONDS}
          track={track}
        />
      }
      historyTracks={history.map(historyTrack => ({
        content: <TrackRow now={now} track={historyTrack} />,
        id: `${historyTrack.played_at}:${historyTrack.permalink_url}`,
      }))}
    />
  );
}
