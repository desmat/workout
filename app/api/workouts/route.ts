export const maxDuration = 300;
// export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server'
import { getWorkouts, createWorkout } from '@/services/workout';
import { validateUserSession } from '@/services/users';

export async function GET(request: Request) {
  console.log('>> app.api.workouts.GET');

  const workouts = await getWorkouts();
  return NextResponse.json({ workouts });
}

export async function POST(request: Request) {
  console.log('>> app.api.workouts.POST', request);
  const { user } = await validateUserSession(request);
  if (!user) {
    return NextResponse.json(
      { success: false, message: 'authentication failed' },
      { status: 401 }
    );
  }

  const data: any = await request.json();
  const workout = await createWorkout(user, data.name, data.exercises.split(/\s*,\s*/));
  return NextResponse.json({ workout });
}
