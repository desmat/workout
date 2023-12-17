'use client'

import { useRouter } from 'next/navigation'
import { useEffect, useState } from "react";
import BackLink from '@/app/_components/BackLink';
import Link from "@/app/_components/Link"
import { Page, PageLinks } from "@/app/_components/Page";
import useExercises from "@/app/_hooks/exercises";
import useUser from "@/app/_hooks/user";
import Loading from "./loading";

function stripIngredientQuantity(ingredient: string) {
  const regex = /^(?:\w+\s+of\s+)?(?:\d+\s*\w+\s+of\s+)?(?:\d+\s*\w+\s+)?(?:\d+\s+)?(.+)$/i;
  const match = ingredient.match(regex);
  if (match && match.length > 1) {
    return match[1];
  }

  return ingredient;
}

function ExerciseItem({ name, description, ingredients, preparation, showDetails }: any) {
  const [showDetail, setshowDetail] = useState(false);
  const maxShortIngredients = 5;
  const shortIngredients = ingredients?.length > 0 ?
    ingredients.length > maxShortIngredients
      ? ingredients.map(stripIngredientQuantity).slice(0, maxShortIngredients).join(", ")
      : ingredients.map(stripIngredientQuantity).join(", ")
    : "";

  // console.log('>> app.exercises[id].page.render()', { name, shortIngredients, ingredients });

  useEffect(() => {
    if (showDetails) {
      setshowDetail(false);
    }
  }, [showDetails]);

  return (
    <p className="text-left flex flex-col gap-2 pb-6" >
      <Link style="parent" onClick={() => !showDetails && setshowDetail(!showDetail)}>
        <div className="">
          <span className="capitalize font-semibold">{name}</span>: {description}
          {!showDetails &&
            <>
              <Link style="child light" className="ml-2">{showDetail ? "Hide details" : "Show details"}</Link>
            </>
          }
        </div>
        {!showDetail && !showDetails &&
          <div className="capitalize italic text-dark-3 -mt-1">{shortIngredients}</div>
        }
        {/* {ingredients.length > maxShortIngredients &&
        <span className="italic">
          {` (and ${ingredients.length - maxShortIngredients} more)`}
        </span>
      } */}
        {(showDetails || showDetail) &&
          <div>
            <div className="font-semibold">Ingredients:</div>
            <ul className="ml-4">
              {
                ingredients.map((ingredient: string, offset: number) => <li key={offset} className="capitalize">{ingredient}</li>)
              }
            </ul>
          </div>
        }
        {(showDetails || showDetail) &&
          <div className="mb-2">
            <div className="font-semibold">Preparation:</div>
            <div>{preparation}</div>
          </div>
        }
      </Link>
    </p>
  );
}

function Exercise({ id, prompt, items, showDetails }: any) {
  return (
    <p className="text-left pb-4">
      {items && items.length > 0 &&
        <div>
          {
            items
              // .sort((a: Post, b: Post) => b.postedAt.valueOf() - a.postedAt.valueOf())
              .map((item: any, offset: number) => <div className="ml-2 flex" key={offset}><ExerciseItem {...{ ...item, offset, showDetails }} /></div>)
          }
        </div>
      }
    </p>
  );
}

async function handleDeleteExercise(id: string, deleteFn: any, router: any) {
  const response = confirm("Delete exercise?");
  if (response) {
    deleteFn(id);
    router.back();
  }
}

export default function Component({ params }: { params: { id: string } }) {
  // console.log('>> app.trivia[id].page.render()', { id: params.id });
  const router = useRouter();
  const [showDetails, setshowDetails] = useState(false);
  const [exercises, loaded, load, deleteExercise] = useExercises((state: any) => [state.exercises, state.loaded, state.load, state.deleteExercise]);
  const [user] = useUser((state: any) => [state.user]);
  const exercise = exercises.filter((exercise: any) => exercise.id == params.id)[0];

  console.log('>> app.exercises[id].page.render()', { id: params.id, exercise });

  useEffect(() => {
    load(params.id);
  }, [params.id]);

  if (!loaded) {
    return <Loading />
  }

  const links = (
    <PageLinks>
      <BackLink />
      {/* {exercise && <Link onClick={() => setshowDetails(!showDetails)}>{showDetails ? "Hide details" : "Show details"}</Link>} */}
      {/* {game && <Link onClick={() => handlePlayGame(params.id, startGame, router)}>Play</Link>} */}
      {exercise && user && (user.uid == exercise.createdBy || user.admin) && <Link style="warning" onClick={() => handleDeleteExercise(params.id, deleteExercise, router)}>Delete</Link>}
    </PageLinks>
  );

  if (!exercise) {
    return (
      <main className="flex flex-col">
        <h1 className="text-center">Exercise {params.id} not found</h1>
        {links}
      </main>
    )
  }

  return (
    <Page>
      <h1 className="text-center capitalize">{exercise.name}</h1>
      <p className='italic text-center'>
        (summary here)
      </p>
      <div className="mt-4 mb-6">
        {links}
      </div>
      {exercise && exercise.items && (exercise.items.length as number) > 0 &&
        <div className="self-center">
          <Exercise {...{ ...exercise, showDetails }} />
        </div>
      }
      <div className="flex flex-grow items-end justify-center h-full mt-2">
        {links}
      </div>
    </Page>
  )
}
