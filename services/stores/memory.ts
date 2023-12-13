// 'use server'

import moment from 'moment';
import { Exercise } from "@/types/Exercise";
import { sampleExercises } from './samples';

let inMemoryExercises = sampleExercises as Exercise[];


//
// Exercises
//

export async function getExercises(): Promise<Exercise[]> {
    console.log('>> services.stores.memory.getExercises()');

    // console.log('>> services.stores.memory.getExercises(): waiting...');
    // await new Promise((resolve) => setTimeout(() => resolve(42), 500));
    // console.log('>> services.stores.memory.getExercises(): done waiting!');

    return inMemoryExercises;
}

export async function getExercise(id: string): Promise<Exercise | null> {
    console.log(`>> services.stores.memory.getExercise(${id})`);

    // console.log('>> services.stores.memory.getExercise(): waiting...');
    // await new Promise((resolve) => setTimeout(() => resolve(42), 1000));
    // console.log('>> services.stores.memory.getExercise(): done waiting!');

    return inMemoryExercises.filter((p) => p.id == id)[0];
}

export async function addExercise(exercise: Exercise): Promise<Exercise> {
    console.log(">> services.stores.memory.addExercise content:", { exercise });
    
    // console.log('>> services.stores.memory.addExercise(): waiting...');
    // await new Promise((resolve) => setTimeout(() => resolve(42), 1000));
    // console.log('>> services.stores.memory.getExercise(): done waiting!');

    exercise.status = "created";
    inMemoryExercises.push(exercise);
    return exercise;
}

export async function editExercise(exercise: Exercise): Promise<Exercise> {
    console.log(">> services.stores.memory.editExercise exercise:", exercise);

    if (!exercise.id) {
        throw `Cannot delete exercise with null id`;
    } 

    const exercises = inMemoryExercises.filter((p: Exercise) => p.id != exercise.id);
    exercises.push(exercise);
    inMemoryExercises = exercises;
    return exercise;
}

export async function deleteExercise(id: string): Promise<void> {
    console.log(">> services.stores.memory.deleteExercise id:", id);

    if (!id) {
        throw `Cannot delete exercise with null id`;
    }
    
    const exercises = inMemoryExercises.filter((p: Exercise) => p.id != id);
    inMemoryExercises = exercises;
}
