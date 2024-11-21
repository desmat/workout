
export const SuggestedExerciseTypes = [
  "Push Up",
  "Pull Up",
  "Sit Up",
]

export type Exercise = {
  name: string,
  id: string,
  createdAt: number,
  createdBy?: string,
  deletedAt?: number,
  deletedBy?: string,
  updatedAt?: number,
  updatedBy?: string,
  prompt?: string,
  status?: string,
  description?: string,
  instructions?: string[],
  level?: string,
  category?: string,
  directions?: ExerciseDirections;
  variations?: Exercise[],
};

export type ExerciseDirections = {
  duration?: number | number[],
  sets?: number | number[],
  reps?: number | number[],
}
