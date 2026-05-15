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
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">Your Journey</h1>
          <p className="mt-2 text-lg text-gray-500">Every word is a step forward.</p>
        </header>

        <div className="relative border-l-2 border-gray-100 ml-4 pb-8">
          {entries.map((item) => (
            <div key={item.id} className="relative pl-8 mb-12 last:mb-0">
              {/* Dot on timeline */}
              <div className="absolute -left-[9px] top-2 h-4 w-4 rounded-full border-4 border-white bg-indigo-600 shadow-sm" />
              
              <div className="flex flex-col gap-1 mb-4">
                <span className="text-sm font-semibold text-indigo-600 uppercase tracking-wider">{item.date}</span>
                <h2 className="text-2xl font-bold text-gray-900">{item.title}</h2>
              </div>

              <div className="grid gap-6 md:grid-cols-2 bg-white p-4 rounded-2xl ring-1 ring-gray-200 shadow-sm hover:shadow-md transition-shadow">
                <div className="aspect-[16/9] w-full overflow-hidden rounded-xl bg-gray-100">
                  <img
                    src={item.imageUrl}
                    alt={item.title}
                    className="h-full w-full object-cover"
                  />
                </div>
                <div className="flex flex-col justify-center">
                  <p className="text-gray-600 leading-relaxed">{item.description}</p>
                  <Link 
                    to={`/view/${item.id}`}
                    className="mt-6 self-start text-sm font-semibold text-indigo-600 hover:text-indigo-700 transition-colors"
                  >
                    Read Full Entry →
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </AnimatedScreen>
  );
}
