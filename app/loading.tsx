import BackLink from "@/app/_components/BackLink";
import Page from "@/app/_components/Page";
// import { title, subtitle } from "./page";

export default async function Loading() {
  return (
    <Page
      // links={[<BackLink key="0" />]}
      // title={title}
      // subtitle={subtitle}
      loading={true}
    />
  )
}
