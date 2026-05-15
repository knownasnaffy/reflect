/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */
import { useEffect } from "react";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { AnimatePresence } from "motion/react";
import { Navigation } from "./components/Navigation";
import { Home } from "./screens/Home";
import { Timeline } from "./screens/Timeline";
import { Profile } from "./screens/Profile";
import { Write } from "./screens/Write";
import { ViewEntry } from "./screens/ViewEntry";
import { seedDatabase } from "./lib/db";

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
  useEffect(() => {
    seedDatabase();
  }, []);

  return (
    <BrowserRouter>
      <div className="flex min-h-screen bg-gray-50 md:flex-row">
        <Navigation />
        <main className="flex w-full flex-col overflow-x-hidden md:h-screen md:overflow-y-auto">
          <AnimatedRoutes />
        </main>
      </div>
    </BrowserRouter>
  );
}
