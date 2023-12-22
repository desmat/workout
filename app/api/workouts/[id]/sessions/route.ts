// export const maxDuration = 300;

import { NextResponse } from 'next/server'
import { createSession, getSessions } from '@/services/workout';
import { validateUserSession } from '@/services/users';

export async function GET(request: Request) {
  console.log('>> app.api.workouts.[id].session.GET');

  const sessions = await getSessions()
  return NextResponse.json({ sessions });
}

export async function POST(request: Request) {
  console.log('>> app.api.workouts.[id].session.POST');

  const { user } = await validateUserSession(request);
  if (!user) {
    return NextResponse.json(
      { success: false, message: 'authentication failed' },
      { status: 401 }
    );
  }

  const data: any = await request.json();
  // console.log('>> app.api.workouts.[id].session.POST', { data });
  const session = await createSession(user, data);
  return NextResponse.json({ session });
}
