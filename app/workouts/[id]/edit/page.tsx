'use client'

import { useRouter } from 'next/navigation'
import moment from 'moment';
import { useEffect } from "react";
import { FaArrowDown, FaArrowUp } from "react-icons/fa";
import { FaXmark } from "react-icons/fa6";
import Page from "@/app/_components/Page";
import Link from "@/app/_components/Link"
import useAlert from '@/app/_hooks/alert';
import useWorkouts from "@/app/_hooks/workouts";
import useUser from "@/app/_hooks/user";
import { Exercise } from '@/types/Exercise';
import { capitalize, formatNumber, formatRange, formatTime } from '@/utils/format';

function ExerciseEntry({ user, workout, exercise, offset }: any) {
  const warning = useAlert((state: any) => state.warning);
  const updateWorkout = useWorkouts((state: any) => state.update);
  const { duration, sets, reps } = exercise.directions || {};
  let formattedSets = sets ? formatRange(sets, formatNumber, "set") : "no set";
  const formattedReps = reps ? formatRange(reps, formatNumber, "rep") : "no rep";
  const formattedDuration = duration ? formatRange(duration, formatTime) : "no time";
  const isReady = exercise?.status == "created";
  // console.log('>> app.exercises[id].edit.page.ExerciseEntry.render()', { exercise, user });

  async function handleUpdateDirections(field: string, label?: string, defaultValue?: string) {
    console.log('>> app.workout[id].edit.handleUpdateDirections()', { user, workout, exercise, field, label });
    const val = window.prompt(`${label || field || ""}? (Number or blank)`, defaultValue);
    if (exercise && typeof (val) == "string") {
      exercise.directions = { ...exercise.directions, [field]: Number(val) }
      updateWorkout(user, workout);
    }
  }

  async function handleUpdateDuration() {
    // console.log('>> app.workout[id].edit.handleUpdateDuration()', { user, workout, exercise, duration });
    const val = window.prompt("Duration? (Ex: 10 minutes, 90s, etc. or blank)", `${formatTime(duration || 0)}`);
    if (exercise && typeof (val) != "undefined") {
      if ([null, "", "0"].includes(val)) {
        exercise.directions = { ...exercise.directions, duration: 0 }
        updateWorkout(user, workout);
        return;
      }

      const regex = /([\d\.]+)\s*([a-zA-Z])/g; // ex "1 minute", "1h 20m", etc
      const matches = `${val}`.matchAll(regex);
      
      if (!matches) {
        warning(`Invalid duration: ${val}`);
        return;
      }

      // @ts-ignore
      const allMatches = [...matches];
      // console.log(">> app.workout[id].edit.handleUpdateDuration()", { allMatches });

      if (!allMatches || allMatches.length == 0) {
        warning(`Invalid duration: ${val}`);
        return;
      }

      var millis = allMatches
        .map((m) => m.length > 2 ? moment.duration(m[1], m[2]).asMilliseconds() : 0)
        .reduce((total, val) => total + val, 0);

      exercise.directions = { ...exercise.directions, duration: millis }
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
    <div className="flex flex-row _flex-wrap gap-0 m-0 group">
      <div className="_bg-pink-200 flex flex-row flex-wrap gap-0 m-0 group">
        <span className="capitalize font-semibold flex flex-nowrap wrap whitespace-nowrap _bg-pink-200">{exercise.name}</span>
        {exercise.category &&
          <span className="capitalize font-semibold"> ({exercise.category})</span>
        }
        {isReady &&
          <div className="flex flex-row gap-1 px-2 flex-wrap grow whitespace-nowrap group">
            <Link onClick={() => handleUpdateDirections("sets", "Number of Sets", sets)}>
              {formattedSets}
            </Link>
            <span>{sets && reps ? "of" : ""}</span>
            <Link onClick={() => handleUpdateDirections("reps", "Number of Repetitions", reps)}>
              {formattedReps}
            </Link>
            <span>{reps ? "in" : sets ? "of" : ""}</span>
            <Link onClick={handleUpdateDuration}>
              {formattedDuration}
            </Link>
          </div>
        }
        {!isReady &&
          <span className="capitalize animate-pulse px-2">{` (${exercise.status || "unknown"}...)`}</span>
        }
      </div>
      <div className="_bg-yellow-200 flex flex-row justify-end items-center grow gap-0.5 opacity-50 group-hover:opacity-100">
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
    originalWorkout,
    workout,
    loaded,
    load,
    saveWorkout,
    updateWorkout,
    addExercise,
  ] = useWorkouts((state: any) => [
    state.get(params.id),
    state.get(params.id, true),
    state.loaded(params.id),
    state.load,
    state.save,
    state.update,
    state.addExercise,
  ]);
  // const [exercisesLoaded, loadExercises] = useExercises((state: any) => [state.loaded, state.load]);
  const [user] = useUser((state: any) => [state.user]);
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
