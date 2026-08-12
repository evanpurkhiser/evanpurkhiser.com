import type {ComponentPropsWithRef} from 'react';

import styles from './SnapshotFact.module.css';

type SnapshotFactProps = ComponentPropsWithRef<'div'> & {
  label: string;
  valueClassName?: string;
};

export default function SnapshotFact({
  children,
  className,
  label,
  ref,
  valueClassName,
  ...props
}: SnapshotFactProps) {
  return (
    <div
      {...props}
      className={[styles.fact, className].filter(Boolean).join(' ')}
      ref={ref}
    >
      <dt className={styles.label}>{label}</dt>
      <dd className={[styles.value, valueClassName].filter(Boolean).join(' ')}>
        {children}
      </dd>
    </div>
  );
}

export function SnapshotFactIcon({className, ...props}: ComponentPropsWithRef<'span'>) {
  return (
    <span {...props} className={[styles.icon, className].filter(Boolean).join(' ')} />
  );
}

export function SnapshotFactContent({
  className,
  ...props
}: ComponentPropsWithRef<'span'>) {
  return (
    <span {...props} className={[styles.content, className].filter(Boolean).join(' ')} />
  );
}
