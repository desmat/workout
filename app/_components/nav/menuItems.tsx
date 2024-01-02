import { User } from "firebase/auth";
import { BsFillPlusCircleFill } from "react-icons/bs"
import { FaRunning } from 'react-icons/fa';
import { FaWandMagicSparkles } from "react-icons/fa6";
import { LuDumbbell } from "react-icons/lu";
import { handleCreateWorkout, handleGenerateWorkout } from "@/app/_utils/handlers";

function isActive(pathname: string, href: string): boolean {
  return (href && (href == "/" && pathname == "/") || (href && href != "/" && pathname.startsWith(href))) as boolean;
}

export function menuItems({ pathname, user, router, createWorkout, generateWorkout, info, success }: { pathname?: string, user?: User | undefined, router?: any | undefined, createWorkout?: any | undefined, generateWorkout?: any | undefined, info?: any, success?: any }) {
  return [
    {
      name: "Exercises",
      href: `/exercises`,
      icon: <LuDumbbell className="my-auto text-right" />
    },
    {
      name: "Workouts",
      href: `/workouts?uid=${user?.uid || ""}`,
      icon: <FaRunning className="my-auto" />
    },
    {
      name: "Create",
      icon: <BsFillPlusCircleFill className="my-auto" />,
      title: user ? "Create a new workout" : "Login to create workouts",
      className: user ? "" : "cursor-not-allowed",
      onClick: async () => {
        if (user) {
          handleCreateWorkout(createWorkout, router, user);
          router.push(`/workouts?uid=${user.uid || ""}`);
        }
      }
    },
    {
      name: "Generate",
      icon: <FaWandMagicSparkles className="my-auto" />,
      title: user ? "Generate a new workout" : "Login to generate workouts",
      className: user ? "" : "cursor-not-allowed",
      onClick: () => {
        if (user) {
          handleGenerateWorkout(generateWorkout, router, user, info, success);
          router.push(`/workouts?uid=${user.uid || ""}`);
        }
      }
    },
  ].map((menuItem: any) => {
    menuItem.isActive = pathname && isActive(pathname, menuItem.href);
    return menuItem;
  });
}
