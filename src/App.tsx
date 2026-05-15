/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */
import { useLiveQuery } from "dexie-react-hooks";
import { useEffect } from "react";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { AnimatePresence } from "motion/react";
import { Navigation } from "./components/Navigation";
import { Home } from "./screens/Home";
import { Timeline } from "./screens/Timeline";
import { Profile } from "./screens/Profile";
import { Write } from "./screens/Write";
import { ViewEntry } from "./screens/ViewEntry";
import { db, seedDatabase } from "./lib/db";

function AnimatedRoutes() {
  const location = useLocation();
  
  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route path="/" element={<Home />} />
        <Route path="/timeline" element={<Timeline />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/write" element={<Write />} />
        <Route path="/write/:id" element={<Write />} />
        <Route path="/view/:id" element={<ViewEntry />} />
      </Routes>
    </AnimatePresence>
  );
}

export default function App() {
  const profile = useLiveQuery(() => db.settings.get('current_user'));

  useEffect(() => {
    seedDatabase();
  }, []);

  useEffect(() => {
    if (profile === undefined) return;

    if (profile?.darkMode === true) {
      document.documentElement.classList.add('dark');
      document.body.classList.add('dark');
      document.documentElement.style.colorScheme = 'dark';
    } else {
      document.documentElement.classList.remove('dark');
      document.body.classList.remove('dark');
      document.documentElement.style.colorScheme = 'light';
    }
  }, [profile]);

  return (
    <BrowserRouter>
      <div className="flex min-h-screen bg-gray-50 dark:bg-gray-900 md:flex-row transition-colors duration-300 w-full">
        <Navigation />
        <main className="flex w-full flex-col overflow-x-hidden md:h-screen md:overflow-y-auto">
          <AnimatedRoutes />
        </main>
      </div>
    </BrowserRouter>
  );
}
