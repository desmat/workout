export default async function Post() {
  console.log(`>> components.loading.Post.render()`);
  return (
    <div className="flex flex-col items-center p-2 space-y-1 border border-solid border-neutral-200 bg-slate-100 drop-shadow-md">
      <p className="h-6 text-clip w-full bg-gray-200 animate-pulse">&nbsp;</p>
      <p className="h-6 text-clip w-full bg-gray-200 animate-pulse">&nbsp;</p>
      <p className="h-6 text-clip w-full bg-gray-200 animate-pulse">&nbsp;</p>
      <p className="h-4 text-clip w-1/2 flex text-center text-sm bg-gray-200 animate-pulse">&nbsp;</p>
    </div>
  )
}
