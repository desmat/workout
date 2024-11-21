import { uuid } from '@desmat/utils';
import { User } from 'firebase/auth';
import moment from 'moment';
import * as openai from "@/services/openai";
import { createStore } from '@/services/stores/redis';
import { Exercise } from "@/types/Exercise";

const store = createStore({
  debug: true,
});

export function summarizeExercise(exercise: Exercise, include?: any): Exercise {
  // console.log(`>> services.workout.summarizeExercise`, { exercise, include });
  const included: any = {};
  if (include?.description) included.description = exercise.description;
  if (include?.directions) included.directions = exercise.directions;
  if (include?.status) included.status = exercise.status;

  return {
    id: exercise.id,
    name: exercise.name,
    ...included,
  };
}

function parseGeneratedExercise(response: any): any {
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

  const directions = (res.duration || res.sets || res.reps) && {
    duration: res.duration,
    sets: res.sets,
    reps: res.reps,
  };
  const variations = res.variations && res.variations.map((e: Exercise) => parseGeneratedExercise(e));
  const exercise = {
    name: res.name,
    description: res.description,
    instructions: res.instructions,
    category: res.category,
    directions,
    variations,
  };

  return exercise as Exercise;
}

export async function getOrGenerateExercises(user: User, exerciseNames: string[]) {
  console.log(`>> services.workout.getOrGenerateExercises`, { exerciseNames });

  // bring in existing exercises, or create new
  const allExerciseNames = new Map((
    await getExercises()).map((exercise: Exercise) => [exercise.name.toLowerCase(), exercise]));
  // note: requested exercise names might repeat
  const exerciseNamesToCreate = Array.from(
    new Set(
      exerciseNames
        .map((name: string) => name.toLowerCase())
        .filter((name: string) => !allExerciseNames.has(name))));
  console.log(`>> services.workout.createWorkout`, { allExerciseNames, exerciseNamesToCreate });

  const createdExercises = new Map((
    await Promise.all(
      exerciseNamesToCreate
        .filter(Boolean)
        .map(async (name: string) => {
          return createExercise(user, name).then((created: Exercise) => {
            return generateExercise(user, created);
          });
        })
    )).map((exercise: Exercise) => [exercise.name.toLocaleLowerCase(), exercise]));

  const pickFromRange = (range: any, level?: "beginner" | "intermediate" | "advanced") => {
    return Array.isArray(range) && range.length > 1
      ? level == "beginner"
        ? range[0]
        : level == "advanced"
          ? range[1]
          : Math.floor((Number(range[0]) + Number(range[1])) / 2)
      : range;
  }

  const exercises = exerciseNames
    .map((exerciseName: string) => {
      const name = exerciseName.toLowerCase();
      const exercise = allExerciseNames.get(name) || createdExercises.get(name)

      if (exercise?.directions) {
        exercise.directions = {
          duration: pickFromRange(exercise.directions.duration),
          sets: pickFromRange(exercise.directions.sets),
          reps: pickFromRange(exercise.directions.reps),
        }
      }

      return exercise;
    })
    .filter(Boolean) as Exercise[];

  console.log(`>> services.workout.getOrGenerateExercises`, { createdExercises, exercises });

  return exercises;
}

export async function getExercises(query?: any): Promise<Exercise[]> {
  const exercises = await store.exercises.find(query);
  return new Promise((resolve, reject) => resolve(exercises.filter(Boolean)));
}

export async function getExercise(id: string): Promise<Exercise | undefined> {
  console.log(`>> services.exercise.getExercise`, { id });

  const exercise = await store.exercises.get(id);
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

  return store.exercises.create(exercise);
}

export async function generateExercise(user: User, exercise: Exercise): Promise<Exercise> {
  console.log(">> services.exercise.generateExercise", { exercise, user });

  exercise = {
    ...summarizeExercise(exercise),
    status: "generating",
    createdAt: exercise.createdAt,
    createdBy: exercise.createdBy,
    updatedAt: moment().valueOf(),
    updatedBy: user.uid,
  };
  store.exercises.update(exercise);

  const res = await openai.generateExercise(exercise.name);
  const generatedExercise = parseGeneratedExercise(res);
  console.log(">> services.exercise.createExercise (fixed instructions)", { generatedExercise });

  exercise = {
    ...exercise,
    ...generatedExercise,
    name: exercise.name,
    status: "created",
    updatedAt: moment().valueOf(),
    updatedBy: user.uid,
  };

  return store.exercises.update(exercise);
}

export async function deleteExercise(user: any, id: string): Promise<Exercise | undefined> {
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

  return store.exercises.delete(id);
}

export async function saveExercise(user: any, exercise: Exercise): Promise<Exercise> {
  console.log(">> services.exercise.deleteExercise", { exercise, user });

  if (!(exercise.createdBy == user.uid || user.customClaims?.admin)) {
    throw `Unauthorized`;
  }

  return store.exercises.update(exercise);
}
