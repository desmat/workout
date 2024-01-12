import { User } from 'firebase/auth';
import moment from 'moment';
import { create } from 'zustand'
import { devtools } from 'zustand/middleware'
import { Workout, WorkoutSession, WorkoutSet } from '@/types/Workout';
import { listToMap, mapToList, mapToSearchParams, uuid } from '@/utils/misc';
import trackEvent from '@/utils/trackEvent';
import useAlert from "./alert";
import { Exercise } from '@/types/Exercise';
import useWorkouts from './workouts';
import { byCreatedAtDesc } from '@/utils/sort';

const stopSet = (session: WorkoutSession, status = "stopped") => {
  const sets = session.sets && session.sets.filter((set: WorkoutSet) => set.status == "started");
  // console.log(">> hooks.workoutSessions.stopSet", { sets });

  sets && sets.forEach((set: WorkoutSet) => {
    // console.log(">> hooks.workoutSessions.stopSet", { set });
    set.stoppedAt = moment().valueOf();
    set.duration = (set.duration || 0) + set.stoppedAt - (set?.startedAt || 0);
    set.startedAt = 0;
    set.status = status;
  });

  return session;
}

const fetchSession = (putOrPost: "PUT" | "POST", get: any, set: any, newSession: WorkoutSession, callback?: any) => {
  const { setLoaded, _workoutSessions } = get();
  const workoutId = newSession.workout.id;
  const sessionId = newSession.id;
  const url = putOrPost == "PUT"
    ? `/api/workouts/${workoutId}/sessions/${sessionId}`
    : `/api/workouts/${workoutId}/sessions`

  // optimistic
  setLoaded(newSession.id);
  set({
    _workoutSessions: { ..._workoutSessions, [newSession.id || ""]: newSession }
  });

  fetch(url, {
    method: putOrPost,
    body: JSON.stringify({ session: newSession }),
  }).then(async (res) => {
    const { _workoutSessions } = get();

    if (res.status != 200) {
      useAlert.getState().error(`Error ${putOrPost == "PUT" ? "saving" : "creating"} workout session set: ${res.status} (${res.statusText})`);

      // revert optimistic 
      set({
        _workoutSessions: { ..._workoutSessions, [newSession.id || ""]: undefined }
      });
      return;
    }

    const data = await res.json();
    const savedSession = data.session;
    // remove previous session and replace with saved session
    set({
      _workoutSessions: {
        ..._workoutSessions,
        [newSession.id || ""]: undefined,
        [savedSession.id || ""]: savedSession
      },
    });

    if (callback) {
      callback(savedSession);
    }
  });
}

type WorkoutSessionMap = { [key: string]: WorkoutSession | undefined; };
type StatusMap = { [key: string]: boolean };

