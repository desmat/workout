import { User } from 'firebase/auth';
import moment from 'moment';
import { create } from 'zustand'
import { devtools } from 'zustand/middleware'
import { Workout, WorkoutSession, WorkoutSet } from '@/types/Workout';
import { Exercise } from '@/types/Exercise';
import { byCreatedAtDesc } from '@/utils/sort';

const stopSet = (session: WorkoutSession, status = "stopped") => {
  const sets = session.sets && session.sets.filter((set: WorkoutSet) => set.status == "started");

  // console.log(">> hooks.workout.stopSet", { sets });

  sets && sets.forEach((set: WorkoutSet) => {
    // console.log(">> hooks.workout.stopSet", { set });
    set.stoppedAt = moment().valueOf();
    set.duration = (set.duration || 0) + set.stoppedAt - (set?.startedAt || 0);
    set.startedAt = 0;
    set.status = status;
  });

  return session;
}

const useWorkouts: any = create(devtools((set: any, get: any) => ({
  workouts: [],
  deletedWorkouts: [], // to smooth out visual glitches when deleting
  sessions: [],
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

  startSession: async (user: User, id: string) => {
    console.log(">> hooks.workout.startSession", { user, id });

    if (!id) {
      throw `Cannot create workout session with null id`;
    }

    const { workouts, sessions } = get();
    const workout = workouts.filter((workout: Workout) => workout.id == id)[0]
    const tempId = crypto.randomUUID();
    const session = {
      id: tempId,
      createdBy: user.uid,
      createdAt: moment().valueOf(),
      // status: "creating",
      status: "created", // TODO: hook up with backend and remove
      workout,
      sets: [],
    };

    // optimistic
    set({
      sessions: [...sessions, session]
    });

    // fetch(`/api/workouts/${id}/sessions`, {
    //   method: "POST",
    //   body: JSON.stringify({ session }),
    // }).then(async (res) => {
    //   if (res.status != 200) {
    //     console.error(`Error creating workout session: ${res.status} (${res.statusText})`);

    //     // TODO revert

    //     return;
    //   }

    //   const data = await res.json();
    //   const session = data.session;
    //   // remove optimistic post
    //   const sessions = get().sessions.filter((session: WorkoutSession) => session.id != tempId);
    //   set({ sessions: [...sessions, session] });
    // });

    return session;
  },

  completeSession: async (user: User, id: string) => {
    console.log(">> hooks.workout.stopSession", { user, id });

    if (!id) {
      throw `Cannot complete workout session with null id`;
    }

    const { workouts, sessions } = get();
    let session = sessions.filter((session: WorkoutSession) => session.id == id)[0]

    if (!session) {
      throw `Session not found: ${id}`;
    }

    session = stopSet(session, "completed");
    session.status = "completed";

    // optimistic
    set({
      sessions: [...sessions.filter((s: WorkoutSession) => s.id != session.id), session]
    });

    // fetch(`/api/workouts/${session.workout.id}/sessions/${id}`, {
    //   method: "PUT",
    //   body: JSON.stringify({ session }),
    // }).then(async (res) => {
    //   if (res.status != 200) {
    //     console.error(`Error saving workout session: ${res.status} (${res.statusText})`);

    //     // TODO revert

    //     return;
    //   }

    //   const data = await res.json();
    //   const session = data.session;
    //   // remove optimistic post
    //   const sessions = get().sessions.filter((session: WorkoutSession) => session.id != tempId);
    //   set({ sessions: [...sessions, session] });
    // });

    return session;
  },

  stopSession: async (user: User, id: string) => {
    console.log(">> hooks.workout.stopSession", { user, id });

    if (!id) {
      throw `Cannot stop workout session with null id`;
    }

    const { workouts, sessions } = get();
    let session = sessions.filter((session: WorkoutSession) => session.id == id)[0]

    if (!session) {
      throw `Session not found: ${id}`;
    }

    session = stopSet(session);
    session.status = "stopped";

    // optimistic
    set({
      sessions: [...sessions.filter((s: WorkoutSession) => s.id != session.id), session]
    });

    // fetch(`/api/workouts/${session.workout.id}/sessions/${id}`, {
    //   method: "PUT",
    //   body: JSON.stringify({ session }),
    // }).then(async (res) => {
    //   if (res.status != 200) {
    //     console.error(`Error saving workout session: ${res.status} (${res.statusText})`);

    //     // TODO revert

    //     return;
    //   }

    //   const data = await res.json();
    //   const session = data.session;
    //   // remove optimistic post
    //   const sessions = get().sessions.filter((session: WorkoutSession) => session.id != tempId);
    //   set({ sessions: [...sessions, session] });
    // });

    return session;
  },

  resumeSession: async (user: User, id: string) => {
    console.log(">> hooks.workout.resumeSession", { user, id });

    if (!id) {
      throw `Cannot resume workout session with null id`;
    }

    const { workouts, sessions } = get();
    let session = sessions.filter((session: WorkoutSession) => session.id == id)[0]

    if (!session) {
      throw `Session not found: ${id}`;
    }

    if (session.status != "stopped") {
      throw `Unable to resume session: state was not "stopped": ${id}`;
    }

    const sessionSet = session.sets.sort(byCreatedAtDesc)[0];

    if (!sessionSet) {
      throw `Unable to resume session: no set found: ${id}`;
    }

    console.log(">> hooks.workout.resumeSession", { sessionSet });

    sessionSet.startedAt = moment().valueOf();
    sessionSet.stoppedAt = 0;
    sessionSet.status = "started";
    session.status = "started";

    console.log(">> hooks.workout.resumeSession", { session });

    // optimistic
    set({
      sessions: [...sessions.filter((s: WorkoutSession) => s.id != session.id), session]
    });

    // fetch(`/api/workouts/${session.workout.id}/sessions/${id}`, {
    //   method: "PUT",
    //   body: JSON.stringify({ session }),
    // }).then(async (res) => {
    //   if (res.status != 200) {
    //     console.error(`Error saving workout session: ${res.status} (${res.statusText})`);

    //     // TODO revert

    //     return;
    //   }

    //   const data = await res.json();
    //   const session = data.session;
    //   // remove optimistic post
    //   const sessions = get().sessions.filter((session: WorkoutSession) => session.id != tempId);
    //   set({ sessions: [...sessions, session] });
    // });

    return session;
  },

  startSet: async (user: User, workoutId: string, sessionId: string, exercise: Exercise) => {
    const exerciseId = exercise.id;
    const exerciseName = exercise.name;
    console.log(">> hooks.workout.startSet", { user, workoutId, sessionId, exerciseId });

    if (!workoutId || !sessionId || !exerciseId) {
      throw `Cannot create workout set with null id`;
    }

    const { workouts, sessions } = get();
    const workout = workouts.filter((workout: Workout) => workout.id == workoutId)[0]
    let session = sessions.filter((session: WorkoutSession) => session.id == sessionId)[0]

    if (!session) {
      throw `Workout Session not found: ${sessionId}`;
    }

    // const lastSet = session.sets && session.sets[session.sets.length - 1];

    // if (lastSet && lastSet && lastSet.status == "started") {
    session = stopSet(session, "completed");
    // }

    const tempId = crypto.randomUUID();
    const sessionSet = {
      id: tempId,
      createdBy: user.uid,
      createdAt: moment().valueOf(),
      startedAt: moment().valueOf(),
      // status: "creating",
      status: "started", // TODO: hook up with backend and remove
      exercise: { id: exerciseId, name: exerciseName },
      // duration?: number,
      // reps?: number,
    };

    session.status = "started";
    session.sets.push(sessionSet);

    // optimistic
    set({
      sessions: [...sessions.filter((session: WorkoutSession) => session.id != sessionId), session]
    });

    // fetch(`/api/workouts/${id}/sessions/%{sessionId}/set`, {
    //   method: "POST",
    //   body: JSON.stringify({ set }),
    // }).then(async (res) => {
    //   if (res.status != 200) {
    //     console.error(`Error creating workout session set: ${res.status} (${res.statusText})`);

    //     // TODO revert

    //     return;
    //   }

    //   const data = await res.json();
    //   const set = data.set;
    //   const session = data.session;
    //   // remove optimistic post
    //   const sessions = get().sessions.filter((session: WorkoutSession) => session.id != tempId);
    //   set({ sessions: [...sessions, session] });
    // });

    return session;
  },

  completeSet: async (user: User, sessionId: string, setId: string) => {
    console.log(">> hooks.workout.completeSet", { user, sessionId, setId });

    if (!sessionId || setId) {
      throw `Cannot complete workout set with null id`;
    }

    const { workouts, sessions } = get();
    let session = sessions.filter((session: WorkoutSession) => session.id == sessionId)[0]

    if (!session) {
      throw `Session not found: ${sessionId}`;
    }

    session = stopSet(session, "completed");

    // optimistic
    set({
      sessions: [...sessions.filter((session: WorkoutSession) => session.id != sessionId), session]
    });

    // fetch(`/api/workouts/${session.workout.id}/sessions/${id}`, {
    //   method: "PUT",
    //   body: JSON.stringify({ session }),
    // }).then(async (res) => {
    //   if (res.status != 200) {
    //     console.error(`Error saving workout session: ${res.status} (${res.statusText})`);

    //     // TODO revert

    //     return;
    //   }

    //   const data = await res.json();
    //   const session = data.session;
    //   // remove optimistic post
    //   const sessions = get().sessions.filter((session: WorkoutSession) => session.id != tempId);
    //   set({ sessions: [...sessions, session] });
    // });

    return session;
  },
})));

export default useWorkouts;
