// 'use server'

import { User } from 'firebase/auth';
import moment from 'moment';
import { Exercise } from "@/types/Exercise";
import { Workout, WorkoutSession, WorkoutSet } from '@/types/Workout';
import { createExercise, getExercises, generateExercise } from './exercise';

let store: any;
import(`@/services/stores/${process.env.STORE_TYPE}`).then((importedStore) => {
  store = importedStore;
});

function summarizeExercise(exercise: Exercise): Exercise {
  console.log(`>> services.workout.summarizeExercise`, { exercise });
  return {
    id: exercise.id,
    name: exercise.name,
    description: exercise.description,
    status: exercise.status,
  };
}

function summarizeWorkout(workout: Workout): Workout {
  console.log(`>> services.workout.summarizeWorkout`, { workout });
  return {
    ...workout,
    exercises: workout.exercises ? workout.exercises.map(summarizeExercise) : [],
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

export async function getWorkout(id: string): Promise<Workout> {
  console.log(`>> services.workout.getWorkout`, { id });

  const workout = await store.getWorkout(id);
  console.log(`>> services.workout.getWorkout`, { id, workout });

  // link up exercise details
  const exerciseIds = workout.exercises.map((exercise: Exercise) => exercise.id);
  const exercises = new Map((await getExercises({ ids: exerciseIds })).map((e: Exercise) => [e.id, e]));
  workout.exercises = workout.exercises.map((e: Exercise) => exercises.get(e.id));

  return workout;
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

  // bring in existing exercises, or create new
  const allExerciseNames = new Map((
    await getExercises()).map((exercise: Exercise) => [exercise.name.toLocaleLowerCase(), exercise]));
  // note: requested exercise names might repeat
  const exerciseNamesToCreate = Array.from(new Set(exerciseNames.filter((name: string) => !allExerciseNames.has(name))));
  console.log(`>> services.workout.createworkout`, { allExerciseNames, exerciseNamesToCreate });

  const createdExercises = new Map((
    await Promise.all(
      exerciseNamesToCreate.map(async (name: string) => { 
        const created = await createExercise(user, name);
        return generateExercise(user, created);
      })
    )).map((exercise: Exercise) => [exercise.name.toLocaleLowerCase(), exercise]))

  const exercises = exerciseNames.map((exerciseName: string) => {
    const name = exerciseName.toLowerCase();
    return allExerciseNames.get(name) || createdExercises.get(name);
  }) as Exercise[];

  return store.addWorkout(summarizeWorkout({ ...workout, exercises, status: "created" }))
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

  const createdSession = await store.addWorkoutSession(summarizeWorkoutSession(session));

  console.log(`>> services.workout.createSession`, { createdSession });

  return createdSession;
}

export async function saveSession(user: User, session: WorkoutSession): Promise<WorkoutSession> {
  console.log(`>> services.workout.saveSession`, { session });

  const existingSession = await store.getWorkoutSession(session.id);
  console.log(`>> services.workout.saveSession`, { session, existingSession });

  // TODO check something here?

  const savedSession = await store.saveWorkoutSession(summarizeWorkoutSession(session));

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
