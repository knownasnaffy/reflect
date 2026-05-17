import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { Bold, Italic, List, ListOrdered, Quote, Undo, Redo, Save, X, Image as ImageIcon, Trash2, Camera, Link as LinkIcon, Sparkles, RefreshCw } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { db } from "../lib/db";
import { AnimatedScreen } from "../components/AnimatedScreen";
import { Portal } from "../components/Portal";

export function Write() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [title, setTitle] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [imageBlob, setImageBlob] = useState<Blob | null>(null);
  const [imageUrl, setImageUrl] = useState("https://images.unsplash.com/photo-1512486130939-2c4f79935e4f?auto=format&fit=crop&q=80&w=800");
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isImageModalOpen, setIsImageModalOpen] = useState(false);
  const [imageLink, setImageLink] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [imageGenError, setImageGenError] = useState<string | null>(null);
  const [hasGeminiKey, setHasGeminiKey] = useState<boolean>(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetch("/api/gemini/status")
      .then(res => res.json())
      .then(data => setHasGeminiKey(data.hasKey))
      .catch(() => setHasGeminiKey(false));
  }, []);

  const editor = useEditor({
    extensions: [StarterKit],
    content: "",
    editorProps: {
      attributes: {
        class: "prose prose-indigo dark:prose-invert max-w-none focus:outline-none min-h-[400px] text-lg transition-colors",
      },
    },
  });

  useEffect(() => {
    if (id) {
      db.entries.get(Number(id)).then((entry) => {
        if (entry) {
          setTitle(entry.title);
          editor?.commands.setContent(entry.content);
          setImageUrl(entry.imageUrl);
          if (entry.imageBlob) {
            setImageBlob(entry.imageBlob);
            setImagePreview(URL.createObjectURL(entry.imageBlob));
          } else {
            setImagePreview(entry.imageUrl);
          }
        }
      });
    }
  }, [id, editor]);

  // Cleanup preview URL on unmount
  useEffect(() => {
    return () => {
      if (imagePreview) {
        URL.revokeObjectURL(imagePreview);
      }
    };
  }, [imagePreview]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageBlob(file);
      setImageUrl(""); // Clear URL when uploading blob
      setImageGenError(null);
      if (imagePreview && imagePreview.startsWith('blob:')) URL.revokeObjectURL(imagePreview);
      setImagePreview(URL.createObjectURL(file));
      setIsImageModalOpen(false);
    }
  };

  const handleApplyLink = () => {
    if (imageLink.trim()) {
      setImageUrl(imageLink);
      setImageBlob(null);
      setImageGenError(null);
      setImagePreview(imageLink);
      setIsImageModalOpen(false);
      setImageLink("");
    }
  };

  const handleRandomUnsplash = () => {
    const fillerWords = new Set(["a", "an", "the", "and", "or", "but", "in", "on", "at", "to", "for", "with", "is", "are", "was", "were", "my", "your", "his", "her", "their", "of", "how", "what", "why", "where"]);
    
    const keywords = title
      .toLowerCase()
      .replace(/[^\w\s]/gi, '')
      .split(' ')
      .filter(word => word.length > 2 && !fillerWords.has(word))
      .slice(0, 3)
      .join(',');

    const searchTerms = keywords || 'nature,minimalist';
    // Unsplash Source was deprecated, using LoremFlickr as alternative
    const photoUrl = `https://loremflickr.com/1200/600/${searchTerms}/all?lock=${Date.now()}`;
    
    setImageUrl(photoUrl);
    setImageBlob(null);
    setImageGenError(null);
    setImagePreview(photoUrl);
    setIsImageModalOpen(false);
  };

  const generateAIImage = async () => {
    if (!title.trim() && !editor?.getText().trim()) {
      alert("Please write something first so AI has context!");
      return;
    }

    setIsGenerating(true);
    setImageGenError(null);
    try {
      const response = await fetch("/api/gemini/generate-image", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          content: editor?.getText() || ""
        })
      });

      const data = await response.json();
      if (response.status === 429) {
        throw new Error("QUOTA_EXHAUSTED");
      }
      if (data.error) throw new Error(data.error);

      // Convert base64 to Blob
      const byteCharacters = atob(data.imageData);
      const byteArrays = [];
      for (let offset = 0; offset < byteCharacters.length; offset += 512) {
        const slice = byteCharacters.slice(offset, offset + 512);
        const byteNumbers = new Array(slice.length);
        for (let i = 0; i < slice.length; i++) {
          byteNumbers[i] = slice.charCodeAt(i);
        }
        const byteArray = new Uint8Array(byteNumbers);
        byteArrays.push(byteArray);
      }
      const blob = new Blob(byteArrays, { type: 'image/png' });
      
      setImageBlob(blob);
      setImageUrl("");
      if (imagePreview && imagePreview.startsWith('blob:')) URL.revokeObjectURL(imagePreview);
      setImagePreview(URL.createObjectURL(blob));
      setIsImageModalOpen(false);
    } catch (error: any) {
      console.error("AI Generation failed:", error);
      if (error.message === "QUOTA_EXHAUSTED") {
        setImageGenError("You've reached the free quota for image generation. High-quality image generation typically requires a billing-enabled Gemini API key.");
      } else {
        setImageGenError(error.message || "Failed to generate image. Please check your connection and API key.");
      }
    } finally {
      setIsGenerating(false);
    }
  };

  const removeImage = () => {
    setImageBlob(null);
    const fallback = "https://images.unsplash.com/photo-1512486130939-2c4f79935e4f?auto=format&fit=crop&q=80&w=800";
    setImageUrl(fallback);
    if (imagePreview && imagePreview.startsWith('blob:')) URL.revokeObjectURL(imagePreview);
    setImagePreview(fallback);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleSave = async () => {
    if (!title.trim() || !editor) return;

    setIsSaving(true);
    const content = editor.getHTML();
    const description = editor.getText().slice(0, 150) + "...";
    
    const entryData = {
      title,
      description,
      content,
      imageUrl: imageUrl || "https://images.unsplash.com/photo-1512486130939-2c4f79935e4f?auto=format&fit=crop&q=80&w=800",
      imageBlob: imageBlob || undefined,
      date: new Date().toISOString().split('T')[0],
      createdAt: Date.now(),
    };

    try {
      if (id) {
        await db.entries.update(Number(id), entryData);
      } else {
        await db.entries.add(entryData);
      }
      navigate("/timeline");
    } catch (error) {
      console.error("Failed to save entry:", error);
    } finally {
      setIsSaving(false);
    }
  };

  if (!editor) return null;

  const MenuButton = ({ onClick, isActive, children, title }: any) => (
    <button
      onClick={onClick}
      title={title}
      className={`p-2 rounded-lg transition-colors ${
        isActive 
          ? "bg-indigo-100 dark:bg-indigo-900/40 text-indigo-600 dark:text-indigo-400" 
          : "text-gray-400 dark:text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-gray-600 dark:hover:text-gray-300"
      }`}
    >
      {children}
    </button>
  );

  return (
    <AnimatedScreen>
      <div className="mx-auto max-w-4xl">
        <header className="mb-6 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate(-1)}
              className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500 dark:text-gray-400 transition-colors"
            >
              <X className="h-6 w-6" />
            </button>
            <h1 className="text-xl font-semibold text-gray-900 dark:text-white transition-colors">
              {id ? "Edit Entry" : "New Entry"}
            </h1>
          </div>
          <button
            onClick={handleSave}
            disabled={isSaving || !title.trim()}
            className="flex items-center gap-2 rounded-xl bg-indigo-600 px-6 py-2.5 text-sm font-semibold text-white shadow-sm transition-all hover:bg-indigo-700 disabled:opacity-50 active:scale-95 shadow-indigo-100 dark:shadow-none"
          >
            <Save className="h-4 w-4" />
            {isSaving ? "Saving..." : "Save Entry"}
          </button>
        </header>

        <div className="rounded-3xl bg-white dark:bg-gray-800 p-6 md:p-10 shadow-sm ring-1 ring-gray-200 dark:ring-gray-700 transition-colors">
          <input
            type="text"
            placeholder="Title of your reflection..."
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full border-none p-0 text-3xl font-bold text-gray-900 dark:text-white placeholder:text-gray-300 dark:placeholder:text-gray-600 focus:outline-none focus:ring-0 mb-8 bg-transparent transition-colors"
          />

          {/* Image Upload Selection */}
          <div className="mb-8">
            <input 
              type="file" 
              ref={fileInputRef}
              onChange={handleImageChange}
              accept="image/*"
              className="hidden"
            />
            
            <div className="relative group overflow-hidden rounded-2xl shadow-sm ring-1 ring-black/5 bg-gray-100 dark:bg-gray-800">
              {imagePreview ? (
                <img 
                  src={imagePreview} 
                  alt="Entry preview" 
                  className="w-full aspect-video object-cover transition-opacity duration-300 group-hover:opacity-90 grayscale-[20%] group-hover:grayscale-0"
                  referrerPolicy="no-referrer"
                />
              ) : (
                <div className="w-full aspect-video flex flex-col items-center justify-center text-gray-400">
                  <ImageIcon className="h-12 w-12 mb-2" />
                  <span className="text-sm font-medium">No cover image</span>
                </div>
              )}
              
              <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity">
                <div className="flex gap-4">
                  <button 
                    onClick={() => {
                      setIsImageModalOpen(true);
                      setImageGenError(null);
                    }}
                    className="flex items-center gap-2 px-4 py-2 bg-white text-gray-900 rounded-xl font-semibold hover:scale-105 transition-transform shadow-lg"
                  >
                    <ImageIcon className="h-4 w-4" />
                    Change Cover
                  </button>
                  {imagePreview && (
                    <button 
                      onClick={removeImage}
                      className="p-3 bg-red-500 text-white rounded-xl hover:scale-105 transition-transform shadow-lg"
                      title="Remove cover"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>

          <AnimatePresence>
            {isImageModalOpen && (
              <Portal>
                <div className="fixed inset-0 z-[1000] flex items-end justify-center sm:items-center p-0 sm:p-4">
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={() => setIsImageModalOpen(false)}
                    className="fixed inset-0 bg-gray-900/60 backdrop-blur-sm"
                  />
                  <motion.div
                    initial={{ y: "100%", opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    exit={{ y: "100%", opacity: 0 }}
                    className="relative z-[1001] w-full max-w-lg rounded-t-[32px] sm:rounded-3xl bg-white dark:bg-gray-800 p-6 shadow-2xl ring-1 ring-black/5"
                  >
                    <div className="flex items-center justify-between mb-6">
                      <h3 className="text-xl font-bold text-gray-900 dark:text-white">Choose Cover Image</h3>
                      <button 
                        onClick={() => setIsImageModalOpen(false)}
                        className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500"
                      >
                        <X className="h-5 w-5" />
                      </button>
                    </div>

                      <div className="grid grid-cols-1 gap-4 overflow-y-auto max-h-[70vh]">
                        {/* Error Message */}
                        <AnimatePresence>
                          {imageGenError && (
                            <motion.div
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: "auto", opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              className="overflow-hidden"
                            >
                              <div className="p-4 rounded-2xl bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-900/30 text-red-600 dark:text-red-400 text-sm">
                                <div className="flex gap-3">
                                  <div className="shrink-0 p-1 bg-red-100 dark:bg-red-900/40 rounded-full h-fit">
                                    <X className="h-3 w-3" />
                                  </div>
                                  <div className="flex flex-col gap-2">
                                    <p className="font-medium">{imageGenError}</p>
                                    {imageGenError.includes("quota") && (
                                      <p className="text-xs opacity-80">
                                        You can provide a paid API key in the <strong>Settings &gt; Secrets</strong> panel of AI Studio.
                                      </p>
                                    )}
                                  </div>
                                </div>
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>

                        {/* AI Search Section at top because it's the coolest */}
                        {hasGeminiKey && (
                          <div className="flex flex-col gap-3 p-4 rounded-2xl bg-indigo-50/50 dark:bg-indigo-900/10 border border-indigo-100 dark:border-indigo-800/30">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <div className="p-2 bg-white dark:bg-gray-800 rounded-lg shadow-sm">
                                  <Sparkles className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
                                </div>
                                <div>
                                  <h4 className="font-semibold text-gray-900 dark:text-white">AI Generation</h4>
                                  <p className="text-xs text-gray-500">Based on your thoughts...</p>
                                </div>
                              </div>
                              <button 
                                onClick={generateAIImage}
                                disabled={isGenerating || (!title.trim() && !editor?.getText().trim())}
                                className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-xl text-sm font-bold hover:bg-indigo-700 transition-colors disabled:opacity-50"
                              >
                                {isGenerating ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
                                {isGenerating ? "Generating..." : "Generate"}
                              </button>
                            </div>
                          </div>
                        )}

                      <div className="grid grid-cols-2 gap-4">
                        <button 
                          onClick={() => fileInputRef.current?.click()}
                          className="flex flex-col items-center gap-3 p-6 rounded-2xl border-2 border-dashed border-gray-200 dark:border-gray-700 hover:border-indigo-500 hover:bg-indigo-50/50 dark:hover:bg-indigo-900/10 transition-all text-gray-500 hover:text-indigo-600 dark:hover:text-indigo-400"
                        >
                          <Camera className="h-6 w-6" />
                          <span className="text-sm font-semibold">Upload Image</span>
                        </button>
                        <button 
                          onClick={handleRandomUnsplash}
                          className="flex flex-col items-center gap-3 p-6 px-2 rounded-2xl border-2 border-dashed border-gray-200 dark:border-gray-700 hover:border-indigo-500 hover:bg-indigo-50/50 dark:hover:bg-indigo-900/10 transition-all text-gray-500 hover:text-indigo-600 dark:hover:text-indigo-400"
                        >
                          <RefreshCw className="h-6 w-6" />
                          <span className="text-sm font-semibold text-center">Photo from Title</span>
                        </button>
                      </div>

                      <div className="p-4 rounded-2xl bg-gray-50 dark:bg-gray-900 border border-gray-100 dark:border-gray-700">
                        <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Paste Image URL</label>
                        <div className="flex gap-2">
                          <input 
                            type="text" 
                            placeholder="https://images.unsplash.com/..."
                            value={imageLink}
                            onChange={(e) => setImageLink(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleApplyLink()}
                            className="flex-1 px-4 py-2 rounded-xl bg-white dark:bg-gray-800 border-none ring-1 ring-gray-200 dark:ring-gray-700 focus:ring-2 focus:ring-indigo-500 transition-all text-sm outline-none"
                          />
                          <button 
                            onClick={handleApplyLink}
                            disabled={!imageLink.trim()}
                            className="p-2 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-colors disabled:opacity-50"
                          >
                            <LinkIcon className="h-5 w-5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                </div>
              </Portal>
            )}
          </AnimatePresence>

          {/* Toolbar */}
          <div className="sticky top-4 z-20 mb-6 flex flex-wrap items-center gap-1 rounded-2xl bg-gray-50 dark:bg-gray-900/50 p-2 border border-gray-100 dark:border-gray-700 shadow-sm backdrop-blur-md transition-colors">
            <MenuButton
              onClick={() => editor.chain().focus().toggleBold().run()}
              isActive={editor.isActive("bold")}
              title="Bold"
            >
              <Bold className="h-5 w-5" />
            </MenuButton>
            <MenuButton
              onClick={() => editor.chain().focus().toggleItalic().run()}
              isActive={editor.isActive("italic")}
              title="Italic"
            >
              <Italic className="h-5 w-5" />
            </MenuButton>
            <div className="w-px h-6 bg-gray-200 dark:bg-gray-700 mx-1" />
            <MenuButton
              onClick={() => editor.chain().focus().toggleBulletList().run()}
              isActive={editor.isActive("bulletList")}
              title="Bullet List"
            >
              <List className="h-5 w-5" />
            </MenuButton>
            <MenuButton
              onClick={() => editor.chain().focus().toggleOrderedList().run()}
              isActive={editor.isActive("orderedList")}
              title="Ordered List"
            >
              <ListOrdered className="h-5 w-5" />
            </MenuButton>
            <MenuButton
              onClick={() => editor.chain().focus().toggleBlockquote().run()}
              isActive={editor.isActive("blockquote")}
              title="Quote"
            >
              <Quote className="h-5 w-5" />
            </MenuButton>
            <div className="w-px h-6 bg-gray-200 dark:bg-gray-700 mx-1" />
            <MenuButton
              onClick={() => editor.chain().focus().undo().run()}
              title="Undo"
            >
              <Undo className="h-5 w-5" />
            </MenuButton>
            <MenuButton
              onClick={() => editor.chain().focus().redo().run()}
              title="Redo"
            >
              <Redo className="h-5 w-5" />
            </MenuButton>
          </div>

          <EditorContent editor={editor} />
        </div>
        
        <div className="mt-8 flex items-center justify-center gap-8 text-gray-400">
           <div className="flex items-center gap-2 text-sm italic">
             <ImageIcon className="h-4 w-4" />
             <span>Photos are stored locally on this device</span>
           </div>
        </div>
      </div>
    </AnimatedScreen>
  );
}
