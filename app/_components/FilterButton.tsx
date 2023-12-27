import { BsFilterCircle, BsFilterCircleFill } from "react-icons/bs"
import Link from "./Link"

export default function FilterButton({ onClick, href, userId, isFiltered }: any) {
  return (
    <div className="z-10">
      {isFiltered &&
        <Link
          onClick={onClick}
          href={href}
          className="fixed bottom-3 right-3 h-fit"
          title={`Show all`}
        >
          <BsFilterCircleFill className="text-3xl rounded-full shadow-md" />
        </Link>
      }
      {!isFiltered &&
        <Link
          onClick={onClick}
          href={`${href}?uid=${userId}`}
          className="fixed bottom-3 right-3 h-fit"
          title={`Show created by me`}>
          <BsFilterCircle className="text-3xl rounded-full opacity-30 hover:opacity-100 hover:shadow-md hover:backdrop-blur-sm" />
        </Link>
      }
    </div>
  )
}
