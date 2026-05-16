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

	if (error || !data) {
		console.error("Error fetching user profile:", error?.message);
		return {
			name: user.user_metadata?.full_name || user.email?.split("@")[0] || "User",
			avatar_url: user.user_metadata?.avatar_url || "",
		};
	}

	return data;
}

export async function updateUserProfile(formData: any) {
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

	const { error } = await supabase
		.from("UserProfile")
		.update({
			name: formData.name,
			display_name: formData.displayName,
			sex: formData.sex,
			location: formData.location,
			birth_date: formData.birthDate,
			avatar_url: formData.avatarUrl,
		})
		.eq("user_id", internalUser.id);

	if (error) return { error: error.message };

	return { success: true };
}
