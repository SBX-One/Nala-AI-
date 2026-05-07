import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

// Routes yang bisa diakses tanpa login (untuk slicing/development)
const PUBLIC_ROUTES = ["/login", "/auth", "/psychiatrist", "/user"];

function isPublicRoute(pathname: string): boolean {
	return PUBLIC_ROUTES.some((route) => pathname.startsWith(route));
}

export async function updateSession(request: NextRequest) {
	let supabaseResponse = NextResponse.next({
		request,
	});

	// Bypass auth check untuk public routes (slicing mode)
	if (isPublicRoute(request.nextUrl.pathname)) {
		return supabaseResponse;
	}

	try {
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

		// IMPORTANT: Avoid writing any logic between createServerClient and
		// supabase.auth.getUser(). A simple mistake can make it very hard to debug
		// issues with users being randomly logged out.

		const {
			data: { user },
		} = await supabase.auth.getUser();

		if (!user) {
			// no user, redirect to login page
			const url = request.nextUrl.clone();
			url.pathname = "/login";
			return NextResponse.redirect(url);
		}

		// IMPORTANT: You *must* return the supabaseResponse object as it is. If you're
		// creating a new response object with NextResponse.next() make sure to:
		// 1. Pass the request in it, like so:
		//    const myNewResponse = NextResponse.next({ request })
		// 2. Copy over the cookies, like so:
		//    myNewResponse.cookies.setAll(supabaseResponse.cookies.getAll())
		// 3. Change the myNewResponse object to fit your needs, but avoid changing
		//    the cookies!
		// 4. Return the myNewResponse object.
		// If this is not done, you may be causing the browser and server to go out
		// of sync and terminate the user's session prematurely!

		return supabaseResponse;
	} catch (error) {
		// Jika Supabase env vars tidak valid, bypass auth untuk development
		console.warn(
			"[Middleware] Supabase auth error, bypassing for development:",
			error,
		);
		return supabaseResponse;
	}
}
