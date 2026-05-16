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
  const formattedConsultations = consultations?.map((session) => ({
    ...session,
    medicines: session.medicines?.map((m: any) => ({
      ...m,
      name: m.medicine?.name || "Unknown Medicine",
    })),
  }));

  return { data: formattedConsultations };
}

export async function updateConsultation(
  id: number,
  data: {
    diagnose: string;
    consultation_notes?: string;
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
      consultation_notes: data.consultation_notes,
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
          }),
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
export async function getQueueData() {
  const supabase = await createClient();

  // Get current logged in psychiatrist user
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Not authenticated" };

  // Get psychiatrist profile ID
  const { data: psychiatrist } = await supabase
    .from("User")
    .select("id, PsychiatristProfile(id)")
    .eq("auth_user_id", user.id)
    .single();

  const profile = Array.isArray(psychiatrist?.PsychiatristProfile)
    ? psychiatrist?.PsychiatristProfile[0]
    : psychiatrist?.PsychiatristProfile;

  const psychiatristId = profile?.id;
  if (!psychiatristId) {
    console.error("Psychiatrist profile not found for user:", user.id);
    return { error: "Psychiatrist profile not found" };
  }

  // Use local date for better "today" matching
  const now = new Date();
  const todayStr = now.toLocaleDateString("en-CA"); // YYYY-MM-DD in local time
  const timeStr = now.toLocaleTimeString("en-GB", { hour12: false }); // HH:MM:SS in local time

  console.log(`Fetching queue for Date: ${todayStr}, Time: ${timeStr}`);

  // 1. KPIs
  // Today's appointments count
  const { count: todayCount } = await supabase
    .from("Consultation")
    .select("*", { count: "exact", head: true })
    .eq("psychiatrist_id", psychiatristId)
    .eq("date", todayStr);

  // Completed count
  const { count: completedCount } = await supabase
    .from("Consultation")
    .select("*", { count: "exact", head: true })
    .eq("psychiatrist_id", psychiatristId)
    .in("status", ["finished", "published"]);

  // Next session
  const { data: nextSessions } = await supabase
    .from("Consultation")
    .select("start_time")
    .eq("psychiatrist_id", psychiatristId)
    .eq("date", todayStr)
    .gt("start_time", timeStr)
    .order("start_time", { ascending: true })
    .limit(1);

  const nextSession = nextSessions?.[0];

  // 2. Ongoing Consultation
  const { data: ongoingConsultation } = await supabase
    .from("Consultation")
    .select(
      `
      *,
      user:UserProfile(id, name, avatar_url)
    `,
    )
    .eq("psychiatrist_id", psychiatristId)
    .eq("status", "on_going")
    .limit(1)
    .single();

  // 3. Queue List
  const { data: queueList } = await supabase
    .from("Consultation")
    .select(
      `
      *,
      user:UserProfile(name, avatar_url)
    `,
    )
    .eq("psychiatrist_id", psychiatristId)
    .eq("date", todayStr)
    .in("status", ["pending", "on_going"])
    .order("start_time", { ascending: true });

  // 4. Past Consultations (Last 4)
  const { data: pastConsultations } = await supabase
    .from("Consultation")
    .select(
      `
      *,
      user:UserProfile(name)
    `,
    )
    .eq("psychiatrist_id", psychiatristId)
    .in("status", ["finished", "published"])
    .order("date", { ascending: false })
    .order("start_time", { ascending: false })
    .limit(4);

  // Manual Join MeetingRoom for ongoing and queue
  const allUserIds = [
    ...(ongoingConsultation ? [ongoingConsultation.user_id] : []),
    ...(queueList ? queueList.map((q: any) => q.user_id) : []),
  ];

  const { data: rooms } = await supabase
    .from("MeetingRoom")
    .select("*")
    .eq("psychiatrist_id", psychiatristId)
    .in("user_id", allUserIds);

  const roomsMap = new Map(rooms?.map((r) => [r.user_id, r]) || []);

  if (ongoingConsultation) {
    ongoingConsultation.meeting_room = roomsMap.get(
      ongoingConsultation.user_id,
    );
  }

  const finalQueue =
    queueList?.map((item: any) => ({
      ...item,
      meeting_room: roomsMap.get(item.user_id),
    })) || [];

  return {
    data: {
      kpis: {
        today: todayCount || 0,
        completed: completedCount || 0,
        nextSession: nextSession?.start_time || null,
      },
      ongoing: ongoingConsultation || null,
      queue: finalQueue,
      past: pastConsultations || [],
    },
  };
}

