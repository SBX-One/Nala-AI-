"use server";

import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import { headers } from "next/headers";

export async function signInWithGoogle() {
  const supabase = await createClient();
  const headersList = await headers();
  const origin = headersList.get("origin") || "http://localhost:3000";

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo: `${origin}/auth/callback`,
      queryParams: {
        access_type: "offline",
        prompt: "consent",
      },
    },
  });

  if (error) {
    console.error("OAuth error:", error);
    return redirect("/register?error=oauth_failed");
  }

  if (data.url) {
    return redirect(data.url);
  }
}

export async function selectRole(role: "user" | "psychiatry") {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return redirect("/login");

  // Buat record User di tabel public.User
  const { error } = await supabase
    .from("User")
    .upsert(
      {
        auth_user_id: user.id,
        email: user.email!,
        role: role,
      },
      { onConflict: "auth_user_id" },
    )
    .select("id")
    .single();

  if (error) {
    console.error("Error creating user record:", error.message);
    return { error: error.message };
  }

  // Redirect ke halaman profile yang sesuai
  if (role === "user") {
    return redirect("/register/user-profile");
  } else {
    return redirect("/register/psychiatrist-profile");
  }
}

export async function signInWithEmail(formData: FormData) {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  if (!email || !password) {
    return redirect("/login?error=Email+dan+password+wajib+diisi");
  }

  const supabase = await createClient();

  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    console.error("Login error:", error.message);
    return redirect("/login?error=Email+atau+password+salah");
  }

  // Ambil data user yang baru login
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return redirect("/login?error=Gagal+mendapatkan+data+user");
  }

  // Cek role dan keberadaan profile dari tabel public.User berdasarkan auth_user_id
  const { data: userRecord } = await supabase
    .from("User")
    .select("id, role, UserProfile(id), PsychiatristProfile(id)")
    .eq("auth_user_id", user.id)
    .single();

  if (!userRecord) {
    // User ada di Auth tapi belum punya record di tabel User (belum pilih role)
    return redirect("/register/role");
  }

  // Cek apakah profil sudah lengkap berdasarkan role
  if (userRecord.role === "psychiatry") {
    if (!userRecord.PsychiatristProfile) {
      return redirect("/register/psychiatrist-profile");
    }
    return redirect("/psychiatrist");
  } else {
    if (!userRecord.UserProfile) {
      return redirect("/register/user-profile");
    }
    return redirect("/user");
  }
}

export async function signUpWithEmail(formData: FormData) {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  const confirmPassword = formData.get("confirmPassword") as string;

  if (!email || !password || !confirmPassword) {
    return redirect("/register?error=Semua+field+wajib+diisi");
  }

  if (password !== confirmPassword) {
    return redirect("/register?error=Password+tidak+cocok");
  }

  if (password.length < 6) {
    return redirect("/register?error=Password+minimal+6+karakter");
  }

  const supabase = await createClient();

  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: undefined, // tidak perlu email confirmation untuk sekarang
    },
  });

  if (error) {
    console.error("Register error:", error.message);
    if (error.message.includes("already registered")) {
      return redirect("/register?error=Email+sudah+terdaftar.+Silakan+login");
    }
    return redirect(`/register?error=${encodeURIComponent(error.message)}`);
  }

  // Setelah register berhasil, arahkan ke pilih role
  return redirect("/register/role");
}

export async function saveUserProfile(data: {
  fullName: string;
  displayName: string;
  sex: "male" | "female";
  location: string;
  birthDate: string;
  avatarUrl?: string | null;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return redirect("/login");

  // Dapatkan ID Int dari tabel User
  const { data: userRecord } = await supabase
    .from("User")
    .select("id")
    .eq("auth_user_id", user.id)
    .single();

  if (!userRecord) return redirect("/register/role");

  const birth_date = new Date(data.birthDate);

  const { error } = await supabase.from("UserProfile").upsert({
    user_id: userRecord.id,
    name: data.fullName,
    display_name: data.displayName,
    sex: data.sex,
    location: data.location,
    birth_date: birth_date.toISOString(),
    avatar_url: data.avatarUrl || null,
  });

  if (error) {
    console.error("Error saving user profile:", error.message);
    return { error: error.message };
  }

  return redirect("/user");
}

export async function savePsychiatristProfile(data: {
  fullName: string;
  sex: string;
  specialization: string;
  licenseNumber: string;
  description: string;
  price: string;
  experienceStart: string;
  experienceEnd: string;
  selectedExpertiseIds: number[];
  availability: { day: string; startTime: string; endTime: string }[];
  avatarUrl?: string | null;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return redirect("/login");

  // Dapatkan ID Int dari tabel User
  const { data: userRecord } = await supabase
    .from("User")
    .select("id")
    .eq("auth_user_id", user.id)
    .single();

  if (!userRecord) return redirect("/register/role");

  // 1. Simpan profile utama menggunakan upsert
  const { data: profileRecord, error: profileError } = await supabase
    .from("PsychiatristProfile")
    .upsert(
      {
        user_id: userRecord.id,
        name: data.fullName,
        specialization: data.specialization || null,
        license_number: data.licenseNumber || null,
        description: data.description || null,
        experience_start: new Date(data.experienceStart).toISOString(),
        experience_end: data.experienceEnd
          ? new Date(data.experienceEnd).toISOString()
          : null,
        price: Number(data.price) || 0,
        sex: data.sex,
        avatar_url: data.avatarUrl || null,
        is_availability: true,
      },
      { onConflict: "user_id" },
    )
    .select("id")
    .single();

  if (profileError) {
    console.error("Error saving psychiatrist profile:", profileError.message);
    return { error: profileError.message };
  }

  // 2. Simpan relasi expertise menggunakan expertise_id dari tabel Expertise
  if (data.selectedExpertiseIds && data.selectedExpertiseIds.length > 0) {
    // Delete old expertise first
    await supabase
      .from("PsychiatristExpertise")
      .delete()
      .eq("psychiatrist_id", profileRecord.id);

    const expertiseRows = data.selectedExpertiseIds.map((expertiseId) => ({
      psychiatrist_id: profileRecord.id,
      expertise_id: expertiseId,
    }));

    const { error: expertiseError } = await supabase
      .from("PsychiatristExpertise")
      .insert(expertiseRows);

    if (expertiseError) {
      console.error(
        "Error saving expertise relations:",
        expertiseError.message,
      );
    }
  }

  // 3. Simpan availability times
  if (data.availability && data.availability.length > 0) {
    // Delete old availability first
    await supabase
      .from("PsychiatristAvailabilityTime")
      .delete()
      .eq("psychiatrist_id", profileRecord.id);

    const availabilityRows = data.availability.map((a) => ({
      psychiatrist_id: profileRecord.id,
      day: a.day as any, // Cast ke enum Day
      availability_start_time: `${a.startTime}:00`,
      availability_end_time: `${a.endTime}:00`,
    }));

    const { error: availabilityError } = await supabase
      .from("PsychiatristAvailabilityTime")
      .insert(availabilityRows);

    if (availabilityError) {
      console.error(
        "Error saving availability times:",
        availabilityError.message,
      );
    }
  }

  // 4. Update role user menjadi psychiatry setelah profile berhasil dibuat
  await supabase
    .from("User")
    .update({ role: "psychiatry" })
    .eq("id", userRecord.id);

  return { success: true };
}

export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  return redirect("/login");
}
