'use client'

import { useRouter } from 'next/navigation'
import { useEffect } from "react";
import { FaArrowDown, FaArrowUp } from "react-icons/fa";
import { FaXmark } from "react-icons/fa6";
import Page from "@/app/_components/Page";
import Link from "@/app/_components/Link"
import useWorkouts from "@/app/_hooks/workouts";
import useUser from "@/app/_hooks/user";
import { Exercise } from '@/types/Exercise';
import { capitalize, formatNumber, formatRange, formatTime } from '@/utils/format';

function ExerciseEntry({ user, workout, exercise, offset }: any) {
  const [updateWorkout] = useWorkouts((state: any) => [state.updateWorkout]);
  const { duration, sets, reps } = exercise.directions || {};
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

  async function handleRemove() {
    // console.log('>> app.workout[id].edit.handleRemove()', { user, workout, exercise });
    const val = window.confirm(`Remove ${exercise.name} from this workout?`);
    if (val && workout && exercise) {
      workout.exercises.splice(offset, 1);
      updateWorkout(user, workout);
    }
  }

  async function handleMoveUp() {
    // console.log('>> app.workout[id].edit.handleMoveUp()', { user, workout, exercise });
    if (workout && exercise && offset > 0) {
      const [e] = workout.exercises.splice(offset, 1);
      // console.log('>> app.workout[id].edit.handleMoveUp()', { e });
      workout.exercises.splice(offset - 1, 0, e);
      updateWorkout(user, workout);
    }
  }

  async function handleMoveDown() {
    // console.log('>> app.workout[id].edit.handleMoveUp()', { user, workout, exercise });
    if (workout && exercise && offset < workout.exercises.length - 1) {
      const [e] = workout.exercises.splice(offset, 1);
      // console.log('>> app.workout[id].edit.handleMoveUp()', { e });
      workout.exercises.splice(offset + 1, 0, e);
      updateWorkout(user, workout);
    }
  }

  return (
    <div className="flex flex-row gap-2 m-0 group">
      <span className="capitalize font-semibold">{exercise.name}</span>
      {exercise.category &&
        <span className="capitalize font-semibold"> ({exercise.category})</span>
      }
      {isReady &&
        <div className="flex flex-row gap-1 group">
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
          <div className="flex flex-row justify-end grow items-center gap-1 pl-2 opacity-60 group-hover:opacity-100">
            <Link onClick={handleRemove} style="warning" className="hover:text-dark-1">
              <FaXmark />
            </Link>
            {offset >= workout.exercises.length - 1 &&
              <Link style="disabled">
                <FaArrowDown />
              </Link>
            }
            {offset < workout.exercises.length - 1 &&
              <Link onClick={handleMoveDown} className="hover:text-dark-1">
                <FaArrowDown />
              </Link>
            }
            {offset == 0 &&
              <Link style="disabled">
                <FaArrowUp />
              </Link>
            }
            {offset > 0 &&
              <Link onClick={handleMoveUp} className="hover:text-dark-1">
                <FaArrowUp />
              </Link>
            }
          </div>
        </div>
      }
      {!isReady &&
        <span className="capitalize animate-pulse">{` (${exercise.status || "unknown"}...)`}</span>
      }
    </div>
  );
}

function Exercises({ user, workout, exercises, handleAddExercise }: any) {
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
                  offset={offset}
                />
              </div>
            ))
        }
      </div>
      {/* <div>
        <Link onClick={handleAddExercise} className="hover:text-dark-1">Add</Link>
      </div> */}
    </div>
  );
}

export default function Component({ params }: { params: { id: string } }) {
  // console.log('>> app.workout[id].Page.render()', { id: params.id });
  const router = useRouter();
  const [
    workouts,
    updatedWorkouts,
    loaded,
    load,
    deleteWorkout,
    saveWorkout,
    updateWorkout,
    addExercise
  ] = useWorkouts((state: any) => [
    state.workouts,
    state.updatedWorkouts,
    state.loaded,
    state.load,
    state.deleteWorkout,
    state.saveWorkout,
    state.updateWorkout,
    state.updateWorkoutAddExercise
  ]);
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
    // console.log('>> app.workout[id].edit.handleCancel()', { user, workout });
    setTimeout(() => updateWorkout(user, workout, true), 100); // smooth transition back
    router.push(`/workouts/${workout.id}`);
  }

  async function handleSave() {
    // console.log('>> app.workout[id].edit.handleSave()', { user, workout });
    const savedWorkout = await saveWorkout(user, workout);
    if (savedWorkout) {
      setTimeout(() => updateWorkout(user, workout, true), 100); // smooth transition back
      router.push(`/workouts/${workout.id}`);
    }
  }

  async function handleUpdate(field: string, label?: string, defaultValue?: string) {
    // console.log('>> app.workout[id].edit.handleUpdate()', { user, workout, field, label });
    const val = window.prompt(`${capitalize(label || field || "")}?`, defaultValue);
    if (typeof (val) == "string") {
      const updatedWorkout = { ...workout, [field]: val };
      updateWorkout(user, updatedWorkout);
    }
  }

  async function handleAddExercise() {
    // console.log('>> app.workout[id].edit.handleAddExercise()', { user, workout });
    const val = window.prompt("Exercise name (or names)?", "Plank");
    if (val) {
      addExercise(user, workout, val);
    }
  }

  const links = [
    workout && !(isReady && user && (user.uid == workout.createdBy || user.admin)) && <Link key="back" href={`/workouts/${workout.id}`}>Back</Link>,
    workout && isReady && user && (user.uid == workout.createdBy || user.admin) && <Link key="cancel" onClick={handleCancel}>Cancel</Link>,
    workout && isReady && user && (user.uid == workout.createdBy || user.admin) && <Link key="add" onClick={handleAddExercise}>Add Exercise(s)</Link>,
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
              handleAddExercise={handleAddExercise}
            />
          }
        </div>
      }
    </Page>
  )
}