export async function joinMeetingRoom(
  userId: number,
  psychiatristId: number,
  consultationId: number,
) {
  const supabase = await createClient();

  // Verify authentication
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Not authenticated" };

  // 0. Check if consultation is already finished
  const { data: consData } = await supabase
    .from("Consultation")
    .select("status")
    .eq("id", consultationId)
    .single();

  if (consData?.status === "finished" || consData?.status === "published") {
    return {
      error: "This consultation has already ended and cannot be accessed.",
    };
  }

  // 1. Update Consultation status to on_going
  await supabase
    .from("Consultation")
    .update({ status: "on_going" })
    .eq("id", consultationId);

  const now = new Date().toISOString();

  // 2. Find if there's an active room already (status on_going or pending)
  let { data: room } = await supabase
    .from("MeetingRoom")
    .select("id, user_join, psychiatrist_join")
    .eq("user_id", userId)
    .eq("psychiatrist_id", psychiatristId)
    .neq("status", "finished")
    .maybeSingle();

  if (!room) {
    // 3. Create fresh meeting room
    const { data: newRoom, error: createError } = await supabase
      .from("MeetingRoom")
      .insert({
        user_id: userId,
        psychiatrist_id: psychiatristId,
        status: "on_going",
        psychiatrist_join: true,
        start_at: now,
      })
      .select("id, user_join, psychiatrist_join")
      .single();

    if (createError) {
      console.error("Error creating meeting room:", createError);
      return { error: createError.message };
    }
    room = newRoom;
  } else {
    // 4. Update existing active room
    const { error: updateError } = await supabase
      .from("MeetingRoom")
      .update({
        psychiatrist_join: true,
        status: "on_going",
        start_at: now, // Update start time to when psychiatrist actually enters
      })
      .eq("id", room.id);

    if (updateError) {
      console.error("Error joining meeting room:", updateError);
      return { error: updateError.message };
    }
  }

  if (!room) return { error: "Failed to initialize meeting room" };
  return { success: true, roomId: room.id };
}

export async function getPatientInfo(userId: number) {
  const supabase = await createClient();

  // 1. Fetch UserProfile
  const { data: profile, error: profileError } = await supabase
    .from("UserProfile")
    .select("*")
    .eq("id", userId)
    .single();

  if (profileError) {
    console.error("Error fetching patient profile:", profileError);
    return { error: profileError.message };
  }

  // 1.1 Fetch latest consultation to get complaint
  const { data: latestConsultation } = await supabase
    .from("Consultation")
    .select("id, complaint, ai_summary")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(1)
    .single();

  const profileWithComplaint = {
    ...profile,
    latest_consultation_id: latestConsultation?.id || null,
    complaint: latestConsultation?.complaint || null,
    ai_summary: latestConsultation?.ai_summary || null,
  };

  // 2. Fetch Medication History from ALL past consultations of this user
  // We need to find consultations for this user first
  const { data: pastConsultations } = await supabase
    .from("Consultation")
    .select("id")
    .eq("user_id", userId);

  const consultationIds = pastConsultations?.map((c) => c.id) || [];

  let medicationHistory: any[] = [];
  if (consultationIds.length > 0) {
    const { data: meds, error: medsError } = await supabase
      .from("ConsultationMedicine")
      .select(
        `
        *,
        medicine:Medicine(name)
      `,
      )
      .in("consultation_id", consultationIds)
      .order("created_at", { ascending: false });

    if (medsError) {
      console.error("Error fetching medication history:", medsError);
    } else {
      medicationHistory =
        meds?.map((m: any) => ({
          ...m,
          name: m.medicine?.name || "Unknown",
        })) || [];
    }
  }

  return {
    data: {
      profile: profileWithComplaint,
      medicationHistory,
    },
  };
}

export async function updateAiSummary(consultationId: number, aiSummary: string) {
  const supabase = await createClient();

  const { error } = await supabase
    .from("Consultation")
    .update({ ai_summary: aiSummary })
    .eq("id", consultationId);

  if (error) {
    console.error("Error updating AI summary:", error);
    return { error: error.message };
  }

  return { success: true };
}

