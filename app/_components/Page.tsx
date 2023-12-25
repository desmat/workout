
export default function Page({
  children,
  title,
  subtitle,
  links,
  topLinks,
  bottomLinks,
  className,
  loading,
}: {
  children?: React.ReactNode,
  title?: React.ReactNode,
  subtitle?: React.ReactNode,
  links?: React.ReactNode[],
  topLinks?: React.ReactNode[],
  bottomLinks?: React.ReactNode[],
  className?: string,
  loading?: boolean,
}) {
  return (
    <main className={`relative flex flex-col items-left _lg: max-w-4xl _lg: mx-auto _px-4 min-h-[calc(100vh-2.5rem)] lg:min-h-[calc(100vh+0rem)]${className ? " " + className : ""}`}>
      {loading &&
        <div className='absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 italic text-dark-2 opacity-5 animate-pulse'>Loading...</div>
      }
      {/* {!loading &&
        <> */}
          {title &&
            <h1 className="flex justify-center text-center capitalize">{title}</h1>
          }
          {subtitle &&
            <p className='italic text-center mb-2'>{subtitle}</p>
          }
          {(topLinks || links) &&
            <div className={`mt-2 mb-4`}>
              <PageLinks loading={loading}>
                {topLinks || links}
              </PageLinks>
            </div>
          }
          {/* {loading &&
        <p className='italic text-center opacity-20 animate-pulse'>Loading...</p>
      } */}
          {!loading &&
            <>
              {children}
            </>
          }
          {(bottomLinks || links) &&
            <div className={`flex flex-grow items-end justify-center h-full mt-2`}>
              <PageLinks loading={loading}>
                {bottomLinks || links}
              </PageLinks>
            </div>
        //   }
        // </>
      }
    </main>
  )
}

export function PageLinks({
  children,
  loading,
}: {
  children: React.ReactNode,
  loading?: boolean,
}) {
  return (
    <div className="_bg-yellow-100 relative flex flex-row gap-3 items-center justify-center font-semibold">
      {/* {loading &&
        <div className="_bg-pink-100 absolute left-0 top-0 w-full h-full z-10 cursor-not-allowed opacity-50" />
      } */}
      {children}
    </div>
  )
}
