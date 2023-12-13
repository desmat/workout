export default async function Loading() {
  console.log('>> app.feed.loading.render()');

  return (
    <main className="flex flex-col">
      <h1 className="text-center">Exercise</h1>
      <p className='italic text-center animate-pulse'>Loading...</p>
    </main>
  )
}
