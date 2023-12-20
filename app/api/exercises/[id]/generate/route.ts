import { NextResponse } from 'next/server'
import { getExercise, generateExercise } from '@/services/exercise';
import { validateUserSession } from '@/services/users';

export const maxDuration = 300;

export async function POST(
    request: Request,
    { params }: { params: { id: string } }
) {
    console.log('>> app.api.exercise.[id].generate.GET', { params });

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

    const updatedExercise = await generateExercise(user, exercise);
    
    return NextResponse.json({ exercise: updatedExercise });
}
