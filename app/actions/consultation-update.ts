"use server";

import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";

export async function updateConsultation(
  id: number,
  data: { diagnose: string; psychiatrist_feedback: string; status?: string },
) {
  const supabase = await createClient();

  // Verify authentication
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Not authenticated" };

  // Update the consultation in Prisma (via Supabase REST API or if you have a prisma client on server)
  // Since we are using Supabase directly in actions for consistency:
  const { error } = await supabase
    .from("Consultation")
    .update({
      diagnose: data.diagnose,
      psychiatrist_feedback: data.psychiatrist_feedback,
      status: data.status || "finished",
    })
    .eq("id", id);

  if (error) {
    console.error("Error updating consultation:", error);
    return { error: error.message };
  }

  revalidatePath("/psychiatrist/consultation/history");
  return { success: true };
}
