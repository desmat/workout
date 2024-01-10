'use client'

import { User } from 'firebase/auth';
import { useRouter } from 'next/navigation'
import { useEffect, useState } from "react";
import BackLink from '@/app/_components/BackLink';
import Link from "@/app/_components/Link"
import Page from "@/app/_components/Page";
import { formatDirections } from '@/app/_components/Exercise';
import useExercises from "@/app/_hooks/exercises";
import useUser from "@/app/_hooks/user";
import { Exercise } from "@/types/Exercise";
import { capitalize, formatNumber, formatRange, formatTime } from '@/utils/format';

function ExerciseVariation({ name, description, instructions, level, directions }: any) {
  const formattedDirections = directions && formatDirections(directions);
  // console.log('>> app.exercises[id].page.ExerciseVariation', { name, directions });

  return (
    <div className="flex flex-col gap-0">
      {/* <Link style="parent" onClick={() => !showDetails && setshowDetail(!showDetail)}> */}
      <div className="">
        <span className="capitalize _text-dark-1 font-semibold">{name}{level ? ` (${level})` : ""}</span>
        {description &&
          <>
            : <span className="_opacity-60 _italic">{description}</span>
          </>
        }
      </div>
      {/* {description &&
        <div className="_opacity-60 _italic">
          {description}
        </div>
      } */}
      {instructions && instructions.length > 0 &&
        // <div className="_opacity-60 _italic">
        //   {instructions}
        // </div>
        <ul className="list-disc ml-6 mt-1">
          {instructions && instructions.map((step: string, i: number) => <li key={i}>{step}</li>)
          }
          {formattedDirections &&
            <li key="directions">Directions: {formattedDirections}</li>
          }
        </ul>

      }
      {/* </link> */}
    </div>
  );
}

function ExerciseDetails({ id, instructions, category, directions, variations }: any) {
  // console.log('>> app.exercises[id].page.Exercise', { id });
  const formattedDuration = directions?.duration && formatRange(directions.duration, formatTime);
  const formattedSets = directions?.sets && formatRange(directions.sets, formatNumber, "set");
  const formattedReps = directions?.reps && formatRange(directions.reps, formatNumber, "rep");
  // console.log('>> app.exercises[id].page.Exercise', { formattedDuration, formattedSets, formattedReps });

  return (
    <div className="text-left pb-4 flex flex-col gap-4">
      {instructions && instructions.length > 0 &&
        <div className="flex flex-col _gap-2">
          <h2>Instructions</h2>
          <ul className="list-disc ml-6">
            {instructions && instructions
              .map((step: string, i: number) => <li key={i}>{step}</li>)
            }
          </ul>
        </div>
      }
      {(formattedDuration || formattedSets || formattedReps) &&
        <div className="flex flex-col _gap-2">
          <h2>Directions</h2>
          <ul className="list-disc ml-6">
            {formattedDuration &&
              <li key="0">{formattedDuration}</li>
            }
            {formattedSets &&
              <li key="1">{formattedSets}</li>
            }
            {formattedReps &&
              <li key="2">{formattedReps}</li>
            }
          </ul>
        </div>
      }
      {variations && variations.length > 0 &&
        <div className="flex flex-col _gap-2">
          {/* <div className="text-dark-1 font-bold">Variations</div> */}
          <h2>Variations</h2>
          <div className="flex flex-col gap-3">
            {
              variations
                // .sort((a: Post, b: Post) => b.postedAt.valueOf() - a.postedAt.valueOf())
                .map((item: any, offset: number) => (
                  <div key={offset}>
                    <ExerciseVariation {...{ ...item, offset }} />
                  </div>
                )
                )
            }
          </div>
        </div>
      }
    </div>
  );
}

export default function Component({ params }: { params: { id: string } }) {
  // console.log('>> app.trivia[id].page.render()', { id: params.id });
  const router = useRouter();
  const [
    exercise,
    loaded,
    load,
    del, // delete is a js keyword 😒
    generate,
  ] = useExercises((state: any) => [
    state.get(params.id),
    state.loaded(params.id),
    state.load,
    state.delete,
    state.generate,
  ]);
  const user = useUser((state: any) => state.user);
  const isReady = exercise?.status == "created";
  // console.log('>> app.exercises[id].page.render()', { id: params.id, exercise, loaded }); //, loadedId: loaded && loaded.includes(params.id) });

  useEffect(() => {
    load(params.id);
  }, [params.id]);

  async function handleDelete() {
    const response = confirm("Delete exercise?");
    if (response) {
      del(params.id);
      router.back();
    }
  }

  const handleRegenerate = () => {
    // console.log('>> app.trivia[id].page.regenerate()', { exercise, user });
    generate(user, exercise).then((res: any) => {
      // console.log('>> app.trivia[id].page.regenerate() after generate', { res });
    });
  }

  const links = [
    <BackLink key="back" />,
    exercise && isReady && user && (user.uid == exercise.createdBy || user.admin) && <Link key="delete" style="warning" onClick={handleDelete}>Delete</Link>,
    exercise && isReady && user && (user.uid == exercise.createdBy || user.admin) && <Link key="regenerate" onClick={handleRegenerate}>Regenerate</Link>,
  ];

  if (!loaded) {
    return (
      <Page
        bottomLinks={links}
        loading={true}
      />
    )
  }

  if (!exercise) {
    return (
      <Page
        title="Exercise not found"
        subtitle={params.id}
        links={links}
      />
    )
  }

  if (!isReady) {
    return (
      <Page
        title={exercise.name || "(Unnamed Exercise)"}
        subtitle={`(${capitalize(exercise.status)}...)`}
        links={links}
        loading={true}
      />
    )
  }

  return (
    <Page
      title={`${exercise.name}${exercise.category ? ` (${exercise.category})` : ""}`}
      subtitle={["creating", "generating"].includes(exercise?.status)
        ? `(${capitalize(exercise.status)})`
        : exercise.description}
      links={links}
      loading={["creating", "generating"].includes(exercise?.status)}
    >
      {exercise &&
        <ExerciseDetails {...exercise} />
      }
    </Page>
  )
}
