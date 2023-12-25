'use client'

import { User } from "firebase/auth";
import moment from "moment";
import { SuggestedExerciseTypes } from "@/types/Exercise";

export async function handleCreateWorkout(createWorkout: any, router: any, user: User | undefined) {
  // console.log("*** handleCreateGame", { user, name: user.displayName?.split(/\s+/) });
  const userName = (user && !user.isAnonymous && user.displayName)
    ? `${user.displayName.split(/\s+/)[0]}'s`
    : "";
  const hoursSinceMorning = Number(moment().startOf('day').fromNow().split(/\s+/)[0]);
  const prefix = hoursSinceMorning < 13
    ? "Morning"
    : hoursSinceMorning < 19
      ? "Afternoon"
      : "Evening"
  const workoutName = `${userName} ${prefix} Workout`;

  const name = window.prompt("Name?", workoutName);
  if (name) {
    const exercises = window.prompt("Exercises?", SuggestedExerciseTypes.join(", "));
    if (exercises) {
      const created = await createWorkout(user, name, exercises);

      if (created) {
        router.push(`/workouts/${created.id}`);
        return true
      }
    }
  }

  return false;
}
