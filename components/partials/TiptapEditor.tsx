"use client";

import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Placeholder from "@tiptap/extension-placeholder";
import Link from "@tiptap/extension-link";
import { useEffect } from "react";
import TurndownService from "turndown";

interface TiptapEditorProps {
  content: string;
  onChange: (markdown: string) => void;
  placeholder?: string;
}

const turndownService = new TurndownService({
  headingStyle: "atx",
  bulletListMarker: "-",
});

export default function TiptapEditor({
  content,
  onChange,
  placeholder,
}: TiptapEditorProps) {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [1, 2, 3],
        },
      }),
      Placeholder.configure({
        placeholder: placeholder || "Write something beautiful...",
      }),
      Link.configure({
        openOnClick: false,
      }),
    ],
    content: "", // Initial content will be set via useEffect to handle Markdown-to-HTML conversion if needed
    editorProps: {
      attributes: {
        class:
          "focus:outline-none min-h-[500px] text-body-xl-regular text-text-body leading-relaxed",
      },
    },
    onUpdate: ({ editor }) => {
      const html = editor.getHTML();
      const markdown = turndownService.turndown(html);
      onChange(markdown);
    },
  });

  // Handle initial content and external changes
  useEffect(() => {
    if (editor && content !== undefined) {
      // Very simple Markdown to HTML for initial load (enough for bold/italic/headings)
      // For a robust solution, one might use 'marked' or similar, but let's try a simple approach
      // since we mostly care about the user editing a new or existing simple draft.

      // If the editor is empty and content exists, set it.
      if (editor.isEmpty && content) {
        // Simple conversion (only for initial load)
        const simpleHtml = content
          .replace(/^# (.*$)/gim, "<h1>$1</h1>")
          .replace(/^## (.*$)/gim, "<h2>$1</h2>")
          .replace(/^### (.*$)/gim, "<h3>$1</h3>")
          .replace(/\*\*(.*)\*\*/gim, "<strong>$1</strong>")
          .replace(/\*(.*)\*/gim, "<em>$1</em>")
          .replace(/^- (.*$)/gim, "<li>$1</li>");

        editor.commands.setContent(simpleHtml);
      }
    }
  }, [editor, content]);

  if (!editor) {
    return (
      <div className="animate-pulse bg-surface-background h-[500px] rounded-xl" />
    );
  }

  return (
    <div className="w-full block relative">
      {/* Floating/Sticky Toolbar Container */}
      <div className=" z-50 sticky top-20 rounded-xl left-0 right-0 bg-white py-4 shadow-sm border-b border-border-default  px-4 mb-6">
        <div className="flex items-center gap-1 p-1 bg-surface-background border border-border-default rounded-xl">
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleBold().run()}
            className={`p-2 rounded-lg transition-colors ${editor.isActive("bold") ? "bg-white shadow-sm text-primary-600" : "text-text-subheading hover:bg-white"}`}
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
            >
              <path d="M6 4h8a4 4 0 0 1 4 4 4 4 0 0 1-4 4H6z"></path>
              <path d="M6 12h9a4 4 0 0 1 4 4 4 4 0 0 1-4 4H6z"></path>
            </svg>
          </button>
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleItalic().run()}
            className={`p-2 rounded-lg transition-colors ${editor.isActive("italic") ? "bg-white shadow-sm text-primary-600" : "text-text-subheading hover:bg-white"}`}
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
            >
              <line x1="19" y1="4" x2="10" y2="4"></line>
              <line x1="14" y1="20" x2="5" y2="20"></line>
              <line x1="15" y1="4" x2="9" y2="20"></line>
            </svg>
          </button>
          <div className="w-px h-6 bg-border-default mx-1"></div>
          <button
            type="button"
            onClick={() =>
              editor.chain().focus().toggleHeading({ level: 2 }).run()
            }
            className={`px-3 py-1 rounded-lg transition-colors font-bold ${editor.isActive("heading", { level: 2 }) ? "bg-white shadow-sm text-primary-600" : "text-text-subheading hover:bg-white"}`}
          >
            H2
          </button>
          <button
            type="button"
            onClick={() =>
              editor.chain().focus().toggleHeading({ level: 3 }).run()
            }
            className={`px-3 py-1 rounded-lg transition-colors font-bold ${editor.isActive("heading", { level: 3 }) ? "bg-white shadow-sm text-primary-600" : "text-text-subheading hover:bg-white"}`}
          >
            H3
          </button>
          <div className="w-px h-6 bg-border-default mx-1"></div>
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleBulletList().run()}
            className={`p-2 rounded-lg transition-colors ${editor.isActive("bulletList") ? "bg-white shadow-sm text-primary-600" : "text-text-subheading hover:bg-white"}`}
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
            >
              <line x1="8" y1="6" x2="21" y2="6"></line>
              <line x1="8" y1="12" x2="21" y2="12"></line>
              <line x1="8" y1="18" x2="21" y2="18"></line>
              <line x1="3" y1="6" x2="3.01" y2="6"></line>
              <line x1="3" y1="12" x2="3.01" y2="12"></line>
              <line x1="3" y1="18" x2="3.01" y2="18"></line>
            </svg>
          </button>
        </div>
      </div>

      <style jsx global>{`
        .tiptap h1 {
          font-size: 2.5rem;
          font-weight: 700;
          margin-top: 2rem;
          margin-bottom: 1.5rem;
          color: var(--color-text-heading);
        }
        .tiptap h2 {
          font-size: 2rem;
          font-weight: 700;
          margin-top: 2rem;
          margin-bottom: 1rem;
          color: var(--color-text-heading);
        }
        .tiptap h3 {
          font-size: 1.5rem;
          font-weight: 700;
          margin-top: 1.5rem;
          margin-bottom: 0.75rem;
          color: var(--color-text-heading);
        }
        .tiptap p {
          margin-bottom: 1.25rem;
        }
        .tiptap ul {
          list-style-type: disc;
          padding-left: 1.5rem;
          margin-bottom: 1.25rem;
        }
        .tiptap ol {
          list-style-type: decimal;
          padding-left: 1.5rem;
          margin-bottom: 1.25rem;
        }

        .tiptap ul li p,
        .tiptap ol li p {
          margin-bottom: 0.4rem !important;
        }

        .tiptap blockquote {
          border-left: 4px solid var(--color-primary-300);
          padding-left: 1.5rem;
          font-style: italic;
          color: var(--color-text-subheading);
          margin: 2rem 0;
        }
        .tiptap p.is-editor-empty:first-child::before {
          color: var(--color-text-placeholder);
          content: attr(data-placeholder);
          float: left;
          height: 0;
          pointer-events: none;
        }
      `}</style>

      <EditorContent editor={editor} className="tiptap" />
    </div>
  );
}
