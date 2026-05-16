import React, { useEffect } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Link from "@tiptap/extension-link";
import Underline from "@tiptap/extension-underline";
import TextAlign from "@tiptap/extension-text-align";

interface ArticlePreviewProps {
  title: string;
  overview: string;
  content: string;
  imageUrl?: string;
  categoryName?: string;
  topics?: string[];
  duration?: number;
}

export default function ArticlePreview({
  title,
  overview,
  content,
  imageUrl,
  categoryName,
  topics,
  duration,
}: ArticlePreviewProps) {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [1, 2, 3],
        },
      }),
      Underline,
      Link.configure({
        openOnClick: true,
        HTMLAttributes: {
          class: "text-primary-600 underline cursor-pointer",
        },
      }),
      TextAlign.configure({
        types: ["heading", "paragraph"],
      }),
    ],
    content: "",
    editable: false,
    immediatelyRender: false,
  });

  useEffect(() => {
    if (editor && content !== undefined) {
      // Improved Markdown to HTML conversion
      const blocks = content.trim().split(/\n\n+/);
      const html = blocks
        .map((block) => {
          if (block.startsWith("# ")) {
            return `<h1>${block.replace("# ", "")}</h1>`;
          }
          if (block.startsWith("## ")) {
            return `<h2>${block.replace("## ", "")}</h2>`;
          }
          if (block.startsWith("### ")) {
            return `<h3>${block.replace("### ", "")}</h3>`;
          }
          if (block.startsWith("- ")) {
            const items = block
              .split("\n")
              .filter((line) => line.trim())
              .map((li) => `<li>${li.replace("- ", "").trim()}</li>`)
              .join("");
            return `<ul>${items}</ul>`;
          }
          if (block.startsWith("> ")) {
            return `<blockquote>${block.replace("> ", "").trim()}</blockquote>`;
          }

          // Paragraphs with inline formatting
          const formatted = block
            .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
            .replace(/\*(.*?)\*/g, "<em>$1</em>")
            .replace(/\n/g, "<br />");
          return `<p>${formatted}</p>`;
        })
        .filter(Boolean)
        .join("");

      editor.commands.setContent(html);
    }
  }, [editor, content]);
  return (
    <div className="flex flex-col gap-8 w-full lg:max-w-5xl mx-auto p-4 md:px-6 md:py-10 animate-in fade-in duration-500">
      {/* Header Info */}
      <div className="flex flex-col gap-4">
        <div className="flex flex-wrap items-center gap-3">
          {categoryName && (
            <span className="px-3 py-1 bg-primary-50 text-primary-600 rounded-full text-label-small-bold uppercase tracking-wider border border-primary-100">
              {categoryName}
            </span>
          )}
          {topics?.map((topic, idx) => (
            <span
              key={idx}
              className="px-3 py-1 bg-surface-background text-text-subheading rounded-full text-label-small-bold uppercase tracking-wider border border-border-default"
            >
              {topic}
            </span>
          ))}
          <span className="text-label-small-medium text-text-subheading uppercase tracking-widest italic ml-auto">
            {duration || 0} Min Read
          </span>
        </div>
        <h1 className="text-heading-2-bold text-text-heading leading-tight">
          {title || "Untitled Article"}
        </h1>
        <p className="text-body-xl-medium text-text-subheading leading-relaxed border-l-4 border-primary-200 pl-6 italic">
          {overview || "No overview provided."}
        </p>
      </div>

      {/* Image */}
      {imageUrl && (
        <div className="w-full aspect-21/9 rounded-[2rem] overflow-hidden  ring-1 ring-border-default/50">
          <img
            src={imageUrl}
            alt={title}
            className="w-full h-full object-cover"
          />
        </div>
      )}

      <div className="max-w-none">
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
            margin-bottom: 0rem !important;
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
        <div className="tiptap-preview">
          {content ? (
            <EditorContent editor={editor} className="tiptap" />
          ) : (
            <p className="italic text-text-placeholder">
              No content yet. Start writing to see the preview!
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
