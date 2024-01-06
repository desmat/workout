'use client'

import { useRouter } from 'next/navigation'
import { useEffect } from "react";
import Page from "@/app/_components/Page";
import Link from "@/app/_components/Link"
import useWorkouts from "@/app/_hooks/workouts";
import useUser from "@/app/_hooks/user";
import { Exercise } from '@/types/Exercise';
import { capitalize, formatNumber, formatRange, formatTime } from '@/utils/format';

function ExerciseEntry({ user, workout, exercise }: any) {
  const [updateWorkout] = useWorkouts((state: any) => [state.updateWorkout]);
  const { duration, sets, reps } = exercise.directions;
  let formattedSets = formatRange(sets || 0, formatNumber, "set");
  const formattedReps = formatRange(reps || 0, formatNumber, "rep");
  const formattedDuration = formatRange(duration || 0, formatTime);
  const isReady = exercise?.status == "created";
  // console.log('>> app.exercises[id].edit.page.ExerciseEntry.render()', { exercise, user });

  async function handleUpdateDirections(field: string, label?: string, defaultValue?: string) {
    console.log('>> app.workout[id].edit.handleUpdateDirections()', { user, workout, exercise, field, label });
    const val = window.prompt(`${label || field || ""}?`, defaultValue);
    if (exercise && typeof (val) == "string") {
      exercise.directions = { ...exercise.directions, [field]: Number(val) }
      updateWorkout(user, workout);
    }
  }

  return (
    <div className="flex flex-row  gap-2 m-0">
      <span className="capitalize font-semibold">{exercise.name}</span>
      {exercise.category &&
        <span className="capitalize font-semibold"> ({exercise.category})</span>
      }
      {isReady &&
        <div>
          <Link onClick={() => handleUpdateDirections("sets", "Number of Sets", sets)}>
            {formattedSets}
          </Link>
          <span> of </span>
          <Link onClick={() => handleUpdateDirections("reps", "Number of Repetitions (per set)", reps)}>
            {formattedReps}
          </Link>
          <span> of </span>
          <Link onClick={() => handleUpdateDirections("duration", "Duration (in milliseconds)", duration)}>
            {formattedDuration}
          </Link>
        </div>
      }
      {!isReady &&
        <span className="capitalize animate-pulse">{` (${exercise.status || "unknown"}...)`}</span>
      }
    </div>
  );
}

function Exercises({ user, workout, exercises }: any) {
  // console.log('>> app.workouts[id].edit.Exercises.render()', { id, exercises });

  return (
    <div className="flex flex-col items-center gap-1">
      <div className="text-dark-0 opacity-40">Exercises</div>
      <div className="flex flex-col gap-1">
        {
          exercises
            .map((exercise: Exercise, offset: number) => (
              <div key={offset}>
                <ExerciseEntry
                  user={user}
                  workout={workout}
                  exercise={exercise}
                />
              </div>
            ))
        }
      </div>
    </div>
  );
}

export default function Component({ params }: { params: { id: string } }) {
  // console.log('>> app.workout[id].Page.render()', { id: params.id });
  const router = useRouter();
  const [workouts, updatedWorkouts, loaded, load, deleteWorkout, saveWorkout, updateWorkout] = useWorkouts((state: any) => [state.workouts, state.updatedWorkouts, state.loaded, state.load, state.deleteWorkout, state.saveWorkout, state.updateWorkout]);
  // const [exercisesLoaded, loadExercises] = useExercises((state: any) => [state.loaded, state.load]);
  const [user] = useUser((state: any) => [state.user]);
  const originalWorkout = workouts && workouts.filter((workout: any) => workout.id == params.id)[0];
  const workout = updatedWorkouts && updatedWorkouts.filter((workout: any) => workout?.id == params.id)[0];
  const isReady = loaded && workout;
  // console.log('>> app.workouts[id].edit.render()', { id: params.id, workout });

  useEffect(() => {
    if (!originalWorkout) {
      load(params.id)
    }

    if (!workout && originalWorkout) {
      updateWorkout(user, originalWorkout);
    }
  }, [params.id, originalWorkout]);

  async function handleCancel() {
    console.log('>> app.workout[id].edit.handleCancel()', { user, workout });
    setTimeout(() => updateWorkout(user, workout, true), 100); // smooth transition back
    router.push(`/workouts/${workout.id}`);
  }

  async function handleSave() {
    console.log('>> app.workout[id].edit.handleSave()', { user, workout });
    const savedWorkout = await saveWorkout(user, workout);
    if (savedWorkout) {
      setTimeout(() => updateWorkout(user, workout, true), 100); // smooth transition back
      router.push(`/workouts/${workout.id}`);
    }
  }

  async function handleUpdate(field: string, label?: string, defaultValue?: string) {
    console.log('>> app.workout[id].edit.handleUpdate()', { user, workout, field, label });
    const val = window.prompt(`${capitalize(label || field || "")}?`, defaultValue);
    if (typeof (val) == "string") {
      const updatedWorkout = { ...workout, [field]: val };
      updateWorkout(user, updatedWorkout);
    }
  }

  const links = [
    workout && !(isReady && user && (user.uid == workout.createdBy || user.admin)) && <Link key="back" href={`/workouts/${workout.id}`}>Back</Link>,
    workout && isReady && user && (user.uid == workout.createdBy || user.admin) && <Link key="cancel" onClick={handleCancel}>Cancel</Link>,
    workout && isReady && user && (user.uid == workout.createdBy || user.admin) && <Link key="save" onClick={handleSave}>Save</Link>,
  ];

  if (!isReady) {
    return (
      <Page
        bottomLinks={links}
        loading={true}
      />
    )
  }

  if (isReady && !workout) {
    return (
      <Page
        title="Workout not found"
        subtitle={params.id}
        links={links}
      />
    )
  }

  return (
    <Page
      title={
        <Link onClick={() => handleUpdate("name", "Name", workout.name)}>
          {workout.name || "(Unnamed Workout)"}
        </Link>
      }
      subtitle={
        <span>
          Status: <span className={`${workout.status == "saving" && "animate-pulse"}`}>{workout.status}</span>
        </span>
      }
      links={links}
    >
      {workout &&
        <div className="flex flex-col items-center gap-4">
          {workout && workout.exercises && workout.exercises.length > 0 &&
            <Exercises
              user={user}
              workout={workout}
              exercises={workout.exercises}
            />
          }
        </div>
      }
    </Page>
  )
}
