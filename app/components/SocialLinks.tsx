'use client';

import {useState} from 'react';

import {AnimatePresence, motion, useReducedMotion} from 'framer-motion';

import styles from './SocialLinks.module.css';

const links = [
  {
    key: 'github',
    label: 'GitHub',
    href: 'https://github.com/evanpurkhiser',
    path: 'M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12',
  },
  {
    key: 'soundcloud',
    label: 'SoundCloud',
    href: 'https://soundcloud.com/evanpurkhiser',
    path: 'M23.999 14.165c-.052 1.796-1.612 3.169-3.4 3.169h-8.18a.68.68 0 0 1-.675-.683V7.862a.747.747 0 0 1 .452-.724s.75-.513 2.333-.513a5.364 5.364 0 0 1 2.763.755 5.433 5.433 0 0 1 2.57 3.54c.282-.08.574-.121.868-.12.884 0 1.73.358 2.347.992s.948 1.49.922 2.373ZM10.721 8.421c.247 2.98.427 5.697 0 8.672a.264.264 0 0 1-.53 0c-.395-2.946-.22-5.718 0-8.672a.264.264 0 0 1 .53 0ZM9.072 9.448c.285 2.659.37 4.986-.006 7.655a.277.277 0 0 1-.55 0c-.331-2.63-.256-5.02 0-7.655a.277.277 0 0 1 .556 0Zm-1.663-.257c.27 2.726.39 5.171 0 7.904a.266.266 0 0 1-.532 0c-.38-2.69-.257-5.21 0-7.904a.266.266 0 0 1 .532 0Zm-1.647.77a26.108 26.108 0 0 1-.008 7.147.272.272 0 0 1-.542 0 27.955 27.955 0 0 1 0-7.147.275.275 0 0 1 .55 0Zm-1.67 1.769c.421 1.865.228 3.5-.029 5.388a.257.257 0 0 1-.514 0c-.21-1.858-.398-3.549 0-5.389a.272.272 0 0 1 .543 0Zm-1.655-.273c.388 1.897.26 3.508-.01 5.412-.026.28-.514.283-.54 0-.244-1.878-.347-3.54-.01-5.412a.283.283 0 0 1 .56 0Zm-1.668.911c.4 1.268.257 2.292-.026 3.572a.257.257 0 0 1-.514 0c-.241-1.262-.354-2.312-.023-3.572a.283.283 0 0 1 .563 0Z',
  },
  {
    key: 'instagram',
    label: 'Instagram',
    href: 'https://instagram.com/evanpurkhiser',
    path: 'M7.5 2h9A5.5 5.5 0 0 1 22 7.5v9a5.5 5.5 0 0 1-5.5 5.5h-9A5.5 5.5 0 0 1 2 16.5v-9A5.5 5.5 0 0 1 7.5 2Zm0 2A3.5 3.5 0 0 0 4 7.5v9A3.5 3.5 0 0 0 7.5 20h9a3.5 3.5 0 0 0 3.5-3.5v-9A3.5 3.5 0 0 0 16.5 4h-9ZM12 7a5 5 0 1 1 0 10 5 5 0 0 1 0-10Zm0 2a3 3 0 1 0 0 6 3 3 0 0 0 0-6Zm5.25-3.5a1.25 1.25 0 1 1 0 2.5 1.25 1.25 0 0 1 0-2.5Z',
  },
  {
    key: 'resume',
    label: 'Resume',
    href: 'https://resume.evanpurkhiser.com',
    path: 'M9.6 8.25a3.75 3.75 0 1 0 0 7.5 3.7 3.7 0 0 0 2.65-1.1l-1.4-1.4a1.75 1.75 0 1 1 0-2.5l1.4-1.4a3.7 3.7 0 0 0-2.65-1.1Zm2.65 0h2.1l1.65 4.9 1.65-4.9h2.1L17 15.75h-2l-2.75-7.5Z',
    framed: true,
  },
];

const labelVariants = {
  active: {y: [-10, 0], opacity: [0, 1]},
  inactive: {y: 10, opacity: 0},
};

export default function SocialLinks() {
  const [activeLinkKey, setActiveLinkKey] = useState<string | null>(null);
  const shouldReduceMotion = useReducedMotion();

  return (
    <nav
      className={styles.links}
      aria-label="Elsewhere"
      onMouseLeave={() => setActiveLinkKey(null)}
      onBlur={event => {
        if (!event.currentTarget.contains(event.relatedTarget)) {
          setActiveLinkKey(null);
        }
      }}
    >
      <span className={styles.label}>
        {links.map(({key, label}) => (
          <motion.span
            className={styles.labelItem}
            id={`social-link-${key}`}
            key={key}
            initial={false}
            animate={activeLinkKey === key ? 'active' : 'inactive'}
            variants={labelVariants}
            transition={shouldReduceMotion ? {duration: 0} : {duration: 0.15}}
          >
            {label}
          </motion.span>
        ))}
      </span>
      {links.map(({key, href, path, framed}) => (
        <a
          className={styles.link}
          href={href}
          aria-labelledby={`social-link-${key}`}
          target="_blank"
          rel="noopener noreferrer"
          key={key}
          onMouseEnter={() => setActiveLinkKey(key)}
          onFocus={() => setActiveLinkKey(key)}
        >
          <AnimatePresence>
            {activeLinkKey === key && (
              <motion.span
                className={styles.surface}
                layoutId="social-link-surface"
                initial={{opacity: 0}}
                animate={{opacity: 1}}
                exit={{opacity: 0}}
                transition={
                  shouldReduceMotion
                    ? {duration: 0}
                    : {
                        layout: {type: 'spring', stiffness: 500, damping: 35},
                        opacity: {duration: 0.15},
                      }
                }
              />
            )}
          </AnimatePresence>
          <svg className={styles.icon} viewBox="0 0 24 24" aria-hidden="true">
            {framed && (
              <rect
                x="0.75"
                y="3.75"
                width="22.5"
                height="16.5"
                rx="3"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              />
            )}
            <path
              d={path}
              fillRule="evenodd"
              transform={framed ? 'translate(-0.5 0)' : undefined}
            />
          </svg>
        </a>
      ))}
    </nav>
  );
}
