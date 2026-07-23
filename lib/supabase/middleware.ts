import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { getSupabaseConfig } from "./env";
import { getRoleLandingPath, isAdminRole, isDriverRole, isRestaurantRole } from "@/lib/auth/roles";

const PUBLIC_ROUTES = ["/login", "/signup"];

export async function updateSession(request: NextRequest) {
  let response = NextResponse.next({ request });
  const { url, key } = getSupabaseConfig();

  const supabase = createServerClient(
    url,
    key,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value),
          );
          response = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options),
          );
        },
      },
    },
  );

  const { pathname } = request.nextUrl;

  // API routes handle their own auth (see supabase.auth.getUser() calls in
  // each route) and must always return JSON, never an HTML page redirect —
  // the page-level gates below (onboarding, verification, role routing)
  // don't apply here.
  if (pathname.startsWith("/api")) {
    return response;
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const isPublicRoute = PUBLIC_ROUTES.includes(pathname);
  const isDriverRoute = pathname.startsWith("/driver");
  const isAdminRoute = pathname.startsWith("/admin");
  const isRestaurantRoute = pathname.startsWith("/restaurant");

  if (!user && !isPublicRoute) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    return NextResponse.redirect(url);
  }

  if (user) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("onboarding_completed, role, student_id_verified")
      .eq("id", user.id)
      .maybeSingle();

    const role = profile?.role;
    const isDriver = isDriverRole(role);
    const isAdmin = isAdminRole(role);
    const isRestaurant = isRestaurantRole(role);
    const landingPath = getRoleLandingPath(role);
    if (isPublicRoute) {
      const url = request.nextUrl.clone();
      url.pathname = landingPath;
      return NextResponse.redirect(url);
    }

    if (isDriver && !isDriverRoute) {
      const url = request.nextUrl.clone();
      url.pathname = "/driver/dashboard";
      return NextResponse.redirect(url);
    }

    if (isAdmin && !isAdminRoute) {
      const url = request.nextUrl.clone();
      url.pathname = "/admin/dashboard";
      return NextResponse.redirect(url);
    }

    if (isRestaurant && !isRestaurantRoute) {
      const url = request.nextUrl.clone();
      url.pathname = "/restaurant/dashboard";
      return NextResponse.redirect(url);
    }

    if (!isDriver && isDriverRoute) {
      const url = request.nextUrl.clone();
      url.pathname = landingPath;
      return NextResponse.redirect(url);
    }

    if (!isAdmin && isAdminRoute) {
      const url = request.nextUrl.clone();
      url.pathname = landingPath;
      return NextResponse.redirect(url);
    }

    if (!isRestaurant && isRestaurantRoute) {
      const url = request.nextUrl.clone();
      url.pathname = landingPath;
      return NextResponse.redirect(url);
    }

    if (
      profile &&
      !isDriver &&
      !isAdmin &&
      !isRestaurant &&
      pathname !== "/onboarding/verify-id" &&
      !profile.student_id_verified
    ) {
      const url = request.nextUrl.clone();
      url.pathname = "/onboarding/verify-id";
      return NextResponse.redirect(url);
    }

    if (
      profile &&
      !isDriver &&
      !isAdmin &&
      !isRestaurant &&
      pathname !== "/onboarding" &&
      profile.student_id_verified &&
      !profile.onboarding_completed
    ) {
      const url = request.nextUrl.clone();
      url.pathname = "/onboarding";
      return NextResponse.redirect(url);
    }
  }

  return response;
}
