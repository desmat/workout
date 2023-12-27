// 'use server'

import { User } from 'firebase/auth';
import moment from 'moment';
import { Exercise } from "@/types/Exercise";
import { Workout, WorkoutSession, WorkoutSet } from '@/types/Workout';
import { Store } from '@/types/Store';
import { uuid } from '@/utils/misc';
import { createExercise, getExercises, generateExercise, summarizeExercise } from './exercise';

let store: Store;
import(`@/services/stores/${process.env.STORE_TYPE}`)
  .then((s: any) => {
    console.log(">> services.exercise.parseGeneratedExercise", { s })
    store = new s.create();
  });

function summarizeWorkout(workout: Workout, include?: any): Workout {
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

export async function getWorkouts(query?: any): Promise<Workout[]> {
  console.log(`>> services.workout.getWorkouts`, { query });
  const workouts = await store.workouts.find(query);

  // const exerciseIds = Array.from(
  //   new Set(
  //     workouts
  //       .map((workout: Workout) => workout.exercises && workout.exercises.map((exercise: Exercise) => exercise.id))
  //       .flat()))
  // const allExercises = new Map((await getExercises({ ids: exerciseIds })).map((exercise: Exercise) => [exercise.id, exercise]));

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

  const workout = await store.workouts.get(id);
  console.log(`>> services.workout.getWorkout`, { id, workout });

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

  // bring in existing exercises, or create new
  const allExerciseNames = new Map((
    await getExercises()).map((exercise: Exercise) => [exercise.name.toLowerCase(), exercise]));
  // note: requested exercise names might repeat
  const exerciseNamesToCreate = Array.from(
    new Set(
      exerciseNames
        .map((name: string) => name.toLowerCase())
        .filter((name: string) => !allExerciseNames.has(name))));
  // console.log(`>> services.workout.createWorkout`, { allExerciseNames, exerciseNamesToCreate });

  const createdExercises = new Map((
    await Promise.all(
      exerciseNamesToCreate
        .filter(Boolean)
        .map(async (name: string) => {
          return createExercise(user, name).then((created: Exercise) => {
            return generateExercise(user, created);
          });
        })
    )).map((exercise: Exercise) => [exercise.name.toLocaleLowerCase(), exercise]));

  const pickFromRange = (range: any, level?: "beginner" | "intermediate" | "advanced") => {
    return Array.isArray(range) && range.length > 1
      ? level == "beginner"
        ? range[0]
        : level == "advanced"
          ? range[1]
          : Math.floor((Number(range[0]) + Number(range[1])) / 2)
      : range;
  }

  const exercises = exerciseNames
    .map((exerciseName: string) => {
      const name = exerciseName.toLowerCase();
      const exercise = allExerciseNames.get(name) || createdExercises.get(name)

      if (exercise?.directions) {
        exercise.directions = {
          duration: pickFromRange(exercise.directions.duration),
          sets: pickFromRange(exercise.directions.sets),
          reps: pickFromRange(exercise.directions.reps),
        }
      }

      return exercise;
    })
    .filter(Boolean) as Exercise[];

  // console.log(`>> services.workout.createWorkout`, { createdExercises, exercises });

  return store.workouts.create(user.uid, summarizeWorkout(
    { ...workout, exercises, status: "created" },
    {
      exercises: {
        status: true,
        description: true,
        directions: true,
      }
    }))
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

  store.workouts.delete(user.uid, id);
  return new Promise((resolve, reject) => resolve());
}

export async function getSessions(query?: any): Promise<WorkoutSession[]> {
  console.log(`>> services.workout.getSessions`, { query });

  const sessions = await store.workoutSessions.find(query);
  // const exerciseIds = Array.from(
  //   new Set(
  //     sessions
  //       .map((session: WorkoutSession) => session.workout?.exercises && session.workout.exercises.map((exercise: Exercise) => exercise.id))
  //       .flat()))
  // const allExercises = new Map((await getExercises({ ids: exerciseIds })).map((exercise: Exercise) => [exercise.id, exercise]));

  // console.log(`>> services.workout.getSessions`, { exerciseIds, allExercises });

  return sessions;
}

export async function getSession(id: string): Promise<WorkoutSession | undefined> {
  console.log(`>> services.workout.getSession`, { id });

  const session = await store.workoutSessions.get(id);
  console.log(`>> services.workout.getSession`, { id, session });

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

  const createdSession = await store.workoutSessions.create(user.uid, summarizeWorkoutSession(session));

  console.log(`>> services.workout.createSession`, { createdSession });

  return createdSession;
}

export async function saveSession(user: User, session: WorkoutSession): Promise<WorkoutSession | undefined> {
  console.log(`>> services.workout.saveSession`, { session });

  if (!session.id) {
    throw `Error saving workout session: null id`;
  }

  const existingSession = await store.workoutSessions.get(session.id);
  console.log(`>> services.workout.saveSession`, { session, existingSession });

  // TODO check something here?

  const savedSession = await store.workoutSessions.update(user.uid, summarizeWorkoutSession(session));

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

  return store.workoutSessions.delete(user.uid, id);
}
