export const maxDuration = 300;
// export const dynamic = 'force-dynamic';

import { searchParamsToMap } from '@desmat/utils';
import { NextRequest, NextResponse } from 'next/server'
import { getWorkouts, createWorkout } from '@/services/workout';
import { validateUserSession } from '@/services/users';

export async function GET(request: NextRequest) {
  const query = searchParamsToMap(request.nextUrl.searchParams.toString());
  console.log('>> app.api.workouts.GET', { query });
  
  const workouts = await getWorkouts(query);
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

  const { name, exercises } = await request.json();

  if (!name || !exercises) {
    return NextResponse.json(
      { success: false, message: 'input required: name, exercise' },
      { status: 400 }
    );
  }

  const workout = await createWorkout(user, name, exercises.split(/\s*,\s*/));
  return NextResponse.json({ workout });
}
