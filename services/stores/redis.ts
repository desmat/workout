// 'use server'

import moment from 'moment';
import { kv } from "@vercel/kv";
import { Exercise, ExerciseItem } from '@/types/Exercise';
import { Workout, WorkoutSession, WorkoutSet } from '@/types/Workout';
import { sampleExercises } from './samples';

const exercisesKey = "exercises";
const workoutsKey = "workouts";
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

  if (!response || !response.length) {
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
// Workout Types 
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

