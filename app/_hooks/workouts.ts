import { User } from 'firebase/auth';
import moment from 'moment';
import { create } from 'zustand'
import { devtools } from 'zustand/middleware'
import { Workout, WorkoutSession, WorkoutSet } from '@/types/Workout';
import { Exercise } from '@/types/Exercise';
import { arrayToObject, uuid } from '@/utils/misc';
import trackEvent from '@/utils/trackEvent';
import { byCreatedAtDesc } from '@/utils/sort';
import useAlert from "./alert";
import useExercises from "./exercises";

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
    sessions: [...sessions, newSession],
    sessionsLoaded: [...get().sessionsLoaded || [], newSession.id],
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
    // remove previous session and replace with saved session
    const filteredSessions = sessions.filter((session: WorkoutSession) => session.id != sessionId);
    set({ sessions: [...filteredSessions, savedSession] });

    if (callback) {
      callback(savedSession);
    }
  });
}

// TODO deduplicate from exercise service
const pickFromRange = (range: any, level?: "beginner" | "intermediate" | "advanced") => {
  return Array.isArray(range) && range.length > 1
    ? level == "beginner"
      ? range[0]
      : level == "advanced"
        ? range[1]
        : Math.floor((Number(range[0]) + Number(range[1])) / 2)
    : range;
}

