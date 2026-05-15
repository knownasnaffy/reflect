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

  return (
    <>
      {/* Mobile Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 flex items-center justify-around bg-white/80 p-4 shadow-t backdrop-blur-md md:hidden border-t border-gray-200">
        {links.map((link) => {
          const isActive = location.pathname === link.path;
          return (
            <Link
              key={link.name}
              to={link.path}
              className={`relative flex flex-col items-center gap-1 ${
                isActive ? "text-blue-600" : "text-gray-500 hover:text-gray-900"
              }`}
            >
              <link.icon className="h-6 w-6" />
              <span className="text-[10px] font-medium">{link.name}</span>
              {isActive && (
                <motion.div
                  layoutId="mobile-nav-pill"
                  className="absolute -top-4 h-1 w-8 rounded-full bg-blue-600"
                />
              )}
            </Link>
          );
        })}
      </nav>

      {/* Desktop Side Navigation */}
      <nav className="hidden h-screen w-64 flex-col border-r border-gray-200 bg-white shadow-sm md:flex sticky top-0">
        <div className="p-6 flex items-center justify-between">
          <h1 className="text-2xl font-bold tracking-tight text-gray-900">Reflect</h1>
          <button 
            onClick={handleAddEntry}
            className="p-2 rounded-full bg-blue-50 text-blue-600 hover:bg-blue-100 transition-colors"
          >
            <Plus className="h-5 w-5" />
          </button>
        </div>
        <div className="flex flex-1 flex-col gap-2 p-4">
          {links.map((link) => {
            const isActive = location.pathname === link.path;
            return (
              <Link
                key={link.name}
                to={link.path}
                className={`relative flex items-center gap-3 rounded-xl px-4 py-3 transition-colors ${
                  isActive ? "text-blue-600" : "text-gray-500 hover:bg-gray-50 hover:text-gray-900"
                }`}
              >
                {isActive && (
                  <motion.div
                    layoutId="desktop-nav-pill"
                    className="absolute inset-0 rounded-xl bg-blue-50"
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
