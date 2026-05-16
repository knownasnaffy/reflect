import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Lock, LogOut } from "lucide-react";
import { useLiveQuery } from "dexie-react-hooks";
import { db } from "../lib/db";
import { PasscodeInput } from "./PasscodeInput";

export function LockScreen() {
  const profile = useLiveQuery(() => db.settings.get('current_user'));
  const [isLocked, setIsLocked] = useState(false);
  const [error, setError] = useState(false);

  useEffect(() => {
    // If passcode is set and we haven't authenticated in this session
    const sessionAuth = sessionStorage.getItem("reflect_authenticated");
    if (profile?.passcode && !sessionAuth) {
      setIsLocked(true);
    }

    const handleManualLock = () => {
      sessionStorage.removeItem("reflect_authenticated");
      setIsLocked(true);
    };

    window.addEventListener("reflect-lock", handleManualLock);
    return () => window.removeEventListener("reflect-lock", handleManualLock);
  }, [profile?.passcode]);

  // Inactivity timeout
  useEffect(() => {
    if (!profile?.passcode) return;

    let timeoutId: number;

    const resetTimeout = () => {
      clearTimeout(timeoutId);
      // Lock after 10 minutes of inactivity
      timeoutId = window.setTimeout(() => {
        setIsLocked(true);
      }, 10 * 60 * 1000); 
    };

    const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart'];
    events.forEach(event => document.addEventListener(event, resetTimeout));
    
    resetTimeout();

    return () => {
      clearTimeout(timeoutId);
      events.forEach(event => document.removeEventListener(event, resetTimeout));
    };
  }, [profile?.passcode]);

  const handleUnlock = (code: string) => {
    if (code === profile?.passcode) {
      setIsLocked(false);
      setError(false);
      sessionStorage.setItem("reflect_authenticated", "true");
    } else {
      setError(true);
      setTimeout(() => setError(false), 500);
    }
  };

  if (!profile?.passcode) return null;

  return (
    <AnimatePresence>
      {isLocked && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[999999] flex items-center justify-center bg-gray-50/95 dark:bg-gray-900/95 backdrop-blur-md"
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="w-full max-w-md mx-4 p-8 md:p-12 bg-white dark:bg-gray-800 rounded-3xl shadow-2xl ring-1 ring-black/5 text-center"
          >
            <div className="mx-auto mb-8 flex h-20 w-20 items-center justify-center rounded-[32px] bg-indigo-600 text-white shadow-2xl shadow-indigo-200 dark:shadow-none">
              <Lock className="h-10 w-10" />
            </div>

            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Welcome back</h2>
            <p className="text-gray-500 dark:text-gray-400 mb-10">Enter your passcode to unlock Reflect</p>

            <motion.div
              animate={error ? { x: [-10, 10, -10, 10, 0] } : {}}
              transition={{ duration: 0.4 }}
            >
              <PasscodeInput onComplete={handleUnlock} />
            </motion.div>

            {error && (
              <p className="mt-4 text-sm font-medium text-red-500">Incorrect passcode. Try again.</p>
            )}

            <div className="mt-12 text-xs text-gray-400 font-medium">
              Secure Session Active
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
