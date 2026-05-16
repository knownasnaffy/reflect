import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { Bold, Italic, List, ListOrdered, Quote, Undo, Redo, Save, X, Image as ImageIcon } from "lucide-react";
import { motion } from "motion/react";
import { db } from "../lib/db";
import { AnimatedScreen } from "../components/AnimatedScreen";

export function Write() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [title, setTitle] = useState("");
  const [isSaving, setIsSaving] = useState(false);

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
        }
      });
    }
  }, [id, editor]);

  const handleSave = async () => {
    if (!title.trim() || !editor) return;

    setIsSaving(true);
    const content = editor.getHTML();
    const description = editor.getText().slice(0, 150) + "...";
    
    const entryData = {
      title,
      description,
      content,
      imageUrl: "https://images.unsplash.com/photo-1512486130939-2c4f79935e4f?auto=format&fit=crop&q=80&w=800", // Default image
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
             <span>Photos integration coming soon</span>
           </div>
        </div>
      </div>
    </AnimatedScreen>
  );
}
