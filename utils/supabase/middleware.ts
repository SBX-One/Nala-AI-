import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) =>
            request.cookies.set(name, value),
          );
          supabaseResponse = NextResponse.next({
            request,
          });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options),
          );
        },
      },
    },
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Public routes accessible without login
  const publicOnlyPaths = ["/login", "/register"]; // hanya base paths
  const alwaysPublicPaths = ["/auth"]; // callback routes
  const isPublicOnlyPath = publicOnlyPaths.some(
    (path) => request.nextUrl.pathname === path,
  );
  const isAlwaysPublic = alwaysPublicPaths.some((path) =>
    request.nextUrl.pathname.startsWith(path),
  );
  const isRegisterSubPath =
    request.nextUrl.pathname.startsWith("/register/");

  // Jika tidak login dan bukan public/auth path, redirect ke login
  if (!user && !isPublicOnlyPath && !isAlwaysPublic && !isRegisterSubPath) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    return NextResponse.redirect(url);
  }

  // Izinkan user yang belum login akses /register sub-path (seharusnya tidak terjadi,
  // tapi jika terjadi redirect ke register)
  if (!user && isRegisterSubPath) {
    const url = request.nextUrl.clone();
    url.pathname = "/register";
    return NextResponse.redirect(url);
  }

  // Jika sudah login dan mencoba akses /login atau /register (base), redirect ke home
  if (user && isPublicOnlyPath) {
    const url = request.nextUrl.clone();
    url.pathname = "/";
    return NextResponse.redirect(url);
  }

  // LOGIKA CEK PROFILE: Jika user sudah login dan TIDAK di jalur /register/
  if (user && !isRegisterSubPath && !isAlwaysPublic) {
    // Ambil data user dan profilnya (Gunakan nama tabel yang tepat: UserProfile & PsychiatristProfile)
    const { data: userData, error: userError } = await supabase
      .from("User")
      .select("role, UserProfile(id), PsychiatristProfile(id)")
      .eq("auth_user_id", user.id)
      .single();

    if (userError) {
      console.error("Middleware Auth Error:", userError.message);
    }

    console.log("Middleware Profile Check:", { 
      role: userData?.role, 
      hasUserProfile: !!userData?.UserProfile, 
      hasPsychiatristProfile: !!userData?.PsychiatristProfile 
    });

    // 1. Jika data User belum ada atau belum pilih role
    if (!userData) {
      const url = request.nextUrl.clone();
      url.pathname = "/register/role";
      return NextResponse.redirect(url);
    }

    // 2. Jika role user tapi UserProfile belum ada
    if (userData.role === "user" && !userData.UserProfile) {
      const url = request.nextUrl.clone();
      url.pathname = "/register/user-profile";
      return NextResponse.redirect(url);
    }

    // 3. Jika role psychiatry tapi PsychiatristProfile belum ada
    if (userData.role === "psychiatry" && !userData.PsychiatristProfile) {
      const url = request.nextUrl.clone();
      url.pathname = "/register/psychiatrist-profile";
      return NextResponse.redirect(url);
    }

    // ─────────────────────────────────────────────────────────
    // LOGIKA PROTEKSI ROLE: Mencegah cross-access rute
    // ─────────────────────────────────────────────────────────
    
    const isUserRoute = request.nextUrl.pathname.startsWith("/user");
    const isPsychiatristRoute = request.nextUrl.pathname.startsWith("/psychiatrist");

    // Jika role user mencoba masuk ke rute psikiater
    if (userData.role === "user" && isPsychiatristRoute) {
      const url = request.nextUrl.clone();
      url.pathname = "/user"; // Redirect ke dashboard user (pastikan rute ini ada)
      return NextResponse.redirect(url);
    }

    // Jika role psikiater mencoba masuk ke rute user
    if (userData.role === "psychiatry" && isUserRoute) {
      const url = request.nextUrl.clone();
      url.pathname = "/psychiatrist"; // Redirect ke dashboard psikiater (pastikan rute ini ada)
      return NextResponse.redirect(url);
    }
  }

  return supabaseResponse;
}
