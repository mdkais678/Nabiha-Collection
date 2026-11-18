import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({ request });
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: {
      getAll: () => request.cookies.getAll(),
      setAll: (cookies) => cookies.forEach(({ name, value, options }) => {
        request.cookies.set(name, value);
        response.cookies.set(name, value, options);
      })
    }}
  );
  const { data: { user } } = await supabase.auth.getUser();
  const path = request.nextUrl.pathname;
  const isAdminPage = path.startsWith("/admin") && path !== "/admin/login";
  const isAdminApi = path.startsWith("/api/admin/");
  const isAdminArea = isAdminPage || isAdminApi;
  if (isAdminArea && !user) {
    if (isAdminApi) return NextResponse.json({ error: "Authentication required" }, { status: 401 });
    return NextResponse.redirect(new URL("/admin/login", request.url));
  }
  if (user && isAdminArea) {
    const { data: role } = await supabase.from("admin_roles").select("role").eq("user_id", user.id).maybeSingle();
    if (!role) {
      if (isAdminApi) return NextResponse.json({ error: "Administrator access required" }, { status: 403 });
      return NextResponse.redirect(new URL("/admin/login?error=unauthorized", request.url));
    }
  }
  if (request.nextUrl.pathname === "/admin/login" && user) {
    const { data: role } = await supabase.from("admin_roles").select("role").eq("user_id", user.id).maybeSingle();
    if (role) return NextResponse.redirect(new URL("/admin", request.url));
  }
  return response;
}
export const config = { matcher: ["/admin/:path*", "/api/admin/:path*"] };
