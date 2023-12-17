
export function Page({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <main className="flex flex-col items-left lg:max-w-4xl lg:mx-auto _px-4 min-h-[calc(100vh-2.5rem)] lg:min-h-[calc(100vh+0rem)]">
      {children}
    </main>
  )
}

export function PageLinks({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="_bg-yellow-200 flex flex-row gap-3 items-center justify-center">
      {children}
    </div>
  )
}
