import { User } from 'firebase/auth';
import moment from 'moment';
import { create } from 'zustand'
import { devtools } from 'zustand/middleware'
import { Exercise } from '@/types/Exercise';

const useExercises: any = create(devtools((set: any, get: any) => ({
  exercises: [],
  deletedExercises: [], // to smooth out visual glitches when deleting
  loaded: false,
  error: "",

  load: async (id?: string) => {
    console.log(">> hooks.exercise.load", { id });

    // rest api (optimistic: all or just the one)
    if (id) {
      fetch(`/api/exercises/${id}`).then(async (res) => {
        if (res.status != 200) {
          console.error(`Error fetching exercise ${id}: ${res.status} (${res.statusText})`);
          set({ loaded: true });
          return;
        }

        const data = await res.json();
        // console.log(">> hooks.exercise.get: RETURNED FROM FETCH, returning!");
        const exercise = data.exercise;
        const exercises = get().exercises.filter((exercise: Exercise) => exercise.id != id);
        set({ exercises: [...exercises, exercise], loaded: true });
      });
    } else {
      fetch('/api/exercises').then(async (res) => {
        if (res.status != 200) {
          console.error(`Error fetching exercises: ${res.status} (${res.statusText})`);
          return;
        }

        const data = await res.json();
        const deleted = get().deletedExercises.map((exercise: Exercise) => exercise.id);
        set({
          exercises: data.exercises.filter((exercise: Exercise) => !deleted.includes(exercise.id)),
          loaded: true
        });
      });
    }
  },

  createExercise: async (user: User, name: string) => {
    console.log(">> hooks.exercise.createExercise", { name });

    // optimistic
    const tempId = crypto.randomUUID();
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

    fetch('/api/exercises', {
      method: "POST",
      body: JSON.stringify({ name }),
    }).then(async (res) => {
      if (res.status != 200) {
        console.error(`Error adding exercise: ${res.status} (${res.statusText})`);
        const exercises = get().exercises.filter((exercise: Exercise) => exercise.id != tempId);        
        set({ exercises, error: `Error adding exercise: ${res.status} (${res.statusText})` });
        return;
      }

      const data = await res.json();
      const exercise = data.exercise;
      // remove optimistic post
      const exercises = get().exercises.filter((exercise: Exercise) => exercise.id != tempId);
      set({ exercises: [...exercises, exercise] });
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
        console.error(`Error deleting exercises ${id}: ${res.status} (${res.statusText})`);
        set({ exercises, deletedExercises });
        return;
      }

      set({ deletedExercises: deletedExercises.filter((exercise: Exercise) => exercise.id == id) });
    });
  },
})));

export default useExercises;
