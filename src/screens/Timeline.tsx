import { Link } from "react-router-dom";
import { useLiveQuery } from "dexie-react-hooks";
import { AnimatedScreen } from "../components/AnimatedScreen";
import { db } from "../lib/db";

export function Timeline() {
  const entries = useLiveQuery(() => db.entries.reverse().toArray());

  if (!entries) return null;

  return (
    <AnimatedScreen>
      <div className="mx-auto max-w-4xl">
        <header className="mb-12">
          <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white transition-colors">Your Journey</h1>
          <p className="mt-2 text-lg text-gray-500 dark:text-gray-400">Every word is a step forward.</p>
        </header>

        <div className="relative border-l-2 border-gray-100 dark:border-gray-800 ml-4 pb-8 transition-colors">
          {entries.map((item) => (
            <div key={item.id} className="relative pl-8 mb-12 last:mb-0">
              {/* Dot on timeline */}
              <div className="absolute -left-[9px] top-2 h-4 w-4 rounded-full border-4 border-white dark:border-gray-900 bg-indigo-600 shadow-sm" />
              
              <div className="flex flex-col gap-1 mb-4">
                <span className="text-sm font-semibold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider transition-colors">{item.date}</span>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white transition-colors">{item.title}</h2>
              </div>

              <Link 
                to={`/view/${item.id}`}
                className="grid gap-6 md:grid-cols-2 bg-white dark:bg-gray-800 p-4 rounded-2xl ring-1 ring-gray-200 dark:ring-gray-700 shadow-sm hover:shadow-md dark:hover:shadow-indigo-900/10 transition-all group"
              >
                <div className="aspect-[16/9] w-full overflow-hidden rounded-xl bg-gray-100 dark:bg-gray-700">
                  <img
                    src={item.imageUrl}
                    alt={item.title}
                    className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                </div>
                <div className="flex flex-col justify-center">
                  <p className="text-gray-600 dark:text-gray-400 leading-relaxed transition-colors line-clamp-4">{item.description}</p>
                  <div className="mt-6 flex items-center gap-2 text-sm font-semibold text-indigo-600 dark:text-indigo-400 group-hover:translate-x-1 transition-transform">
                    <span>Read Full Entry</span>
                    <span className="text-lg">→</span>
                  </div>
                </div>
              </Link>
            </div>
          ))}
        </div>
      </div>
    </AnimatedScreen>
  );
}
