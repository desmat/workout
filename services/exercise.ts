// 'use server'

import { User } from 'firebase/auth';
import moment from 'moment';
import * as openai from "@/services/openai";
import { Exercise } from "@/types/Exercise";
import Store from "@/types/Store";
import { uuid } from '@/utils/misc';

let store: Store;
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
    const match = step && step.match(parseInstructionRegex)
    if (match && match.length > 0) {
      return match[1];
    }

    return step;
  }

  const fixInstructions = (exercise: any) => {
    console.log(">> services.exercise.parseGeneratedExercise.fixInstructions", { exercise });
    if (exercise?.instructions) {
      exercise.instructions = Array.isArray(exercise.instructions)
        ? exercise.instructions
          .map(parseInstruction)
          .filter(Boolean)
        : exercise.instructions
          .split(/\n/)
          .map(parseInstruction)
          .filter(Boolean);
    }

    return exercise;
  }

  const parseCategoryRegex = /(.+)(?:\s+training|\s+exercise|\s+workout)+/i;
  const parseCategory = (category: string) => {
    const match = category && category.match(parseCategoryRegex)
    if (match && match.length > 0) {
      return match[1];
    }

    return category;
  }

  const fixCategory = (exercise: any) => {
    console.log(">> services.exercise.parseGeneratedExercise.fixCategory", { exercise });
    if (exercise?.category) {
      exercise.category = parseCategory(exercise.category);
    }

    return exercise;
  }

  res = fixCategory(fixInstructions(res));

  if (res.variations) {
    res.variations = res.variations.map(fixInstructions).map(fixCategory);
  }

  return res as Exercise;
}

export async function getExercises(query?: any): Promise<Exercise[]> {
  const exercises = await store.getExercises(query);
  return new Promise((resolve, reject) => resolve(exercises.filter(Boolean)));
}

export async function getExercise(id: string): Promise<Exercise | undefined> {
  console.log(`>> services.exercise.getExercise`, { id });

  const exercise = await store.getExercise(id);
  console.log(`>> services.exercise.getExercise`, { id, exercise });
  return new Promise((resolve, reject) => resolve(exercise));
}

export async function createExercise(user: User, name: string): Promise<Exercise> {
  console.log(">> services.exercise.createExercise", { name, user });

  let exercise = {
    id: uuid(),
    createdBy: user.uid,
    createdAt: moment().valueOf(),
    status: "created",
    name,
  } as Exercise;

  return store.addExercise(user.uid, exercise);
}

export async function generateExercise(user: User, exercise: Exercise): Promise<Exercise> {
  console.log(">> services.exercise.generateExercise", { exercise, user });

  exercise.status = "generating";
  exercise.instructions = undefined;
  exercise.variations = undefined

  let res = await openai.generateExercise(exercise.name);
  let generatedExercise = parseGeneratedExercise(res);
  console.log(">> services.exercise.createExercise (fixed instructions)", { generatedExercise });

  exercise = {
    ...exercise,
    description: generatedExercise.description,
    instructions: generatedExercise.instructions,
    variations: generatedExercise.variations,
    category: generatedExercise.category,
    duration: generatedExercise.duration,
    sets: generatedExercise.sets,
    reps: generatedExercise.reps,
    status: "created",
    updatedAt: moment().valueOf()
  };

  return store.saveExercise(user.uid, exercise);
}

export async function deleteExercise(user: any, id: string): Promise<Exercise> {
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

  return store.deleteExercise(user.uid, id);
}

export async function saveExercise(user: any, exercise: Exercise): Promise<Exercise> {
  console.log(">> services.exercise.deleteExercise", { exercise, user });

  if (!(exercise.createdBy == user.uid || user.customClaims?.admin)) {
    throw `Unauthorized`;
  }

  return store.saveExercise(user.uid, exercise);
}
