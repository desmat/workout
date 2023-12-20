// 'use server'

import OpenAI from 'openai';

let store: any;
import(`@/services/stores/${process.env.STORE_TYPE}`).then((importedStore) => {
  store = importedStore;
});

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const model = "gpt-3.5-turbo"; // seems good and fast enough for now
// const model = "gpt-4";

export async function generateExercise(name: string): Promise<any> {
  console.log(`>> services.openai.generateExercise`, { name });

  // // for testing
  // return new Promise((resolve, reject) => resolve(  {
  //   "name": name,
  //   "description": "DESCRIPTION",
  //   "instructions": "1. STEP 1\n2. STEP 2",
  // },));

  const prompt = `Requested exercise: ${name}`;

  const completion = await openai.chat.completions.create({
    model,
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
    console.log(">> services.openai.generateExercise RESULTS FROM API", completion);
    const response = JSON.parse(completion.choices[0].message.content || "{}");
    // console.log(">> services.openai.generateExercise RESULTS FROM API (as json)", JSON.stringify(response));
    return { name, prompt, response };
  } catch (error) {
    console.error("Error reading results", { completion, error });
  }
}
