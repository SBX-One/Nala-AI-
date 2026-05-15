"use server";

import { createClient } from "@/utils/supabase/server";

export async function searchMedicines(query: string) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("Medicine")
    .select("id, name, description")
    .ilike("name", `%${query}%`)
    .limit(10);

  if (error) {
    console.error("Error searching medicines:", error);
    return { error: error.message };
  }

  return { data };
}

export async function getOrCreateMedicine(name: string) {
  const supabase = await createClient();

  // Try to find existing
  const { data: existing } = await supabase
    .from("Medicine")
    .select("id")
    .eq("name", name)
    .single();

  if (existing) return existing.id;

  // Create new if doesn't exist
  const { data: created, error } = await supabase
    .from("Medicine")
    .insert({ name })
    .select("id")
    .single();

  if (error) {
    console.error("Error creating medicine:", error);
    throw new Error(error.message);
  }

  return created.id;
}
