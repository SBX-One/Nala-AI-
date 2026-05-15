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
          cookiesToSet.forEach(({ name, value }) =>
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

  const pathname = request.nextUrl.pathname;
  const isAuthPath = pathname.startsWith("/auth");
  const isRegisterPath = pathname.startsWith("/register");
  const isLoginPath = pathname === "/login";
  const isApi = pathname.startsWith("/api");
  const isExpertiseApi = pathname === "/api/expertises";
  const isPublicPath = isAuthPath || isRegisterPath || isLoginPath || isExpertiseApi;

  // 1. Handle not logged in
  if (!user && !isPublicPath) {
    if (isApi) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }
    return NextResponse.redirect(new URL("/login", request.url));
  }

  // 2. Profile check if logged in
  if (user) {
    // Redirect logged in users away from login/base register
    if (isLoginPath || pathname === "/register") {
      return NextResponse.redirect(new URL("/", request.url));
    }

    // Skip profile check for register sub-paths, auth callbacks and expertise api
    if (!isRegisterPath && !isAuthPath && !isExpertiseApi) {
      const { data: userData, error: userError } = await supabase
        .from("User")
        .select("role, UserProfile(id), PsychiatristProfile(id)")
        .eq("auth_user_id", user.id)
        .maybeSingle();

      // If DB error or no user record, force role selection
      if (userError || !userData) {
        if (isApi) {
          return NextResponse.json(
            { error: "Role selection required" },
            { status: 403 }
          );
        }
        return NextResponse.redirect(new URL("/register/role", request.url));
      }

      // Strict role-based profile enforcement
      const hasUserProfile = userData.UserProfile && (Array.isArray(userData.UserProfile) ? userData.UserProfile.length > 0 : true);
      const hasPsychiatristProfile = userData.PsychiatristProfile && (Array.isArray(userData.PsychiatristProfile) ? userData.PsychiatristProfile.length > 0 : true);

      if (userData.role === "user") {
        if (!hasUserProfile) {
          if (isApi) {
            return NextResponse.json(
              { error: "User profile incomplete" },
              { status: 403 }
            );
          }
          return NextResponse.redirect(new URL("/register/user-profile", request.url));
        }
        // Prevent access to psychiatrist routes
        if (pathname.startsWith("/psychiatrist")) {
          return NextResponse.redirect(new URL("/user", request.url));
        }
      }

      if (userData.role === "psychiatry") {
        if (!hasPsychiatristProfile) {
          if (isApi) {
            return NextResponse.json(
              { error: "Psychiatrist profile incomplete" },
              { status: 403 }
            );
          }
          return NextResponse.redirect(new URL("/register/psychiatrist-profile", request.url));
        }
        // Prevent access to user routes
        if (pathname.startsWith("/user")) {
          return NextResponse.redirect(new URL("/psychiatrist", request.url));
        }
      }

      // Handle root redirection
      if (pathname === "/") {
        const target = userData.role === "psychiatry" ? "/psychiatrist" : "/user";
        return NextResponse.redirect(new URL(target, request.url));
      }
    }
  }

  return supabaseResponse;
}
