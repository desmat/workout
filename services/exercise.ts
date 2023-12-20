// 'use server'

import { User } from 'firebase/auth';
import moment from 'moment';
import * as openai from "@/services/openai";
import { Exercise } from "@/types/Exercise";

let store: any;
import(`@/services/stores/${process.env.STORE_TYPE}`).then((importedStore) => {
  store = importedStore;
});


function parseGeneratedExercise(response: any): Exercise {
  console.log(`>> services.exercise.parseGeneratedExercise`, { response });

  let res = response.response?.exercise || response.response || response?.exercise || response;
  if (!res) {
    console.error("No exercise items generated");
    throw `No exercise items generated`
  }

  console.log(">> services.exercise.parseGeneratedExercise", { res });

  const parseInstructionRegex = /(?:(?:Step\s*)?\d+\.?\s*)?(.*)\s?/i;  
  const parseInstruction = (step: string) => {
    const match = step.match(parseInstructionRegex)
    if (match && match.length > 0) {
      return match[1];
    }

    return step;
  }

  const fixInstructions = (exercise: any) => {
    console.log(">> services.exercise.parseGeneratedExercise.fixInstructions", { exercise });
    exercise.instructions = Array.isArray(exercise?.instructions)
      ? exercise.instructions
        .map(parseInstruction)
        .filter(Boolean)
      : exercise.instructions
        .split(/\n/)
        .map(parseInstruction)
        .filter(Boolean);

    return exercise;
  }

  res = fixInstructions(res);

  if (res.variations) {
    res.variations = res.variations.map(fixInstructions);
  }

  return res as Exercise;
}

export async function getExercises(query?: any): Promise<Exercise[]> {
  const exercises = await store.getExercises(query);
  // const exercises = [
  //   {id: "1", name: "NAME 1", status: "created", items: SAMPLE_MENU.menu},
  //   {id: "2", name: "NAME 2", status: "created", items: SAMPLE_MENU.menu},
  //   {id: "3", name: "NAME 3247973432842", status: "created", items: SAMPLE_MENU.menu},
  //   {id: "3", status: "created", name: "Italian Pasta", items: SAMPLE_MENU.menu},
  //   {id: "3", status: "generating", name: "New brunch menu", items: SAMPLE_MENU.menu},
  // ];
  return new Promise((resolve, reject) => resolve(exercises));
}

export async function getExercise(id: string): Promise<Exercise> {
  console.log(`>> services.exercise.getExercise`, { id });

  const exercise = await store.getExercise(id);
  console.log(`>> services.exercise.getExercise`, { id, exercise });
  return new Promise((resolve, reject) => resolve(exercise));
}

export async function createExercise(user: User, name: string): Promise<Exercise> {
  console.log(">> services.exercise.createExercise", { name, user });

  let exercise = {
    id: crypto.randomUUID(),
    createdBy: user.uid,
    createdAt: moment().valueOf(),
    status: "generating",
    name,
  } as Exercise;

  let savedExercise = await store.addExercise(exercise);

  return await generateExercise(user, savedExercise);
}

export async function generateExercise(user: User, exercise: Exercise): Promise<Exercise> {
  console.log(">> services.exercise.generateExercise", { exercise, user });

  exercise.status = "generating";
  exercise.instructions = undefined;
  exercise.variations = undefined

  let res = await openai.generateExercise(exercise.name);
  let generatedExercise = parseGeneratedExercise(res);

  console.log(">> services.exercise.createExercise (fixed instructions)", { generatedExercise });

  exercise = { ...exercise, ...generatedExercise, status: "created", updatedAt: moment().valueOf() };

  return store.saveExercise(exercise);
}

export async function deleteExercise(user: any, id: string): Promise<void> {
  console.log(">> services.exercise.deleteExercise", { id, user });

  if (!id) {
    throw `Cannot delete exercise with null id`;
  }

  const exercise = await getExercise(id);
  if (!exercise) {
    throw `Exercise not found: ${id}`;
  }

  if (!(exercise.createdBy == user.uid || user.customClaims?.admin)) {
    throw `Unauthorized`;
  }

  return store.deleteExercise(id);
}

export async function saveExercise(user: any, exercise: Exercise): Promise<void> {
  console.log(">> services.exercise.deleteExercise", { exercise, user });

  if (!(exercise.createdBy == user.uid || user.customClaims?.admin)) {
    throw `Unauthorized`;
  }

  return store.savedExercise(exercise);
}
