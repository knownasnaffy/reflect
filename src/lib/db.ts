import Dexie, { type Table } from 'dexie';
import { JournalEntry } from '../types';

export class ReflectDatabase extends Dexie {
  entries!: Table<JournalEntry>;

  constructor() {
    super('ReflectDatabase');
    this.version(1).stores({
      entries: '++id, date, title' // primary key "id" (auto-incremented), index by "date" and "title"
    });
  }
}

export const db = new ReflectDatabase();

export const seedDatabase = async () => {
  const count = await db.entries.count();
  if (count === 0) {
    const mockEntries: JournalEntry[] = [
      {
        title: "A Morning of Clarity",
        description: "Today I woke up early and spent some time meditating. The air was crisp and the world felt quiet...",
        content: "Detailed content about the meditation session...",
        imageUrl: "https://images.unsplash.com/photo-1499750310107-5fef28a66643?auto=format&fit=crop&q=80&w=800",
        date: "2024-05-15",
        createdAt: new Date("2024-05-15").getTime(),
      },
      {
        title: "City Lights & Deep Thoughts",
        description: "Walking through the downtown core tonight made me realize how much we overlook in our daily rush...",
        content: "Walking through the downtown core tonight made me realize how much we overlook in our daily rush. The neon signs and bustling crowds are just a backdrop to the internal monologues we all carry.",
        imageUrl: "https://images.unsplash.com/photo-1477763858572-cda7deaa9bc5?auto=format&fit=crop&q=80&w=800",
        date: "2024-05-14",
        createdAt: new Date("2024-05-14").getTime(),
      },
      {
        title: "New Beginnings",
        description: "Started a new project today. Feeling excited and a bit nervous about the road ahead.",
        content: "The first day of anything is always the hardest but also the most rewarding...",
        imageUrl: "https://images.unsplash.com/photo-1484480974693-6ca0a78fb36b?auto=format&fit=crop&q=80&w=800",
        date: "2024-05-10",
        createdAt: new Date("2024-05-10").getTime(),
      }
    ];
    await db.entries.bulkAdd(mockEntries);
    console.log("Database seeded with mock entries");
  }
};
