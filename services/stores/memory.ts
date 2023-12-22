// 'use server'

import moment from 'moment';
import { Exercise } from "@/types/Exercise";
import { sampleExercises, sampleWorkouts } from './samples';
import { Workout, WorkoutSession } from '@/types/Workout';


const memoryStore = {
  exercises: sampleExercises as Exercise[],
  workouts: sampleWorkouts as Workout[],
  sessions: [{ "id": "603ae73a-c6ee-4162-9523-f47b1ee8b37e", "createdBy": "eDcD0gwTvFeJJQNlqHQv9vFV45i1", "createdAt": 1702592281111, "status": "started", "workout": { "id": "0adba0e4-d5cd-4f29-bb62-1cceb10929bd", "createdBy": "eDcD0gwTvFeJJQNlqHQv9vFV45i1", "createdAt": 1702585437125, "status": "created", "name": "Test 1", "exercises": [{ "id": "0eea0e09-de1c-41db-b8e1-863be341658e", "createdBy": "eDcD0gwTvFeJJQNlqHQv9vFV45i1", "createdAt": 1702585437126, "status": "created", "name": "Pull ups" }, { "id": "c1977455-36e8-4dc8-86c1-76f65e730fc2", "createdBy": "eDcD0gwTvFeJJQNlqHQv9vFV45i1", "createdAt": 1702585437126, "status": "created", "name": "Push ups" }, { "id": "ba3883f5-e7fd-4b47-ac64-c3cd18f89420", "createdBy": "eDcD0gwTvFeJJQNlqHQv9vFV45i1", "createdAt": 1702585437126, "status": "created", "name": "sit ups" }] }, "sets": [{ "id": "73cc6639-74d4-4b3c-8bf1-1d68c47c5c4b", "createdBy": "eDcD0gwTvFeJJQNlqHQv9vFV45i1", "createdAt": 1702592283278, "startedAt": 1702592283278, "status": "started", "exercise": { "id": "0eea0e09-de1c-41db-b8e1-863be341658e", "name": "Pull ups" } }] }] as WorkoutSession[],
};

type MemoryStoreEntry = {
  id?: string,
}

class MemoryStore<T extends MemoryStoreEntry> {
  store: T[] = [];

  constructor(defaultStore?: T[]) {
    if (defaultStore) {
      this.store = defaultStore;
    }
  }

  async get(id: string): Promise<T | undefined> {
    console.log(`>> services.stores.memory.MemoryStore.get`, { id });

    return this.store.filter((p) => p.id == id)[0];
  }

  async find(query?: any): Promise<T[]> {
    console.log(`>> services.stores.memory.MemoryStore.find`, { query });

    let response;
    if (query) {
      if (query.ids) {
        response = this.store.filter((value: T) => query.ids.includes(value.id));
      } else {
        throw `Unknown query type: ${JSON.stringify(query)}`;
      }
    } else {
      response = this.store;
    }

    return response;
  }

  async create(userId: string, value: T): Promise<T> {
    console.log(`>> services.stores.memory.MemoryStore.create`, { value });

    if (!value.id) {
      throw `Cannot save add with null id`;
    }

    this.store.push(value);
    return value;
  }

  async update(userId: string, value: T): Promise<T> {
    console.log(`>> services.stores.memory.MemoryStore.update`, { value });

    if (!value.id) {
      throw `Cannot update entry: null id`;
    }

    if (!this.get(value.id)) {
      throw `Cannot update entry: does not exist: ${value.id}`;
    }
  
    const exercises = this.store.filter((p: T) => p.id != value.id);
    exercises.push(value);
    this.store = exercises;
    return value;
  }

  async delete(userId: string, id: string): Promise<T> {
    console.log(`>> services.stores.memory.MemoryStore.delete`, { id });

    if (!id) {
      throw `Cannot delete entry: null id`;
    }

    const value = await this.get(id)
    if (!value) {
      throw `Cannot update entry: does not exist: ${id}`;
    }

    const values = this.store.filter((p: T) => p.id != id);
    this.store = values;
    return value;
  }
}


const exercises = new MemoryStore<Exercise>();
const workouts = new MemoryStore<Workout>();
const workoutSessions = new MemoryStore<WorkoutSession>();


//
// Exercises 
//

export async function getExercises(query?: any): Promise<Exercise[]> {
  console.log('>> services.stores.memory.getExercises()', { query });
  return exercises.find(query);
}

export async function getExercise(id: string): Promise<Exercise | undefined> {
  console.log(`>> services.stores.memory.getExercise(${id})`, { id });
  return exercises.get(id);
}

export async function addExercise(userId: string, exercise: Exercise): Promise<Exercise> {
  console.log(">> services.stores.memory.addExercise", { exercise });
  return exercises.create(userId, exercise);
}

export async function saveExercise(userId: string, exercise: Exercise): Promise<Exercise> {
  console.log(">> services.stores.memory.saveExercise", { exercise });
  return exercises.update(userId, exercise);
}

export async function deleteExercise(userId: string, id: string): Promise<Exercise> {
  console.log(">> services.stores.memory.deleteExercise", { id });
  return exercises.delete(userId, id);
}


//
// Workouts
//

export async function getWorkouts(): Promise<Workout[]> {
  console.log('>> services.stores.memory.getWorkouts()');
  return workouts.find();
}

export async function getWorkout(id: string): Promise<Workout | undefined> {
  console.log(`>> services.stores.memory.getWorkout(${id})`, { id });
  return workouts.get(id);
}

export async function addWorkout(userId: string, workout: Workout): Promise<Workout> {
  console.log(">> services.stores.memory.addWorkout", { workout });
  return workouts.create(userId, workout);
}

export async function saveWorkout(userId: string, workout: Workout): Promise<Workout | undefined> {
  console.log(">> services.stores.memory.saveWorkout", { workout });
  return workouts.update(userId, workout);
}

export async function deleteWorkout(userId: string, id: string): Promise<Workout> {
  console.log(">> services.stores.memory.deleteWorkout", { id });
  return workouts.delete(userId, id);
}


//
// Workout Sessions
//

export async function getWorkoutSessions(): Promise<WorkoutSession[]> {
  console.log('>> services.stores.memory.getSessions()');
  return workoutSessions.find();
}

export async function getWorkoutSession(id: string): Promise<WorkoutSession | undefined> {
  console.log(`>> services.stores.memory.getSession(${id})`, { id });
  return workoutSessions.get(id);
}

export async function addWorkoutSession(userId: string, session: WorkoutSession): Promise<WorkoutSession> {
  console.log(">> services.stores.memory.addSession", { session });
  return workoutSessions.create(userId, session);
}

export async function saveWorkoutSession(userId: string, session: WorkoutSession): Promise<WorkoutSession | undefined> {
  console.log(">> services.stores.memory.saveWorkoutSession", { session });
  return workoutSessions.update(userId, session);
}

export async function deleteWorkoutSession(userId: string, id: string): Promise<WorkoutSession> {
  console.log(">> services.stores.memory.deleteSession", { id });
  return workoutSessions.delete(userId, id);
}
