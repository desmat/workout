import { User } from 'firebase/auth';
import moment from 'moment';
import { create } from 'zustand'
import { devtools } from 'zustand/middleware'
import { Workout } from '@/types/Workout';
import { listToMap, mapToList, mapToSearchParams, uuid } from '@/utils/misc';
import trackEvent from '@/utils/trackEvent';
import useAlert from "./alert";
import { Exercise } from '@/types/Exercise';
import useExercises from './exercises';

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

type WorkoutMap = { [key: string]: Workout | undefined; };
type StatusMap = { [key: string]: boolean };

const useWorkouts: any = create(devtools((set: any, get: any) => ({

  // access via get(id) or find(query?)
  _workouts: <WorkoutMap>{},

  _modified: <WorkoutMap>{},

  // to smooth out UX when deleting,
  _deleted: <StatusMap>{},

  // access via loaded(queryOrId?),
  // stored as id->bool or query->bool, 
  // where id refers to the loaded workout 
  // and query is stringyfied json from loaded
  // list of workouts
  _loaded: <StatusMap>{},

  get: (id: string, modified: boolean = false) => {
    // console.log(">> hooks.workouts.get", { id, modified });
    return modified
      ? get()._modified[id]
      : get()._workouts[id];
  },

  find: (query?: object) => {
    // console.log(">> hooks.workouts.find", { query });
    const { _workouts, _deleted } = get();
    const [k, v] = Object.entries(query || {})[0] || [];

    return mapToList(_workouts)
      .filter(Boolean)
      .filter((e: any) => !_deleted[e?.id])
      .filter((e: any) => !k || !v && !e[k] || v && e[k] == v);
  },

  loaded: (idOrQuery?: object | string) => {
    // console.log(">> hooks.workouts.loaded", { idOrQuery });
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

  load: async (queryOrId?: object | string) => {
    const { setLoaded } = get();
    const query = typeof (queryOrId) == "object" && queryOrId;
    const id = typeof (queryOrId) == "string" && queryOrId;
    // console.log(">> hooks.workouts.load", { id, query });

    if (id) {
      fetch(`/api/workouts/${id}`).then(async (res) => {
        const { _workouts } = get();
        setLoaded(id);

        if (res.status != 200) {
          useAlert.getState().error(`Error fetching workout ${id}: ${res.status} (${res.statusText})`);
          return;
        }

        const data = await res.json();
        const workout = data.workout;

        set({
          _workouts: { ..._workouts, [workout.id]: workout },
        });
      });
    } else {
      const params = query && mapToSearchParams(query);
      fetch(`/api/workouts${params ? `?${params}` : ""}`).then(async (res) => {
        const { _workouts } = get();
        setLoaded(query);

        if (res.status != 200) {
          useAlert.getState().error(`Error fetching workouts: ${res.status} (${res.statusText})`);
          return;
        }

        const data = await res.json();
        const workouts = data.workouts;

        setLoaded(workouts);
        set({
          _workouts: { ..._workouts, ...listToMap(workouts) }
        });
      });
    }
  },

  create: async (user: User, name: string, exerciseNames: string) => {
    // console.log(">> hooks.workouts.create", { name });
    const { _workouts, setLoaded } = get();

    // optimistic
    const creating = {
      id: `interim-${uuid()}`,
      createdBy: user.uid,
      createdAt: moment().valueOf(),
      status: "creating",
      name,
      optimistic: true,
    }

    setLoaded(creating.id);
    set({
      _workouts: { ..._workouts, [creating.id]: creating },
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
        const generating = {
          ...creating,
          status: "generating",
        };
        set({
          _workouts: { ..._workouts, [creating.id]: generating },
        });
      }
    });

    // create the workout
    return new Promise((resolve, reject) => {
      fetch('/api/workouts', {
        method: "POST",
        body: JSON.stringify({ name, exercises: exerciseNames }),
      }).then(async (res) => {
        const { _workouts } = get();

        if (res.status != 200) {
          useAlert.getState().error(`Error adding workout: ${res.status} (${res.statusText})`);
          set({
            _workouts: { ..._workouts, [creating.id]: undefined },
          });
          return reject(res.statusText);
        }

        const data = await res.json();
        const created = data.workout;

        trackEvent("workout-created", {
          id: created.id,
          name: created.name,
          createdBy: created.createdBy,
        });

        // replace optimistic 
        setLoaded(creating.id, false);
        setLoaded(created.id);
        set({
          _workouts: { ..._workouts, [creating.id]: undefined, [created.id]: created },
        });
        return resolve(created);
      });
    });
  },

  generate: async (user: User, name: string, parameters: []) => {
    // console.log(">> hooks.workouts.generateWorkout", { name, parameters });
    const { _workouts, setLoaded } = get();

    // optimistic
    const generating = {
      id: `interim-${uuid()}`,
      createdBy: user.uid,
      createdAt: moment().valueOf(),
      status: "generating",
      name,
      optimistic: true,
    }

    setLoaded(generating.id);
    set({
      _workouts: { ..._workouts, [generating.id || ""]: generating },
    });

    return new Promise((resolve, reject) => {
      fetch('/api/workouts/generate', {
        method: "POST",
        body: JSON.stringify({ name, parameters }),
      }).then(async (res) => {
        const { _workouts } = get();

        if (res.status != 200) {
          useAlert.getState().error(`Error generating workout: ${res.status} (${res.statusText})`);
          // revert
          set({
            _workouts: { ..._workouts, [generating.id || ""]: undefined },
          });
          return reject(res.statusText);
        }

        const data = await res.json();
        // console.log(">> hooks.workout.generateWorkout", { data });
        const generated = data.workout;

        trackEvent("workout-generated", {
          id: generated.id,
          name: generated.name,
          createdBy: generated.createdBy,
        });

        // replace optimistic 
        set({
          _workouts: { ..._workouts, [generated.id || ""]: generated },
        });
        return resolve(generated);
      });
    })
  },

  update: async (user: User, workout: Workout, remove?: boolean) => {
    // console.log(">> hooks.workouts.update", { workout });
    const { _modified } = get();

    if (remove) {
      set({
        _modified: { ..._modified, [workout.id || ""]: undefined }
      });
    } else {
      set({
        _modified: { ..._modified, [workout.id || ""]: { ...workout, status: "updated" } }
      });
      return workout;
    }
  },

  addExercise: async (user: User, workout: Workout, exerciseNames: string) => {
    // console.log(">> hooks.workouts.addExercise", { workout, exerciseNames });
    const { update } = get();
    const {
      loaded: exercisesLoaded,
      load: loadExercises,
      find: findExercises,
      create: createExercise,
      generate: generateExercise,
    } = useExercises.getState();

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

    const updating = {
      ...workout,
      exercises: [
        ...workout.exercises || [],
        ...exercises,
      ]
    };

    update(user, updating);


    // next resolve exercise with existing or create a new one

    return new Promise(async (resolve, reject) => {
      // console.debug("loading exercises", { exercises: workout.exercises })
      if (!exercisesLoaded()) {
        await loadExercises();
      }
      // console.debug("loading exercises load completed", { exercises: useExercises.getState().exercises })

      const exerciseMap = listToMap(
        findExercises(),
        { keyFn: (e: Exercise) => e?.name?.toLowerCase() }
      );

      // console.log("loading exercises", { exerciseMap });

      (updating.exercises || [])
        .filter((e: Exercise) => !e.id) // non-resolved should not have an id (id this one was not added just now)
        .forEach((e: Exercise) => {
          console.debug("loading exercises resolving exercises", { e })
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
          console.debug("loading exercises creating exercise", { e });
          createExercise(user, e.name).then((created: Exercise) => {
            e.id = created.id;
            e.name = created.name;
            e.status = "generating";
            update(user, updating);

            generateExercise(user, e).then((generated: Exercise) => {
              e.status = generated.status;
              e.directions = {
                duration: pickFromRange(generated.directions?.duration),
                sets: pickFromRange(generated.directions?.sets),
                reps: pickFromRange(generated.directions?.reps),
              };
              update(user, updating);
            });
          });

          e.status = "creating";
        });

      update(user, updating);
      return resolve(updating);
    });
  },

  save: async (user: User, workout: Workout) => {
    // console.log(">> hooks.workouts.save", { workout });
    const { _workouts, _modified } = get();

    // optimistic
    const saving = {
      ...workout,
      status: "saving",
    };

    set({
      _modified: { ..._modified, [workout.id || ""]: saving },
    });

    return new Promise((resolve, reject) => {
      fetch(`/api/workouts/${workout.id}`, {
        method: "PUT",
        body: JSON.stringify({ workout }),
      }).then(async (res) => {
        const { _workouts, _modified } = get();

        if (res.status != 200) {
          useAlert.getState().error(`Error saving workout: ${res.status} (${res.statusText})`);
          // revert
          set({
            _workouts: { ..._workouts, [workout.id || ""]: workout },
            _modified: { ..._modified, [workout.id || ""]: workout },
          });
          return reject(res.statusText);
        }

        const data = await res.json();
        const saved = data.workout;

        set({
          _workouts: { ..._workouts, [saved.id || ""]: saved },
          _modified: { ..._modified, [saved.id || ""]: undefined },
        });
        return resolve(saved);
      });
    });
  },

  delete: async (id: string) => {
    // console.log(">> hooks.workouts.delete id:", id);

    if (!id) {
      throw `Cannot delete workout with null id`;
    }

    const { _workouts, _deleted, get: _get } = get();
    const deleting = _get(id);

    if (!deleting) {
      throw `Workout not found: ${id}`;
    }

    // optimistic
    set({
      _workouts: { ..._workouts, [id]: deleting },
      _deleted: { ..._deleted, [id]: true },
    });

    fetch(`/api/workouts/${id}`, {
      method: "DELETE",
    }).then(async (res) => {
      if (res.status != 200) {
        const { _workouts, _deleted } = get();
        useAlert.getState().error(`Error deleting workouts ${id}: ${res.status} (${res.statusText})`);
        // revert
        set({
          _workouts: { ..._workouts, [id]: deleting },
          _deleted: { ..._deleted, [id]: false },
        });
        return;
      }
    });
  },
})));

export default useWorkouts;
