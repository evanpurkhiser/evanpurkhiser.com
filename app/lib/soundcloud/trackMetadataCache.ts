import type {
  CleanedSoundCloudTrackMetadata,
  SoundCloudTrackMetadata,
} from './trackMetadata';

export type SoundCloudTrackMetadataCache = {
  read(track: SoundCloudTrackMetadata): Promise<CleanedSoundCloudTrackMetadata | null>;
  write(
    rawTrack: SoundCloudTrackMetadata,
    cleaned: CleanedSoundCloudTrackMetadata,
  ): Promise<void>;
};
