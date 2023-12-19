// 'use server'

import { User } from 'firebase/auth';
import moment from 'moment';
import OpenAI from 'openai';
import { Exercise } from "@/types/Exercise";

let store: any;
import(`@/services/stores/${process.env.STORE_TYPE}`).then((importedStore) => {
  store = importedStore;
});

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

async function generateExercise(name: string): Promise<any> {
  console.log(`>> services.exercise.generateExercise`, { name });

  // // for testing
  // return new Promise((resolve, reject) => resolve({ prompt: "THE PROMPT", items: SAMPLE_EXERCISE.items as ExerciseItem[] }));

  const prompt = `Requested exercise: ${name}`;
  const completion = await openai.chat.completions.create({
    // model: 'gpt-3.5-turbo',
    model: 'gpt-4',
    // model: "gpt-3.5-turbo-1106",
    // response_format: { type: "json_object" },    
    messages: [
      {
        role: 'system',
        content: `You are an assistant that, for the requested exercise, will generate a short description, detailed instructions, and also provide a few of variations indicating difficulty level. 
Provide the answer in JSON using the following keys: name, description, instructions and variations. 
The variations should have the following keys: name, level, description and instructions.`},
      {
        role: 'user',
        content: prompt,
      }
    ],
  });

  try {
    console.log("*** RESULTS FROM API", completion);
    console.log("*** RESULTS FROM API (as json)", JSON.stringify(JSON.parse(completion.choices[0].message.content || "{}")));
    return { name, prompt, response: JSON.parse(completion.choices[0]?.message?.content || "{}") };
  } catch (error) {
    console.error("Error reading results", { completion, error });
  }
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

  let res = await generateExercise(name);
  res = res.response.exercise || res.response || res.exercise || res;
  if (!res) {
    console.error("No exercise items generated", res.response);
    throw `No exercise items generated`
  }

  console.log(">> services.exercise.createExercise", { res });

  const parseInstruction = /(?:\d+\.?\s?)?(.*)\s?/;
  const fixInstructions = (exercise: any) => {
    exercise.instructions = Array.isArray(exercise.instructions)
    ? exercise.instructions
    : exercise.instructions
      .split(/\n/)
      .map((step: string) => {
        const match = step.match(parseInstruction)
        if (match && match.length > 0) {
          return match[1];
        }
      })
      .filter(Boolean);  

    return exercise;
  }

  res = fixInstructions(res);
  res.variation = res.variations.map(fixInstructions);

  console.log(">> services.exercise.createExercise (fixed instructions)", { res });

  exercise = { ...exercise, ...res, status: "created" };
  return await store.addExercise(exercise);
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

  store.deleteExercise(id);
  return new Promise((resolve, reject) => resolve());
}
