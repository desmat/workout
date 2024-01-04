import { User } from 'firebase/auth';
import { ExerciseEntry } from '@/app/_components/Exercise';
import Link from "@/app/_components/Link"
import Page from "@/app/_components/Page";
import { byName } from '@/utils/sort';
import { getUserFromToken } from '@/services/users';
import { cookies } from 'next/headers';
import { getExercises } from '@/services/exercise';
import { Suspense } from 'react';
import { CreateLink } from './clientComponents';

export default async function Component({
  params,
  searchParams,
}: {
  params: { slug: string };
  searchParams?: { [key: string]: string | string[] | undefined };
}) {
  const token = cookies().get("session")?.value;
  const user = token && (await getUserFromToken(token))?.user;
  const uidFilter = searchParams?.uid;
  const exercises = uidFilter && getExercises({ createdBy: uidFilter }) || getExercises();

  console.log('>> app.exercises.page.render()', { searchParams, exercises });

  const title = uidFilter ? "My Exercises" : "Exercises"

  const subtitle = "Let ChatGPT create exercises for you!";

  const links = [
    <div key="0" title={user ? "" : "Login to create new exercise"}>
      <CreateLink />
    </div>,
    uidFilter && <Link useClient={true} key="1" href={`/exercises`}>Show All</Link>,
    !uidFilter && <Link useClient={true} key="2" href={`/exercises?uid=${user?.uid || ""}`}>Filter</Link>,
  ]

  const LoadedComponent = async () => {
    const filteredExercises = await exercises;

    return (
      <Page
        title={title}
        subtitle={subtitle}
        links={links}
      >
        {filteredExercises && filteredExercises.length > 0 &&
          <div className="self-center flex flex-col gap-3">
            {
              filteredExercises
                // .filter(...)
                .sort(byName)
                .map((exercise: any) => {
                  return (
                    <span key={exercise.id}>
                      <ExerciseEntry exercise={exercise} user={user} />
                    </span>)
                })
            }
          </div>
        }
        {(!filteredExercises || filteredExercises.length == 0) &&
          <>
            {uidFilter &&
              <p className='italic text-center'>
                <span className="opacity-50">No exercises created yet</span> <span className="not-italic opacity-100">😞</span>
                <br />
                <span className="opacity-50">You can create one, or show all with the links above.</span>
              </p>
            }
            {!uidFilter &&
              <p className='italic text-center opacity-50'>No exercises yet :(</p>
            }
          </>
        }
      </Page>
    )
  }

  return (
    <Suspense
      fallback=<Page
        title={title}
        subtitle={subtitle}
        links={links}
        loading={true}
      />
    >
      <LoadedComponent />
    </Suspense>
  )
}
