import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { getSupabaseConfig } from "./env";
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
    data: { session },
  } = await supabase.auth.getSession();
  const hasSession = Boolean(session);

  const isPublicRoute = PUBLIC_ROUTES.includes(pathname);

  // This is only an early UX redirect. Layouts authorize through an
  // RLS-protected profile read, so session storage is never the trust boundary.
  if (!hasSession && !isPublicRoute) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    return NextResponse.redirect(url);
  }

  return response;
}
