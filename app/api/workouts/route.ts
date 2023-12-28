export const maxDuration = 300;
// export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server'
import { getWorkouts, createWorkout } from '@/services/workout';
import { validateUserSession } from '@/services/users';
import { searchParamsToObject } from '@/utils/misc';

export async function GET(request: NextRequest) {
  const query = searchParamsToObject(request.nextUrl.searchParams.toString());
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

  const data: any = await request.json();
  const workout = await createWorkout(user, data.name, data.exercises.split(/\s*,\s*/));
  return NextResponse.json({ workout });
}
