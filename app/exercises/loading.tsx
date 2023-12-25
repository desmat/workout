import Page from "@/app/_components/Page";
import { title, subtitle } from "./page";

export default async function Loading() {
  return (
    <Page
      title={title}
      subtitle={subtitle}
      loading={true}
    />
  )
}
