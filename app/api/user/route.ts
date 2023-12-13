// import { auth } from 'firebase-admin';
// import { getAuth } from 'firebase-admin/auth';
import { NextResponse } from 'next/server'
import { cookies } from "next/headers";
// import { app, init } from "@/services/auth";
import * as users from "@/services/users"; // import just to make sure Firebase Auth Admin has init'ed

// export const revalidate = 0
// false | 'force-cache' | 0 | number

export async function GET(request: Request) {
  // console.log('>> app.api.user.GET', request);  
  const { user, error } = await users.validateUserSession(request) as any;

  // console.log('>> app.api.user.GET', { user, error});

  if (!user) {
    if (error) {
      // if (error.code == "TOKEN_EXPIRED") {
      //   console.warn("TOKEN EXPIRED");
      // }
      return NextResponse.json(
        { success: false, message: 'authentication failed', error: error.message },
        { status: 401 }
      );
    } 
    
    return NextResponse.json({});
  }

  return NextResponse.json(user);
}

export async function POST(request: Request) {
  const { user: _user, refreshToken } = await users.authenticateUser(request) as any;
  const isAdmin = _user && (process.env.ADMIN_USERS?.split(/\s*\,\s*/) || []).includes(_user.email);

  console.log('>> app.api.user.POST', { _user, isAdmin });

  if (!_user) {
    return NextResponse.json(
      { success: false, message: 'authentication failed' },
      { status: 401 }
    );
  }

  const user = await users.setCustomUserClaims(_user.uid, { admin: isAdmin });

  //Generate auth token cookie
  const expiresIn = 60 * 60 * 24 * 5 * 1000;
  cookies().set({
    name: "session",
    value: refreshToken,
    maxAge: expiresIn,
    httpOnly: true,
    secure: false,
  });
  
  return NextResponse.json(user);
}

export async function DELETE(request: Request) {
  // console.log('>> app.api.user.DELETE', request);
  cookies().delete("session");
  return NextResponse.json({ status: "ok" });
}
