// 'use server'

import moment from "moment";
import { kv } from "@vercel/kv";
import { Exercise } from '@/types/Exercise';
import { Workout, WorkoutSession, WorkoutSet } from '@/types/Workout';
import { uuid } from "@/utils/misc";

const jsonGetNotDeleted = "$[?((@.deletedAt > 0) == false)]";
const jsonGetById = (id: string) => `$[?(@.id == '${id}')]`;
const jsonGetByIds = (ids: string[]) => {
  const regex = ids.map((id: string) => `(${id})`).join("|")
  return `$[?(@.id ~= "${regex}")]`;
}


/*
    Some useful commands

    keys *
    scan 0 match thing:*
    del thing1 thing2 etc
    json.get things $
    json.get things '$[?((@.deletedAt > 0) == false)]'
    json.get things '$[?((@.deletedAt > 0) == true)]'
    json.get things '$[?(@.postedBy=="Mathieu Desjarlais")]'
    json.get things '$[?(@.content ~= "(?i)lorem")]'
    json.get things '$[?(@.id ~= "(ID1)|(ID2)")]
    json.set thing:UUID '$.foos[5].bar' '{"car": 42}'
    json.set thing:UUID '$.foos[1].bar.car' '42'
*/


async function checkKey(key: string) {
  const response = await kv.json.get(key, "$");

  if (!response || !response.length) {
    console.log('>> services.stores.redis.checkKey(): empty redis key, creating empty list', { key });
    return kv.json.set(key, "$", "[]");
  }
}

type RedisStoreEntry = {
  id?: string,
  name?: string,
  createdBy?: string,
  createdAt?: number,
  updatedAt?: number,
  updatedBy?: string,
  deletedAt?: number,
}

class RedisStore<T extends RedisStoreEntry> {
  key: string;
  valueKey: (id: string) => string;
  listKey: () => string;

  constructor(key: string, listKey?: string) {
    this.key = key;
    this.valueKey = (id: string) => `${key}:${id}`;
    this.listKey = () => `${listKey || key + "s"}`;
  }

  async get(id: string): Promise<T | undefined> {
    console.log(`>> services.stores.redis.RedisStore<${this.key}>.get`, { id });

    const response = await kv.json.get(this.valueKey(id), "$");

    // console.log(`>> services.stores.redis.RedisStore<${this.key}>.get`, { response });

    let value: T | undefined;
    if (response) {
      value = response[0] as T;
    }

    return value;
  }

  async find(query?: any): Promise<T[]> {
    console.log(`>> services.stores.redis.RedisStore<${this.key}>.find`, { query });

    let keys;
    if (query && query.ids && query.ids.length > 0) {
      keys = query.ids.map((id: string) => this.valueKey(id));
    } else {
      const list = await kv.json.get(this.listKey(), jsonGetNotDeleted);
      keys = list && list
        .map((value: T) => value.id && this.valueKey(value.id))
        .filter(Boolean);
    }

    // console.log(`>> services.stores.redis.RedisStore<${this.key}>.find`, { keys });

    const values = keys && keys.length > 0 && (await kv.json.mget(keys, "$")).flat() || [];

    return values as T[];
  }

  async create(userId: string, value: T): Promise<T> {
    console.log(`>> services.stores.redis.RedisStore<${this.key}>.create`, { value });

    if (!value.id) {
      throw `Cannot save add with null id`;
    }

    const createdListValue = {
      id: value.id || uuid(),
      createdAt: moment().valueOf(),
      createdBy: userId
    };

    const createdValue = {
      ...value,
      ...createdListValue,
    };

    await checkKey(this.listKey());
    const responses = await Promise.all([
      kv.json.arrappend(this.listKey(), "$", createdListValue),
      kv.json.set(this.valueKey(value.id), "$", createdValue),
    ]);

    // console.log(`>> services.stores.redis.RedisStore<${this.key}>.create`, { responses });

    return new Promise((resolve) => resolve(value));
  }

