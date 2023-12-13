import { Exercise } from "./Exercise";

export type Workout = {
  id?: string,
  createdBy?: string,
  createdAt?: number,
  deletedAt?: number,
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
  prompt?: string,
  status?: string,
  workout: Workout
  sets: WorkoutSet[],
};

export type WorkoutSet = {
  id?: string,
  exercise: Exercise,
  duration?: number,
  reps?: number,
}
