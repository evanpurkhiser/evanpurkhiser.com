import JobFact from './JobFact';
import ListeningToFact from './ListeningToFact';
import LocationFact from './LocationFact';
import SnapshotLayout from './SnapshotLayout';

export default function Snapshot() {
  return (
    <SnapshotLayout>
      <JobFact />
      <ListeningToFact />
      <LocationFact />
    </SnapshotLayout>
  );
}
