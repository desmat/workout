"use client";
import React, { useEffect, useState } from "react";

export const useMounted = () => {
  const [mounted, setMounted] = useState<boolean>()
  // effects run only client-side
  // so we can detect when the component is hydrated/mounted
  // @see https://react.dev/reference/react/useEffect
  useEffect(() => {
      setMounted(true)
  }, [])
  return mounted
}

// @ts-ignore
export function NoSsr({ children }) {
  // console.log('>> components.NoSsr');

  const mounted = useMounted();
  if (!mounted) return null;
  return <>{children}</>;
}
