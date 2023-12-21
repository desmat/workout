import { Exercise } from "./Exercise";

export type Workout = {
  id?: string,
  createdBy?: string,
  createdAt?: number,
  deletedAt?: number,
  updatedAt?: number,
  prompt?: string,
  status?: string,
  name: string,
  exercises?: Exercise[],
};

export type WorkoutSession = {
  id?: string,
  createdBy?: string,
  createdAt?: number,
  deletedAt?: number,
  updatedAt?: number,
  status?: string,
  workout: Workout,
  sets: WorkoutSet[],
};

export type WorkoutSet = {
  id?: string,
  createdBy?: string,
  createdAt?: number,
  startedAt?: number,
  stoppedAt?: number,
  status?: string,
  duration?: number,
  reps?: number,
  exercise: Exercise,
  offset: number,
}
