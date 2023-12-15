// 'use server'

import { User } from 'firebase/auth';
import moment from 'moment';
import OpenAI from 'openai';
import { Exercise, ExerciseItem } from "@/types/Exercise";
import { Workout, WorkoutSession, WorkoutSet } from '@/types/Workout';
import { createExercise, getExercises } from './exercise';

let store: any;
import(`@/services/stores/${process.env.STORE_TYPE}`).then((importedStore) => {
  store = importedStore;
});

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

async function generateWorkout(type: string, numItems: number): Promise<any> {
  console.log(`>> services.workout.generateWorkout`, { type, numItems });

  // // for testing
  // return new Promise((resolve, reject) => resolve({ prompt: "THE PROMPT", items: SAMPLE_WORKOUT.items as WorkoutSet[] }));

  //   const prompt = `Generate a menu with ${numItems} ${type} items.`;
  //   const completion = await openai.chat.completions.create({
  //     // model: 'gpt-3.5-turbo',
  //     model: 'gpt-4',
  //     // model: "gpt-3.5-turbo-1106",
  //     // response_format: { type: "json_object" },    
  //     messages: [
  //       {
  //         role: 'system',
  //         content: `You are an assistant that receives a request to create a menu with a given style. 
  // Please respond ONLY with JSON data containing name, a short description, ingredients and preparation instructions with only the following keys: "name", "description", "ingredients", "preparation" with root key "menu"`
  //       },
  //       {
  //         role: 'user',
  //         content: prompt,
  //       }
  //     ],
  //   });

  //   try {
  //     console.log("*** RESULTS FROM API", completion);
  //     console.log("*** RESULTS FROM API (as json)", JSON.stringify(JSON.parse(completion.choices[0].message.content || "{}")));
  //     return { type, prompt, response: JSON.parse(completion.choices[0]?.message?.content || "{}")};
  //   } catch (error) {
  //     console.error("Error reading results", { completion, error });
  //   }  
}

export async function getWorkouts(user?: User): Promise<Workout[]> {
  const workouts = await store.getWorkouts();
  const exerciseIds = Array.from(
    new Set(
      workouts
        .map((workout: Workout) => workout.exercises && workout.exercises.map((exercise: Exercise) => exercise.id))
        .flat()))
  const allExercises = new Map((await getExercises({ ids: exerciseIds })).map((exercise: Exercise) => [exercise.id, exercise]));

  // console.log(`>> services.workout.getWorkouts`, { exerciseIds, allExercises });

  // const workoutDetails = Promise.all(
  //   workouts.map(async (workout: Workout) => {
  //     if (workout.id) return await getWorkout(workout.id);
  //   })
  // );

  // link up exercises
  const workoutDetails = workouts.map((workout: Workout) => {
    let exercises = workout.exercises;
    if (workout.exercises) {
      exercises = workout.exercises.map((exercise: Exercise) => {
        const e = allExercises.get(exercise.id)
        return e || exercise;
      })
    }

    return { ...workout, exercises }
  });

  return workoutDetails;
}

export async function getWorkout(id: string): Promise<Workout> {
  console.log(`>> services.workout.getWorkout`, { id });

  const workout = await store.getWorkout(id);
  console.log(`>> services.workout.getWorkout`, { id, workout });

  // const exercises = workout.exercises && workout.exercises.length > 0
  //   ? await Promise.all(workout.exercises.map((exercise: Exercise) => getExercise(exercise.id as string)))
  //   : [];
  const exerciseIds = workout.exercises.map((exercise: Exercise) => exercise.id);
  const exercises = await getExercises({ ids: exerciseIds });

  return { ...workout, exercises };
}

export async function createWorkout(user: User, name: string, exerciseNames: string[]): Promise<Workout> {
  console.log(`>> services.workout.createworkout`, { user, name, exerciseNames });

  const workout = {
    id: crypto.randomUUID(),
    createdBy: user.uid,
    createdAt: moment().valueOf(),
    status: "creating",
    name,
  } as Workout;

  const allExercises = new Map((await getExercises()).map((exercise: Exercise) => [exercise.name.toLocaleLowerCase(), exercise]));
  const exerciseDetails = await Promise.all(
    exerciseNames.map((exerciseName: string) => {
      const exercise = allExercises.get(exerciseName.toLowerCase());
      if (exercise) return exercise;

      return createExercise(user, exerciseName)
    })
  );

  const exercises = exerciseDetails.map((exercise: Exercise) => {
    return { id: exercise.id, name: exercise.name }
  });
  const createdWorkout = await store.addWorkout({ ...workout, status: "created", exercises })

  return getWorkout(createdWorkout.id);
}

