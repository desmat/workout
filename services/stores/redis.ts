// 'use server'

import { kv } from "@vercel/kv";
import { Exercise } from '@/types/Exercise';
import { Workout, WorkoutSession, WorkoutSet } from '@/types/Workout';
import moment from "moment";

const exercisesKey = (userId: string) => `exercises`; // a bit verbose, let's KISS while in dev // `exercises:${userId}`;
const exerciseKey = (userId: string, id: string) => `exercise:${id}`; // a bit verbose, let's KISS while in dev // `exercise:${userId}:${id}`;
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
    scan 0 match thing:*
    del thing1 thing2 etc
*/


async function checkKey(key: string) {
  const response = await kv.json.get(key, "$");

  if (!response || !response.length) {
    console.log('>> services.stores.redis.checkKey(): empty redis key, creating empty list', { key });
    return kv.json.set(key, "$", "[]");    
  }  
}

//
// Exercises 
//

export async function getExercises(userId: string, query?: any): Promise<Exercise[]> {
  console.log('>> services.stores.redis.getExercises()', { query });

  let keys;
  if (query && query.ids && query.ids.length > 0) {
    keys = query.ids.map((id: string) => exerciseKey(userId, id));
  } else {
    const exerciseList = await kv.json.get(exercisesKey(userId), jsonGetNotDeleted);
    keys = exerciseList && exerciseList.map((exercise: Exercise) => exercise.id && exerciseKey(userId, exercise.id)).filter(Boolean);
  }

  // console.log(">> services.stores.redis.getExercises", { keys });

  const response = keys && keys.length > 0 && (await kv.json.mget(keys, "$")).flat() || [];

  return response as Exercise[];
}

export async function getExercise(userId: string, id: string): Promise<Exercise | null> {
  console.log(`>> services.stores.redis.getExercise(${id})`, { id });

  const response = await kv.json.get(exerciseKey(userId, id), "$");

  let exercise: Exercise | null = null;
  if (response) {
    exercise = response[0] as Exercise;
  }

  return exercise;
}

export async function addExercise(userId: string, exercise: Exercise): Promise<Exercise> {
  console.log(">> services.stores.redis.addExercise", { exercise });

  if (!exercise.id) {
    throw `Cannot save add with null id`;
  }

  await checkKey(exercisesKey(userId));
  const responses = await Promise.all([
    kv.json.arrappend(exercisesKey(userId), "$", exercise),
    kv.json.set(exerciseKey(userId, exercise.id), "$", exercise),
  ]);

  console.log(">> services.stores.redis.addExercise", { responses });

  return new Promise((resolve) => resolve(exercise));
}

export async function saveExercise(userId: string, exercise: Exercise): Promise<Exercise> {
  console.log(">> services.stores.redis.saveExercise", { exercise });

  if (!exercise.id) {
    throw `Cannot save exercise with null id`;
  }

  const response = await kv.json.set(exerciseKey(userId, exercise.id), "$", exercise);

  console.log(">> services.stores.redis.saveExercise", { response });

  return new Promise((resolve) => resolve(exercise));
}

export async function deleteExercise(userId: string, id: string): Promise<void> {
  console.log(">> services.stores.redis.deleteExercise", { id });

  if (!id) {
    throw `Cannot delete trivia exercise with null id`;
  }

  const responsea = await Promise.all([
    kv.json.set(exercisesKey(userId), `${jsonGetById(id)}.deletedAt`, moment().valueOf()),
    kv.json.del(exerciseKey(userId, id), "$")
  ]);

  // console.log(">> services.stores.redis.deleteExercise", { responsea });
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

  await checkKey(exercisesKey(workoutsKey));
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

  await checkKey(exercisesKey(workoutSessionKey));
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
