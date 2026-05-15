"use server";

import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";

export async function getPsychiatristSchedule() {
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
    return { error: "Psychiatrist profile not found" };
  }

  const profile = Array.isArray(psychiatrist.PsychiatristProfile)
    ? psychiatrist.PsychiatristProfile[0]
    : psychiatrist.PsychiatristProfile;

  const psychiatristId = profile?.id;

  // 1. Fetch Availability Times
  const { data: availability, error: availError } = await supabase
    .from("PsychiatristAvailabilityTime")
    .select("*")
    .eq("psychiatrist_id", psychiatristId);

  if (availError) return { error: availError.message };

  // 2. Fetch Break Dates
  const { data: breaks, error: breakError } = await supabase
    .from("PsychiatristBreak")
    .select("*")
    .eq("psychiatrist_id", psychiatristId)
    .order("date", { ascending: true });

  if (breakError) return { error: breakError.message };

  return {
    data: {
      psychiatristId,
      availability: availability || [],
      breaks: breaks || [],
    },
  };
}

export async function updateAvailability(
  psychiatristId: number,
  availabilities: {
    day: string;
    startTime: string;
    endTime: string;
    breakStart?: string;
    breakEnd?: string;
    isActive: boolean;
  }[],
) {
  const supabase = await createClient();

  try {
    for (const avail of availabilities) {
      if (avail.isActive) {
        const { error } = await supabase
          .from("PsychiatristAvailabilityTime")
          .upsert({
            psychiatrist_id: psychiatristId,
            day: avail.day.toLowerCase(),
            availability_start_time: avail.startTime,
            availability_end_time: avail.endTime,
            break_start_time: avail.breakStart || null,
            break_end_time: avail.breakEnd || null,
          }, { onConflict: 'psychiatrist_id,day' });
        
        if (error) {
          throw new Error(`Error upserting availability for ${avail.day}: ${error.message}`);
        }
      } else {
        await supabase
          .from("PsychiatristAvailabilityTime")
          .delete()
          .eq("psychiatrist_id", psychiatristId)
          .eq("day", avail.day.toLowerCase());
      }
    }

    revalidatePath("/psychiatrist/schedule");
    return { success: true };
  } catch (error: any) {
    console.error(error);
    return { success: false, error: error.message };
  }
}

export async function addBreakDate(
  psychiatristId: number,
  data: {
    date: string;
    startTime?: string;
    endTime?: string;
    isFullDay: boolean;
    note?: string;
  },
) {
  const supabase = await createClient();

  const { error } = await supabase.from("PsychiatristBreak").insert({
    psychiatrist_id: psychiatristId,
    date: data.date,
    start_time: data.startTime || null,
    end_time: data.endTime || null,
    is_full_day: data.isFullDay,
    note: data.note,
  });

  if (error) return { error: error.message };

  revalidatePath("/psychiatrist/schedule");
  return { success: true };
}

export async function updateBreakDate(
  id: number,
  data: {
    startTime?: string;
    endTime?: string;
    isFullDay: boolean;
    note?: string;
  },
) {
  const supabase = await createClient();

  const { error } = await supabase
    .from("PsychiatristBreak")
    .update({
      start_time: data.startTime || null,
      end_time: data.endTime || null,
      is_full_day: data.isFullDay,
      note: data.note,
    })
    .eq("id", id);

  if (error) return { error: error.message };

  revalidatePath("/psychiatrist/schedule");
  return { success: true };
}

export async function deleteBreakDate(id: number) {
  const supabase = await createClient();

  const { error } = await supabase
    .from("PsychiatristBreak")
    .delete()
    .eq("id", id);

  if (error) return { error: error.message };

  revalidatePath("/psychiatrist/schedule");
  return { success: true };
}