export async function deleteWorkout(user: any, id: string): Promise<void> {
  console.log(">> services.workout.deleteWorkout", { id, user });

  if (!id) {
    throw `Cannot delete workout with null id`;
  }

  const workout = await getWorkout(id);
  if (!workout) {
    throw `Workout not found: ${id}`;
  }

  if (!(workout.createdBy == user.uid || user.customClaims?.admin)) {
    throw `Unauthorized`;
  }

  store.deleteWorkout(id);
  return new Promise((resolve, reject) => resolve());
}


















export async function getSessions(user?: User): Promise<WorkoutSession[]> {
  const sessions = await store.getWorkoutSessions();
  const exerciseIds = Array.from(
    new Set(
      sessions
        .map((session: WorkoutSession) => session.workout?.exercises && session.workout.exercises.map((exercise: Exercise) => exercise.id))
        .flat()))
  const allExercises = new Map((await getExercises({ ids: exerciseIds })).map((exercise: Exercise) => [exercise.id, exercise]));

  console.log(`>> services.workout.getSessions`, { exerciseIds, allExercises });

  // const sessionDetails = Promise.all(
  //   sessions.map(async (session: WorkoutSession) => {
  //     if (session.id) return await getSession(session.id);
  //   })
  // );

  // link up exercises
  const sessionDetails = sessions.map((session: WorkoutSession) => {
    let exercises = session.workout?.exercises;
    if (session.workout?.exercises) {
      exercises = session.workout?.exercises.map((exercise: Exercise) => {
        const e = allExercises.get(exercise.id)
        return e || exercise;
      })
    }

    return { ...session, exercises }
  });

  return sessionDetails;
}

export async function getSession(id: string): Promise<WorkoutSession> {
  console.log(`>> services.workout.getSession`, { id });

  const session = await store.getWorkoutSession(id);
  console.log(`>> services.workout.getSession`, { id, session });

  // const exercises = session.exercises && session.exercises.length > 0
  //   ? await Promise.all(session.exercises.map((exercise: Exercise) => getExercise(exercise.id as string)))
  //   : [];
  // const exerciseIds = session.exercises.map((exercise: Exercise) => exercise.id);
  // const exercises = await getExercises({ ids: exerciseIds });

  // TODO load up workout and exercise if we stored just ids

  return session;
}

export async function createSession(user: User, data: any): Promise<WorkoutSession> {
  console.log(`>> services.workout.createSession`, { user, data });

  const session = {
    id: data?.id,
    createdBy: user.uid,
    createdAt: moment().valueOf(),
    status: "created",
    workout: data?.workout as Workout,
    sets: [] as WorkoutSet[],
  } as WorkoutSession;

  console.log(`>> services.workout.createSession`, { session });

  const createdSession = await store.addWorkoutSession(session);

  console.log(`>> services.workout.createSession`, { createdSession });

  return createdSession;
}

export async function saveSession(user: User, session: WorkoutSession): Promise<WorkoutSession> {
  console.log(`>> services.workout.saveSession`, { session });

  const existingSession = await store.getWorkoutSession(session.id);
  console.log(`>> services.workout.saveSession`, { session, existingSession });

  // TODO check something here?

  const savedSession = await store.saveWorkoutSession(session)

  return savedSession;
}

export async function deleteSession(user: any, id: string): Promise<void> {
  console.log(">> services.workout.deleteSession", { id, user });

  if (!id) {
    throw `Cannot delete session with null id`;
  }

  const session = await getSession(id);
  if (!session) {
    throw `WorkoutSession not found: ${id}`;
  }

  if (!(session.createdBy == user.uid || user.customClaims?.admin)) {
    throw `Unauthorized`;
  }

  store.deleteSession(id);
  return new Promise((resolve, reject) => resolve());
}
