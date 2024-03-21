import { User } from 'firebase/auth';
import moment from 'moment';
import * as openai from "@/services/openai";
import { Exercise } from "@/types/Exercise";
import { Workout, WorkoutSession, WorkoutSet } from '@/types/Workout';
import { Store } from '@/types/Store';
import { uuid } from '@/utils/misc';
import { createExercise, getExercises, generateExercise, getOrGenerateExercises, summarizeExercise } from './exercise';

let store: Store;
import(`@/services/stores/${process.env.STORE_TYPE}`)
  .then((s: any) => {
    console.log(">> services.exercise.parseGeneratedExercise", { s })
    store = new s.create();
  });

export function summarizeWorkout(workout: Workout, include?: any): Workout {
  console.log(`>> services.workout.summarizeWorkout`, { workout, include });

  return {
    ...workout,
    exercises: workout.exercises ?
      workout.exercises
        .map((e: Exercise) => summarizeExercise(e, include?.exercises))
      : [],
  }
}

export function summarizeWorkoutSession(session: WorkoutSession): WorkoutSession {
  console.log(`>> services.workout.summarizeWorkoutSession`, { session });
  return {
    ...session,
    workout: summarizeWorkout(session.workout, {
      exercises: {
        directions: true,
      }
    }),
    sets: session.sets ? session.sets.map(summarizeWorkoutSet) : [],
  }
}

function summarizeWorkoutSet(set: WorkoutSet): WorkoutSet {
  console.log(`>> services.workout.summarizeWorkoutSet`, { set });
  return {
    ...set,
    exercise: summarizeExercise(set.exercise, { directions: true }),
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

  const exercises = await getOrGenerateExercises(user, exerciseNames);

  console.log(`>> services.workout.createWorkout`, { exercises });

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
    return {
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

  return store.workouts.create(user.uid, summarizeWorkout(
    { ...workout, exercises, status: "created" },
    {
      exercises: {
        status: true,
        description: true,
        directions: true,
      }
    }));
}

export async function saveWorkout(user: User, workout: Workout): Promise<Workout | undefined> {
  console.log(`>> services.workout.saveWorkout`, { workout });

  if (!workout.id) {
    throw `Error saving workout: null id`;
  }

  const existingWorkout = await store.workouts.get(workout.id);
  console.log(`>> services.workout.saveWorkout`, { workout, existingWorkout });

  // TODO check something here?

  return store.workouts.update(user.uid, summarizeWorkout(
    { ...workout, status: "saved" },
    {
      exercises: {
        status: true,
        description: true,
        directions: true,
      }
    })
  );
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
    mode: data.mode,
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
