import { listToMap, mapToList, uuid } from '@desmat/utils';
import { byCreatedAtDesc } from '@desmat/utils/sort';
import { User } from 'firebase/auth';
import moment from 'moment';
import { create } from 'zustand'
import { devtools } from 'zustand/middleware'
import { Workout, WorkoutSession, WorkoutSet } from '@/types/Workout';
import trackEvent from '@/utils/trackEvent';
import { Exercise } from '@/types/Exercise';
import useAlert from "./alert";
import useWorkouts from './workouts';

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

type WorkoutSessionMap = { [key: string]: WorkoutSession | undefined; };
type StatusMap = { [key: string]: boolean };

const useWorkoutSessions: any = create(devtools((set: any, get: any) => ({

  // access via get(id) or find(query?)
  _workoutSessions: <WorkoutSessionMap>{},

  // to smooth out UX when deleting,
  _deleted: <StatusMap>{},

  // access via loaded(queryOrId?),
  // stored as id->bool or query->bool, 
  // where id refers to the loaded workoutSession 
  // and query is stringyfied json from loaded
  // list of workoutSessions
  _loaded: <StatusMap>{},

  _fetchSession: (method: "PUT" | "POST", newSession: WorkoutSession) => {
    const { setLoaded, _workoutSessions } = get();
    const workoutId = newSession.workout.id;
    const sessionId = newSession.id;
    const url = method == "PUT"
      ? `/api/workouts/${workoutId}/sessions/${sessionId}`
      : `/api/workouts/${workoutId}/sessions`

    // optimistic
    setLoaded(newSession.id);
    set({
      _workoutSessions: { ..._workoutSessions, [newSession.id || ""]: newSession }
    });

    return new Promise((resolve, reject) => {
      fetch(url, {
        method,
        body: JSON.stringify({ session: newSession }),
      }).then(async (res) => {
        const { _workoutSessions } = get();

        if (res.status != 200) {
          useAlert.getState().error(`Error ${method == "PUT" ? "saving" : "creating"} workout session set: ${res.status} (${res.statusText})`);
          // revert optimistic 
          set({
            _workoutSessions: { ..._workoutSessions, [newSession.id || ""]: undefined }
          });
          return reject(res.statusText);
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

        return resolve(savedSession);
      });
    });
  },

  get: (id: string) => {
    return get()._workoutSessions[id];
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
    // console.log(">> hooks.workoutSessionsSessions.load", { workoutId, sessionId });

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
    const { _workoutSessions, setLoaded, _fetchSession } = get();

    // optimistic
    const creating = {
      id: `interim-${uuid()}`,
      createdBy: user.uid,
      createdAt: moment().valueOf(),
      status: "creating",
      workout: { id: workout.id, name: workout.name },
      sets: [],
      optimistic: true,
    }

    setLoaded(creating.id);
    set({
      _workoutSessions: { ..._workoutSessions, [creating.id]: creating },
    });

    const created = await _fetchSession("POST", creating);

    trackEvent("workout-session-created", {
      id: created.id,
      createdBy: created.createdBy,
    });

    // replace optimistic 
    setLoaded(creating.id, false);
    setLoaded(created.id);
    return created;
  },

  save: async (user: User, workoutSession: WorkoutSession) => {
    // console.log(">> hooks.workoutSessionsSessions.save", { workoutSession });
    const { _fetchSession } = get();

    return _fetchSession("PUT", workoutSession);
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
    // console.log(">> hooks.workoutSessions.start", { user, workoutId });
    const { get: getWorkout } = useWorkouts.getState();
    const { startSet, _fetchSession } = get();

    if (!workoutId) {
      throw `Cannot create workout session with null id`;
    }


    const workout = getWorkout(workoutId); // TODO summarize
    // console.log(">> hooks.workoutSessions.start", { workout });

    const session = {
      id: uuid(),
      createdBy: user.uid,
      createdAt: moment().valueOf(),
      status: "creating",
      workout,
      mode: workout.defaultMode,
      sets: [],
    };

    const newSession = await _fetchSession("POST", session);

    trackEvent("workout-session-started", {
      id: newSession.id,
      workoutId: workout.id,
      workoutName: workout.name,
      createdBy: newSession.createdBy,
    });

    const firstExercise = newSession.workout?.exercises && newSession.workout?.exercises[0];
    startSet(user, workoutId, newSession.id, firstExercise, 0);

    return session;
  },

  complete: async (user: User, id: string) => {
    // console.log(">> hooks.workoutSessions.complete", { user, id });
    const { get: getSession, _fetchSession } = get();

    if (!id) {
      throw `Cannot complete workout session with null id`;
    }

    let session = getSession(id);
    // console.log(">> hooks.workoutSessions.complete", { session });

    if (!session) {
      throw `Session not found: ${id}`;
    }

    session = stopSet(session, "completed");
    session.status = "completed";

    const updated = await _fetchSession("PUT", session);

    trackEvent("workout-session-completed", {
      id: updated.id,
      workoutId: updated.workout?.id,
      workoutName: updated.workout?.name,
      createdBy: updated.createdBy,
    });

    return session;
  },

  stop: async (user: User, id: string) => {
    // console.log(">> hooks.workoutSessions.stopSession", { user, id });
    const { get: getSession, _fetchSession } = get();

    if (!id) {
      throw `Cannot stop workout session with null id`;
    }

    let session = getSession(id);

    if (!session) {
      throw `Session not found: ${id}`;
    }

    session = stopSet(session);
    session.status = "stopped";

    return _fetchSession("PUT", session);
  },

  resume: async (user: User, id: string) => {
    // console.log(">> hooks.workoutSessions.resume", { user, id });
    const { get: getSession, _fetchSession } = get();

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

    sessionSet.startedAt = moment().valueOf();
    sessionSet.stoppedAt = 0;
    sessionSet.status = "started";
    session.status = "started";

    return _fetchSession("PUT", session);
  },

  startSet: async (user: User, workoutId: string, sessionId: string, exercise: Exercise, offset: number) => {
    const { get: getSession, _fetchSession } = get();
    const exerciseId = exercise.id;
    const exerciseName = exercise.name;
    // console.log(">> hooks.workoutSessions.startSet", { user, workoutId, sessionId, exerciseId, offset });
    // console.log(">> hooks.workoutSessions.startSet", { exercise });
    

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
      exercise: { id: exerciseId, name: exerciseName, directions: exercise.directions },
      offset,
    };

    session.status = "started";
    session.sets.push(sessionSet);

    return _fetchSession("PUT", session);
  },
})));

export default useWorkoutSessions;
