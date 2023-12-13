import { User } from 'firebase/auth';
import moment from 'moment';
import { create } from 'zustand'
import { devtools } from 'zustand/middleware'
import { Workout } from '@/types/Workout';

const useWorkouts: any = create(devtools((set: any, get: any) => ({
  workouts: [],
  deletedWorkouts: [], // to smooth out visual glitches when deleting
  loaded: false,

  load: async (id?: string) => {
    console.log(">> hooks.workout.load", { id });

    // rest api (optimistic: all or just the one)
    if (id) {
      fetch(`/api/workouts/${id}`).then(async (res) => {
        if (res.status != 200) {
          console.error(`Error fetching workout ${id}: ${res.status} (${res.statusText})`);
          set({ loaded: true });
          return;
        }

        const data = await res.json();
        // console.log(">> hooks.workout.get: RETURNED FROM FETCH, returning!");
        const workout = data.workout;
        const workouts = get().workouts.filter((workout: Workout) => workout.id != id);
        set({ workouts: [...workouts, workout], loaded: true });
      });
    } else {
      fetch('/api/workouts').then(async (res) => {
        if (res.status != 200) {
          console.error(`Error fetching workouts: ${res.status} (${res.statusText})`);
          return;
        }

        const data = await res.json();
        const deleted = get().deletedWorkouts.map((workout: Workout) => workout.id);
        set({
          workouts: data.workouts.filter((workout: Workout) => !deleted.includes(workout.id)),
          loaded: true
        });
      });
    }
  },

  createWorkout: async (user: User, name: string, exercises: string) => {
    console.log(">> hooks.workout.createWorkout", { name });

    // optimistic
    const tempId = crypto.randomUUID();
    const workout = {
      id: tempId,
      createdBy: user.uid,
      createdAt: moment().valueOf(),
      // status: "generating",
      status: "creating",
      name,
      optimistic: true,
    }
    set({ workouts: [...get().workouts, workout] });

    fetch('/api/workouts', {
      method: "POST",
      body: JSON.stringify({ name, exercises }),
    }).then(async (res) => {
      if (res.status != 200) {
        console.error(`Error adding workout: ${res.status} (${res.statusText})`);
        const workouts = get().workouts.filter((workout: Workout) => workout.id != tempId);        
        set({ workouts });
        return;
      }

      const data = await res.json();
      const workout = data.workout;
      // remove optimistic post
      const workouts = get().workouts.filter((workout: Workout) => workout.id != tempId);
      set({ workouts: [...workouts, workout] });
    });
  },

  deleteWorkout: async (id: string) => {
    console.log(">> hooks.workout.deleteWorkout id:", id);

    if (!id) {
      throw `Cannot delete workout with null id`;
    }

    const { workouts, deletedWorkouts } = get();

    // optimistic
    set({
      workouts: workouts.filter((workout: Workout) => workout.id != id),
      deletedWorkouts: [...deletedWorkouts, workouts.filter((workout: Workout) => workout.id == id)[0]],
    });

    fetch(`/api/workouts/${id}`, {
      method: "DELETE",
    }).then(async (res) => {
      if (res.status != 200) {
        console.error(`Error deleting workouts ${id}: ${res.status} (${res.statusText})`);
        set({ workouts, deletedWorkouts });
        return;
      }

      set({ deletedWorkouts: deletedWorkouts.filter((workout: Workout) => workout.id == id) });
    });
  },
})));

export default useWorkouts;
