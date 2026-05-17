import { useState } from "react";
import { useLiveQuery } from "dexie-react-hooks";
import { AnimatedScreen } from "../components/AnimatedScreen";
import { Settings, Lock, Moon, Shield, Pencil, Save, Download, Trash2, Award } from "lucide-react";
import { db } from "../lib/db";
import { motion, AnimatePresence } from "motion/react";
import { Portal } from "../components/Portal";
import { calculateMaxStreak } from "../lib/stats";
import { PasscodeInput } from "../components/PasscodeInput";

export function Profile() {
  const profile = useLiveQuery(() => db.settings.get('current_user'));
  const entries = useLiveQuery(() => db.entries.toArray());

  const [isEditingName, setIsEditingName] = useState(false);
  const [newName, setNewName] = useState("");
  const [isDataModalOpen, setIsDataModalOpen] = useState(false);
  const [isSecurityModalOpen, setIsSecurityModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deleteStep, setDeleteStep] = useState<1 | 2>(1);
  const [passcodeStep, setPasscodeStep] = useState<"verify" | "setup" | "remove">("setup");
  const [securityError, setSecurityError] = useState("");

  const totalEntries = entries?.length || 0;
  const totalWords = entries?.reduce((acc, entry) => acc + (entry.content?.split(/\s+/).length || 0), 0) || 0;
  const maxStreak = entries ? calculateMaxStreak(entries) : 0;
  
  const profileStats = [
    { label: "Entries", value: totalEntries.toString() },
    { label: "Words", value: totalWords > 1000 ? `${(totalWords / 1000).toFixed(1)}k` : totalWords.toString() },
    { label: "Best Streak", value: `${maxStreak}d` },
  ];

  const writingSince = profile?.createdAt 
    ? new Date(profile.createdAt).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
    : "January 2024";

  const toggleDarkMode = async () => {
    if (profile) {
      const nextValue = !profile.darkMode;
      await db.settings.update('current_user', { darkMode: nextValue });
    }
  };

  const handlePasscodeComplete = async (code: string) => {
    if (passcodeStep === "verify") {
      if (code === profile?.passcode) {
        setPasscodeStep("setup");
        setSecurityError("");
      } else {
        setSecurityError("Incorrect passcode. Try again.");
      }
    } else {
      await db.settings.update('current_user', { passcode: code });
      sessionStorage.setItem("reflect_authenticated", "true");
      setIsSecurityModalOpen(false);
      setSecurityError("");
    }
  };

  const removePasscode = async () => {
    if (passcodeStep !== "remove") {
      setPasscodeStep("remove");
      return;
    }
    await db.settings.update('current_user', { passcode: undefined });
    sessionStorage.removeItem("reflect_authenticated");
    setIsSecurityModalOpen(false);
  };

  const openSecurityModal = () => {
    if (profile?.passcode) {
      setPasscodeStep("verify");
    } else {
      setPasscodeStep("setup");
    }
    setSecurityError("");
    setIsSecurityModalOpen(true);
  };

  const handleEditName = () => {
    setNewName(profile?.name || "");
    setIsEditingName(true);
  };

  const saveName = async () => {
    if (newName.trim()) {
      await db.settings.update('current_user', { name: newName.trim() });
      setIsEditingName(false);
    }
  };

  const exportData = async () => {
    const allData = {
      profile,
      entries
    };
    const blob = new Blob([JSON.stringify(allData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `reflect-backup-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const executeDeleteAllData = async () => {
    await db.delete();
    window.location.href = "/";
  };

  const startDeleteProcess = () => {
    setIsDataModalOpen(false);
    setDeleteStep(1);
    setIsDeleteModalOpen(true);
  };

  const settingsOptions = [
    { 
      icon: Moon, 
      label: "Dark Mode", 
      description: "Easier on eyes at night", 
      type: "toggle", 
      active: profile?.darkMode,
      onClick: toggleDarkMode
    },
    { 
      icon: Lock, 
      label: "Passcode Lock", 
      description: profile?.passcode ? "Lock is active" : "Keep your thoughts private", 
      type: "button", 
      onClick: openSecurityModal 
    },
    { 
      icon: Shield, 
      label: "Privacy & Data", 
      description: "Export or delete entries", 
      type: "button",
      onClick: () => setIsDataModalOpen(true)
    },
  ];

  if (!profile) return null;

  return (
    <AnimatedScreen>
      <div className="mx-auto max-w-2xl px-4 pb-20 md:pb-8">
        <header className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white">Account</h1>
        </header>

        <section className="mb-8 overflow-hidden rounded-3xl bg-white dark:bg-gray-800 shadow-sm ring-1 ring-gray-200 dark:ring-gray-700">
          <div className="h-32 bg-indigo-600 sm:h-40" />
          <div className="relative px-6 pb-8 md:px-8">
            <div className="-mt-12 mb-6 sm:-mt-16">
              <img
                src={profile.avatarUrl}
                alt={profile.name}
                className="h-24 w-24 rounded-full bg-indigo-600 border-4 border-white dark:border-gray-800 bg-white object-cover shadow-md sm:h-32 sm:w-32"
              />
            </div>
            
            <div className="group relative">
              <div className="flex items-center gap-2">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{profile.name}</h2>
                <button 
                  onClick={handleEditName}
                  className="opacity-100 md:opacity-0 md:group-hover:opacity-100 p-1.5 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-400 dark:text-gray-500 transition-all active:scale-90"
                >
                  <Pencil className="h-4 w-4" />
                </button>
              </div>
              <p className="text-gray-500 dark:text-gray-400 text-sm">Writing since {writingSince}</p>
            </div>

            <div className="mt-8 grid grid-cols-3 gap-4 border-t border-gray-100 dark:border-gray-700 pt-8">
              {profileStats.map((stat) => (
                <div key={stat.label} className="text-center">
                  <dt className="text-xs font-medium uppercase tracking-wider text-gray-400 dark:text-gray-500">{stat.label}</dt>
                  <dd className="mt-1 text-2xl font-bold text-gray-900 dark:text-white">{stat.value}</dd>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
            <Settings className="h-5 w-5" />
            App Settings
          </h3>
          <div className="grid gap-3">
            {settingsOptions.map((option) => (
              <button
                key={option.label}
                onClick={option.onClick}
                className="flex items-center justify-between rounded-2xl bg-white dark:bg-gray-800 p-4 shadow-sm ring-1 ring-gray-100 dark:ring-gray-700 transition-all hover:ring-indigo-100 dark:hover:ring-indigo-900 text-left w-full"
              >
                <div className="flex items-center gap-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400">
                    <option.icon className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">{option.label}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">{option.description}</p>
                  </div>
                </div>
                {option.type === "toggle" ? (
                  <div className={`h-6 w-11 rounded-full p-1 transition-colors ${option.active ? "bg-indigo-600" : "bg-gray-200 dark:bg-gray-700"}`}>
                    <div className={`h-4 w-4 rounded-full bg-white shadow-sm transition-transform ${option.active ? "translate-x-5" : "translate-x-0"}`} />
                  </div>
                ) : (
                  <div className="text-gray-300 dark:text-gray-600">
                    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="9 5l7 7-7 7" />
                    </svg>
                  </div>
                )}
              </button>
            ))}
          </div>
        </section>

        {/* Edit Name Modal/Drawer */}
        <AnimatePresence>
          {isEditingName && (
            <Portal>
              <div className="fixed inset-0 z-[99999] flex items-end justify-center sm:items-center p-0 sm:p-4">
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  onClick={() => setIsEditingName(false)}
                  className="fixed inset-0 bg-gray-900/60 backdrop-blur-md"
                />
                <motion.div
                  initial={{ y: "100%", opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  exit={{ y: "100%", opacity: 0 }}
                  className="relative z-[100000] w-full max-w-sm rounded-t-[32px] sm:rounded-3xl bg-white dark:bg-gray-800 p-8 shadow-2xl ring-1 ring-black/5"
                >
                  <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400">
                    <Pencil className="h-8 w-8" />
                  </div>
                  <h3 className="mb-2 text-xl font-bold text-gray-900 dark:text-white">Edit your name</h3>
                  <p className="mb-8 text-gray-500 dark:text-gray-400 text-sm">This is how we'll address you across the app.</p>
                  <input
                    type="text"
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    className="w-full rounded-xl bg-gray-50 dark:bg-gray-900 px-4 py-3 text-gray-900 dark:text-white border-none outline-none focus:outline-none focus:ring-2 focus:ring-indigo-600 dark:focus:ring-indigo-500 mb-8"
                    placeholder="Your name"
                    autoFocus
                  />
                  <div className="flex gap-3">
                    <button
                      onClick={() => setIsEditingName(false)}
                      className="flex-1 rounded-xl bg-gray-100 dark:bg-gray-700 px-4 py-3 text-sm font-semibold text-gray-900 dark:text-white transition-colors hover:bg-gray-200 dark:hover:bg-gray-600"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={saveName}
                      disabled={!newName.trim()}
                      className="flex-1 flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 py-3 text-sm font-semibold text-white transition-colors hover:bg-indigo-700 shadow-md shadow-indigo-200 dark:shadow-none disabled:opacity-50"
                    >
                      <Save className="h-4 w-4" />
                      Save
                    </button>
                  </div>
                </motion.div>
              </div>
            </Portal>
          )}
        </AnimatePresence>

        {/* Privacy & Data Modal/Drawer */}
        <AnimatePresence>
          {isDataModalOpen && (
            <Portal>
              <div className="fixed inset-0 z-[99999] flex items-end justify-center sm:items-center p-0 sm:p-4">
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  onClick={() => setIsDataModalOpen(false)}
                  className="fixed inset-0 bg-gray-900/60 backdrop-blur-md"
                />
                <motion.div
                  initial={{ y: "100%", opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  exit={{ y: "100%", opacity: 0 }}
                  className="relative z-[100000] w-full max-w-sm rounded-t-[32px] sm:rounded-3xl bg-white dark:bg-gray-800 p-8 shadow-2xl ring-1 ring-black/5"
                >
                  <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400">
                    <Shield className="h-8 w-8" />
                  </div>
                  <h3 className="mb-2 text-xl font-bold text-gray-900 dark:text-white">Privacy & Data</h3>
                  <p className="mb-8 text-gray-500 dark:text-gray-400 text-sm">Download your information or clear your local storage.</p>
                  
                  <div className="space-y-3 mb-8">
                    <button
                      onClick={exportData}
                      className="w-full flex items-center justify-between rounded-2xl bg-indigo-50 dark:bg-indigo-900/20 p-4 text-left group"
                    >
                      <div className="flex items-center gap-3">
                        <Download className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
                        <div>
                          <p className="font-semibold text-indigo-900 dark:text-indigo-100">Export as JSON</p>
                          <p className="text-xs text-indigo-700/60 dark:text-indigo-400/60">Download all entries and settings</p>
                        </div>
                      </div>
                    </button>

                    <button
                      onClick={startDeleteProcess}
                      className="w-full flex items-center justify-between rounded-2xl bg-red-50 dark:bg-red-900/20 p-4 text-left group"
                    >
                      <div className="flex items-center gap-3">
                        <Trash2 className="h-5 w-5 text-red-600 dark:text-red-400" />
                        <div>
                          <p className="font-semibold text-red-900 dark:text-red-100">Delete All Data</p>
                          <p className="text-xs text-red-700/60 dark:text-red-400/60">Permanently clear local database</p>
                        </div>
                      </div>
                    </button>
                  </div>

                  <button
                    onClick={() => setIsDataModalOpen(false)}
                    className="w-full rounded-xl bg-gray-100 dark:bg-gray-700 px-4 py-3 text-sm font-semibold text-gray-900 dark:text-white transition-colors hover:bg-gray-200 dark:hover:bg-gray-600"
                  >
                    Close
                  </button>
                </motion.div>
              </div>
            </Portal>
          )}
        </AnimatePresence>

        {/* Delete Confirmation Modal */}
        <AnimatePresence>
          {isDeleteModalOpen && (
            <Portal>
              <div className="fixed inset-0 z-[99999] flex items-end justify-center sm:items-center p-0 sm:p-4">
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  onClick={() => setIsDeleteModalOpen(false)}
                  className="fixed inset-0 bg-gray-900/60 backdrop-blur-md"
                />
                <motion.div
                  initial={{ y: "100%", opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  exit={{ y: "100%", opacity: 0 }}
                  className="relative z-[100000] w-full max-w-sm rounded-t-[32px] sm:rounded-3xl bg-white dark:bg-gray-800 p-8 shadow-2xl ring-1 ring-black/5 flex flex-col items-center text-center"
                >
                  <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/40 text-red-600 dark:text-red-400">
                    <Trash2 className="h-8 w-8" />
                  </div>
                  <h3 className="mb-2 text-xl font-bold text-gray-900 dark:text-white">
                    {deleteStep === 1 ? "Wipe local data?" : "Are you absolutely sure?"}
                  </h3>
                  <p className="mb-8 text-gray-500 dark:text-gray-400 text-sm">
                    {deleteStep === 1 
                      ? "This will delete all your entries, settings, and streaks from this device." 
                      : "This action is completely irreversible. All your journal entries will be lost forever."}
                  </p>
                  
                  <div className="w-full space-y-3">
                    <button
                      onClick={() => {
                        if (deleteStep === 1) {
                          setDeleteStep(2);
                        } else {
                          executeDeleteAllData();
                        }
                      }}
                      className="w-full rounded-xl bg-red-600 px-4 py-3 text-sm font-bold text-white transition-colors hover:bg-red-700 shadow-sm"
                    >
                      {deleteStep === 1 ? "Yes, wipe it out" : "Confirm permanent deletion"}
                    </button>
                    <button
                      onClick={() => setIsDeleteModalOpen(false)}
                      className="w-full rounded-xl bg-gray-100 dark:bg-gray-700 px-4 py-3 text-sm font-semibold text-gray-900 dark:text-white transition-colors hover:bg-gray-200 dark:hover:bg-gray-600"
                    >
                      Cancel
                    </button>
                  </div>
                </motion.div>
              </div>
            </Portal>
          )}
        </AnimatePresence>

        {/* Security / Passcode Modal */}
        <AnimatePresence>
          {isSecurityModalOpen && (
            <Portal>
              <div className="fixed inset-0 z-[99999] flex items-end justify-center sm:items-center p-0 sm:p-4">
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  onClick={() => setIsSecurityModalOpen(false)}
                  className="fixed inset-0 bg-gray-900/60 backdrop-blur-md"
                />
                <motion.div
                  initial={{ y: "100%", opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  exit={{ y: "100%", opacity: 0 }}
                  className="relative z-[100000] w-full max-w-sm rounded-t-[32px] sm:rounded-3xl bg-white dark:bg-gray-800 p-8 shadow-2xl ring-1 ring-black/5"
                >
                  <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400">
                    <Lock className="h-8 w-8" />
                  </div>
                  
                  <h3 className="mb-2 text-xl font-bold text-gray-900 dark:text-white">
                    {passcodeStep === "verify" ? "Verify identity" : passcodeStep === "remove" ? "Remove passcode" : profile?.passcode ? "Change passcode" : "Setup passcode"}
                  </h3>
                  <p className="mb-10 text-gray-500 dark:text-gray-400 text-sm">
                    {passcodeStep === "verify" 
                      ? "Enter your current passcode to continue." 
                      : passcodeStep === "remove"
                      ? "Are you sure you want to remove the passcode lock?"
                      : "Enter a 6-digit alphanumeric code to secure your entries."}
                  </p>

                  {passcodeStep !== "remove" && (
                    <motion.div
                      animate={securityError ? { x: [-10, 10, -10, 10, 0] } : {}}
                      transition={{ duration: 0.4 }}
                    >
                      <PasscodeInput 
                        key={passcodeStep} 
                        onComplete={handlePasscodeComplete} 
                      />
                    </motion.div>
                  )}

                  {securityError && passcodeStep !== "remove" && (
                    <p className="mt-4 text-center text-sm font-medium text-red-500">{securityError}</p>
                  )}

                  <div className="mt-10 flex flex-col gap-3">
                    {passcodeStep === "setup" && profile?.passcode && (
                      <button
                        onClick={removePasscode}
                        className="w-full flex items-center justify-center gap-2 rounded-xl bg-red-50 dark:bg-red-900/20 px-4 py-3 text-sm font-semibold text-red-600 dark:text-red-400 transition-colors hover:bg-red-100 dark:hover:bg-red-900/40"
                      >
                        <Trash2 className="h-4 w-4" />
                        Remove Passcode
                      </button>
                    )}
                    {passcodeStep === "remove" && (
                      <button
                        onClick={removePasscode}
                        className="w-full flex items-center justify-center gap-2 rounded-xl bg-red-600 text-white px-4 py-3 text-sm font-semibold transition-colors hover:bg-red-700"
                      >
                        Yes, Remove
                      </button>
                    )}
                    <button
                      onClick={() => {
                        if (passcodeStep === "remove") {
                          setPasscodeStep("setup");
                        } else {
                          setIsSecurityModalOpen(false);
                        }
                      }}
                      className="w-full rounded-xl bg-gray-100 dark:bg-gray-700 px-4 py-3 text-sm font-semibold text-gray-900 dark:text-white transition-colors hover:bg-gray-200 dark:hover:bg-gray-600"
                    >
                      Cancel
                    </button>
                  </div>
                </motion.div>
              </div>
            </Portal>
          )}
        </AnimatePresence>
      </div>
    </AnimatedScreen>
  );
}
