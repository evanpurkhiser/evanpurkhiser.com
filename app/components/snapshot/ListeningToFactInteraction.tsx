'use client';

import {useState, type ReactNode} from 'react';

import {motion, MotionConfig, type Variants} from 'framer-motion';

import styles from './ListeningToFact.module.css';
import SnapshotFact from './SnapshotFact';

const HOVER_DELAY_SECONDS = 0.25;
export const HISTORY_EXIT_STAGGER_SECONDS = 0.04;
const MotionSnapshotFact = motion.create(SnapshotFact);
const historyVariants: Variants = {
  entering: {height: 0},
  exiting: {
    height: 0,
    transition: {
      duration: 0.18,
      ease: 'easeInOut',
      staggerChildren: HISTORY_EXIT_STAGGER_SECONDS,
      staggerDirection: -1,
    },
  },
  visible: {
    height: 'auto',
    transition: {
      delay: HOVER_DELAY_SECONDS,
      delayChildren: HOVER_DELAY_SECONDS + 0.04,
      duration: 0.2,
      ease: 'easeOut',
      staggerChildren: 0.05,
    },
  },
};
const historyItemVariants: Variants = {
  entering: {opacity: 0, y: 0},
  exiting: {opacity: 0, y: 10, transition: {duration: 0.12}},
  visible: {opacity: 1, y: 0, transition: {duration: 0.16}},
};

type ListeningToFactInteractionProps = {
  historyTracks: Array<{content: ReactNode; id: string}>;
  primaryTrack: ReactNode;
};
type HistoryState = 'entering' | 'exiting' | 'visible';

export default function ListeningToFactInteraction({
  historyTracks,
  primaryTrack,
}: ListeningToFactInteractionProps) {
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [historyState, setHistoryState] = useState<HistoryState>('entering');

  function openHistory() {
    setIsHistoryOpen(true);
    setHistoryState('visible');
  }

  function closeHistory() {
    setIsHistoryOpen(false);
    setHistoryState('exiting');
  }

  return (
    <MotionConfig reducedMotion="user">
      <MotionSnapshotFact
        animate={historyState}
        initial="entering"
        label="chilling to"
        onHoverEnd={closeHistory}
        onHoverStart={openHistory}
        valueClassName={styles.value}
      >
        {primaryTrack}

        {historyTracks.length > 0 && (
          <motion.ol
            aria-hidden={!isHistoryOpen}
            className={styles.history}
            inert={!isHistoryOpen}
            variants={historyVariants}
          >
            {historyTracks.map(track => (
              <motion.li
                className={styles.historyItem}
                key={track.id}
                variants={historyItemVariants}
              >
                {track.content}
              </motion.li>
            ))}
          </motion.ol>
        )}
      </MotionSnapshotFact>
    </MotionConfig>
  );
}