const useWorkouts: any = create(devtools((set: any, get: any) => ({
  workouts: [],
  deletedWorkouts: [], // to smooth out visual glitches when deleting
  updatedWorkouts: [],
  sessions: [],
  deletedSessions: [], // to smooth out visual glitches when deleting
  loaded: undefined,
  sessionsLoaded: undefined,

  load: async (query?: any) => {
    const id = query?.id
    // console.log(">> hooks.workout.load", { id });

    // rest api (optimistic: all or just the one)
    if (id) {
      fetch(`/api/workouts/${id}`).then(async (res) => {
        if (res.status != 200) {
          useAlert.getState().error(`Error fetching workout ${id}: ${res.status} (${res.statusText})`);
          set({ loaded: [...get().loaded || [], id] });
          return;
        }

        const data = await res.json();
        // console.log(">> hooks.workout.get: RETURNED FROM FETCH, returning!");
        const workout = data.workout;
        const workouts = get().workouts.filter((workout: Workout) => workout.id != id);
        set({
          workouts: [...workouts, workout],
          loaded: [...get().loaded || [], id]
        });
      });
    } else {
      let [q, v] = query && Object.entries(query)[0] || [];
      fetch(`/api/workouts${q ? `?${q}=${v}` : ""}`).then(async (res) => {
        if (res.status != 200) {
          useAlert.getState().error(`Error fetching workouts: ${res.status} (${res.statusText})`);
          set({ loaded: [...get().loaded || []] });
          return;
        }

        const data = await res.json();
        const deleted = get().deletedWorkouts.map((workout: Workout) => workout.id);
        const workouts = data.workouts.filter((workout: Workout) => !deleted.includes(workout.id));
        set({
          workouts,
          loaded: [...get().loaded || [], ...workouts.map((workout: Workout) => workout.id)],
        });
      });
    }
  },

  loadSessions: async (workoutId: string, sessionId?: string) => {
    // console.log(">> hooks.workout.loadSessions", { workoutId, sessionId });

    if (!workoutId) {
      throw `Unable to load sessions with no workoutId`;
    }

    if (sessionId) {
      fetch(`/api/workouts/${workoutId}/sessions/${sessionId}`).then(async (res) => {
        if (res.status != 200) {
          useAlert.getState().error(`Error fetching workout session ${sessionId}: ${res.status} (${res.statusText})`);
          set({ sessionsLoaded: [...get().sessionsLoaded || [], sessionId] });
          return;
        }

        const data = await res.json();
        const session = data.session;
        const sessions = get().sessions.filter((session: WorkoutSession) => session.id != sessionId);
        set({
          sessions: [...sessions, session],
          sessionsLoaded: [...get().sessionsLoaded || [], session.id],
        });
      });
    } else {
      fetch(`/api/workouts/${workoutId}/sessions`).then(async (res) => {
        if (res.status != 200) {
          useAlert.getState().error(`Error fetching workout sessions: ${res.status} (${res.statusText})`);
          return;
        }

        const data = await res.json();
        const deleted = get().deletedSessions.map((session: WorkoutSession) => session.id);
        const sessions = data.sessions.filter((session: WorkoutSession) => !deleted.includes(session.id));
        set({
          sessions,
          sessionsLoaded: [...get().sessionsLoaded || [], ...sessions.map((s: WorkoutSession) => s.id)],
        });
      });
    }
  },

  createWorkout: async (user: User, name: string, exerciseNames: string) => {
    // console.log(">> hooks.workout.createWorkout", { name });

    // optimistic
    const tempId = uuid();
    const workout = {
      id: tempId,
      createdBy: user.uid,
      createdAt: moment().valueOf(),
      status: "creating",
      name,
      optimistic: true,
    }
    set({
      workouts: [...get().workouts, workout],
      loaded: [...get().workouts || [], workout.id],
    });

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

    return new Promise((resolve, reject) => {
      fetch('/api/workouts', {
        method: "POST",
        body: JSON.stringify({ name, exercises: exerciseNames }),
      }).then(async (res) => {
        if (res.status != 200) {
          useAlert.getState().error(`Error adding workout: ${res.status} (${res.statusText})`);
          const workouts = get().workouts.filter((workout: Workout) => workout.id != tempId);
          set({ workouts });
          return reject(res.statusText);
        }

        const data = await res.json();
        const workout = data.workout;

        trackEvent("workout-created", {
          id: workout.id,
          name: workout.name,
          createdBy: workout.createdBy,
        });

        // remove optimistic
        const workouts = get().workouts.filter((workout: Workout) => workout.id != tempId);
        set({ workouts: [...workouts, workout] });
        return resolve(workout);
      });
    });
  },

  generateWorkout: async (user: User, name: string, parameters: []) => {
    // console.log(">> hooks.workout.generateWorkout", { name, parameters });

    // optimistic
    const tempId = uuid();
    const workout = {
      id: tempId,
      createdBy: user.uid,
      createdAt: moment().valueOf(),
      status: "generating",
      name,
      optimistic: true,
    }
    set({
      workouts: [...get().workouts, workout],
      loaded: [...get().workouts || [], workout.id],
    });

    return new Promise((resolve, reject) => {
      fetch('/api/workouts/generate', {
        method: "POST",
        body: JSON.stringify({ name, parameters }),
      }).then(async (res) => {
        if (res.status != 200) {
          useAlert.getState().error(`Error generating workout: ${res.status} (${res.statusText})`);
          const workouts = get().workouts.filter((workout: Workout) => workout.id != tempId);
          set({ workouts });
          return reject(res.statusText);
        }

        const data = await res.json();
        // console.log(">> hooks.workout.generateWorkout", { data });
        const workout = data.workout;

        trackEvent("workout-generated", {
          id: workout.id,
          name: workout.name,
          createdBy: workout.createdBy,
        });

        // remove optimistic
        const workouts = get().workouts.filter((workout: Workout) => workout.id != tempId);
        set({ workouts: [...workouts, workout] });
        return resolve(workout);
      });
    })
  },

  updateWorkoutAddExercise: async (user: User, workout: Workout, exerciseNames: string) => {
    // console.log(">> hooks.workout.addExercise", { workout, exerciseNames });

    // start by adding a "loading" stub

    const exercises = exerciseNames
      .split(/\s*,\s*/)
      .map((name: string) => {
        return {
          // id: uuid(),
          name: name.toLowerCase(),
          status: "loading",
        }
      });

    workout.exercises = [
      ...workout.exercises || [],
      ...exercises,
    ];

    get().updateWorkout(user, workout);

    // next resolve exercise with existing or create a new one

    return new Promise(async (resolve, reject) => {
      // console.debug("loading exercises", { exercises: workout.exercises })
      if (!useExercises.getState().loadedAll) {
        await useExercises.getState().load();
      }
      // console.debug("loading exercises load completed", { exercises: useExercises.getState().exercises })

      const exerciseMap = arrayToObject(useExercises.getState().exercises
        .map((e: Exercise) => [e.name.toLowerCase(), e]));

      // console.debug("loading exercises", { exerciseMap })

      (workout.exercises || [])
        .filter((e: Exercise) => !e.id) // non-resolved should not have an id (id this one was not added just now)
        .forEach((e: Exercise) => {
          // console.debug("loading exercises resolving exercises", { e })
          const found = exerciseMap[e.name.toLowerCase()];
          // exists
          if (found) {
            console.debug("loading exercises found exercise", { found });
            e.id = found.id;
            e.name = found.name;
            e.status = found.status;
            e.directions = {
              duration: pickFromRange(found.directions?.duration),
              sets: pickFromRange(found.directions?.sets),
              reps: pickFromRange(found.directions?.reps),
            };

            return e;
          }

          // does not exist: create and update when done; return generating stub
          // console.debug("loading exercises creating exercise", { e });
          useExercises.getState().createExercise(user, e.name).then((created: Exercise) => {
            e.id = created.id;
            e.name = created.name;
            e.status = "generating";
            get().updateWorkout(user, workout);

            useExercises.getState().generateExercise(user, e).then((generated: Exercise) => {
              e.status = generated.status;
              e.directions = {
                duration: pickFromRange(generated.directions?.duration),
                sets: pickFromRange(generated.directions?.sets),
                reps: pickFromRange(generated.directions?.reps),
              };
              get().updateWorkout(user, workout);
            });
          });

          e.status = "creating";
        });

      get().updateWorkout(user, workout);
      return resolve(workout);
    });
  },

  updateWorkout: async (user: User, workout: Workout, remove?: boolean) => {
    // console.log(">> hooks.workout.updateWorkout", { workout });

    if (remove) {
      set({
        updatedWorkouts: get().updatedWorkouts.filter((w: Workout) => w.id != workout.id),
      });
    } else {
      const workouts = get().updatedWorkouts.filter((w: Workout) => w.id != workout.id);
      set({ updatedWorkouts: [...workouts, { ...workout, status: "updated" }] });
      return workout;
    }
  },

  saveWorkout: async (user: User, workout: Workout) => {
    // console.log(">> hooks.workout.saveWorkout", { workout });

    // optimistic
    workout.status = "saving";
    const workouts = get().workouts.filter((e: Workout) => e.id != workout.id);
    set({ workouts: [...workouts, workout] });

    return new Promise((resolve, reject) => {
      fetch(`/api/workouts/${workout.id}`, {
        method: "PUT",
        body: JSON.stringify({ workout }),
      }).then(async (res) => {
        if (res.status != 200) {
          useAlert.getState().error(`Error saving workout: ${res.status} (${res.statusText})`);
          const workouts = get().workouts.filter((w: Workout) => w.id != workout.id);
          set({ workouts });
          return reject(res.statusText);
        }

        const data = await res.json();
        const workout = data.workout;

        trackEvent("workout-saved", {
          id: workout.id,
          name: workout.name,
          createdBy: workout.createdBy,
        });

        // replace optimistic 
        const workouts = get().workouts.filter((w: Workout) => w.id != workout.id);
        set({ workouts: [...workouts, workout] });
        return resolve(workout);
      });
    });
  },

  deleteWorkout: async (id: string) => {
    // console.log(">> hooks.workout.deleteWorkout id:", id);

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
    // console.log(">> hooks.workout.startSession", { user, id });

    if (!id) {
      throw `Cannot create workout session with null id`;
    }

    const { workouts } = get();
    const workout = workouts.filter((workout: Workout) => workout.id == id)[0]
    const session = {
      id: uuid(),
      createdBy: user.uid,
      createdAt: moment().valueOf(),
      status: "creating",
      workout,
      sets: [],
    };

    fetchSession("POST", get, set, session, (newSession: WorkoutSession) => {
      // console.log(">> hooks.workout.startSession fetch callback", { newSession });

      trackEvent("workout-session-started", {
        id: newSession.id,
        workoutId: workout.id,
        workoutName: workout.name,
        createdBy: newSession.createdBy,
      });

      const firstExercise = newSession.workout?.exercises && newSession.workout?.exercises[0];
      get().startSet(user, id, newSession.id, firstExercise, 0);
    });

    return session;
  },

  completeSession: async (user: User, id: string) => {
    // console.log(">> hooks.workout.stopSession", { user, id });

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

    fetchSession("PUT", get, set, session, (updatedSession: WorkoutSession) => {
      trackEvent("workout-session-completed", {
        id: updatedSession.id,
        workoutId: updatedSession.workout?.id,
        workoutName: updatedSession.workout?.name,
        createdBy: updatedSession.createdBy,
      });
    });

    return session;
  },

  stopSession: async (user: User, id: string) => {
    // console.log(">> hooks.workout.stopSession", { user, id });

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
    // console.log(">> hooks.workout.resumeSession", { user, id });

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

    // console.log(">> hooks.workout.resumeSession", { sessionSet });

    sessionSet.startedAt = moment().valueOf();
    sessionSet.stoppedAt = 0;
    sessionSet.status = "started";
    session.status = "started";

    // console.log(">> hooks.workout.resumeSession", { session });

    fetchSession("PUT", get, set, session);

    return session;
  },

  deleteSession: async (user: any, id: string) => {
    // console.log(">> hooks.workout.deleteSession id:", id);

    if (!id) {
      throw `Cannot delete workout session with null id`;
    }

    const { sessions, deletedSessions } = get();
    const session = sessions.filter((session: WorkoutSession) => session.id = id)[0];

    // optimistic
    set({
      sessions: sessions.filter((session: WorkoutSession) => session.id != id),
      deletedSessions: [...deletedSessions, session],
    });

    fetch(`/api/workouts/${session.workout.id}/sessions/${id}`, {
      method: "DELETE",
    }).then(async (res) => {
      if (res.status != 200) {
        useAlert.getState().error(`Error deleting workout session ${id}: ${res.status} (${res.statusText})`);
        set({ sessions, deletedSessions });
        return;
      }

      set({ deletedSessions: deletedSessions.filter((session: WorkoutSession) => session.id == id) });
    });
  },

  startSet: async (user: User, workoutId: string, sessionId: string, exercise: Exercise, offset: number) => {
    const exerciseId = exercise.id;
    const exerciseName = exercise.name;
    // console.log(">> hooks.workout.startSet", { user, workoutId, sessionId, exerciseId, offset });

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
      id: uuid(),
      createdBy: user.uid,
      createdAt: moment().valueOf(),
      startedAt: moment().valueOf(),
      status: "started",
      exercise: { id: exerciseId, name: exerciseName },
      offset,
    };

    session.status = "started";
    session.sets.push(sessionSet);

    fetchSession("PUT", get, set, session);

    return session;
  },
})));

export default useWorkouts;
