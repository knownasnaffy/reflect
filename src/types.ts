export interface JournalEntry {
  id?: number;
  title: string;
  description: string;
  content: string;
  imageUrl: string;
  date: string; // ISO string for sorting
  createdAt: number; // timestamp
}

export interface UserStats {
  streak: number;
  totalEntries: number;
  totalWords: number;
}
