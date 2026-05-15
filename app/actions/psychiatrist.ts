"use server";

import { createClient } from "@/utils/supabase/server";

export async function getPsychiatrists() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("PsychiatristProfile")
    .select(
      `
      *,
      user:User (
        email,
        user_profile:UserProfile (
          name
        )
      ),
      expertises:PsychiatristExpertise (
        expertise:Expertise (
          name
        )
      ),
      availability_times:PsychiatristAvailabilityTime (*)
    `,
    )
    .eq("is_availability", true);

  if (error) {
    console.error("Error fetching psychiatrists:", error.message);
    return [];
  }

  return data.map((p: any) => {
    // Hitung tahun pengalaman
    const start = new Date(p.experience_start);
    const end = p.experience_end ? new Date(p.experience_end) : new Date();
    const years = end.getFullYear() - start.getFullYear();

    return {
      id: p.id,
      name: p.name || "Dr. Anonymous",
      status: p.is_availability ? "Available" : "Busy",
      spesialist: p.specialization || "General Psychiatrist",
      description: p.description || "No description available",
      advertise: p.expertises?.map((e: any) => e.expertise.name) || [],
      experience: years > 0 ? years : 1,
      PatientCount: Math.floor(Math.random() * 1000) + 100, // Dummy
      Price: p.price,
      rating: 4.8, // Dummy
      availability: p.availability_times,
    };
  });
}

export async function getCurrentPsychiatristProfile() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const { data: internalUser, error: userError } = await supabase
    .from("User")
    .select("id")
    .eq("auth_user_id", user.id)
    .single();

  if (userError || !internalUser) return null;

  const { data, error } = await supabase
    .from("PsychiatristProfile")
    .select(
      `
      *,
      user:User (
        email,
        user_profile:UserProfile (
          name,
          avatar_url,
          sex
        )
      ),
      expertises:PsychiatristExpertise (
        expertise_id
      )
    `,
    )
    .eq("user_id", internalUser.id)
    .single();

  if (error || !data) return null;

  return {
    id: data.id,
    userId: internalUser.id,
    fullName: data.name || data.user.user_profile?.name || "",
    email: data.user.email,
    sex: data.sex || data.user.user_profile?.sex || "male",
    avatarUrl: data.avatar_url || data.user.user_profile?.avatar_url || "",
    description: data.description || "",
    specialization: data.specialization || "",
    licenseNumber: data.license_number || "",
    price: data.price || 0,
    experienceStart: data.experience_start || "",
    experienceEnd: data.experience_end || "",
    selectedExpertiseIds: data.expertises?.map((e: any) => e.expertise_id) || [],
  };
}

export async function updatePsychiatristProfile(formData: any) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { error: "Unauthorized" };

  const { data: internalUser } = await supabase
    .from("User")
    .select("id")
    .eq("auth_user_id", user.id)
    .single();

  if (!internalUser) return { error: "User not found" };

  // Update PsychiatristProfile
  const { error: profileError } = await supabase
    .from("PsychiatristProfile")
    .update({
      name: formData.fullName,
      specialization: formData.specialization,
      license_number: formData.licenseNumber,
      description: formData.description,
      price: formData.price,
      experience_start: formData.experienceStart,
      experience_end: formData.experienceEnd || null,
      sex: formData.sex,
      avatar_url: formData.avatarUrl,
    })
    .eq("user_id", internalUser.id);

  if (profileError) return { error: profileError.message };

  // Update UserProfile (if exists)
  const { data: existingUserProfile } = await supabase
    .from("UserProfile")
    .select("id")
    .eq("user_id", internalUser.id)
    .single();

  if (existingUserProfile) {
    await supabase
      .from("UserProfile")
      .update({
        name: formData.fullName,
        avatar_url: formData.avatarUrl,
        sex: formData.sex,
      })
      .eq("user_id", internalUser.id);
  }

  // Update Expertises
  if (formData.selectedExpertiseIds) {
    // Delete existing expertises
    await supabase
      .from("PsychiatristExpertise")
      .delete()
      .eq("psychiatrist_id", formData.id);

    // Insert new expertises
    const expertiseToInsert = formData.selectedExpertiseIds.map((eid: number) => ({
      psychiatrist_id: formData.id,
      expertise_id: eid,
    }));

    if (expertiseToInsert.length > 0) {
      const { error: expError } = await supabase
        .from("PsychiatristExpertise")
        .insert(expertiseToInsert);
      if (expError) return { error: expError.message };
    }
  }

  return { success: true };
}
