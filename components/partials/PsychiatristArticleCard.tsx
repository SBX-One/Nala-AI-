import Image from "next/image";
import Link from "next/link";
import { Article } from "./ArticleCard";

interface PsychiatristArticleCardProps {
  article: Article & { status?: string };
  onDelete?: (id: number) => void;
  showActions?: boolean;
}

export default function PsychiatristArticleCard({
  article,
  onDelete,
  showActions = true,
}: PsychiatristArticleCardProps) {
  const CardContent = (
    <div className="bg-white rounded-xl border border-border-default overflow-hidden flex flex-col group h-full transition-all hover:shadow-md">
      <div className="relative h-48 bg-surface-disabled">
        {article.image_url ? (
          <Image
            src={article.image_url}
            alt={article.title}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-text-placeholder">
            No Image
          </div>
        )}
        <div className="absolute top-4 left-4 flex gap-2">
          <span className="bg-white/90 backdrop-blur-sm text-label-small-bold px-3 py-1 rounded-full text-text-action shadow-sm border border-border-default/50">
            {article.category?.name}
          </span>
          {showActions && (
            <span
              className={`bg-white text-label-small-bold px-3 py-1 rounded-full shadow-sm border border-border-default/50 ${
                article.status === "published"
                  ? "bg-success-50/90 text-success-600 border-success-100"
                  : "bg-neutral-100/90 text-text-subheading"
              }`}
            >
              {article.status === "published" ? "Published" : "Draft"}
            </span>
          )}
        </div>
      </div>

      <div className="p-6 flex-1 flex flex-col gap-3">
        <h3 className="text-body-lg-bold text-text-heading line-clamp-2 min-h-14">
          {article.title}
        </h3>
        <p className="text-body-sm-medium text-text-subheading line-clamp-3">
          {article.overview}
        </p>

        <div className="mt-auto pt-4 flex justify-between items-center border-t border-border-default">
          <span className="text-label-caption-medium text-text-subheading">
            {new Date(article.created_at).toLocaleDateString()} •{" "}
            {article.duration} min read
          </span>
          {showActions && (
            <div className="flex gap-2">
              <Link
                href={`/psychiatrist/article/edit/${article.id}`}
                className="p-2 hover:bg-surface-background rounded-lg text-text-action transition-colors"
                title="Edit Article"
              >
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                  <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                </svg>
              </Link>
              <button
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  onDelete?.(article.id);
                }}
                className="p-2 hover:bg-error-50 rounded-lg text-error-600 transition-colors"
                title="Delete Article"
              >
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <polyline points="3 6 5 6 21 6"></polyline>
                  <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                </svg>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  if (showActions) {
    return CardContent;
  }

  return (
    <Link href={`/psychiatrist/article/${article.id}`} className="block h-full">
      {CardContent}
    </Link>
  );
}
