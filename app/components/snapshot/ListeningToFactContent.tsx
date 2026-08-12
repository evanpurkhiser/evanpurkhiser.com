'use client';

import {Temporal} from '@js-temporal/polyfill';
import {useQuery} from '@tanstack/react-query';
import {motion, type Variants} from 'framer-motion';

import useCurrentTime from '../../hooks/useCurrentTime';
import {recentlyListenedQueryOptions} from '../../lib/recentlyListenedQuery';
import type {RecentlyListenedTrack} from '../../lib/soundcloud/types';

import styles from './ListeningToFact.module.css';
import ListeningToFactInteraction, {
  HISTORY_EXIT_STAGGER_SECONDS,
} from './ListeningToFactInteraction';
import {SnapshotFactIcon} from './SnapshotFact';
import TrackMetadata from './TrackMetadata';

const relativeTime = new Intl.RelativeTimeFormat('en', {
  numeric: 'always',
  style: 'long',
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
  const playedAtInstant = Temporal.Instant.fromEpochMilliseconds(playedAt);
  const nowInstant = Temporal.Instant.fromEpochMilliseconds(now);
  const elapsedSeconds = Math.max(
    0,
    Math.floor(playedAtInstant.until(nowInstant).total('second')),
  );

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
  return Temporal.Instant.fromEpochMilliseconds(playedAt)
    .toZonedDateTimeISO('America/New_York')
    .toLocaleString('en', {dateStyle: 'full', timeStyle: 'long'});
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
  const playedAt = Temporal.Instant.fromEpochMilliseconds(track.played_at);

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
          dateTime={playedAt.toString()}
          title={formatPlayedAt(track.played_at)}
          variants={primaryTimestampVariants}
        >
          {formatRelativeTime(track.played_at, now)}
        </motion.time>
      ) : (
        <time
          className={styles.listenedAt}
          dateTime={playedAt.toString()}
          title={formatPlayedAt(track.played_at)}
        >
          {formatRelativeTime(track.played_at, now)}
        </time>
      )}
    </div>
  );
}

export default function ListeningToFactContent({initialTime}: {initialTime: number}) {
  const {data: tracks = []} = useQuery(recentlyListenedQueryOptions);
  const now = useCurrentTime(initialTime);
  const [track, ...history] = tracks;

  if (!track) {
    return null;
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
