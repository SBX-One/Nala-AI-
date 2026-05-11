// app/auth/callback/route.ts
import { createClient } from "@/utils/supabase/server";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/register/role";

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error) {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      // Default redirect
      let nextPath = next;

      if (user) {
        // Cek apakah user sudah punya record di tabel User
        const { data: userRecord } = await supabase
          .from("User")
          .select("role, UserProfile(id), PsychiatristProfile(id)")
          .eq("auth_user_id", user.id)
          .maybeSingle();

        if (userRecord) {
          if (userRecord.role === "psychiatry") {
            nextPath = userRecord.PsychiatristProfile ? "/psychiatrist" : "/register/psychiatrist-profile";
          } else {
            nextPath = userRecord.UserProfile ? "/user" : "/register/user-profile";
          }
        }
      }

      const forwardedHost = request.headers.get("x-forwarded-host");
      const isLocalEnv = process.env.NODE_ENV === "development";

      if (isLocalEnv) {
        return NextResponse.redirect(`${origin}${nextPath}`);
      } else if (forwardedHost) {
        return NextResponse.redirect(`https://${forwardedHost}${nextPath}`);
      } else {
        return NextResponse.redirect(`${origin}${nextPath}`);
      }
    } else {
      // TAMBAHKAN LOG INI UNTUK MELIHAT ERROR ASLINYA
      console.error("Gagal tukar kode ke session:", error.message);
    }
  }

  // Jika ada error, redirect ke halaman register dengan error
  return NextResponse.redirect(`${origin}/register?error=auth_failed`);
}