export async function endMeetingRoom(
  roomId: number,
  notes?: string,
  diagnose?: string,
  aiSummary?: string,
) {
  const supabase = await createClient();

  // 1. Get room details to calculate duration
  const { data: room } = await supabase
    .from("MeetingRoom")
    .select("start_at, created_at, user_id, psychiatrist_id")
    .eq("id", roomId)
    .single();

  if (!room) return { error: "Room not found" };

  const startAt = new Date(room.start_at || room.created_at);
  const endAt = new Date();
  const duration = Math.round(
    (endAt.getTime() - startAt.getTime()) / (1000 * 60),
  ); // Duration in minutes

  // 2. Update MeetingRoom status
  const { error: roomError } = await supabase
    .from("MeetingRoom")
    .update({
      status: "finished",
      end_at: endAt.toISOString(),
      duration: duration,
    })
    .eq("id", roomId);

  if (roomError) {
    console.error("Error ending meeting room:", roomError);
    return { error: roomError.message };
  }

  // 3. Update Consultation status and save results
  // We need to find the latest on_going consultation for this user/psychiatrist pair
  const { data: consultation } = await supabase
    .from("Consultation")
    .select("id")
    .eq("user_id", room.user_id)
    .eq("psychiatrist_id", room.psychiatrist_id)
    .eq("status", "on_going")
    .order("created_at", { ascending: false })
    .limit(1)
    .single();

  if (consultation) {
    await supabase
      .from("Consultation")
      .update({
        status: "finished",
        psychiatrist_feedback: notes,
        diagnose: diagnose,
        ai_summary: aiSummary,
      })
      .eq("id", consultation.id);
  }

  return { success: true };
}

export async function getPostConsultationData(roomId: number) {
  const supabase = await createClient();

  // 1. Get Room and Patient ID
  const { data: room, error: roomError } = await supabase
    .from("MeetingRoom")
    .select("user_id, psychiatrist_id, start_at, end_at, duration")
    .eq("id", roomId)
    .single();

  if (roomError || !room) {
    return { error: "Room not found" };
  }

  // 2. Get Patient Info (Reuse existing logic but from DB)
  const patientInfo = await getPatientInfo(room.user_id);
  if (patientInfo.error) return { error: patientInfo.error };

  // 3. Get Consultation Details (Results)
  const { data: consultation } = await supabase
    .from("Consultation")
    .select("*, medicines:ConsultationMedicine(*, medicine:Medicine(name))")
    .eq("user_id", room.user_id)
    .eq("psychiatrist_id", room.psychiatrist_id)
    .order("created_at", { ascending: false })
    .limit(1)
    .single();

  return {
    data: {
      room,
      patientProfile: patientInfo.data?.profile || null,
      medicationHistory: patientInfo.data?.medicationHistory || [],
      consultation: consultation || null,
    },
  };
}

export async function finalizeConsultation(
  roomId: number,
  data: {
    diagnose?: string;
    sessionAiSummary?: string;
    consultationContext?: string;
    observationNotes?: string;
    consultationNotes?: string;
    psychiatristFeedback?: string;
    status?: string;
    medicines?: { name: string; dose: string; use: string; notes: string }[];
  },
) {
  const supabase = await createClient();

  // 1. Get room details
  const { data: room } = await supabase
    .from("MeetingRoom")
    .select("user_id, psychiatrist_id")
    .eq("id", roomId)
    .single();

  if (!room) return { error: "Room not found" };

  // 2. Update the latest consultation
  const { data: consultation } = await supabase
    .from("Consultation")
    .select("id")
    .eq("user_id", room.user_id)
    .eq("psychiatrist_id", room.psychiatrist_id)
    .order("created_at", { ascending: false })
    .limit(1)
    .single();

  if (!consultation) return { error: "Consultation record not found" };

  const { error } = await supabase
    .from("Consultation")
    .update({
      diagnose: data.diagnose,
      session_ai_summary: data.sessionAiSummary,
      consultation_context: data.consultationContext,
      observation_notes: data.observationNotes,
      consultation_notes: data.consultationNotes,
      psychiatrist_feedback: data.psychiatristFeedback,
      status: data.status || "finished",
    })
    .eq("id", consultation.id);

  if (error) {
    console.error("Error finalizing consultation:", error);
    return { error: error.message };
  }

  // Handle Medicines sync
  if (data.medicines) {
    const consultationId = consultation.id;
    // 1. Delete existing medicines for this consultation
    const { error: deleteError } = await supabase
      .from("ConsultationMedicine")
      .delete()
      .eq("consultation_id", consultationId);

    if (deleteError) {
      console.error("Error deleting old medicines:", deleteError);
      return { error: deleteError.message };
    }

    // 2. Insert new medicines
    if (data.medicines.length > 0) {
      try {
        const medicineEntries = await Promise.all(
          data.medicines.map(async (m) => {
            const medicineId = await getOrCreateMedicine(m.name);
            return {
              consultation_id: consultationId,
              medicine_id: medicineId,
              dose: m.dose,
              use: m.use,
              notes: m.notes,
            };
          }),
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
