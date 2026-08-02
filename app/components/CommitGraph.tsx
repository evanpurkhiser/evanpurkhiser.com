import styles from './CommitGraph.module.css';

// Placeholder data for design iteration. Replace with real weekly counts later.
const weeklyCommits = [
  18, 22, 17, 28, 25, 31, 24, 38, 42, 35, 48, 39, 44, 32, 36, 29, 41, 38, 52, 47, 58, 51,
  62, 56, 68, 64, 72, 61, 66, 54, 59, 48, 57, 63, 55, 69, 74, 67, 78, 71, 76, 65, 70, 58,
  63, 52, 57, 45, 49, 38, 44, 35, 40,
];

const width = 800;
const height = 112;
const inset = 4;
const maximum = Math.max(...weeklyCommits);
const points = weeklyCommits.map((value, index) => ({
  x: (index / (weeklyCommits.length - 1)) * width,
  y: inset + (1 - value / maximum) * (height - inset * 2),
}));

const line = points.reduce((path, point, index) => {
  if (index === 0) {
    return `M ${point.x} ${point.y}`;
  }

  const previous = points[index - 1]!;
  const beforePrevious = points[index - 2] ?? previous;
  const next = points[index + 1] ?? point;
  const controlA = {
    x: previous.x + (point.x - beforePrevious.x) / 6,
    y: previous.y + (point.y - beforePrevious.y) / 6,
  };
  const controlB = {
    x: point.x - (next.x - previous.x) / 6,
    y: point.y - (next.y - previous.y) / 6,
  };

  return `${path} C ${controlA.x} ${controlA.y}, ${controlB.x} ${controlB.y}, ${point.x} ${point.y}`;
}, '');

const area = `${line} L ${width} ${height} L 0 ${height} Z`;

export default function CommitGraph() {
  return (
    <svg
      className={styles.graph}
      viewBox={`0 0 ${width} ${height}`}
      role="img"
      aria-label="Weekly commits over the last year"
      preserveAspectRatio="none"
    >
      <defs>
        <linearGradient id="commit-fill" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="var(--color-blue)" stopOpacity="0.16" />
          <stop offset="1" stopColor="var(--color-blue)" stopOpacity="0" />
        </linearGradient>
      </defs>
      <path className={styles.area} d={area} />
      <path className={styles.line} d={line} />
    </svg>
  );
}
