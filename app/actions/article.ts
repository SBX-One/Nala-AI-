"use server";

import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";

export async function getPsychiatristArticles() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return [];

  // Get psychiatrist profile ID
  const { data: psyProfile } = await supabase
    .from("PsychiatristProfile")
    .select("id")
    .eq("user_id", (await supabase.from("User").select("id").eq("auth_user_id", user.id).single()).data?.id)
    .single();

  if (!psyProfile) return [];

  const { data, error } = await supabase
    .from("Article")
    .select(`
      *,
      category:ArticleCategory (name),
      topics:ArticleTopic (
        categoryTopic:ArticleCategoryTopic (name)
      )
    `)
    .eq("psychiatrist_id", psyProfile.id)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching articles:", error.message);
    return [];
  }

  return data;
}

export async function createArticle(formData: {
  title: string;
  overview: string;
  content: string;
  categoryId: number;
  imageUrl?: string;
  topicIds: number[];
  status?: string;
}) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) throw new Error("Unauthorized");

  // Get internal User ID
  const { data: userRecord } = await supabase
    .from("User")
    .select("id")
    .eq("auth_user_id", user.id)
    .single();

  if (!userRecord) throw new Error("User not found");

  // Get psychiatrist profile ID
  const { data: psyProfile } = await supabase
    .from("PsychiatristProfile")
    .select("id")
    .eq("user_id", userRecord.id)
    .single();

  if (!psyProfile) throw new Error("Psychiatrist profile not found");

  // Insert Article
  const { data: article, error: articleError } = await supabase
    .from("Article")
    .insert({
      psychiatrist_id: psyProfile.id,
      category_id: formData.categoryId,
      title: formData.title,
      overview: formData.overview,
      content: formData.content,
      image_url: formData.imageUrl,
      status: formData.status || "draft",
      duration: Math.ceil(formData.content.split(/\s+/).length / 200), // Approx 200 wpm
    })
    .select()
    .single();

  if (articleError) {
    console.error("Error creating article:", articleError.message);
    throw new Error(articleError.message);
  }

  // Insert Topics
  if (formData.topicIds.length > 0) {
    const topicRows = formData.topicIds.map(topicId => ({
      article_id: article.id,
      category_topic: topicId
    }));

    const { error: topicError } = await supabase
      .from("ArticleTopic")
      .insert(topicRows);

    if (topicError) {
      console.error("Error adding topics:", topicError.message);
    }
  }

  revalidatePath("/psychiatrist/article");
  return { success: true, articleId: article.id };
}

export async function updateArticle(articleId: number, formData: {
  title: string;
  overview: string;
  content: string;
  categoryId: number;
  imageUrl?: string;
  topicIds: number[];
  status?: string;
}) {
  const supabase = await createClient();
  
  // Update Article
  const { error: articleError } = await supabase
    .from("Article")
    .update({
      category_id: formData.categoryId,
      title: formData.title,
      overview: formData.overview,
      content: formData.content,
      image_url: formData.imageUrl,
      status: formData.status,
      duration: Math.ceil(formData.content.split(/\s+/).length / 200),
    })
    .eq("id", articleId);

  if (articleError) {
    console.error("Error updating article:", articleError.message);
    throw new Error(articleError.message);
  }

  // Delete old topics and insert new ones
  await supabase.from("ArticleTopic").delete().eq("article_id", articleId);

  if (formData.topicIds.length > 0) {
    const topicRows = formData.topicIds.map(topicId => ({
      article_id: articleId,
      category_topic: topicId
    }));

    await supabase.from("ArticleTopic").insert(topicRows);
  }

  revalidatePath("/psychiatrist/article");
  return { success: true };
}

export async function deleteArticle(articleId: number) {
  const supabase = await createClient();
  
  const { error } = await supabase
    .from("Article")
    .delete()
    .eq("id", articleId);

  if (error) {
    console.error("Error deleting article:", error.message);
    throw new Error(error.message);
  }

  revalidatePath("/psychiatrist/article");
  return { success: true };
}

export async function getArticleCategories() {
  const supabase = await createClient();
  const { data } = await supabase.from("ArticleCategory").select("*");
  return data || [];
}

export async function getArticleTopics() {
  const supabase = await createClient();
  const { data } = await supabase.from("ArticleCategoryTopic").select("*");
  return data || [];
}
