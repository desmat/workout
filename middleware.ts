// middleware.ts
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { validateUserSession } from "./services/users";

export async function middleware(request: NextRequest) {
  const method = request.method;
  const url = request.nextUrl.pathname;

  // console.log("*** middleware", { url, method });

  if (url == "/api/user" && ["POST", "DELETE"].includes(method)) {
    // console.log("*** middleware PUBLIC USER PATH");
    return NextResponse.next();
  }

  if (!["POST", "PUT", "DELETE"].includes(method)) {
    // console.log("*** middleware PUBLIC NON-MUTATING PATH");
    return NextResponse.next();
  }

  const { user } = await validateUserSession(request);

  // console.log("*** middleware", { user });
  
  if (user) {
    return NextResponse.next();
  }

  return NextResponse.json(
    { success: false, message: 'authorization failed' },
    { status: 403 }
  );
}

// guard all api calls (logic will only look at mutating methods)
export const config = {
  matcher: ['/api/:path*'],
}
