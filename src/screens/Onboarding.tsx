import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "motion/react";
import { Sparkles, ArrowRight, Database, Lock, ShieldCheck, UserCircle2 } from "lucide-react";
import { db, seedDatabase } from "../lib/db";
import { PasscodeInput } from "../components/PasscodeInput";
import { avatarSvgs, getAvatarDataUrl } from "../lib/avatars";

type OnboardingStep = "profile" | "avatar" | "passcode";

export function Onboarding() {
  const [step, setStep] = useState<OnboardingStep>("profile");
  const [name, setName] = useState("");
  const [selectedAvatar, setSelectedAvatar] = useState<string>(getAvatarDataUrl(avatarSvgs[0]));
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();

  const handleProfileSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    setStep("avatar");
  };

  const handleAvatarSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setStep("passcode");
  };

  const handleCompleteOnboarding = async (passcode?: string) => {
    setIsSubmitting(true);
    try {
      if (passcode) {
        sessionStorage.setItem("reflect_authenticated", "true");
      }
      await db.settings.add({
        id: 'current_user',
        name: name.trim(),
        avatarUrl: selectedAvatar,
        darkMode: false,
        createdAt: Date.now(),
        passcode: passcode || undefined
      });
      navigate("/");
    } catch (error) {
      console.error("Failed to save profile:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSeedMockData = async () => {
    setIsSubmitting(true);
    try {
      await seedDatabase();
      navigate("/");
    } catch (error) {
      console.error("Failed to seed database:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center p-4">
      <AnimatePresence mode="wait">
        {step === "profile" ? (
          <motion.div
            key="profile"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            className="w-full max-w-md bg-white dark:bg-gray-800 rounded-3xl p-8 md:p-12 shadow-xl shadow-gray-200/50 dark:shadow-none ring-1 ring-black/5"
          >
            <div className="mb-8 flex h-16 w-16 items-center justify-center rounded-2xl bg-indigo-600 text-white shadow-lg shadow-indigo-200 dark:shadow-none">
              <Sparkles className="h-8 w-8" />
            </div>

            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Welcome to Reflect</h1>
            <p className="text-gray-500 dark:text-gray-400 mb-8">Let's get started by setting up your profile.</p>

            <form onSubmit={handleProfileSubmit} className="space-y-6">
              <div>
                <label htmlFor="name" className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  What should we call you?
                </label>
                <input
                  type="text"
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Enter your name"
                  className="w-full rounded-2xl bg-gray-50 dark:bg-gray-900 px-4 py-4 text-gray-900 dark:text-white border-none outline-none focus:ring-2 focus:ring-indigo-600 dark:focus:ring-indigo-500 transition-all font-medium"
                  autoFocus
                  required
                />
              </div>

              <button
                type="submit"
                disabled={!name.trim() || isSubmitting}
                className="w-full flex items-center justify-center gap-2 rounded-2xl bg-indigo-600 py-4 text-sm font-bold text-white transition-all hover:bg-indigo-700 active:scale-[0.98] disabled:opacity-50 shadow-lg shadow-indigo-100 dark:shadow-none"
              >
                Continue
                <ArrowRight className="h-4 w-4" />
              </button>
            </form>

            <div className="relative my-10">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-100 dark:border-gray-700"></div>
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-white dark:bg-gray-800 px-4 text-gray-400 font-medium">Or</span>
              </div>
            </div>

            <button
              onClick={handleSeedMockData}
              disabled={isSubmitting}
              className="w-full flex items-center justify-center gap-3 rounded-2xl bg-gray-50 dark:bg-gray-900/50 py-4 text-sm font-semibold text-gray-600 dark:text-gray-400 transition-all hover:bg-gray-100 dark:hover:bg-gray-900 active:scale-[0.98] border border-gray-100 dark:border-gray-700"
            >
              <Database className="h-4 w-4" />
              Continue with demo data
            </button>
          </motion.div>
        ) : step === "avatar" ? (
          <motion.div
            key="avatar"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="w-full max-w-md bg-white dark:bg-gray-800 rounded-3xl p-8 md:p-12 shadow-xl shadow-gray-200/50 dark:shadow-none ring-1 ring-black/5"
          >
            <div className="mb-8 flex h-16 w-16 items-center justify-center rounded-2xl bg-indigo-600 text-white shadow-lg shadow-indigo-200 dark:shadow-none">
              <UserCircle2 className="h-8 w-8" />
            </div>

            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Pick an avatar</h1>
            <p className="text-gray-500 dark:text-gray-400 mb-8">Choose a profile picture that represents you best.</p>

            <form onSubmit={handleAvatarSubmit} className="space-y-8">
              <div className="flex gap-4 overflow-x-auto py-6 -my-6 px-4 -mx-4 snap-x snap-mandatory scrollbar-hide">
                {avatarSvgs.map((svg, idx) => {
                  const dataUrl = getAvatarDataUrl(svg);
                  const isSelected = selectedAvatar === dataUrl;
                  return (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setSelectedAvatar(dataUrl)}
                      className={`relative flex-none w-32 aspect-square rounded-full overflow-hidden border-4 transition-all duration-200 snap-center ${
                        isSelected 
                          ? 'border-indigo-600 shadow-xl shadow-indigo-200 dark:shadow-none scale-105 mx-2' 
                          : 'border-transparent hover:scale-[1.02] hover:shadow-md'
                      }`}
                    >
                      <img src={dataUrl} alt={`Avatar option ${idx + 1}`} className="w-full h-full object-cover" />
                    </button>
                  );
                })}
              </div>

              <div className="pt-8">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full flex items-center justify-center gap-2 rounded-2xl bg-indigo-600 py-4 text-sm font-bold text-white transition-all hover:bg-indigo-700 active:scale-[0.98] disabled:opacity-50 shadow-lg shadow-indigo-100 dark:shadow-none"
                >
                  Continue
                  <ArrowRight className="h-4 w-4" />
                </button>
              </div>
            </form>
          </motion.div>
        ) : (
          <motion.div
            key="passcode"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="w-full max-w-md bg-white dark:bg-gray-800 rounded-3xl p-8 md:p-12 shadow-xl shadow-gray-200/50 dark:shadow-none ring-1 ring-black/5 text-center"
          >
            <div className="mx-auto mb-8 flex h-16 w-16 items-center justify-center rounded-2xl bg-indigo-600 text-white shadow-lg shadow-indigo-200 dark:shadow-none">
              <Lock className="h-8 w-8" />
            </div>

            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Secure your app</h2>
            <p className="text-gray-500 dark:text-gray-400 mb-10">Setup a 6-digit alphanumeric passcode to protect your journal entries.</p>

            <div className="space-y-10">
              <PasscodeInput onComplete={handleCompleteOnboarding} isLoading={isSubmitting} />

              <div className="pt-4">
                <button
                  onClick={() => handleCompleteOnboarding()}
                  className="text-sm font-semibold text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                >
                  Skip for now
                </button>
              </div>
            </div>

            <div className="mt-12 flex items-center justify-center gap-2 text-xs text-gray-400 font-medium">
              <ShieldCheck className="h-4 w-4" />
              <span>Full privacy enabled</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

