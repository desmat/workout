export const maxDuration = 300;
// export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server'
import { getExercises, createExercise } from '@/services/exercise';
import { validateUserSession } from '@/services/users';

export async function GET(request: Request) {
  console.log('>> app.api.exercises.GET');

  const exercises = await getExercises();
  return NextResponse.json({ exercises });
}

export async function POST(request: Request) {
  const { user } = await validateUserSession(request);
  if (!user) {
    return NextResponse.json(
      { success: false, message: 'authentication failed' },
      { status: 401 }
    );
  }

  const data: any = await request.json();
  const exercise = await createExercise(user, data.name);
  return NextResponse.json({ exercise });
}
