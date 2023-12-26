import BackLink from "@/app/_components/BackLink";
import Page from "@/app/_components/Page";

export default async function Loading() {
  return (
    <Page
      bottomLinks={[<BackLink key="0" />]}
      loading={true}
    />
  )
}
