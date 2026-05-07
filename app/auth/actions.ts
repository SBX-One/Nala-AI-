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

  // Cek role dari tabel public.User berdasarkan auth_user_id
  const { data: userRecord } = await supabase
    .from("User")
    .select("role")
    .eq("auth_user_id", user.id)
    .single();

  if (!userRecord) {
    // User ada di Auth tapi belum punya record di tabel User (belum complete profile)
    return redirect("/register/role");
  }

  // Redirect berdasarkan role
  if (userRecord.role === "psychiatry") {
    return redirect("/psychiatrist");
  }

  return redirect("/user");
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

export async function saveUserProfile(formData: FormData) {
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

  const name = formData.get("fullName") as string;
  const display_name = formData.get("displayName") as string;
  const sex = formData.get("sex") as "male" | "female";
  const location = formData.get("location") as string;
  const birth_date = new Date(formData.get("birthDate") as string);

  const { error } = await supabase.from("UserProfile").upsert({
    user_id: userRecord.id,
    name,
    display_name,
    sex,
    location,
    birth_date: birth_date.toISOString(),
    avatar_url: null, // TODO: Handle file upload
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
        specialization: data.specialization || null,
        license_number: data.licenseNumber || null,
        description: data.description || null,
        experience_start: new Date(data.experienceStart).toISOString(),
        experience_end: data.experienceEnd
          ? new Date(data.experienceEnd).toISOString()
          : null,
        price: Number(data.price) || 0,
        sex: data.sex,
        avatar_url: null,
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
      // Tidak block registrasi, bisa diupdate nanti
    }
  }

  // 3. Update role user menjadi psychiatry setelah profile berhasil dibuat
  await supabase
    .from("User")
    .update({ role: "psychiatry" })
    .eq("id", userRecord.id);

  return redirect("/psychiatrist");
}

export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  return redirect("/login");
}
