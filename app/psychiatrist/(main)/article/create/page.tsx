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
import UnsavedChangesModal from "@/components/partials/UnsavedChangesModal";
import Image from "next/image";

export default function CreateArticlePage() {
  const router = useRouter();
  const supabase = createClient();
  const [categories, setCategories] = useState<any[]>([]);
  const [topics, setTopics] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [previewMode, setPreviewMode] = useState(false);
  const [openDropdown, setOpenDropdown] = useState<
    "category" | "topics" | null
  >(null);

  const [formData, setFormData] = useState(() => {
    const initialState = {
      title: "",
      overview: "",
      content: "",
      categoryId: 0,
      imageUrl: "",
      status: "draft",
      topicIds: [] as number[],
      otherTopic: "",
    };
    if (typeof window !== "undefined") {
      const savedData = localStorage.getItem("nala_create_article_draft");
      if (savedData) {
        try {
          const parsed = JSON.parse(savedData);
          return { ...initialState, ...parsed };
        } catch (e) {
          console.error("Failed to restore draft", e);
        }
      }
    }
    return initialState;
  });

  const [isOtherSelected, setIsOtherSelected] = useState(() => {
    if (typeof window !== "undefined") {
      const savedData = localStorage.getItem("nala_create_article_draft");
      if (savedData) {
        try {
          const parsed = JSON.parse(savedData);
          return !!parsed.otherTopic;
        } catch (e) {}
      }
    }
    return false;
  });
  const [isDirty, setIsDirty] = useState(false);
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);

  useEffect(() => {
    if (isDirty) {
      localStorage.setItem("nala_create_article_draft", JSON.stringify(formData));
    }
  }, [formData, isDirty]);

  // Prevent accidental exit
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (isDirty) {
        e.preventDefault();
        e.returnValue = "";
      }
    };
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [isDirty]);

  useEffect(() => {
    const fetchCats = async () => {
      const cats = await getArticleCategories();
      setCategories(cats);
      if (cats.length > 0) {
        setFormData((prev: any) => ({ ...prev, categoryId: cats[0].id }));
      }
    };
    fetchCats();
  }, []);

  useEffect(() => {
    const fetchTops = async () => {
      if (formData.categoryId > 0) {
        const tops = await getArticleTopics(formData.categoryId);
        setTopics(tops);
        setFormData((prev) => ({ ...prev, topicIds: [] }));
      }
    };
    fetchTops();
  }, [formData.categoryId]);

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

  const handleSave = async (status: string) => {
    if (!formData.title || !formData.content || !formData.categoryId) {
      alert("Please fill in title, content and category");
      return;
    }
    setLoading(true);
    try {
      await createArticle({ ...formData, status });
      localStorage.removeItem("nala_create_article_draft");
      setIsDirty(false);
      router.push("/psychiatrist/article");
    } catch {
      alert("Failed to create article");
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    if (isDirty) {
      setIsConfirmModalOpen(true);
    } else {
      router.back();
    }
  };

  const handleConfirmLeave = async () => {
    setIsConfirmModalOpen(false);
    await handleSave("draft");
  };

  const handleDiscardLeave = () => {
    localStorage.removeItem("nala_create_article_draft");
    setIsConfirmModalOpen(false);
    setIsDirty(false);
    router.back();
  };

  const toggleTopic = (id: number) => {
    setFormData((prev) => {
      const newData = {
        ...prev,
        topicIds: prev.topicIds.includes(id)
          ? prev.topicIds.filter((t: number) => t !== id)
          : [...prev.topicIds, id],
      };
      setIsDirty(true);
      return newData;
    });
  };

  const handleFormChange = (updates: Partial<typeof formData>) => {
    setFormData(prev => ({ ...prev, ...updates }));
    setIsDirty(true);
  };

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (!(e.target as Element).closest(".dropdown-container")) {
        setOpenDropdown(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const estReadTime = Math.ceil(formData.content.split(/\s+/).length / 200);

  return (
    <div className="flex flex-col min-h-screen bg-white">
      {/* Top Header Bar */}
      <div className="px-4 md:px-8 py-4 border-b border-border-default flex flex-col md:flex-row gap-4 md:gap-0 justify-between md:items-center bg-white sticky top-0 z-50">
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
            onClick={handleBack}
            className="button-error-outline-medium"
          >
            Delete
          </button>
          <button
            onClick={() => handleSave("draft")}
            disabled={loading}
            className="button-secondary-medium text-sm md:text-base"
          >
            Save as Draft
          </button>
          <button
            onClick={() => handleSave("published")}
            disabled={loading}
            className="button-primary-medium text-sm md:text-base"
          >
            Publish
          </button>
        </div>
      </div>

      <div className="flex-1 px-4 md:px-6 py-8 md:py-12 lg:max-w-5xl mx-auto w-full">
        {previewMode ? (
          <ArticlePreview
            title={formData.title}
            overview={formData.overview}
            content={formData.content}
            imageUrl={formData.imageUrl}
            categoryName={
              categories.find((c) => c.id === formData.categoryId)?.name
            }
            topics={[
              ...formData.topicIds
                .map((id) => topics.find((t) => t.id === id)?.name)
                .filter(Boolean),
              ...(isOtherSelected && formData.otherTopic ? [formData.otherTopic] : []),
            ] as string[]}
            duration={estReadTime}
          />
        ) : (
          <>
            {/* Image Upload Placeholder */}
            <div
              className="relative w-full aspect-video md:aspect-21/9 bg-surface-background rounded-2xl md:rounded-xl border-2 border-dashed border-border-default flex flex-col items-center justify-center gap-4 cursor-pointer hover:bg-neutral-50 transition-colors overflow-hidden group"
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
                  <Image
                    src={formData.imageUrl}
                    alt="Cover"
                    fill
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
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
              <div className="flex justify-between items-center text-label-small-bold text-text-placeholder">
                <span>Unpublished</span>
                <span>Est. {estReadTime} Min read time</span>
              </div>

              <textarea
                placeholder="Add Article Title"
                className="text-heading-5-bold md:text-heading-3-bold text-text-heading placeholder:text-text-placeholder w-full focus:outline-none bg-transparent resize-none overflow-hidden"
                rows={1}
                value={formData.title}
                onChange={(e) =>
                  handleFormChange({ title: e.target.value })
                }
                onInput={(e) => {
                  const target = e.currentTarget;
                  target.style.height = "auto";
                  target.style.height = `${target.scrollHeight}px`;
                }}
              />

              <textarea
                placeholder="Add Article Description"
                rows={2}
                className="text-body-sm-medium md:text-body-lg-medium text-text-subheading placeholder:text-text-placeholder w-full focus:outline-none bg-transparent resize-none overflow-hidden"
                value={formData.overview}
                onChange={(e) =>
                  handleFormChange({ overview: e.target.value })
                }
                onInput={(e) => {
                  const target = e.currentTarget;
                  target.style.height = "auto";
                  target.style.height = `${target.scrollHeight}px`;
                }}
              />

              <div className="flex flex-wrap items-center gap-4">
                <div className="dropdown-container relative flex items-center p-1 bg-surface-background border border-border-default rounded-xl">
                  {/* Category Trigger */}
                  <div className="relative">
                    <button
                      type="button"
                      onClick={() =>
                        setOpenDropdown(
                          openDropdown === "category" ? null : "category",
                        )
                      }
                      className="flex items-center gap-2 px-4 py-2 hover:bg-neutral-50 rounded-lg transition-all"
                    >
                      <div className="size-5 rounded-full border border-text-action flex items-center justify-center text-text-action">
                        <svg
                          width="12"
                          height="12"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="3"
                        >
                          <line x1="12" y1="5" x2="12" y2="19"></line>
                          <line x1="5" y1="12" x2="19" y2="12"></line>
                        </svg>
                      </div>
                      <span className="text-label-small-bold text-text-action whitespace-nowrap">
                        {categories.find((c) => c.id === formData.categoryId)
                          ?.name || "Add Category"}
                      </span>
                    </button>

                    {openDropdown === "category" && (
                      <div className="absolute top-full left-0 mt-2 w-56 bg-white border border-border-default rounded-xl shadow-lg z-40 overflow-hidden py-1">
                        {categories.map((cat: any) => (
                          <button
                            key={cat.id}
                            type="button"
                            onClick={() => {
                              handleFormChange({ categoryId: cat.id });
                              setOpenDropdown(null);
                            }}
                            className={`w-full text-left px-4 py-2 text-label-small-medium hover:bg-neutral-50 transition-colors ${formData.categoryId === cat.id ? "text-primary-600 bg-primary-50" : "text-text-subheading"}`}
                          >
                            {cat.name}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Separator */}
                  <div className="w-px h-6 bg-border-default mx-1" />

                  {/* Topic Trigger */}
                  <div className="relative">
                    <button
                      type="button"
                      onClick={() =>
                        setOpenDropdown(
                          openDropdown === "topics" ? null : "topics",
                        )
                      }
                      className="flex items-center gap-2 px-4 py-2 hover:bg-neutral-50 rounded-lg transition-all"
                    >
                      <div className="size-5 rounded-full border border-text-action flex items-center justify-center text-text-action">
                        <svg
                          width="12"
                          height="12"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="3"
                        >
                          <line x1="12" y1="5" x2="12" y2="19"></line>
                          <line x1="5" y1="12" x2="19" y2="12"></line>
                        </svg>
                      </div>
                      <span className="text-label-small-bold text-text-action whitespace-nowrap">
                        Add Topics{" "}
                        {formData.topicIds.length > 0
                          ? `(${formData.topicIds.length})`
                          : ""}
                      </span>
                    </button>

                    {openDropdown === "topics" && (
                      <div className="absolute top-full left-0 mt-2 w-64 bg-white border border-border-default rounded-xl shadow-lg z-40 overflow-hidden py-1 max-h-60 overflow-y-auto">
                        {topics.length === 0 ? (
                          <div className="px-4 py-3 text-label-small-medium text-text-placeholder italic">
                            Select a category first
                          </div>
                        ) : (
                          <>
                            {topics.map((topic: any) => (
                              <button
                                key={topic.id}
                                type="button"
                                onClick={() => toggleTopic(topic.id)}
                                className={`w-full text-left px-4 py-2 text-label-small-medium hover:bg-neutral-50 transition-colors flex items-center justify-between ${formData.topicIds.includes(topic.id) ? "text-primary-600 bg-primary-50" : "text-text-subheading"}`}
                              >
                                {topic.name}
                                {formData.topicIds.includes(topic.id) && (
                                  <svg
                                    width="14"
                                    height="14"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="3"
                                  >
                                    <polyline points="20 6 9 17 4 12"></polyline>
                                  </svg>
                                )}
                              </button>
                            ))}
                            <button
                              type="button"
                              onClick={() => {
                                setIsOtherSelected(!isOtherSelected);
                              }}
                              className={`w-full text-left px-4 py-2 text-label-small-medium hover:bg-neutral-50 transition-colors ${isOtherSelected ? "text-primary-600 bg-primary-50" : "text-text-subheading"}`}
                            >
                              Other
                            </button>
                          </>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Selected Topics Badges */}
              {(formData.topicIds.length > 0 || isOtherSelected) && (
                <div className="flex flex-wrap gap-2 mt-2">
                  {formData.topicIds.map((topicId) => {
                    const topic = topics.find((t) => t.id === topicId);
                    if (!topic) return null;
                    return (
                      <div
                        key={topicId}
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-primary-50 border border-primary-200 rounded-full text-primary-700 text-label-small-bold"
                      >
                        {topic.name}
                        <button
                          type="button"
                          onClick={() => toggleTopic(topicId)}
                          className="hover:text-primary-900 transition-colors"
                        >
                          <svg
                            width="12"
                            height="12"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="3"
                          >
                            <line x1="18" y1="6" x2="6" y2="18"></line>
                            <line x1="6" y1="6" x2="18" y2="18"></line>
                          </svg>
                        </button>
                      </div>
                    );
                  })}
                  {isOtherSelected && formData.otherTopic && (
                    <div className="flex items-center gap-1.5 px-3 py-1.5 bg-primary-50 border border-primary-200 rounded-full text-primary-700 text-label-small-bold">
                      {formData.otherTopic}
                      <button
                        type="button"
                        onClick={() => setIsOtherSelected(false)}
                        className="hover:text-primary-900 transition-colors"
                      >
                        <svg
                          width="12"
                          height="12"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="3"
                        >
                          <line x1="18" y1="6" x2="6" y2="18"></line>
                          <line x1="6" y1="6" x2="18" y2="18"></line>
                        </svg>
                      </button>
                    </div>
                  )}
                </div>
              )}

              {isOtherSelected && (
                <div className="mt-2">
                  <input
                    type="text"
                    placeholder="Enter other topic"
                    className="w-full md:w-1/2 px-4 py-2 rounded-lg border border-border-default focus:outline-none focus:border-primary-500 text-body-sm-medium"
                    value={formData.otherTopic}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        otherTopic: e.target.value,
                      }))
                    }
                  />
                </div>
              )}
            </div>

            <hr className="my-12 border-border-default" />

              {/* Content Area */}
              <TiptapEditor
                content={formData.content}
                onChange={(markdown: string) =>
                  handleFormChange({ content: markdown })
                }
                placeholder="Start typing your article here..."
              />
          </>
        )}
      </div>

      <UnsavedChangesModal
        isOpen={isConfirmModalOpen}
        onClose={() => setIsConfirmModalOpen(false)}
        onConfirm={handleConfirmLeave}
        onDiscard={handleDiscardLeave}
      />
    </div>
  );
}
