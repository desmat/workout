import Link from "@/app/_components/Link"
import { ExerciseDirections } from "@/types/Exercise";
import { formatNumber, formatTime, formatRange } from "@/utils/format";

export function formatDirections({ duration, sets, reps }: ExerciseDirections) {
  let formattedSets = sets && `${formatRange(sets, formatNumber, "set")}`;
  if (formattedSets == "1 set") formattedSets = "";
  const formattedReps = reps && `${formattedSets ? " of " : ""}${formatRange(reps, formatNumber, "rep")}`;
  const formattedDuration = duration && `${formattedSets || formattedReps ? " of " : ""}${formatRange(duration, formatTime)}`;

  return `${formattedSets || ""}${formattedReps || ""}${formattedDuration || ""}`;
}

export function ExerciseEntry({ exercise, user }: any) {
  const isReady = ["created"].includes(exercise?.status);
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
            <span className="relative px-4 _ml-2">
              <Link style="child light" className="absolute right-0 -mr-3">View</Link>
            </span>
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
