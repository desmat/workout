import { NextResponse } from 'next/server'
import { getWorkout, saveWorkout, deleteWorkout } from '@/services/workout';
import { validateUserSession } from '@/services/users';

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  console.log('>> app.api.workout.[id].GET', { params });

  const workout = await getWorkout(params.id);
  if (!workout) {
    return NextResponse.json({ workout: {} }, { status: 404 });
  }

  return NextResponse.json({ workout });
}

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  console.log('>> app.api.workout.[id].PUT', { params });

  const { user } = await validateUserSession(request)
  if (!user) {
    return NextResponse.json(
      { success: false, message: 'authentication failed' },
      { status: 401 }
    );
  }

  const workout = await getWorkout(params.id);
  if (!workout) {
    return NextResponse.json({ workout: {} }, { status: 404 });
  }

  const data: any = await request.json();
  const savedWorkout = await saveWorkout(user, data.workout);
  return NextResponse.json({ workout: savedWorkout });
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  console.log('>> app.api.workout.DELETE', { params });
  const { user } = await validateUserSession(request)
  if (!user) {
    return NextResponse.json(
      { success: false, message: 'authentication failed' },
      { status: 401 }
    );
  }

  if (!params.id) {
    throw `Cannot delete workout with null id`;
  }

  const game = await deleteWorkout(user, params.id);
  return NextResponse.json({ game });
}
