import { Link, useLocation } from "react-router-dom";
import { Home, Calendar, User, Plus } from "lucide-react";
import { motion } from "motion/react";
import { db } from "../lib/db";

export function Navigation() {
  const location = useLocation();

  const handleAddEntry = async () => {
    const newEntry = {
      title: "Quick Note",
      description: "Just a quick thought on the fly.",
      content: "Sometimes the best ideas come when you're just moving between things.",
      imageUrl: "https://images.unsplash.com/photo-1517842645767-c639042777db?auto=format&fit=crop&q=80&w=800",
      date: new Date().toISOString().split('T')[0],
      createdAt: Date.now(),
    };
    await db.entries.add(newEntry);
  };

  const links = [
    { name: "Home", path: "/", icon: Home },
    { name: "Timeline", path: "/timeline", icon: Calendar },
    { name: "Profile", path: "/profile", icon: User },
  ];

  const getIsActive = (path: string) => {
    if (path === "/") {
      return location.pathname === "/";
    }
    if (path === "/timeline") {
      return location.pathname.startsWith("/timeline") || 
             location.pathname.startsWith("/view") || 
             location.pathname.startsWith("/write");
    }
    return location.pathname.startsWith(path);
  };

  return (
    <>
      {/* Mobile Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 z-40 flex items-center justify-around bg-white/80 dark:bg-gray-800/80 p-4 shadow-t backdrop-blur-md md:hidden border-t border-gray-200 dark:border-gray-700 transition-colors">
        {links.map((link) => {
          const isActive = getIsActive(link.path);
          return (
            <Link
              key={link.name}
              to={link.path}
              className={`relative flex flex-col items-center gap-1 ${
                isActive ? "text-indigo-600 dark:text-indigo-400" : "text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200"
              }`}
            >
              <link.icon className="h-6 w-6" />
              <span className="text-[10px] font-medium">{link.name}</span>
              {isActive && (
                <motion.div
                  layoutId="mobile-nav-pill"
                  className="absolute -top-4 h-1 w-8 rounded-full bg-indigo-600 dark:bg-indigo-400"
                />
              )}
            </Link>
          );
        })}
      </nav>

      {/* Desktop Side Navigation */}
      <nav className="hidden h-screen w-64 flex-col border-r border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-sm md:flex sticky top-0 z-30 transition-colors">
        <div className="p-6 flex items-center justify-between">
          <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">Reflect</h1>
          <Link 
            to="/write"
            className="p-2 rounded-full bg-indigo-50 dark:bg-indigo-900/40 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-100 dark:hover:bg-indigo-900/60 transition-colors"
          >
            <Plus className="h-5 w-5" />
          </Link>
        </div>
        <div className="flex flex-1 flex-col gap-2 p-4">
          {links.map((link) => {
            const isActive = getIsActive(link.path);
            return (
              <Link
                key={link.name}
                to={link.path}
                className={`relative flex items-center gap-3 rounded-xl px-4 py-3 transition-colors ${
                  isActive ? "text-indigo-600 dark:text-indigo-400" : "text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700/50 hover:text-gray-900 dark:hover:text-gray-200"
                }`}
              >
                {isActive && (
                  <motion.div
                    layoutId="desktop-nav-pill"
                    className="absolute inset-0 rounded-xl bg-indigo-50 dark:bg-indigo-900/30"
                  />
                )}
                <link.icon className="relative z-10 h-5 w-5" />
                <span className="relative z-10 font-medium">{link.name}</span>
              </Link>
            );
          })}
        </div>
      </nav>
    </>
  );
}
