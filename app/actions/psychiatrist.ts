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
      sex: p.sex,
      availability: p.availability_times,
      image: p.photo_url,
    };
  });
}

export async function getExpertises() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("Expertise")
    .select("*")
    .order("name", { ascending: true });

  if (error) {
    console.error("Error fetching expertises:", error.message);
    return [];
  }

  return data;
}
