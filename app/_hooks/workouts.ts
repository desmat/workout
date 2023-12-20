import { User } from 'firebase/auth';
import moment from 'moment';
import { create } from 'zustand'
import { devtools } from 'zustand/middleware'
import { Workout, WorkoutSession, WorkoutSet } from '@/types/Workout';
import { Exercise } from '@/types/Exercise';
import { byCreatedAtDesc } from '@/utils/sort';
import useAlert from "./alert";

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

const fetchSession = (putOrPost: "PUT" | "POST", get: any, set: any, newSession: WorkoutSession, callback?: any) => {
  const workoutId = newSession.workout.id;
  const sessionId = newSession.id;
  const url = putOrPost == "PUT"
    ? `/api/workouts/${workoutId}/sessions/${sessionId}`
    : `/api/workouts/${workoutId}/sessions`
  const { sessions, session } = get();

  // optimistic
  set({
    sessions: [...sessions, newSession]
  });

  fetch(url, {
    method: putOrPost,
    body: JSON.stringify(newSession),
  }).then(async (res) => {
    if (res.status != 200) {
      useAlert.getState().error(`Error ${putOrPost == "PUT" ? "saving" : "creating"} workout session set: ${res.status} (${res.statusText})`);

      // revert optimistic 
      const filteredSessions = sessions.filter((session: WorkoutSession) => session?.id != sessionId);
      set({ sessions: [...filteredSessions, session] });
      return;
    }

    const data = await res.json();
    const savedSession = data.session;
    // remove previous session
    const filteredSessions = sessions.filter((session: WorkoutSession) => session.id != sessionId);
    set({ sessions: [...filteredSessions, savedSession] });

    if (callback) {
      callback(savedSession);
    }
  });
}

