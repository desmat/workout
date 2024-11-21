import Link from "@/app/_components/Link"
import { ExerciseDirections } from "@/types/Exercise";
import { formatNumber, formatTime, formatRange } from "@desmat/utils/format";

export function formatDirections({ duration, sets, reps }: ExerciseDirections) {
  const formattedSets = sets && sets != 1 &&`${formatRange(sets, formatNumber, "set")}`;
  const formattedReps = reps && reps != 1 && `${formattedSets ? " of " : ""}${formatRange(reps, formatNumber, "rep")}`;
  const formattedDuration = duration && `${formattedSets && !formattedReps ? " of " : ""}${formattedReps ? " in " : ""}${formatRange(duration, formatTime)}`;

  return `${formattedSets || ""}${formattedReps || ""}${formattedDuration || ""}`;
}

export function ExerciseEntry({ exercise, user }: any) {
  const isReady = exercise?.status == "created";
  const summary = exercise?.description || exercise?.directions && formatDirections(exercise?.directions);
  // console.log('>> app.exercises.page.ExerciseEntry.render()', { exercise, user, summary });

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
            <span className="relative px-3">
              <Link style="child light" className="absolute left-1.5">View</Link>
            </span>
          </>
        }
        {!isReady &&
          <span className="capitalize animate-pulse">{` (${exercise.status || "unknown"}...)`}</span>
        }
      </span>
    </Link>
  );
}
