import { Exercise } from '@/types/Exercise';
import { Workout } from '@/types/Workout';

export const sampleExercises: Exercise[] = [
  // {"name":"Shoulder Press","category":"Strength","description":"The Shoulder Press is a popular exercise that targets your shoulders but also works your upper chest and triceps. It can be performed with dumbbells, barbells, kettlebells, or a weight machine.","instructions":["Start with your feet shoulder-width apart, holding the weights at shoulder level.","Keep your back straight and use your shoulder muscles to lift the weights above your head.","Lower the weights back down to shoulder level.","Maintain control of the weights at all times, do not let them drop quickly."],"sets":[3,5],"reps":[8,12],"variations":[{"name":"Seated Shoulder Press","level":"Beginner","description":"The Seated Shoulder Press is a less demanding version of the Shoulder Press, perfect for beginners or those with lower body restrictions.","instructions":["Sit on a bench with back support, holding weights or a barbell at shoulder level.","Press the weights up until your arms are fully extended.","Lower back down to shoulder level."],"sets":[3,5],"reps":[8,12]},{"name":"Arnold Press","level":"Intermediate","description":"The Arnold Press is a variant of the shoulder press named after Arnold Schwarzenegger, which places more emphasis on the front deltoids.","instructions":["Sit on a bench with back support, holding two dumbbells at chest level with palms facing your body.","Raise the dumbbells as you rotate the palms of your hands until they are facing forward.","Continue lifting the dumbbells until your arms are extended above you in straight arm position.","Pause, then lower the dumbbells while rotating your palms towards you."],"sets":[3,5],"reps":[8,12]},{"name":"Single Arm Shoulder Press","level":"Advanced","description":"The Single Arm Shoulder Press is an advanced exercise that requires more stabilization, focuses on one arm at a time.","instructions":["Hold a dumbbell in one hand at shoulder level.","Press the dumbbell up until your arm is fully extended.","Lower it back down to the shoulder level.","Repeat for the recommended number of repetitions, then switch arms."],"sets":[3,5],"reps":[8,12]}]},
  // {"name":"Treadmill","category":"Cardio","description":"The treadmill is a classic cardio exercise that involves running or walking on a machine. It can help improve cardiovascular health, burn calories, and build lower body strength.","instructions":["Stand on the treadmill with your feet on the side platforms.","Set the speed to a comfortable walking or running pace.","Begin by walking or running, gradually increasing the speed as you warm up.","Keep your posture straight but relaxed. Look forward not down.","Swing your arms naturally and keep your hands relaxed.","You can increase the incline for a harder workout.","Slow down before you stop completely to cool down."],"duration":[1200000,3600000],"sets":[1,1],"variations":[{"name":"Interval Treadmill","level":"Intermediate","description":"Interval treadmill workouts are great for burning fat and boosting cardiovascular fitness. They involve alternating between high-intensity and low-intensity running.","instructions":["Start by warming up at a comfortable pace.","Increase the speed to a challenging pace for 1 minute.","Reduce the speed to a low intensity for 2 minutes.","Repeat this cycle for the duration of your workout."],"duration":[1200000,2400000],"sets":[1,1]},{"name":"Incline Treadmill","level":"Advanced","description":"Incline treadmill workouts are designed to target your lower body and increase your heart rate. They involve running or walking at an incline.","instructions":["Start by setting the treadmill at a slight incline and warming up at a comfortable pace.","Increase the incline every 5 minutes.","Maintain a constant speed, adjusting as necessary.","Make sure your posture remains upright and that you're not leaning on the handles."],"duration":[1800000,3600000],"sets":[1,1]}]},
  {
    "id": "c1977455-36e8-4dc8-86c1-76f65e730fc2",
    "createdBy": "eDcD0gwTvFeJJQNlqHQv9vFV45i1",
    "createdAt": 1702585437126,
    "status": "created",
    "name": "Push ups",
    "description": "A full-body exercise targeting the chest, shoulders, and triceps.",
    "instructions": [
      "Start in a plank position with your hands slightly wider than your shoulders",
      "Keep your body straight and lower it to the ground by bending your elbows. Push back up to the starting position"
    ],
    "variations": [
      {
        "name": "Knee Push Up",
        "level": "Beginner",
        "description": "A simpler version of the standard push up, ideal for beginners.",
        "instructions": [
          "Start in a plank position but with your knees on the ground.",
          "Lower your upper body to the ground by bending your elbows and then push back up."
        ],
      },
      {
        "name": "Diamond Push Up",
        "level": "Intermediate",
        "description": "Targets the triceps more intensely.",
        // "instructions": "Start in a standard push up position but with your hands close together, forming a diamond shape. Lower your body to the ground and push back up."
      },
      {
        "name": "One-Arm Push Up",
        "level": "Advanced",
        "description": "A challenging variation requiring significant strength and balance.",
        // "instructions": "Start in a push up position. Place one hand behind your back and lower your body using only one arm. Push back up to the starting position."
      }
    ]
  },
  {
    "id": "0eea0e09-de1c-41db-b8e1-863be341658e",
    "createdBy": "eDcD0gwTvFeJJQNlqHQv9vFV45i1",
    "createdAt": 1702585437126,
    "status": "created",
    "name": "Pull ups",
    "description": "An upper body strength exercise targeting the back, shoulders, and arms.",
    // "instructions": "Hang from a pull-up bar with your hands shoulder-width apart. Pull yourself up until your chin is above the bar, then lower back down.",
    "variations": [
      {
        "name": "Negative Pull Up",
        "level": "Beginner",
        "description": "Focuses on the lowering phase of the pull up.",
        // "instructions": "Start by jumping up to the pull-up bar and getting your chin above it. Slowly lower yourself down in a controlled manner."
      },
      {
        "name": "Commando Pull Up",
        "level": "Intermediate",
        "description": "Increases the intensity by changing the grip and adding a twist.",
        // "instructions": "Grip the bar with one hand in front and one behind your head. Pull yourself up while twisting slightly to bring your chin over the bar, alternating sides."
      },
      {
        "name": "Weighted Pull Up",
        "level": "Advanced",
        "description": "Adds extra weight for increased resistance.",
        // "instructions": "Perform a standard pull up while wearing a weighted belt or holding a dumbbell between your feet."
      }
    ]
  },
  {
    "id": "ba3883f5-e7fd-4b47-ac64-c3cd18f89420",
    "createdBy": "eDcD0gwTvFeJJQNlqHQv9vFV45i1",
    "createdAt": 1702585437126,
    "status": "created",
    "name": "sit ups",
    "description": "A core strengthening exercise focusing on the abdominal muscles.",
    // "instructions": "Lie on your back with knees bent and feet flat on the ground. Curl your upper body all the way up toward your knees, then slowly lower back down.",
    "variations": [
      {
        "name": "Crunch",
        "level": "Beginner",
        "description": "A milder form of the sit up, focusing on the upper abs.",
        // "instructions": "Lie on your back with knees bent. Lift your shoulders off the ground slightly and curl your upper body towards your knees."
      },
      {
        "name": "Twisting Sit Up",
        "level": "Intermediate",
        "description": "Incorporates a twist to engage the oblique muscles.",
        // "instructions": "Perform a standard sit up, but twist your torso to alternate sides as you come up."
      },
      {
        "name": "V-Up",
        "level": "Advanced",
        "description": "A challenging variation that targets the entire core.",
        // "instructions": "Lie on your back and extend your arms behind your head. Lift your legs and upper body at the same time, trying to touch your toes, forming a 'V' shape."
      }
    ]
  },
  {
    "id": "fbb4487e-0e83-4eac-adf7-1c48d345c36d",
    "createdBy": "eDcD0gwTvFeJJQNlqHQv9vFV45i1",
    "createdAt": 1702585443822,
    "status": "created",
    "name": "Foo"
  },
  {
    "id": "b1cac47f-8a00-4337-8b44-6ed3e6f7c38a",
    "createdBy": "eDcD0gwTvFeJJQNlqHQv9vFV45i1",
    "createdAt": 1702585443823,
    "status": "created",
    "name": "bar"
  }
];

