import delay from '@desmat/utils';
import OpenAI from 'openai';

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

  // await delay(1000);

  // return {
  //   name,
  //   prompt,
  //   response: {"name":"Rowing","category":"Cardiovascular training","description":"Rowing is an intensive full-body workout that enhances your cardiovascular fitness, strengthens the muscles, and improves flexibility. It involves using a rowing machine or 'ergometer.'","instructions":["Set your feet on the footplates ensuring they're secure.","Reach forward to grab the handles with an overhand grip.","Keep your back straight and unlock your knees until your shins are vertical.","Drive off using your legs and lean back slightly, pulling the handles towards your chest.","Return to the starting position in reverse sequence: arms, hips, then knees.","Repeat for the desired number of reps."],"duration":[600000,1800000],"sets":[1,3],"reps":[10,20],"variations":[{"name":"Fast Rowing","level":"Intermediate","description":"Fast Rowing is a more challenging variation that focuses on increasing speed while maintaining form.","instructions":["Setup as if for regular rowing.","Increase your rowing speed while ensuring high-quality pulls.","Maintain the faster pace for the duration of the set."],"duration":[600000,2400000],"sets":[1,2]},{"name":"Interval Rowing","level":"Advanced","description":"Interval Rowing involves alternating periods of intense rowing with periods of moderate rowing or rest for recovery.","instructions":["Setup as if for regular rowing.","Begin with a five-minute warm-up at moderate intensity.","Row at high intensity for two minutes, followed by two minutes of moderate intensity or rest.","Repeat the high and low intensity periods for the entire duration of the set."],"duration":[1200000,2400000],"sets":[1,2]}]}
  // };

  const completion = await openai.chat.completions.create({
    model,
    messages: [
      {
        role: 'system',
        content: `You are an assistant that, for the requested exercise, will generate a short description, a category (very short), detailed instructions (newline separated), recommended duration (in milliseconds, when appropriate), recommended range of sets (as number, when appropriate) and reps (as numbers, when appropriate), and also provide a few of variations indicating difficulty level.
Provide the answer in JSON using the following keys: name, category, description, instructions, duration (an array with min and max number values, include only when appropriate),  sets (an array with min and max number values, when appropriate), reps (an array with min and max number values, when appropriate), and variations.
The variations should have the following keys: name, level, description, instructions, duration (an array with min and max number values, include only when appropriate), sets (an array with min and max number values, include only when appropriate), reps (an array with min and max number values, include only when appropriate)`
      },
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
    console.log(">> services.openai.generateExercise RESULTS FROM API", { response });
    console.log(">> services.openai.generateExercise RESULTS FROM API (as json)", JSON.stringify(response));
    return { name, prompt, response };
  } catch (error) {
    console.error("Error reading results", { error, response, completion });
  }
}

export async function generateWorkout(parameters: any[]): Promise<any> {
  console.log(`>> services.openai.generateWorkout`, { parameters });
  // const prompt = "age: 46; gender: male; difficulty: beginner; total length: about 45 minutes; maybe involving the following equiments or just the floor: rowing machine. " // parameters.map(([name, value]: any) => `${name}: ${value}`).join("; ");
  const prompt = parameters.map(([name, value]) => `${name}: ${value}`).join("; ");

  console.log(`>> services.openai.generateWorkout`, { prompt });

  // // for testing

  // await delay(3000);

  // return {
  //   prompt,
  //   response: [
  //     {
  //       "exercise": "Dumbbell Goblet Squats",
  //       "equipment": "Dumbbells",
  //       "sets": 3,
  //       "reps": 12,
  //       "difficulty": "Intermediate",
  //       "description": "Hold a dumbbell close to your chest and perform squats."
  //     },
  //     {
  //       "exercise": "Push-Ups",
  //       "equipment": "None",
  //       "sets": 3,
  //       "reps": 15,
  //       "difficulty": "Intermediate",
  //       "description": "Perform standard push-ups for chest and triceps."
  //     },
  //     {
  //       "exercise": "Dumbbell Rows",
  //       "equipment": "Dumbbells",
  //       "sets": 3,
  //       "reps": 12,
  //       "difficulty": "Intermediate",
  //       "description": "Bend forward and row dumbbells to work your back."
  //     },
  //     {
  //       "exercise": "Treadmill Jogging",
  //       "equipment": "Treadmill",
  //       "sets": 1,
  //       "time": 900000,  // 15 minutes in milliseconds
  //       "difficulty": "Intermediate",
  //       "description": "Moderate-paced jogging on the treadmill for cardio."
  //     },
  //     {
  //       "exercise": "Rowing Machine",
  //       "equipment": "Rowing Machine",
  //       "sets": 1,
  //       "time": 600000,  // 10 minutes in milliseconds
  //       "difficulty": "Intermediate",
  //       "description": "Row with proper form for a full-body workout."
  //     },
  //     {
  //       "exercise": "Plank",
  //       "equipment": "None",
  //       "sets": 3,
  //       "time": 30000,  // 30 seconds in milliseconds
  //       "difficulty": "Intermediate",
  //       "description": "Hold a plank position to strengthen your core."
  //     },
  //     {
  //       "exercise": "Dumbbell Bicep Curls",
  //       "equipment": "Dumbbells",
  //       "sets": 3,
  //       "reps": 12,
  //       "difficulty": "Intermediate",
  //       "description": "Perform bicep curls for arm strength."
  //     }
  //   ]
  // };

  const completion = await openai.chat.completions.create({
    model,
    messages: [
      {
        role: 'system',
        content: `You are an assistant that, for the provided parameters, will provide a list of exercises. 
Return only the list of exercise names, required equipment, suggested number of sets, suggested time or reps. and that's it. Answer in JSON format with the following keys: exercise, equipment, sets (as a number, if appropriate), reps (as a number, is appropriate), time (as a number of milliseconds, if appropriate), difficulty, description.`
      },
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
    console.log(">> services.openai.generateExercise RESULTS FROM API", { response });
    console.log(">> services.openai.generateExercise RESULTS FROM API (as json)", JSON.stringify(response));
    return { prompt, response };
  } catch (error) {
    console.error("Error reading results", { error, response, completion });
  }
}
