'use client'

export default async function Loading({ title }: { title?: string }) {
  console.log('>> app.feed.loading.render()');

  return (
    <main className="flex flex-col">
      <h1 className="text-center animate-pulse">{title || "_______"}</h1>
      <p className='italic text-center animate-pulse'>Loading...</p>
    </main>
  )
}
