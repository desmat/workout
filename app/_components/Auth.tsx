'use client'

import { init } from "../../services/auth";
// note: https://stackoverflow.com/questions/75438048/cant-resolve-encoding-module-error-while-using-nextjs-13-supabase

export default function Auth() {
  console.log(`>> components.Auth.render()`);

  init();

  return null;
}
