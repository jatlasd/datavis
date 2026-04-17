import { SystemDetail } from "@/components/systems/system-detail";

export default async function SystemPage({ params }) {
  const { id } = await params;
  return <SystemDetail systemId={id} />;
}
