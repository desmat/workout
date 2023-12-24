// 'use server'

import OpenAI from 'openai';
import { sampleExercises } from './stores/samples';
import delay from '@/utils/delay';

let store: any;
import(`@/services/stores/${process.env.STORE_TYPE}`).then((importedStore) => {
  store = importedStore;
});

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// const model = "gpt-3.5-turbo"; // seems good and fast enough for now
const model = "gpt-4";

export async function generateExercise(name: string): Promise<any> {
  console.log(`>> services.openai.generateExercise`, { name });
  const prompt = `Requested exercise: ${name}`;

  // // for testing
  // // return new Promise((resolve, reject) => resolve(  {
  // //   "name": name,
  // //   "description": "DESCRIPTION",
  // //   "instructions": "1. STEP 1\n2. STEP 2",
  // // },));

  // await delay(3000);

  // return {
  //   name,
  //   prompt,
  //   response: {
  //     name: "Foo",
  //     category: "Bar training",
  //     sets:[3,5],
  //     reps:[10,15],
  //     duration: [ 1000 * 60, 1000 * 60 * 2 ],
  //     description: sampleExercises[0].description,
  //     instructions: sampleExercises[0].instructions,
  //     variations: sampleExercises[0].variations
  //   }
  // };

  const completion = await openai.chat.completions.create({
    model,
    messages: [
      {
        role: 'system',
        content: `You are an assistant that, for the requested exercise, will generate a short description, a category (very short), detailed instructions (newline separated), recommended duration (in milliseconds, when appropriate), recommended range of sets (as number, when appropriate) and reps (as numbers, when appropriate), and also provide a few of variations indicating difficulty level.
Provide the answer in JSON using the following keys: name, category, description, instructions, duration (an array with min and max number values, include only when appropriate),  sets (an array with min and max number values, when appropriate), reps (an array with min and max number values, when appropriate), and variations.
The variations should have the following keys: name, level, description, instructions, duration (an array with min and max number values, include only when appropriate), sets (an array with min and max number values, include only when appropriate), reps (an array with min and max number values, include only when appropriate)`},
      {
        role: 'user',
        content: prompt,
      }
    ],
  });

  let response;
  try {
    // console.log(">> services.openai.generateExercise RESULTS FROM API", completion);
    response = JSON.parse(completion.choices[0].message.content || "{}");
    // console.log(">> services.openai.generateExercise RESULTS FROM API", { response });
    // console.log(">> services.openai.generateExercise RESULTS FROM API (as json)", JSON.stringify(response));
    return { name, prompt, response };
  } catch (error) {
    console.error("Error reading results", { error, response, completion });
  }
}
