import { DomainDetail } from "@/components/domains/domain-detail";

export default async function DomainPage({ params }) {
  const { id } = await params;
  return <DomainDetail domainId={id} />;
}
