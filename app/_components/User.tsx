'use client'

import { useEffect } from 'react';
import useUser from '@/app/_hooks/user';

export default function User() {
  console.log(`>> components.User.render()`);
  const [userLoaded, loadUser] = useUser((state: any) => [state.loaded, state.load]);

  useEffect(() => {
    if (!userLoaded) loadUser();
  }, []);  

  return null;
}
