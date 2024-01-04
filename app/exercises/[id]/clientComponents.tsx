'use client'

import Link from "@/app/_components/Link";
import useExercises from "@/app/_hooks/exercises";
import { Exercise } from "@/types/Exercise";
import { useRouter } from "next/navigation";

export async function _DeleteLink({
  user,
  exercise,
  router,
  deleteExercise
}: {
  user: any,
  exercise: Promise<Exercise | undefined>,
  router: any,
  deleteExercise: any
}) {
  const awaitedExercise = await exercise;

  const handleDeleteExercise = async () => {
    const response = confirm("Delete exercise?");
    if (response && awaitedExercise?.id) {
      deleteExercise(awaitedExercise.id);
      router.back();
    }
  }

  return (
    <>
      {awaitedExercise && user && (user.uid == awaitedExercise.createdBy || user.admin) &&
        <Link key="2" style="warning" onClick={handleDeleteExercise}>Delete</Link>
      }
    </>
  )
}

export function DeleteLink({
  user,
  exercise
}: {
  user: any,
  exercise: Promise<Exercise | undefined>,
}) {
  const router = useRouter();
  const [deleteExercise] = useExercises((state: any) => [state.deleteExercise]);

  return <_DeleteLink user={user} exercise={exercise} router={router} deleteExercise={deleteExercise} />
}

export async function _RegenerateLink({
  user,
  exercise,
  generateExercise
}: {
  user: any,
  exercise: Promise<Exercise | undefined>,
  generateExercise: any
}) {
  const awaitedExercise = await exercise;

  const handleRegenerate = async () => {
    console.log('>> app.trivia[id].page.regenerate()', { awaitedExercise, user });
    generateExercise(user, awaitedExercise).then((res: any) => {
      console.log('>> app.trivia[id].page.regenerate() after generate', { res });
    });
  }

  return (
    <>
      {awaitedExercise && user && (user.uid == awaitedExercise.createdBy || user.admin) &&
        <Link key="2" style="warning" onClick={() => handleRegenerate()}>Regenerate</Link>
      }
    </>
  )
}

export function RegenerateLink({
  user,
  exercise
}: {
  user: any,
  exercise: Promise<Exercise | undefined>
}) {
  const [generateExercise] = useExercises((state: any) => [state.generateExercise]);

  return <_RegenerateLink user={user} exercise={exercise} generateExercise={generateExercise} />
}
