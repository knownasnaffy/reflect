import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useLiveQuery } from "dexie-react-hooks";
import { Pencil, Trash2, ArrowLeft, Calendar, Clock, AlertCircle } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { db } from "../lib/db";
import { AnimatedScreen } from "../components/AnimatedScreen";
import { JournalEntry } from "../types";

export function ViewEntry() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const entry = useLiveQuery(() => db.entries.get(Number(id)), [id]);

  const handleDelete = async () => {
    try {
      await db.entries.delete(Number(id));
      navigate("/timeline");
    } catch (err) {
      console.error("Failed to delete entry:", err);
    }
  };

  if (!entry && entry !== undefined) {
    return (
      <AnimatedScreen>
        <div className="flex flex-col items-center justify-center py-20">
          <h2 className="text-2xl font-bold text-gray-900">Entry not found</h2>
          <Link to="/" className="mt-4 text-indigo-600 hover:underline">Back to Home</Link>
        </div>
      </AnimatedScreen>
    );
  }

  if (!entry) return null;

  return (
    <AnimatedScreen>
      <div className="mx-auto max-w-3xl">
        <AnimatePresence>
          {showDeleteConfirm && (
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setShowDeleteConfirm(false)}
                className="absolute inset-0 bg-gray-900/40 backdrop-blur-sm"
              />
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 10 }}
                className="relative w-full max-w-sm rounded-3xl bg-white p-8 shadow-2xl ring-1 ring-black/5"
              >
                <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-red-50 text-red-600">
                  <AlertCircle className="h-8 w-8" />
                </div>
                <h3 className="mb-2 text-xl font-bold text-gray-900">Delete Entry?</h3>
                <p className="mb-8 text-gray-500">This action cannot be undone. Your reflection will be permanently removed.</p>
                <div className="flex gap-3">
                  <button
                    onClick={() => setShowDeleteConfirm(false)}
                    className="flex-1 rounded-xl bg-gray-100 px-4 py-3 text-sm font-semibold text-gray-900 transition-colors hover:bg-gray-200"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleDelete}
                    className="flex-1 rounded-xl bg-red-600 px-4 py-3 text-sm font-semibold text-white transition-colors hover:bg-red-700 shadow-md shadow-red-200"
                  >
                    Delete
                  </button>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        <header className="mb-8 flex items-center justify-between">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-900"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </button>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowDeleteConfirm(true)}
              className="p-2 rounded-full text-gray-400 hover:bg-red-50 hover:text-red-600 transition-colors"
              title="Delete Entry"
            >
              <Trash2 className="h-5 w-5" />
            </button>
            <Link
              to={`/write/${id}`}
              className="flex items-center gap-2 rounded-xl bg-indigo-600 px-5 py-2 text-sm font-semibold text-white shadow-sm transition-all hover:bg-indigo-700 active:scale-95"
            >
              <Pencil className="h-4 w-4" />
              Edit Entry
            </Link>
          </div>
        </header>

        <article className="overflow-hidden rounded-3xl bg-white shadow-sm ring-1 ring-gray-200">
          <div className="aspect-video w-full overflow-hidden bg-gray-100">
            <img
              src={entry.imageUrl}
              alt={entry.title}
              className="h-full w-full object-cover"
            />
          </div>
          
          <div className="px-6 py-8 md:px-12 md:py-12">
            <div className="mb-6 flex flex-wrap items-center gap-6 text-sm text-gray-400">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                <span>{new Date(entry.date).toLocaleDateString(undefined, { dateStyle: 'long' })}</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4" />
                <span>{entry.content.split(/\s+/).length} words</span>
              </div>
            </div>

            <h1 className="mb-8 text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl">
              {entry.title}
            </h1>

            <div 
              className="markdown-body prose prose-indigo max-w-none prose-lg text-gray-600 leading-relaxed"
              dangerouslySetInnerHTML={{ __html: entry.content }}
            />
          </div>
        </article>

        <footer className="mt-12 border-t border-gray-100 pt-8 text-center">
          <p className="text-sm text-gray-400 italic">
            "We do not learn from experience... we learn from reflecting on experience."
          </p>
        </footer>
      </div>
    </AnimatedScreen>
  );
}
