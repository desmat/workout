'use client'

import { capitalize } from "@desmat/utils/format";
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
    const exercises = window.prompt(`Exercises? (Example ${SuggestedExerciseTypes.join(", ")})`);
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

function prompts(questions: any[]): any[][] | undefined {
  const answers = [];
  for (const q of questions) {
    let message = q;
    let value = undefined;
    let example = undefined
    if (Array.isArray(q)) {
      message = q[0];
      value = q[1];
      example = q[2];
    }

    const answer = window.prompt(`${message}? ${example ? `(Example: ${example}, or l` : "(L"}eave empty to skip)`, value);
    console.log("*** handlers.prompts", { answer, type: typeof (answer) });
    if (typeof (answer) != "string") {
      return undefined;
    }

    if (answer) {
      answers.push([message, answer]);
    }
  }

  return answers;
}

export async function handleGenerateWorkout(generateWorkout: any, router: any, user: User | undefined, info: any, success: any) {
  // console.log("*** handleCreateGame", { user, name: user.displayName?.split(/\s+/) });
  const userName = (user && !user.isAnonymous && user.displayName)
    ? `${user.displayName.split(/\s+/)[0]}'s`
    : "";

  const parameters = prompts([
    // ["Age"],
    // ["Gender"],
    ["Difficulty", "Beginner"],
    ["Total length", "25 minutes"],
    ["With specific equipment", "", "Treadmill, Bumbbells, Resistance bands, Full gym"],
  ]);

  if (parameters && parameters.length > 0) {
    const additionally = window.prompt("Anything else? (Examples: age, gender, specific disability, or more specifically 'Tai Chi', 'Mix of cardio and strength', 'Outside at the park', or leave empty to skip)");
    if (additionally) {
      parameters.push(["Additionally", additionally]);
    }

    const workoutName = `${userName} ${additionally ? capitalize(additionally) : "AI-Generated"} Workout`;
    const name = window.prompt("Name?", workoutName);
    if (name) {
      if (info) {
        info(`Generating workout '${name}'...`);
      }

      const created = await generateWorkout(user, name, parameters);
      if (created) {
        if (success) {
          success(`Workout '${name}' generated!`);
        }
  
        router.push(`/workouts/${created.id}`);
        return true;
      }
    }
  }

  return false;
}
