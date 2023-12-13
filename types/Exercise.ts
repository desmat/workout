
export const SuggestedExerciseTypes = [
  "Classic Cocktails",
  "Classic Pasta Dishes",
  "Fast Food Dishes",
  "Salads",
  "Appetizers",
]

export type Exercise = {
  id?: string,
  createdBy?: string,
  createdAt?: number,
  deletedAt?: number,
  prompt?: string,
  status?: string,
  name: string,
  items?: ExerciseItem[],
};

export type ExerciseItem = {
  id?: string,
  name: string,
  description?: string,
}
