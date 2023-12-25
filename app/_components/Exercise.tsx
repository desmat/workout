'use client'

import Link from "@/app/_components/Link"
import { ExerciseDirections } from "@/types/Exercise";
import { formatNumber, formatTime, formatRange } from "@/utils/format";

export function formatDirections({ duration, sets, reps }: ExerciseDirections) {
  const formattedDuration = duration && formatRange(duration, formatTime);
  const formattedSets = sets && `${formattedDuration ? " over " : ""}${formatRange(sets, formatNumber, "set")}`
  const formattedReps = reps && `${formattedSets ? " of " : ""}${formatRange(reps, formatNumber, "rep")}`

  return `${formattedDuration || ""}${formattedSets || ""}${formattedReps || ""}`
}

export function ExerciseEntry({ exercise, user }: any) {
  const isReady = ["created"].includes(exercise?.status);
  const summary = exercise?.description || exercise?.directions && formatDirections(exercise?.directions);
  console.log('>> app.exercises.page.ExerciseEntry.render()', { exercise, user, summary });

  return (
    <Link style="parent" href={`/exercises/${exercise.id}`}>
      <span className="m-0">
        <span className="capitalize font-semibold">{exercise.name}</span>
        {exercise.category &&
          <span className="capitalize font-semibold"> ({exercise.category})</span>
        }
        {isReady &&
          <>
            {summary ? `: ${summary}` : ""}
            <Link style="child light" className="ml-2 absolute">View</Link>
          </>
        }
        {!isReady &&
          <>
            {` (${exercise.status || "Unknown"})`}
          </>
        }
      </span>
    </Link>
  );
}
