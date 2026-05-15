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
    sessionDuration: data.session_duration || 45,
    description: data.description || "",
    specialization: data.specialization || "",
    licenseNumber: data.license_number || "",
    price: data.price || 0,
    experienceStart: data.experience_start || "",
    experienceEnd: data.experience_end || "",
    selectedExpertiseIds:
      data.expertises?.map((e: any) => e.expertise_id) || [],
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
      session_duration: formData.sessionDuration,
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
    const expertiseToInsert = formData.selectedExpertiseIds.map(
      (eid: number) => ({
        psychiatrist_id: formData.id,
        expertise_id: eid,
      }),
    );

    if (expertiseToInsert.length > 0) {
      const { error: expError } = await supabase
        .from("PsychiatristExpertise")
        .insert(expertiseToInsert);
      if (expError) return { error: expError.message };
    }
  }

  return { success: true };
}

export async function getPsychiatristDashboardData() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Not authenticated" };

  const { data: internalUser } = await supabase
    .from("User")
    .select(
      `
      id, 
      PsychiatristProfile(id, name),
      UserProfile(name)
    `,
    )
    .eq("auth_user_id", user.id)
    .single();

  const profile = Array.isArray(internalUser?.PsychiatristProfile)
    ? internalUser?.PsychiatristProfile[0]
    : internalUser?.PsychiatristProfile;

  const psychiatristId = profile?.id;

  const rawName =
    profile?.name || internalUser?.UserProfile?.[0]?.name || "Psychiatrist";
  const nameParts = rawName.split(" ");
  const psychiatristName =
    nameParts[0].toLowerCase().startsWith("dr") && nameParts.length > 1
      ? `${nameParts[0]} ${nameParts[1]}`
      : nameParts[0];

  console.log("Psychiatrist Debug:", { psychiatristId, psychiatristName });

  if (!psychiatristId) {
    console.error(
      "Dashboard Error: Psychiatrist profile ID not found for internal user:",
      internalUser?.id,
    );
    return { error: "Psychiatrist profile not found" };
  }

  const now = new Date();
  const todayStr = now.toLocaleDateString("en-CA");
  const timeStr = now.toLocaleTimeString("en-GB", { hour12: false });

  // 1. KPIs
  const { count: todayCount, error: todayError } = await supabase
    .from("Consultation")
    .select("*", { count: "exact", head: true })
    .eq("psychiatrist_id", psychiatristId)
    .eq("date", todayStr);

  if (todayError)
    console.error("Error todayCount:", todayError.message, todayError.code);

  const { data: nextSessions, error: nextError } = await supabase
    .from("Consultation")
    .select("start_time")
    .eq("psychiatrist_id", psychiatristId)
    .eq("date", todayStr)
    .gt("start_time", timeStr)
    .order("start_time", { ascending: true })
    .limit(1);

  if (nextError)
    console.error("Error nextSessions:", nextError.message, nextError.code);

  const { count: draftCount, error: draftCountError } = await supabase
    .from("Consultation")
    .select("*", { count: "exact", head: true })
    .eq("psychiatrist_id", psychiatristId)
    .eq("status", "draft");

  if (draftCountError)
    console.error(
      "Error draftCount:",
      draftCountError.message,
      draftCountError.code,
    );

  // 2. Today's Sessions (Limit 2)
  const { data: todaySessions, error: sessionsError } = await supabase
    .from("Consultation")
    .select(
      `
      id,
      start_time,
      end_time,
      complaint,
      session_ai_summary,
      consultation_context,
      user:UserProfile(name, avatar_url),
      medicines:ConsultationMedicine(
        notes,
        use,
        dose,
        medicine:Medicine(name)
      )
    `,
    )
    .eq("psychiatrist_id", psychiatristId)
    .eq("date", todayStr)
    .order("start_time", { ascending: true })
    .limit(2);

  if (sessionsError)
    console.error(
      "Error todaySessions:",
      sessionsError.message,
      sessionsError.code,
    );

  // 3. Unfinished Feedback (status: draft, Limit 2)
  const { data: unfinishedFeedback, error: feedbackError } = await supabase
    .from("Consultation")
    .select(
      `
      id,
      topic,
      created_at,
      user:UserProfile(name, avatar_url)
    `,
    )
    .eq("psychiatrist_id", psychiatristId)
    .eq("status", "draft")
    .limit(2);

  const formatTime = (time: string) => {
    if (!time) return "";
    return time.slice(0, 5).replace(":", ".");
  };

  const formattedSessions =
    todaySessions?.map((s: any) => ({
      id: s.id,
      name: s.user?.name || "Patient",
      time: `Today, ${formatTime(s.start_time)} - ${formatTime(s.end_time)}`,
      image: s.user?.avatar_url,
      aiSummary: s.session_ai_summary,
      complaints: s.complaint || s.consultation_context,
      medicines:
        s.medicines?.map((m: any) => ({
          name: m.medicine?.name,
          dose: m.dose,
          use: m.use,
          notes: m.notes,
        })) || [],
    })) || [];

  const formattedFeedback =
    unfinishedFeedback?.map((f: any) => {
      const lastUpdate = new Date(f.created_at);
      const hoursAgo = Math.floor(
        (now.getTime() - lastUpdate.getTime()) / (1000 * 60 * 60),
      );
      return {
        id: f.id,
        name: f.user?.name || "Patient",
        description: f.topic || "Consultation Session",
        hours: hoursAgo > 0 ? hoursAgo : 0,
        image: f.user?.avatar_url,
      };
    }) || [];

  return {
    data: {
      psychiatristName,
      kpis: {
        todayCount: todayCount || 0,
        nextSession: nextSessions?.[0]?.start_time
          ? formatTime(nextSessions[0].start_time)
          : null,
        draftCount: draftCount || 0,
      },
      sessions: formattedSessions,
      feedback: formattedFeedback,
    },
  };
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
