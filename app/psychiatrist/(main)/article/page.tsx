"use client";

import { useState, useEffect, useCallback } from "react";
import { getPsychiatristArticles, deleteArticle } from "@/app/actions/article";
import Link from "next/link";
import Image from "next/image";

export default function ArticleListPage() {
  const [articles, setArticles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchArticles = useCallback(async () => {
    setLoading(true);
    const data = await getPsychiatristArticles();
    setArticles(data);
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchArticles();
  }, [fetchArticles]);

  const handleDelete = async (id: number) => {
    if (confirm("Are you sure you want to delete this article?")) {
      await deleteArticle(id);
      fetchArticles();
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  return (
    <div className="bg-surface-default min-h-[80dvh]">
      <div className="flex flex-col md:flex-row justify-between md:items-center gap-y-4 md:gap-0  p-6 py-8 bg-white border-b border-border-default sticky top-0 z-10">
        <div>
          <h1 className="text-heading-6-bold md:text-heading-4-bold text-text-heading md:mb-2">
            My Articles
          </h1>
          <p className="text-body-sm-medium md:text-body-base-medium text-text-subheading">
            Manage and publish your mental health insights
          </p>
        </div>
        <Link
          href="/psychiatrist/article/create"
          className="button-primary-small md:button-primary-large"
        >
          Create New Article
        </Link>
      </div>

      <div className="p-4 md:p-6">
        {articles.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 bg-white rounded-xl border border-dashed border-border-default">
            <p className="text-body-lg-semibold text-text-heading">
              No articles yet
            </p>
            <p className="text-body-sm-medium text-text-subheading">
              Share your knowledge with the Nala community.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {articles.map((article) => (
              <div
                key={article.id}
                className="bg-white rounded-2xl border border-border-default overflow-hidden flex flex-col shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="relative h-48 bg-surface-disabled">
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
                  <div className="absolute top-4 left-4 flex gap-2">
                    <span className="bg-white/90 backdrop-blur-sm text-label-small-bold px-3 py-1 rounded-full text-text-action shadow-sm">
                      {article.category?.name}
                    </span>
                    <span
                      className={`backdrop-blur-sm text-label-small-bold px-3 py-1 rounded-full shadow-sm ${
                        article.status === "published"
                          ? "bg-success-50/90 text-success-600"
                          : "bg-neutral-100/90 text-text-subheading"
                      }`}
                    >
                      {article.status === "published" ? "Published" : "Draft"}
                    </span>
                  </div>
                </div>

                <div className="p-6 flex-1 flex flex-col gap-3">
                  <h3 className="text-body-lg-bold text-text-heading line-clamp-2 min-h-[3.5rem]">
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
                    <div className="flex gap-2">
                      <Link
                        href={`/psychiatrist/article/edit/${article.id}`}
                        className="p-2 hover:bg-surface-background rounded-lg text-text-action transition-colors"
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
                        onClick={() => handleDelete(article.id)}
                        className="p-2 hover:bg-error-50 rounded-lg text-error-600 transition-colors"
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
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
