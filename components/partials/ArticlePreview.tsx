import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import remarkBreaks from "remark-breaks";

interface ArticlePreviewProps {
  title: string;
  overview: string;
  content: string;
  imageUrl?: string;
  categoryName?: string;
  duration?: number;
}

export default function ArticlePreview({
  title,
  overview,
  content,
  imageUrl,
  categoryName,
  duration,
}: ArticlePreviewProps) {
  return (
    <div className="flex flex-col gap-8 max-w-4xl mx-auto py-10 animate-in fade-in duration-500">
      {/* Header Info */}
      <div className="flex flex-col gap-4">
        <div className="flex items-center gap-3">
          {categoryName && (
            <span className="px-3 py-1 bg-primary-50 text-primary-600 rounded-full text-label-small-bold uppercase tracking-wider">
              {categoryName}
            </span>
          )}
          <span className="text-label-small-medium text-text-subheading uppercase tracking-widest italic">
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
        <div className="w-full aspect-21/9 rounded-[2rem] overflow-hidden shadow-xl ring-1 ring-border-default/50">
          <img
            src={imageUrl}
            alt={title}
            className="w-full h-full object-cover"
          />
        </div>
      )}

      <div className="max-w-none">
        <ReactMarkdown
          remarkPlugins={[remarkGfm, remarkBreaks]}
          components={{
            h1: ({ ...props }) => (
              <h1
                className="text-heading-1-bold text-text-heading mt-12 mb-6"
                {...props}
              />
            ),
            h2: ({ ...props }) => (
              <h2
                className="text-heading-3-bold text-text-heading mt-10 mb-4"
                {...props}
              />
            ),
            h3: ({ ...props }) => (
              <h3
                className="text-heading-4-bold text-text-heading mt-8 mb-3"
                {...props}
              />
            ),
            p: ({ ...props }) => (
              <p
                className="text-body-xl-regular text-text-body leading-relaxed mb-6"
                {...props}
              />
            ),
            ul: ({ ...props }) => (
              <ul
                className="list-disc pl-6 mb-6 flex flex-col gap-2 text-text-body"
                {...props}
              />
            ),
            ol: ({ ...props }) => (
              <ol
                className="list-decimal pl-6 mb-6 flex flex-col gap-2 text-text-body"
                {...props}
              />
            ),
            li: ({ ...props }) => (
              <li className="text-body-lg-regular" {...props} />
            ),
            strong: ({ ...props }) => (
              <strong className="font-bold " {...props} />
            ),
            em: ({ ...props }) => (
              <em className="italic text-text-subheading" {...props} />
            ),
            blockquote: ({ ...props }) => (
              <blockquote
                className="border-l-4 border-primary-300 pl-6 py-2 italic text-text-subheading my-10 bg-surface-default rounded-r-xl"
                {...props}
              />
            ),
            hr: () => <hr className="my-12 border-border-default" />,
            a: ({ ...props }) => (
              <a
                className="text-primary-default underline hover:text-primary-600 transition-colors"
                {...props}
              />
            ),
          }}
        >
          {content || "_No content yet. Start writing to see the preview!_"}
        </ReactMarkdown>
      </div>
    </div>
  );
}
