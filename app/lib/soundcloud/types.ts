export type SoundCloudHistoryTrack = {
  id: string;
  played_at: number;
  permalink_url: string;
  artwork_url: string | null;
  genre: string | null;
  artist: string;
  title: string;
};

export type RecentlyListenedTrack = Omit<SoundCloudHistoryTrack, 'id'>;