const useWorkoutSessions: any = create(devtools((set: any, get: any) => ({

  // access via get(id) or find(query?)
  _workoutSessions: <WorkoutSessionMap>{},

  _modified: <WorkoutSessionMap>{},

  // to smooth out UX when deleting,
  _deleted: <StatusMap>{},

  // access via loaded(queryOrId?),
  // stored as id->bool or query->bool, 
  // where id refers to the loaded workoutSession 
  // and query is stringyfied json from loaded
  // list of workoutSessions
  _loaded: <StatusMap>{},

  get: (id: string, modified: boolean = false) => {
    return modified
      ? get()._modified[id]
      : get()._workoutSessions[id];
  },

  find: (query?: object) => {
    const { _workoutSessions, _deleted } = get();
    const [k, v] = Object.entries(query || {})[0] || [];

    return mapToList(_workoutSessions)
      .filter(Boolean)
      .filter((e: any) => !_deleted[e?.id])
      .filter((e: any) => !k || !v && !e[k] || v && e[k] == v);
  },

  loaded: (idOrQuery?: object | string) => {
    const { _loaded } = get();

    if (!idOrQuery) {
      return _loaded[JSON.stringify({})];
    }

    if (typeof (idOrQuery) == "string") {
      return _loaded[idOrQuery];
    }

    if (typeof (idOrQuery) == "object") {
      return _loaded[JSON.stringify(idOrQuery || {})];
    }
  },

  setLoaded: (entitiesOrQueryOrId: any, loaded: boolean = true) => {
    const { _loaded } = get();

    if (!entitiesOrQueryOrId) {
      return set({
        _loaded: {
          ..._loaded,
          [JSON.stringify({})]: loaded
        }
      });
    }

    if (Array.isArray(entitiesOrQueryOrId)) {
      return set({
        _loaded: {
          ..._loaded,
          ...listToMap(entitiesOrQueryOrId, { valFn: () => true })
        }
      });
    }

    if (typeof (entitiesOrQueryOrId) == "string") {
      return set({
        _loaded: {
          ..._loaded,
          [entitiesOrQueryOrId]: loaded,
        }
      });
    }

    if (typeof (entitiesOrQueryOrId) == "object") {
      return set({
        _loaded: {
          ..._loaded,
          [JSON.stringify(entitiesOrQueryOrId)]: loaded
        }
      });
    }
  },

  load: async (workoutId: string, sessionId?: string) => {
    const { setLoaded } = get();
    console.log(">> hooks.workoutSessionsSessions.load", { workoutId, sessionId });

    if (sessionId) {
      fetch(`/api/workouts/${workoutId}/sessions/${sessionId}`).then(async (res) => {
        const { _workoutSessions } = get();
        setLoaded(sessionId);

        if (res.status != 200) {
          useAlert.getState().error(`Error fetching workout session ${sessionId}: ${res.status} (${res.statusText})`);
          return;
        }

        const data = await res.json();
        const workoutSession = data.session;

        set({
          _workoutSessions: { ..._workoutSessions, [workoutSession.id]: workoutSession },
        });
      });
    } else {
      fetch(`/api/workouts/${workoutId}/sessions`).then(async (res) => {
        const { _workoutSessions } = get();
        setLoaded({ workoutId });

        if (res.status != 200) {
          useAlert.getState().error(`Error fetching workoutSessions: ${res.status} (${res.statusText})`);
          return;
        }

        const data = await res.json();
        const workoutSessions = data.sessions;

        setLoaded(workoutSessions);
        set({
          _workoutSessions: { ..._workoutSessions, ...listToMap(workoutSessions) }
        });
      });
    }
  },

  create: async (user: User, workout: Workout) => {
    // console.log(">> hooks.workoutSession.create", { name });
    const { _workoutSessions, setLoaded } = get();

    // optimistic
    const creating = {
      id: `interim-${uuid()}`,
      createdBy: user.uid,
      createdAt: moment().valueOf(),
      status: "creating",
      name,
      workout: { id: workout.id, name: workout.name },
      optimistic: true,
    }

    setLoaded(creating.id);
    set({
      _workoutSessions: { ..._workoutSessions, [creating.id]: creating },
    });

    return new Promise((resolve, reject) => {
      fetch(`/api/workouts/${workout.id}/sessions`, {
        method: "POST",
        body: JSON.stringify({ name }),
      }).then(async (res) => {
        const { _workoutSessions } = get();

        if (res.status != 200) {
          useAlert.getState().error(`Error adding workoutSession: ${res.status} (${res.statusText})`);
          set({
            _workoutSessions: { ..._workoutSessions, [creating.id]: undefined },
          });
          return reject(res.statusText);
        }

        const data = await res.json();
        const created = data.workoutSession;

        trackEvent("workout-session-created", {
          id: created.id,
          name: created.name,
          createdBy: created.createdBy,
        });

        // replace optimistic 
        setLoaded(creating.id, false);
        setLoaded(created.id);
        set({
          _workoutSessions: { ..._workoutSessions, [creating.id]: undefined, [created.id]: created },
        });
        return resolve(created);
      });
    });
  },

  update: async (user: User, workoutSession: WorkoutSession, remove?: boolean) => {
    console.log(">> hooks.workoutSessionsSessions.update", { workoutSession });
    const { _modified } = get();

    if (remove) {
      set({
        _modified: { ..._modified, [workoutSession.id || ""]: undefined }
      });
    } else {
      set({
        _modified: { ..._modified, [workoutSession.id || ""]: { ...workoutSession, status: "updated" } }
      });
      return workoutSession;
    }
  },

  save: async (user: User, workoutSession: WorkoutSession) => {
    // console.log(">> hooks.workoutSessionsSessions.save", { workoutSession });
    const { _workoutSessions, _modified } = get();

    // optimistic
    const saving = {
      ...workoutSession,
      status: "saving",
    };

    set({
      _modified: { ..._modified, [workoutSession.id || ""]: saving },
    });

    return new Promise((resolve, reject) => {
      fetch(`/api/workouts/${workoutSession.workout.id}/sessions/${workoutSession.id}`, {
        method: "PUT",
        body: JSON.stringify({ session: workoutSession }),
      }).then(async (res) => {
        const { _workoutSessions, _modified } = get();

        if (res.status != 200) {
          useAlert.getState().error(`Error saving workout session: ${res.status} (${res.statusText})`);
          // revert
          set({
            _workoutSessions: { ..._workoutSessions, [workoutSession.id || ""]: workoutSession },
            _modified: { ..._modified, [workoutSession.id || ""]: workoutSession },
          });
          return reject(res.statusText);
        }

        const data = await res.json();
        const saved = data.session;

        set({
          _workoutSessions: { ..._workoutSessions, [saved.id || ""]: saved },
          _modified: { ..._modified, [saved.id || ""]: undefined },
        });
        return resolve(saved);
      });
    });
  },

  delete: async (id: string) => {
    // console.log(">> hooks.workoutSessionsSessions.delete id:", id);

    if (!id) {
      throw `Cannot delete workoutSession with null id`;
    }

    const { _workoutSessions, _deleted, get: _get } = get();
    const deleting = _get(id);

    if (!deleting) {
      throw `WorkoutSession not found: ${id}`;
    }

    const session = _get(id);

    // optimistic
    set({
      _workoutSessions: { ..._workoutSessions, [id]: deleting },
      _deleted: { ..._deleted, [id]: true },
    });

    fetch(`/api/workouts/${session.workout.id}/sessions/${id}`, {
      method: "DELETE",
    }).then(async (res) => {
      if (res.status != 200) {
        const { _workoutSessions, _deleted } = get();
        useAlert.getState().error(`Error deleting workoutSessions ${id}: ${res.status} (${res.statusText})`);
        // revert
        set({
          _workoutSessions: { ..._workoutSessions, [id]: deleting },
          _deleted: { ..._deleted, [id]: false },
        });
        return;
      }
    });
  },

  start: async (user: User, workoutId: string) => {
    // console.log(">> hooks.workoutSessions.start", { user, id });
    const { get: getWorkout } = useWorkouts.getState();
    const { startSet } = get();

    if (!workoutId) {
      throw `Cannot create workout session with null id`;
    }


    const workout = getWorkout(workoutId); // TODO summarize

    const session = {
      id: uuid(),
      createdBy: user.uid,
      createdAt: moment().valueOf(),
      status: "creating",
      workout,
      mode: workout.defaultMode,
      sets: [],
    };

    fetchSession("POST", get, set, session, (newSession: WorkoutSession) => {
      // console.log(">> hooks.workoutSessions.startSession fetch callback", { newSession });

      trackEvent("workout-session-started", {
        id: newSession.id,
        workoutId: workout.id,
        workoutName: workout.name,
        createdBy: newSession.createdBy,
      });

      const firstExercise = newSession.workout?.exercises && newSession.workout?.exercises[0];
      startSet(user, workoutId, newSession.id, firstExercise, 0);
    });

    return session;
  },

  complete: async (user: User, id: string) => {
    // console.log(">> hooks.workoutSessions.complete", { user, id });
    const { get: getSession } = get();

    if (!id) {
      throw `Cannot complete workout session with null id`;
    }

    let session = getSession(id);

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

  stop: async (user: User, id: string) => {
    // console.log(">> hooks.workoutSessions.stopSession", { user, id });
    const { get: getSession } = get();

    if (!id) {
      throw `Cannot stop workout session with null id`;
    }

    let session = getSession(id);

    if (!session) {
      throw `Session not found: ${id}`;
    }

    session = stopSet(session);
    session.status = "stopped";

    fetchSession("PUT", get, set, session);

    return session;
  },

  resume: async (user: User, id: string) => {
    // console.log(">> hooks.workoutSessions.resume", { user, id });
    const { get: getSession } = get();

    if (!id) {
      throw `Cannot resume workout session with null id`;
    }

    let session = getSession(id);

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

    // console.log(">> hooks.workoutSessions.resumeSession", { sessionSet });

    sessionSet.startedAt = moment().valueOf();
    sessionSet.stoppedAt = 0;
    sessionSet.status = "started";
    session.status = "started";

    // console.log(">> hooks.workoutSessions.resumeSession", { session });

    fetchSession("PUT", get, set, session);

    return session;
  },

  startSet: async (user: User, workoutId: string, sessionId: string, exercise: Exercise, offset: number) => {
    const { get: getSession } = get();
    const exerciseId = exercise.id;
    const exerciseName = exercise.name;
    // console.log(">> hooks.workoutSessions.startSet", { user, workoutId, sessionId, exerciseId, offset });

    if (!workoutId || !sessionId || !exerciseId) {
      throw `Cannot create workout set with null id`;
    }

    let session = getSession(sessionId);

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

export default useWorkoutSessions;
