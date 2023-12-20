// 'use server'

import moment from 'moment';
import { Exercise } from "@/types/Exercise";
import { sampleExercises, sampleWorkouts } from './samples';
import { Workout, WorkoutSession } from '@/types/Workout';

const memoryStore = {
    exercises: sampleExercises as Exercise[],
    workouts:  sampleWorkouts as Workout[],
    sessions: [{"id":"603ae73a-c6ee-4162-9523-f47b1ee8b37e","createdBy":"eDcD0gwTvFeJJQNlqHQv9vFV45i1","createdAt":1702592281111,"status":"started","workout":{"id":"0adba0e4-d5cd-4f29-bb62-1cceb10929bd","createdBy":"eDcD0gwTvFeJJQNlqHQv9vFV45i1","createdAt":1702585437125,"status":"created","name":"Test 1","exercises":[{"id":"0eea0e09-de1c-41db-b8e1-863be341658e","createdBy":"eDcD0gwTvFeJJQNlqHQv9vFV45i1","createdAt":1702585437126,"status":"created","name":"Pull ups"},{"id":"c1977455-36e8-4dc8-86c1-76f65e730fc2","createdBy":"eDcD0gwTvFeJJQNlqHQv9vFV45i1","createdAt":1702585437126,"status":"created","name":"Push ups"},{"id":"ba3883f5-e7fd-4b47-ac64-c3cd18f89420","createdBy":"eDcD0gwTvFeJJQNlqHQv9vFV45i1","createdAt":1702585437126,"status":"created","name":"sit ups"}]},"sets":[{"id":"73cc6639-74d4-4b3c-8bf1-1d68c47c5c4b","createdBy":"eDcD0gwTvFeJJQNlqHQv9vFV45i1","createdAt":1702592283278,"startedAt":1702592283278,"status":"started","exercise":{"id":"0eea0e09-de1c-41db-b8e1-863be341658e","name":"Pull ups"}}]}] as WorkoutSession[],
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
    
    exercise.status = "created";
    memoryStore.exercises.push(exercise);
    return exercise;
}

export async function saveExercise(exercise: Exercise): Promise<Exercise> {
    console.log(">> services.stores.memory.saveExercise:", { exercise });

    if (!exercise.id) {
        throw `Cannot save exercise with null id`;
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




//
// Workout Sessions
//

export async function getWorkoutSessions(): Promise<WorkoutSession[]> {
    console.log('>> services.stores.memory.getWorkoutSessions()');

    // console.log('>> services.stores.memory.getSessions(): waiting...');
    // await new Promise((resolve) => setTimeout(() => resolve(42), 500));
    // console.log('>> services.stores.memory.getSessions(): done waiting!');

    return memoryStore.sessions;
}

export async function getWorkoutSession(id: string): Promise<WorkoutSession | null> {
    console.log(`>> services.stores.memory.getWorkoutSession(${id})`);

    // console.log('>> services.stores.memory.getSession(): waiting...');
    // await new Promise((resolve) => setTimeout(() => resolve(42), 1000));
    // console.log('>> services.stores.memory.getSession(): done waiting!');

    return memoryStore.sessions.filter((p) => p.id == id)[0];
}

export async function addWorkoutSession(session: WorkoutSession): Promise<WorkoutSession> {
    console.log(">> services.stores.memory.addWorkoutSession", { session });
    
    // console.log('>> services.stores.memory.addSession(): waiting...');
    // await new Promise((resolve) => setTimeout(() => resolve(42), 1000));
    // console.log('>> services.stores.memory.getSession(): done waiting!');

    session.status = "created";
    memoryStore.sessions.push(session);
    console.log(">> services.stores.memory.addWorkoutSession", { sessions: memoryStore.sessions });
    return session;
}

export async function saveWorkoutSession(session: WorkoutSession): Promise<WorkoutSession> {
    console.log(">> services.stores.memory.saveWorkoutSession", { session });

    if (!session.id) {
        throw `Cannot save workout session with null id`;
    } 

    const sessions = memoryStore.sessions.filter((p: WorkoutSession) => p.id != session.id);
    sessions.push(session);
    memoryStore.sessions = sessions;
    console.log(">> services.stores.memory.saveWorkoutSession", { sessions: JSON.stringify(memoryStore.sessions) });
    return session;
}

export async function deleteWorkoutSession(id: string): Promise<void> {
    console.log(">> services.stores.memory.deleteWorkoutSession id:", id);

    if (!id) {
        throw `Cannot delete workout session with null id`;
    }
    
    const sessions = memoryStore.sessions.filter((p: WorkoutSession) => p.id != id);
    memoryStore.sessions = sessions;
}
