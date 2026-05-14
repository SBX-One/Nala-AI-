"use server";

import { createClient } from "@/utils/supabase/server";

export async function createAppointment(data: {
  psychiatristId: number;
  complaint: string;
  date: string; // ISO Date
  startTime: string; // HH:mm:ss
  endTime: string; // HH:mm:ss
  paymentMethod: string;
  cardHolder?: string;
  cardNumber?: string;
  expireDate?: string;
  cvv?: string;
  price: number;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) throw new Error("Unauthorized");

  // 1. Get internal User ID and role from auth_user_id
  const { data: userRecord, error: userRecordError } = await supabase
    .from("User")
    .select("id, role")
    .eq("auth_user_id", user.id)
    .single();

  if (userRecordError || !userRecord) {
    console.error("Internal user record not found for auth ID:", user.id);
    throw new Error("User record not found");
  }

  if (userRecord.role !== "user") {
    throw new Error("Only users can book consultations.");
  }

  // 2. Get UserProfile ID
  const { data: userProfile, error: profileError } = await supabase
    .from("UserProfile")
    .select("id")
    .eq("user_id", userRecord.id)
    .single();

  if (profileError || !userProfile) {
    console.error("UserProfile not found for internal ID:", userRecord.id);
    throw new Error(
      "User profile not found. Please complete your profile registration.",
    );
  }

  // 3. Create Consultation
  const { data: consultation, error: consultationError } = await supabase
    .from("Consultation")
    .insert({
      user_id: userProfile.id,
      psychiatrist_id: data.psychiatristId,
      complaint: data.complaint,
      date: data.date,
      start_time: data.startTime,
      end_time: data.endTime,
      topic: "General Consultation", // Default or could be dynamic
    })
    .select("id")
    .single();

  if (consultationError) {
    console.error("Error creating consultation:", consultationError.message);
    return { error: consultationError.message };
  }

  // 4. Create Billing
  const { error: billingError } = await supabase
    .from("ConsultationBilling")
    .insert({
      consultation_id: consultation.id,
      payment_method: data.paymentMethod,
      card_holder: data.cardHolder || null,
      card_number: data.cardNumber || null,
      expire_date: data.expireDate || null,
      cvv: data.cvv || null,
      subtotal: data.price,
      fee: 2000, // Platform fee
      total: data.price + 2000,
      status: "pending",
    });

  if (billingError) {
    console.error("Error creating billing:", billingError.message);
    return { error: billingError.message };
  }

  return { success: true, consultationId: consultation.id };
}

export async function getUserConsultations() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return [];

  // 1. Get internal User ID
  const { data: userRecord } = await supabase
    .from("User")
    .select("id")
    .eq("auth_user_id", user.id)
    .single();

  if (!userRecord) return [];

  // 2. Get UserProfile ID
  const { data: userProfile } = await supabase
    .from("UserProfile")
    .select("id")
    .eq("user_id", userRecord.id)
    .single();

  if (!userProfile) return [];

  // 3. Fetch Consultations
  const { data, error } = await supabase
    .from("Consultation")
    .select(`
      *,
      psychiatrist:PsychiatristProfile (
        *,
        user:User (
          user_profile:UserProfile (
            name,
            avatar_url
          )
        )
      ),
      billing:ConsultationBilling (*)
    `)
    .eq("user_id", userProfile.id)
    .order("date", { ascending: false });

  if (error) {
    console.error("Error fetching consultations:", error.message);
    return [];
  }

  return data;
}

export async function getConsultationById(id: number) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return null;

  const { data, error } = await supabase
    .from("Consultation")
    .select(`
      *,
      psychiatrist:PsychiatristProfile (
        *,
        user:User (
          user_profile:UserProfile (*)
        )
      ),
      billing:ConsultationBilling (*)
    `)
    .eq("id", id)
    .single();

  if (error) {
    console.error("Error fetching consultation:", error.message);
    return null;
  }

  return data;
}

export async function getActiveMeetingRoom(psychiatristId: number) {
	const supabase = await createClient();
	const {
		data: { user },
	} = await supabase.auth.getUser();
	if (!user) return null;

	// 1. Get internal User ID
	const { data: userRecord } = await supabase
		.from("User")
		.select("id")
		.eq("auth_user_id", user.id)
		.single();

	if (!userRecord) return null;

	// 2. Get UserProfile ID
	const { data: userProfile } = await supabase
		.from("UserProfile")
		.select("id")
		.eq("user_id", userRecord.id)
		.single();

	if (!userProfile) return null;

	// 3. Find active meeting room
	const { data: room } = await supabase
		.from("MeetingRoom")
		.select("id")
		.eq("user_id", userProfile.id)
		.eq("psychiatrist_id", psychiatristId)
		.neq("status", "finished")
		.single();

	return room?.id || null;
}
