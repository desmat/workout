import { User } from 'firebase/auth';
import moment from 'moment';
import { create } from 'zustand'
import { devtools } from 'zustand/middleware'
import { Exercise } from '@/types/Exercise';
import { arrayToObject, uuid } from '@/utils/misc';
import trackEvent from '@/utils/trackEvent';
import useAlert from "./alert";

const useExercises: any = create(devtools((set: any, get: any) => ({
  _exercises: {}, // access via get(id) or find(query?)
  _deleted: {}, // to smooth out UX when deleting
  _loaded: {}, // access via loaded(queryOrId?); stored as id->bool or query->bool

  _setLoaded: (entitiesOrQueryOrId: any, loaded: boolean = true) => {
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
          ...arrayToObject(
            entitiesOrQueryOrId
              .map((e: any) => [e.id, loaded]))
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

  get: (id: string) => {
    return get()._exercises[id];
  },

  find: (query?: object) => {
    const { _exercises, _deleted } = get();
    const [k, v] = Object.entries(query || {})[0] || [];
    return Object.values(_exercises)
      .filter((e: any) => !_deleted[e.id])
      .filter((e: any) => !k || e[k] == v)
      .filter(Boolean);
  },

  loaded: (idOrQuery?: any) => {
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

  load: async (queryOrId?: object | string) => {
    const query = typeof (queryOrId) == "object" && queryOrId;
    const id = typeof (queryOrId) == "string" && queryOrId;
    // console.log(">> hooks.exercise.load", { id });

    if (id) {
      fetch(`/api/exercises/${id}`).then(async (res) => {
        get()._setLoaded(id);

        if (res.status != 200) {
          useAlert.getState().error(`Error fetching exercise ${id}: ${res.status} (${res.statusText})`);
          set({
            loaded: [...(get().loaded || []), id],
          });
          return;
        }

        const data = await res.json();
        // console.log(">> hooks.exercise.get: RETURNED FROM FETCH, returning!");
        const exercise = data.exercise;
        set({
          _exercises: { ...get()._exercises, [exercise.id]: exercise },
        });
      });
    } else {
      let [q, v] = query && Object.entries(query)[0] || [];
      fetch(`/api/exercises${q ? `?${q}=${v}` : ""}`).then(async (res) => {
        get()._setLoaded(query);

        if (res.status != 200) {
          useAlert.getState().error(`Error fetching exercises: ${res.status} (${res.statusText})`);
          return;
        }

        const data = await res.json();

        get()._setLoaded(data.exercises);
        set({
          _exercises: { ...get()._exercises, ...arrayToObject(data.exercises.map((e: Exercise) => [e.id, e])) }
        });
      });
    }
  },

  create: async (user: User, name: string) => {
    // console.log(">> hooks.exercise.create", { name });

    // optimistic
    const tempId = uuid();
    const exercise = {
      id: tempId,
      createdBy: user.uid,
      createdAt: moment().valueOf(),
      status: "creating",
      name,
      optimistic: true,
    }

    get()._setLoaded(exercise.id);
    set({
      exercises: [...get().exercises, exercise],
      _exercises: { ...get().exercises, [exercise.id]: exercise },
    });

    return new Promise((resolve, reject) => {
      fetch('/api/exercises', {
        method: "POST",
        body: JSON.stringify({ name }),
      }).then(async (res) => {
        if (res.status != 200) {
          useAlert.getState().error(`Error adding exercise: ${res.status} (${res.statusText})`);
          const exercises = get().exercises.filter((exercise: Exercise) => exercise.id != tempId);
          // get()._setLoaded(tempId, false); // maybe not?
          set({
            exercises,
            _exercises: { ...get()._exercises, tempId: undefined },
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
        const exercises = get().exercises.filter((exercise: Exercise) => created.id != tempId);
        set({
          exercises: [...exercises, created],
          _exercises: { ...get()._exercises, tempId: undefined, [created.id]: created },
        });
        return resolve(exercise);
      });
    });
  },

  save: async (user: User, exercise: Exercise) => {
    console.log(">> hooks.exercise.save", { exercise });

    const { exercises, _exercises } = get()

    // optimistic
    exercise.status = "saving";
    const saving = exercises.filter((e: Exercise) => e.id != exercise.id);
    set({
      exercises: [...saving, exercise],
      _exercises: { ..._exercises, [exercise.id || ""]: exercise }, // TODO: update type to make id mandatory
    });

    return new Promise((resolve, reject) => {
      fetch(`/api/exercises/${exercise.id}`, {
        method: "PUT",
        body: JSON.stringify({ exercise }),
      }).then(async (res) => {
        if (res.status != 200) {
          useAlert.getState().error(`Error saving exercise: ${res.status} (${res.statusText})`);
          // revert
          set({ exercises, _exercises });
          return reject(res.statusText);
        }

        const data = await res.json();
        const saved = data.exercise;
        // replace optimistic 
        const others = get().exercises.filter((e: Exercise) => e.id != saved.id);
        set({
          exercises: [...others, saved],
          _exercises: { ...get()._exercises, [saved.id || ""]: saved },
        });
        return resolve(exercise);
      });
    });
  },

  generate: async (user: User, exercise: Exercise) => {
    console.log(">> hooks.exercise.generate", { exercise });

    const { exercises, _exercises } = get()

    // optimistic
    exercise = {
      id: exercise.id,
      name: exercise.name,
      createdBy: exercise.createdBy,
      status: "generating",
    };
    const generating = get().exercises.filter((e: Exercise) => e.id != exercise.id);
    set({
      exercises: [...generating, exercise],
      _exercises: { ...get()._exercises, [exercise.id || ""]: exercise },
    });

    return new Promise((resolve, reject) => {
      fetch(`/api/exercises/${exercise.id}/generate`, {
        method: "POST",
        body: JSON.stringify({ exercise }),
      }).then(async (res) => {
        if (res.status != 200) {
          useAlert.getState().error(`Error generating exercise: ${res.status} (${res.statusText})`);
          // reverted
          set({ exercises, _exercises });
          return reject(res.statusText);
        }

        const data = await res.json();
        const updated = data.exercise as Exercise;

        trackEvent("exercise-generated", {
          id: updated.id,
          name: updated.name,
          createdBy: updated.createdBy,
        });

        // replace optimistic 
        const others = get().exercises.filter((e: Exercise) => e.id != exercise.id);
        set({
          exercises: [...others, updated],
          _exercises: { ...get()._exercises, [updated.id || ""]: updated },
        });
        return resolve(updated);
      });
    });
  },

  delete: async (id: string) => {
    console.log(">> hooks.exercise.delete id:", id);

    if (!id) {
      throw `Cannot delete exercise with null id`;
    }

    const { _exercises, _deleted } = get();

    // optimistic
    set({
      _exercises: { ...get()._exercises, [id]: undefined },
      _deleted: { ...get()._deleted, [id]: true },
    });

    fetch(`/api/exercises/${id}`, {
      method: "DELETE",
    }).then(async (res) => {
      if (res.status != 200) {
        useAlert.getState().error(`Error deleting exercises ${id}: ${res.status} (${res.statusText})`);
        // revert
        set({ _exercises, _deleted });
        return;
      }
    });
  },
})));

export default useExercises;
