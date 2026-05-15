"use client";

import { useState, useEffect } from "react";
import {
  createArticle,
  getArticleCategories,
  getArticleTopics,
} from "@/app/actions/article";
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import ArticlePreview from "@/components/partials/ArticlePreview";
import TiptapEditor from "@/components/partials/TiptapEditor";

export default function CreateArticlePage() {
  const router = useRouter();
  const supabase = createClient();
  const [categories, setCategories] = useState<any[]>([]);
  const [topics, setTopics] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [previewMode, setPreviewMode] = useState(false);

  const [formData, setFormData] = useState({
    title: "",
    overview: "",
    content: "",
    categoryId: 0,
    imageUrl: "",
    status: "draft",
    topicIds: [] as number[],
  });

  useEffect(() => {
    const fetchData = async () => {
      const [cats, tops] = await Promise.all([
        getArticleCategories(),
        getArticleTopics(),
      ]);
      setCategories(cats);
      setTopics(tops);
      if (cats.length > 0)
        setFormData((prev) => ({ ...prev, categoryId: cats[0].id }));
    };
    fetchData();
  }, []);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const fileExt = file.name.split(".").pop();
      const fileName = `${Math.random()}.${fileExt}`;
      const filePath = `article-covers/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from("articles")
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const {
        data: { publicUrl },
      } = supabase.storage.from("articles").getPublicUrl(filePath);

      setFormData((prev) => ({ ...prev, imageUrl: publicUrl }));
    } catch (error: any) {
      alert("Error uploading file: " + error.message);
    } finally {
      setUploading(false);
    }
  };

  const handleSave = async () => {
    if (!formData.title || !formData.content || !formData.categoryId) {
      alert("Please fill in title, content and category");
      return;
    }
    setLoading(true);
    try {
      await createArticle(formData);
      router.push("/psychiatrist/article");
    } catch {
      alert("Failed to create article");
    } finally {
      setLoading(false);
    }
  };

  const toggleTopic = (id: number) => {
    setFormData((prev: any) => ({
      ...prev,
      topicIds: prev.topicIds.includes(id)
        ? prev.topicIds.filter((t: number) => t !== id)
        : [...prev.topicIds, id],
    }));
  };

  const estReadTime = Math.ceil(formData.content.split(/\s+/).length / 200);

  return (
    <div className="flex flex-col min-h-screen bg-white">
      {/* Top Header Bar */}
      <div className="px-4 md:px-8 py-4 border-b border-border-default flex flex-col md:flex-row gap-4 md:gap-0 justify-between md:items-center bg-white sticky top-0 z-10">
        <div className="flex items-center gap-2 text-label-small-medium md:text-label-base-medium text-text-subheading">
          <span>Article</span>
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <polyline points="9 18 15 12 9 6"></polyline>
          </svg>
          <span className="text-text-heading font-semibold">
            Create Article
          </span>
        </div>

        <div className="flex flex-wrap items-center gap-2 md:gap-3">
          <div className="flex bg-surface-background p-1 rounded-xl border border-border-default md:mr-4">
            <button
              onClick={() => setPreviewMode(false)}
              className={`px-3 md:px-4 py-1.5 rounded-lg text-label-small-bold transition-all ${!previewMode ? "bg-white shadow-sm text-primary-600" : "text-text-subheading hover:text-text-heading"}`}
            >
              Write
            </button>
            <button
              onClick={() => setPreviewMode(true)}
              className={`px-3 md:px-4 py-1.5 rounded-lg text-label-small-bold transition-all ${previewMode ? "bg-white shadow-sm text-primary-600" : "text-text-subheading hover:text-text-heading"}`}
            >
              Preview
            </button>
          </div>
          <button
            onClick={() => router.back()}
            className="px-4 md:px-6 py-2 rounded-lg border border-error-500 text-error-600 font-semibold hover:bg-error-50 transition-colors text-label-base-bold md:text-body-base-bold"
          >
            Delete
          </button>
          <button
            onClick={handleSave}
            disabled={loading}
            className="flex-1 md:flex-none px-6 md:px-8 py-2 rounded-lg bg-primary-600 text-white font-semibold hover:bg-primary-700 transition-colors disabled:opacity-50 text-label-base-bold md:text-body-base-bold"
          >
            {loading ? "Saving..." : "Save"}
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-4 md:px-10 py-8 md:py-12 max-w-5xl mx-auto w-full">
        {previewMode ? (
          <ArticlePreview
            title={formData.title}
            overview={formData.overview}
            content={formData.content}
            imageUrl={formData.imageUrl}
            categoryName={
              categories.find((c) => c.id === formData.categoryId)?.name
            }
            duration={estReadTime}
          />
        ) : (
          <>
            {/* Image Upload Placeholder */}
            <div
              className="relative w-full aspect-video md:aspect-21/9 bg-surface-background rounded-2xl md:rounded-3xl border-2 border-dashed border-border-default flex flex-col items-center justify-center gap-4 cursor-pointer hover:bg-neutral-50 transition-colors overflow-hidden group"
              onClick={() => document.getElementById("cover-upload")?.click()}
            >
              <input
                id="cover-upload"
                type="file"
                className="hidden"
                accept="image/*"
                onChange={handleFileUpload}
              />

              {uploading ? (
                <div className="flex flex-col items-center gap-2">
                  <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary-500"></div>
                  <p className="text-label-base-semibold text-text-subheading">
                    Uploading...
                  </p>
                </div>
              ) : formData.imageUrl ? (
                <div className="relative w-full h-full">
                  <img
                    src={formData.imageUrl}
                    alt="Cover"
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-2">
                    <div className="p-3 bg-white/20 backdrop-blur-md rounded-full text-white">
                      <svg
                        width="24"
                        height="24"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2.5"
                      >
                        <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"></path>
                        <circle cx="12" cy="13" r="4"></circle>
                      </svg>
                    </div>
                    <span className="text-white text-label-base-bold">
                      Change Cover Image
                    </span>
                  </div>
                </div>
              ) : (
                <>
                  <div className="size-12 md:size-16 rounded-full border-2 border-text-heading flex items-center justify-center text-text-heading group-hover:scale-110 transition-transform">
                    <svg
                      className="size-6 md:size-8"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="3"
                    >
                      <line x1="12" y1="5" x2="12" y2="19"></line>
                      <line x1="5" y1="12" x2="19" y2="12"></line>
                    </svg>
                  </div>
                  <p className="text-body-xl-bold md:text-heading-5-bold text-text-heading">
                    Upload Image Cover
                  </p>
                </>
              )}
            </div>

            {/* Article Info Section */}
            <div className="mt-10 flex flex-col gap-6">
              <div className="flex justify-between items-center text-label-small-bold text-text-placeholder uppercase tracking-wider">
                <span>Unpublished</span>
                <span>Est. {estReadTime} Min read time</span>
              </div>

              <input
                type="text"
                placeholder="Add Article Title"
                className="text-heading-5-bold md:text-heading-3-bold text-text-heading placeholder:text-text-placeholder w-full focus:outline-none bg-transparent"
                value={formData.title}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, title: e.target.value }))
                }
              />

              <textarea
                placeholder="Add Article Description"
                rows={2}
                className="text-body-sm-medium md:text-body-lg-medium text-text-subheading placeholder:text-text-placeholder w-full focus:outline-none bg-transparent resize-none"
                value={formData.overview}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, overview: e.target.value }))
                }
              />

              <div className="flex flex-wrap gap-3">
                <div className="relative group">
                  <select
                    className="appearance-none bg-surface-background border border-border-default px-4 py-2 pr-10 rounded-lg text-label-small-bold text-text-action cursor-pointer focus:outline-none hover:border-primary-300 transition-all"
                    value={formData.status}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        status: e.target.value,
                      }))
                    }
                  >
                    <option value="draft">Draft</option>
                    <option value="published">Published</option>
                  </select>
                  <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-text-action">
                    <svg
                      width="14"
                      height="14"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <polyline points="6 9 12 15 18 9"></polyline>
                    </svg>
                  </div>
                </div>

                <div className="relative group">
                  <select
                    className="appearance-none bg-surface-background border border-border-default px-4 py-2 pr-10 rounded-lg text-label-small-bold text-text-action cursor-pointer focus:outline-none hover:border-primary-300 transition-all"
                    value={formData.categoryId}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        categoryId: parseInt(e.target.value),
                      }))
                    }
                  >
                    <option value={0} disabled>
                      Add Category
                    </option>
                    {categories.map((cat: any) => (
                      <option key={cat.id} value={cat.id}>
                        {cat.name}
                      </option>
                    ))}
                  </select>
                  <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-text-action">
                    <svg
                      width="14"
                      height="14"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <polyline points="6 9 12 15 18 9"></polyline>
                    </svg>
                  </div>
                </div>

                {topics.map((topic: any) => (
                  <button
                    key={topic.id}
                    onClick={() => toggleTopic(topic.id)}
                    className={`px-4 py-2 rounded-lg border text-label-small-bold transition-all flex items-center gap-2 ${
                      formData.topicIds.includes(topic.id)
                        ? "bg-primary-50 border-primary-500 text-primary-600"
                        : "bg-surface-background border-border-default text-text-subheading hover:border-primary-300"
                    }`}
                  >
                    <span className="text-lg leading-none">
                      {formData.topicIds.includes(topic.id) ? "✓" : "+"}
                    </span>
                    {topic.name}
                  </button>
                ))}
              </div>
            </div>

            <hr className="my-12 border-border-default" />

            {/* Content Area */}
            <TiptapEditor
              content={formData.content}
              onChange={(markdown: string) =>
                setFormData((prev) => ({ ...prev, content: markdown }))
              }
              placeholder="Start typing your article here..."
            />
          </>
        )}
      </div>
    </div>
  );
}
