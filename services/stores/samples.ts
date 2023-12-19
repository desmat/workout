import { Exercise } from '@/types/Exercise';
import { Workout } from '@/types/Workout';

export const sampleExercises: Exercise[] = [
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
