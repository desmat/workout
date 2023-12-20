// 'use server'

import { kv } from "@vercel/kv";
import { Exercise } from '@/types/Exercise';
import { Workout, WorkoutSession, WorkoutSet } from '@/types/Workout';

const exercisesKey = "exercises";
const workoutsKey = "workouts";
const workoutSessionKey = "workout-sessions";
const jsonGetNotDeleted = "$[?((@.deletedAt > 0) == false)]";
const jsonGetById = (id: string) => `$[?(@.id == '${id}')]`;
const jsonGetByIds = (ids: string[]) => {
  const regex = ids.map((id: string) => `(${id})`).join("|")
  return `$[?(@.id ~= "${regex}")]`;
}

/*
    Some useful commands

    keys *
    json.get things $
    json.get things '$[?((@.deletedAt > 0) == false)]'
    json.get things '$[?((@.deletedAt > 0) == true)]'
    json.get things '$[?(@.postedBy=="Mathieu Desjarlais")]'
    json.get things '$[?(@.content ~= "(?i)lorem")]'
    json.get things '$[?(@.id ~= "(ID1)|(ID2)")]
    del things
*/


//
// Exercises 
//

export async function getExercises(query?: any): Promise<Exercise[]> {
  console.log('>> services.stores.redis.getExercises()', { query });

  let response;
  if (query) {
    if (query.ids) {
      response = await kv.json.get(exercisesKey, jsonGetByIds(query.ids));
    } else {
      throw `Unknown query type: ${JSON.stringify(query)}`;
    }
  } else {
    response = await kv.json.get(exercisesKey, jsonGetNotDeleted);
  }

  // console.log(">> services.stores.redis.getExercises", { response });

  if (!query && (!response || !response.length)) {
    console.log('>> services.stores.redis.getExercises(): empty redis key, creating empty list');
    await kv.json.set(exercisesKey, "$", "[]");
    response = await kv.json.get(exercisesKey, jsonGetNotDeleted);
  }

  return response as Exercise[];
}

export async function getExercise(id: string): Promise<Exercise | null> {
  console.log(`>> services.stores.redis.getExercise(${id})`, { id });

  const response = await kv.json.get(exercisesKey, jsonGetById(id));

  let exercise: Exercise | null = null;
  if (response) {
    exercise = response[0] as Exercise;
  }

  return exercise;
}

export async function addExercise(exercise: Exercise): Promise<Exercise> {
  console.log(">> services.stores.redis.addExercise", { exercise });

  const response = await kv.json.arrappend(exercisesKey, "$", exercise);
  // console.log("REDIS response", response);

  return new Promise((resolve) => resolve(exercise));
}

export async function saveExercise(exercise: Exercise): Promise<Exercise> {
  console.log(">> services.stores.redis.saveExercise", { exercise });

  if (!exercise.id) {
    throw `Cannot save exercise with null id`;
  }

  const response = await kv.json.set(exercisesKey, jsonGetById(exercise.id), exercise);
  // console.log("REDIS response", response);

  return new Promise((resolve) => resolve(exercise));
}

export async function deleteExercise(id: string): Promise<void> {
  console.log(">> services.stores.redis.deleteExercise", { id });

  if (!id) {
    throw `Cannot delete trivia exercise with null id`;
  }

  // const response = await kv.json.set(exercisesKey, `${jsonGetById(id)}.deletedAt`, moment().valueOf());
  const response = await kv.json.del(exercisesKey, `${jsonGetById(id)}`);
  // console.log("REDIS response", response);
}


//
// Workouts
//

export async function getWorkouts(): Promise<Workout[]> {
  console.log('>> services.stores.redis.getWorkouts()');

  let response = await kv.json.get(workoutsKey, jsonGetNotDeleted);
  // console.log("REDIS response", JSON.stringify(response));

  if (!response || !response.length) {
    console.log('>> services.stores.redis.getWorkouts(): empty redis key, creating empty list');
    await kv.json.set(workoutsKey, "$", "[]");
    response = await kv.json.get(workoutsKey, jsonGetNotDeleted);
  }

  return response as Workout[];
}

export async function getWorkout(id: string): Promise<Workout | null> {
  console.log(`>> services.stores.redis.getWorkout(${id})`, { id });

  const response = await kv.json.get(workoutsKey, jsonGetById(id));

  let workout: Workout | null = null;
  if (response) {
    workout = response[0] as Workout;
  }

  return workout;
}

export async function addWorkout(workout: Workout): Promise<Workout> {
  console.log(">> services.stores.redis.addWorkout", { workout });

  const response = await kv.json.arrappend(workoutsKey, "$", workout);
  // console.log("REDIS response", response);

  return new Promise((resolve) => resolve(workout));
}

export async function deleteWorkout(id: string): Promise<void> {
  console.log(">> services.stores.redis.deleteWorkout", { id });

  if (!id) {
    throw `Cannot delete trivia workout with null id`;
  }

  // const response = await kv.json.set(workoutsKey, `${jsonGetById(id)}.deletedAt`, moment().valueOf());
  const response = await kv.json.del(workoutsKey, `${jsonGetById(id)}`);
  // console.log("REDIS response", response);
}


//
// Workout Sessions
//

export async function getWorkoutSessions(): Promise<WorkoutSession[]> {
  console.log('>> services.stores.redis.getSessions()');

  let response = await kv.json.get(workoutSessionKey, jsonGetNotDeleted);
  // console.log("REDIS response", JSON.stringify(response));

  if (!response || !response.length) {
    console.log('>> services.stores.redis.getSessions(): empty redis key, creating empty list');
    await kv.json.set(workoutSessionKey, "$", "[]");
    response = await kv.json.get(workoutSessionKey, jsonGetNotDeleted);
  }

  return response as WorkoutSession[];
}

export async function getWorkoutSession(id: string): Promise<WorkoutSession | null> {
  console.log(`>> services.stores.redis.getSession(${id})`, { id });

  const response = await kv.json.get(workoutSessionKey, jsonGetById(id));

  let session: WorkoutSession | null = null;
  if (response) {
    session = response[0] as WorkoutSession;
  }

  return session;
}

export async function addWorkoutSession(session: WorkoutSession): Promise<WorkoutSession> {
  console.log(">> services.stores.redis.addSession", { session });

  const response = await kv.json.arrappend(workoutSessionKey, "$", session);
  // console.log("REDIS response", response);

  return new Promise((resolve) => resolve(session));
}

export async function saveWorkoutSession(session: WorkoutSession): Promise<WorkoutSession | null> {
  console.log(">> services.stores.redis.saveWorkoutSession", { session });

  if (!session.id) {
    throw `Cannot save workout session with null id`;
  }

  const response = await kv.json.set(workoutSessionKey, jsonGetById(session.id), session);
  // console.log("REDIS response", response);

  return new Promise((resolve) => resolve(session));
}

export async function deleteWorkoutSession(id: string): Promise<void> {
  console.log(">> services.stores.redis.deleteSession", { id });

  if (!id) {
    throw `Cannot delete trivia session with null id`;
  }

  // const response = await kv.json.set(workoutSessionKey, `${jsonGetById(id)}.deletedAt`, moment().valueOf());
  const response = await kv.json.del(workoutSessionKey, `${jsonGetById(id)}`);
  // console.log("REDIS response", response);
}
