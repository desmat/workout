import { Suspense } from "react";
import Page from "@/app/_components/Page";
import { formatDirections } from '@/app/_components/Exercise';
// import { Exercise } from "@/types/Exercise";
import { formatNumber, formatRange, formatTime } from '@/utils/format';
import { getExercise } from '@/services/exercise';
import { cookies } from 'next/headers';
import { getUserFromToken } from '@/services/users';
import BackLink from '@/app/_components/BackLink';
import { DeleteLink, RegenerateLink } from './clientComponents';

function ExerciseVariation({ name, description, instructions, level, directions }: any) {
  const formattedDirections = directions && formatDirections(directions);

  // console.log('>> app.exercises[id].page.ExerciseVariation', { name, directions });

  return (
    <div className="flex flex-col gap-0">
      <div className="">
        <span className="capitalize _text-dark-1 font-semibold">{name}{level ? ` (${level})` : ""}</span>
        {description &&
          <>
            : <span className="_opacity-60 _italic">{description}</span>
          </>
        }
      </div>
      {instructions && instructions.length > 0 &&
        <ul className="list-disc ml-6 mt-1">
          {instructions && instructions.map((step: string, i: number) => <li key={i}>{step}</li>)
          }
          {formattedDirections &&
            <li key="directions">Directions: {formattedDirections}</li>
          }
        </ul>

      }
    </div>
  );
}

function Exercise({ id, instructions, category, directions, variations }: any) {
  console.log('>> app.exercises[id].page.Exercise', { id });
  const formattedDuration = directions?.duration && formatRange(directions.duration, formatTime);
  const formattedSets = directions?.sets && formatRange(directions.sets, formatNumber, "set");
  const formattedReps = directions?.reps && formatRange(directions.reps, formatNumber, "rep");
  console.log('>> app.exercises[id].page.Exercise', { formattedDuration, formattedSets, formattedReps });

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
          <h2>Variations</h2>
          <div className="flex flex-col gap-3">
            {
              variations
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


export default async function Component({ params }: { params: { id: string } }) {
  const token = cookies().get("session")?.value;
  const user = token && (await getUserFromToken(token))?.user;
  const exercisePromise = getExercise(params.id);

  console.log('>> app.exercises[id].page.render()', { id: params.id }); //, loadedId: loaded && loaded.includes(params.id) });

  const links = [
    <BackLink key="0" />,
    <span key="1"><DeleteLink user={user} exercise={exercisePromise} /></span>,
    <span key="2"><RegenerateLink user={user} exercise={exercisePromise} /></span>,
  ];

  const LoadedComponent = async () => {
    const exercise = await exercisePromise;

    if (!exercise) {
      return (
        <Page
          title="Exercise not found"
          subtitle={params.id}
          links={[<BackLink key="0" />]}
        />
      )
    }

    return (
      <Page
        title={`${exercise.name}${exercise.category ? ` (${exercise.category})` : ""}`}
        subtitle={exercise.description && exercise.status != "generating" && exercise.description}
        links={links}
      >
        {exercise &&
          <Exercise { ...exercise } />
        }
      </Page>
    )
  }

  return (
    <Suspense
      fallback=
      <Page
        // title="Exercise"
        bottomLinks={[<BackLink key="0" />]}
        loading={true}
      />
    >
      <LoadedComponent />
    </Suspense>
  )
}
