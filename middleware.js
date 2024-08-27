import { createMiddlewareClient } from "@supabase/auth-helpers-nextjs";
import { NextResponse } from "next/server";

// The middleware is used to refresh the user's session before loading Server Component routes
export async function middleware(req) {
  const res = NextResponse.next();

  // Handle session refresh
  const supabase = createMiddlewareClient({ req, res });
  await supabase.auth.getSession();

  // Redirect from /adp to /ADP
  const url = req.nextUrl.clone();
  if (url.pathname.toLowerCase() === "/adp" && url.pathname !== "/ADP") {
    url.pathname = "/ADP";
    return NextResponse.redirect(url);
  }

  return res;
}
