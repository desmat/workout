'use client'

import { useEffect } from 'react';
import useWorkouts from '@/app/_hooks/workouts';

export default function Prefetch({
}: {
}) {
  const [workoutsLoaded, loadWorkouts] = useWorkouts((state: any) => [state.loaded(), state.load]);
  // console.log('>> app._components.Prefetch.render()', { message, _message });

  useEffect(() => {
    if (!workoutsLoaded) {
      loadWorkouts(); // TODO later we should narrow this to juse the logged in user's workouts
    }
  }, []);

  return null;
}
