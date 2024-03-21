import { Exercise } from "./Exercise";

export type Workout = {
  id?: string,
  createdAt?: number,
  createdBy?: string,
  deletedAt?: number,
  deletedBy?: string,
  updatedAt?: number,
  updatedBy?: string,
  prompt?: string,
  status?: string,
  name: string,
  exercises?: Exercise[],
  defaultMode?: SessionMode,
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
  mode?: SessionMode,
};

export type WorkoutSet = {
  id?: string,
  createdBy?: string,
  createdAt?: number,
  startedAt?: number,
  stoppedAt?: number,
  status?: string,
  sets?: number,
  reps?: number,
  duration?: number,
  exercise: Exercise,
  offset: number,
};

export type SessionMode = {
  countdown: boolean, 
  shuffle: boolean,
  repeat: boolean,
};
