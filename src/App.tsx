/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */
import { useLiveQuery } from "dexie-react-hooks";
import { useEffect } from "react";
import { BrowserRouter, Routes, Route, useLocation, useNavigate, Navigate } from "react-router-dom";
import { AnimatePresence } from "motion/react";
import { Navigation } from "./components/Navigation";
import { Home } from "./screens/Home";
import { Timeline } from "./screens/Timeline";
import { Profile } from "./screens/Profile";
import { Write } from "./screens/Write";
import { ViewEntry } from "./screens/ViewEntry";
import { Onboarding } from "./screens/Onboarding";
import { db } from "./lib/db";

function ScrollToTop() {
  const { pathname } = useLocation();
  
  useEffect(() => {
    // Standard window scroll
    window.scrollTo(0, 0);
    // Target the specific scroll container used in desktop layout
    const mainElement = document.querySelector('main');
    if (mainElement) {
      mainElement.scrollTo({ top: 0, behavior: 'instant' });
    }
  }, [pathname]);

  return null;
}

function RedirectManager({ profile }: { profile: any }) {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    // If Dexie has loaded (profile is null or object) and we are not on onboarding
    if (profile === null && location.pathname !== "/onboarding") {
      navigate("/onboarding");
    }
    // If user exists and is on onboarding, redirect home
    if (profile && location.pathname === "/onboarding") {
      navigate("/");
    }
  }, [profile, location.pathname, navigate]);

  return null;
}

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
        <Route path="/onboarding" element={<Onboarding />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AnimatePresence>
  );
}

export default function App() {
  // Use a query that returns null if not found to distinguish from loading (undefined)
  const profileResult = useLiveQuery(async () => {
    const user = await db.settings.get('current_user');
    return user || null;
  });

  useEffect(() => {
    if (profileResult === undefined || profileResult === null) return;

    if (profileResult?.darkMode === true) {
      document.documentElement.classList.add('dark');
      document.body.classList.add('dark');
      document.documentElement.style.colorScheme = 'dark';
    } else {
      document.documentElement.classList.remove('dark');
      document.body.classList.remove('dark');
      document.documentElement.style.colorScheme = 'light';
    }
  }, [profileResult]);

  return (
    <BrowserRouter>
      <ScrollToTop />
      <RedirectManager profile={profileResult} />
      <AppLayout profile={profileResult} />
    </BrowserRouter>
  );
}

function AppLayout({ profile }: { profile: any }) {
  const location = useLocation();
  const isOnboarding = location.pathname === "/onboarding";

  // While loading profile, show a simple loader or nothing to avoid flashes
  if (profile === undefined) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-indigo-600 border-t-transparent" />
      </div>
    );
  }

  if (isOnboarding) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
        <AnimatedRoutes />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-gray-50 dark:bg-gray-900 md:flex-row transition-colors duration-300 w-full">
      <Navigation />
      <main className="flex w-full flex-col overflow-x-hidden md:h-screen md:overflow-y-auto">
        <AnimatedRoutes />
      </main>
    </div>
  );
}
