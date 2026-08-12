import {Temporal} from '@js-temporal/polyfill';
import {z} from 'zod';

import styles from './LocationFact.module.css';
import LocationTime from './LocationTime';
import SnapshotFact, {SnapshotFactContent, SnapshotFactIcon} from './SnapshotFact';

const weatherResponseSchema = z.object({
  current: z.object({
    temperature_2m: z.number(),
    weather_code: z.number(),
    is_day: z.number(),
  }),
});

function weatherEmoji(code: number, isDay: boolean) {
  if (code === 0) {
    return isDay ? '☀️' : '🌙';
  }

  if (code <= 2) {
    return isDay ? '🌤️' : '☁️';
  }

  if (code === 3) {
    return '☁️';
  }

  if (code === 45 || code === 48) {
    return '🌫️';
  }

  if (code >= 71 && code <= 77) {
    return '❄️';
  }

  if (code >= 95) {
    return '⛈️';
  }

  return '🌧️';
}

async function loadNewYorkWeather() {
  const url = new URL('https://api.open-meteo.com/v1/forecast');
  url.searchParams.set('latitude', '40.7128');
  url.searchParams.set('longitude', '-74.0060');
  url.searchParams.set('current', 'temperature_2m,weather_code,is_day');
  url.searchParams.set('temperature_unit', 'celsius');
  url.searchParams.set('timezone', 'America/New_York');

  try {
    const response = await fetch(url, {next: {revalidate: 15 * 60}});

    if (!response.ok) {
      throw new Error(`Open-Meteo returned ${response.status}`);
    }

    return weatherResponseSchema.parse(await response.json()).current;
  } catch (error) {
    console.error('Failed to load New York weather', error);

    return null;
  }
}

export default async function LocationFact() {
  const weather = await loadNewYorkWeather();
  const now = Temporal.Now.instant().epochMilliseconds;

  return (
    <SnapshotFact label="resident of">
      <SnapshotFactIcon>
        {weather && (
          <span className={styles.weatherIcon} role="img" aria-label="Current weather">
            {weatherEmoji(weather.weather_code, weather.is_day === 1)}
          </span>
        )}
      </SnapshotFactIcon>
      <SnapshotFactContent className={styles.location}>
        <strong>New York City</strong>
        <LocationTime initialTime={now} />
        {weather && (
          <span className={styles.temperature}>
            {Math.round(weather.temperature_2m)}°C
          </span>
        )}
      </SnapshotFactContent>
    </SnapshotFact>
  );
}
