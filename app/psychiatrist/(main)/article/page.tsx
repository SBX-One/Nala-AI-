"use client";

import {
  getPsychiatristArticles,
  getPublishedArticles,
  deleteArticle,
} from "@/app/actions/article";
import PsychiatristArticleCard from "@/components/partials/PsychiatristArticleCard";
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";

export default function ArticleListPage() {
  const [activeTab, setActiveTab] = useState<"my" | "all">("my");
  const [myArticles, setMyArticles] = useState<any[]>([]);
  const [allArticles, setAllArticles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [my, all] = await Promise.all([
        getPsychiatristArticles(),
        getPublishedArticles(),
      ]);
      setMyArticles(my);
      setAllArticles(all);
    } catch (error) {
      console.error("Failed to fetch articles:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleDelete = async (id: number) => {
    if (confirm("Are you sure you want to delete this article?")) {
      await deleteArticle(id);
      fetchData();
    }
  };

  const articlesToDisplay = activeTab === "my" ? myArticles : allArticles;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[60dvh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  return (
    <div className="bg-surface-default min-h-[80dvh]">
      <div className="flex flex-col md:flex-row justify-between md:items-center gap-y-4 md:gap-0 p-6 py-8 bg-white border-b border-border-default sticky top-0 z-10">
        <div>
          <h1 className="text-heading-6-bold md:text-heading-4-bold text-text-heading md:mb-2">
            Articles
          </h1>
          <p className="text-body-sm-medium md:text-body-base-medium text-text-subheading">
            {activeTab === "my"
              ? "Manage and publish your mental health insights"
              : "Explore insights from the Nala psychiatrist community"}
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
        {/* Tabs */}
        <div className="flex bg-white p-1 rounded-xl border border-border-default w-fit mb-8">
          <button
            onClick={() => setActiveTab("my")}
            className={`px-6 py-2 rounded-lg text-label-base-bold transition-all ${
              activeTab === "my"
                ? "bg-primary-50 text-primary-600"
                : "text-text-subheading hover:text-text-heading"
            }`}
          >
            My Articles
          </button>
          <button
            onClick={() => setActiveTab("all")}
            className={`px-6 py-2 rounded-lg text-label-base-bold transition-all ${
              activeTab === "all"
                ? "bg-primary-50 text-primary-600"
                : "text-text-subheading hover:text-text-heading"
            }`}
          >
            All Articles
          </button>
        </div>

        {articlesToDisplay.length === 0 ? (
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
            {articlesToDisplay.map((article) => (
              <PsychiatristArticleCard
                key={article.id}
                article={article}
                onDelete={handleDelete}
                showActions={activeTab === "my"}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
