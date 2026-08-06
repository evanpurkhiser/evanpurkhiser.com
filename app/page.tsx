import ActivityTimeline from './components/ActivityTimeline';
import Mark from './components/Mark';
import SocialLinks from './components/SocialLinks';

export default function Home() {
  return (
    <main>
      <header className="intro">
        <div className="intro-title">
          <Mark className="intro-mark" strokeWidth={1.25} aria-hidden="true" />
          <h1>Evan Purkhiser</h1>
        </div>
        <p>
          Engineer by profession. Builder by nature. Interested in every layer of a
          product, from systems architecture to the smallest interaction details.
        </p>
      </header>

      <ActivityTimeline />

      <SocialLinks />
    </main>
  );
}
