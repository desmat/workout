import { Exercise } from "./Exercise";
import { Workout, WorkoutSession } from "./Workout";

export default interface Store {
  // Exercises
  getExercises(query?: any): Promise<Exercise[]>
  getExercise(id: string): Promise<Exercise | undefined>
  addExercise(userId: string, exercise: Exercise): Promise<Exercise>
  saveExercise(userId: string, exercise: Exercise): Promise<Exercise>
  deleteExercise(userId: string, id: string): Promise<Exercise>

  // Workouts
  getWorkouts(): Promise<Workout[]>
  getWorkout(id: string): Promise<Workout | undefined>
  addWorkout(userId: string, workout: Workout): Promise<Workout>
  saveWorkout(userId: string, workout: Workout): Promise<Workout | undefined>
  deleteWorkout(userId: string, id: string): Promise<Workout>

  // Workout Sessions
  getWorkoutSessions(): Promise<WorkoutSession[]>
  getWorkoutSession(id: string): Promise<WorkoutSession | undefined>
  addWorkoutSession(userId: string, session: WorkoutSession): Promise<WorkoutSession>
  saveWorkoutSession(userId: string, session: WorkoutSession): Promise<WorkoutSession | undefined>
  deleteWorkoutSession(userId: string, id: string): Promise<WorkoutSession>
}
