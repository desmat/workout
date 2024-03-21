import { NextResponse } from 'next/server'
import { getExercise, deleteExercise } from '@/services/exercise';
import { validateUserSession } from '@/services/users';
import { deleteSession, getSession, saveSession } from '@/services/workout';
import { WorkoutSession } from '@/types/Workout';

export async function GET(
  request: Request,
  { params }: { params: { sessionId: string } }
) {
  console.log('>> app.api.workout.[0].session.[id].GET', { params });

  const session = await getSession(params.sessionId);
  if (!session) {
      return NextResponse.json({ session: {} }, { status: 404 });
  }

  return NextResponse.json({ session });
}

export async function PUT(
  request: Request,
  { params }: { params: { sessionId: string } }
) {
  console.log('>> app.api.workout.[0].session.[id].PUT', { params });

  if (!params.sessionId) {
    return NextResponse.json(
      { success: false, message: 'session id missing' },
      { status: 400 }
    );
  }

  const { user } = await validateUserSession(request)
  // console.log('>> app.api.posts.PUT', { user });
  if (!user) {
    return NextResponse.json(
      { success: false, message: 'authentication failed' },
      { status: 401 }
    );
  }

  const session = await getSession(params.sessionId);
  if (!session) {
    return NextResponse.json(
      { success: false, message: 'not found' },
      { status: 404 }
    );
  }

  // TODO more validation here? createdBy and such?

  const data: any = await request.json();
  // console.log('>> app.api.workout.[0].session.[id].PUT', { data });

  const updatedSession = await saveSession(user, data.session as WorkoutSession);

  return NextResponse.json({ session: updatedSession });
}

export async function DELETE(
  request: Request,
  { params }: { params: { sessionId: string } }
) {
  console.log('>> app.api.workout.[0].session.DELETE', { params });
  const { user } = await validateUserSession(request)
  if (!user) {
    return NextResponse.json(
      { success: false, message: 'authentication failed' },
      { status: 401 }
    );
  }

  if (!params.sessionId) {
    throw `Cannot delete workout session with null id`;
  }

  const session = await deleteSession(user, params.sessionId);
  return NextResponse.json({ session });
}
