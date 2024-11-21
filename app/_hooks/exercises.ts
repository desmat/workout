import { listToMap, mapToList, mapToSearchParams, uuid } from '@desmat/utils';
import { User } from 'firebase/auth';
import moment from 'moment';
import { create } from 'zustand'
import { devtools } from 'zustand/middleware'
import { Exercise } from '@/types/Exercise';
import trackEvent from '@/utils/trackEvent';
import useAlert from "./alert";

type ExerciseMap = { [key: string]: Exercise | undefined; };
type StatusMap = { [key: string]: boolean };

const useExercises: any = create(devtools((set: any, get: any) => ({

  // access via get(id) or find(query?)
  _exercises: <ExerciseMap>{},

  // to smooth out UX when deleting,
  _deleted: <StatusMap>{},

  // access via loaded(queryOrId?),
  // stored as id->bool or query->bool, 
  // where id refers to the loaded exercise 
  // and query is stringyfied json from loaded
  // list of exercises
  _loaded: <StatusMap>{},

  get: (id: string) => {
    return get()._exercises[id];
  },

  find: (query?: object) => {
    const { _exercises, _deleted } = get();
    const [k, v] = Object.entries(query || {})[0] || [];

    return mapToList(_exercises)
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

  load: async (queryOrId?: object | string) => {
    const { setLoaded } = get();
    const query = typeof (queryOrId) == "object" && queryOrId;
    const id = typeof (queryOrId) == "string" && queryOrId;
    // console.log(">> hooks.exercise.load", { id, query });

    if (id) {
      fetch(`/api/exercises/${id}`).then(async (res) => {
        const { _exercises } = get();
        setLoaded(id);

        if (res.status != 200) {
          useAlert.getState().error(`Error fetching exercise ${id}: ${res.status} (${res.statusText})`);
          return;
        }

        const data = await res.json();
        const exercise = data.exercise;

        set({
          _exercises: { _exercises, [exercise.id]: exercise },
        });
      });
    } else {
      const params = query && mapToSearchParams(query);
      fetch(`/api/exercises${params ? `?${params}` : ""}`).then(async (res) => {
        const { _exercises } = get();
        setLoaded(query);

        if (res.status != 200) {
          useAlert.getState().error(`Error fetching exercises: ${res.status} (${res.statusText})`);
          return;
        }

        const data = await res.json();
        const exercises = data.exercises;

        setLoaded(exercises);
        set({
          _exercises: { ..._exercises, ...listToMap(exercises) }
        });
      });
    }
  },

  create: async (user: User, name: string) => {
    // console.log(">> hooks.exercise.create", { name });
    const { _exercises, setLoaded } = get();

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
      _exercises: { ..._exercises, [creating.id]: creating },
    });

    return new Promise((resolve, reject) => {
      fetch('/api/exercises', {
        method: "POST",
        body: JSON.stringify({ name }),
      }).then(async (res) => {
        const { _exercises } = get();

        if (res.status != 200) {
          useAlert.getState().error(`Error adding exercise: ${res.status} (${res.statusText})`);
          set({
            _exercises: { ..._exercises, [creating.id]: undefined },
          });
          return reject(res.statusText);
        }

        const data = await res.json();
        const created = data.exercise;

        trackEvent("exercise-created", {
          id: created.id,
          name: created.name,
          createdBy: created.createdBy,
        });

        // replace optimistic 
        setLoaded(creating.id, false);
        setLoaded(created.id);
        set({
          _exercises: { ..._exercises, [creating.id]: undefined, [created.id]: created },
        });
        return resolve(created);
      });
    });
  },

  save: async (user: User, exercise: Exercise) => {
    // console.log(">> hooks.exercise.save", { exercise });
    const { _exercises } = get();

    // optimistic
    const saving = {
      ...exercise,
      status: "saving",
    };

    set({
      _exercises: { ..._exercises, [exercise.id || ""]: saving }, // TODO: update type to make id mandatory
    });

    return new Promise((resolve, reject) => {
      fetch(`/api/exercises/${exercise.id}`, {
        method: "PUT",
        body: JSON.stringify({ exercise }),
      }).then(async (res) => {
        const { _exercises } = get();

        if (res.status != 200) {
          useAlert.getState().error(`Error saving exercise: ${res.status} (${res.statusText})`);
          // revert
          set({
            _exercises: { ..._exercises, [exercise.id || ""]: exercise }, // TODO: update type to make id mandatory
          });
          return reject(res.statusText);
        }

        const data = await res.json();
        const saved = data.exercise;

        set({
          _exercises: { ..._exercises, [saved.id || ""]: saved },
        });
        return resolve(saved);
      });
    });
  },

  generate: async (user: User, exercise: Exercise) => {
    // console.log(">> hooks.exercise.generate", { exercise });
    const { _exercises } = get();

    // optimistic
    const generating = {
      id: exercise.id,
      name: exercise.name,
      createdBy: exercise.createdBy,
      status: "generating",
    };

    set({
      _exercises: { ..._exercises, [exercise.id || ""]: generating },
    });

    return new Promise((resolve, reject) => {
      fetch(`/api/exercises/${exercise.id}/generate`, {
        method: "POST",
        body: JSON.stringify({ exercise }),
      }).then(async (res) => {
        const { _exercises } = get();

        if (res.status != 200) {
          useAlert.getState().error(`Error generating exercise: ${res.status} (${res.statusText})`);
          // revert
          set({
            _exercises: { ..._exercises, [exercise.id || ""]: exercise },
          });
          return reject(res.statusText);
        }

        const data = await res.json();
        const generated = data.exercise;

        trackEvent("exercise-generated", {
          id: generated.id,
          name: generated.name,
          createdBy: generated.createdBy,
        });

        // replace optimistic 
        set({
          _exercises: { ..._exercises, [generated.id || ""]: generated },
        });
        return resolve(generated);
      });
    });
  },

  delete: async (id: string) => {
    // console.log(">> hooks.exercise.delete id:", id);

    if (!id) {
      throw `Cannot delete exercise with null id`;
    }

    const { _exercises, _deleted, get: _get } = get();
    const deleting = _get(id);

    if (!deleting) {
      throw `Exercise not found: ${id}`;
    }

    // optimistic
    set({
      _exercises: { ..._exercises, [id]: undefined },
      _deleted: { ..._deleted, [id]: true },
    });

    fetch(`/api/exercises/${id}`, {
      method: "DELETE",
    }).then(async (res) => {
      if (res.status != 200) {
        const { _exercises, _deleted } = get();
        useAlert.getState().error(`Error deleting exercises ${id}: ${res.status} (${res.statusText})`);
        // revert
        set({
          _exercises: { ..._exercises, [id]: deleting },
          _deleted: { ..._deleted, [id]: false },
        });
        return;
      }
    });
  },
})));

export default useExercises;
