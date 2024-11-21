import { getExercise, deleteExercise, saveExercise } from '@/services/exercise';
import { NextResponse } from 'next/server'
import { validateUserSession } from '@/services/users';

export const maxDuration = 300;

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  console.log('>> app.api.exercise.[id].GET', { params });

  const exercise = await getExercise(params.id);
  if (!exercise) {
    return NextResponse.json({ exercise: {} }, { status: 404 });
  }

  return NextResponse.json({ exercise });
}

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  console.log('>> app.api.exercise.[id].PUT', { params });

  const { user } = await validateUserSession(request)
  if (!user) {
    return NextResponse.json(
      { success: false, message: 'authentication failed' },
      { status: 401 }
    );
  }

  const exercise = await getExercise(params.id);
  if (!exercise) {
    return NextResponse.json({ exercise: {} }, { status: 404 });
  }

  const savedExercise = await saveExercise(user, exercise);
  return NextResponse.json({ exercise: savedExercise });
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  console.log('>> app.api.exercise.DELETE', { params });
  const { user } = await validateUserSession(request)
  if (!user) {
    return NextResponse.json(
      { success: false, message: 'authentication failed' },
      { status: 401 }
    );
  }

  if (!params.id) {
    throw `Cannot delete exercise with null id`;
  }

  const game = await deleteExercise(user, params.id);
  return NextResponse.json({ game });
}
