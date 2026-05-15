import { useLiveQuery } from "dexie-react-hooks";
import { AnimatedScreen } from "../components/AnimatedScreen";
import { Settings, Bell, Lock, Moon, Shield } from "lucide-react";
import { db } from "../lib/db";

export function Profile() {
  const entries = useLiveQuery(() => db.entries.toArray());

  const totalEntries = entries?.length || 0;
  const totalWords = entries?.reduce((acc, entry) => acc + entry.content.split(/\s+/).length, 0) || 0;
  
  const profileStats = [
    { label: "Entries", value: totalEntries.toString() },
    { label: "Words", value: totalWords > 1000 ? `${(totalWords / 1000).toFixed(1)}k` : totalWords.toString() },
    { label: "Streak", value: "12d" }, // Hardcoded for now until streak logic is implemented
  ];

  const settingsOptions = [
    { icon: Bell, label: "Reminders", description: "Get a daily nudge to write", type: "toggle" },
    { icon: Moon, label: "Dark Mode", description: "Easier on eyes at night", type: "toggle" },
    { icon: Lock, label: "Passcode Lock", description: "Keep your thoughts private", type: "button" },
    { icon: Shield, label: "Privacy & Data", description: "Export or delete entries", type: "button" },
  ];

  return (
    <AnimatedScreen>
      <div className="mx-auto max-w-2xl">
        <header className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">Account</h1>
        </header>

        <section className="mb-8 overflow-hidden rounded-3xl bg-white shadow-sm ring-1 ring-gray-200">
          <div className="h-32 bg-indigo-600 sm:h-40" />
          <div className="relative px-6 pb-8 md:px-8">
            <div className="-mt-12 mb-6 sm:-mt-16">
              <img
                src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200"
                alt="Profile"
                className="h-24 w-24 rounded-full border-4 border-white bg-white object-cover sm:h-32 sm:w-32 shadow-md"
              />
            </div>
            
            <h2 className="text-2xl font-bold text-gray-900">Jane Doe</h2>
            <p className="text-gray-500">Writing since January 2024</p>

            <div className="mt-8 grid grid-cols-3 gap-4 border-t border-gray-100 pt-8">
              {profileStats.map((stat) => (
                <div key={stat.label} className="text-center">
                  <dt className="text-xs font-medium uppercase tracking-wider text-gray-400">{stat.label}</dt>
                  <dd className="mt-1 text-2xl font-bold text-gray-900">{stat.value}</dd>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <Settings className="h-5 w-5" />
            App Settings
          </h3>
          <div className="grid gap-3">
            {settingsOptions.map((option) => (
              <button
                key={option.label}
                className="flex items-center justify-between rounded-2xl bg-white p-4 shadow-sm ring-1 ring-gray-100 transition-all hover:ring-indigo-100 text-left"
              >
                <div className="flex items-center gap-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
                    <option.icon className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">{option.label}</p>
                    <p className="text-xs text-gray-500">{option.description}</p>
                  </div>
                </div>
                {option.type === "toggle" ? (
                  <div className="h-6 w-11 rounded-full bg-indigo-600 p-1">
                    <div className="h-4 w-4 rounded-full bg-white shadow-sm" />
                  </div>
                ) : (
                  <div className="text-gray-300">
                    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="9 5l7 7-7 7" />
                    </svg>
                  </div>
                )}
              </button>
            ))}
          </div>
        </section>
      </div>
    </AnimatedScreen>
  );
}
