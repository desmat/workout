// 'use server'

import moment from 'moment';
import { Exercise } from "@/types/Exercise";
import { sampleExercises, sampleWorkouts } from './samples';
import { Workout } from '@/types/Workout';

const memoryStore = {
    exercises: sampleExercises as Exercise[],
    workouts:  sampleWorkouts as Workout[],
};


//
// Exercises
//

export async function getExercises(query?: any): Promise<Exercise[]> {
    console.log('>> services.stores.memory.getExercises()', { query });

    // console.log('>> services.stores.memory.getExercises(): waiting...');
    // await new Promise((resolve) => setTimeout(() => resolve(42), 500));
    // console.log('>> services.stores.memory.getExercises(): done waiting!');

    let response;
    if (query) {
      if (query.ids) {
        response = memoryStore.exercises.filter((exercise: Exercise) => query.ids.includes(exercise.id));
      } else {
        throw `Unknown query type: ${JSON.stringify(query)}`;
      }
    } else {
      response = memoryStore.exercises;
    }
  
    return response;
}

export async function getExercise(id: string): Promise<Exercise | null> {
    console.log(`>> services.stores.memory.getExercise(${id})`);

    // console.log('>> services.stores.memory.getExercise(): waiting...');
    // await new Promise((resolve) => setTimeout(() => resolve(42), 1000));
    // console.log('>> services.stores.memory.getExercise(): done waiting!');

    return memoryStore.exercises.filter((p) => p.id == id)[0];
}

export async function addExercise(exercise: Exercise): Promise<Exercise> {
    console.log(">> services.stores.memory.addExercise content:", { exercise });
    
    // console.log('>> services.stores.memory.addExercise(): waiting...');
    // await new Promise((resolve) => setTimeout(() => resolve(42), 1000));
    // console.log('>> services.stores.memory.getExercise(): done waiting!');

    exercise.status = "created";
    memoryStore.exercises.push(exercise);
    return exercise;
}

export async function editExercise(exercise: Exercise): Promise<Exercise> {
    console.log(">> services.stores.memory.editExercise exercise:", exercise);

    if (!exercise.id) {
        throw `Cannot delete exercise with null id`;
    } 

    const exercises = memoryStore.exercises.filter((p: Exercise) => p.id != exercise.id);
    exercises.push(exercise);
    memoryStore.exercises = exercises;
    return exercise;
}

export async function deleteExercise(id: string): Promise<void> {
    console.log(">> services.stores.memory.deleteExercise id:", id);

    if (!id) {
        throw `Cannot delete exercise with null id`;
    }
    
    const exercises = memoryStore.exercises.filter((p: Exercise) => p.id != id);
    memoryStore.exercises = exercises;
}


//
// Workouts
//

export async function getWorkouts(): Promise<Workout[]> {
    console.log('>> services.stores.memory.getWorkouts()');

    // console.log('>> services.stores.memory.getWorkouts(): waiting...');
    // await new Promise((resolve) => setTimeout(() => resolve(42), 500));
    // console.log('>> services.stores.memory.getWorkouts(): done waiting!');

    return memoryStore.workouts;
}

export async function getWorkout(id: string): Promise<Workout | null> {
    console.log(`>> services.stores.memory.getWorkout(${id})`);

    // console.log('>> services.stores.memory.getWorkout(): waiting...');
    // await new Promise((resolve) => setTimeout(() => resolve(42), 1000));
    // console.log('>> services.stores.memory.getWorkout(): done waiting!');

    return memoryStore.workouts.filter((p) => p.id == id)[0];
}

export async function addWorkout(workout: Workout): Promise<Workout> {
    console.log(">> services.stores.memory.addWorkout", { workout });
    
    // console.log('>> services.stores.memory.addWorkout(): waiting...');
    // await new Promise((resolve) => setTimeout(() => resolve(42), 1000));
    // console.log('>> services.stores.memory.getWorkout(): done waiting!');

    workout.status = "created";
    memoryStore.workouts.push(workout);
    console.log(">> services.stores.memory.addWorkout", { exercises: JSON.stringify(memoryStore.exercises), workouts: JSON.stringify(memoryStore.workouts) });
    return workout;
}

export async function editWorkout(workout: Workout): Promise<Workout> {
    console.log(">> services.stores.memory.editWorkout workout:", workout);

    if (!workout.id) {
        throw `Cannot delete workout with null id`;
    } 

    const workouts = memoryStore.workouts.filter((p: Workout) => p.id != workout.id);
    workouts.push(workout);
    memoryStore.workouts = workouts;
    return workout;
}

export async function deleteWorkout(id: string): Promise<void> {
    console.log(">> services.stores.memory.deleteWorkout id:", id);

    if (!id) {
        throw `Cannot delete workout with null id`;
    }
    
    const workouts = memoryStore.workouts.filter((p: Workout) => p.id != id);
    memoryStore.workouts = workouts;
}
