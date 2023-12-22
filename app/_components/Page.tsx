
export default function Page({
  children,
  title,
  subtitle,
  links,
  topLinks,
  bottomLinks,
  className,
}: {
  children?: React.ReactNode,
  title?: React.ReactNode,
  subtitle?: React.ReactNode,
  links?: React.ReactNode[],
  topLinks?: React.ReactNode[],
  bottomLinks?: React.ReactNode[],
  className?: string
}) {
  return (
    <main className={`flex flex-col items-left lg:max-w-4xl lg:mx-auto _px-4 min-h-[calc(100vh-2.5rem)] lg:min-h-[calc(100vh+0rem)]${className ? " " + className : ""}`}>
      {title &&
        <h1 className="text-center capitalize">{title}</h1>
      }
      {subtitle &&
        <p className='italic text-center mb-2'>{subtitle}</p>
      }
      {(topLinks || links) &&
        <div className="mt-2 mb-4">
          <PageLinks>
            {topLinks || links}
          </PageLinks>
        </div>
      }
      {children}
      {(bottomLinks || links) &&
        <div className="flex flex-grow items-end justify-center h-full mt-2">
          <PageLinks>
            {bottomLinks || links}
          </PageLinks>
        </div>
      }
    </main>
  )
}

export function PageLinks({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="_bg-yellow-200 flex flex-row gap-3 items-center justify-center font-semibold">
      {children}
    </div>
  )
}
