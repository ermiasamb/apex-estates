import { BrokerDetail } from "@/components/brokers/BrokerDetail";

export default function BrokerProfilePage({ params }: { params: { id: string } }) {
  return <BrokerDetail id={params.id} />;
}
