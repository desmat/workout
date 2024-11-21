import { searchParamsToMap } from '@desmat/utils';
import { NextRequest, NextResponse } from 'next/server'
import { getExercises, createExercise } from '@/services/exercise';
import { validateUserSession } from '@/services/users';

export const maxDuration = 300;
// export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest, params?: any) {
  const query = searchParamsToMap(request.nextUrl.searchParams.toString());
  console.log('>> app.api.exercises.GET', { query, searchParams: request.nextUrl.searchParams.toString() });
  
  const exercises = await getExercises(query);
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
