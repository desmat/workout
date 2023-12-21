import { NextResponse } from 'next/server'
import { getExercises, createExercise } from '@/services/exercise';
import { validateUserSession } from '@/services/users';

export const maxDuration = 300;
// export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  console.log('>> app.api.exercises.GET');

  const { user } = await validateUserSession(request);
  if (!user) {
    return NextResponse.json(
      { success: false, message: 'authentication failed' },
      { status: 401 }
    );
  }

  const exercises = await getExercises(user);
  return NextResponse.json({ exercises });
}

export async function POST(request: Request) {
  console.log('>> app.api.exercises.POST');

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
