import { User } from 'firebase/auth';
import moment from 'moment';
import { create } from 'zustand'
import { devtools } from 'zustand/middleware'
import { Exercise } from '@/types/Exercise';
import { uuid } from '@/utils/misc';
import useAlert from "./alert";
import delay from '@/utils/delay';

const useExercises: any = create(devtools((set: any, get: any) => ({
  exercises: [],
  deletedExercises: [], // to smooth out visual glitches when deleting
  loaded: undefined,

  load: async (id?: string) => {
    console.log(">> hooks.exercise.load", { id });
await delay(3000);
    if (id) {
      fetch(`/api/exercises/${id}`).then(async (res) => {
        if (res.status != 200) {
          useAlert.getState().error(`Error fetching exercise ${id}: ${res.status} (${res.statusText})`);
          set({ loaded: true });
          return;
        }

        const data = await res.json();
        // console.log(">> hooks.exercise.get: RETURNED FROM FETCH, returning!");
        const exercise = data.exercise;
        const exercises = get().exercises.filter((exercise: Exercise) => exercise.id != id);
        set({ 
          exercises: [...exercises, exercise], 
          loaded: [...(get().loaded || []), exercise.id]
        });
      });
    } else {
      fetch('/api/exercises').then(async (res) => {
        if (res.status != 200) {
          useAlert.getState().error(`Error fetching exercises: ${res.status} (${res.statusText})`);
          return;
        }

        const data = await res.json();
        const deleted = get().deletedExercises.map((exercise: Exercise) => exercise.id);
        const exercises = data.exercises.filter((exercise: Exercise) => !deleted.includes(exercise.id));
        set({
          exercises,
          loaded: [...(get().loaded || []), ...exercises.map((e: Exercise) => e.id)],
        });
      });
    }
  },

  createExercise: async (user: User, name: string) => {
    console.log(">> hooks.exercise.createExercise", { name });

    // optimistic
    const tempId = uuid();
    const exercise = {
      id: tempId,
      createdBy: user.uid,
      createdAt: moment().valueOf(),
      // status: "generating",
      status: "creating",
      name,
      // prompt,
      // items: [],
      optimistic: true,
    }
    set({ exercises: [...get().exercises, exercise] });

    return new Promise((resolve, reject) => {
      fetch('/api/exercises', {
        method: "POST",
        body: JSON.stringify({ name }),
      }).then(async (res) => {
        if (res.status != 200) {
          useAlert.getState().error(`Error adding exercise: ${res.status} (${res.statusText})`);
          const exercises = get().exercises.filter((exercise: Exercise) => exercise.id != tempId);
          set({ exercises });
          return reject(res.statusText);
        }

        const data = await res.json();
        const exercise = data.exercise;
        // replace optimistic 
        const exercises = get().exercises.filter((exercise: Exercise) => exercise.id != tempId);
        set({ exercises: [...exercises, exercise] });
        return resolve(exercise);
      });
    });
  },

  saveExercise: async (user: User, exercise: Exercise) => {
    console.log(">> hooks.exercise.saveExercise", { exercise });

    // optimistic
    exercise.status = "saving";
    const exercises = get().exercises.filter((e: Exercise) => e.id != exercise.id);
    set({ exercises: [...exercises, exercise] });

    return new Promise((resolve, reject) => {
      fetch(`/api/exercises/${exercise.id}`, {
        method: "PUT",
        body: JSON.stringify({ exercise }),
      }).then(async (res) => {
        if (res.status != 200) {
          useAlert.getState().error(`Error saving exercise: ${res.status} (${res.statusText})`);
          const exercises = get().exercises.filter((e: Exercise) => e.id != exercise.id);
          set({ exercises });
          return reject(res.statusText);
        }

        const data = await res.json();
        const exercise = data.exercise;
        // replace optimistic 
        const exercises = get().exercises.filter((e: Exercise) => e.id != exercise.id);
        set({ exercises: [...exercises, exercise] });
        return resolve(exercise);
      });
    });
  },

  generateExercise: async (user: User, exercise: Exercise) => {
    console.log(">> hooks.exercise.generateExercise", { exercise });

    // optimistic
    exercise = {
      id: exercise.id,
      name: exercise.name,
      createdBy: exercise.createdBy,
      status: "generating",
    }
    const exercises = get().exercises.filter((e: Exercise) => e.id != exercise.id);
    set({ exercises: [...exercises, exercise] });

    return new Promise((resolve, reject) => {
      fetch(`/api/exercises/${exercise.id}/generate`, {
        method: "POST",
        body: JSON.stringify({ exercise }),
      }).then(async (res) => {
        if (res.status != 200) {
          useAlert.getState().error(`Error generating exercise: ${res.status} (${res.statusText})`);
          const exercises = get().exercises.filter((e: Exercise) => e.id != exercise.id);
          set({ exercises });
          return reject(res.statusText);
        }

        const data = await res.json();
        const updatedExercise = data.exercise as Exercise;
        // replace optimistic 
        const exercises = get().exercises.filter((e: Exercise) => e.id != exercise.id);
        set({ exercises: [...exercises, updatedExercise] });
        return resolve(updatedExercise);
      });
    });
  },

  deleteExercise: async (id: string) => {
    console.log(">> hooks.exercise.deleteExercise id:", id);

    if (!id) {
      throw `Cannot delete exercise with null id`;
    }

    const { exercises, deletedExercises } = get();

    // optimistic
    set({
      exercises: exercises.filter((exercise: Exercise) => exercise.id != id),
      deletedExercises: [...deletedExercises, exercises.filter((exercise: Exercise) => exercise.id == id)[0]],
    });

    fetch(`/api/exercises/${id}`, {
      method: "DELETE",
    }).then(async (res) => {
      if (res.status != 200) {
        useAlert.getState().error(`Error deleting exercises ${id}: ${res.status} (${res.statusText})`);
        set({ exercises, deletedExercises });
        return;
      }

      set({ deletedExercises: deletedExercises.filter((exercise: Exercise) => exercise.id == id) });
    });
  },
})));

export default useExercises;
