export const maxDuration = 300;
// export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server'
import { generateWorkout } from '@/services/workout';
import { validateUserSession } from '@/services/users';

export async function POST(request: Request) {
  console.log('>> app.api.workouts.generate.POST');
  const { user } = await validateUserSession(request);
  if (!user) {
    return NextResponse.json(
      { success: false, message: 'authentication failed' },
      { status: 401 }
    );
  }

  const data: any = await request.json();
  console.log('>> app.api.workouts.generate.POST', { data });

  const workout = await generateWorkout(user, data.name, data.parameters);
  return NextResponse.json({ workout });
}
