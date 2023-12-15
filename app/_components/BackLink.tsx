'use client'

import { useRouter } from 'next/navigation'
import Link from "./Link"

export default function BackLink({}: any) {
  const router = useRouter();
  return (
    <Link onClick={() => router.back()}>Back</Link>
  )
}
