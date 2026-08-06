'use client';

import {useState} from 'react';

import Mark from './Mark';
import styles from './MarkDemo.module.css';

export default function MarkDemo() {
  const [size, setSize] = useState(240);
  const [curve, setCurve] = useState(0.625);
  const [strokeWidth, setStrokeWidth] = useState(1);

  return (
    <section className={styles.demo} aria-labelledby="mark-demo-title">
      <div className={styles.preview}>
        <Mark
          className={styles.mark}
          size={size}
          curve={curve}
          strokeWidth={strokeWidth}
          aria-label="Configurable mark preview"
        />
      </div>

      <div className={styles.controls}>
        <h2 id="mark-demo-title">Mark</h2>

        <label>
          <span>
            Size <output>{size}px</output>
          </span>
          <input
            type="range"
            min="48"
            max="320"
            value={size}
            onChange={event => setSize(event.currentTarget.valueAsNumber)}
          />
        </label>

        <label>
          <span>
            Curve <output>{curve.toFixed(3)}</output>
          </span>
          <input
            type="range"
            min="0"
            max="1"
            step="0.001"
            value={curve}
            onChange={event => setCurve(event.currentTarget.valueAsNumber)}
          />
        </label>

        <label>
          <span>
            Stroke <output>{strokeWidth.toFixed(2)}</output>
          </span>
          <input
            type="range"
            min="0.25"
            max="3"
            step="0.05"
            value={strokeWidth}
            onChange={event => setStrokeWidth(event.currentTarget.valueAsNumber)}
          />
        </label>
      </div>
    </section>
  );
}
