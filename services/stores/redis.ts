import RedisStore from "@desmat/redis-store";
import { Exercise } from '@/types/Exercise';
import { Workout, WorkoutSession } from '@/types/Workout';

export function createStore({
  debug
}: {
  debug?: boolean
}) {
  debug && console.log(`services.stores.redis.createStore`);

  return {
    exercises: new RedisStore<Exercise>({
      key: "workout-exercise",
      setKey: "workout-exercises",
      options: {
        lookups: {
          createdBy: "createdBy",
        }
      },
      debug,
    }),
    workouts: new RedisStore<Workout>({
      key: "workout",
      setKey: "workouts",
      options: {
        lookups: {
          createdBy: "createdBy",
        }
      },
      debug,
    }),
    workoutSessions: new RedisStore<WorkoutSession>({
      key: "workout-session",
      setKey: "workout-sessions",
      options: {
        lookups: {
          createdBy: "createdBy",
        }
      },
      debug,
    }),
  };
}
