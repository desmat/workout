
export const SuggestedExerciseTypes = [
  "Push Up",
  "Pull Up",
  "Sit Up",
]

export type Exercise = {
  name: string,
  id?: string,
  createdBy?: string,
  createdAt?: number,
  deletedAt?: number,
  prompt?: string,
  status?: string,
  description?: string,
  instructions?: string,
  level?: string,
  variations?: Exercise[],
};
