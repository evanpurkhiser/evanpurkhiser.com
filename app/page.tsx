import ActivityTimeline from './components/ActivityTimeline';
import Mark from './components/Mark';
import Snapshot from './components/snapshot/Snapshot';
import SocialLinks from './components/SocialLinks';

export default function Home() {
  return (
    <main>
      <header className="intro">
        <div className="intro-title">
          <Mark className="intro-mark" strokeWidth={1.25} aria-hidden="true" />
          <h1>Evan Purkhiser</h1>
          <SocialLinks />
        </div>
        <p>
          Building things for fun and profit since I can remember. Interested in every
          layer, from systems architecture to the smallest interaction details.
        </p>
      </header>

      <Snapshot />
      <ActivityTimeline />
    </main>
  );
}