const useWorkouts: any = create(devtools((set: any, get: any) => ({
  workouts: [],
  deletedWorkouts: [], // to smooth out visual glitches when deleting
  sessions: [],
  loaded: false,
  sessionsLoaded: {},

  load: async (id?: string) => {
    console.log(">> hooks.workout.load", { id });

    // rest api (optimistic: all or just the one)
    if (id) {
      fetch(`/api/workouts/${id}`).then(async (res) => {
        if (res.status != 200) {
          useAlert.getState().error(`Error fetching workout ${id}: ${res.status} (${res.statusText})`);
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
          useAlert.getState().error(`Error fetching workouts: ${res.status} (${res.statusText})`);
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

  loadSessions: async (workoutId: string, sessionId?: string) => {
    console.log(">> hooks.workout.loadSessions", { workoutId, sessionId });

    if (!workoutId) {
      throw `Unable to load sessions with no workoutId`;
    }

    // rest api (optimistic: all or just the one)
    if (sessionId) {
      fetch(`/api/workouts/${workoutId}/sessions/${sessionId}`).then(async (res) => {
        if (res.status != 200) {
          useAlert.getState().error(`Error fetching workout session ${sessionId}: ${res.status} (${res.statusText})`);
          set({ loaded: true });
          return;
        }

        const data = await res.json();
        // console.log(">> hooks.workout.get: RETURNED FROM FETCH, returning!");
        const sessions = data.sessions;
        const session = get().sessions.filter((session: WorkoutSession) => session.id != sessionId);
        set({ sessions: [...sessions, session], sessionsLoaded: true });
      });
    } else {
      fetch(`/api/workouts/${workoutId}/sessions`).then(async (res) => {
        if (res.status != 200) {
          useAlert.getState().error(`Error fetching workout sessions: ${res.status} (${res.statusText})`);
          return;
        }

        const data = await res.json();
        const sessions = data.sessions;
        set({ sessions, sessionsLoaded: true });
      });
    }
  },

  createWorkout: async (user: User, name: string, exerciseNames: string) => {
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

    // check if some of the exercises haven't been created yet: if so change status since we'll be generating those

    fetch('/api/exercises', {
      method: "GET",
    }).then(async (res) => {
      if (res.status != 200) {
        useAlert.getState().error(`Error adding workout: error fetching existing exercises: ${res.status} (${res.statusText})`);
        return;
      }

      const data = await res.json();
      const existingExerciseNames = data.exercises.map((e: Exercise) => e.name.toLowerCase());
      const nonExistingExercisesNames = exerciseNames
        .split(/\s*,\s*/)
        .map((name: string) => name.toLowerCase())
        .filter((name: string) => !existingExerciseNames.includes(name));

      // update optimistic 
      if (nonExistingExercisesNames.length > 0) {
        workout.status = "generating";
        const workouts = get().workouts.filter((workout: Workout) => workout.id != tempId);
        set({ workouts: [...workouts, workout] });
      }
    });

    // create the workout

    fetch('/api/workouts', {
      method: "POST",
      body: JSON.stringify({ name, exercises: exerciseNames }),
    }).then(async (res) => {
      if (res.status != 200) {
        useAlert.getState().error(`Error adding workout: ${res.status} (${res.statusText})`);
        const workouts = get().workouts.filter((workout: Workout) => workout.id != tempId);
        set({ workouts });
        return;
      }

      const data = await res.json();
      const workout = data.workout;
      // remove optimistic
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
        useAlert.getState().error(`Error deleting workouts ${id}: ${res.status} (${res.statusText})`);
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

    const { workouts } = get();
    const workout = workouts.filter((workout: Workout) => workout.id == id)[0]
    const session = {
      id: crypto.randomUUID(),
      createdBy: user.uid,
      createdAt: moment().valueOf(),
      status: "creating",
      workout,
      sets: [],
    };

    fetchSession("POST", get, set, session, (newSession: WorkoutSession) => {
      console.log(">> hooks.workout.startSession fetch callback", { newSession });
      const firstExercise = newSession.workout?.exercises && newSession.workout?.exercises[0]
      get().startSet(user, id, newSession.id, firstExercise);
    });

    return session;
  },

  completeSession: async (user: User, id: string) => {
    console.log(">> hooks.workout.stopSession", { user, id });

    if (!id) {
      throw `Cannot complete workout session with null id`;
    }

    const { sessions } = get();
    let session = sessions.filter((session: WorkoutSession) => session.id == id)[0]

    if (!session) {
      throw `Session not found: ${id}`;
    }

    session = stopSet(session, "completed");
    session.status = "completed";

    fetchSession("PUT", get, set, session);

    return session;
  },

  stopSession: async (user: User, id: string) => {
    console.log(">> hooks.workout.stopSession", { user, id });

    if (!id) {
      throw `Cannot stop workout session with null id`;
    }

    const { sessions } = get();
    let session = sessions.filter((session: WorkoutSession) => session.id == id)[0]

    if (!session) {
      throw `Session not found: ${id}`;
    }

    session = stopSet(session);
    session.status = "stopped";

    fetchSession("PUT", get, set, session);

    return session;
  },

  resumeSession: async (user: User, id: string) => {
    console.log(">> hooks.workout.resumeSession", { user, id });

    if (!id) {
      throw `Cannot resume workout session with null id`;
    }

    const { sessions } = get();
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

    fetchSession("PUT", get, set, session);

    return session;
  },

  startSet: async (user: User, workoutId: string, sessionId: string, exercise: Exercise) => {
    const exerciseId = exercise.id;
    const exerciseName = exercise.name;
    console.log(">> hooks.workout.startSet", { user, workoutId, sessionId, exerciseId });

    if (!workoutId || !sessionId || !exerciseId) {
      throw `Cannot create workout set with null id`;
    }

    const { sessions } = get();
    let session = sessions.filter((session: WorkoutSession) => session?.id == sessionId)[0]

    if (!session) {
      throw `Workout Session not found: ${sessionId}`;
    }

    session = stopSet(session, "completed");

    const sessionSet = {
      id: crypto.randomUUID(),
      createdBy: user.uid,
      createdAt: moment().valueOf(),
      startedAt: moment().valueOf(),
      status: "started",
      exercise: { id: exerciseId, name: exerciseName },
    };

    session.status = "started";
    session.sets.push(sessionSet);

    fetchSession("PUT", get, set, session);

    return session;
  },
})));

export default useWorkouts;
