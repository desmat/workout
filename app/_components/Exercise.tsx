import Link from "@/app/_components/Link"

export function ExerciseEntry({ exercise, user }: any) {
  const isReady = ["created"].includes(exercise?.status);
  const summary = exercise.description;
  console.log('>> app.exercises.page.ExerciseEntry.render()', { exercise, user, summary });

  return (
    <Link style="parent" href={`/exercises/${exercise.id}`}>
      <span className="m-0">
        <span className="capitalize font-semibold">{exercise.name}</span>
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
