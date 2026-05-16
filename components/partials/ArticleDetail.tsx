import React, { useEffect } from "react";
import Image from "next/image";
import { Article } from "./ArticleCard";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Link from "@tiptap/extension-link";
import Underline from "@tiptap/extension-underline";
import TextAlign from "@tiptap/extension-text-align";

interface ArticleDetailProps {
  article: Article & {
    content?: string;
    author?: { name: string };
    topics?: any[];
  };
  author?: {
    name: string;
    role: string;
    avatar: string;
  };
  readTime?: string;
}

export default function ArticleDetail({
  article,
  author,
  readTime,
}: ArticleDetailProps) {
  const displayAuthor = author || {
    name: article.author?.name || "Nala Expert",
    role: "Mental Health Specialist",
    avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(article.author?.name || "Nala")}&background=random`,
  };

  const displayReadTime = readTime || `${article.duration || 0} Min read`;

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
    if (editor && article.content) {
      // Improved Markdown to HTML conversion
      const blocks = article.content.trim().split(/\n\n+/);
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
  }, [editor, article.content]);

  return (
    <div className="bg-surface-background rounded-xl overflow-hidden flex flex-col gap-8">
      {/* Main Image */}
      <div className=" border-b border-border-default p-6 md:p-12 flex flex-col gap-8">
        <div className="relative aspect-video md:aspect-21/9 w-full rounded-xl overflow-hidden bg-surface-disabled">
          {article.image_url ? (
            <Image
              src={article.image_url}
              alt={article.title}
              fill
              className="object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-text-placeholder">
              No Image
            </div>
          )}
        </div>

        <div className="flex flex-col gap-6 mx-auto w-full max-w-4xl">
          {/* Author & Meta */}
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              <div className="relative w-10 h-10 rounded-full overflow-hidden">
                <Image
                  src={displayAuthor.avatar}
                  alt={displayAuthor.name}
                  fill
                  className="object-cover"
                />
              </div>
              <div>
                <p className="text-body-sm-bold text-text-heading">
                  {displayAuthor.name}
                </p>
                <p className="text-label-caption-medium text-text-subheading">
                  {new Date(article.created_at).toLocaleDateString("en-US", {
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                  })}
                </p>
              </div>
            </div>
            <span className="text-label-caption-medium text-text-subheading">
              {displayReadTime}
            </span>
          </div>

          {/* Title & Category */}
          <div className="flex flex-col gap-4">
            <div className="grid gap-3">
              <h1 className="text-heading-4-bold md:text-heading-3-bold text-text-heading">
                {article.title}
              </h1>
              <p className="text-body-base-medium text-text-subheading italic">
                {article.overview}
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <span className="px-3 py-1 rounded-full bg-surface-information text-text-action text-label-caption-medium border border-border-information/20">
                {article.category?.name || "General"}
              </span>
              {article.topics?.map((topic: any, idx: number) => (
                <span
                  key={idx}
                  className="px-3 py-1 rounded-full bg-surface-default text-text-subheading text-label-caption-medium border border-border-default"
                >
                  {topic.categoryTopic?.name}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-6 md:p-12 pt-0">
        <div className="mx-auto max-w-4xl">
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
          <div className="tiptap-content">
            {article.content ? (
              <EditorContent editor={editor} className="tiptap" />
            ) : (
              <p className="text-body-base-regular text-text-placeholder italic">
                No content available for this article.
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
