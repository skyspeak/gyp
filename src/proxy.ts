import { NextRequest, NextResponse } from "next/server";

export const config = { matcher: ["/admin/:path*"] };

function unauthorized() {
  return new NextResponse("Authentication required.", {
    status: 401,
    headers: { "WWW-Authenticate": 'Basic realm="Gap Year Platform admin"' },
  });
}

export function proxy(req: NextRequest) {
  const user = process.env.ADMIN_USER;
  const pass = process.env.ADMIN_PASSWORD;

  if (!user || !pass) {
    return new NextResponse("Admin access is not configured. Set ADMIN_USER and ADMIN_PASSWORD.", { status: 503 });
  }

  const auth = req.headers.get("authorization");
  if (!auth?.startsWith("Basic ")) return unauthorized();

  const decoded = atob(auth.slice(6));
  const sep = decoded.indexOf(":");
  const providedUser = decoded.slice(0, sep);
  const providedPass = decoded.slice(sep + 1);

  if (providedUser !== user || providedPass !== pass) return unauthorized();

  return NextResponse.next();
}