export const sampleWorkouts: Workout[] = [
  {
    "id": "0adba0e4-d5cd-4f29-bb62-1cceb10929bd",
    "createdBy": "eDcD0gwTvFeJJQNlqHQv9vFV45i1",
    "createdAt": 1702585437125,
    "status": "created",
    "name": "Test 1",
    "exercises": [
      {
        "id": "c1977455-36e8-4dc8-86c1-76f65e730fc2",
        "name": "Push ups"
      },
      {
        "id": "0eea0e09-de1c-41db-b8e1-863be341658e",
        "name": "Pull ups"
      },
      {
        "id": "ba3883f5-e7fd-4b47-ac64-c3cd18f89420",
        "name": "sit ups"
      }
    ]
  },
  {
    "id": "6f929c3e-b22e-48a2-9131-3f8af90470b0",
    "createdBy": "eDcD0gwTvFeJJQNlqHQv9vFV45i1",
    "createdAt": 1702585443820,
    "status": "created",
    "name": "Test 2",
    "exercises": [
      {
        "id": "fbb4487e-0e83-4eac-adf7-1c48d345c36d",
        "name": "Foo"
      },
      {
        "id": "b1cac47f-8a00-4337-8b44-6ed3e6f7c38a",
        "name": "bar"
      }
    ]
  }
];
