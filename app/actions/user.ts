"use server";

import { createClient } from "@/utils/supabase/server";

export async function getUserProfile() {
	const supabase = await createClient();
	const {
		data: { user },
	} = await supabase.auth.getUser();

	if (!user) return null;

	const { data, error } = await supabase
		.from("UserProfile")
		.select("*")
		.eq("user_id", (await supabase.from("User").select("id").eq("auth_user_id", user.id).single()).data?.id)
		.single();

	if (error) {
		console.error("Error fetching user profile:", error.message);
		return null;
	}

	return data;
}
