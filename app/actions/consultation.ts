"use server";

import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";
import { getOrCreateMedicine } from "./medicine";

export async function getConsultationHistory() {
  const supabase = await createClient();

  // Get current logged in psychiatrist user
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Not authenticated" };

  // Get psychiatrist profile ID
  const { data: psychiatrist } = await supabase
    .from("User")
    .select("id, role, PsychiatristProfile(id)")
    .eq("auth_user_id", user.id)
    .single();

  if (!psychiatrist || !psychiatrist.PsychiatristProfile) {
    console.error("Psychiatrist profile not found for user:", user.id);
    return { error: "Psychiatrist profile not found" };
  }

  // Handle both array and object responses from Supabase joins
  const profile = Array.isArray(psychiatrist.PsychiatristProfile)
    ? psychiatrist.PsychiatristProfile[0]
    : psychiatrist.PsychiatristProfile;

  const psychiatristId = profile?.id;

  if (!psychiatristId) {
    console.error("Invalid Psychiatrist ID:", psychiatristId);
    return { error: "Invalid Psychiatrist ID" };
  }

  // Fetch consultations with user profile info and medicine info
  const { data: consultations, error } = await supabase
    .from("Consultation")
    .select(
      `
      *,
      user:UserProfile(name, avatar_url, birth_date, location),
      medicines:ConsultationMedicine(
        *,
        medicine:Medicine(name)
      )
    `,
    )
    .eq("psychiatrist_id", psychiatristId)
    .order("date", { ascending: false });

  if (error) {
    console.error("Error fetching consultations:", error);
    return { error: error.message };
  }

  // Flatten the medicine names for the UI to be compatible with existing code
  const formattedConsultations = consultations?.map(session => ({
    ...session,
    medicines: session.medicines?.map((m: any) => ({
      ...m,
      name: m.medicine?.name || "Unknown Medicine"
    }))
  }));

  return { data: formattedConsultations };
}

export async function updateConsultation(
  id: number,
  data: { 
    diagnose: string; 
    psychiatrist_feedback: string; 
    status?: string;
    medicines?: { name: string; dose: string; use: string; notes: string }[];
  },
) {
  const supabase = await createClient();

  // Verify authentication
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Not authenticated" };

  // Update the consultation in Supabase
  const { error: updateError } = await supabase
    .from("Consultation")
    .update({
      diagnose: data.diagnose,
      psychiatrist_feedback: data.psychiatrist_feedback,
      status: data.status || "published",
    })
    .eq("id", id);

  if (updateError) {
    console.error("Error updating consultation:", updateError);
    return { error: updateError.message };
  }

  // Handle Medicines sync
  if (data.medicines) {
    // 1. Delete existing medicines for this consultation
    const { error: deleteError } = await supabase
      .from("ConsultationMedicine")
      .delete()
      .eq("consultation_id", id);

    if (deleteError) {
      console.error("Error deleting old medicines:", deleteError);
      return { error: deleteError.message };
    }

    // 2. Insert new medicines
    if (data.medicines.length > 0) {
      try {
        // Resolve all medicine IDs (get or create)
        const medicineEntries = await Promise.all(
          data.medicines.map(async (m) => {
            const medicineId = await getOrCreateMedicine(m.name);
            return {
              consultation_id: id,
              medicine_id: medicineId,
              dose: m.dose,
              use: m.use,
              notes: m.notes,
            };
          })
        );

        const { error: insertError } = await supabase
          .from("ConsultationMedicine")
          .insert(medicineEntries);

        if (insertError) {
          console.error("Error inserting medicines:", insertError);
          return { error: insertError.message };
        }
      } catch (err: any) {
        console.error("Critical error during medicine sync:", err);
        return { error: err.message };
      }
    }
  }

  revalidatePath("/psychiatrist/consultation/history");
  return { success: true };
}
