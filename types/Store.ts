import { Exercise } from "./Exercise"
import { Workout, WorkoutSession } from "./Workout";

export interface GenericStore<T> {
  get: (id: string) => Promise<T | undefined>,
  find: (query?: any) => Promise<T[]>,
  create: (userId: string, value: T) => Promise<T>,
  update: (userId: string, value: T) => Promise<T>,
  delete: (userId: string, id: string) => Promise<T>,
}

export type Store = {
  exercises: GenericStore<Exercise>,
  workouts: GenericStore<Workout>,
  workoutSessions: GenericStore<WorkoutSession>;
}
