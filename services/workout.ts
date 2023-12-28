// 'use server'

import { User } from 'firebase/auth';
import moment from 'moment';
import * as openai from "@/services/openai";
import { Exercise } from "@/types/Exercise";
import { Workout, WorkoutSession, WorkoutSet } from '@/types/Workout';
import Store from '@/types/Store';
import { uuid } from '@/utils/misc';
import { getExercises, getOrGenerateExercises } from './exercise';

let store: Store;
import(`@/services/stores/${process.env.STORE_TYPE}`).then((importedStore) => {
  store = importedStore;
});

export function summarizeExercise(exercise: Exercise, include?: any): Exercise {
  console.log(`>> services.workout.summarizeExercise`, { exercise });
  const included: any = {};
  if (include?.description) included.description = exercise.description;
  if (include?.directions) included.directions = exercise.directions;
  if (include?.status) included.status = exercise.status;

  return {
    id: exercise.id,
    name: exercise.name,
    ...included,
  };
}

export function summarizeWorkout(workout: Workout, include?: any): Workout {
  console.log(`>> services.workout.summarizeWorkout`, { workout });

  return {
    ...workout,
    exercises: workout.exercises ?
      workout.exercises
        .map((e: Exercise) => summarizeExercise(e, include?.exercises))
      : [],
  }
}

function summarizeWorkoutSession(session: WorkoutSession): WorkoutSession {
  console.log(`>> services.workout.summarizeWorkoutSession`, { session });
  return {
    ...session,
    workout: summarizeWorkout(session.workout),
    sets: session.sets ? session.sets.map(summarizeWorkoutSet) : [],
  }
}

function summarizeWorkoutSet(set: WorkoutSet): WorkoutSet {
  console.log(`>> services.workout.summarizeWorkoutSet`, { set });
  return {
    ...set,
    exercise: summarizeExercise(set.exercise),
  }
}

function parseGeneratedWorkout(response: any): any {
  console.log(`>> services.exercise.parseGeneratedWorkout`, { response });

  let res = response.response?.workout || response.workout || response?.workout || response;
  if (!res) {
    console.error("No exercise items generated");
    throw `No exercise items generated`
  }

  console.log(">> services.exercise.parseGeneratedWorkout", { res });

  const exercises = res.response.map((r: any) => {
    return {
      name: r.exercise,
      instructions: r.description,
      directions: {
        duration: r.time,
        sets: r.sets,
        reps: r.reps,
      },
      status: "created", // TODO
    }
  })

  return { prompt: res.prompt, exercises };
}

export async function getWorkouts(): Promise<Workout[]> {
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
  // const workoutDetails = workouts.map((workout: Workout) => {
  //   let exercises = workout.exercises;
  //   if (workout.exercises) {
  //     exercises = workout.exercises.map((exercise: Exercise) => {
  //       const e = allExercises.get(exercise.id);
  //       return e || exercise;
  //     })
  //   }

  //   return { ...workout, exercises }
  // });

  // return workoutDetails;

  return workouts;

}

export async function getWorkout(id: string): Promise<Workout | undefined> {
  console.log(`>> services.workout.getWorkout`, { id });

  const workout = await store.getWorkout(id);
  console.log(`>> services.workout.getWorkout`, { id, workout });

  // link up exercise details
  // if (workout?.exercises) {
  //   const exerciseIds = workout.exercises.map((exercise: Exercise) => exercise.id);
  //   const exercises = new Map((await getExercises({ ids: exerciseIds })).map((e: Exercise) => [e.id, e]));
  //   workout.exercises = workout.exercises.map((e: Exercise) => exercises.get(e.id) || e);
  // }

  // console.log(`>> services.workout.getWorkout`, { exerciseIds, exercises, workout });

  return workout;
}

export async function createWorkout(user: User, name: string, exerciseNames: string[]): Promise<Workout> {
  console.log(`>> services.workout.createWorkout`, { user, name, exerciseNames });

  const workout = {
    id: uuid(),
    createdBy: user.uid,
    createdAt: moment().valueOf(),
    status: "creating",
    name,
  } as Workout;

  const exercises = await getOrGenerateExercises(user, exerciseNames);

  console.log(`>> services.workout.createWorkout`, { exercises });

  return store.addWorkout(user.uid, summarizeWorkout(
    { ...workout, exercises, status: "created" },
    {
      exercises: {
        status: true,
        description: true,
        directions: true,
      }
    }))
}

export async function generateWorkout(user: User, name: string, parameters: any[]): Promise<Workout> {
  console.log(`>> services.workout.generateWorkout`, { user, name, parameters });

  let workout = {
    id: uuid(),
    createdBy: user.uid,
    createdAt: moment().valueOf(),
    status: "generating",
    name,
  } as Workout;

  const res = await openai.generateWorkout(parameters);
  const parsedWorkout = parseGeneratedWorkout(res);
  console.log(">> services.workout.generateWorkout", { parsedWorkout });

  const generatedExercises = await getOrGenerateExercises(user, parsedWorkout.exercises.map((exercise: Exercise) => exercise.name));
  console.log(">> services.workout.generateWorkout", { generatedExercises });

  const exercises = parsedWorkout.exercises.map((e1: Exercise) => {
    const generatedExercise = generatedExercises.filter((e2: Exercise) => e1.name.toLowerCase() == e2.name.toLowerCase())[0];
    return  {
      ...generatedExercise,
      ...e1,
    }
  });

  console.log(">> services.workout.generateWorkout", { exercises });

  workout = {
    ...workout,
    prompt: res.prompt,
    exercises,
    status: "created",
    updatedAt: moment().valueOf(),
  };

  return store.addWorkout(user.uid, workout);
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

  store.deleteWorkout(user.uid, id);
  return new Promise((resolve, reject) => resolve());
}


















export async function getSessions(): Promise<WorkoutSession[]> {
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
  // const sessionDetails = sessions.map((session: WorkoutSession) => {
  //   let exercises = session.workout?.exercises;
  //   if (session.workout?.exercises) {
  //     exercises = session.workout?.exercises.map((exercise: Exercise) => {
  //       const e = allExercises.get(exercise.id)
  //       return e || exercise;
  //     })
  //   }

  //   return { ...session, exercises }
  // });

  // return sessionDetails;
  return sessions;
}

export async function getSession(id: string): Promise<WorkoutSession | undefined> {
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

  // only store summaries
  const session = {
    id: data?.id,
    createdBy: user.uid,
    createdAt: moment().valueOf(),
    status: "created",
    workout: data.workout,
    sets: [] as WorkoutSet[],
  } as WorkoutSession;

  console.log(`>> services.workout.createSession`, { session });

  const createdSession = await store.addWorkoutSession(user.uid, summarizeWorkoutSession(session));

  console.log(`>> services.workout.createSession`, { createdSession });

  return createdSession;
}

export async function saveSession(user: User, session: WorkoutSession): Promise<WorkoutSession | undefined> {
  console.log(`>> services.workout.saveSession`, { session });

  if (!session.id) {
    throw `Error saving workout session: null id`;
  }

  const existingSession = await store.getWorkoutSession(session.id);
  console.log(`>> services.workout.saveSession`, { session, existingSession });

  // TODO check something here?

  const savedSession = await store.saveWorkoutSession(user.uid, summarizeWorkoutSession(session));

  return savedSession;
}

export async function deleteSession(user: any, id: string): Promise<WorkoutSession> {
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

  return store.deleteWorkoutSession(user.uid, id);
}
