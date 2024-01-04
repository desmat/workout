'use client'

import { useRouter } from "next/navigation";
import Link from "@/app/_components/Link";
import useExercises from "@/app/_hooks/exercises";
import useUser from "@/app/_hooks/user";

export function CreateLink() {
  const router = useRouter();
  const [user] = useUser((state: any) => [state.user]);
  const [createExercise, generateExercise] = useExercises((state: any) => [state.createExercise, state.generateExercise]);

  console.log('>> app.exercises.clientCompnents.CreateLink.render()', {});

  const handleCreateExercise = async () => {
    const name = window.prompt("Name?", "");

    if (name) {
      const created = await createExercise(user, name);
      // console.log("*** handleCreateExercise", { created });

      if (created) {
        const generating = generateExercise(user, created);
        // console.log("*** handleCreateExercise", { generating });
        router.push(`/exercises/${created.id}`);
        return true
      }
    }

    return false;
  }

  return (
    <Link
      className={user ? "" : "cursor-not-allowed"}
      onClick={() => user && handleCreateExercise()}
    >
      Create New Exercise
    </Link>
  )
}