  async update(userId: string, value: T): Promise<T> {
    console.log(`>> services.stores.redis.RedisStore<${this.key}>.update`, { value });

    if (!value.id) {
      throw `Cannot update ${this.key}: null id`;
    }

    if (!this.get(value.id)) {
      throw `Cannot update ${this.key}: does not exist: ${value.id}`;
    }

    const updatedValue = { ...value, updatedAt: moment().valueOf(), updatedBy: userId }
    const response = await Promise.all([
      kv.json.set(this.listKey(), `${jsonGetById(value.id)}.updatedAt`, updatedValue.updatedAt),
      kv.json.set(this.listKey(), `${jsonGetById(value.id)}.updatedBy`, `"${updatedValue.updatedBy}"`),
      kv.json.set(this.valueKey(value.id), "$", updatedValue),
    ]);

    // console.log(`>> services.stores.redis.RedisStore<${this.key}>.update`, { response });

    return new Promise((resolve) => resolve(updatedValue));
  }

  async delete(userId: string, id: string): Promise<T> {
    console.log(`>> services.stores.redis.RedisStore<${this.key}>.delete`, { id });

    if (!id) {
      throw `Cannot delete ${this.key}: null id`;
    }

    const value = await this.get(id)
    if (!value) {
      throw `Cannot update ${this.key}: does not exist: ${id}`;
    }

    value.deletedAt = moment().valueOf();
    const response = await Promise.all([
      kv.json.set(this.listKey(), `${jsonGetById(id)}.deletedAt`, value.deletedAt),
      kv.json.del(this.valueKey(id), "$")
    ]);

    // console.log(`>> services.stores.redis.RedisStore<${this.key}>.delete`, { response });

    return new Promise((resolve) => resolve(value));
  }
}


const exercises = new RedisStore<Exercise>("exercise");
const workouts = new RedisStore<Workout>("workout");
const workoutSessions = new RedisStore<WorkoutSession>("workout-session");


//
// Exercises 
//

export async function getExercises(query?: any): Promise<Exercise[]> {
  console.log('>> services.stores.redis.getExercises()', { query });
  return exercises.find(query);
}

export async function getExercise(id: string): Promise<Exercise | undefined> {
  console.log(`>> services.stores.redis.getExercise(${id})`, { id });
  return exercises.get(id);
}

export async function addExercise(userId: string, exercise: Exercise): Promise<Exercise> {
  console.log(">> services.stores.redis.addExercise", { exercise });
  return exercises.create(userId, exercise);
}

export async function saveExercise(userId: string, exercise: Exercise): Promise<Exercise> {
  console.log(">> services.stores.redis.saveExercise", { exercise });
  return exercises.update(userId, exercise);
}

export async function deleteExercise(userId: string, id: string): Promise<Exercise> {
  console.log(">> services.stores.redis.deleteExercise", { id });
  return exercises.delete(userId, id);
}


//
// Workouts
//

export async function getWorkouts(): Promise<Workout[]> {
  console.log('>> services.stores.redis.getWorkouts()');
  return workouts.find();
}

export async function getWorkout(id: string): Promise<Workout | undefined> {
  console.log(`>> services.stores.redis.getWorkout(${id})`, { id });
  return workouts.get(id);
}

export async function addWorkout(userId: string, workout: Workout): Promise<Workout> {
  console.log(">> services.stores.redis.addWorkout", { workout });
  return workouts.create(userId, workout);
}

export async function saveWorkout(userId: string, workout: Workout): Promise<Workout | undefined> {
  console.log(">> services.stores.redis.saveWorkout", { workout });
  return workouts.update(userId, workout);
}

export async function deleteWorkout(userId: string, id: string): Promise<Workout> {
  console.log(">> services.stores.redis.deleteWorkout", { id });
  return workouts.delete(userId, id);
}


//
// Workout Sessions
//

export async function getWorkoutSessions(): Promise<WorkoutSession[]> {
  console.log('>> services.stores.redis.getSessions()');
  return workoutSessions.find();
}

export async function getWorkoutSession(id: string): Promise<WorkoutSession | undefined> {
  console.log(`>> services.stores.redis.getSession(${id})`, { id });
  return workoutSessions.get(id);
}

export async function addWorkoutSession(userId: string, session: WorkoutSession): Promise<WorkoutSession> {
  console.log(">> services.stores.redis.addSession", { session });
  return workoutSessions.create(userId, session);
}

export async function saveWorkoutSession(userId: string, session: WorkoutSession): Promise<WorkoutSession | undefined> {
  console.log(">> services.stores.redis.saveWorkoutSession", { session });
  return workoutSessions.update(userId, session);
}

export async function deleteWorkoutSession(userId: string, id: string): Promise<WorkoutSession> {
  console.log(">> services.stores.redis.deleteSession", { id });
  return workoutSessions.delete(userId, id);
}
