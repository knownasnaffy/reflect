import { useLiveQuery } from "dexie-react-hooks";
import { AnimatedScreen } from "../components/AnimatedScreen";
import { SharedCard } from "../components/SharedCard";
import { db } from "../lib/db";

export function Home() {
  const entries = useLiveQuery(() => db.entries.reverse().limit(2).toArray());
  const totalCount = useLiveQuery(() => db.entries.count());

  if (!entries) return null;

  const handleStartWriting = async () => {
    const newEntry = {
      title: "Feeling Productive",
      description: "Implemented a real database today and everything feels much more solid.",
      content: "Deep diving into IndexedDB and Dexie was a great choice. The data is now persistent!",
      imageUrl: "https://images.unsplash.com/photo-1488190211105-8b0e65b80b4e?auto=format&fit=crop&q=80&w=800",
      date: new Date().toISOString().split('T')[0],
      createdAt: Date.now(),
    };
    await db.entries.add(newEntry);
  };

  return (
    <AnimatedScreen>
      <div className="mx-auto max-w-4xl">
        <header className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">Good morning, Jane</h1>
          <p className="mt-2 text-lg text-gray-500">Ready to reflect on your day?</p>
        </header>

        <section className="mb-12">
          <div className="relative overflow-hidden rounded-3xl bg-indigo-600 px-6 py-10 md:px-12 md:py-14 shadow-lg">
            <div className="relative z-10 max-w-lg text-white">
              <span className="inline-block rounded-full bg-white/20 px-3 py-1 text-xs font-semibold uppercase tracking-wider">
                Daily Prompt
              </span>
              <h2 className="mt-4 text-2xl font-bold sm:text-3xl italic">
                "What is one small thing that made you smile today?"
              </h2>
              <button 
                onClick={handleStartWriting}
                className="mt-8 flex items-center gap-2 rounded-full bg-white px-6 py-3 text-sm font-semibold text-indigo-600 shadow-sm transition-transform hover:scale-105 active:scale-95"
              >
                Start Writing
              </button>
            </div>
            {/* Decorative background element */}
            <div className="absolute -bottom-12 -right-12 h-64 w-64 rounded-full bg-indigo-500/30 blur-3xl" />
          </div>
        </section>

        <section className="grid gap-8 md:grid-cols-3 mb-12">
          <div className="md:col-span-2">
            <div className="mb-6 flex items-center justify-between">
              <h2 className="text-xl font-semibold text-gray-900">Featured Entries</h2>
            </div>
            <div className="grid gap-6 sm:grid-cols-2">
              {entries.map((item) => (
                <SharedCard 
                  key={item.id} 
                  {...item} 
                  id={item.id?.toString() || "" } 
                />
              ))}
            </div>
          </div>

          <div className="space-y-6">
            <h2 className="text-xl font-semibold text-gray-900">Your Stats</h2>
            <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-500">Current Streak</p>
                  <p className="text-2xl font-bold text-gray-900">12 Days</p>
                </div>
                <div className="h-10 w-10 rounded-full bg-orange-100 flex items-center justify-center text-orange-600">
                  <span className="text-xl">🔥</span>
                </div>
              </div>
              <div className="mt-4 h-2 w-full rounded-full bg-gray-100">
                <div className="h-full w-[60%] rounded-full bg-orange-500" />
              </div>
              <p className="mt-2 text-xs text-gray-400">Keep it up! 3 days to your next milestone.</p>
            </div>

            <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-gray-200">
              <p className="text-sm font-medium text-gray-500">Total Entries</p>
              <p className="text-2xl font-bold text-gray-900">{totalCount || 0}</p>
              <div className="mt-2 flex items-center gap-1 text-xs text-green-600">
                <span>+4 this week</span>
              </div>
            </div>
          </div>
        </section>
      </div>
    </AnimatedScreen>
  );
}
